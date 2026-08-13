// @ts-expect-error The native class is not exported from the public package.
import { NativeTaffyTree } from "@taffyjs/node";
// @ts-expect-error Private package subpaths are not part of the public declaration surface.
import type * as privateNative from "@taffyjs/node/native.js";
import * as api from "@taffyjs/node";
import { TaffyTree, type NodeId } from "@taffyjs/node";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? true
    : false;
type Assert<Value extends true> = Value;
type PrivateRuntimeName = Extract<
  keyof typeof api,
  "NativeTaffyTree" | "parseNodeId" | "serializeNodeId" | "rawComputeLayout"
>;
type NoPrivateRuntimeExports = Assert<Equal<PrivateRuntimeName, never>>;

declare const tree: TaffyTree;
declare const node: NodeId;

// @ts-expect-error The raw native owner is private.
tree.rawComputeLayout(node, {});
// @ts-expect-error Internal registry state is private.
void tree.nodes;
// @ts-expect-error NodeId has no public parser.
api.parseNodeId(node);
// @ts-expect-error NodeId has no persistence API.
api.serializeNodeId(node);
// @ts-expect-error NodeId is a type only, not a runtime namespace.
void api.NodeId;

void NativeTaffyTree;
void (0 as unknown as typeof privateNative);
void (0 as unknown as NoPrivateRuntimeExports);
