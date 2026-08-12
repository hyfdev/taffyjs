import type { NodeId } from "@taffyjs/node";

declare const node: NodeId;

const primitive: bigint = node;
const map = new Map<NodeId, string>([[node, "node"]]);
const set = new Set<NodeId>([node]);
const list: readonly NodeId[] = [node];

// @ts-expect-error A plain bigint is not a NodeId.
const forged: NodeId = 1n;
// @ts-expect-error Arithmetic produces a plain bigint rather than a NodeId.
const changed: NodeId = node + 1n;

void [primitive, map, set, list, forged, changed];
