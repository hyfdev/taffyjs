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
  const [first, second] = [tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second]);
  const start = tree.newLeaf({});
  const middle = tree.newLeaf({});
  const end = tree.newLeaf({});

  tree.insertChildAtIndex(parent, 0, start);
  assert.deepEqual(tree.getChildren(parent), [start, first, second]);
  tree.insertChildAtIndex(parent, 2, middle);
  assert.deepEqual(tree.getChildren(parent), [start, first, middle, second]);
  tree.insertChildAtIndex(parent, 4, end);
  assert.deepEqual(tree.getChildren(parent), [start, first, middle, second, end]);
  for (const child of [start, middle, end]) assert.equal(tree.getParent(child), parent);
});

test("end-bound", () => {
  const tree = new TaffyTree();
  const parent = tree.newLeaf({});
  const first = tree.newLeaf({});
  const second = tree.newLeaf({});

  tree.insertChildAtIndex(parent, 0, first);
  tree.insertChildAtIndex(parent, 1, second);
  assert.deepEqual(tree.getChildren(parent), [first, second]);
});

test("index-errors", () => {
  const tree = new TaffyTree();
  const parent = tree.newLeaf({});
  const child = tree.newLeaf({});

  for (const index of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53]) {
    const error = captureError(() => tree.insertChildAtIndex(parent, index, child));
    assert.equal(error.constructor, RangeError);
    assert.equal(error.code, undefined);
  }
  assert.equal(
    captureError(() => tree.insertChildAtIndex(parent, "0" as unknown as number, child))
      .constructor,
    TypeError,
  );

  for (const index of [1, Number.MAX_SAFE_INTEGER]) {
    const error = captureError(() => tree.insertChildAtIndex(parent, index, child));
    assert.equal(error.constructor, RangeError);
    assert.equal(error.code, "ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS");
  }
  assert.deepEqual(tree.getChildren(parent), []);
  assert.equal(tree.getParent(child), null);
});

test("id-roles", () => {
  const tree = new TaffyTree();
  const parent = tree.newLeaf({});
  const child = tree.newLeaf({});
  const foreign = new TaffyTree().newLeaf({});

  assert.equal(
    captureError(() => tree.insertChildAtIndex(1 as never, 0, child)).constructor,
    TypeError,
  );
  assert.equal(
    captureError(() => tree.insertChildAtIndex(parent, 0, 0n as never)).code,
    "ERR_TAFFY_INVALID_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.insertChildAtIndex(foreign, 0, child)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.insertChildAtIndex(parent, 0, foreign)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );

  const staleParent = tree.newLeaf({});
  const staleChild = tree.newLeaf({});
  tree.clear();
  const currentParent = tree.newLeaf({});
  const currentChild = tree.newLeaf({});
  assert.equal(
    captureError(() => tree.insertChildAtIndex(staleParent, 0, currentChild)).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.insertChildAtIndex(currentParent, 0, staleChild)).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
});

test("failure-atomic", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  const other = tree.newLeaf({});
  const nodes = [child, parent, other];
  const before = topology(tree, nodes);

  assert.equal(
    captureError(() => tree.insertChildAtIndex(other, 0, child)).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
  assert.deepEqual(topology(tree, nodes), before);

  assert.equal(
    captureError(() => tree.insertChildAtIndex(parent, 3, other)).code,
    "ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS",
  );
  assert.deepEqual(topology(tree, nodes), before);
});
