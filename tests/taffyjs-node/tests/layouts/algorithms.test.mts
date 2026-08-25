import assert from "node:assert/strict";
import {
  AlignItems,
  AvailableSpace,
  AvailableSpaceKind,
  Clear,
  Dimension,
  DetailedLayoutInfoKind,
  Display,
  FlexWrap,
  Float,
  GridPlacement,
  Position,
  RepetitionCount,
  TaffyTree,
  TrackSizingFunction,
  GridTemplateComponent,
  Overflow,
  type MeasureFunction,
  type StyleInput,
} from "@taffyjs/node";
import { test } from "vite-plus/test";

function maxContentSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
}

function definiteWidth(width: number) {
  return { width: width, height: AvailableSpace.MaxContent };
}

function singleTrack(value: number) {
  return GridTemplateComponent.Single(TrackSizingFunction.Length(value));
}

function computeChildren(rootStyle: StyleInput, childStyles: readonly StyleInput[]) {
  const tree = new TaffyTree();
  const children = childStyles.map((style) => tree.newLeaf(style));
  const root = tree.newWithChildren(children, rootStyle);
  tree.computeLayout({ root, availableSpace: definiteWidth(100) });
  return {
    root: tree.getUnroundedLayout(root),
    children: children.map((child) => tree.getUnroundedLayout(child)),
  };
}

// Every fixed layout value below is pinned to the exact Taffy sources at revision 77f38568:
// https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/compute/block.rs
// https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/compute/float.rs
// https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/compute/flexbox.rs
// https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/compute/grid/mod.rs
// https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/compute/grid/placement.rs
// https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/compute/grid/track_sizing.rs
// https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/compute/mod.rs

test("block-float", () => {
  const block = computeChildren({ display: Display.Block, size: { width: 100 } }, [
    {
      display: Display.Block,
      float: Float.Left,
      size: { width: 20, height: 10 },
    },
    {
      display: Display.Block,
      clear: Clear.Left,
      size: { width: 30, height: 5 },
    },
    {
      display: Display.Block,
      position: Position.Relative,
      inset: { left: 5, top: 7 },
      size: { width: 10, height: 10 },
    },
  ]);
  assert.deepEqual(block.children[0].location, { x: 0, y: 0 });
  assert.deepEqual(block.children[1].location, { x: 0, y: 10 });
  assert.deepEqual(block.children[2].location, { x: 5, y: 22 });
  assert.deepEqual(block.root.scrollableOverflowRect, { left: 0, right: 30, top: 0, bottom: 32 });

  const flowRoot = computeChildren({ display: Display.FlowRoot, size: { width: 100 } }, [
    {
      display: Display.Block,
      float: Float.Right,
      size: { width: 20, height: 10 },
    },
  ]);
  assert.deepEqual(flowRoot.children[0].location, { x: 80, y: 0 });
  assert.deepEqual(flowRoot.root.scrollableOverflowRect, {
    left: 0,
    right: 100,
    top: 0,
    bottom: 10,
  });

  const positioned = computeChildren(
    {
      display: Display.Block,
      size: { width: 100, height: 50 },
    },
    [
      {
        position: Position.Absolute,
        inset: { left: 12, top: 9 },
        size: { width: 10, height: 10 },
      },
      { size: { width: 10, height: 10 } },
    ],
  );
  assert.deepEqual(positioned.children[0].location, { x: 12, y: 9 });
  assert.deepEqual(positioned.children[1].location, { x: 0, y: 0 });
});

