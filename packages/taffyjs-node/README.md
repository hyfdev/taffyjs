# `@taffyjs/node`

`@taffyjs/node` is the ESM-only Node-API binding for Taffy 0.13. It exposes an explicit in-memory layout tree, readable JavaScript inputs and outputs, and a private platform-specific native implementation.

The package currently has version `0.0.0`, is marked private, and requires Node.js 22.18.0 or newer. Nothing in this repository publishes it to a registry.

## Install from this repository

Build first so the root package and the current platform package contain the same native artifact, then pack both directories and install both tarballs into the consumer. The platform package is an implementation detail; application code imports only `@taffyjs/node`.

```sh
vp run build
vp exec pnpm pack packages/taffyjs-node --pack-destination ./artifacts
vp exec pnpm pack packages/taffyjs-node/npm/linux-x64-gnu --pack-destination ./artifacts
pnpm add ./artifacts/taffyjs-node-0.0.0.tgz ./artifacts/taffyjs-binding-linux-x64-gnu-0.0.0.tgz
```

Use the platform directory matching the current machine: `darwin-arm64`, `darwin-x64`, `linux-x64-gnu`, or `win32-x64-msvc`. Only the package root (`@taffyjs/node`) and `@taffyjs/node/package.json` are exported; paths such as `@taffyjs/node/native.js` are private.

## Complete examples

Each example is a complete module. It uses the named numeric constants and value helpers, computes layout explicitly, and reads a detached layout snapshot.

### Block

<!-- example:block -->

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

<!-- example:flex -->

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

<!-- example:grid -->

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

<!-- example:measure -->

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

Layout work is explicit: call `computeLayout` or `computeLayoutWithMeasure`. A stored `Layout` is the last result written by a successful computation; getters and mutations do not perform automatic layout. A new node starts with a zero layout, and dirtying a node does not erase the previously stored snapshot.

Context belongs to the JavaScript wrapper and remains strongly held while attached to a live node. Passing `undefined` to `newLeafWithContext` or `setNodeContext` means no context and clears any previous value. `null` is an ordinary context value when the chosen `TContext` includes it. Removing or clearing the node releases its context.

A measure callback runs synchronously inside `computeLayoutWithMeasure`. It receives known dimensions, available space, the public `NodeId`, context, and a detached `Style` snapshot. Native-backed calls on the same tree during the callback fail with `ERR_TAFFY_TREE_BUSY`; public value helpers, the callback arguments, and another tree remain usable. A thrown callback value is rethrown unchanged, and an invalid callback result throws `TypeError`. Either failure stops later callbacks, invalidates the requested subtree, and leaves the tree usable, but layout or measurement cache work completed before the failure may remain.

Use the exported numeric constants such as `Display.Flex`, not a raw numeric literal. Their numeric representation makes the JavaScript-to-native boundary compact, but the names are the supported public input and provide TypeScript narrowing.

For `StyleInput`, an omitted property and an explicit `undefined` both use Taffy's default. `null` is accepted only for `aspectRatio`, `alignItems`, `alignSelf`, `justifyItems`, `justifySelf`, `alignContent`, `justifyContent`, and `gridTemplateAreas`, where it stores Taffy's `None`; other fields reject `null`.

Node lookup errors use `ERR_TAFFY_INVALID_NODE_ID`, `ERR_TAFFY_FOREIGN_NODE_ID`, or `ERR_TAFFY_STALE_NODE_ID`. A same-tree native call made during measurement uses `ERR_TAFFY_TREE_BUSY`. Shape errors are `TypeError`, numeric ranges use `RangeError`, and ordinary Taffy operation failures use `Error`. Failed mutations leave the documented wrapper and native state unchanged, except for the layout or cache work that may precede a callback failure in `computeLayoutWithMeasure`.

<!-- semantic-rules:end -->

Returned styles, layouts, child arrays, detailed Grid data, and nested records are detached snapshots. Mutating them does not update the tree. A later successful compute may replace the stored layout, so retain a snapshot only when that point-in-time value is desired.

## Public symbols

<!-- public-symbols:start -->

