import { TaffyTree, type NodeId, type StyleInput } from "@taffyjs/node";

declare const node: NodeId;

const tree = new TaffyTree();
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
