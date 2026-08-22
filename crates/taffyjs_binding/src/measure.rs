use std::collections::{HashMap, hash_map::Entry};
use std::marker::PhantomData;
use std::ptr;
use std::rc::Rc;

use napi::bindgen_prelude::{Float64ArraySlice, Function, FunctionRef, Unknown};
use napi::{Env, JsValue, Status, sys};
use napi_derive::napi;
use taffy::geometry::Size;
use taffy::style::{AvailableSpace, Style};
use taffy::{NodeId, TaffyTree};

use crate::error::{BindingError, BindingResult, internal_error};
use crate::numeric::AvailableSpaceKindCode;
use crate::{js_object, number, style};

/// Slot order of the private measure-constraint record.
/// Keep identical to `packages/taffyjs-node/src/tree.ts`.
const CONSTRAINT_SLOTS: usize = 7;
const SLOT_KNOWN_WIDTH: usize = 0;
const SLOT_KNOWN_HEIGHT: usize = 1;
const SLOT_AVAILABLE_WIDTH: usize = 2;
const SLOT_AVAILABLE_HEIGHT: usize = 3;
const SLOT_TAGS: usize = 4;
const SLOT_NODE_LOW: usize = 5;
const SLOT_NODE_HIGH: usize = 6;

/// Presence and variant bits packed into `SLOT_TAGS`. The two-bit variant fields carry the public
/// `AvailableSpaceKind` codes.
const TAG_KNOWN_WIDTH_PRESENT: u32 = 1;
const TAG_KNOWN_HEIGHT_PRESENT: u32 = 1 << 1;
const TAG_AVAILABLE_WIDTH_SHIFT: u32 = 2;
const TAG_AVAILABLE_HEIGHT_SHIFT: u32 = 4;

fn constraint_slots_length_error() -> napi::Error {
    napi::Error::new(
        Status::InvalidArg,
        format!("Measure constraints must contain exactly {CONSTRAINT_SLOTS} values"),
    )
}

/// Carries one measure-constraint record to the caller's `Float64Array`, once per request, for the
/// whole compute.
///
/// Node-API promises that `napi_get_typedarray_info` yields a pointer into the array's own storage,
/// which a Wasm module cannot be given: its linear memory cannot address the JavaScript heap. The
/// native path holds that borrowed view across the JavaScript callbacks that run between requests,
/// which is sound only because the record never leaves the wrapper and so cannot be detached. The
/// Wasm path writes the elements instead.
pub(crate) struct ConstraintTarget<'a, 'env> {
    output: &'a mut Float64ArraySlice<'env>,
}

impl<'a, 'env> ConstraintTarget<'a, 'env> {
    pub(crate) fn new(output: &'a mut Float64ArraySlice<'env>) -> napi::Result<Self> {
        if output.len() != CONSTRAINT_SLOTS {
            return Err(constraint_slots_length_error());
        }
        Ok(Self { output })
    }

    #[cfg(not(target_arch = "wasm32"))]
    fn write(&mut self, _env: &Env, slots: [f64; CONSTRAINT_SLOTS]) -> BindingResult<()> {
        let target: &mut [f64; CONSTRAINT_SLOTS] = unsafe { self.output.as_mut() }
            .try_into()
            .map_err(|_| internal_error())?;
        *target = slots;
        Ok(())
    }

    #[cfg(target_arch = "wasm32")]
    fn write(&mut self, env: &Env, slots: [f64; CONSTRAINT_SLOTS]) -> BindingResult<()> {
        use napi::bindgen_prelude::JsObjectValue;
        for (index, value) in slots.iter().enumerate() {
            let value = env.create_double(*value).map_err(|_| internal_error())?;
            self.output
                .set_element(index as u32, value)
                .map_err(|_| internal_error())?;
        }
        Ok(())
    }
}

fn constraint_slots(
    known_dimensions: Size<Option<f32>>,
    available_space: Size<AvailableSpace>,
    node: NodeId,
) -> [f64; CONSTRAINT_SLOTS] {
    let mut slots = [0.0; CONSTRAINT_SLOTS];
    let mut tags = 0u32;
    if let Some(value) = known_dimensions.width {
        tags |= TAG_KNOWN_WIDTH_PRESENT;
        slots[SLOT_KNOWN_WIDTH] = f64::from(value);
    }
    if let Some(value) = known_dimensions.height {
        tags |= TAG_KNOWN_HEIGHT_PRESENT;
        slots[SLOT_KNOWN_HEIGHT] = f64::from(value);
    }
    let (width_kind, width_value) = available_space_slot(available_space.width);
    tags |= width_kind << TAG_AVAILABLE_WIDTH_SHIFT;
    slots[SLOT_AVAILABLE_WIDTH] = width_value;
    let (height_kind, height_value) = available_space_slot(available_space.height);
    tags |= height_kind << TAG_AVAILABLE_HEIGHT_SHIFT;
    slots[SLOT_AVAILABLE_HEIGHT] = height_value;
    slots[SLOT_TAGS] = f64::from(tags);
    let raw = u64::from(node);
    slots[SLOT_NODE_LOW] = f64::from((raw & 0xffff_ffff) as u32);
    slots[SLOT_NODE_HIGH] = f64::from((raw >> 32) as u32);
    slots
}

