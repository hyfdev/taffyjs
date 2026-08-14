# `@taffyjs/node`

`@taffyjs/node` is the ESM-only Node-API binding for Taffy 0.13. It exposes an explicit in-memory layout tree, readable JavaScript inputs and outputs, and a private platform-specific native implementation.

The package currently has version `0.0.0`, is marked private, and requires Node.js 22.18.0 or newer. Nothing in this repository publishes it to a registry.

## Complete examples

Each example is a complete module. It uses the named numeric constants and value helpers, computes layout explicitly, and reads a detached layout snapshot.

### Block

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
  availableSpace: { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent },
});
assert.deepEqual(tree.getUnroundedLayout(child).size, { width: 40, height: 12 });
```

### Flex

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
  availableSpace: { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent },
});
assert.deepEqual(tree.getUnroundedLayout(first).size, { width: 50, height: 20 });
assert.deepEqual(tree.getUnroundedLayout(second).location, { x: 50, y: 0 });
```

### Grid

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
  availableSpace: { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent },
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

### Measure callback and context

```ts
import assert from "node:assert/strict";
import { AvailableSpace, TaffyTree } from "@taffyjs/node";

type ImageContext = { intrinsicWidth: number; intrinsicHeight: number };
const tree = new TaffyTree<ImageContext>();
const image = tree.newLeafWithContext({}, { intrinsicWidth: 80, intrinsicHeight: 45 });
tree.computeLayoutWithMeasure({
  root: image,
  availableSpace: { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent },
  measure({ context }) {
    assert.ok(context);
    return { width: context.intrinsicWidth, height: context.intrinsicHeight };
  },
});
assert.deepEqual(tree.getUnroundedLayout(image).size, { width: 80, height: 45 });
```

## Behavior and lifetime rules

<!-- semantic-rules:start -->

A `NodeId` is an opaque `bigint` created by one `TaffyTree`. Its bits are not a public format. Passing a malformed value, an ID from a foreign tree, or a stale ID left by `remove` or `clear` fails instead of addressing another node.

Layout work is explicit: call `computeLayout` or `computeLayoutWithMeasure`. A stored `Layout` is the value Taffy currently holds; getters and mutations do not perform automatic layout. A new node starts with a zero layout, dirtying a node does not erase the previously stored snapshot, and a failed measured computation may retain layout work completed before the failure.

Context belongs to the JavaScript wrapper and remains strongly held while attached to a live node. Passing `undefined` to `newLeafWithContext` or `setNodeContext` means no context and clears any previous value. `null` is an ordinary context value when the chosen `TContext` includes it. Removing or clearing the node releases its context.

A measure callback runs synchronously inside `computeLayoutWithMeasure`. It must be a function even when Taffy can reuse a cached result without invoking it. It receives known dimensions, available space, the public `NodeId`, context, and a detached `Style` snapshot. Taffy and its cache control whether, when, and in which order callbacks run. Changing captured data or a context object does not invalidate cached measurements automatically, and passing a different callback does not invalidate them either; call `markDirty` for each affected node before computing again. Native-backed calls on the same tree during the callback fail with `ERR_TAFFY_TREE_BUSY`; public value helpers, the callback arguments, and another tree remain usable. A thrown callback value is rethrown unchanged, and an invalid callback result throws `TypeError`. Either failure stops later callbacks, invalidates the requested subtree, and leaves the tree usable, but layout or measurement cache work completed before the failure may remain.

Prefer exported numeric constants such as `Display.Flex`. Exact valid raw numeric codes remain accepted, but the names are clearer and provide TypeScript narrowing while retaining the compact numeric boundary representation.

For `StyleInput`, an omitted property and an explicit `undefined` both use Taffy's default. `null` is accepted only for `aspectRatio`, `alignItems`, `alignSelf`, `justifyItems`, `justifySelf`, `alignContent`, `justifyContent`, and `gridTemplateAreas`, where it stores Taffy's `None`; other fields reject `null`.

Node lookup errors use `ERR_TAFFY_INVALID_NODE_ID`, `ERR_TAFFY_FOREIGN_NODE_ID`, or `ERR_TAFFY_STALE_NODE_ID`. A same-tree native call made during measurement uses `ERR_TAFFY_TREE_BUSY`. Shape errors are `TypeError`, numeric ranges use `RangeError`, and ordinary Taffy operation failures use `Error`. Failed mutations leave the documented wrapper and native state unchanged, except for the layout or cache work that may precede a callback failure in `computeLayoutWithMeasure`.

<!-- semantic-rules:end -->

Returned styles, layouts, child arrays, detailed Grid data, and nested records are detached snapshots. Mutating them does not update the tree. A later successful compute may replace the stored layout, so retain a snapshot only when that point-in-time value is desired.

## API surface

`TaffyTree<TContext>` provides node creation and removal, topology changes, context access, Style replacement and snapshots, explicit layout computation, stored Layout reads, detailed Grid reads, and dirty-state control. `NodeId` is the opaque bigint returned by these methods.

Inputs and detached outputs use named TypeScript types for Style, geometry, Layout, detailed Grid data, available space, and measurement. Closed choices such as `Display`, `Overflow`, and alignment use frozen numeric constant objects. `Dimension`, `AvailableSpace`, `GridPlacement`, `TrackSizingFunction`, `RepetitionCount`, and `GridTemplateComponent` construct readable tagged values.

The generated declaration file and its JSDoc provide the complete export list, signatures, fields, and numeric members. Most maintained source is in this package's `src` directory; numeric families are generated there from the shared `api/numeric-families.json` input.

## Unsupported surfaces

This package does not provide CSS parsing, Yoga compatibility, serde transport, low-level Taffy tree traits, JavaScript-owned custom trees, retained per-node measure callbacks, async layout, off-thread layout, cancellation, output caches, live native views, selector or query builders, batch APIs, or automatic computation from getters and mutations. Use another layer to translate CSS or schedule work, and pass the resulting explicit `StyleInput` and computation call here.

Direct absolute-file access to `index.js`, a `.node` file, or a platform package is unsupported even if a local filesystem path makes it technically possible. These files may change without notice; package subpath exports intentionally prevent normal bare-specifier access.

## CI and release evidence

The repository workflow builds the native addon and runs all Rust, JavaScript, and type tests on both Ubuntu x64 and Windows x64 with Node 22.18.0. Ubuntu also verifies that the committed package JavaScript and declarations match a fresh build. Separate Node and Rust jobs run formatting, linting, generated-source drift checks, and Clippy without rebuilding the addon. Publication remains future work. A workflow definition is not proof that a remote target passed: release handover must name the locally executed host separately from remote jobs that have actually run.
