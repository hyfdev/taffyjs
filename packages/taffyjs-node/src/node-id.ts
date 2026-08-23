declare const phantomMarker: unique symbol;

/** Identifies a live node within the TaffyTree that returned it. */
export type NodeId = bigint & { readonly [phantomMarker]: never };

const U64_MAX = (1n << 64n) - 1n;

export function toRawNodeId(value: unknown): bigint {
  if (typeof value !== "bigint" || value < 0n || value > U64_MAX) {
    throw new TypeError("NodeId must be a non-negative u64 bigint");
  }
  return value;
}
