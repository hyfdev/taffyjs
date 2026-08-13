use napi::bindgen_prelude::Unknown;
use napi_derive::napi;
use taffy::geometry::{Line, Point, Rect, Size};

use crate::error::NativeResult;
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
    mut convert: impl FnMut(f64) -> NativeResult<T>,
) -> NativeResult<Point<T>> {
    let input: PartialPointInput = js_object::input(value, "a Point object", Some(POINT_FIELDS))?;
    Ok(Point {
        x: input.x.map(&mut convert).transpose()?.unwrap_or(default.x),
        y: input.y.map(&mut convert).transpose()?.unwrap_or(default.y),
    })
}

pub(crate) fn size<'env, T>(
    value: Unknown<'env>,
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Size<T>> {
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
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Size<T>> {
    let input: PartialSizeInput<'env> =
        js_object::input(value, "a Size object", Some(SIZE_FIELDS))?;
    Ok(Size {
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
    })
}

pub(crate) fn partial_rect<'env, T>(
    value: Unknown<'env>,
    default: Rect<T>,
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Rect<T>> {
    let input: PartialRectInput<'env> =
        js_object::input(value, "a Rect object", Some(RECT_FIELDS))?;
    Ok(Rect {
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
    })
}

pub(crate) fn partial_line<'env, T>(
    value: Unknown<'env>,
    default: Line<T>,
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Line<T>> {
    let input: PartialLineInput<'env> =
        js_object::input(value, "a Line object", Some(LINE_FIELDS))?;
    Ok(Line {
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
    })
}
