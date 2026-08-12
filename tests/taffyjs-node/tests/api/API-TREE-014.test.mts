import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type CodedError = Error & { code?: string };
type Tree = {
  clear(): void;
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  getChildren(parent: bigint): readonly bigint[];
  getNodeCount(): number;
  getParent(node: bigint): bigint | null;
  isDirty(node: bigint): boolean;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  removeChild(parent: bigint, child: bigint): void;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "removeChild"),
    "function",
    "removeChild is public",
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

contractTest("API-TREE-014/detach", () => {
  const tree = new (TaffyTree())();
  const [first, second, third] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second, third]);

  tree.removeChild(parent, second);
  assert.deepEqual(tree.getChildren(parent), [first, third]);
  assert.equal(tree.getParent(second), null);
  assert.equal(tree.getNodeCount(), 4);
});

contractTest("API-TREE-014/nonchild", () => {
  const tree = new (TaffyTree())();
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

contractTest("API-TREE-014/dirty", () => {
  const tree = new (TaffyTree())();
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

contractTest("API-TREE-014/id-roles", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.removeChild(1 as never, child)).constructor, TypeError);
  assert.equal(captureError(() => tree.removeChild(parent, 0n)).code, "ERR_TAFFY_INVALID_NODE_ID");
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

contractTest("API-TREE-014/failure-atomic", () => {
  const tree = new (TaffyTree())();
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
