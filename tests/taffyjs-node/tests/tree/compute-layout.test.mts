import assert from "node:assert/strict";
import {
  AvailableSpace,
  Dimension,
  Display,
  Float,
  type NodeId,
  Position,
  TaffyTree,
} from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };

function maxContentSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
}

function captureError(body: () => unknown): CodedError {
  try {
    body();
  } catch (error) {
    assert.ok(error instanceof Error);
    return error;
  }
  assert.fail("Expected operation to throw");
}

function wrapperState(tree: TaffyTree, nodes: readonly NodeId[]) {
  return {
    count: tree.getNodeCount(),
    nodes: nodes.map((node) => ({
      node,
      parent: tree.getParent(node),
      children: [...tree.getChildren(node)],
      context: tree.getNodeContext(node),
    })),
  };
}

test("algorithms", () => {
  // Pinned upstream routing, cache, and hidden-layout sources for these values:
  // https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/tree/taffy_tree.rs#L284-L329
  // https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/compute/mod.rs#L278-L290
  const cases = [
    ["Flex", Display.Flex, {}],
    ["Grid", Display.Grid, {}],
    ["Block", Display.Block, {}],
    ["Float", Display.Block, { float: Float.Left }],
    ["FlowRoot", Display.FlowRoot, {}],
  ] as const;

  for (const [name, display, childExtra] of cases) {
    const tree = new TaffyTree();
    const child = tree.newLeaf({
      size: { width: 30, height: 10 },
      ...childExtra,
    });
    const root = tree.newWithChildren([child], {
      display,
      size: { width: 100, height: 50 },
    });

    tree.computeLayout({ root, availableSpace: maxContentSpace() });
    const rootLayout = tree.getUnroundedLayout(root);
    const childLayout = tree.getUnroundedLayout(child);
    assert.deepEqual(rootLayout.location, { x: 0, y: 0 }, name);
    assert.deepEqual(rootLayout.size, { width: 100, height: 50 }, name);
    assert.deepEqual(
      rootLayout.scrollableOverflowRect,
      { left: 0, right: 30, top: 0, bottom: 10 },
      name,
    );
    assert.deepEqual(childLayout.location, { x: 0, y: 0 }, name);
    assert.deepEqual(childLayout.size, { width: 30, height: 10 }, name);
  }

  const noneTree = new TaffyTree();
  const noneChild = noneTree.newLeaf({
    size: { width: 30, height: 10 },
  });
  const noneRoot = noneTree.newWithChildren([noneChild], {
    display: Display.None,
    size: { width: 100, height: 50 },
  });
  noneTree.computeLayout({ root: noneRoot, availableSpace: maxContentSpace() });
  for (const node of [noneRoot, noneChild]) {
    const layout = noneTree.getUnroundedLayout(node);
    assert.deepEqual(layout.location, { x: 0, y: 0 });
    assert.deepEqual(layout.size, { width: 0, height: 0 });
    assert.deepEqual(layout.scrollableOverflowRect, { left: 0, right: 0, top: 0, bottom: 0 });
  }
});

test("percentage-content", () => {
  // Pinned upstream block percentage and scrollable-overflow source for these values:
  // https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/compute/block.rs#L566-L746
  const tree = new TaffyTree();
  const child = tree.newLeaf({
    size: { width: Dimension.Percent(50), height: 80 },
  });
  const root = tree.newWithChildren([child], {
    display: Display.Block,
    size: { width: 200, height: 50 },
  });

  tree.computeLayout({ root, availableSpace: maxContentSpace() });
  assert.deepEqual(tree.getUnroundedLayout(child).size, { width: 100, height: 80 });
  assert.deepEqual(tree.getUnroundedLayout(root).scrollableOverflowRect, {
    left: 0,
    right: 100,
    top: 0,
    bottom: 80,
  });
});

