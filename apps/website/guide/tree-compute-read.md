# Tree, Compute, and Read

The Getting Started example followed the basic layout cycle: build a tree, attach styles, provide available space, compute, and read rectangles. Those steps stay separate because each one represents a different part of the layout problem.

## The tree describes structure

Layout depends on relationships. A parent chooses how its children participate in layout, and the order of those children can affect where they end up. TaffyJS therefore works with an explicit tree rather than a flat list of boxes.

```ts
import { AvailableSpace, Dimension, Display, TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();
const icon = tree.newLeaf({ size: { width: 16, height: 16 } });
const label = tree.newLeaf({ flexGrow: 1 });
const root = tree.newWithChildren(
  {
    display: Display.Flex,
    size: { width: Dimension.Percent(100) },
  },
  [icon, label],
);
```

`newLeaf` creates a node without children. `newWithChildren` creates a parent and records the children in order. Either kind of node can become the root of a computation.

A `TaffyTree` owns its nodes, styles, and stored layouts. The value returned when a node is created is a `NodeId`: a handle used to refer to that node in the same tree. Keep the handle with its tree rather than treating it as application data or a portable identifier. The [`@taffyjs/node` reference](../node/nodes-and-topology.md) covers the complete set of topology operations and their exact errors.

## Styles describe layout behavior

The tree tells Taffy which nodes are related. Styles tell it how those nodes should participate in layout. A parent's `display` selects Block, Flexbox, or Grid; sizing, spacing, alignment, and placement fields add constraints for the parent and its children.

A style is input to the algorithm, not a final rectangle. For example, `flexGrow: 1` says that a child may receive a share of free space. Its final width still depends on its siblings, its parent, and the space available to the computation.

[Styles and Values](./styles-and-values.md) explains defaults, concrete lengths, percentages, automatic sizing, and the helper values used to express those choices.

## Available space describes the outside constraint

The root does not exist in isolation. A compute call supplies the width and height available to it:

```ts
tree.computeLayout({
  root,
  availableSpace: {
    width: 640,
    height: AvailableSpace.MaxContent,
  },
});
```

Here the root has a definite 640-unit width constraint. `MaxContent` lets the content determine the height without a definite outer limit. Width and height are independent, and each can be definite, `MinContent`, or `MaxContent`.

Available space and style have different roles. Style belongs to a node and describes how it wants to participate in layout. Available space belongs to one computation and describes the environment in which its root is being laid out.

## Computation is explicit

Creating a node, changing a style, or changing the topology updates the inputs but does not run layout. `computeLayout` runs the algorithm for one root when your program chooses to do so. This makes it possible to group several changes and place layout work at a deliberate point in an update or rendering loop.

After an input changes, affected nodes become dirty. `isDirty(node)` tells you that stored layout work may need to be recomputed; it does not itself run the algorithm.

## Reads return the stored result

After a successful computation, each participating node has a stored layout. `getLayout(node)` reads its position and size using the tree's current rounding mode:

```ts
const layout = tree.getLayout(label);

console.log(layout.location);
console.log(layout.size);
```

Reading never triggers layout. If an input changes, a getter can still return the previous stored result until the next successful computation. The normal cycle is therefore explicit: change inputs, compute, then read the new rectangles.

Use `getUnroundedLayout(node)` when fractional values must be preserved. The [`@taffyjs/node` layout reference](../node/layout-results.md) covers rounding, detailed Grid data, snapshot behavior, and exact result shapes.
