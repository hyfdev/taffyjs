use napi::{Env, Error, Result, Status};

#[derive(Clone, Copy, Debug)]
enum NativeErrorKind {
    Error,
    #[allow(dead_code, reason = "used by the remaining M1 converters")]
    RangeError,
}

#[derive(Debug)]
pub(crate) struct NativeError {
    kind: NativeErrorKind,
    pub(crate) code: Option<&'static str>,
    message: String,
}

pub(crate) type NativeResult<T> = std::result::Result<T, NativeError>;

fn coded_error(code: &'static str, message: impl Into<String>) -> NativeError {
    NativeError {
        kind: NativeErrorKind::Error,
        code: Some(code),
        message: message.into(),
    }
}

#[allow(dead_code, reason = "used by the remaining M1 converters")]
pub(crate) fn range_error(message: impl Into<String>) -> NativeError {
    NativeError {
        kind: NativeErrorKind::RangeError,
        code: None,
        message: message.into(),
    }
}

pub(crate) fn busy_error(public_method: &str) -> NativeError {
    coded_error(
        "ERR_TAFFY_TREE_BUSY",
        format!(
            "Cannot call {public_method} on this TaffyTree while it is computing layout from a measure callback"
        ),
    )
}

pub(crate) fn internal_error() -> NativeError {
    coded_error(
        "ERR_TAFFY_INTERNAL",
        "An unexpected internal Taffy error occurred",
    )
}

pub(crate) fn poisoned_error() -> NativeError {
    coded_error(
        "ERR_TAFFY_TREE_POISONED",
        "This TaffyTree cannot be used after an unexpected internal failure",
    )
}

pub(crate) fn into_napi<T>(env: Env, result: NativeResult<T>) -> Result<T> {
    match result {
        Ok(value) => Ok(value),
        Err(error) => {
            match error.kind {
                NativeErrorKind::Error => env.throw_error(&error.message, error.code),
                NativeErrorKind::RangeError => env.throw_range_error(&error.message, error.code),
            }?;
            Err(Error::new(Status::PendingException, error.message))
        }
    }
}
