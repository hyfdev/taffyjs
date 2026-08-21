use napi::bindgen_prelude::Unknown;
use napi_derive::napi;
use taffy::geometry::Size;

use crate::error::BindingResult;
use crate::js_object;

const SIZE_FIELDS: &[&str] = &["width", "height"];

#[napi(object, object_to_js = false)]
pub struct CompleteSizeInput<'env> {
    pub width: Unknown<'env>,
    pub height: Unknown<'env>,
}

pub(crate) fn size<'env, T>(
    value: Unknown<'env>,
    mut convert: impl FnMut(Unknown<'env>) -> BindingResult<T>,
) -> BindingResult<Size<T>> {
    let input: CompleteSizeInput<'env> =
        js_object::input(value, "a Size object", Some(SIZE_FIELDS))?;
    Ok(Size {
        width: convert(input.width)?,
        height: convert(input.height)?,
    })
}
