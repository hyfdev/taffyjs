use std::marker::PhantomData;
use std::ptr;
use std::rc::Rc;

use napi::bindgen_prelude::{BigInt, Either, Function, ToNapiValue, Undefined, Unknown};
use napi::{JsValue, sys};
use napi_derive::napi;
use taffy::geometry::Size;
use taffy::style::{AvailableSpace, Style};
use taffy::{NodeId, TaffyTree};

use crate::error::{NativeError, NativeResult, internal_error, type_error};
use crate::{available_space, geometry, number, style};

#[napi(object, object_from_js = false)]
pub struct KnownDimensionsOutput {
    pub width: Either<f64, Undefined>,
    pub height: Either<f64, Undefined>,
}

#[napi(object, object_from_js = false)]
pub struct AvailableSpaceSizeOutput {
    pub width: available_space::AvailableSpaceOutput,
    pub height: available_space::AvailableSpaceOutput,
}

#[napi(object, object_from_js = false)]
pub struct MeasureArguments {
    pub known_dimensions: KnownDimensionsOutput,
    pub available_space: AvailableSpaceSizeOutput,
    pub node: BigInt,
    pub style: style::StyleOutput,
}

pub(crate) enum MeasureFailure<'env> {
    Callback(Unknown<'env>),
    Native(NativeError),
}

pub(crate) struct MeasureSession<'env> {
    callback: Function<'env, MeasureArguments, Unknown<'env>>,
    failure: Option<MeasureFailure<'env>>,
    not_send: PhantomData<Rc<()>>,
}

impl<'env> MeasureSession<'env> {
    pub(crate) fn new(callback: Function<'env, MeasureArguments, Unknown<'env>>) -> Self {
        Self {
            callback,
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

        let result = call(
            &self.callback,
            self.arguments(known_dimensions, available_space, node, style),
        )
        .and_then(|value| result_size(value).map_err(MeasureFailure::Native));
        match result {
            Ok(size) => size,
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

    fn arguments(
        &self,
        known_dimensions: Size<Option<f32>>,
        available_space: Size<AvailableSpace>,
        node: NodeId,
        style: &Style,
    ) -> MeasureArguments {
        MeasureArguments {
            known_dimensions: known_dimensions_output(known_dimensions),
            available_space: available_space_size_output(available_space),
            node: BigInt::from(u64::from(node)),
            style: style::output(style),
        }
    }
}

fn call<'env>(
    callback: &Function<'env, MeasureArguments, Unknown<'env>>,
    arguments: MeasureArguments,
) -> Result<Unknown<'env>, MeasureFailure<'env>> {
    let env = callback.value().env;
    let mut receiver = ptr::null_mut();
    let receiver_status = unsafe { sys::napi_get_undefined(env, &mut receiver) };
    if receiver_status != sys::Status::napi_ok {
        return Err(MeasureFailure::Native(internal_error()));
    }

    let argument = unsafe { MeasureArguments::to_napi_value(env, arguments) }
        .map_err(|_| MeasureFailure::Native(internal_error()))?;
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
                return Err(MeasureFailure::Native(internal_error()));
            }
            let value = unsafe { Unknown::from_raw_unchecked(env, thrown) };
            Err(MeasureFailure::Callback(value))
        }
        _ => Err(MeasureFailure::Native(internal_error())),
    }
}

fn known_dimension_output(value: Option<f32>) -> Either<f64, Undefined> {
    match value {
        Some(value) => Either::A(f64::from(value)),
        None => Either::B(()),
    }
}

fn known_dimensions_output(value: Size<Option<f32>>) -> KnownDimensionsOutput {
    KnownDimensionsOutput {
        width: known_dimension_output(value.width),
        height: known_dimension_output(value.height),
    }
}

fn available_space_size_output(value: Size<AvailableSpace>) -> AvailableSpaceSizeOutput {
    AvailableSpaceSizeOutput {
        width: available_space::available_space_output(value.width),
        height: available_space::available_space_output(value.height),
    }
}

fn result_size(value: Unknown<'_>) -> NativeResult<Size<f32>> {
    geometry::size(value, |value| {
        let value = unsafe {
            value
                .cast::<f64>()
                .map_err(|_| type_error("Measure result components must be numbers"))?
        };
        Ok(number::to_f32(value))
    })
}

pub(crate) fn invalidate_subtree(tree: &mut TaffyTree<()>, root: NodeId) -> NativeResult<()> {
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

    use taffy::TaffyTree;
    use taffy::style::Style;

    use super::{MeasureSession, invalidate_subtree};

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
        let mut tree = TaffyTree::new();
        let mut root = tree.new_leaf(Style::default()).unwrap();
        for _ in 0..16_384 {
            root = tree.new_with_children(Style::default(), &[root]).unwrap();
        }

        invalidate_subtree(&mut tree, root).unwrap();
    }
}
