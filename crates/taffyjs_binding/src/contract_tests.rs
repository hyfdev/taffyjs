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

#[test]
#[allow(non_snake_case)]
fn contract__type_measure_001__non_send() {
    use std::marker::PhantomData;

    use crate::measure::MeasureSession;

    struct Check<T: ?Sized>(PhantomData<T>);
    trait AmbiguousIfSend<Marker> {
        fn check() {}
    }
    impl<T: ?Sized> AmbiguousIfSend<()> for Check<T> {}
    impl<T: ?Sized + Send> AmbiguousIfSend<u8> for Check<T> {}

    let _ = <Check<MeasureSession<'static>> as AmbiguousIfSend<_>>::check;
}
