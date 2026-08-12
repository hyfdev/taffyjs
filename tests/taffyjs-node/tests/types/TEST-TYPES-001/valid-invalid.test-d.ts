import {
  AlignContent,
  AlignItems,
  AvailableSpace,
  Dimension,
  Display,
  GridPlacement,
  GridTemplateComponent,
  RepetitionCount,
  TaffyTree,
  TrackSizingFunction,
  type GridPlacementInput,
  type NodeId,
  type StyleInput,
} from "@taffyjs/node";

type Context = { label: string };
declare const node: NodeId;
const track = TrackSizingFunction.Fr(2);
const placement: GridPlacementInput = GridPlacement.NamedLine("content", -1);
const style: StyleInput = {
  display: Display.Grid,
  size: { width: Dimension.Length(100), height: Dimension.Percent(50) },
  margin: Dimension.Auto,
  alignItems: AlignItems.Center,
  justifyContent: AlignContent.SpaceBetween,
  gridTemplateRows: [GridTemplateComponent.Single(track)],
  gridTemplateColumns: [
    GridTemplateComponent.Repeat(RepetitionCount.Count(2), [track], [["start"], ["end"]]),
  ],
  gridRow: { start: placement, end: GridPlacement.Span(2) },
};
const tree = new TaffyTree<Context>();
const leaf = tree.newLeaf(style);
const measured = tree.newLeafWithContext({}, { label: "measured" });
const root = tree.newWithChildren({}, [leaf, measured] as const);
tree.setStyle(leaf, { display: undefined, aspectRatio: null });
tree.setNodeContext(measured, undefined);
tree.addChild(tree.newLeaf({}), tree.newLeaf({}));
tree.insertChildAtIndex(tree.newLeaf({}), 0, tree.newLeaf({}));
tree.setChildren(tree.newLeaf({}), []);
tree.removeChildrenRange(root, { start: 0, end: 1 });
tree.computeLayout({
  root,
  availableSpace: { width: AvailableSpace.Definite(200), height: AvailableSpace.MaxContent },
});
tree.computeLayoutWithMeasure({
  root,
  availableSpace: { width: AvailableSpace.MinContent, height: AvailableSpace.MaxContent },
  measure: ({ context, node: measuredNode, style: measuredStyle }) => {
    const maybeContext: Context | undefined = context;
    const publicNode: NodeId = measuredNode;
    const grow: number = measuredStyle.flexGrow;
    void [maybeContext, publicNode, grow];
    return { width: 20, height: 10 };
  },
});

// @ts-expect-error The constructor has no public options argument.
new TaffyTree({});
// @ts-expect-error A plain bigint is not a NodeId.
tree.remove(1n);
// @ts-expect-error Style must be an object.
tree.newLeaf(null);
// @ts-expect-error Unknown Style fields are rejected.
tree.newLeaf({ unknownField: true });
// @ts-expect-error Numeric enum values are limited to declared members.
tree.newLeaf({ display: 99 });
// @ts-expect-error A length value requires its numeric payload.
tree.newLeaf({ size: { width: { unit: 0 } } });
// @ts-expect-error Context values must match the tree generic.
tree.newLeafWithContext({}, { other: true });
// @ts-expect-error Compute space requires both axes.
tree.computeLayout({ root: node, availableSpace: { width: AvailableSpace.MaxContent } });
tree.computeLayoutWithMeasure({
  root: node,
  availableSpace: { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent },
  // @ts-expect-error A measure result must include both numeric axes synchronously.
  measure: () => Promise.resolve({ width: 1, height: 2 }),
});
// @ts-expect-error A child range requires its end.
tree.removeChildrenRange(node, { start: 0 });
// @ts-expect-error Grid line indices are numbers.
const invalidPlacement: GridPlacementInput = { kind: 1, index: "1" };

void invalidPlacement;
