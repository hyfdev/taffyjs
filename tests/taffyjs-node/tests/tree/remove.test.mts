import assert from "node:assert/strict";
import { AvailableSpace, type NodeId, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

const SLOT_MASK = (1n << 32n) - 1n;

function availableSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
}

function compute(tree: TaffyTree, root: NodeId) {
  tree.computeLayout({ root, availableSpace: availableSpace() });
}

test("remove-root", () => {
  const tree = new TaffyTree();
  const root = tree.newLeaf();
  assert.equal(tree.getNodeCount(), 1);

  assert.equal(tree.remove(root), undefined);
  assert.equal(tree.getNodeCount(), 0);
});

test("remove-child", () => {
  const tree = new TaffyTree();
  const grandchild = tree.newLeaf();
  const child = tree.newWithChildren([grandchild]);
  const parent = tree.newWithChildren([child]);
  assert.equal(tree.getNodeCount(), 3);

  tree.remove(child);
  assert.equal(tree.getNodeCount(), 2);
  assert.deepEqual(tree.getChildren(parent), []);
  assert.equal(tree.getParent(grandchild), null);
});

test("slot-reuse", () => {
  const tree = new TaffyTree();
  const removed = tree.newLeaf();
  tree.remove(removed);

  const replacement = tree.newLeaf();
  assert.equal(replacement & SLOT_MASK, removed & SLOT_MASK, "the native slot is reused");
  assert.notEqual(replacement, removed);
  assert.equal(tree.getParent(replacement), null);
});

test("parent-dirtied", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({
    size: { width: 30, height: 10 },
  });
  const parent = tree.newWithChildren([child]);
  const root = tree.newWithChildren([parent]);
  compute(tree, root);
  const parentLayout = tree.getLayout(parent);
  const rootLayout = tree.getLayout(root);
  assert.equal(tree.isDirty(parent), false);
  assert.equal(tree.isDirty(root), false);

  tree.remove(child);
  assert.equal(tree.isDirty(parent), true);
  assert.equal(tree.isDirty(root), true);
  assert.deepEqual(tree.getLayout(parent), parentLayout);
  assert.deepEqual(tree.getLayout(root), rootLayout);
});
