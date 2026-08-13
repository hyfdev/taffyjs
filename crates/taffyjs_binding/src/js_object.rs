use napi::bindgen_prelude::{FromNapiValue, Object, Unknown};
use napi::{JsValue, ValueType};

use crate::error::{NativeResult, type_error};

pub(crate) fn input<'env, T>(
    value: Unknown<'env>,
    name: &str,
    allowed_fields: Option<&[&str]>,
) -> NativeResult<T>
where
    T: FromNapiValue,
{
    if value
        .get_type()
        .map_err(|_| type_error(format!("Could not inspect {name}")))?
        != ValueType::Object
    {
        return Err(type_error(format!("Expected {name}")));
    }

    let object = unsafe {
        value
            .cast::<Object<'env>>()
            .map_err(|_| type_error(format!("Expected {name}")))?
    };
    if object
        .is_array()
        .map_err(|_| type_error(format!("Could not inspect {name}")))?
    {
        return Err(type_error(format!("Expected {name}")));
    }

    if let Some(allowed_fields) = allowed_fields {
        let keys =
            Object::keys(&object).map_err(|_| type_error(format!("Could not read {name} keys")))?;
        if keys
            .iter()
            .any(|key| !allowed_fields.contains(&key.as_str()))
        {
            return Err(type_error(format!("{name} contains an unknown field")));
        }
    }

    unsafe {
        value
            .cast::<T>()
            .map_err(|_| type_error(format!("Could not read {name}")))
    }
}

pub(crate) fn required<T>(value: Option<T>, name: &str) -> NativeResult<T> {
    value.ok_or_else(|| type_error(format!("{name} is required")))
}
