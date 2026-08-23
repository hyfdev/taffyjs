use std::cell::{Cell, RefCell};
use std::panic::{AssertUnwindSafe, catch_unwind};

use taffy::TaffyTree;

use crate::NodeMetadata;
use crate::error::{BindingResult, busy_error, internal_error, poisoned_error};

pub(crate) struct TreeOwner {
    tree: RefCell<TaffyTree<NodeMetadata>>,
    poisoned: Cell<bool>,
}

impl TreeOwner {
    pub(crate) fn new() -> Self {
        Self {
            tree: RefCell::new(TaffyTree::new()),
            poisoned: Cell::new(false),
        }
    }

    pub(crate) fn access<T>(
        &self,
        public_method: &str,
        operation: impl FnOnce(&mut TaffyTree<NodeMetadata>) -> BindingResult<T>,
    ) -> BindingResult<T> {
        if self.poisoned.get() {
            return Err(poisoned_error());
        }

        let mut tree = self
            .tree
            .try_borrow_mut()
            .map_err(|_| busy_error(public_method))?;
        // Taffy's high-level methods directly index SlotMaps in several paths. This boundary also
        // contains their panic when an unsupported forged, foreign, or stale raw NodeId misses.
        match catch_unwind(AssertUnwindSafe(|| operation(&mut tree))) {
            Ok(result) => result,
            Err(_) => {
                drop(tree);
                self.poisoned.set(true);
                Err(internal_error())
            }
        }
    }
}

#[cfg(test)]
pub(crate) fn injected_unexpected_panic() -> ! {
    panic!("injected unexpected panic")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn expected_error_does_not_poison_owner() {
        let owner = TreeOwner::new();
        let expected = owner.access("setStyle", |_| Err::<(), _>(busy_error("setStyle")));
        assert_eq!(expected.unwrap_err().code, Some("ERR_TAFFY_TREE_BUSY"));
        assert_eq!(
            owner
                .access("getNodeCount", |tree| Ok(tree.total_node_count()))
                .unwrap(),
            0
        );
    }

    #[test]
    fn panic_poisoning_prevents_later_access() {
        let owner = TreeOwner::new();
        let first = owner.access::<()>("test", |_| injected_unexpected_panic());
        assert_eq!(first.unwrap_err().code, Some("ERR_TAFFY_INTERNAL"));
        let second = owner.access("getNodeCount", |tree| Ok(tree.total_node_count()));
        assert_eq!(second.unwrap_err().code, Some("ERR_TAFFY_TREE_POISONED"));
    }

    #[test]
    fn invalid_taffy_node_panic_is_contained() {
        let owner = TreeOwner::new();
        let invalid = taffy::NodeId::from(0u64);
        let first = owner.access("getStyle", |tree| {
            tree.style(invalid)
                .map(|_| ())
                .map_err(|_| internal_error())
        });
        assert_eq!(first.unwrap_err().code, Some("ERR_TAFFY_INTERNAL"));

        let second = owner.access("getNodeCount", |tree| Ok(tree.total_node_count()));
        assert_eq!(second.unwrap_err().code, Some("ERR_TAFFY_TREE_POISONED"));
    }
}
