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
  measure({ knownDimensions, availableSpace, node, context, style }) {
    return measureContent({ knownDimensions, availableSpace, node, context, style });
  },
});
```

Only a node with present JavaScript context is measurable. `newLeafWithContext` marks the node measurable when its context is not `undefined`; `setNodeContext(node, undefined)` clears both the context and that marker.

The callback is validated as a function before native computation, even when Taffy may satisfy the request from cache. Taffy controls whether it runs, how often it runs, and the order of calls.

`knownDimensions` contains a number for an axis already fixed by layout and `undefined` otherwise. Callback `availableSpace` uses the same three tagged forms described above. `node` is the public ID, `context` is the exact JavaScript value stored for it, and `style` is a detached complete snapshot. The callback must return a complete `{ width, height }` record synchronously.

During the callback, native-backed methods on the same tree fail with `ERR_TAFFY_TREE_BUSY`. `getNodeContext`, public value helpers, callback arguments, and operations on another tree remain usable.

A thrown callback value or invalid result stops the computation. See [Errors](./errors.md#measurement-failures) for the exact rethrow behavior and the state that remains afterward.
