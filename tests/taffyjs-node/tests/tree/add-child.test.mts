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
      style: tree.getStyle(node),
    })),
  };
}

test("append", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf();
  const second = tree.newLeaf();
  const parent = tree.newWithChildren([first]);

  tree.addChild(parent, second);
  assert.deepEqual(tree.getChildren(parent), [first, second]);
  assert.equal(tree.getParent(second), parent);
  assert.equal(tree.getNodeCount(), 3);
});

test("dirty", () => {
  const tree = new TaffyTree();
  const container = tree.newLeaf();
  const root = tree.newWithChildren([container]);
  const child = tree.newLeaf();
  tree.computeLayout({ root, availableSpace: maxContentSpace() });
  assert.equal(tree.isDirty(container), false);
  assert.equal(tree.isDirty(root), false);

  tree.addChild(container, child);
  assert.equal(tree.isDirty(container), true);
  assert.equal(tree.isDirty(root), true);
});

test("topology-reject", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf();
  const firstParent = tree.newWithChildren([child]);
  const secondParent = tree.newLeaf();

  for (const [parent, attemptedChild] of [
    [firstParent, child],
    [secondParent, child],
    [secondParent, secondParent],
  ] as const) {
    assert.equal(
      captureError(() => tree.addChild(parent, attemptedChild)).code,
      "ERR_TAFFY_INVALID_TOPOLOGY",
    );
  }

  const descendant = tree.newLeaf();
  const middle = tree.newWithChildren([descendant]);
  const root = tree.newWithChildren([middle]);
  assert.equal(
    captureError(() => tree.addChild(descendant, root)).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
});

test("failure-atomic", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({ flexGrow: 1 });
  const parent = tree.newWithChildren([child]);
  const other = tree.newLeaf({ flexGrow: 2 });
  const nodes = [child, parent, other];
  const before = topology(tree, nodes);

  assert.equal(captureError(() => tree.addChild(other, child)).code, "ERR_TAFFY_INVALID_TOPOLOGY");
  assert.deepEqual(topology(tree, nodes), before);

  assert.equal(
    captureError(() => tree.addChild(parent, parent)).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
  assert.deepEqual(topology(tree, nodes), before);
});
