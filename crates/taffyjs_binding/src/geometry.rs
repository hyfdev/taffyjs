use napi::bindgen_prelude::Unknown;
use napi_derive::napi;
use taffy::geometry::{Line, Point, Rect, Size};

use crate::error::BindingResult;
use crate::js_object;

const POINT_FIELDS: &[&str] = &["x", "y"];
const SIZE_FIELDS: &[&str] = &["width", "height"];
const RECT_FIELDS: &[&str] = &["left", "right", "top", "bottom"];
const LINE_FIELDS: &[&str] = &["start", "end"];

#[napi(object, object_to_js = false)]
pub struct PartialPointInput {
    pub x: Option<f64>,
    pub y: Option<f64>,
}

#[napi(object, object_to_js = false)]
pub struct CompleteSizeInput<'env> {
    pub width: Unknown<'env>,
    pub height: Unknown<'env>,
}

#[napi(object, object_to_js = false)]
pub struct PartialSizeInput<'env> {
    pub width: Option<Unknown<'env>>,
    pub height: Option<Unknown<'env>>,
}

#[napi(object, object_to_js = false)]
pub struct PartialRectInput<'env> {
    pub left: Option<Unknown<'env>>,
    pub right: Option<Unknown<'env>>,
    pub top: Option<Unknown<'env>>,
    pub bottom: Option<Unknown<'env>>,
}

#[napi(object, object_to_js = false)]
pub struct PartialLineInput<'env> {
    pub start: Option<Unknown<'env>>,
    pub end: Option<Unknown<'env>>,
}

pub(crate) fn partial_point<T>(
    value: Unknown<'_>,
    default: Point<T>,
    mut convert: impl FnMut(f64) -> BindingResult<T>,
) -> BindingResult<(Point<T>, Point<bool>)> {
    let input: PartialPointInput = js_object::input(value, "a Point object", Some(POINT_FIELDS))?;
    let present = Point {
        x: input.x.is_some(),
        y: input.y.is_some(),
    };
    let value = Point {
        x: input.x.map(&mut convert).transpose()?.unwrap_or(default.x),
        y: input.y.map(&mut convert).transpose()?.unwrap_or(default.y),
    };
    Ok((value, present))
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

pub(crate) fn partial_size<'env, T>(
    value: Unknown<'env>,
    default: Size<T>,
    mut convert: impl FnMut(Unknown<'env>) -> BindingResult<T>,
) -> BindingResult<(Size<T>, Size<bool>)> {
    let input: PartialSizeInput<'env> =
        js_object::input(value, "a Size object", Some(SIZE_FIELDS))?;
    let present = Size {
        width: input.width.is_some(),
        height: input.height.is_some(),
    };
    let value = Size {
        width: input
            .width
            .map(&mut convert)
            .transpose()?
            .unwrap_or(default.width),
        height: input
            .height
            .map(&mut convert)
            .transpose()?
            .unwrap_or(default.height),
    };
    Ok((value, present))
}

pub(crate) fn partial_rect<'env, T>(
    value: Unknown<'env>,
    default: Rect<T>,
    mut convert: impl FnMut(Unknown<'env>) -> BindingResult<T>,
) -> BindingResult<(Rect<T>, Rect<bool>)> {
    let input: PartialRectInput<'env> =
        js_object::input(value, "a Rect object", Some(RECT_FIELDS))?;
    let present = Rect {
        left: input.left.is_some(),
        right: input.right.is_some(),
        top: input.top.is_some(),
        bottom: input.bottom.is_some(),
    };
    let value = Rect {
        left: input
            .left
            .map(&mut convert)
            .transpose()?
            .unwrap_or(default.left),
        right: input
            .right
            .map(&mut convert)
            .transpose()?
            .unwrap_or(default.right),
        top: input
            .top
            .map(&mut convert)
            .transpose()?
            .unwrap_or(default.top),
        bottom: input
            .bottom
            .map(&mut convert)
            .transpose()?
            .unwrap_or(default.bottom),
    };
    Ok((value, present))
}

pub(crate) fn partial_line<'env, T>(
    value: Unknown<'env>,
    default: Line<T>,
    mut convert: impl FnMut(Unknown<'env>) -> BindingResult<T>,
) -> BindingResult<(Line<T>, Line<bool>)> {
    let input: PartialLineInput<'env> =
        js_object::input(value, "a Line object", Some(LINE_FIELDS))?;
    let present = Line {
        start: input.start.is_some(),
        end: input.end.is_some(),
    };
    let value = Line {
        start: input
            .start
            .map(&mut convert)
            .transpose()?
            .unwrap_or(default.start),
        end: input
            .end
            .map(&mut convert)
            .transpose()?
            .unwrap_or(default.end),
    };
    Ok((value, present))
}