test("flex", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf({
    flexGrow: 1,
    size: { width: 10, height: 10 },
  });
  const second = tree.newLeaf({
    flexGrow: 1,
    size: { width: 10, height: 10 },
  });
  const root = tree.newWithChildren([first, second], {
    display: Display.Flex,
    size: { width: 101, height: 20 },
  });
  const options = { root, availableSpace: maxContentSpace() };

  tree.disableRounding();
  tree.computeLayout(options);
  assert.deepEqual(
    [tree.getLayout(first), tree.getLayout(second)].map(({ location, size }) => ({
      x: location.x,
      width: size.width,
    })),
    [
      { x: 0, width: 50.5 },
      { x: 50.5, width: 50.5 },
    ],
  );

  tree.enableRounding();
  tree.computeLayout(options);
  assert.deepEqual(
    [tree.getLayout(first), tree.getLayout(second)].map(({ location, size }) => ({
      x: location.x,
      width: size.width,
    })),
    [
      { x: 0, width: 51 },
      { x: 51, width: 50 },
    ],
  );
  assert.deepEqual(tree.getUnroundedLayout(second).location, { x: 50.5, y: 0 });
});

test("flex descendants can overflow an ancestor max width", () => {
  const tree = new TaffyTree();
  const leaf = tree.newLeaf({
    flexGrow: 1,
    size: { width: 86 },
  });
  const middle = tree.newWithChildren([leaf]);
  const root = tree.newWithChildren([middle], {
    maxSize: { width: 8 },
  });

  tree.computeLayout({
    root,
    availableSpace: { width: 900, height: 700 },
  });

  assert.deepEqual(
    [root, middle, leaf].map((node) => tree.getUnroundedLayout(node).size.width),
    [8, 86, 86],
  );
});

test("balanced flex wrapping honors flexLineCount", () => {
  const tree = new TaffyTree();
  tree.disableRounding();
  const children = [31, 32, 33, 34].map((width) => tree.newLeaf({ size: { width, height: 30 } }));
  const root = tree.newWithChildren(children, {
    display: Display.Flex,
    flexWrap: FlexWrap.Balance,
    flexLineCount: 3,
    size: { width: 100 },
  });

  tree.computeLayout({ root, availableSpace: maxContentSpace() });

  assert.deepEqual(tree.getUnroundedLayout(root).size, { width: 100, height: 90 });
  assert.deepEqual(
    children.map((child) => tree.getUnroundedLayout(child).location),
    [
      { x: 0, y: 0 },
      { x: 31, y: 0 },
      { x: 0, y: 30 },
      { x: 0, y: 60 },
    ],
  );
});

test("intrinsic Dimension values drive block sizing", () => {
  const tree = new TaffyTree();
  tree.disableRounding();
  const children = [
    Dimension.Stretch,
    Dimension.FitContent,
    Dimension.MinContent,
    Dimension.MaxContent,
    Dimension.FitContentLength(30),
    Dimension.FitContentPercent(25),
    Dimension.Content,
  ].map((width) => tree.newLeaf({ size: { width } }));
  const root = tree.newWithChildren(children, {
    display: Display.Block,
    size: { width: 120 },
  });
  const measure: MeasureFunction<unknown> = ({ knownDimensions, availableSpace }) => {
    let intrinsicWidth: number;
    switch (availableSpace.width.kind) {
      case AvailableSpaceKind.MinContent:
        intrinsicWidth = 20;
        break;
      case AvailableSpaceKind.MaxContent:
        intrinsicWidth = 40;
        break;
      case AvailableSpaceKind.Definite:
        intrinsicWidth = Math.max(20, Math.min(availableSpace.width.value, 40));
        break;
    }
    const width = knownDimensions.width ?? intrinsicWidth;
    return {
      width,
      height: knownDimensions.height ?? (width < 40 ? 20 : 10),
    };
  };

  tree.computeLayout({ root, availableSpace: maxContentSpace(), measure });

  assert.deepEqual(
    children.map((child) => tree.getUnroundedLayout(child).size.width),
    [120, 40, 20, 40, 30, 30, 120],
  );
});

test("Dimension.Content uses content as the flex basis", () => {
  const tree = new TaffyTree();
  tree.disableRounding();
  const child = tree.newLeaf({
    size: { width: 10 },
    flexBasis: Dimension.Content,
    flexShrink: 0,
  });
  const root = tree.newWithChildren([child], {
    display: Display.Flex,
    size: { width: 100 },
  });

  tree.computeLayout({
    root,
    availableSpace: maxContentSpace(),
    measure: () => ({ width: 40, height: 10 }),
  });

  assert.equal(tree.getUnroundedLayout(child).size.width, 40);
});

