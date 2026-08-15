use napi::bindgen_prelude::Unknown;
use napi_derive::napi;
use taffy::style::AvailableSpace;

use crate::error::BindingResult;
use crate::number::to_f32;
use crate::numeric::AvailableSpaceKindCode;
use crate::tagged_values::{AvailableSpaceInputValue, parse_available_space};

#[napi(object, object_from_js = false)]
pub struct AvailableSpaceOutput {
    pub kind: u8,
    pub value: Option<f64>,
}

pub(crate) fn available_space(value: Unknown<'_>) -> BindingResult<AvailableSpace> {
    Ok(match parse_available_space(value)? {
        AvailableSpaceInputValue::Definite(value) => AvailableSpace::Definite(to_f32(value)),
        AvailableSpaceInputValue::MinContent => AvailableSpace::MinContent,
        AvailableSpaceInputValue::MaxContent => AvailableSpace::MaxContent,
    })
}

pub(crate) fn available_space_output(value: AvailableSpace) -> AvailableSpaceOutput {
    match value {
        AvailableSpace::Definite(value) => AvailableSpaceOutput {
            kind: AvailableSpaceKindCode::Definite as u8,
            value: Some(f64::from(value)),
        },
        AvailableSpace::MinContent => AvailableSpaceOutput {
            kind: AvailableSpaceKindCode::MinContent as u8,
            value: None,
        },
        AvailableSpace::MaxContent => AvailableSpaceOutput {
            kind: AvailableSpaceKindCode::MaxContent as u8,
            value: None,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn output_uses_public_kind_codes() {
        let definite = available_space_output(AvailableSpace::Definite(12.0));
        assert_eq!((definite.kind, definite.value), (0, Some(12.0)));

        let min_content = available_space_output(AvailableSpace::MinContent);
        assert_eq!((min_content.kind, min_content.value), (1, None));

        let max_content = available_space_output(AvailableSpace::MaxContent);
        assert_eq!((max_content.kind, max_content.value), (2, None));
    }
}
