import assert from "node:assert/strict";
import { Display, type NodeId, TaffyTree } from "@taffyjs/node";
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

test("empty", () => {
  const tree = new TaffyTree();
  const root = tree.newWithChildren([], { flexGrow: 2 });

  assert.equal(tree.getNodeCount(), 1);
  assert.equal(tree.getStyle(root).flexGrow, 2);
  assert.equal(tree.getParent(root), null);
  assert.deepEqual(tree.getChildren(root), []);
});

test("default-style", () => {
  const tree = new TaffyTree();
  const omitted = tree.newWithChildren([]);
  const explicitUndefined = tree.newWithChildren([], undefined);

  assert.deepEqual(tree.getStyle(explicitUndefined), tree.getStyle(omitted));
  assert.deepEqual(tree.getChildren(omitted), []);
  assert.deepEqual(tree.getChildren(explicitUndefined), []);
});

test("ordered-children", () => {
  const tree = new TaffyTree();
  const children = [tree.newLeaf(), tree.newLeaf(), tree.newLeaf()];
  const parent = tree.newWithChildren(children);

  assert.equal(tree.getNodeCount(), 4);
  assert.deepEqual(tree.getChildren(parent), children);
  for (const child of children) assert.equal(tree.getParent(child), parent);
});

test("duplicate", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({ flexGrow: 1 });

  const error = captureError(() => tree.newWithChildren([child, child]));
  assert.equal(error.code, "ERR_TAFFY_INVALID_TOPOLOGY");
  assert.equal(tree.getNodeCount(), 1);
  assert.equal(tree.getStyle(child).flexGrow, 1);

  const parent = tree.newWithChildren([child]);
  assert.equal(tree.getNodeCount(), 2);
  assert.equal(tree.getStyle(parent).display, Display.Flex);
});

test("attached", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf();
  const firstParent = tree.newWithChildren([child]);

  const error = captureError(() => tree.newWithChildren([child]));
  assert.equal(error.code, "ERR_TAFFY_INVALID_TOPOLOGY");
  assert.equal(tree.getNodeCount(), 2);
  assert.equal(tree.getParent(child), firstParent);
  assert.deepEqual(tree.getChildren(firstParent), [child]);
});

test("invalid-id", () => {
  const tree = new TaffyTree();
  const foreign = new TaffyTree().newLeaf();

  assert.equal(
    captureError(() => tree.newWithChildren([foreign], { display: 999 } as never)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );
  assert.equal(tree.getNodeCount(), 0);

  const stale = tree.newLeaf();
  tree.clear();
  assert.equal(
    captureError(() => tree.newWithChildren([stale], { display: 999 } as never)).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
  assert.equal(tree.getNodeCount(), 0);
});

test("failure-atomic", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf();
  const second = tree.newLeaf();
  const before = topology(tree, [first, second]);

  assert.throws(() => tree.newWithChildren([first, second], { display: 999 } as never), RangeError);
  assert.deepEqual(topology(tree, [first, second]), before);

  assert.equal(
    captureError(() => tree.newWithChildren([first, first])).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
  assert.deepEqual(topology(tree, [first, second]), before);

  assert.throws(() => tree.newWithChildren({} as unknown as readonly NodeId[]), TypeError);
  assert.deepEqual(topology(tree, [first, second]), before);
});
