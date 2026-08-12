use crate::NativeTaffyTree;

#[test]
fn contract__infra_004__owner_shape() {
    fn accepts_shared_receiver(_: &NativeTaffyTree) {}

    let owner = NativeTaffyTree::new();
    accepts_shared_receiver(&owner);
    assert_eq!(owner.node_count("getNodeCount".to_owned()).unwrap(), 0);
}
