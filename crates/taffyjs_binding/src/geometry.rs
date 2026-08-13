use napi::Env;
use napi::bindgen_prelude::{Object, ToNapiValue, Unknown};
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

pub(crate) fn point_output<'env, T, V>(
    env: &Env,
    value: &Point<T>,
    mut convert: impl FnMut(&T) -> napi::Result<V>,
) -> napi::Result<Object<'env>>
where
    V: ToNapiValue,
{
    let mut output = Object::new(env)?;
    output.set("x", convert(&value.x)?)?;
    output.set("y", convert(&value.y)?)?;
    Ok(output)
}

pub(crate) fn size_output<'env, T, V>(
    env: &Env,
    value: &Size<T>,
    mut convert: impl FnMut(&T) -> napi::Result<V>,
) -> napi::Result<Object<'env>>
where
    V: ToNapiValue,
{
    let mut output = Object::new(env)?;
    output.set("width", convert(&value.width)?)?;
    output.set("height", convert(&value.height)?)?;
    Ok(output)
}

pub(crate) fn rect_output<'env, T, V>(
    env: &Env,
    value: &Rect<T>,
    mut convert: impl FnMut(&T) -> napi::Result<V>,
) -> napi::Result<Object<'env>>
where
    V: ToNapiValue,
{
    let mut output = Object::new(env)?;
    output.set("left", convert(&value.left)?)?;
    output.set("right", convert(&value.right)?)?;
    output.set("top", convert(&value.top)?)?;
    output.set("bottom", convert(&value.bottom)?)?;
    Ok(output)
}

pub(crate) fn line_output<'env, T, V>(
    env: &Env,
    value: &Line<T>,
    mut convert: impl FnMut(&T) -> napi::Result<V>,
) -> napi::Result<Object<'env>>
where
    V: ToNapiValue,
{
    let mut output = Object::new(env)?;
    output.set("start", convert(&value.start)?)?;
    output.set("end", convert(&value.end)?)?;
    Ok(output)
}
