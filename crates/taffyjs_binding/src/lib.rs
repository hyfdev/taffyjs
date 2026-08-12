#![deny(clippy::all)]

mod available_space;
mod detailed;
mod error;
mod generated_numeric;
mod geometry;
mod grid;
mod layout;
mod length;
mod number;
mod owner;
mod style;

use error::{NativeResult, internal_error, into_napi, type_error};
use napi::Env;
use napi::bindgen_prelude::{BigInt, Object, Unknown};
use napi_derive::napi;
use owner::TreeOwner;
use taffy::NodeId;

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

    #[napi(js_name = "rawClear")]
    pub fn clear(&self, env: Env, public_method: String) -> napi::Result<()> {
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                tree.clear();
                Ok(())
            }),
        )
    }

    #[napi(js_name = "rawNewLeaf")]
    pub fn new_leaf(
        &self,
        env: Env,
        style: Unknown<'_>,
        public_method: String,
    ) -> napi::Result<BigInt> {
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let style = style::input(style)?;
                tree.new_leaf(style)
                    .map(|node| BigInt::from(u64::from(node)))
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawSetStyle")]
    pub fn set_style(
        &self,
        env: Env,
        node: BigInt,
        style: Unknown<'_>,
        public_method: String,
    ) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let style = style::input(style)?;
                tree.set_style(node, style).map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawGetStyle")]
    pub fn get_style<'env>(
        &self,
        env: Env,
        node: BigInt,
        public_method: String,
    ) -> napi::Result<Object<'env>> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let value = tree.style(node).map_err(|_| internal_error())?;
                style::output(&env, value).map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawComputeLayout")]
    pub fn compute_layout(
        &self,
        env: Env,
        node: BigInt,
        available_space: Unknown<'_>,
        public_method: String,
    ) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let available_space =
                    geometry::size(available_space, available_space::available_space)?;
                tree.compute_layout(node, available_space)
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawGetLayout")]
    pub fn get_layout<'env>(
        &self,
        env: Env,
        node: BigInt,
        public_method: String,
    ) -> napi::Result<Object<'env>> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let value = tree.layout(node).map_err(|_| internal_error())?;
                layout::output(&env, value).map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawGetDetailedLayoutInfo")]
    pub fn get_detailed_layout_info<'env>(
        &self,
        env: Env,
        node: BigInt,
        public_method: String,
    ) -> napi::Result<Object<'env>> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                detailed::output(&env, tree.detailed_layout_info(node))
                    .map_err(|_| internal_error())
            }),
        )
    }
}

fn raw_node_id(value: &BigInt) -> NativeResult<NodeId> {
    let (negative, value, lossless) = value.get_u64();
    if negative || !lossless {
        return Err(type_error("Raw node ID must be a non-negative u64 bigint"));
    }
    Ok(NodeId::from(value))
}

#[cfg(feature = "test-hooks")]
#[napi]
impl NativeTaffyTree {
    #[napi(js_name = "__layoutWithOrder")]
    pub fn layout_with_order(&self, env: Env, order: u32) -> napi::Result<Object<'_>> {
        layout::output(&env, &taffy::Layout::with_order(order))
    }

    #[napi(js_name = "__triggerError")]
    pub fn trigger_error(&self, env: Env, condition: String) -> napi::Result<()> {
        let error = match condition.as_str() {
            "wrong-type-or-shape" | "node-id-not-bigint" => error::type_error("Test type error"),
            "discrete-range-or-enum" | "node-id-serial-exhaustion" => {
                error::range_error("Test range error")
            }
            "child-index-out-of-bounds" => {
                error::child_index_out_of_bounds_error("Test child index error")
            }
            "malformed-node-id" => error::invalid_node_id_error("Test invalid node ID"),
            "foreign-node-id" => error::foreign_node_id_error("Test foreign node ID"),
            "stale-node-id" => error::stale_node_id_error("Test stale node ID"),
            "random-source-failure" => error::plain_error("Test random source error"),
            "invalid-topology" => error::invalid_topology_error("Test topology error"),
            _ => error::type_error("Unknown test error condition"),
        };
        into_napi(env, Err(error))
    }

    #[napi(js_name = "__throwValue")]
    pub fn throw_value(&self, env: Env, value: Unknown<'_>) -> napi::Result<()> {
        env.throw(value)?;
        Err(napi::Error::new(
            napi::Status::PendingException,
            "Callback threw",
        ))
    }

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