- `TaffyTree`: Owns nodes, topology, context, styles, and stored layout for one independent tree.
- `ChildRangeInput`: Describes a half-open child index range for removal.
- `ComputeLayoutWithMeasureOptions`: Supplies a root, available space, and synchronous measure callback.
- `ComputeLayoutOptions`: Supplies a root and available space for ordinary computation.
- `EnumValue`: Extracts the numeric value union from a readonly constant family.
- `Display`: Selects Block, FlowRoot, Flex, Grid, or hidden layout behavior.
- `BoxSizing`: Chooses whether declared sizes include border and padding.
- `Direction`: Selects left-to-right or right-to-left inline direction.
- `Overflow`: Selects visible, clipped, hidden, or scrolling overflow behavior.
- `Float`: Selects left float, right float, or no float.
- `Clear`: Selects which preceding floats a block must clear.
- `Position`: Selects relative or absolute positioning.
- `TextAlign`: Selects Taffy's supported text-alignment hint.
- `FlexDirection`: Selects the main axis and its direction for Flex layout.
- `FlexWrap`: Selects no-wrap, wrap, or reverse-wrap Flex behavior.
- `GridAutoFlow`: Selects row or column auto-placement, with optional dense packing.
- `AlignItems`: Supplies item alignment values for item and self properties.
- `AlignContent`: Supplies content distribution values for container properties.
- `LengthUnit`: Identifies length, percent, and auto tagged values.
- `AvailableSpaceKind`: Identifies definite, min-content, and max-content constraints.
- `GridPlacementKind`: Identifies automatic, line, named-line, span, and named-span placement.
- `TrackSizingKind`: Identifies all supported minimum and maximum Grid track functions.
- `RepetitionCountKind`: Identifies fixed, auto-fill, and auto-fit repetition.
- `GridTemplateComponentKind`: Identifies one track or a repeated track group.
- `DetailedLayoutInfoKind`: Distinguishes absent detail from Grid detail.
- `AvailableSpaceInput`: Accepts a readable constraint value at a computation boundary.
- `AvailableSpace`: Provides constructors and readonly values for available-space input and output.
- `DetailedLayoutInfo`: Reports no detail or the detailed Grid computation result.
- `DetailedGridInfo`: Contains detailed row, column, and item Grid information.
- `DetailedGridTracksInfo`: Reports explicit, implicit, gutter, and track-size data for one axis.
- `DetailedGridItemInfo`: Reports resolved row and column lines for one Grid item.
- `PointInput`: Supplies writable x and y components.
- `PartialPointInput`: Supplies either x or y while omitted components use defaults.
- `Point`: Returns readonly x and y components.
- `SizeInput`: Supplies writable width and height components.
- `PartialSizeInput`: Supplies either dimension while omitted components use defaults.
- `Size`: Returns readonly width and height components.
- `RectInput`: Supplies writable left, right, top, and bottom components.
- `PartialRectInput`: Supplies selected rectangle sides while omissions use defaults.
- `Rect`: Returns readonly left, right, top, and bottom components.
- `LineInput`: Supplies writable start and end line values.
- `PartialLineInput`: Supplies either line endpoint while omissions use defaults.
- `Line`: Returns readonly start and end line values.
- `GridPlacementInput`: Accepts automatic, line, named-line, span, or named-span placement.
- `GridPlacement`: Provides Grid placement constructors and readonly output values.
- `MinTrackSizingFunctionInput`: Accepts a valid minimum Grid track sizing function.
- `MinTrackSizingFunction`: Returns a readonly minimum Grid track sizing function.
- `MaxTrackSizingFunctionInput`: Accepts a valid maximum Grid track sizing function.
- `MaxTrackSizingFunction`: Returns a readonly maximum Grid track sizing function.
- `TrackSizingFunctionInput`: Supplies paired minimum and maximum track functions.
- `TrackSizingFunction`: Provides track constructors and readonly paired output.
- `RepetitionCountInput`: Accepts a fixed, auto-fill, or auto-fit repetition count.
- `RepetitionCount`: Provides repetition constructors and readonly output values.
- `GridTemplateRepetitionInput`: Supplies a count, tracks, and optional line-name groups.
- `GridTemplateRepetition`: Returns a readonly repeated Grid template group.
- `GridTemplateComponentInput`: Accepts one track or a repeated track group.
- `GridTemplateComponent`: Provides constructors and readonly Grid template components.
- `GridTemplateAreasInput`: Supplies named areas and explicit row and column counts.
- `GridTemplateAreas`: Returns readonly named areas and explicit dimensions.
- `GridTemplateAreaInput`: Supplies one named rectangular Grid area.
- `GridTemplateArea`: Returns one readonly named rectangular Grid area.
- `Layout`: Returns order, location, sizes, borders, padding, and margins from stored layout.
- `LengthInput`: Supplies a numeric absolute length tagged with `LengthUnit.Length`.
- `PercentInput`: Supplies a numeric percentage tagged with `LengthUnit.Percent`.
- `AutoInput`: Supplies the auto length tag.
- `LengthPercentageInput`: Accepts an absolute length or percentage.
- `LengthPercentageAutoInput`: Accepts an absolute length, percentage, or auto.
- `DimensionInput`: Accepts any supported dimension input.
- `LengthPercentage`: Returns a readonly absolute length or percentage.
- `LengthPercentageAuto`: Returns a readonly absolute length, percentage, or auto.
- `Dimension`: Provides length, percentage, and auto constructors and output values.
- `MeasureArgs`: Describes the values passed to a synchronous measure callback.
- `MeasureFunction`: Describes a synchronous callback that returns an intrinsic size.
- `NodeId`: Names an opaque per-tree node identity represented by a `bigint`.
- `StyleInput`: Supplies partial readable Taffy style data with defaults for omissions.
- `Style`: Returns the complete readonly style snapshot stored for a node.

