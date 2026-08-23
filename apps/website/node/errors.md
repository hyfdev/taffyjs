# Errors

The binding uses ordinary JavaScript error classes and adds stable `code` values where callers need to distinguish a specific tree failure.

## Coded errors

| Code                                  | Error class  | Meaning                                                                                                   |
| ------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| `ERR_TAFFY_TREE_BUSY`                 | `Error`      | A native-backed method was called on the same tree from its measure callback.                             |
| `ERR_TAFFY_INVALID_TOPOLOGY`          | `Error`      | The requested relationship would duplicate, reattach, self-parent, or cycle nodes, or remove a non-child. |
| `ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS` | `RangeError` | A valid integer index is outside the current child list.                                                  |

The code is available as an own property on the thrown error:

```ts
try {
  tree.addChild(parent, child);
} catch (error) {
  if (error instanceof Error && "code" in error && error.code === "ERR_TAFFY_INVALID_TOPOLOGY") {
    // The child is already attached, would introduce a cycle, or otherwise violates topology.
  } else {
    throw error;
  }
}
```

## JavaScript error classes

`TypeError` reports the wrong JavaScript type or object shape, such as a NodeId that is not a bigint in the `u64` range, an incomplete available-space record, an unknown component in a partial geometry record, or a non-function measure callback.

`RangeError` reports a numeric value that cannot represent the requested public value, such as an unknown numeric-family code, a fractional child index, an out-of-range Grid line, or an invalid child range. The out-of-bounds child-index case also carries the code shown above.

Other Taffy operation failures use `Error`. Check a documented code when the program can recover from that specific condition; do not parse message text.

## Failed mutations

Inputs are converted and validated before a mutation reaches the tree. A rejected node creation does not consume a public node ID or add a node. A rejected style replacement or partial update leaves the old style and dirty state unchanged. A rejected topology operation leaves the previous parents, child order, contexts, and node count unchanged.

NodeId representation errors fail before the requested operation changes either the JavaScript wrapper or native tree.

## NodeId precondition

A NodeId must still be live and must be used only with the `TaffyTree` that returned it. The binding deliberately does not authenticate issuance, ownership, or liveness. Independent trees may issue equal raw keys, so a foreign key can address a numerically matching node in the receiving tree. A forged, foreign, or stale in-range key that does not match can encounter Taffy's invalid-key behavior; no stable error class or code is promised for this unsupported call.

Native tree operations contain unexpected Rust panics so they cannot unwind through Node-API. Containment may make the affected tree unusable. It is a final process-safety boundary, not a NodeId validation API.

## Measurement failures

A value thrown by the measure callback is rethrown unchanged, even when it is not an `Error`. A malformed callback result throws `TypeError`. In both cases:

- no later measure callback in that computation runs;
- the requested subtree is left dirty;
- topology, styles, contexts, and public node IDs remain usable;
- a later valid compute can recover.

Layout and measurement-cache work that completed before the callback failed is not rolled back. A stored layout may therefore contain earlier work from the failed computation. Read it only when that point-in-time result is useful, or complete another successful compute first.

`ERR_TAFFY_TREE_BUSY` follows the same non-mutation rule for the rejected nested call. The outer callback may catch it and return a valid measurement, or let it stop the computation.
