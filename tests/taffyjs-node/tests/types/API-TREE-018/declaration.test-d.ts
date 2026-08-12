import { TaffyTree, type NodeId } from "@taffyjs/node";

declare const parent: NodeId;

const child: NodeId = new TaffyTree().getChildAtIndex(parent, 0);

// @ts-expect-error The index must be a number.
new TaffyTree().getChildAtIndex(parent, 0n);

void child;
