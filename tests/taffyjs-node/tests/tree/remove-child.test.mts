import assert from "node:assert/strict";
import { AvailableSpace, type NodeId, TaffyTree } from "@taffyjs/node";
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

test("detach", () => {
  const tree = new TaffyTree();
  const [first, second, third] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second, third]);

  tree.removeChild(parent, second);
  assert.deepEqual(tree.getChildren(parent), [first, third]);
  assert.equal(tree.getParent(second), null);
  assert.equal(tree.getNodeCount(), 4);
});

test("nonchild", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  const other = tree.newLeaf({});

  assert.equal(
    captureError(() => tree.removeChild(parent, other)).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
  tree.removeChild(parent, child);
  assert.equal(
    captureError(() => tree.removeChild(parent, child)).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
  assert.deepEqual(tree.getChildren(parent), []);
  assert.equal(tree.getParent(child), null);
});

test("dirty", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  const root = tree.newWithChildren({}, [parent]);
  tree.computeLayout({ root, availableSpace: maxContentSpace() });
  assert.equal(tree.isDirty(parent), false);
  assert.equal(tree.isDirty(root), false);

  tree.removeChild(parent, child);
  assert.equal(tree.isDirty(parent), true);
  assert.equal(tree.isDirty(root), true);
});

test("id-roles", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  const foreign = new TaffyTree().newLeaf({});

  assert.equal(captureError(() => tree.removeChild(1 as never, child)).constructor, TypeError);
  assert.equal(
    captureError(() => tree.removeChild(parent, 0n as never)).code,
    "ERR_TAFFY_INVALID_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.removeChild(foreign, child)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.removeChild(parent, foreign)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );

  const staleParent = tree.newLeaf({});
  const staleChild = tree.newLeaf({});
  tree.clear();
  const currentParent = tree.newLeaf({});
  const currentChild = tree.newLeaf({});
  assert.equal(
    captureError(() => tree.removeChild(staleParent, currentChild)).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.removeChild(currentParent, staleChild)).code,
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
    captureError(() => tree.removeChild(parent, other)).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
  assert.deepEqual(topology(tree, nodes), before);

  assert.equal(
    captureError(() => tree.removeChild(other, child)).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
  assert.deepEqual(topology(tree, nodes), before);
});
