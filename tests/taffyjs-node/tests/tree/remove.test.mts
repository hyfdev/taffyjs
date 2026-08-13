import assert from "node:assert/strict";
import { AvailableSpace, Dimension, type NodeId, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };

const SLOT_MASK = (1n << 32n) - 1n;

function availableSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
}

function compute(tree: TaffyTree, root: NodeId) {
  tree.computeLayout({ root, availableSpace: availableSpace() });
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

function snapshot(tree: TaffyTree, child: NodeId, parent: NodeId, root: NodeId) {
  return {
    count: tree.getNodeCount(),
    childParent: tree.getParent(child),
    parentChildren: [...tree.getChildren(parent)],
    parentParent: tree.getParent(parent),
    rootChildren: [...tree.getChildren(root)],
    context: tree.getNodeContext(child),
    dirty: [tree.isDirty(child), tree.isDirty(parent), tree.isDirty(root)],
    layouts: [tree.getLayout(child), tree.getLayout(parent), tree.getLayout(root)],
  };
}

test("remove-root", () => {
  const tree = new TaffyTree();
  const root = tree.newLeaf({});
  assert.equal(tree.getNodeCount(), 1);

  assert.equal(tree.remove(root), undefined);
  assert.equal(tree.getNodeCount(), 0);
});

test("remove-child", () => {
  const tree = new TaffyTree();
  const grandchild = tree.newLeaf({});
  const child = tree.newWithChildren({}, [grandchild]);
  const parent = tree.newWithChildren({}, [child]);
  assert.equal(tree.getNodeCount(), 3);

  tree.remove(child);
  assert.equal(tree.getNodeCount(), 2);
  assert.deepEqual(tree.getChildren(parent), []);
  assert.equal(tree.getParent(grandchild), null);
  assert.equal(captureError(() => tree.getParent(child)).code, "ERR_TAFFY_STALE_NODE_ID");
});

test("id-stale", () => {
  const tree = new TaffyTree();
  const removed = tree.newLeaf({});
  tree.remove(removed);

  assert.equal(captureError(() => tree.remove(removed)).code, "ERR_TAFFY_STALE_NODE_ID");
  const replacement = tree.newLeaf({});
  assert.equal(replacement & SLOT_MASK, removed & SLOT_MASK, "the native slot is reused");
  assert.notEqual(replacement, removed);
  assert.equal(tree.getParent(replacement), null);
  assert.equal(captureError(() => tree.getParent(removed)).code, "ERR_TAFFY_STALE_NODE_ID");
});

test("parent-not-dirtied", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({
    size: { width: Dimension.Length(30), height: Dimension.Length(10) },
  });
  const parent = tree.newWithChildren({}, [child]);
  const root = tree.newWithChildren({}, [parent]);
  compute(tree, root);
  const parentLayout = tree.getLayout(parent);
  const rootLayout = tree.getLayout(root);
  assert.equal(tree.isDirty(parent), false);
  assert.equal(tree.isDirty(root), false);

  tree.remove(child);
  assert.equal(tree.isDirty(parent), false);
  assert.equal(tree.isDirty(root), false);
  assert.deepEqual(tree.getLayout(parent), parentLayout);
  assert.deepEqual(tree.getLayout(root), rootLayout);

  tree.markDirty(parent);
  assert.equal(tree.isDirty(parent), true);
  assert.equal(tree.isDirty(root), true);
});

test("invalid-atomic", () => {
  const tree = new TaffyTree();
  const context = { retained: true };
  const child = tree.newLeafWithContext({}, context);
  const parent = tree.newWithChildren({}, [child]);
  const root = tree.newWithChildren({}, [parent]);
  const foreign = new TaffyTree().newLeaf({});
  compute(tree, root);
  const before = snapshot(tree, child, parent, root);

  for (const invalid of [1 as never, 0n as never, foreign]) {
    captureError(() => tree.remove(invalid));
    assert.deepEqual(snapshot(tree, child, parent, root), before);
  }

  tree.clear();
  const currentChild = tree.newLeafWithContext({}, context);
  const currentParent = tree.newWithChildren({}, [currentChild]);
  const currentRoot = tree.newWithChildren({}, [currentParent]);
  compute(tree, currentRoot);
  const afterClear = snapshot(tree, currentChild, currentParent, currentRoot);
  assert.equal(captureError(() => tree.remove(child)).code, "ERR_TAFFY_STALE_NODE_ID");
  assert.deepEqual(snapshot(tree, currentChild, currentParent, currentRoot), afterClear);
});
