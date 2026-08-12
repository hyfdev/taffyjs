import { TaffyTree, type NodeId } from "@taffyjs/node";

type Context = { value: number };
declare const node: NodeId;

const tree = new TaffyTree<Context>();
const context = tree.getNodeContext(node);
const optional: Context | undefined = context;
if (context !== undefined) context.value += 1;

const defaulted: unknown = new TaffyTree().getNodeContext(node);

// @ts-expect-error Absence is represented by undefined.
const required: Context = context;

void [optional, defaulted, required];
