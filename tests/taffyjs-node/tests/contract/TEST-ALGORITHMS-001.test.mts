import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  AvailableSpace,
  Clear,
  DetailedLayoutInfoKind,
  Dimension,
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
import { contractTest } from "../contract-test.mts";

function maxContentSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
}

function definiteWidth(width: number) {
  return { width: AvailableSpace.Definite(width), height: AvailableSpace.MaxContent };
}

function singleTrack(value: number) {
  return GridTemplateComponent.Single(TrackSizingFunction.Length(value));
}

function computeChildren(rootStyle: StyleInput, childStyles: readonly StyleInput[]) {
  const tree = new TaffyTree();
  const children = childStyles.map((style) => tree.newLeaf(style));
  const root = tree.newWithChildren(rootStyle, children);
  tree.computeLayout({ root, availableSpace: definiteWidth(100) });
  return {
    root: tree.getUnroundedLayout(root),
    children: children.map((child) => tree.getUnroundedLayout(child)),
  };
}

contractTest("TEST-ALGORITHMS-001/block-float", () => {
  // These fixed values follow the pinned Taffy block and float fixtures.
  const block = computeChildren(
    { display: Display.Block, size: { width: Dimension.Length(100) } },
    [
      {
        display: Display.Block,
        float: Float.Left,
        size: { width: Dimension.Length(20), height: Dimension.Length(10) },
      },
      {
        display: Display.Block,
        clear: Clear.Left,
        size: { width: Dimension.Length(30), height: Dimension.Length(5) },
      },
      {
        display: Display.Block,
        position: Position.Relative,
        inset: { left: Dimension.Length(5), top: Dimension.Length(7) },
        size: { width: Dimension.Length(10), height: Dimension.Length(10) },
      },
    ],
  );
  assert.deepEqual(block.children[0].location, { x: 0, y: 0 });
  assert.deepEqual(block.children[1].location, { x: 0, y: 10 });
  assert.deepEqual(block.children[2].location, { x: 5, y: 22 });
  assert.deepEqual(block.root.contentSize, { width: 30, height: 32 });

  const flowRoot = computeChildren(
    { display: Display.FlowRoot, size: { width: Dimension.Length(100) } },
    [
      {
        display: Display.Block,
        float: Float.Right,
        size: { width: Dimension.Length(20), height: Dimension.Length(10) },
      },
    ],
  );
  assert.deepEqual(flowRoot.children[0].location, { x: 80, y: 0 });
  assert.deepEqual(flowRoot.root.contentSize, { width: 100, height: 10 });

  const positioned = computeChildren(
    {
      display: Display.Block,
      size: { width: Dimension.Length(100), height: Dimension.Length(50) },
    },
    [
      {
        position: Position.Absolute,
        inset: { left: Dimension.Length(12), top: Dimension.Length(9) },
        size: { width: Dimension.Length(10), height: Dimension.Length(10) },
      },
      { size: { width: Dimension.Length(10), height: Dimension.Length(10) } },
    ],
  );
  assert.deepEqual(positioned.children[0].location, { x: 12, y: 9 });
  assert.deepEqual(positioned.children[1].location, { x: 0, y: 0 });
});

contractTest("TEST-ALGORITHMS-001/flex", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf({
    flexGrow: 1,
    size: { width: Dimension.Length(10), height: Dimension.Length(10) },
  });
  const second = tree.newLeaf({
    flexGrow: 1,
    size: { width: Dimension.Length(10), height: Dimension.Length(10) },
  });
  const root = tree.newWithChildren(
    {
      display: Display.Flex,
      size: { width: Dimension.Length(101), height: Dimension.Length(20) },
    },
    [first, second],
  );
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

contractTest("TEST-ALGORITHMS-001/grid", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf({
    gridRow: { start: GridPlacement.Line(1), end: GridPlacement.Line(2) },
    gridColumn: { start: GridPlacement.Line(1), end: GridPlacement.Line(2) },
  });
  const second = tree.newLeaf({
    gridRow: { start: GridPlacement.Line(2), end: GridPlacement.Line(3) },
    gridColumn: { start: GridPlacement.Line(2), end: GridPlacement.Line(3) },
  });
  const root = tree.newWithChildren(
    {
      display: Display.Grid,
      size: { width: Dimension.Length(100), height: Dimension.Length(50) },
      overflow: { x: Overflow.Scroll, y: Overflow.Scroll },
      scrollbarWidth: 7,
      gridTemplateRows: [singleTrack(20), singleTrack(30)],
      gridTemplateColumns: [singleTrack(40), singleTrack(60)],
    },
    [first, second],
  );
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

contractTest("TEST-ALGORITHMS-001/measure-context", () => {
  const context = { width: 20, height: 10 };
  const tree = new TaffyTree<typeof context>();
  const node = tree.newLeafWithContext({}, context);
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

  tree.computeLayoutWithMeasure(options);
  assert.equal(calls, 1);
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 20, height: 10 });
  assert.equal(tree.isDirty(node), false);

  context.width = 35;
  tree.markDirty(node);
  assert.equal(tree.isDirty(node), true);
  tree.computeLayoutWithMeasure(options);
  assert.equal(calls, 2);
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 35, height: 10 });
  assert.equal(tree.getNodeContext(node), context);
});

contractTest("TEST-ALGORITHMS-001/topology-cache", () => {
  type Context = { width: number; height: number };
  const tree = new TaffyTree<Context>();
  const first = tree.newLeafWithContext({}, { width: 10, height: 5 });
  const root = tree.newWithChildren({ display: Display.Flex }, [first]);
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

  tree.computeLayoutWithMeasure(options);
  const firstCalls = calls;
  assert.equal(firstCalls > 0, true);
  tree.computeLayoutWithMeasure(options);
  assert.equal(calls, firstCalls, "an unchanged tree reuses its cached measurements");

  const second = tree.newLeafWithContext({}, { width: 20, height: 10 });
  tree.addChild(root, second);
  assert.equal(tree.isDirty(root), true);
  tree.computeLayoutWithMeasure(options);
  assert.equal(calls > firstCalls, true, "a new child is measured");
  assert.deepEqual(tree.getChildren(root), [first, second]);
  assert.deepEqual(tree.getUnroundedLayout(root).contentSize, { width: 30, height: 10 });

  tree.removeChild(root, first);
  assert.equal(tree.isDirty(root), true);
  tree.computeLayoutWithMeasure(options);
  assert.equal(tree.isDirty(root), false);
  assert.deepEqual(tree.getChildren(root), [second]);
  assert.deepEqual(tree.getUnroundedLayout(root).contentSize, { width: 20, height: 10 });
});

contractTest("TEST-ALGORITHMS-001/public-only", async () => {
  const source = await readFile(new URL(import.meta.url), "utf8");
  const imports = Array.from(
    source.matchAll(/(?:from\s+|import\s+)["']([^"']+)["']/g),
    (match) => match[1],
  );
  assert.deepEqual(
    new Set(imports),
    new Set(["node:assert/strict", "node:fs/promises", "@taffyjs/node", "../contract-test.mts"]),
  );
});
