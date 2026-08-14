import assert from "node:assert/strict";
import { AvailableSpace, TaffyTree, type NodeId } from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };

const maxContentSpace = () => ({
  width: AvailableSpace.MaxContent,
  height: AvailableSpace.MaxContent,
});

function captureError(body: () => unknown): CodedError {
  try {
    body();
  } catch (error) {
    assert.ok(error instanceof Error);
    return error;
  }
  assert.fail("Expected operation to throw");
}

function topology(tree: TaffyTree, nodes: readonly NodeId[]) {
  return {
    count: tree.getNodeCount(),
    nodes: nodes.map((node) => ({
      parent: tree.getParent(node),
      children: tree.getChildren(node),
    })),
  };
}

test("a rejected index leaves topology unchanged", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  const spare = tree.newLeaf({});
  const nodes = [child, parent, spare];
  const before = topology(tree, nodes);

  const error = captureError(() => tree.insertChildAtIndex(parent, -1, spare));
  assert.equal(error.constructor, RangeError);
  assert.equal(error.code, undefined);
  assert.deepEqual(topology(tree, nodes), before);
});

test("a rejected child array leaves topology unchanged", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf({});
  const second = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [first, second]);
  const nodes = [first, second, parent];
  const before = topology(tree, nodes);

  const error = captureError(() => tree.setChildren(parent, [first, first]));
  assert.equal(error.constructor, Error);
  assert.equal(error.code, "ERR_TAFFY_INVALID_TOPOLOGY");
  assert.deepEqual(topology(tree, nodes), before);
});

test("a measure callback failure preserves wrapper state and the tree recovers", () => {
  const tree = new TaffyTree<{ label: string }>();
  const context = { label: "measured" };
  const node = tree.newLeafWithContext({}, context);
  const before = {
    count: tree.getNodeCount(),
    parent: tree.getParent(node),
    children: tree.getChildren(node),
    style: tree.getStyle(node),
    context: tree.getNodeContext(node),
  };
  const thrown = { reason: "expected" };

  assert.throws(
    () =>
      tree.computeLayoutWithMeasure({
        root: node,
        availableSpace: maxContentSpace(),
        measure() {
          throw thrown;
        },
      }),
    (error) => error === thrown,
  );
  assert.deepEqual(
    {
      count: tree.getNodeCount(),
      parent: tree.getParent(node),
      children: tree.getChildren(node),
      style: tree.getStyle(node),
      context: tree.getNodeContext(node),
    },
    before,
  );
  assert.equal(tree.isDirty(node), true);

  tree.computeLayoutWithMeasure({
    root: node,
    availableSpace: maxContentSpace(),
    measure: () => ({ width: 12, height: 8 }),
  });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 12, height: 8 });
});
