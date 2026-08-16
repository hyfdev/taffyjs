use napi::{Env, Error, Result, Status};

#[derive(Clone, Copy, Debug)]
enum BindingErrorKind {
    Error,
    RangeError,
    TypeError,
}

#[derive(Debug)]
pub(crate) struct BindingError {
    kind: BindingErrorKind,
    pub(crate) code: Option<&'static str>,
    message: String,
}

pub(crate) type BindingResult<T> = std::result::Result<T, BindingError>;

fn binding_error(
    kind: BindingErrorKind,
    code: Option<&'static str>,
    message: impl Into<String>,
) -> BindingError {
    BindingError {
        kind,
        code,
        message: message.into(),
    }
}

fn coded_error(code: &'static str, message: impl Into<String>) -> BindingError {
    binding_error(BindingErrorKind::Error, Some(code), message)
}

#[allow(dead_code)]
fn coded_range_error(code: &'static str, message: impl Into<String>) -> BindingError {
    binding_error(BindingErrorKind::RangeError, Some(code), message)
}

#[allow(dead_code)]
pub(crate) fn plain_error(message: impl Into<String>) -> BindingError {
    binding_error(BindingErrorKind::Error, None, message)
}

pub(crate) fn range_error(message: impl Into<String>) -> BindingError {
    binding_error(BindingErrorKind::RangeError, None, message)
}

pub(crate) fn type_error(message: impl Into<String>) -> BindingError {
    binding_error(BindingErrorKind::TypeError, None, message)
}

#[allow(dead_code)]
pub(crate) fn child_index_out_of_bounds_error(message: impl Into<String>) -> BindingError {
    coded_range_error("ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS", message)
}

#[allow(dead_code)]
pub(crate) fn invalid_node_id_error(message: impl Into<String>) -> BindingError {
    coded_error("ERR_TAFFY_INVALID_NODE_ID", message)
}

#[allow(dead_code)]
pub(crate) fn foreign_node_id_error(message: impl Into<String>) -> BindingError {
    coded_error("ERR_TAFFY_FOREIGN_NODE_ID", message)
}

#[allow(dead_code)]
pub(crate) fn stale_node_id_error(message: impl Into<String>) -> BindingError {
    coded_error("ERR_TAFFY_STALE_NODE_ID", message)
}

#[allow(dead_code)]
pub(crate) fn invalid_topology_error(message: impl Into<String>) -> BindingError {
    coded_error("ERR_TAFFY_INVALID_TOPOLOGY", message)
}

pub(crate) fn busy_error(public_method: &str) -> BindingError {
    coded_error(
        "ERR_TAFFY_TREE_BUSY",
        format!(
            "Cannot call {public_method} on this TaffyTree while it is computing layout from a measure callback"
        ),
    )
}

pub(crate) fn internal_error() -> BindingError {
    coded_error(
        "ERR_TAFFY_INTERNAL",
        "An unexpected internal Taffy error occurred",
    )
}

pub(crate) fn poisoned_error() -> BindingError {
    coded_error(
        "ERR_TAFFY_TREE_POISONED",
        "This TaffyTree cannot be used after an unexpected internal failure",
    )
}

pub(crate) fn into_napi<T>(env: Env, result: BindingResult<T>) -> Result<T> {
    match result {
        Ok(value) => Ok(value),
        Err(error) => {
            match error.kind {
                BindingErrorKind::Error => env.throw_error(&error.message, error.code),
                BindingErrorKind::RangeError => env.throw_range_error(&error.message, error.code),
                BindingErrorKind::TypeError => env.throw_type_error(&error.message, error.code),
            }?;
            Err(Error::new(Status::PendingException, error.message))
        }
    }
}
