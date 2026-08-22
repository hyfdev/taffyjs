use std::collections::{HashMap, hash_map::Entry};
use std::marker::PhantomData;
use std::ptr;
use std::rc::Rc;

use napi::bindgen_prelude::{Function, FunctionRef, ToNapiValue, Unknown};
use napi::{Env, JsValue, sys};
use napi_derive::napi;
use taffy::geometry::Size;
use taffy::style::{AvailableSpace, Style};
use taffy::{NodeId, TaffyTree};

use crate::error::{BindingError, BindingResult, internal_error};
use crate::{js_object, number, style};

// Keep these values identical to packages/taffyjs-node/src/tree.ts.
// Layout sizes are non-negative, so NaN / -1 / -2 cannot collide with a definite size.
const AVAILABLE_MIN_CONTENT: f64 = -1.0;
const AVAILABLE_MAX_CONTENT: f64 = -2.0;

#[napi(object, object_from_js = false)]
pub struct MeasureArguments<'env> {
    pub known_width: f64,
    pub known_height: f64,
    pub available_width: f64,
    pub available_height: f64,
    pub node: f64,
    pub get_style: Function<'env, (), style::StyleOutput>,
}

#[napi(object, object_to_js = false)]
pub struct MeasureResultInput {
    pub width: f64,
    pub height: f64,
}

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
enum AvailableSpaceCacheKey {
    Definite(u32),
    MinContent,
    MaxContent,
}

impl From<AvailableSpace> for AvailableSpaceCacheKey {
    fn from(value: AvailableSpace) -> Self {
        match value {
            AvailableSpace::Definite(value) => Self::Definite(value.to_bits()),
            AvailableSpace::MinContent => Self::MinContent,
            AvailableSpace::MaxContent => Self::MaxContent,
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
struct MeasureCacheKey {
    node: u64,
    known_width: Option<u32>,
    known_height: Option<u32>,
    available_width: AvailableSpaceCacheKey,
    available_height: AvailableSpaceCacheKey,
}

impl MeasureCacheKey {
    fn new(
        node: NodeId,
        known_dimensions: Size<Option<f32>>,
        available_space: Size<AvailableSpace>,
    ) -> Self {
        Self {
            node: u64::from(node),
            known_width: known_dimensions.width.map(f32::to_bits),
            known_height: known_dimensions.height.map(f32::to_bits),
            available_width: available_space.width.into(),
            available_height: available_space.height.into(),
        }
    }
}

pub(crate) enum MeasureFailure<'env> {
    Callback(Unknown<'env>),
    Binding(BindingError),
}

pub(crate) struct MeasureSession<'env> {
    env: Env,
    callback: Function<'env, MeasureArguments<'env>, Unknown<'env>>,
    cache: HashMap<MeasureCacheKey, Size<f32>>,
    style_providers: HashMap<u64, FunctionRef<(), style::StyleOutput>>,
    failure: Option<MeasureFailure<'env>>,
    not_send: PhantomData<Rc<()>>,
}

impl<'env> MeasureSession<'env> {
    pub(crate) fn new(
        env: Env,
        callback: Function<'env, MeasureArguments<'env>, Unknown<'env>>,
    ) -> Self {
        Self {
            env,
            callback,
            cache: HashMap::new(),
            style_providers: HashMap::new(),
            failure: None,
            not_send: PhantomData,
        }
    }

    pub(crate) fn invoke(
        &mut self,
        known_dimensions: Size<Option<f32>>,
        available_space: Size<AvailableSpace>,
        node: NodeId,
        style: &Style,
    ) -> Size<f32> {
        if self.failure.is_some() {
            return Size::ZERO;
        }

        let cache_key = MeasureCacheKey::new(node, known_dimensions, available_space);
        if let Some(size) = self.cache.get(&cache_key) {
            return *size;
        }

        let result = arguments(
            &self.env,
            &mut self.style_providers,
            known_dimensions,
            available_space,
            node,
            style,
        )
        .map_err(MeasureFailure::Binding)
        .and_then(|arguments| call(&self.callback, arguments))
        .and_then(|value| result_size(value).map_err(MeasureFailure::Binding));
        match result {
            Ok(size) => {
                self.cache.insert(cache_key, size);
                size
            }
            Err(failure) => {
                self.failure = Some(failure);
                Size::ZERO
            }
        }
    }

    pub(crate) fn take_failure(&mut self) -> Option<MeasureFailure<'env>> {
        self.failure.take()
    }

    pub(crate) fn has_failed(&self) -> bool {
        self.failure.is_some()
    }
}

fn arguments<'env>(
    env: &'env Env,
    style_providers: &mut HashMap<u64, FunctionRef<(), style::StyleOutput>>,
    known_dimensions: Size<Option<f32>>,
    available_space: Size<AvailableSpace>,
    node: NodeId,
    style: &Style,
) -> BindingResult<MeasureArguments<'env>> {
    Ok(MeasureArguments {
        known_width: encode_known_dimension(known_dimensions.width),
        known_height: encode_known_dimension(known_dimensions.height),
        available_width: encode_available_space(available_space.width),
        available_height: encode_available_space(available_space.height),
        node: encode_node(node),
        get_style: style_provider(env, style_providers, node, style)?,
    })
}

