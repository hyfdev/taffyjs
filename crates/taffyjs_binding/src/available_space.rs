#![allow(dead_code, reason = "used by the M1 raw compute operation")]

use napi::bindgen_prelude::{Object, Unknown};
use napi::{JsValue, ValueType};
use taffy::style::AvailableSpace;

use crate::error::{NativeResult, type_error};
use crate::generated_numeric::AvailableSpaceKindCode;
use crate::number::{to_f32, to_integer};

fn read_object<'env>(value: Unknown<'env>) -> NativeResult<Object<'env>> {
    if value
        .get_type()
        .map_err(|_| type_error("Expected an available-space object"))?
        != ValueType::Object
    {
        return Err(type_error("Expected an available-space object"));
    }
    let object = unsafe {
        value
            .cast::<Object<'env>>()
            .map_err(|_| type_error("Expected an available-space object"))?
    };
    if object
        .is_array()
        .map_err(|_| type_error("Expected an available-space object"))?
    {
        return Err(type_error("Expected an available-space object"));
    }
    Ok(object)
}

pub(crate) fn available_space(value: Unknown<'_>) -> NativeResult<AvailableSpace> {
    let object = read_object(value)?;
    let kind = object
        .get::<f64>("kind")
        .map_err(|_| type_error("Available-space kind must be a number"))?
        .ok_or_else(|| type_error("Available-space kind is required"))?;
    Ok(match to_integer::<AvailableSpaceKindCode>(kind)? {
        AvailableSpaceKindCode::Definite => AvailableSpace::Definite(to_f32(
            object
                .get::<f64>("value")
                .map_err(|_| type_error("Definite available space must be a number"))?
                .ok_or_else(|| type_error("Definite available space requires a value"))?,
        )),
        AvailableSpaceKindCode::MinContent => AvailableSpace::MinContent,
        AvailableSpaceKindCode::MaxContent => AvailableSpace::MaxContent,
    })
}

pub(crate) fn available_space_output(value: AvailableSpace) -> (u8, Option<f64>) {
    match value {
        AvailableSpace::Definite(value) => (
            AvailableSpaceKindCode::Definite as u8,
            Some(f64::from(value)),
        ),
        AvailableSpace::MinContent => (AvailableSpaceKindCode::MinContent as u8, None),
        AvailableSpace::MaxContent => (AvailableSpaceKindCode::MaxContent as u8, None),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn output_uses_public_kind_codes() {
        assert_eq!(
            available_space_output(AvailableSpace::Definite(12.0)),
            (0, Some(12.0))
        );
        assert_eq!(
            available_space_output(AvailableSpace::MinContent),
            (1, None)
        );
        assert_eq!(
            available_space_output(AvailableSpace::MaxContent),
            (2, None)
        );
    }
}
