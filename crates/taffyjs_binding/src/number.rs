use napi::bindgen_prelude::Unknown;

use crate::error::{NativeResult, range_error, type_error};

const I64_UPPER_EXCLUSIVE: f64 = 9_223_372_036_854_775_808.0;
const JS_MAX_SAFE_INTEGER: f64 = 9_007_199_254_740_991.0;

pub(crate) fn to_f32(value: f64) -> f32 {
    value as f32
}

pub(crate) fn from_unknown(value: Unknown<'_>, name: &str) -> NativeResult<f64> {
    unsafe {
        value
            .cast::<f64>()
            .map_err(|_| type_error(format!("{name} must be a number")))
    }
}

pub(crate) fn to_integer<T>(value: f64) -> NativeResult<T>
where
    T: TryFrom<i64>,
{
    if !value.is_finite()
        || value.fract() != 0.0
        || value < i64::MIN as f64
        || value >= I64_UPPER_EXCLUSIVE
    {
        return Err(range_error("Expected a finite integer in range"));
    }

    T::try_from(value as i64).map_err(|_| range_error("Expected a finite integer in range"))
}

pub(crate) fn to_safe_usize(value: f64) -> NativeResult<usize> {
    if value > JS_MAX_SAFE_INTEGER {
        return Err(range_error("Expected a non-negative safe integer"));
    }
    to_integer(value).map_err(|_| range_error("Expected a non-negative safe integer"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::numeric::DisplayCode;

    #[test]
    fn f32_conversion_matches_rust_cast() {
        for value in [0.1, -0.0, f64::MAX, f64::NAN, f64::INFINITY] {
            assert_eq!(to_f32(value).to_bits(), (value as f32).to_bits());
        }
    }

    #[test]
    fn integer_conversion_checks_value_and_target_range() {
        assert_eq!(to_integer::<i16>(-32768.0).unwrap(), i16::MIN);
        assert_eq!(to_integer::<i16>(32767.0).unwrap(), i16::MAX);
        assert_eq!(to_integer::<u16>(0.0).unwrap(), u16::MIN);
        assert_eq!(to_integer::<u16>(65535.0).unwrap(), u16::MAX);
        assert_eq!(to_integer::<DisplayCode>(4.0).unwrap(), DisplayCode::None);

        for value in [f64::NAN, f64::INFINITY, 0.5] {
            assert!(to_integer::<i16>(value).is_err());
        }
        assert!(to_integer::<i16>(-32769.0).is_err());
        assert!(to_integer::<i16>(32768.0).is_err());
        assert!(to_integer::<u16>(-1.0).is_err());
        assert!(to_integer::<u16>(65536.0).is_err());
        assert!(to_integer::<DisplayCode>(5.0).is_err());
    }
}
