import { TaffyTree, type NodeId } from "@taffyjs/node";

declare const node: NodeId;

const parent = new TaffyTree().getParent(node);
const nullable: NodeId | null = parent;

if (parent !== null) {
  const narrowed: NodeId = parent;
  void narrowed;
}

// @ts-expect-error Parent absence is null, not undefined.
const absent: undefined = parent;

void [nullable, absent];