fn style_provider<'env>(
    env: &'env Env,
    style_providers: &mut HashMap<u64, FunctionRef<(), style::StyleOutput>>,
    node: NodeId,
    style: &Style,
) -> BindingResult<Function<'env, (), style::StyleOutput>> {
    let node = u64::from(node);
    if let Entry::Vacant(entry) = style_providers.entry(node) {
        // Taffy only lends Style for this measure call, but JavaScript may retain getStyle.
        // Give one provider per node and compute an owned snapshot with an ordinary JS lifetime.
        let snapshot = style.clone();
        let provider = env
            .create_function_from_closure("getStyle", move |_| Ok(style::output(&snapshot)))
            .and_then(|function| function.create_ref())
            .map_err(|_| internal_error())?;
        entry.insert(provider);
    }
    style_providers
        .get(&node)
        .ok_or_else(internal_error)?
        .borrow_back(env)
        .map_err(|_| internal_error())
}

fn call<'env>(
    callback: &Function<'env, MeasureArguments<'env>, Unknown<'env>>,
    arguments: MeasureArguments<'_>,
) -> Result<Unknown<'env>, MeasureFailure<'env>> {
    let env = callback.value().env;
    let mut receiver = ptr::null_mut();
    let receiver_status = unsafe { sys::napi_get_undefined(env, &mut receiver) };
    if receiver_status != sys::Status::napi_ok {
        return Err(MeasureFailure::Binding(internal_error()));
    }

    let argument = unsafe { MeasureArguments::to_napi_value(env, arguments) }
        .map_err(|_| MeasureFailure::Binding(internal_error()))?;
    let args = [argument];
    let mut returned = ptr::null_mut();
    let status = unsafe {
        sys::napi_call_function(
            env,
            receiver,
            callback.raw(),
            args.len(),
            args.as_ptr(),
            &mut returned,
        )
    };
    match status {
        sys::Status::napi_ok => Ok(unsafe { Unknown::from_raw_unchecked(env, returned) }),
        sys::Status::napi_pending_exception => {
            let mut thrown = ptr::null_mut();
            let clear_status = unsafe { sys::napi_get_and_clear_last_exception(env, &mut thrown) };
            if clear_status != sys::Status::napi_ok || thrown.is_null() {
                return Err(MeasureFailure::Binding(internal_error()));
            }
            let value = unsafe { Unknown::from_raw_unchecked(env, thrown) };
            Err(MeasureFailure::Callback(value))
        }
        _ => Err(MeasureFailure::Binding(internal_error())),
    }
}

fn encode_known_dimension(value: Option<f32>) -> f64 {
    match value {
        Some(value) => f64::from(value),
        None => f64::NAN,
    }
}

fn encode_available_space(value: AvailableSpace) -> f64 {
    match value {
        AvailableSpace::Definite(value) => f64::from(value),
        AvailableSpace::MinContent => AVAILABLE_MIN_CONTENT,
        AvailableSpace::MaxContent => AVAILABLE_MAX_CONTENT,
    }
}

fn encode_node(node: NodeId) -> f64 {
    u64::from(node) as f64
}

fn result_size(value: Unknown<'_>) -> BindingResult<Size<f32>> {
    let input: MeasureResultInput = js_object::input(value, "a measured Size object", None)?;
    Ok(Size {
        width: number::to_f32(input.width),
        height: number::to_f32(input.height),
    })
}

