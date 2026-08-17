# Computing Layout

Layout computation is synchronous and explicit. Getters never trigger it, and mutations never schedule it.

## Ordinary computation

`computeLayout` takes one root and a complete available-space value:

```ts
tree.computeLayout({
  root,
  availableSpace: {
    width: 800,
    height: AvailableSpace.MaxContent,
  },
});
```

Each axis has one of three meanings:

- A number supplies a concrete constraint; `AvailableSpace.Definite(value)` is its complete form.
- `AvailableSpace.MinContent` requests minimum-content sizing.
- `AvailableSpace.MaxContent` requests maximum-content sizing.

`computeLayout` does not invoke a JavaScript measure callback. Use it when style and topology provide all required sizes, or when no new measured content is needed.

## Dirty state and caching

New nodes start dirty. A successful compute normally leaves the computed state clean. `isDirty(node)` reports Taffy's cache state, and `markDirty(node)` explicitly invalidates that node and the necessary ancestor path.

Style replacement, context replacement, and topology changes normally dirty the affected path. External mutations are not observable, so changing a context object or data captured by a callback requires an explicit `markDirty`. Passing a different callback does not invalidate an existing cached measurement.

A dirty node can still have a previously stored layout. Reading it returns that old snapshot until another successful compute stores a new result. As noted in [Nodes and Topology](./nodes-and-topology.md#remove-nodes), `remove(node)` does not dirty its former parent in the current Taffy version.

## Rounding

The tree starts with pixel rounding enabled. `getLayout(node)` selects rounded output while rounding is enabled and unrounded output while it is disabled. `getUnroundedLayout(node)` always reads the unrounded result.

Use `enableRounding()` or `disableRounding()` to change the mode. Compute again after changing it before relying on `getLayout`; the methods do not themselves recompute the tree. The selected mode survives `clear()`.

## Computation with measurement

`computeLayoutWithMeasure` adds a synchronous callback:

```ts
tree.computeLayoutWithMeasure({
  root,
  availableSpace,
  measure({ knownDimensions, availableSpace, node, context, getStyle }) {
    const style = needsStyle(context) ? getStyle() : undefined;
    return measureContent({ knownDimensions, availableSpace, node, context, style });
  },
});
```

Taffy may ask the callback to measure any leaf that needs an intrinsic size. Context is optional: `newLeafWithContext` is a convenient way to attach measurement data, while a leaf without context is passed to the callback with `context === undefined`. `setNodeContext` changes or clears that value; it does not enable or disable measurement.

The callback is validated as a function before native computation, even when Taffy may satisfy the request from cache. Taffy controls whether it runs, how often it runs, and the order of calls.

`knownDimensions` contains a number for an axis already fixed by layout and `undefined` otherwise. Callback `availableSpace` uses the same three tagged forms described above. `node` is the public ID, and `context` is the exact JavaScript value stored for it. Call `getStyle()` only when measurement needs the node's style; each call returns a fresh, complete, normalized, detached `Style` snapshot. If the callback never calls it, taffyjs does not create a JavaScript `Style` object. The callback must return a complete `{ width, height }` record synchronously.

This is a breaking change from the earlier callback shape: destructure `getStyle` and call it where needed instead of destructuring an eager `style` value.

During the callback, native-backed methods on the same tree fail with `ERR_TAFFY_TREE_BUSY`. `getStyle()` is the callback-safe way to read the measured node's style; retained `getStyle` functions also remain safe to call after the callback returns. `getNodeContext`, public value helpers, callback arguments, and operations on another tree remain usable.

A thrown callback value or invalid result stops the computation. See [Errors](./errors.md#measurement-failures) for the exact rethrow behavior and the state that remains afterward.
