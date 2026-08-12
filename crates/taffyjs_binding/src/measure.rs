use std::marker::PhantomData;
use std::ptr;
use std::rc::Rc;

use napi::bindgen_prelude::{BigInt, Function, Object, Unknown};
use napi::{Env, JsValue, sys};
use taffy::geometry::Size;
use taffy::style::{AvailableSpace, Style};
use taffy::{NodeId, TaffyTree};

use crate::error::{NativeError, NativeResult, internal_error, type_error};
use crate::{available_space, geometry, number, style};

pub(crate) enum MeasureFailure<'env> {
    Callback(Unknown<'env>),
    Native(NativeError),
}

pub(crate) struct MeasureSession<'env> {
    env: Env,
    callback: Function<'env, Object<'env>, Unknown<'env>>,
    failure: Option<MeasureFailure<'env>>,
    not_send: PhantomData<Rc<()>>,
}

impl<'env> MeasureSession<'env> {
    pub(crate) fn new(env: Env, callback: Function<'env, Object<'env>, Unknown<'env>>) -> Self {
        Self {
            env,
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

        let result = self
            .arguments(known_dimensions, available_space, node, style)
            .map_err(|_| MeasureFailure::Native(internal_error()))
            .and_then(|arguments| call(&self.callback, arguments))
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
    ) -> napi::Result<Object<'env>> {
        let mut output = Object::new(&self.env)?;
        output.set(
            "knownDimensions",
            known_dimensions_output(&self.env, known_dimensions)?,
        )?;
        output.set(
            "availableSpace",
            available_space_size_output(&self.env, available_space)?,
        )?;
        output.set("node", BigInt::from(u64::from(node)))?;
        output.set("style", style::output(&self.env, style)?)?;
        Ok(output)
    }
}

fn call<'env>(
    callback: &Function<'env, Object<'env>, Unknown<'env>>,
    arguments: Object<'env>,
) -> Result<Unknown<'env>, MeasureFailure<'env>> {
    let env = callback.value().env;
    let mut receiver = ptr::null_mut();
    let receiver_status = unsafe { sys::napi_get_undefined(env, &mut receiver) };
    if receiver_status != sys::Status::napi_ok {
        return Err(MeasureFailure::Native(internal_error()));
    }

    let args = [arguments.raw()];
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

fn known_dimension_output<'env>(
    output: &mut Object<'env>,
    field: &str,
    value: Option<f32>,
) -> napi::Result<()> {
    match value {
        Some(value) => output.set(field, f64::from(value)),
        None => output.set(field, ()),
    }
}

fn known_dimensions_output<'env>(
    env: &Env,
    value: Size<Option<f32>>,
) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    known_dimension_output(&mut output, "width", value.width)?;
    known_dimension_output(&mut output, "height", value.height)?;
    Ok(output)
}

fn available_space_output<'env>(env: &Env, value: AvailableSpace) -> napi::Result<Object<'env>> {
    let (kind, value) = available_space::available_space_output(value);
    let mut output = Object::new(env)?;
    output.set("kind", kind)?;
    if let Some(value) = value {
        output.set("value", value)?;
    }
    Ok(output)
}

fn available_space_size_output<'env>(
    env: &Env,
    value: Size<AvailableSpace>,
) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    output.set("width", available_space_output(env, value.width)?)?;
    output.set("height", available_space_output(env, value.height)?)?;
    Ok(output)
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
    for child in tree.children(root).map_err(|_| internal_error())? {
        invalidate_subtree(tree, child)?;
    }
    tree.mark_dirty(root).map_err(|_| internal_error())
}

#[cfg(test)]
mod tests {
    use taffy::TaffyTree;
    use taffy::style::Style;

    use super::invalidate_subtree;

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