pub(crate) fn invalidate_subtree<NodeContext>(
    tree: &mut TaffyTree<NodeContext>,
    root: NodeId,
) -> BindingResult<()> {
    let mut pending = vec![root];
    while let Some(node) = pending.pop() {
        tree.mark_dirty(node).map_err(|_| internal_error())?;
        pending.extend(tree.children(node).map_err(|_| internal_error())?);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use std::marker::PhantomData;

    use taffy::geometry::Size;
    use taffy::style::{AvailableSpace, Style};
    use taffy::{NodeId, TaffyTree};

    use super::{
        AVAILABLE_MAX_CONTENT, AVAILABLE_MIN_CONTENT, AvailableSpaceCacheKey, MeasureCacheKey,
        MeasureSession, encode_available_space, encode_known_dimension, encode_node,
        invalidate_subtree,
    };

    fn cache_key(
        node: u64,
        known_width: Option<f32>,
        known_height: Option<f32>,
        available_width: AvailableSpace,
        available_height: AvailableSpace,
    ) -> MeasureCacheKey {
        MeasureCacheKey::new(
            NodeId::from(node),
            Size {
                width: known_width,
                height: known_height,
            },
            Size {
                width: available_width,
                height: available_height,
            },
        )
    }

    #[test]
    fn measure_cache_key_preserves_every_exact_input() {
        let first_nan = f32::from_bits(0x7fc0_0000);
        let second_nan = f32::from_bits(0x7fc0_0001);
        assert_eq!(
            cache_key(
                7,
                Some(-0.0),
                Some(first_nan),
                AvailableSpace::Definite(-0.0),
                AvailableSpace::Definite(second_nan),
            ),
            MeasureCacheKey {
                node: 7,
                known_width: Some((-0.0f32).to_bits()),
                known_height: Some(first_nan.to_bits()),
                available_width: AvailableSpaceCacheKey::Definite((-0.0f32).to_bits()),
                available_height: AvailableSpaceCacheKey::Definite(second_nan.to_bits()),
            }
        );
        assert_eq!(
            cache_key(
                8,
                None,
                None,
                AvailableSpace::MinContent,
                AvailableSpace::MaxContent,
            ),
            MeasureCacheKey {
                node: 8,
                known_width: None,
                known_height: None,
                available_width: AvailableSpaceCacheKey::MinContent,
                available_height: AvailableSpaceCacheKey::MaxContent,
            }
        );
    }

    #[test]
    fn compact_constraint_sentinels_use_nan_and_negative_keywords() {
        assert!(encode_known_dimension(None).is_nan());
        assert_eq!(encode_known_dimension(Some(12.5)), 12.5);
        assert_eq!(
            encode_known_dimension(Some(-0.0)).to_bits(),
            (-0.0f64).to_bits()
        );
        assert!(!encode_known_dimension(Some(f32::INFINITY)).is_nan());
        assert_eq!(
            encode_available_space(AvailableSpace::MinContent),
            AVAILABLE_MIN_CONTENT
        );
        assert_eq!(
            encode_available_space(AvailableSpace::MaxContent),
            AVAILABLE_MAX_CONTENT
        );
        assert_eq!(encode_available_space(AvailableSpace::Definite(0.0)), 0.0);
        assert_eq!(encode_available_space(AvailableSpace::Definite(12.5)), 12.5);
        assert_eq!(encode_node(NodeId::from(1u64 << 32)), (1u64 << 32) as f64);
    }

    #[test]
    fn measure_session_stays_on_the_javascript_thread() {
        struct Check<T: ?Sized>(PhantomData<T>);
        trait AmbiguousIfSend<Marker> {
            fn check() {}
        }
        impl<T: ?Sized> AmbiguousIfSend<()> for Check<T> {}
        impl<T: ?Sized + Send> AmbiguousIfSend<u8> for Check<T> {}

        let _ = <Check<MeasureSession<'static>> as AmbiguousIfSend<_>>::check;
    }

    #[test]
    fn invalidate_subtree_handles_deep_trees() {
        let mut tree: TaffyTree<()> = TaffyTree::new();
        let mut root = tree.new_leaf(Style::default()).unwrap();
        for _ in 0..16_384 {
            root = tree.new_with_children(Style::default(), &[root]).unwrap();
        }

        invalidate_subtree(&mut tree, root).unwrap();
    }
}
