import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };
type Tree = {
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  getChildren(parent: bigint): readonly bigint[];
  getNodeCount(): number;
  getParent(node: bigint): bigint | null;
  isDirty(node: bigint): boolean;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  setChildren(parent: bigint, children: readonly bigint[]): void;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "setChildren"),
    "function",
    "setChildren is public",
  );
  return value as unknown as TreeConstructor;
}

function maxContentSpace() {
  return { width: api.AvailableSpace.MaxContent, height: api.AvailableSpace.MaxContent };
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

function topology(tree: Tree, nodes: readonly bigint[]) {
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
  const tree = new (TaffyTree())();
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
  const tree = new (TaffyTree())();
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
  const tree = new (TaffyTree())();
  const [first, second, third] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second, third]);

  tree.setChildren(parent, [second]);
  assert.deepEqual(tree.getChildren(parent), [second]);
  assert.equal(tree.getParent(first), null);
  assert.equal(tree.getParent(second), parent);
  assert.equal(tree.getParent(third), null);
});

test("dirty", () => {
  const tree = new (TaffyTree())();
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
  const tree = new (TaffyTree())();
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
  const Tree = TaffyTree();
  const tree = new Tree();
  const first = tree.newLeaf({});
  const last = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [first]);
  const foreign = new Tree().newLeaf({});
  const before = topology(tree, [first, last, parent]);

  assert.equal(
    captureError(() => tree.setChildren(parent, [last, foreign, first])).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );
  assert.deepEqual(topology(tree, [first, last, parent]), before);
});

test("failure-atomic", () => {
  const tree = new (TaffyTree())();
  const [first, second, third] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second]);
  const nodes = [first, second, third, parent];
  const before = topology(tree, nodes);

  assert.equal(
    captureError(() => tree.setChildren(parent, [third, third])).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
  assert.deepEqual(topology(tree, nodes), before);

  assert.throws(() => tree.setChildren(parent, {} as unknown as readonly bigint[]), TypeError);
  assert.deepEqual(topology(tree, nodes), before);
});
