# Getting Started

Install `@taffyjs/node` and use a small Flexbox tree to see the complete layout process: create nodes, connect them, describe how they should be laid out, run the engine, and read the resulting rectangles.

## Install

```sh
npm install @taffyjs/node
```

`@taffyjs/node` requires Node.js 22.18 or newer.

## Compute a layout

Create `layout.mjs`:

```ts
import { Dimension, Display, TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();

const first = tree.newLeaf({ flexGrow: 1 });
const second = tree.newLeaf({ flexGrow: 1 });

const root = tree.newWithChildren(
  {
    display: Display.Flex,
    size: { width: Dimension.Percent(100), height: 20 },
  },
  [first, second],
);

tree.computeLayout({
  root,
  availableSpace: { width: 100, height: 20 },
});

console.log(tree.getLayout(first).size);
console.log(tree.getLayout(second).location);
```

Run it with Node.js:

```sh
node layout.mjs
```

The output is:

```text
{ width: 50, height: 20 }
{ x: 50, y: 0 }
```

The root asks to use 100 percent of the available width. The compute call provides 100 units, so the root becomes 100 units wide. Its two children both have `flexGrow: 1`, so Flexbox divides that width evenly and places the second child after the first. If the available width were 300, the same styles would produce two 150-unit children.

## Think in terms of a layout engine

The program has five parts:

1. **A tree:** `TaffyTree` owns the nodes and their parent-child relationships. A leaf has no children; the root is the node where this computation begins.
2. **Styles:** each node has rules that describe its preferred size and layout behavior. A style describes constraints and choices, such as the root's percentage width, rather than a final position.
3. **Available space:** the compute call tells the root how much room it may use. Width and height are independent inputs.
4. **A computation:** `computeLayout` runs the layout algorithm for the chosen root. Creating or changing a node does not run it automatically.
5. **Layout results:** `getLayout` reads the position and size stored for a node. TaffyJS returns these numbers; your program decides how to render or otherwise use them.

Keep that sequence in mind: build a tree, describe it with styles, provide available space, compute, then read rectangles. [Essentials](./tree-compute-read.md) starts with this same sequence and examines each part in more detail.
