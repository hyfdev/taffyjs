#[test]
#[allow(non_snake_case)]
fn contract__infra_004__owner_shape() {
    use crate::NativeTaffyTree;

    fn accepts_shared_receiver(_: &NativeTaffyTree) {}

    let owner = NativeTaffyTree::new();
    accepts_shared_receiver(&owner);
    assert_eq!(
        owner
            .owner
            .access("getNodeCount", |tree| Ok(tree.total_node_count()))
            .unwrap(),
        0
    );
}
