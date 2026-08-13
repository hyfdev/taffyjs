import { TaffyTree, type NodeId } from "@taffyjs/node";

declare const parent: NodeId;

const children = new TaffyTree().getChildren(parent);
const readonlyChildren: readonly NodeId[] = children;

// @ts-expect-error The returned array is readonly.
children.push(parent);
// @ts-expect-error Array elements cannot be replaced.
children[0] = parent;

void readonlyChildren;