<!-- public-symbols:end -->

The constant families are frozen objects with stable numeric values. `Dimension`, `AvailableSpace`, `GridPlacement`, `TrackSizingFunction`, `RepetitionCount`, and `GridTemplateComponent` are the supported constructors for readable tagged values; constructor calls return fresh mutable input records, while shared constant records are frozen.

## `TaffyTree` methods

<!-- public-tree-members:start -->

- `constructor`: Creates an independent tree with a separate `NodeId` namespace.
- `enableRounding`: Enables pixel rounding for later computations.
- `disableRounding`: Disables pixel rounding; unrounded snapshots are always available.
- `newLeaf`: Creates a node without children from a `StyleInput`.
- `newLeafWithContext`: Creates a leaf and attaches an optional JavaScript context.
- `newWithChildren`: Creates a parent from a style and ordered existing children.
- `clear`: Removes all nodes and contexts and makes every old ID stale.
- `remove`: Removes one node, detaches it, releases its context, and makes its ID stale.
- `setNodeContext`: Replaces a context or clears it with `undefined`.
- `getNodeContext`: Reads the current context without copying it.
- `addChild`: Appends an existing node to a parent.
- `insertChildAtIndex`: Inserts an existing child at a zero-based index.
- `setChildren`: Atomically replaces the complete ordered child list.
- `removeChild`: Detaches a specified child without deleting the node.
- `removeChildAtIndex`: Detaches and returns the child at a zero-based index.
- `removeChildrenRange`: Detaches a half-open range `[start, end)` of children.
- `replaceChildAtIndex`: Replaces and returns the child at an index.
- `getChildAtIndex`: Returns the child at a zero-based index.
- `getChildCount`: Returns a parent's current child count.
- `getNodeCount`: Returns the number of live nodes, including detached nodes.
- `getParent`: Returns a node's parent or `null` when it is a root.
- `getChildren`: Returns a detached readonly child-ID snapshot.
- `setStyle`: Replaces the complete stored style from a partial `StyleInput`.
- `getStyle`: Returns a detached complete `Style` snapshot.
- `getLayout`: Returns the most recently stored rounded `Layout` snapshot.
- `getUnroundedLayout`: Returns the most recently stored unrounded `Layout` snapshot.
- `getDetailedLayoutInfo`: Returns detailed Grid tracks and resolved item lines when the node used Grid.
- `markDirty`: Explicitly invalidates cached layout or measurement state for a node.
- `isDirty`: Reports whether a node currently needs recomputation.
- `computeLayoutWithMeasure`: Computes synchronously and invokes the supplied callback for measured leaves.
- `computeLayout`: Computes synchronously using styles and any previously cached measurements.

<!-- public-tree-members:end -->

## Errors

Malformed JavaScript shapes and values use the documented built-in class without coercion. Node IDs additionally carry a stable code: `ERR_TAFFY_INVALID_NODE_ID`, `ERR_TAFFY_FOREIGN_NODE_ID`, or `ERR_TAFFY_STALE_NODE_ID`. Calls that would re-enter native work on the same tree during measurement fail with `ERR_TAFFY_TREE_BUSY`. Callback exceptions preserve their original JavaScript identity. Failed mutations do not commit partial wrapper or native state, except that `computeLayoutWithMeasure` may retain layout or cache work completed before a callback failure.

## Raw numeric boundary

The boundary example below is not recommended for application code: a raw numeric literal is appropriate only when adapting an already validated low-level protocol. Prefer `Display.Block` everywhere else.

<!-- boundary-example:not-recommended -->

```ts
import type { Display } from "@taffyjs/node";

const displayFromTrustedProtocol = 0 as Display;
```

## Unsupported surfaces

This package does not provide CSS parsing, Yoga compatibility, serde transport, low-level Taffy tree traits, JavaScript-owned custom trees, retained per-node measure callbacks, async layout, off-thread layout, cancellation, output caches, live native views, selector or query builders, batch APIs, or automatic computation from getters and mutations. Use another layer to translate CSS or schedule work, and pass the resulting explicit `StyleInput` and computation call here.

Direct absolute-file access to `index.js`, `native.js`, a `.node` file, or a platform package is unsupported even if a local filesystem path makes it technically possible. These files may change without notice; package subpath exports intentionally prevent normal bare-specifier access.

## CI and release evidence

The repository workflow builds and tests the four declared targets without publishing. A workflow definition is not proof that a remote target passed: release handover must name the locally executed host separately from remote jobs that have actually run. The exact Node 22.18.0 packed-consumer check is part of repository readiness.
