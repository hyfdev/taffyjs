use napi::{Env, Error, Result, Status};

#[derive(Clone, Copy, Debug)]
enum NativeErrorKind {
    Error,
    RangeError,
    TypeError,
}

#[derive(Debug)]
pub(crate) struct NativeError {
    kind: NativeErrorKind,
    pub(crate) code: Option<&'static str>,
    message: String,
}

pub(crate) type NativeResult<T> = std::result::Result<T, NativeError>;

fn native_error(
    kind: NativeErrorKind,
    code: Option<&'static str>,
    message: impl Into<String>,
) -> NativeError {
    NativeError {
        kind,
        code,
        message: message.into(),
    }
}

fn coded_error(code: &'static str, message: impl Into<String>) -> NativeError {
    native_error(NativeErrorKind::Error, Some(code), message)
}

#[allow(dead_code)]
fn coded_range_error(code: &'static str, message: impl Into<String>) -> NativeError {
    native_error(NativeErrorKind::RangeError, Some(code), message)
}

#[allow(dead_code)]
pub(crate) fn plain_error(message: impl Into<String>) -> NativeError {
    native_error(NativeErrorKind::Error, None, message)
}

pub(crate) fn range_error(message: impl Into<String>) -> NativeError {
    native_error(NativeErrorKind::RangeError, None, message)
}

pub(crate) fn type_error(message: impl Into<String>) -> NativeError {
    native_error(NativeErrorKind::TypeError, None, message)
}

#[allow(dead_code)]
pub(crate) fn child_index_out_of_bounds_error(message: impl Into<String>) -> NativeError {
    coded_range_error("ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS", message)
}

#[allow(dead_code)]
pub(crate) fn invalid_node_id_error(message: impl Into<String>) -> NativeError {
    coded_error("ERR_TAFFY_INVALID_NODE_ID", message)
}

#[allow(dead_code)]
pub(crate) fn foreign_node_id_error(message: impl Into<String>) -> NativeError {
    coded_error("ERR_TAFFY_FOREIGN_NODE_ID", message)
}

#[allow(dead_code)]
pub(crate) fn stale_node_id_error(message: impl Into<String>) -> NativeError {
    coded_error("ERR_TAFFY_STALE_NODE_ID", message)
}

#[allow(dead_code)]
pub(crate) fn invalid_topology_error(message: impl Into<String>) -> NativeError {
    coded_error("ERR_TAFFY_INVALID_TOPOLOGY", message)
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
                NativeErrorKind::TypeError => env.throw_type_error(&error.message, error.code),
            }?;
            Err(Error::new(Status::PendingException, error.message))
        }
    }
}