test("auto-margin-alignment", () => {
  const baseline = new TaffyTree();
  baseline.disableRounding();
  const marginItem = baseline.newLeaf({
    size: { width: 10, height: 20 },
    margin: { top: Dimension.Auto },
  });
  const sibling = baseline.newLeaf({ size: { width: 10, height: 10 } });
  const baselineRoot = baseline.newWithChildren([marginItem, sibling], {
    display: Display.Flex,
    alignItems: AlignItems.Baseline,
    size: { width: 100, height: 50 },
  });
  baseline.computeLayout({ root: baselineRoot, availableSpace: maxContentSpace() });
  assert.deepEqual(
    [marginItem, sibling].map((node) => baseline.getUnroundedLayout(node).location.y),
    [30, 0],
  );

  const absolute = new TaffyTree();
  absolute.disableRounding();
  const child = absolute.newLeaf({
    position: Position.Absolute,
    inset: { left: 0, right: 0 },
    margin: { left: Dimension.Auto, right: Dimension.Auto },
    maxSize: { width: 50 },
    size: { height: 10 },
  });
  const absoluteRoot = absolute.newWithChildren([child], {
    display: Display.Block,
    size: { width: 100, height: 100 },
  });
  absolute.computeLayout({ root: absoluteRoot, availableSpace: maxContentSpace() });
  const placed = absolute.getUnroundedLayout(child);
  assert.deepEqual({ x: placed.location.x, width: placed.size.width }, { x: 25, width: 50 });
});

test("grid", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf({
    gridRow: { start: GridPlacement.Line(1), end: GridPlacement.Line(2) },
    gridColumn: { start: GridPlacement.Line(1), end: GridPlacement.Line(2) },
  });
  const second = tree.newLeaf({
    gridRow: { start: GridPlacement.Line(2), end: GridPlacement.Line(3) },
    gridColumn: { start: GridPlacement.Line(2), end: GridPlacement.Line(3) },
  });
  const root = tree.newWithChildren([first, second], {
    display: Display.Grid,
    size: { width: 100, height: 50 },
    overflow: { x: Overflow.Scroll, y: Overflow.Scroll },
    scrollbarWidth: 7,
    gridTemplateRows: [singleTrack(20), singleTrack(30)],
    gridTemplateColumns: [singleTrack(40), singleTrack(60)],
  });
  tree.computeLayout({ root, availableSpace: maxContentSpace() });

  assert.deepEqual(tree.getUnroundedLayout(first).size, { width: 40, height: 20 });
  assert.deepEqual(tree.getUnroundedLayout(second).location, { x: 40, y: 20 });
  const layout = tree.getUnroundedLayout(root);
  assert.deepEqual(layout.scrollableOverflowRect, { left: 0, right: 100, top: 0, bottom: 50 });
  assert.deepEqual(layout.scrollbarSize, { width: 7, height: 7 });

  const detail = tree.getDetailedLayoutInfo(root);
  assert.equal(detail.kind, DetailedLayoutInfoKind.Grid);
  assert.ok("value" in detail);
  assert.deepEqual(detail.value.rows, {
    negativeImplicitTracks: 0,
    explicitTracks: 2,
    positiveImplicitTracks: 0,
    positions: [
      { start: 0, end: 20 },
      { start: 20, end: 50 },
    ],
    lineNames: [],
  });
  assert.deepEqual(detail.value.columns, {
    negativeImplicitTracks: 0,
    explicitTracks: 2,
    positiveImplicitTracks: 0,
    positions: [
      { start: 0, end: 40 },
      { start: 40, end: 100 },
    ],
    lineNames: [],
  });
  assert.deepEqual(detail.value.items, [
    { rowStart: 1, rowEnd: 2, columnStart: 1, columnEnd: 2 },
    { rowStart: 2, rowEnd: 3, columnStart: 2, columnEnd: 3 },
  ]);
});

