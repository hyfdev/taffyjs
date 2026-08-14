# Measuring Content

Styles are enough when a node's size follows from layout constraints. Use a measure callback when Taffy needs an intrinsic size that only your program can provide, such as decoded image dimensions or shaped text.

Create a measurable leaf with JavaScript context, then compute with a synchronous callback:

```ts
type ImageContext = { intrinsicWidth: number; intrinsicHeight: number };

const tree = new TaffyTree<ImageContext>();
const imageData = {
  intrinsicWidth: 80,
  intrinsicHeight: 45,
};
const image = tree.newLeafWithContext({}, imageData);

tree.computeLayoutWithMeasure({
  root: image,
  availableSpace,
  measure({ knownDimensions, availableSpace, context }) {
    if (!context) return { width: 0, height: 0 };

    return {
      width: knownDimensions.width ?? context.intrinsicWidth,
      height: knownDimensions.height ?? context.intrinsicHeight,
    };
  },
});
```

The callback receives five values:

- `knownDimensions` contains a number for an axis Taffy has already fixed and `undefined` otherwise.
- `availableSpace` contains a `Definite`, `MinContent`, or `MaxContent` value for each axis.
- `node` is the public `NodeId` being measured.
- `context` is the exact JavaScript value stored for that node, or `undefined` when absent.
- `style` is a detached complete style snapshot.

Return a complete `{ width, height }` record. The callback is synchronous; returning a Promise or an incomplete record throws `TypeError`.

## Taffy owns callback scheduling

Taffy decides whether a measurement is needed, how many times it is needed, and in which order nodes are visited. It may reuse a cached measurement without calling the callback at all. Code must not depend on one call per node or on a particular traversal order.

Replacing context with `setNodeContext` marks the node dirty. Mutating a stored context object in place does not, because the tree cannot observe that mutation. The same applies to values captured by the callback. Mark each affected node before computing again:

```ts
imageData.intrinsicWidth = 120;
tree.markDirty(image);
tree.computeLayoutWithMeasure(options);
```

Passing a different callback does not invalidate cached measurement results by itself.

## The callback is inside a computation

While the callback is running, native-backed methods on the same tree fail with `ERR_TAFFY_TREE_BUSY`. This prevents a second tree operation from entering the native tree while it is already borrowed for layout. Public value helpers, the supplied callback values, JavaScript-only context lookup, and a different `TaffyTree` remain usable.

If the callback throws, TaffyJS rethrows the same JavaScript value. If its return value has the wrong shape, TaffyJS throws `TypeError`. Either failure stops later callbacks, marks the requested subtree dirty, and leaves the tree usable for a later compute. Layout or cache work already completed before the failure is not rolled back.

See [Complete Examples](./examples.md#measure-callback-and-context) for a standalone measured layout module.
