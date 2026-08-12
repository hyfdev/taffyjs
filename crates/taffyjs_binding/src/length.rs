#![allow(dead_code, reason = "used by the M1 Style converter")]

use napi::bindgen_prelude::{Object, Unknown};
use napi::{JsValue, ValueType};
use taffy::style::{CompactLength, Dimension, LengthPercentage, LengthPercentageAuto};

use crate::error::{NativeResult, type_error};
use crate::generated_numeric::LengthUnitCode;
use crate::number::{to_f32, to_integer};

fn read_object<'env>(value: Unknown<'env>) -> NativeResult<Object<'env>> {
    if value
        .get_type()
        .map_err(|_| type_error("Expected a tagged length object"))?
        != ValueType::Object
    {
        return Err(type_error("Expected a tagged length object"));
    }
    let object = unsafe {
        value
            .cast::<Object<'env>>()
            .map_err(|_| type_error("Expected a tagged length object"))?
    };
    if object
        .is_array()
        .map_err(|_| type_error("Expected a tagged length object"))?
    {
        return Err(type_error("Expected a tagged length object"));
    }
    Ok(object)
}

fn read_parts(value: Unknown<'_>) -> NativeResult<(LengthUnitCode, f32)> {
    let object = read_object(value)?;
    let unit = object
        .get::<f64>("unit")
        .map_err(|_| type_error("Length unit must be a number"))?
        .ok_or_else(|| type_error("Length unit is required"))?;
    let unit = to_integer::<LengthUnitCode>(unit)?;
    let value = match unit {
        LengthUnitCode::Length | LengthUnitCode::Percent => to_f32(
            object
                .get::<f64>("value")
                .map_err(|_| type_error("Length value must be a number"))?
                .ok_or_else(|| type_error("Length value is required"))?,
        ),
        LengthUnitCode::Auto => 0.0,
    };
    Ok((unit, value))
}

pub(crate) fn dimension(value: Unknown<'_>) -> NativeResult<Dimension> {
    let (unit, value) = read_parts(value)?;
    Ok(match unit {
        LengthUnitCode::Length => Dimension::length(value),
        LengthUnitCode::Percent => Dimension::percent(value / 100.0),
        LengthUnitCode::Auto => Dimension::auto(),
    })
}

pub(crate) fn length_percentage(value: Unknown<'_>) -> NativeResult<LengthPercentage> {
    let (unit, value) = read_parts(value)?;
    match unit {
        LengthUnitCode::Length => Ok(LengthPercentage::length(value)),
        LengthUnitCode::Percent => Ok(LengthPercentage::percent(value / 100.0)),
        LengthUnitCode::Auto => Err(type_error("Auto is not valid here")),
    }
}

pub(crate) fn length_percentage_auto(value: Unknown<'_>) -> NativeResult<LengthPercentageAuto> {
    let (unit, value) = read_parts(value)?;
    Ok(match unit {
        LengthUnitCode::Length => LengthPercentageAuto::length(value),
        LengthUnitCode::Percent => LengthPercentageAuto::percent(value / 100.0),
        LengthUnitCode::Auto => LengthPercentageAuto::auto(),
    })
}

fn output(raw: CompactLength) -> (u8, Option<f64>) {
    match raw.tag() {
        CompactLength::LENGTH_TAG => (LengthUnitCode::Length as u8, Some(f64::from(raw.value()))),
        CompactLength::PERCENT_TAG => (
            LengthUnitCode::Percent as u8,
            Some(f64::from(raw.value()) * 100.0),
        ),
        CompactLength::AUTO_TAG => (LengthUnitCode::Auto as u8, None),
        _ => panic!("unsupported Taffy length tag"),
    }
}

pub(crate) fn dimension_output(value: Dimension) -> (u8, Option<f64>) {
    output(value.into_raw())
}

pub(crate) fn length_percentage_output(value: LengthPercentage) -> (u8, Option<f64>) {
    output(value.into_raw())
}

pub(crate) fn length_percentage_auto_output(value: LengthPercentageAuto) -> (u8, Option<f64>) {
    output(value.into_raw())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn output_uses_public_units_and_percent_scale() {
        assert_eq!(dimension_output(Dimension::length(12.0)), (0, Some(12.0)));
        assert_eq!(dimension_output(Dimension::percent(0.5)), (1, Some(50.0)));
        assert_eq!(dimension_output(Dimension::auto()), (2, None));
    }
}
