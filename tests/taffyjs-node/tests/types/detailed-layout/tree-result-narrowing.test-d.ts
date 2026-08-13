import { DetailedLayoutInfoKind, TaffyTree, type NodeId } from "@taffyjs/node";

declare const node: NodeId;
const detail = new TaffyTree().getDetailedLayoutInfo(node);

if (detail.kind === DetailedLayoutInfoKind.Grid) {
  const rows: number = detail.value.rows.explicitTracks;
  const size: number | undefined = detail.value.columns.sizes[0];
  const rowStart: number | undefined = detail.value.items[0]?.rowStart;
  // @ts-expect-error Detailed track arrays are readonly.
  detail.value.rows.sizes.push(1);
  // @ts-expect-error Detailed item fields are readonly.
  detail.value.items[0]!.columnEnd = 2;
  void [rows, size, rowStart];
} else {
  const none: typeof DetailedLayoutInfoKind.None = detail.kind;
  // @ts-expect-error None has no value payload.
  void detail.value;
  void none;
}
