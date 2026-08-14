use napi::bindgen_prelude::Unknown;
use napi_derive::napi;
use taffy::style::AvailableSpace;

use crate::error::NativeResult;
use crate::js_object;
use crate::number::{to_f32, to_integer};
use crate::numeric::AvailableSpaceKindCode;

#[napi(object, object_to_js = false)]
pub struct AvailableSpaceInput {
    pub kind: f64,
    pub value: Option<f64>,
}

#[napi(object, object_from_js = false)]
pub struct AvailableSpaceOutput {
    pub kind: u8,
    pub value: Option<f64>,
}

pub(crate) fn available_space(value: Unknown<'_>) -> NativeResult<AvailableSpace> {
    let input: AvailableSpaceInput = js_object::input(value, "an available-space object", None)?;
    Ok(match to_integer::<AvailableSpaceKindCode>(input.kind)? {
        AvailableSpaceKindCode::Definite => AvailableSpace::Definite(to_f32(js_object::required(
            input.value,
            "Definite available space value",
        )?)),
        AvailableSpaceKindCode::MinContent => AvailableSpace::MinContent,
        AvailableSpaceKindCode::MaxContent => AvailableSpace::MaxContent,
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
