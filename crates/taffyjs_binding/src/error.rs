use napi::{Env, Error, Result, Status};

#[derive(Debug)]
pub(crate) struct NativeError {
    pub(crate) code: &'static str,
    message: String,
}

pub(crate) type NativeResult<T> = std::result::Result<T, NativeError>;

fn coded_error(code: &'static str, message: impl Into<String>) -> NativeError {
    NativeError {
        code,
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
            env.throw_error(&error.message, Some(error.code))?;
            Err(Error::new(Status::PendingException, error.message))
        }
    }
}
