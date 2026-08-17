#![deny(clippy::all)]

mod available_space;
mod detailed;
mod error;
mod geometry;
mod grid;
mod js_object;
mod layout;
mod length;
mod measure;
mod number;
mod numeric;
mod owner;
mod style;
mod tagged_values;

use error::{
    BindingResult, child_index_out_of_bounds_error, internal_error, into_napi,
    invalid_topology_error, type_error,
};
use napi::bindgen_prelude::{BigInt, Function, Unknown};
use napi::{Env, Status};
use napi_derive::napi;
use owner::TreeOwner;
use std::collections::HashSet;
use taffy::{NodeId, TraversePartialTree};

const JS_MAX_SAFE_INTEGER: u64 = (1u64 << 53) - 1;

#[derive(Clone, Copy, Debug, Default)]
pub(crate) struct NodeMetadata {
    has_context: bool,
    has_measure: bool,
}

impl NodeMetadata {
    fn is_empty(self) -> bool {
        !self.has_context && !self.has_measure
    }
}

#[napi]
pub struct BindingTaffyTree {
    owner: TreeOwner,
}

#[napi(object, object_to_js = false)]
pub struct ChildRangeInput {
    pub start: f64,
    pub end: f64,
}

#[napi]
impl BindingTaffyTree {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            owner: TreeOwner::new(),
        }
    }

    #[napi(js_name = "rawEnableRounding")]
    pub fn enable_rounding(&self, env: Env) -> napi::Result<()> {
        into_napi(
            env,
            self.owner.access("enableRounding", |tree| {
                tree.enable_rounding();
                Ok(())
            }),
        )
    }

    #[napi(js_name = "rawDisableRounding")]
    pub fn disable_rounding(&self, env: Env) -> napi::Result<()> {
        into_napi(
            env,
            self.owner.access("disableRounding", |tree| {
                tree.disable_rounding();
                Ok(())
            }),
        )
    }

    #[napi(js_name = "rawGetNodeCount")]
    pub fn node_count(&self, env: Env) -> napi::Result<u32> {
        into_napi(
            env,
            self.owner
                .access("getNodeCount", |tree| Ok(tree.total_node_count() as u32)),
        )
    }

    #[napi(js_name = "rawGetChildCount")]
    pub fn child_count(&self, env: Env, parent: BigInt) -> napi::Result<f64> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        into_napi(
            env,
            self.owner.access("getChildCount", |tree| {
                let count =
                    u64::try_from(tree.child_count(parent)).map_err(|_| internal_error())?;
                if count > JS_MAX_SAFE_INTEGER {
                    return Err(internal_error());
                }
                Ok(count as f64)
            }),
        )
    }

    #[napi(js_name = "rawGetParent")]
    pub fn parent(&self, env: Env, node: BigInt) -> napi::Result<Option<BigInt>> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access("getParent", |tree| {
                Ok(tree
                    .parent(node)
                    .map(|parent| BigInt::from(u64::from(parent))))
            }),
        )
    }

    #[napi(js_name = "rawGetChildren")]
    pub fn children(&self, env: Env, parent: BigInt) -> napi::Result<Vec<BigInt>> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        into_napi(
            env,
            self.owner.access("getChildren", |tree| {
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

    #[napi(js_name = "rawGetChildAtIndex")]
    pub fn child_at_index(&self, env: Env, parent: BigInt, index: f64) -> napi::Result<BigInt> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let index = into_napi(env, number::to_safe_u64(index))?;
        into_napi(
            env,
            self.owner.access("getChildAtIndex", |tree| {
                let child_count = tree.child_count(parent);
                let child_count_u64 = u64::try_from(child_count).map_err(|_| internal_error())?;
                if index >= child_count_u64 {
                    return Err(child_index_out_of_bounds_error(format!(
                        "Child index {index} is outside a list of {child_count} children"
                    )));
                }
                let index = usize::try_from(index).map_err(|_| internal_error())?;
                tree.child_at_index(parent, index)
                    .map(|child| BigInt::from(u64::from(child)))
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawAddChild")]
    pub fn add_child(&self, env: Env, parent: BigInt, child: BigInt) -> napi::Result<()> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let child = into_napi(env, raw_node_id(&child))?;
        into_napi(
            env,
            self.owner.access("addChild", |tree| {
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
        index: f64,
        child: BigInt,
    ) -> napi::Result<()> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let child = into_napi(env, raw_node_id(&child))?;
        let index = into_napi(env, number::to_safe_u64(index))?;
        into_napi(
            env,
            self.owner.access("insertChildAtIndex", |tree| {
                let child_count = tree.child_count(parent);
                let child_count_u64 = u64::try_from(child_count).map_err(|_| internal_error())?;
                if index > child_count_u64 {
                    return Err(child_index_out_of_bounds_error(format!(
                        "Child index {index} is outside the insertion range for {child_count} children"
                    )));
                }
                let index = usize::try_from(index).map_err(|_| internal_error())?;
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
    ) -> napi::Result<()> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let children = into_napi(
            env,
            children
                .iter()
                .map(raw_node_id)
                .collect::<BindingResult<Vec<_>>>(),
        )?;
        into_napi(
            env,
            self.owner.access("setChildren", |tree| {
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
    pub fn remove_child(&self, env: Env, parent: BigInt, child: BigInt) -> napi::Result<()> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let child = into_napi(env, raw_node_id(&child))?;
        into_napi(
            env,
            self.owner.access("removeChild", |tree| {
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
        index: f64,
    ) -> napi::Result<BigInt> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let index = into_napi(env, number::to_safe_u64(index))?;
        into_napi(
            env,
            self.owner.access("removeChildAtIndex", |tree| {
                let child_count = tree.child_count(parent);
                let child_count_u64 = u64::try_from(child_count).map_err(|_| internal_error())?;
                if index >= child_count_u64 {
                    return Err(child_index_out_of_bounds_error(format!(
                        "Child index {index} is outside a list of {child_count} children"
                    )));
                }
                let index = usize::try_from(index).map_err(|_| internal_error())?;
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
        range: ChildRangeInput,
    ) -> napi::Result<()> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let (start, end) = into_napi(env, child_range(range))?;
        into_napi(
            env,
            self.owner.access("removeChildrenRange", |tree| {
                let child_count = tree.child_count(parent);
                let child_count_u64 = u64::try_from(child_count).map_err(|_| internal_error())?;
                if start > end || end > child_count_u64 {
                    return Err(error::range_error(format!(
                        "Child range {start}..{end} is outside a list of {child_count} children"
                    )));
                }
                let start = usize::try_from(start).map_err(|_| internal_error())?;
                let end = usize::try_from(end).map_err(|_| internal_error())?;
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
        index: f64,
        new_child: BigInt,
    ) -> napi::Result<BigInt> {
        let parent = into_napi(env, raw_node_id(&parent))?;
        let new_child = into_napi(env, raw_node_id(&new_child))?;
        let index = into_napi(env, number::to_safe_u64(index))?;
        into_napi(
            env,
            self.owner.access("replaceChildAtIndex", |tree| {
                let child_count = tree.child_count(parent);
                let child_count_u64 = u64::try_from(child_count).map_err(|_| internal_error())?;
                if index >= child_count_u64 {
                    return Err(child_index_out_of_bounds_error(format!(
                        "Child index {index} is outside a list of {child_count} children"
                    )));
                }
                let index = usize::try_from(index).map_err(|_| internal_error())?;
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

    #[napi(js_name = "rawRemove")]
    pub fn remove(&self, env: Env, node: BigInt) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access("remove", |tree| {
                tree.remove(node).map(|_| ()).map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawClear")]
    pub fn clear(&self, env: Env) -> napi::Result<()> {
        into_napi(
            env,
            self.owner.access("clear", |tree| {
                tree.clear();
                Ok(())
            }),
        )
    }

    #[napi(js_name = "rawNewLeaf")]
    pub fn new_leaf(&self, env: Env, style: Unknown<'_>) -> napi::Result<BigInt> {
        let style = into_napi(env, style::input(style))?;
        into_napi(
            env,
            self.owner.access("newLeaf", |tree| {
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
    ) -> napi::Result<BigInt> {
        let style = into_napi(env, style::input(style))?;
        into_napi(
            env,
            self.owner.access("newLeafWithContext", |tree| {
                let node = if has_context {
                    tree.new_leaf_with_context(
                        style,
                        NodeMetadata {
                            has_context: true,
                            has_measure: false,
                        },
                    )
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
    ) -> napi::Result<BigInt> {
        let children = into_napi(
            env,
            children
                .iter()
                .map(raw_node_id)
                .collect::<BindingResult<Vec<_>>>(),
        )?;
        let style = into_napi(env, style::input(style))?;
        into_napi(
            env,
            self.owner.access("newWithChildren", |tree| {
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
    pub fn set_style(&self, env: Env, node: BigInt, style: Unknown<'_>) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        let style = into_napi(env, style::input(style))?;
        into_napi(
            env,
            self.owner.access("setStyle", |tree| {
                tree.set_style(node, style).map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawUpdateStyle")]
    pub fn update_style(&self, env: Env, node: BigInt, update: Unknown<'_>) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        let update = into_napi(env, style::patch(update))?;
        into_napi(
            env,
            self.owner.access("updateStyle", |tree| {
                let current = tree.style(node).map_err(|_| internal_error())?;
                let Some(updated) = style::apply_patch(current, update)? else {
                    return Ok(());
                };
                tree.set_style(node, updated).map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawSetNodeContext")]
    pub fn set_node_context(&self, env: Env, node: BigInt, has_context: bool) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access("setNodeContext", |tree| {
                set_node_metadata(tree, node, |metadata| {
                    metadata.has_context = has_context;
                })
            }),
        )
    }

    #[napi(js_name = "rawSetMeasure")]
    pub fn set_measure(&self, env: Env, node: BigInt, has_measure: bool) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access("setMeasure", |tree| {
                set_node_metadata(tree, node, |metadata| {
                    metadata.has_measure = has_measure;
                })
            }),
        )
    }

    #[napi(js_name = "rawGetStyle")]
    pub fn get_style(&self, env: Env, node: BigInt) -> napi::Result<style::StyleOutput> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access("getStyle", |tree| {
                let value = tree.style(node).map_err(|_| internal_error())?;
                Ok(style::output(value))
            }),
        )
    }

    #[napi(js_name = "rawComputeLayout")]
    pub fn compute_layout(
        &self,
        env: Env,
        node: BigInt,
        available_space: Unknown<'_>,
    ) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        let available_space = into_napi(
            env,
            geometry::size(available_space, available_space::available_space),
        )?;
        into_napi(
            env,
            self.owner.access("computeLayout", |tree| {
                tree.compute_layout(node, available_space)
                    .map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawGetLayout")]
    pub fn get_layout(&self, env: Env, node: BigInt) -> napi::Result<layout::LayoutOutput> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access("getLayout", |tree| {
                let value = tree.layout(node).map_err(|_| internal_error())?;
                Ok(layout::output(value))
            }),
        )
    }

    #[napi(js_name = "rawGetUnroundedLayout")]
    pub fn get_unrounded_layout(
        &self,
        env: Env,
        node: BigInt,
    ) -> napi::Result<layout::LayoutOutput> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access("getUnroundedLayout", |tree| {
                Ok(layout::output(tree.unrounded_layout(node)))
            }),
        )
    }

    #[napi(js_name = "rawGetDetailedLayoutInfo")]
    pub fn get_detailed_layout_info(
        &self,
        env: Env,
        node: BigInt,
    ) -> napi::Result<detailed::DetailedLayoutOutput> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access("getDetailedLayoutInfo", |tree| {
                Ok(detailed::output(tree.detailed_layout_info(node)))
            }),
        )
    }

    #[napi(js_name = "rawMarkDirty")]
    pub fn mark_dirty(&self, env: Env, node: BigInt) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access("markDirty", |tree| {
                tree.mark_dirty(node).map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawIsDirty")]
    pub fn is_dirty(&self, env: Env, node: BigInt) -> napi::Result<bool> {
        let node = into_napi(env, raw_node_id(&node))?;
        into_napi(
            env,
            self.owner.access("isDirty", |tree| {
                tree.dirty(node).map_err(|_| internal_error())
            }),
        )
    }

    #[napi(js_name = "rawComputeLayoutWithMeasure")]
    pub fn compute_layout_with_measure<'env>(
        &self,
        env: Env,
        node: BigInt,
        available_space: Unknown<'env>,
        measure: Function<'env, measure::MeasureArguments<'env>, Unknown<'env>>,
        has_global_measure: bool,
    ) -> napi::Result<()> {
        let node = into_napi(env, raw_node_id(&node))?;
        let available_space = into_napi(
            env,
            geometry::size(available_space, available_space::available_space),
        )?;
        let mut session = measure::MeasureSession::new(env, measure);
        let result = self.owner.access("computeLayout", |tree| {
            tree.compute_layout_with_measure(
                node,
                available_space,
                |known_dimensions, available_space, node, metadata, style| {
                    let has_node_measure = metadata.is_some_and(|metadata| metadata.has_measure);
                    if has_node_measure || has_global_measure {
                        session.invoke(known_dimensions, available_space, node, style)
                    } else {
                        taffy::geometry::Size::ZERO
                    }
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
            Some(measure::MeasureFailure::Binding(error)) => into_napi(env, Err(error)),
        }
    }
}

fn set_node_metadata(
    tree: &mut taffy::TaffyTree<NodeMetadata>,
    node: NodeId,
    update: impl FnOnce(&mut NodeMetadata),
) -> BindingResult<()> {
    let mut metadata = tree.get_node_context(node).copied().unwrap_or_default();
    update(&mut metadata);
    tree.set_node_context(node, (!metadata.is_empty()).then_some(metadata))
        .map_err(|_| internal_error())
}

fn raw_node_id(value: &BigInt) -> BindingResult<NodeId> {
    let (negative, value, lossless) = value.get_u64();
    if negative || !lossless {
        return Err(type_error("Raw node ID must be a non-negative u64 bigint"));
    }
    Ok(NodeId::from(value))
}

fn child_range(input: ChildRangeInput) -> BindingResult<(u64, u64)> {
    Ok((
        number::to_safe_u64(input.start)?,
        number::to_safe_u64(input.end)?,
    ))
}

fn validate_unattached_child(
    tree: &taffy::TaffyTree<NodeMetadata>,
    parent: NodeId,
    child: NodeId,
) -> BindingResult<()> {
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

fn would_create_cycle(
    tree: &taffy::TaffyTree<NodeMetadata>,
    parent: NodeId,
    child: NodeId,
) -> bool {
    let mut ancestor = Some(parent);
    while let Some(node) = ancestor {
        if node == child {
            return true;
        }
        ancestor = tree.parent(node);
    }
    false
}

impl Default for BindingTaffyTree {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use taffy::TaffyTree;
    use taffy::style::Style;

    use super::{NodeMetadata, set_node_metadata};

    #[test]
    fn context_and_measure_metadata_are_independent() {
        let mut tree = TaffyTree::new();
        let node = tree
            .new_leaf_with_context(
                Style::default(),
                NodeMetadata {
                    has_context: true,
                    has_measure: false,
                },
            )
            .unwrap();

        set_node_metadata(&mut tree, node, |metadata| metadata.has_measure = true).unwrap();
        let metadata = tree.get_node_context(node).unwrap();
        assert!(metadata.has_context);
        assert!(metadata.has_measure);

        set_node_metadata(&mut tree, node, |metadata| metadata.has_context = false).unwrap();
        let metadata = tree.get_node_context(node).unwrap();
        assert!(!metadata.has_context);
        assert!(metadata.has_measure);

        set_node_metadata(&mut tree, node, |metadata| metadata.has_measure = false).unwrap();
        assert!(tree.get_node_context(node).is_none());
    }
}
