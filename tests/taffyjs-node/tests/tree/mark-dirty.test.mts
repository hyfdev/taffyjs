import assert from "node:assert/strict";
import { AvailableSpace, Dimension, Display, type NodeId, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };

function availableSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
}

function computeMeasured(tree: TaffyTree, root: NodeId, calls: Map<NodeId, number>) {
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

test("propagation", () => {
  const tree = new TaffyTree();
  const leaf = tree.newLeaf({});
  const parent = tree.newWithChildren({ display: Display.Block }, [leaf]);
  const root = tree.newWithChildren({ display: Display.Block }, [parent]);
  const calls = new Map<NodeId, number>();

  computeMeasured(tree, root, calls);
  const first = calls.get(leaf) ?? 0;
  assert.ok(first > 0);
  computeMeasured(tree, root, calls);
  assert.equal(calls.get(leaf), first, "unchanged layout reuses the cache");

  tree.markDirty(leaf);
  computeMeasured(tree, root, calls);
  assert.ok((calls.get(leaf) ?? 0) > first, "marking a leaf also invalidates its ancestors");
});

test("idempotent", () => {
  const tree = new TaffyTree();
  const leaf = tree.newLeaf({});
  const root = tree.newWithChildren({ display: Display.Block }, [leaf]);
  const calls = new Map<NodeId, number>();
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

test("layout-retained", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: Dimension.Length(25.5), height: Dimension.Length(12.25) },
  });
  tree.computeLayout({ root: node, availableSpace: availableSpace() });
  const rounded = tree.getLayout(node);
  const unrounded = tree.getUnroundedLayout(node);

  tree.markDirty(node);
  assert.deepEqual(tree.getLayout(node), rounded);
  assert.deepEqual(tree.getUnroundedLayout(node), unrounded);
});

test("child-nuance", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf({});
  const second = tree.newLeaf({});
  const root = tree.newWithChildren({ display: Display.Block }, [first, second]);
  const calls = new Map<NodeId, number>();
  computeMeasured(tree, root, calls);
  const firstCalls = calls.get(first) ?? 0;
  const secondCalls = calls.get(second) ?? 0;

  tree.markDirty(first);
  computeMeasured(tree, root, calls);
  assert.ok((calls.get(first) ?? 0) > firstCalls);
  assert.equal(calls.get(second), secondCalls, "an unaffected sibling keeps its cache");
});

test("any-node", () => {
  const tree = new TaffyTree();
  const plain = tree.newLeaf({});
  const contextual = tree.newLeafWithContext({}, { measured: true });
  const root = tree.newWithChildren({}, [plain, contextual]);
  computeMeasured(tree, root, new Map());

  assert.doesNotThrow(() => tree.markDirty(plain));
  assert.doesNotThrow(() => tree.markDirty(contextual));
  assert.doesNotThrow(() => tree.markDirty(root));
});

test("invalid-id", () => {
  const tree = new TaffyTree();
  const foreign = new TaffyTree().newLeaf({});

  assert.equal(captureError(() => tree.markDirty(1 as never)).constructor, TypeError);
  assert.equal(captureError(() => tree.markDirty(0n as never)).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(captureError(() => tree.markDirty(foreign)).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.markDirty(stale)).code, "ERR_TAFFY_STALE_NODE_ID");
});
