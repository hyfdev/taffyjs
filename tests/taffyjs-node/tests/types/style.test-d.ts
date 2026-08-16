import {
  AlignItems,
  Dimension,
  Display,
  GridPlacement,
  GridTemplateComponent,
  RepetitionCount,
  TaffyTree,
  TrackSizingFunction,
  type NodeId,
  type StyleInput,
  type StyleUpdate,
} from "@taffyjs/node";

declare const node: NodeId;
const track = TrackSizingFunction.Fr(2);
const mutableRows = [GridTemplateComponent.Single(track)];
const input: StyleInput = {
  display: Display.Grid,
  size: { width: 100, height: Dimension.Percent(50) },
  margin: Dimension.Auto,
  alignItems: AlignItems.Center,
  gridTemplateRows: mutableRows,
  gridTemplateColumns: [
    GridTemplateComponent.Repeat(RepetitionCount.Count(2), [track], [["start"], ["end"]]),
  ],
  gridRow: { start: GridPlacement.Line(1), end: GridPlacement.Span(2) },
  aspectRatio: null,
};
input.flexGrow = 1;
mutableRows.push(GridTemplateComponent.Single(TrackSizingFunction.Auto));

const tree = new TaffyTree();
tree.setStyle(node, input);
const output = tree.getStyle(node);
const reusable: StyleInput = {
  display: output.display,
  overflow: output.overflow,
  size: output.size,
  aspectRatio: output.aspectRatio,
  margin: output.margin,
  alignItems: output.alignItems,
  flexBasis: output.flexBasis,
  gridRow: output.gridRow,
};
tree.setStyle(node, reusable);
const update: StyleUpdate = {
  display: undefined,
  size: { width: 200 },
  gridAutoRows: [track],
};
tree.updateStyle(node, update);
tree.updateStyle(node, output);

// @ts-expect-error Unknown Style fields are rejected.
tree.newLeaf({ unknownField: true });
// @ts-expect-error Numeric families accept only their declared members.
tree.newLeaf({ display: 99 });
// @ts-expect-error A numeric length needs its value.
tree.newLeaf({ flexBasis: { unit: 0 } });
// @ts-expect-error Non-nullable Style fields reject null.
tree.newLeaf({ padding: null });
// @ts-expect-error Nullable Style output fields are never undefined.
const absentAspect: undefined = output.aspectRatio;
// @ts-expect-error Style fields are readonly.
output.display = Display.None;
// @ts-expect-error Nested output geometry is readonly.
output.size.width = Dimension.Length(10);
// @ts-expect-error Tagged output payloads are readonly.
output.size.width.value = 10;
// @ts-expect-error Output arrays are readonly.
output.gridTemplateRows.push(GridTemplateComponent.Single(track));
// @ts-expect-error Nested output arrays are readonly.
output.gridTemplateRowNames[0][0] = "changed";
// @ts-expect-error Tagged values remain complete inside a Style update.
tree.updateStyle(node, { flexBasis: { unit: 0 } });
// @ts-expect-error Complete records do not become recursively partial in a Style update.
tree.updateStyle(node, { gridTemplateAreas: { areas: [] } });

void [absentAspect];
