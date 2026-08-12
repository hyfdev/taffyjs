import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type CodedError = Error & { code?: string };
type Tree = {
  clear(): void;
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  getChildren(parent: bigint): readonly bigint[];
  getLayout(node: bigint): object;
  getNodeContext(node: bigint): unknown;
  getNodeCount(): number;
  getParent(node: bigint): bigint | null;
  isDirty(node: bigint): boolean;
  markDirty(node: bigint): void;
  newLeaf(style: object): bigint;
  newLeafWithContext(style: object, context: unknown): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  remove(node: bigint): void;
};
type TreeConstructor = new () => Tree;

const SLOT_MASK = (1n << 32n) - 1n;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(typeof Reflect.get(value.prototype, "remove"), "function", "remove is public");
  return value as unknown as TreeConstructor;
}

function availableSpace() {
  return { width: api.AvailableSpace.MaxContent, height: api.AvailableSpace.MaxContent };
}

function compute(tree: Tree, root: bigint) {
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

function snapshot(tree: Tree, child: bigint, parent: bigint, root: bigint) {
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

contractTest("API-TREE-008/remove-root", () => {
  const tree = new (TaffyTree())();
  const root = tree.newLeaf({});
  assert.equal(tree.getNodeCount(), 1);

  assert.equal(tree.remove(root), undefined);
  assert.equal(tree.getNodeCount(), 0);
});

contractTest("API-TREE-008/remove-child", () => {
  const tree = new (TaffyTree())();
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

contractTest("API-TREE-008/id-stale", () => {
  const tree = new (TaffyTree())();
  const removed = tree.newLeaf({});
  tree.remove(removed);

  assert.equal(captureError(() => tree.remove(removed)).code, "ERR_TAFFY_STALE_NODE_ID");
  const replacement = tree.newLeaf({});
  assert.equal(replacement & SLOT_MASK, removed & SLOT_MASK, "the native slot is reused");
  assert.notEqual(replacement, removed);
  assert.equal(tree.getParent(replacement), null);
  assert.equal(captureError(() => tree.getParent(removed)).code, "ERR_TAFFY_STALE_NODE_ID");
});

contractTest("API-TREE-008/parent-not-dirtied", () => {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({
    size: { width: api.Dimension.Length(30), height: api.Dimension.Length(10) },
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

contractTest("API-TREE-008/invalid-atomic", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const context = { retained: true };
  const child = tree.newLeafWithContext({}, context);
  const parent = tree.newWithChildren({}, [child]);
  const root = tree.newWithChildren({}, [parent]);
  const foreign = new Tree().newLeaf({});
  compute(tree, root);
  const before = snapshot(tree, child, parent, root);

  for (const invalid of [1 as never, 0n, foreign]) {
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
