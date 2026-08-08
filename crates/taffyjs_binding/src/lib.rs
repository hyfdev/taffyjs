#![deny(clippy::all)]

use napi_derive::napi;
use taffy as _;

#[napi(js_name = "__bootstrap")]
pub fn bootstrap() -> bool {
    true
}
