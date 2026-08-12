#![deny(clippy::all)]

mod available_space;
mod error;
mod generated_numeric;
mod geometry;
mod length;
mod number;
mod owner;

use error::into_napi;
use napi::Env;
use napi_derive::napi;
use owner::TreeOwner;

mod contract_tests;

#[napi]
pub struct NativeTaffyTree {
    owner: TreeOwner,
}

#[napi]
impl NativeTaffyTree {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            owner: TreeOwner::new(),
        }
    }

    #[napi(js_name = "rawNodeCount")]
    pub fn node_count(&self, env: Env, public_method: String) -> napi::Result<u32> {
        into_napi(
            env,
            self.owner
                .access(&public_method, |tree| Ok(tree.total_node_count() as u32)),
        )
    }
}

#[cfg(feature = "test-hooks")]
#[napi]
impl NativeTaffyTree {
    #[napi(js_name = "__triggerPanic")]
    pub fn trigger_panic(&self, env: Env) -> napi::Result<()> {
        into_napi(
            env,
            self.owner
                .access("__triggerPanic", |_| owner::injected_unexpected_panic()),
        )
    }
}

impl Default for NativeTaffyTree {
    fn default() -> Self {
        Self::new()
    }
}
