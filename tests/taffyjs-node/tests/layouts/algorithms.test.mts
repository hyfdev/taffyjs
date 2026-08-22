import assert from "node:assert/strict";
import {
  AvailableSpace,
  Clear,
  DetailedLayoutInfoKind,
  Display,
  Float,
  GridPlacement,
  Position,
  TaffyTree,
  TrackSizingFunction,
  GridTemplateComponent,
  Overflow,
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

// Every fixed layout value below is pinned to the exact Taffy 0.13.0 sources at:
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/block.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/float.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/flexbox.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/grid/mod.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/grid/placement.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/grid/track_sizing.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/mod.rs

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
  assert.deepEqual(block.root.contentSize, { width: 30, height: 32 });

  const flowRoot = computeChildren({ display: Display.FlowRoot, size: { width: 100 } }, [
    {
      display: Display.Block,
      float: Float.Right,
      size: { width: 20, height: 10 },
    },
  ]);
  assert.deepEqual(flowRoot.children[0].location, { x: 80, y: 0 });
  assert.deepEqual(flowRoot.root.contentSize, { width: 100, height: 10 });

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
  assert.deepEqual(layout.contentSize, { width: 100, height: 50 });
  assert.deepEqual(layout.scrollbarSize, { width: 7, height: 7 });

  const detail = tree.getDetailedLayoutInfo(root);
  assert.equal(detail.kind, DetailedLayoutInfoKind.Grid);
  assert.ok("value" in detail);
  assert.deepEqual(detail.value.rows, {
    negativeImplicitTracks: 0,
    explicitTracks: 2,
    positiveImplicitTracks: 0,
    gutters: [0, 0, 0],
    sizes: [20, 30],
  });
  assert.deepEqual(detail.value.columns, {
    negativeImplicitTracks: 0,
    explicitTracks: 2,
    positiveImplicitTracks: 0,
    gutters: [0, 0, 0],
    sizes: [40, 60],
  });
  assert.deepEqual(detail.value.items, [
    { rowStart: 1, rowEnd: 2, columnStart: 1, columnEnd: 2 },
    { rowStart: 2, rowEnd: 3, columnStart: 2, columnEnd: 3 },
  ]);
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
  assert.deepEqual(tree.getUnroundedLayout(root).contentSize, { width: 30, height: 10 });

  tree.removeChild(root, first);
  assert.equal(tree.getNodeCount(), 3);
  assert.equal(tree.isDirty(root), true);
  tree.computeLayout(options);
  assert.equal(tree.isDirty(root), false);
  assert.deepEqual(tree.getChildren(root), [second]);
  assert.deepEqual(tree.getUnroundedLayout(root).contentSize, { width: 20, height: 10 });

  tree.remove(first);
  assert.equal(tree.getNodeCount(), 2);
  assert.deepEqual(tree.getChildren(root), [second]);
});
