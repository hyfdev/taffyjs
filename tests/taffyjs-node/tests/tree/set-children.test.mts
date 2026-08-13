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

test("replace-order", () => {
  const tree = new TaffyTree();
  const [first, second, third] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second]);

  tree.setChildren(parent, [third, first]);
  assert.deepEqual(tree.getChildren(parent), [third, first]);
  tree.setChildren(parent, [first, third]);
  assert.deepEqual(tree.getChildren(parent), [first, third]);
  tree.setChildren(parent, [first, third]);
  assert.deepEqual(tree.getChildren(parent), [first, third]);
  tree.setChildren(parent, []);
  assert.deepEqual(tree.getChildren(parent), []);
});

test("reparent", () => {
  const tree = new TaffyTree();
  const [first, second, retained] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const firstParent = tree.newWithChildren({}, [retained, first]);
  const secondParent = tree.newWithChildren({}, [second]);
  const target = tree.newLeaf({});

  tree.setChildren(target, [second, first]);
  assert.deepEqual(tree.getChildren(target), [second, first]);
  assert.deepEqual(tree.getChildren(firstParent), [retained]);
  assert.deepEqual(tree.getChildren(secondParent), []);
  assert.equal(tree.getParent(first), target);
  assert.equal(tree.getParent(second), target);
  assert.equal(tree.getParent(retained), firstParent);
});

test("detach-omitted", () => {
  const tree = new TaffyTree();
  const [first, second, third] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second, third]);

  tree.setChildren(parent, [second]);
  assert.deepEqual(tree.getChildren(parent), [second]);
  assert.equal(tree.getParent(first), null);
  assert.equal(tree.getParent(second), parent);
  assert.equal(tree.getParent(third), null);
});

test("dirty", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf({});
  const second = tree.newLeaf({});
  const firstParent = tree.newWithChildren({}, [first]);
  const secondParent = tree.newWithChildren({}, [second]);
  const target = tree.newLeaf({});
  const root = tree.newWithChildren({}, [firstParent, secondParent, target]);
  tree.computeLayout({ root, availableSpace: maxContentSpace() });
  for (const node of [firstParent, secondParent, target, root]) {
    assert.equal(tree.isDirty(node), false);
  }

  tree.setChildren(target, [second, first]);
  for (const node of [firstParent, secondParent, target, root]) {
    assert.equal(tree.isDirty(node), true);
  }
});

test("topology-reject", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);

  for (const children of [[child, child], [parent]]) {
    assert.equal(
      captureError(() => tree.setChildren(parent, children)).code,
      "ERR_TAFFY_INVALID_TOPOLOGY",
    );
  }

  const descendant = tree.newLeaf({});
  const middle = tree.newWithChildren({}, [descendant]);
  const root = tree.newWithChildren({}, [middle]);
  assert.equal(
    captureError(() => tree.setChildren(descendant, [root])).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
});

test("invalid-middle", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf({});
  const last = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [first]);
  const foreign = new TaffyTree().newLeaf({});
  const before = topology(tree, [first, last, parent]);

  assert.equal(
    captureError(() => tree.setChildren(parent, [last, foreign, first])).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );
  assert.deepEqual(topology(tree, [first, last, parent]), before);
});

test("failure-atomic", () => {
  const tree = new TaffyTree();
  const [first, second, third] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second]);
  const nodes = [first, second, third, parent];
  const before = topology(tree, nodes);

  assert.equal(
    captureError(() => tree.setChildren(parent, [third, third])).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
  assert.deepEqual(topology(tree, nodes), before);

  assert.throws(() => tree.setChildren(parent, {} as unknown as readonly NodeId[]), TypeError);
  assert.deepEqual(topology(tree, nodes), before);
});