test("grid-repetition-line-names", () => {
  const tree = new TaffyTree();
  tree.disableRounding();
  const track = TrackSizingFunction.Length(10);
  const child = tree.newLeaf({
    gridColumn: { start: GridPlacement.NamedLine("mid", 1), end: GridPlacement.Auto },
    size: { height: 5 },
  });
  const root = tree.newWithChildren([child], {
    display: Display.Grid,
    size: { width: 100, height: 40 },
    gridTemplateColumns: [
      GridTemplateComponent.Repeat(RepetitionCount.Count(2), [track, track], []),
    ],
    gridTemplateColumnNames: [["mid"], ["edge"]],
  });

  tree.computeLayout({ root, availableSpace: maxContentSpace() });
  const placed = tree.getUnroundedLayout(child);
  assert.deepEqual(
    { x: placed.location.x, y: placed.location.y, width: placed.size.width },
    { x: 0, y: 0, width: 10 },
  );
});

test("measure-context", () => {
  const context = { width: 20, height: 10 };
  const tree = new TaffyTree<typeof context>();
  const node = tree.newLeafWithContext(context);
  let calls = 0;
  const options = {
    root: node,
    availableSpace: maxContentSpace(),
    measure(args: { context: typeof context | undefined }) {
      calls += 1;
      assert.equal(args.context, context);
      return { width: args.context?.width ?? 0, height: args.context?.height ?? 0 };
    },
  };

  tree.computeLayout(options);
  assert.equal(calls, 1);
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 20, height: 10 });
  assert.equal(tree.isDirty(node), false);

  context.width = 35;
  tree.markDirty(node);
  assert.equal(tree.isDirty(node), true);
  tree.computeLayout(options);
  assert.equal(calls, 2);
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 35, height: 10 });
  assert.equal(tree.getNodeContext(node), context);
});

test("topology-cache", () => {
  type Context = { width: number; height: number };
  const tree = new TaffyTree<Context>();
  const first = tree.newLeafWithContext({ width: 10, height: 5 });
  const root = tree.newWithChildren([first], { display: Display.Flex });
  assert.equal(tree.getNodeCount(), 2);
  let calls = 0;
  const options = {
    root,
    availableSpace: maxContentSpace(),
    measure: ({ context }: { context: Context | undefined }) => {
      calls += 1;
      assert.ok(context);
      return context;
    },
  };

  tree.computeLayout(options);
  const firstCalls = calls;
  assert.equal(firstCalls > 0, true);
  tree.computeLayout(options);
  assert.equal(calls, firstCalls, "an unchanged tree reuses its cached measurements");

  const second = tree.newLeafWithContext({ width: 20, height: 10 });
  assert.equal(tree.getNodeCount(), 3);
  tree.addChild(root, second);
  assert.equal(tree.getNodeCount(), 3);
  assert.equal(tree.isDirty(root), true);
  tree.computeLayout(options);
  assert.equal(calls > firstCalls, true, "a new child is measured");
  assert.deepEqual(tree.getChildren(root), [first, second]);
  assert.deepEqual(tree.getUnroundedLayout(root).scrollableOverflowRect, {
    left: 0,
    right: 30,
    top: 0,
    bottom: 10,
  });

  tree.removeChild(root, first);
  assert.equal(tree.getNodeCount(), 3);
  assert.equal(tree.isDirty(root), true);
  tree.computeLayout(options);
  assert.equal(tree.isDirty(root), false);
  assert.deepEqual(tree.getChildren(root), [second]);
  assert.deepEqual(tree.getUnroundedLayout(root).scrollableOverflowRect, {
    left: 0,
    right: 20,
    top: 0,
    bottom: 10,
  });

  tree.remove(first);
  assert.equal(tree.getNodeCount(), 2);
  assert.deepEqual(tree.getChildren(root), [second]);
});
