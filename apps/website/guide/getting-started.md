# Getting Started

Install `@taffyjs/node`, create a small Flexbox tree, compute its layout, and read the result.

## Install

```sh
npm install @taffyjs/node
```

`@taffyjs/node` requires Node.js 22.18 or newer. See the [package overview](../node/index.md) for supported native platforms and import rules.

## Compute a layout

Create `layout.mjs`:

```ts
import { Display, TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();

const first = tree.newLeaf({ flexGrow: 1 });
const second = tree.newLeaf({ flexGrow: 1 });

const root = tree.newWithChildren(
  {
    display: Display.Flex,
    size: { width: 100, height: 20 },
  },
  [first, second],
);

tree.computeLayout({
  root,
  availableSpace: { width: 100, height: 20 },
});

console.log(tree.getUnroundedLayout(first).size);
console.log(tree.getUnroundedLayout(second).location);
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

The root is 100 units wide. Both children have `flexGrow: 1`, so Taffy divides the available width evenly between them and places the second child after the first.

The program does four things:

1. `new TaffyTree()` creates an independent owner for nodes, styles, and stored layouts.
2. `newLeaf` and `newWithChildren` create the nodes and their parent-child relationship.
3. `computeLayout` asks Taffy to calculate layout for one root and a definite amount of available space.
4. `getUnroundedLayout` reads detached result objects stored by that computation.

Changing the tree does not compute layout automatically, and reading a result does not recompute it. Continue with [Tree, Compute, and Read](./tree-compute-read.md) for that lifecycle, or go directly to the worked [Block](./block.md), [Flexbox](./flexbox.md), or [Grid](./grid.md) examples.
