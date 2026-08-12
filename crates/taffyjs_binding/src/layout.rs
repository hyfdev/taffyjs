use napi::Env;
use napi::bindgen_prelude::Object;
use taffy::Layout;

use crate::geometry;

pub(crate) fn output<'env>(env: &Env, value: &Layout) -> napi::Result<Object<'env>> {
    let mut output = Object::new(env)?;
    output.set("order", value.order)?;
    output.set(
        "location",
        geometry::point_output(env, &value.location, f32_output)?,
    )?;
    output.set("size", geometry::size_output(env, &value.size, f32_output)?)?;
    output.set(
        "contentSize",
        geometry::size_output(env, &value.content_size, f32_output)?,
    )?;
    output.set(
        "scrollbarSize",
        geometry::size_output(env, &value.scrollbar_size, f32_output)?,
    )?;
    output.set(
        "border",
        geometry::rect_output(env, &value.border, f32_output)?,
    )?;
    output.set(
        "padding",
        geometry::rect_output(env, &value.padding, f32_output)?,
    )?;
    output.set(
        "margin",
        geometry::rect_output(env, &value.margin, f32_output)?,
    )?;
    Ok(output)
}

fn f32_output(value: &f32) -> napi::Result<f64> {
    Ok(f64::from(*value))
}
