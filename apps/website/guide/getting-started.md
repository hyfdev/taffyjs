# Getting Started

This page takes one small tree from creation to an observable layout result. It assumes `@taffyjs/node` is already available in your project. The package is currently private and unpublished; the [package README](https://github.com/hyfdev/taffyjs/tree/main/packages/taffyjs-node) records its current availability.

Create a file such as `layout.ts`:

```ts
import assert from "node:assert/strict";
import { AvailableSpace, Dimension, Display, TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();

const child = tree.newLeaf({
  size: { width: Dimension.Length(40), height: Dimension.Length(12) },
});

const root = tree.newWithChildren(
  {
    display: Display.Flex,
    size: { width: Dimension.Length(100), height: Dimension.Length(20) },
  },
  [child],
);

tree.computeLayout({
  root,
  availableSpace: {
    width: AvailableSpace.MaxContent,
    height: AvailableSpace.MaxContent,
  },
});

assert.deepEqual(tree.getUnroundedLayout(child).size, { width: 40, height: 12 });
```

There are four separate operations in this module.

`new TaffyTree()` creates an independent owner for nodes, styles, and stored layouts. `newLeaf` creates a node without children. `newWithChildren` creates another node and attaches the supplied children in order.

`computeLayout` is the point where Taffy performs layout. `root` selects the subtree to compute. `availableSpace` describes the constraint supplied by the caller; `MaxContent` asks the tree for its maximum-content size in that axis rather than imposing a definite number.

`getUnroundedLayout` reads the result Taffy stored for the child. It does not compute anything itself. The result is a detached object, so changing that object would not change the tree.

The example uses explicit lengths to keep the first result unsurprising. From here, [Tree, Compute, and Read](./tree-compute-read.md) explains what happens when the tree changes, while [Complete Examples](./examples.md) contains standalone Block, Flexbox, Grid, and measurement programs.
