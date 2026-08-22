use napi::bindgen_prelude::Unknown;
use taffy::style::AvailableSpace;

use crate::error::BindingResult;
use crate::number::to_f32;
use crate::tagged_values::{AvailableSpaceInputValue, parse_available_space};

pub(crate) fn available_space(value: Unknown<'_>) -> BindingResult<AvailableSpace> {
    Ok(match parse_available_space(value)? {
        AvailableSpaceInputValue::Definite(value) => AvailableSpace::Definite(to_f32(value)),
        AvailableSpaceInputValue::MinContent => AvailableSpace::MinContent,
        AvailableSpaceInputValue::MaxContent => AvailableSpace::MaxContent,
    })
}
