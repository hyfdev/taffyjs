import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type CodedError = Error & { code?: string };
type Layout = {
  location: { x: number; y: number };
  size: { width: number; height: number };
};
type Tree = {
  clear(): void;
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  computeLayoutWithMeasure(options: {
    root: bigint;
    availableSpace: object;
    measure: (args: { node: bigint }) => object;
  }): void;
  getLayout(node: bigint): Layout;
  getUnroundedLayout(node: bigint): Layout;
  markDirty(node: bigint): void;
  newLeaf(style: object): bigint;
  newLeafWithContext(style: object, context: unknown): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(typeof Reflect.get(value.prototype, "markDirty"), "function", "markDirty is public");
  return value as unknown as TreeConstructor;
}

function availableSpace() {
  return { width: api.AvailableSpace.MaxContent, height: api.AvailableSpace.MaxContent };
}

function computeMeasured(tree: Tree, root: bigint, calls: Map<bigint, number>) {
  tree.computeLayoutWithMeasure({
    root,
    availableSpace: availableSpace(),
    measure: ({ node }) => {
      calls.set(node, (calls.get(node) ?? 0) + 1);
      return { width: 20, height: 10 };
    },
  });
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

contractTest("API-TREE-028/propagation", () => {
  const tree = new (TaffyTree())();
  const leaf = tree.newLeaf({});
  const parent = tree.newWithChildren({ display: api.Display.Block }, [leaf]);
  const root = tree.newWithChildren({ display: api.Display.Block }, [parent]);
  const calls = new Map<bigint, number>();

  computeMeasured(tree, root, calls);
  const first = calls.get(leaf) ?? 0;
  assert.ok(first > 0);
  computeMeasured(tree, root, calls);
  assert.equal(calls.get(leaf), first, "unchanged layout reuses the cache");

  tree.markDirty(leaf);
  computeMeasured(tree, root, calls);
  assert.ok((calls.get(leaf) ?? 0) > first, "marking a leaf also invalidates its ancestors");
});

contractTest("API-TREE-028/idempotent", () => {
  const tree = new (TaffyTree())();
  const leaf = tree.newLeaf({});
  const root = tree.newWithChildren({ display: api.Display.Block }, [leaf]);
  const calls = new Map<bigint, number>();
  computeMeasured(tree, root, calls);
  const first = calls.get(leaf) ?? 0;

  tree.markDirty(leaf);
  tree.markDirty(leaf);
  computeMeasured(tree, root, calls);
  const afterDirty = calls.get(leaf) ?? 0;
  assert.ok(afterDirty > first);
  computeMeasured(tree, root, calls);
  assert.equal(calls.get(leaf), afterDirty);
});

contractTest("API-TREE-028/layout-retained", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({
    size: { width: api.Dimension.Length(25.5), height: api.Dimension.Length(12.25) },
  });
  tree.computeLayout({ root: node, availableSpace: availableSpace() });
  const rounded = tree.getLayout(node);
  const unrounded = tree.getUnroundedLayout(node);

  tree.markDirty(node);
  assert.deepEqual(tree.getLayout(node), rounded);
  assert.deepEqual(tree.getUnroundedLayout(node), unrounded);
});

contractTest("API-TREE-028/child-nuance", () => {
  const tree = new (TaffyTree())();
  const first = tree.newLeaf({});
  const second = tree.newLeaf({});
  const root = tree.newWithChildren({ display: api.Display.Block }, [first, second]);
  const calls = new Map<bigint, number>();
  computeMeasured(tree, root, calls);
  const firstCalls = calls.get(first) ?? 0;
  const secondCalls = calls.get(second) ?? 0;

  tree.markDirty(first);
  computeMeasured(tree, root, calls);
  assert.ok((calls.get(first) ?? 0) > firstCalls);
  assert.equal(calls.get(second), secondCalls, "an unaffected sibling keeps its cache");
});

contractTest("API-TREE-028/any-node", () => {
  const tree = new (TaffyTree())();
  const plain = tree.newLeaf({});
  const contextual = tree.newLeafWithContext({}, { measured: true });
  const root = tree.newWithChildren({}, [plain, contextual]);
  computeMeasured(tree, root, new Map());

  assert.doesNotThrow(() => tree.markDirty(plain));
  assert.doesNotThrow(() => tree.markDirty(contextual));
  assert.doesNotThrow(() => tree.markDirty(root));
});

contractTest("API-TREE-028/invalid-id", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.markDirty(1 as never)).constructor, TypeError);
  assert.equal(captureError(() => tree.markDirty(0n)).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(captureError(() => tree.markDirty(foreign)).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.markDirty(stale)).code, "ERR_TAFFY_STALE_NODE_ID");
});
