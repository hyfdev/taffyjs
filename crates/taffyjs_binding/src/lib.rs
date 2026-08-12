#![deny(clippy::all)]

use napi_derive::napi;
use taffy as _;

// napi-rs only emits its platform loader when the native metadata contains an
// export. This private sentinel keeps the M0 loader generated without adding a
// supported package export; the real private owner replaces it in M1.
#[napi(js_name = "__nativeModuleLoaded")]
pub fn native_module_loaded() -> bool {
    true
}
