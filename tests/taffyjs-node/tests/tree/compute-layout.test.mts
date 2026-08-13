import assert from "node:assert/strict";
import { AvailableSpace, Dimension, Display, Float, type NodeId, TaffyTree } from "@taffyjs/node";
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
  // https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/tree/taffy_tree.rs#L250-L323
  // https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/compute/mod.rs#L275-L303
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
      size: { width: Dimension.Length(30), height: Dimension.Length(10) },
      ...childExtra,
    });
    const root = tree.newWithChildren(
      {
        display,
        size: { width: Dimension.Length(100), height: Dimension.Length(50) },
      },
      [child],
    );

    tree.computeLayout({ root, availableSpace: maxContentSpace() });
    const rootLayout = tree.getUnroundedLayout(root);
    const childLayout = tree.getUnroundedLayout(child);
    assert.deepEqual(rootLayout.location, { x: 0, y: 0 }, name);
    assert.deepEqual(rootLayout.size, { width: 100, height: 50 }, name);
    assert.deepEqual(rootLayout.contentSize, { width: 30, height: 10 }, name);
    assert.deepEqual(childLayout.location, { x: 0, y: 0 }, name);
    assert.deepEqual(childLayout.size, { width: 30, height: 10 }, name);
  }

  const noneTree = new TaffyTree();
  const noneChild = noneTree.newLeaf({
    size: { width: Dimension.Length(30), height: Dimension.Length(10) },
  });
  const noneRoot = noneTree.newWithChildren(
    {
      display: Display.None,
      size: { width: Dimension.Length(100), height: Dimension.Length(50) },
    },
    [noneChild],
  );
  noneTree.computeLayout({ root: noneRoot, availableSpace: maxContentSpace() });
  for (const node of [noneRoot, noneChild]) {
    const layout = noneTree.getUnroundedLayout(node);
    assert.deepEqual(layout.location, { x: 0, y: 0 });
    assert.deepEqual(layout.size, { width: 0, height: 0 });
    assert.deepEqual(layout.contentSize, { width: 0, height: 0 });
  }
});

test("percentage-content", () => {
  // Pinned upstream block percentage and content-size source for these values:
  // https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/compute/block.rs#L548-L707
  const tree = new TaffyTree();
  const child = tree.newLeaf({
    size: { width: Dimension.Percent(50), height: Dimension.Length(80) },
  });
  const root = tree.newWithChildren(
    {
      display: Display.Block,
      size: { width: Dimension.Length(200), height: Dimension.Length(50) },
    },
    [child],
  );

  tree.computeLayout({ root, availableSpace: maxContentSpace() });
  assert.deepEqual(tree.getUnroundedLayout(child).size, { width: 100, height: 80 });
  assert.deepEqual(tree.getUnroundedLayout(root).contentSize, { width: 100, height: 80 });
});

test("stored-output", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: Dimension.Length(64), height: Dimension.Length(32) },
  });
  assert.deepEqual(tree.getLayout(node).size, { width: 0, height: 0 });

  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.deepEqual(tree.getLayout(node).size, { width: 64, height: 32 });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 64, height: 32 });
});

test("cache", () => {
  const tree = new TaffyTree();
  const root = tree.newLeafWithContext({}, true);
  const availableSpace = maxContentSpace();
  let calls = 0;
  tree.computeLayoutWithMeasure({
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
    size: { width: Dimension.Length(10.5), height: Dimension.Length(6.25) },
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

test("invalid-root", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({});
  const foreign = new TaffyTree().newLeaf({});
  const options = (root: NodeId) => ({ root, availableSpace: maxContentSpace() });

  assert.equal(captureError(() => tree.computeLayout(options(1 as never))).constructor, TypeError);
  assert.equal(
    captureError(() => tree.computeLayout(options(0n as never))).code,
    "ERR_TAFFY_INVALID_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.computeLayout(options(foreign))).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );
  assert.deepEqual(tree.getLayout(node).size, { width: 0, height: 0 });

  tree.clear();
  assert.equal(
    captureError(() => tree.computeLayout(options(node))).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
});

test("invalid-space", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: Dimension.Length(20), height: Dimension.Length(10) },
  });
  const invalidSpaces = [
    null,
    [],
    { width: AvailableSpace.MinContent },
    { width: 1, height: AvailableSpace.MinContent },
    { width: { kind: 99 }, height: AvailableSpace.MinContent },
  ];

  for (const availableSpace of invalidSpaces) {
    captureError(() => tree.computeLayout({ root: node, availableSpace: availableSpace as never }));
    assert.deepEqual(tree.getLayout(node).size, { width: 0, height: 0 });
  }
});

test("no-measure", () => {
  const tree = new TaffyTree();
  const node = tree.newLeafWithContext({}, { measured: true });
  let calls = 0;
  tree.computeLayoutWithMeasure({
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
  const child = tree.newLeafWithContext({}, context);
  const root = tree.newWithChildren({}, [child]);
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
