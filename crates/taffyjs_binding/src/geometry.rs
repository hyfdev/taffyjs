#![allow(dead_code, reason = "used by the remaining M1 converters")]

use napi::bindgen_prelude::{Object, Unknown};
use napi::{JsValue, ValueType};
use taffy::geometry::{Line, Point, Rect, Size};

use crate::error::{NativeResult, type_error};

struct GeometryObject<'env>(Object<'env>);

impl<'env> GeometryObject<'env> {
    fn read(value: Unknown<'env>, fields: &[&str]) -> NativeResult<Self> {
        if value
            .get_type()
            .map_err(|_| type_error("Expected a geometry object"))?
            != ValueType::Object
        {
            return Err(type_error("Expected a geometry object"));
        }
        let object = unsafe {
            value
                .cast::<Object<'env>>()
                .map_err(|_| type_error("Expected a geometry object"))?
        };
        if object
            .is_array()
            .map_err(|_| type_error("Expected a geometry object"))?
        {
            return Err(type_error("Expected a geometry object"));
        }
        let keys = Object::keys(&object).map_err(|_| type_error("Could not read geometry keys"))?;
        if keys.iter().any(|key| !fields.contains(&key.as_str())) {
            return Err(type_error("Geometry object contains an unknown field"));
        }
        Ok(Self(object))
    }

    fn required<T>(
        &self,
        field: &str,
        convert: &mut impl FnMut(Unknown<'env>) -> NativeResult<T>,
    ) -> NativeResult<T> {
        let value = self
            .0
            .get::<Unknown<'env>>(field)
            .map_err(|_| type_error(format!("Could not read geometry field {field}")))?
            .ok_or_else(|| type_error(format!("Missing geometry field {field}")))?;
        convert(value)
    }

    fn optional<T>(
        &self,
        field: &str,
        convert: &mut impl FnMut(Unknown<'env>) -> NativeResult<T>,
    ) -> NativeResult<Option<T>> {
        self.0
            .get::<Unknown<'env>>(field)
            .map_err(|_| type_error(format!("Could not read geometry field {field}")))?
            .map(convert)
            .transpose()
    }
}

pub(crate) fn point<'env, T>(
    value: Unknown<'env>,
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Point<T>> {
    let object = GeometryObject::read(value, &["x", "y"])?;
    Ok(Point {
        x: object.required("x", &mut convert)?,
        y: object.required("y", &mut convert)?,
    })
}

pub(crate) fn partial_point<'env, T>(
    value: Unknown<'env>,
    default: Point<T>,
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Point<T>> {
    let object = GeometryObject::read(value, &["x", "y"])?;
    Ok(Point {
        x: object.optional("x", &mut convert)?.unwrap_or(default.x),
        y: object.optional("y", &mut convert)?.unwrap_or(default.y),
    })
}

pub(crate) fn size<'env, T>(
    value: Unknown<'env>,
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Size<T>> {
    let object = GeometryObject::read(value, &["width", "height"])?;
    Ok(Size {
        width: object.required("width", &mut convert)?,
        height: object.required("height", &mut convert)?,
    })
}

pub(crate) fn partial_size<'env, T>(
    value: Unknown<'env>,
    default: Size<T>,
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Size<T>> {
    let object = GeometryObject::read(value, &["width", "height"])?;
    Ok(Size {
        width: object
            .optional("width", &mut convert)?
            .unwrap_or(default.width),
        height: object
            .optional("height", &mut convert)?
            .unwrap_or(default.height),
    })
}

pub(crate) fn rect<'env, T>(
    value: Unknown<'env>,
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Rect<T>> {
    let object = GeometryObject::read(value, &["left", "right", "top", "bottom"])?;
    Ok(Rect {
        left: object.required("left", &mut convert)?,
        right: object.required("right", &mut convert)?,
        top: object.required("top", &mut convert)?,
        bottom: object.required("bottom", &mut convert)?,
    })
}

pub(crate) fn partial_rect<'env, T>(
    value: Unknown<'env>,
    default: Rect<T>,
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Rect<T>> {
    let object = GeometryObject::read(value, &["left", "right", "top", "bottom"])?;
    Ok(Rect {
        left: object
            .optional("left", &mut convert)?
            .unwrap_or(default.left),
        right: object
            .optional("right", &mut convert)?
            .unwrap_or(default.right),
        top: object.optional("top", &mut convert)?.unwrap_or(default.top),
        bottom: object
            .optional("bottom", &mut convert)?
            .unwrap_or(default.bottom),
    })
}

pub(crate) fn line<'env, T>(
    value: Unknown<'env>,
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Line<T>> {
    let object = GeometryObject::read(value, &["start", "end"])?;
    Ok(Line {
        start: object.required("start", &mut convert)?,
        end: object.required("end", &mut convert)?,
    })
}

pub(crate) fn partial_line<'env, T>(
    value: Unknown<'env>,
    default: Line<T>,
    mut convert: impl FnMut(Unknown<'env>) -> NativeResult<T>,
) -> NativeResult<Line<T>> {
    let object = GeometryObject::read(value, &["start", "end"])?;
    Ok(Line {
        start: object
            .optional("start", &mut convert)?
            .unwrap_or(default.start),
        end: object.optional("end", &mut convert)?.unwrap_or(default.end),
    })
}
