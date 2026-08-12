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

#[test]
#[allow(non_snake_case)]
fn contract__api_tree_031__direct_taffy_parity() {
    use taffy::TaffyTree;
    use taffy::geometry::Size;
    use taffy::style::{AvailableSpace, Dimension, Display, Float, Style};

    for (display, child_float) in [
        (Display::Flex, Float::None),
        (Display::Grid, Float::None),
        (Display::Block, Float::None),
        (Display::Block, Float::Left),
        (Display::FlowRoot, Float::None),
    ] {
        let mut tree: TaffyTree<()> = TaffyTree::new();
        let child = tree
            .new_leaf(Style {
                size: Size {
                    width: Dimension::length(30.0),
                    height: Dimension::length(10.0),
                },
                float: child_float,
                ..Style::default()
            })
            .unwrap();
        let root = tree
            .new_with_children(
                Style {
                    display,
                    size: Size {
                        width: Dimension::length(100.0),
                        height: Dimension::length(50.0),
                    },
                    ..Style::default()
                },
                &[child],
            )
            .unwrap();

        tree.compute_layout(
            root,
            Size {
                width: AvailableSpace::MaxContent,
                height: AvailableSpace::MaxContent,
            },
        )
        .unwrap();
        let root_layout = tree.unrounded_layout(root);
        assert_eq!(root_layout.location.x, 0.0);
        assert_eq!(root_layout.location.y, 0.0);
        assert_eq!(
            root_layout.size,
            Size {
                width: 100.0,
                height: 50.0
            }
        );
        assert_eq!(
            root_layout.content_size,
            Size {
                width: 30.0,
                height: 10.0
            }
        );
        let child_layout = tree.unrounded_layout(child);
        assert_eq!(child_layout.location.x, 0.0);
        assert_eq!(child_layout.location.y, 0.0);
        assert_eq!(
            child_layout.size,
            Size {
                width: 30.0,
                height: 10.0
            }
        );
    }

    let mut hidden_tree: TaffyTree<()> = TaffyTree::new();
    let hidden_child = hidden_tree
        .new_leaf(Style {
            size: Size {
                width: Dimension::length(30.0),
                height: Dimension::length(10.0),
            },
            ..Style::default()
        })
        .unwrap();
    let hidden_root = hidden_tree
        .new_with_children(
            Style {
                display: Display::None,
                size: Size {
                    width: Dimension::length(100.0),
                    height: Dimension::length(50.0),
                },
                ..Style::default()
            },
            &[hidden_child],
        )
        .unwrap();
    hidden_tree
        .compute_layout(
            hidden_root,
            Size {
                width: AvailableSpace::MaxContent,
                height: AvailableSpace::MaxContent,
            },
        )
        .unwrap();
    for node in [hidden_root, hidden_child] {
        let layout = hidden_tree.unrounded_layout(node);
        assert_eq!(layout.location.x, 0.0);
        assert_eq!(layout.location.y, 0.0);
        assert_eq!(layout.size, Size::ZERO);
        assert_eq!(layout.content_size, Size::ZERO);
    }

    let mut percentage_tree: TaffyTree<()> = TaffyTree::new();
    let percentage_child = percentage_tree
        .new_leaf(Style {
            size: Size {
                width: Dimension::percent(0.5),
                height: Dimension::length(80.0),
            },
            ..Style::default()
        })
        .unwrap();
    let percentage_root = percentage_tree
        .new_with_children(
            Style {
                display: Display::Block,
                size: Size {
                    width: Dimension::length(200.0),
                    height: Dimension::length(50.0),
                },
                ..Style::default()
            },
            &[percentage_child],
        )
        .unwrap();
    percentage_tree
        .compute_layout(
            percentage_root,
            Size {
                width: AvailableSpace::MaxContent,
                height: AvailableSpace::MaxContent,
            },
        )
        .unwrap();
    assert_eq!(
        percentage_tree.unrounded_layout(percentage_child).size,
        Size {
            width: 100.0,
            height: 80.0
        }
    );
    assert_eq!(
        percentage_tree
            .unrounded_layout(percentage_root)
            .content_size,
        Size {
            width: 100.0,
            height: 80.0
        }
    );
}
