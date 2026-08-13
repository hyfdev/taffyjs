use napi::bindgen_prelude::Unknown;
use napi_derive::napi;
use taffy::style::{CompactLength, Dimension, LengthPercentage, LengthPercentageAuto};

use crate::error::{NativeResult, type_error};
use crate::js_object;
use crate::number::{from_unknown, to_f32, to_integer};
use crate::numeric::LengthUnitCode;

#[napi(object, object_to_js = false)]
pub struct TaggedLengthInput<'env> {
    pub unit: f64,
    pub value: Option<Unknown<'env>>,
}

#[napi(object, object_from_js = false)]
pub struct LengthOutput {
    pub unit: u8,
    pub value: Option<f64>,
}

fn read_parts(value: Unknown<'_>) -> NativeResult<(LengthUnitCode, f64)> {
    let input: TaggedLengthInput<'_> = js_object::input(value, "a tagged length object", None)?;
    let unit = to_integer::<LengthUnitCode>(input.unit)?;
    let value = match unit {
        LengthUnitCode::Length | LengthUnitCode::Percent => from_unknown(
            js_object::required(input.value, "Length value")?,
            "Length value",
        )?,
        LengthUnitCode::Auto => 0.0,
    };
    Ok((unit, value))
}

pub(crate) fn dimension(value: Unknown<'_>) -> NativeResult<Dimension> {
    let (unit, value) = read_parts(value)?;
    Ok(match unit {
        LengthUnitCode::Length => Dimension::length(to_f32(value)),
        LengthUnitCode::Percent => Dimension::percent(to_f32(value / 100.0)),
        LengthUnitCode::Auto => Dimension::auto(),
    })
}

pub(crate) fn length_percentage(value: Unknown<'_>) -> NativeResult<LengthPercentage> {
    let (unit, value) = read_parts(value)?;
    match unit {
        LengthUnitCode::Length => Ok(LengthPercentage::length(to_f32(value))),
        LengthUnitCode::Percent => Ok(LengthPercentage::percent(to_f32(value / 100.0))),
        LengthUnitCode::Auto => Err(type_error("Auto is not valid here")),
    }
}

pub(crate) fn length_percentage_auto(value: Unknown<'_>) -> NativeResult<LengthPercentageAuto> {
    let (unit, value) = read_parts(value)?;
    Ok(match unit {
        LengthUnitCode::Length => LengthPercentageAuto::length(to_f32(value)),
        LengthUnitCode::Percent => LengthPercentageAuto::percent(to_f32(value / 100.0)),
        LengthUnitCode::Auto => LengthPercentageAuto::auto(),
    })
}

fn output(raw: CompactLength) -> LengthOutput {
    match raw.tag() {
        CompactLength::LENGTH_TAG => LengthOutput {
            unit: LengthUnitCode::Length as u8,
            value: Some(f64::from(raw.value())),
        },
        CompactLength::PERCENT_TAG => LengthOutput {
            unit: LengthUnitCode::Percent as u8,
            value: Some(f64::from(raw.value()) * 100.0),
        },
        CompactLength::AUTO_TAG => LengthOutput {
            unit: LengthUnitCode::Auto as u8,
            value: None,
        },
        _ => panic!("unsupported Taffy length tag"),
    }
}

pub(crate) fn dimension_output(value: Dimension) -> LengthOutput {
    output(value.into_raw())
}

pub(crate) fn length_percentage_output(value: LengthPercentage) -> LengthOutput {
    output(value.into_raw())
}

pub(crate) fn length_percentage_auto_output(value: LengthPercentageAuto) -> LengthOutput {
    output(value.into_raw())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn output_uses_public_units_and_percent_scale() {
        let length = dimension_output(Dimension::length(12.0));
        assert_eq!((length.unit, length.value), (0, Some(12.0)));

        let percent = dimension_output(Dimension::percent(0.5));
        assert_eq!((percent.unit, percent.value), (1, Some(50.0)));

        let auto = dimension_output(Dimension::auto());
        assert_eq!((auto.unit, auto.value), (2, None));
    }
}
