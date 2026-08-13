import {
  AvailableSpace,
  Dimension,
  GridPlacement,
  GridTemplateComponent,
  RepetitionCount,
  TrackSizingKind,
  TrackSizingFunction,
  type DetailedGridInfo,
  type Layout,
  type MeasureArgs,
  type NodeId,
  type Style,
  type StyleInput,
} from "@taffyjs/node";

const length = Dimension.Length(10);
length.value = 20;
const definite = AvailableSpace.Definite(30);
definite.value = 40;
const track = TrackSizingFunction.Fr(1);
if (track.max.kind === TrackSizingKind.Fr) track.max.value = 2;
const repetition = GridTemplateComponent.Repeat(RepetitionCount.Count(2), [track], [["a"]]);
repetition.value.tracks.push(TrackSizingFunction.Auto);
repetition.value.lineNames[0].push("b");
const placement = GridPlacement.Line(1);
placement.index = 2;

const rows = [GridTemplateComponent.Single(track)];
const names = [["start"]];
const input: StyleInput = {
  size: { width: length },
  gridTemplateRows: rows,
  gridTemplateRowNames: names,
};
input.flexGrow = 1;
rows.push(GridTemplateComponent.Single(TrackSizingFunction.Fr(2)));
names[0].push("end");
(input.size as { width: { value: number } }).width.value = 50;

declare const style: Style;
declare const layout: Layout;
declare const detail: DetailedGridInfo;
declare const args: MeasureArgs<{ label: string }>;
declare const children: readonly NodeId[];

// @ts-expect-error Style fields are readonly.
style.flexGrow = 2;
// @ts-expect-error Nested Style geometry is readonly.
style.size.width = Dimension.Length(5);
// @ts-expect-error Tagged Style payloads are readonly.
style.size.width.value = 5;
// @ts-expect-error Style arrays are readonly.
style.gridTemplateRows.push(GridTemplateComponent.Single(track));
// @ts-expect-error Nested Style arrays are readonly.
style.gridTemplateRowNames[0][0] = "changed";
// @ts-expect-error Layout fields are readonly.
layout.order = 1;
// @ts-expect-error Nested Layout fields are readonly.
layout.size.width = 1;
// @ts-expect-error Detailed output arrays are readonly.
detail.rows.sizes.push(1);
// @ts-expect-error Detailed output fields are readonly.
detail.items[0].rowStart = 1;
// @ts-expect-error Callback arguments are readonly.
args.context = undefined;
// @ts-expect-error Callback Style output is recursively readonly.
args.style.margin.left = Dimension.Auto;
// @ts-expect-error Returned child arrays are readonly.
children.push(1n as NodeId);
// @ts-expect-error Constant helper values are readonly.
Dimension.Auto.unit = 0;
// @ts-expect-error Constant helper values are readonly.
AvailableSpace.MaxContent.kind = 0;

void [input, style, layout, detail, args, children];
