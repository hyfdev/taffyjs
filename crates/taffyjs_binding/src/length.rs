use napi::bindgen_prelude::Unknown;
use napi_derive::napi;
use taffy::style::{CompactLength, Dimension, LengthPercentage, LengthPercentageAuto};

use crate::error::BindingResult;
use crate::number::to_f32;
use crate::numeric::LengthUnitCode;
use crate::tagged_values::{
    DimensionInputValue, LengthPercentageAutoInputValue, LengthPercentageInputValue,
    parse_dimension, parse_length_percentage, parse_length_percentage_auto,
};

#[napi(object, object_from_js = false)]
pub struct LengthOutput {
    pub unit: u8,
    pub value: Option<f64>,
}

pub(crate) fn dimension(value: Unknown<'_>) -> BindingResult<Dimension> {
    Ok(match parse_dimension(value)? {
        DimensionInputValue::Length(value) => Dimension::length(to_f32(value)),
        DimensionInputValue::Percent(value) => Dimension::percent(to_f32(value / 100.0)),
        DimensionInputValue::Auto => Dimension::auto(),
    })
}

pub(crate) fn length_percentage(value: Unknown<'_>) -> BindingResult<LengthPercentage> {
    Ok(match parse_length_percentage(value)? {
        LengthPercentageInputValue::Length(value) => LengthPercentage::length(to_f32(value)),
        LengthPercentageInputValue::Percent(value) => {
            LengthPercentage::percent(to_f32(value / 100.0))
        }
    })
}

pub(crate) fn length_percentage_auto(value: Unknown<'_>) -> BindingResult<LengthPercentageAuto> {
    Ok(match parse_length_percentage_auto(value)? {
        LengthPercentageAutoInputValue::Length(value) => {
            LengthPercentageAuto::length(to_f32(value))
        }
        LengthPercentageAutoInputValue::Percent(value) => {
            LengthPercentageAuto::percent(to_f32(value / 100.0))
        }
        LengthPercentageAutoInputValue::Auto => LengthPercentageAuto::auto(),
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
