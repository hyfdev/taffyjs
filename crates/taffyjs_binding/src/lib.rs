#![deny(clippy::all)]

mod available_space;
mod detailed;
mod error;
mod generated_numeric;
mod geometry;
mod grid;
mod layout;
mod length;
mod measure;
mod number;
mod owner;
mod style;

use std::collections::HashSet;

use error::{
    NativeResult, child_index_out_of_bounds_error, internal_error, into_napi,
    invalid_topology_error, type_error,
};
use napi::bindgen_prelude::{BigInt, Function, Object, Unknown};
use napi::{Env, JsValue, Status, ValueType};
use napi_derive::napi;
use owner::TreeOwner;
use taffy::{NodeId, TraversePartialTree};

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

    #[napi(js_name = "rawEnableRounding")]
    pub fn enable_rounding(&self, env: Env, public_method: String) -> napi::Result<()> {
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                tree.enable_rounding();
                Ok(())
            }),
        )
    }

    #[napi(js_name = "rawDisableRounding")]
    pub fn disable_rounding(&self, env: Env, public_method: String) -> napi::Result<()> {
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                tree.disable_rounding();
                Ok(())
            }),
        )
    }

    #[napi(js_name = "rawNodeCount")]
    pub fn node_count(&self, env: Env, public_method: String) -> napi::Result<u32> {
        into_napi(
            env,
            self.owner
                .access(&public_method, |tree| Ok(tree.total_node_count() as u32)),
        )
    }

    #[napi(js_name = "rawChildCount")]
    pub fn child_count(
        &self,
        env: Env,
        parent: BigInt,
        public_method: String,
    ) -> napi::Result<f64> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let count = tree.child_count(parent);
                if count > 9_007_199_254_740_991usize {
                    return Err(internal_error());
                }
                Ok(count as f64)
            }),
        )
    }

    #[napi(js_name = "rawParent")]
    pub fn parent(
        &self,
        env: Env,
        node: BigInt,
        public_method: String,
    ) -> napi::Result<Option<BigInt>> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                Ok(tree
                    .parent(node)
                    .map(|parent| BigInt::from(u64::from(parent))))
            }),
        )
    }

    #[napi(js_name = "rawChildren")]
    pub fn children(
        &self,
        env: Env,
        parent: BigInt,
        public_method: String,
    ) -> napi::Result<Vec<BigInt>> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                tree.children(parent)
                    .map(|children| {
                        children
                            .into_iter()
                            .map(|child| BigInt::from(u64::from(child)))
                            .collect()
                    })
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawChildAtIndex")]
    pub fn child_at_index(
        &self,
        env: Env,
        parent: BigInt,
        index: Unknown<'_>,
        public_method: String,
    ) -> napi::Result<BigInt> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let index = into_napi(
            env,
            number::from_unknown(index, "Child index").and_then(number::to_safe_usize),
        )?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let child_count = tree.child_count(parent);
                if index >= child_count {
                    return Err(child_index_out_of_bounds_error(format!(
                        "Child index {index} is outside a list of {child_count} children"
                    )));
                }
                tree.child_at_index(parent, index)
                    .map(|child| BigInt::from(u64::from(child)))
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawAddChild")]
    pub fn add_child(
        &self,
        env: Env,
        parent: BigInt,
        child: BigInt,
        public_method: String,
    ) -> napi::Result<()> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let child = into_napi(env, raw_node_id(&child))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                validate_unattached_child(tree, parent, child)?;
                tree.add_child(parent, child).map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawInsertChildAtIndex")]
    pub fn insert_child_at_index(
        &self,
        env: Env,
        parent: BigInt,
        index: Unknown<'_>,
        child: BigInt,
        public_method: String,
    ) -> napi::Result<()> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let child = into_napi(env, raw_node_id(&child))?;
        let index = into_napi(
            env,
            number::from_unknown(index, "Child index").and_then(number::to_safe_usize),
        )?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let child_count = tree.child_count(parent);
                if index > child_count {
                    return Err(child_index_out_of_bounds_error(format!(
                        "Child index {index} is outside the insertion range for {child_count} children"
                    )));
                }
                validate_unattached_child(tree, parent, child)?;
                tree.insert_child_at_index(parent, index, child)
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawSetChildren")]
    pub fn set_children(
        &self,
        env: Env,
        parent: BigInt,
        children: Vec<BigInt>,
        public_method: String,
    ) -> napi::Result<()> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let children = into_napi(
            env,
            children
                .iter()
                .map(raw_node_id)
                .collect::<NativeResult<Vec<_>>>(),
        )?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let mut unique_children = HashSet::with_capacity(children.len());
                for child in &children {
                    if !unique_children.insert(*child) {
                        return Err(invalid_topology_error(
                            "Children must not contain duplicates",
                        ));
                    }
                    if *child == parent {
                        return Err(invalid_topology_error("A node cannot be its own child"));
                    }
                    if would_create_cycle(tree, parent, *child) {
                        return Err(invalid_topology_error(
                            "Setting these children would create a cycle",
                        ));
                    }
                }
                tree.set_children(parent, &children)
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawRemoveChild")]
    pub fn remove_child(
        &self,
        env: Env,
        parent: BigInt,
        child: BigInt,
        public_method: String,
    ) -> napi::Result<()> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let child = into_napi(env, raw_node_id(&child))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                if tree.parent(child) != Some(parent) {
                    return Err(invalid_topology_error(
                        "Node is not a direct child of parent",
                    ));
                }
                tree.remove_child(parent, child)
                    .map(|_| ())
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawRemoveChildAtIndex")]
    pub fn remove_child_at_index(
        &self,
        env: Env,
        parent: BigInt,
        index: Unknown<'_>,
        public_method: String,
    ) -> napi::Result<BigInt> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let index = into_napi(
            env,
            number::from_unknown(index, "Child index").and_then(number::to_safe_usize),
        )?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let child_count = tree.child_count(parent);
                if index >= child_count {
                    return Err(child_index_out_of_bounds_error(format!(
                        "Child index {index} is outside a list of {child_count} children"
                    )));
                }
                tree.remove_child_at_index(parent, index)
                    .map(|child| BigInt::from(u64::from(child)))
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawRemoveChildrenRange")]
    pub fn remove_children_range(
        &self,
        env: Env,
        parent: BigInt,
        range: Unknown<'_>,
        public_method: String,
    ) -> napi::Result<()> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let (start, end) = into_napi(env, child_range(range))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let child_count = tree.child_count(parent);
                if start > end || end > child_count {
                    return Err(error::range_error(format!(
                        "Child range {start}..{end} is outside a list of {child_count} children"
                    )));
                }
                tree.remove_children_range(parent, start..end)
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawReplaceChildAtIndex")]
    pub fn replace_child_at_index(
        &self,
        env: Env,
        parent: BigInt,
        index: Unknown<'_>,
        new_child: BigInt,
        public_method: String,
    ) -> napi::Result<BigInt> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let new_child = into_napi(env, raw_node_id(&new_child))?;
        let index = into_napi(
            env,
            number::from_unknown(index, "Child index").and_then(number::to_safe_usize),
        )?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let child_count = tree.child_count(parent);
                if index >= child_count {
                    return Err(child_index_out_of_bounds_error(format!(
                        "Child index {index} is outside a list of {child_count} children"
                    )));
                }
                let old_child = tree
                    .child_at_index(parent, index)
                    .map_err(|_| internal_error())?;
                if old_child == new_child {
                    return Ok(BigInt::from(u64::from(old_child)));
                }
                validate_unattached_child(tree, parent, new_child)?;
                tree.replace_child_at_index(parent, index, new_child)
                    .map(|child| BigInt::from(u64::from(child)))
                    .map_err(|_| internal_error())
            }),
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

    #[napi(js_name = "rawNewLeafWithContext")]
    pub fn new_leaf_with_context(
        &self,
        env: Env,
        style: Unknown<'_>,
        has_context: bool,
        public_method: String,
    ) -> napi::Result<BigInt> {
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let style = style::input(style)?;
                let node = if has_context {
                    tree.new_leaf_with_context(style, ())
                } else {
                    tree.new_leaf(style)
                };
                node.map(|node| BigInt::from(u64::from(node)))
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawNewWithChildren")]
    pub fn new_with_children(
        &self,
        env: Env,
        style: Unknown<'_>,
        children: Vec<BigInt>,
        public_method: String,
    ) -> napi::Result<BigInt> {
        let children = into_napi(
            env,
            children
                .iter()
                .map(raw_node_id)
                .collect::<NativeResult<Vec<_>>>(),
        )?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                let style = style::input(style)?;
                let mut unique_children = HashSet::with_capacity(children.len());
                for child in &children {
                    if !unique_children.insert(*child) {
                        return Err(invalid_topology_error(
                            "Children must not contain duplicates",
                        ));
                    }
                    if tree.parent(*child).is_some() {
                        return Err(invalid_topology_error(
                            "Child is already attached to a parent",
                        ));
                    }
                }
                tree.new_with_children(style, &children)
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

    #[napi(js_name = "rawSetNodeContext")]
    pub fn set_node_context(
        &self,
        env: Env,
        node: BigInt,
        has_context: bool,
        public_method: String,
    ) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                tree.set_node_context(node, has_context.then_some(()))
                    .map_err(|_| internal_error())
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

    #[napi(js_name = "rawGetUnroundedLayout")]
    pub fn get_unrounded_layout<'env>(
        &self,
        env: Env,
        node: BigInt,
        public_method: String,
    ) -> napi::Result<Object<'env>> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access(&public_method, |tree| {
                layout::output(&env, tree.unrounded_layout(node)).map_err(|_| internal_error())
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

    #[napi(js_name = "rawComputeLayoutWithMeasure")]
    pub fn compute_layout_with_measure<'env>(
        &self,
        env: Env,
        node: BigInt,
        available_space: Unknown<'env>,
        measure: Function<'env, Object<'env>, Unknown<'env>>,
        public_method: String,
    ) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        let mut session = measure::MeasureSession::new(env, measure);
        let result = self.owner.access(&public_method, |tree| {
            let available_space =
                geometry::size(available_space, available_space::available_space)?;
            tree.compute_layout_with_measure(
                node,
                available_space,
                |known_dimensions, available_space, node, _context, style| {
                    session.invoke(known_dimensions, available_space, node, style)
                },
            )
            .map_err(|_| internal_error())?;
            if session.has_failed() {
                measure::invalidate_subtree(tree, node)?;
            }
            Ok(())
        });
        into_napi(env, result)?;
        match session.take_failure() {
            None => Ok(()),
            Some(measure::MeasureFailure::Callback(value)) => {
                env.throw(value)?;
                Err(napi::Error::new(
                    Status::PendingException,
                    "Measure callback threw",
                ))
            }
            Some(measure::MeasureFailure::Native(error)) => into_napi(env, Err(error)),
        }
    }
}

