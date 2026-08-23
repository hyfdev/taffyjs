import assert from "node:assert/strict";
import { type NodeId, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };

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
      node,
      parent: tree.getParent(node),
      children: [...tree.getChildren(node)],
    })),
  };
}

test("positions", () => {
  const tree = new TaffyTree();
  const children = [tree.newLeaf(), tree.newLeaf(), tree.newLeaf(), tree.newLeaf(), tree.newLeaf()];
  const parent = tree.newWithChildren(children);

  assert.equal(tree.removeChildAtIndex(parent, 0), children[0]);
  assert.deepEqual(tree.getChildren(parent), children.slice(1));
  assert.equal(tree.removeChildAtIndex(parent, 1), children[2]);
  assert.deepEqual(tree.getChildren(parent), [children[1], children[3], children[4]]);
  assert.equal(tree.removeChildAtIndex(parent, 2), children[4]);
  assert.deepEqual(tree.getChildren(parent), [children[1], children[3]]);
});

test("returned-id", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf();
  const parent = tree.newWithChildren([child]);
  const nextParent = tree.newLeaf();
  const count = tree.getNodeCount();

  const removed = tree.removeChildAtIndex(parent, 0);
  assert.equal(removed, child);
  assert.equal(tree.getParent(child), null);
  assert.equal(tree.getNodeCount(), count);
  tree.addChild(nextParent, removed);
  assert.equal(tree.getParent(child), nextParent);
});

test("bounds", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf();
  const parent = tree.newWithChildren([child]);
  const emptyParent = tree.newLeaf();

  for (const [target, index] of [
    [emptyParent, 0],
    [parent, 1],
    [parent, Number.MAX_SAFE_INTEGER],
  ] as const) {
    const error = captureError(() => tree.removeChildAtIndex(target, index));
    assert.equal(error.constructor, RangeError);
    assert.equal(error.code, "ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS");
  }
});

test("integer", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf();
  const parent = tree.newWithChildren([child]);

  for (const index of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53]) {
    const error = captureError(() => tree.removeChildAtIndex(parent, index));
    assert.equal(error.constructor, RangeError);
    assert.equal(error.code, undefined);
  }
  assert.equal(
    captureError(() => tree.removeChildAtIndex(parent, "0" as unknown as number)).constructor,
    TypeError,
  );
});

test("failure-atomic", () => {
  const tree = new TaffyTree();
  const [first, second] = [tree.newLeaf(), tree.newLeaf()];
  const parent = tree.newWithChildren([first, second]);
  const nodes = [first, second, parent];
  const before = topology(tree, nodes);

  const rejectedCalls = [
    () => tree.removeChildAtIndex(parent, 2),
    () => tree.removeChildAtIndex(parent, -1),
    () => tree.removeChildAtIndex(parent, 0.5),
    () => tree.removeChildAtIndex(parent, "0" as unknown as number),
  ];

  for (const rejectedCall of rejectedCalls) {
    captureError(rejectedCall);
    assert.deepEqual(topology(tree, nodes), before);
  }
});
