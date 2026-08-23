use napi_derive::napi;
use taffy::style::{
    CompactLength, Dimension, ExpandedDimension, LengthPercentage, LengthPercentageAuto,
};

use crate::numeric::LengthUnitCode;

#[napi(object, object_from_js = false)]
pub struct LengthOutput {
    pub unit: u8,
    pub value: Option<f64>,
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
    match value.expand() {
        ExpandedDimension::Length(value) => LengthOutput {
            unit: LengthUnitCode::Length as u8,
            value: Some(f64::from(value)),
        },
        ExpandedDimension::Percent(value) => LengthOutput {
            unit: LengthUnitCode::Percent as u8,
            value: Some(f64::from(value) * 100.0),
        },
        ExpandedDimension::Auto => LengthOutput {
            unit: LengthUnitCode::Auto as u8,
            value: None,
        },
        ExpandedDimension::MinContent => LengthOutput {
            unit: LengthUnitCode::MinContent as u8,
            value: None,
        },
        ExpandedDimension::MaxContent => LengthOutput {
            unit: LengthUnitCode::MaxContent as u8,
            value: None,
        },
        ExpandedDimension::FitContent => LengthOutput {
            unit: LengthUnitCode::FitContent as u8,
            value: None,
        },
        ExpandedDimension::FitContentPx(value) => LengthOutput {
            unit: LengthUnitCode::FitContentLength as u8,
            value: Some(f64::from(value)),
        },
        ExpandedDimension::FitContentPercent(value) => LengthOutput {
            unit: LengthUnitCode::FitContentPercent as u8,
            value: Some(f64::from(value) * 100.0),
        },
        ExpandedDimension::Stretch => LengthOutput {
            unit: LengthUnitCode::Stretch as u8,
            value: None,
        },
        ExpandedDimension::Content => LengthOutput {
            unit: LengthUnitCode::Content as u8,
            value: None,
        },
        ExpandedDimension::Calc(_) => panic!("unsupported Taffy calc dimension"),
    }
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

        let fit_content_percent = dimension_output(Dimension::fit_content_percent(0.25));
        assert_eq!(
            (fit_content_percent.unit, fit_content_percent.value),
            (7, Some(25.0))
        );

        let content = dimension_output(Dimension::content());
        assert_eq!((content.unit, content.value), (9, None));
    }
}
