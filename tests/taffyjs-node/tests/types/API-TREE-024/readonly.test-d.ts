import { Display, Dimension, TaffyTree, type NodeId } from "@taffyjs/node";

declare const node: NodeId;

const style = new TaffyTree().getStyle(node);

// @ts-expect-error Style fields are readonly.
style.display = Display.None;
// @ts-expect-error Nested geometry fields are readonly.
style.size.width = Dimension.Length(10);
// @ts-expect-error Tagged output payloads are readonly.
style.size.width.value = 10;
// @ts-expect-error Output arrays are readonly.
style.gridTemplateRows.push({} as never);
// @ts-expect-error Nested output arrays are readonly.
style.gridTemplateRowNames[0][0] = "changed";
