# Measuring Content

Styles are enough when a node's size follows from layout constraints. Use a measure callback when Taffy needs an intrinsic size that only your program can provide, such as decoded image dimensions or shaped text.

Create a measurable leaf with JavaScript context, then compute with a synchronous callback. The example below supplies intrinsic image dimensions that do not come from style:

```ts
import { AvailableSpace, TaffyTree, type MeasureFunction } from "@taffyjs/node";

type ImageContext = { intrinsicWidth: number; intrinsicHeight: number };

const tree = new TaffyTree<ImageContext>();
const imageData = {
  intrinsicWidth: 80,
  intrinsicHeight: 45,
};
const image = tree.newLeafWithContext({}, imageData);

const availableSpace = {
  width: AvailableSpace.MaxContent,
  height: AvailableSpace.MaxContent,
};

const measureImage: MeasureFunction<ImageContext> = ({ knownDimensions, context }) => {
  if (!context) return { width: 0, height: 0 };

  return {
    width: knownDimensions.width ?? context.intrinsicWidth,
    height: knownDimensions.height ?? context.intrinsicHeight,
  };
};

tree.computeLayoutWithMeasure({
  root: image,
  availableSpace,
  measure: measureImage,
});

console.log(tree.getUnroundedLayout(image).size); // { width: 80, height: 45 }
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
tree.computeLayoutWithMeasure({ root: image, availableSpace, measure: measureImage });
```

Passing a different callback does not invalidate cached measurement results by itself.

## Keep measurement focused

The callback runs synchronously as part of the layout computation. Treat it as a size calculation: read the supplied values and return dimensions without trying to operate on the same tree. The [`@taffyjs/node` computation reference](../node/computing-layout.md) documents the exact callback restrictions and cache behavior, while [Errors](../node/errors.md) documents failure and recovery behavior.