test("scrollable-overflow", () => {
  // Pinned upstream scrollable-overflow sources for these values:
  // https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/compute/common/scrollable_overflow.rs
  // https://github.com/DioxusLabs/taffy/blob/77f385683c1d698c91a23a259f87fdddf26925fb/src/compute/block.rs
  const padded = new TaffyTree();
  padded.disableRounding();
  const paddedChild = padded.newLeaf({ size: { width: 30, height: 20 } });
  const paddedRoot = padded.newWithChildren([paddedChild], {
    display: Display.Block,
    size: { width: 40, height: 30 },
    padding: 10,
  });
  padded.computeLayout({ root: paddedRoot, availableSpace: { width: 40, height: 30 } });
  assert.deepEqual(padded.getUnroundedLayout(paddedRoot).scrollableOverflowRect, {
    left: 0,
    right: 40,
    top: 0,
    bottom: 30,
  });

  const overflowing = new TaffyTree();
  overflowing.disableRounding();
  const absolute = overflowing.newLeaf({
    position: Position.Absolute,
    inset: { left: -20, top: -20 },
    size: { width: 30, height: 30 },
  });
  const overflowingRoot = overflowing.newWithChildren([absolute], {
    display: Display.Block,
    size: { width: 10, height: 10 },
  });
  overflowing.computeLayout({ root: overflowingRoot, availableSpace: { width: 10, height: 10 } });
  assert.deepEqual(overflowing.getUnroundedLayout(overflowingRoot).scrollableOverflowRect, {
    left: -20,
    right: 10,
    top: -20,
    bottom: 10,
  });
});

test("stored-output", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: 64, height: 32 },
  });
  assert.deepEqual(tree.getLayout(node).size, { width: 0, height: 0 });

  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.deepEqual(tree.getLayout(node).size, { width: 64, height: 32 });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 64, height: 32 });
});

test("cache", () => {
  const tree = new TaffyTree();
  const root = tree.newLeafWithContext(true);
  const availableSpace = maxContentSpace();
  let calls = 0;
  tree.computeLayout({
    root,
    availableSpace,
    measure() {
      calls += 1;
      return { width: 30, height: 10 };
    },
  });
  assert.equal(calls > 0, true);
  const first = tree.getUnroundedLayout(root);

  tree.computeLayout({ root, availableSpace });
  const second = tree.getUnroundedLayout(root);
  assert.deepEqual(second, first);
});

test("rounding", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: 10.5, height: 6.25 },
  });
  const options = { root: node, availableSpace: maxContentSpace() };

  tree.disableRounding();
  tree.computeLayout(options);
  assert.deepEqual(tree.getLayout(node).size, { width: 10.5, height: 6.25 });

  tree.enableRounding();
  tree.computeLayout(options);
  assert.deepEqual(tree.getLayout(node).size, { width: 11, height: 6 });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 10.5, height: 6.25 });
});

test("invalid-space", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: 20, height: 10 },
  });
  const invalidSpaces = [
    null,
    [],
    { width: AvailableSpace.MinContent },
    { width: { kind: 99 }, height: AvailableSpace.MinContent },
  ];

  for (const availableSpace of invalidSpaces) {
    captureError(() => tree.computeLayout({ root: node, availableSpace: availableSpace as never }));
    assert.deepEqual(tree.getLayout(node).size, { width: 0, height: 0 });
  }
});

test("no-measure", () => {
  const tree = new TaffyTree();
  const node = tree.newLeafWithContext({ measured: true });
  let calls = 0;
  tree.computeLayout({
    root: node,
    availableSpace: maxContentSpace(),
    measure() {
      calls += 1;
      return { width: 30, height: 10 };
    },
  });
  assert.equal(calls > 0, true);
  const callsBeforePlainCompute = calls;
  tree.setStyle(node, {});

  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.equal(calls, callsBeforePlainCompute);
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 0, height: 0 });
});

test("wrapper-atomic", () => {
  const tree = new TaffyTree();
  const context = { unchanged: true };
  const child = tree.newLeafWithContext(context);
  const root = tree.newWithChildren([child]);
  const nodes = [child, root];
  const before = wrapperState(tree, nodes);

  captureError(() =>
    tree.computeLayout({
      root,
      availableSpace: { width: AvailableSpace.MinContent } as never,
    }),
  );
  assert.deepEqual(wrapperState(tree, nodes), before);

  captureError(() => tree.computeLayout(null as never));
  assert.deepEqual(wrapperState(tree, nodes), before);
});