fn available_space_slot(value: AvailableSpace) -> (u32, f64) {
    match value {
        AvailableSpace::Definite(value) => {
            (AvailableSpaceKindCode::Definite as u32, f64::from(value))
        }
        AvailableSpace::MinContent => (AvailableSpaceKindCode::MinContent as u32, 0.0),
        AvailableSpace::MaxContent => (AvailableSpaceKindCode::MaxContent as u32, 0.0),
    }
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

pub(crate) struct MeasureSession<'session, 'env> {
    env: Env,
    callback: Function<'env, Unknown<'env>, Unknown<'env>>,
    constraints: ConstraintTarget<'session, 'env>,
    cache: HashMap<MeasureCacheKey, Size<f32>>,
    style_providers: HashMap<u64, FunctionRef<(), style::StyleOutput>>,
    failure: Option<MeasureFailure<'env>>,
    not_send: PhantomData<Rc<()>>,
}

impl<'session, 'env> MeasureSession<'session, 'env> {
    pub(crate) fn new(
        env: Env,
        callback: Function<'env, Unknown<'env>, Unknown<'env>>,
        constraints: ConstraintTarget<'session, 'env>,
    ) -> Self {
        Self {
            env,
            callback,
            constraints,
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

        let slots = constraint_slots(known_dimensions, available_space, node);
        let result = self
            .constraints
            .write(&self.env, slots)
            .and_then(|()| style_provider(&self.env, &mut self.style_providers, node, style))
            .map_err(MeasureFailure::Binding)
            .and_then(|provider| call(&self.callback, provider))
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
    callback: &Function<'env, Unknown<'env>, Unknown<'env>>,
    get_style: Function<'_, (), style::StyleOutput>,
) -> Result<Unknown<'env>, MeasureFailure<'env>> {
    let env = callback.value().env;
    let mut receiver = ptr::null_mut();
    let receiver_status = unsafe { sys::napi_get_undefined(env, &mut receiver) };
    if receiver_status != sys::Status::napi_ok {
        return Err(MeasureFailure::Binding(internal_error()));
    }

    let args = [get_style.raw()];
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
        AvailableSpaceCacheKey, MeasureCacheKey, MeasureSession, SLOT_AVAILABLE_HEIGHT,
        SLOT_AVAILABLE_WIDTH, SLOT_KNOWN_HEIGHT, SLOT_KNOWN_WIDTH, SLOT_NODE_HIGH, SLOT_NODE_LOW,
        SLOT_TAGS, constraint_slots, invalidate_subtree,
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
    fn constraint_slots_separate_values_from_variant_tags() {
        let definite = constraint_slots(
            Size {
                width: Some(12.5),
                height: None,
            },
            Size {
                width: AvailableSpace::Definite(-1.0),
                height: AvailableSpace::Definite(-2.0),
            },
            NodeId::from(1u64),
        );
        // The tag slot selects the variant, so every finite definite size reaches its own slot.
        assert_eq!(definite[SLOT_KNOWN_WIDTH], 12.5);
        assert_eq!(definite[SLOT_AVAILABLE_WIDTH], -1.0);
        assert_eq!(definite[SLOT_AVAILABLE_HEIGHT], -2.0);
        assert_eq!(definite[SLOT_TAGS], 1.0);

        let keywords = constraint_slots(
            Size {
                width: None,
                height: Some(-0.0),
            },
            Size {
                width: AvailableSpace::MinContent,
                height: AvailableSpace::MaxContent,
            },
            NodeId::from(0u64),
        );
        assert_eq!(keywords[SLOT_KNOWN_HEIGHT].to_bits(), (-0.0f64).to_bits());
        assert_eq!(keywords[SLOT_TAGS], (2 | (1 << 2) | (2 << 4)) as f64);

        let large = constraint_slots(
            Size {
                width: None,
                height: None,
            },
            Size {
                width: AvailableSpace::MaxContent,
                height: AvailableSpace::MaxContent,
            },
            NodeId::from((3u64 << 32) | 7),
        );
        assert_eq!(large[SLOT_NODE_LOW], 7.0);
        assert_eq!(large[SLOT_NODE_HIGH], 3.0);

        // Every slot pair stays exact for the widest node id slotmap can produce.
        let widest = constraint_slots(
            Size {
                width: None,
                height: None,
            },
            Size {
                width: AvailableSpace::MinContent,
                height: AvailableSpace::MinContent,
            },
            NodeId::from(u64::MAX),
        );
        assert_eq!(widest[SLOT_NODE_LOW], f64::from(u32::MAX));
        assert_eq!(widest[SLOT_NODE_HIGH], f64::from(u32::MAX));
    }

    #[test]
    fn measure_session_stays_on_the_javascript_thread() {
        struct Check<T: ?Sized>(PhantomData<T>);
        trait AmbiguousIfSend<Marker> {
            fn check() {}
        }
        impl<T: ?Sized> AmbiguousIfSend<()> for Check<T> {}
        impl<T: ?Sized + Send> AmbiguousIfSend<u8> for Check<T> {}

        let _ = <Check<MeasureSession<'static, 'static>> as AmbiguousIfSend<_>>::check;
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
