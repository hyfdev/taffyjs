# Complete Examples

Each example on this page is a complete TypeScript ESM module. It uses only the public `@taffyjs/node` entry point, computes layout explicitly, and asserts an observed result.

## Block

```ts
import assert from "node:assert/strict";
import { AvailableSpace, Dimension, Display, TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();
const child = tree.newLeaf({
  size: { width: Dimension.Length(40), height: Dimension.Length(12) },
});
const root = tree.newWithChildren(
  { display: Display.Block, size: { width: Dimension.Length(100) } },
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

## Flexbox

```ts
import assert from "node:assert/strict";
import { AvailableSpace, Dimension, Display, TaffyTree } from "@taffyjs/node";

const tree = new TaffyTree();
const first = tree.newLeaf({ flexGrow: 1 });
const second = tree.newLeaf({ flexGrow: 1 });
const root = tree.newWithChildren(
  {
    display: Display.Flex,
    size: { width: Dimension.Length(100), height: Dimension.Length(20) },
  },
  [first, second],
);

tree.computeLayout({
  root,
  availableSpace: {
    width: AvailableSpace.MaxContent,
    height: AvailableSpace.MaxContent,
  },
});

assert.deepEqual(tree.getUnroundedLayout(first).size, { width: 50, height: 20 });
assert.deepEqual(tree.getUnroundedLayout(second).location, { x: 50, y: 0 });
```

## Grid

```ts
import assert from "node:assert/strict";
import {
  AvailableSpace,
  Dimension,
  Display,
  GridPlacement,
  GridTemplateComponent,
  TaffyTree,
  TrackSizingFunction,
} from "@taffyjs/node";

const tree = new TaffyTree();
const item = tree.newLeaf({
  gridRow: { start: GridPlacement.Line(1), end: GridPlacement.Line(2) },
  gridColumn: { start: GridPlacement.Line(2), end: GridPlacement.Line(3) },
});
const root = tree.newWithChildren(
  {
    display: Display.Grid,
    size: { width: Dimension.Length(100), height: Dimension.Length(30) },
    gridTemplateRows: [GridTemplateComponent.Single(TrackSizingFunction.Length(30))],
    gridTemplateColumns: [
      GridTemplateComponent.Single(TrackSizingFunction.Length(40)),
      GridTemplateComponent.Single(TrackSizingFunction.Length(60)),
    ],
  },
  [item],
);

tree.computeLayout({
  root,
  availableSpace: {
    width: AvailableSpace.MaxContent,
    height: AvailableSpace.MaxContent,
  },
});

assert.deepEqual(tree.getUnroundedLayout(item), {
  order: 0,
  location: { x: 40, y: 0 },
  size: { width: 60, height: 30 },
  contentSize: { width: 0, height: 0 },
  scrollbarSize: { width: 0, height: 0 },
  border: { left: 0, right: 0, top: 0, bottom: 0 },
  padding: { left: 0, right: 0, top: 0, bottom: 0 },
  margin: { left: 0, right: 0, top: 0, bottom: 0 },
});
```

## Measure callback and context

```ts
import assert from "node:assert/strict";
import { AvailableSpace, TaffyTree } from "@taffyjs/node";

type ImageContext = { intrinsicWidth: number; intrinsicHeight: number };

const tree = new TaffyTree<ImageContext>();
const image = tree.newLeafWithContext({}, { intrinsicWidth: 80, intrinsicHeight: 45 });

tree.computeLayoutWithMeasure({
  root: image,
  availableSpace: {
    width: AvailableSpace.MaxContent,
    height: AvailableSpace.MaxContent,
  },
  measure({ context }) {
    assert.ok(context);
    return { width: context.intrinsicWidth, height: context.intrinsicHeight };
  },
});

assert.deepEqual(tree.getUnroundedLayout(image).size, { width: 80, height: 45 });
```

These examples deliberately stop at layout. A renderer can use each node's `location` and `size` to draw, position, or serialize its own content.