fn raw_node_id(value: &BigInt) -> NativeResult<NodeId> {
    let (negative, value, lossless) = value.get_u64();
    if negative || !lossless {
        return Err(type_error("Raw node ID must be a non-negative u64 bigint"));
    }
    Ok(NodeId::from(value))
}

fn child_range(value: Unknown<'_>) -> NativeResult<(usize, usize)> {
    if value
        .get_type()
        .map_err(|_| type_error("Expected a child range object"))?
        != ValueType::Object
    {
        return Err(type_error("Expected a child range object"));
    }
    let object = unsafe {
        value
            .cast::<Object<'_>>()
            .map_err(|_| type_error("Expected a child range object"))?
    };
    if object
        .is_array()
        .map_err(|_| type_error("Expected a child range object"))?
    {
        return Err(type_error("Expected a child range object"));
    }

    let read_bound = |name: &str| -> NativeResult<usize> {
        let value = object
            .get::<Unknown<'_>>(name)
            .map_err(|_| type_error(format!("Could not read child range {name}")))?
            .ok_or_else(|| type_error(format!("Child range {name} is required")))?;
        number::from_unknown(value, &format!("Child range {name}")).and_then(number::to_safe_usize)
    };

    Ok((read_bound("start")?, read_bound("end")?))
}

fn validate_unattached_child(
    tree: &taffy::TaffyTree<()>,
    parent: NodeId,
    child: NodeId,
) -> NativeResult<()> {
    if parent == child {
        return Err(invalid_topology_error("A node cannot be its own child"));
    }
    if tree.parent(child).is_some() {
        return Err(invalid_topology_error(
            "Child is already attached to a parent",
        ));
    }

    if would_create_cycle(tree, parent, child) {
        return Err(invalid_topology_error(
            "Adding this child would create a cycle",
        ));
    }
    Ok(())
}

fn would_create_cycle(tree: &taffy::TaffyTree<()>, parent: NodeId, child: NodeId) -> bool {
    let mut ancestor = Some(parent);
    while let Some(node) = ancestor {
        if node == child {
            return true;
        }
        ancestor = tree.parent(node);
    }
    false
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
