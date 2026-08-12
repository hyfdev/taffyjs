import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type CodedError = Error & { code?: string };
type Tree = {
  addChild(parent: bigint, child: bigint): void;
  clear(): void;
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  getChildren(parent: bigint): readonly bigint[];
  getNodeCount(): number;
  getParent(node: bigint): bigint | null;
  getStyle(node: bigint): object;
  isDirty(node: bigint): boolean;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(typeof Reflect.get(value.prototype, "addChild"), "function", "addChild is public");
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
      style: tree.getStyle(node),
    })),
  };
}

contractTest("API-TREE-011/append", () => {
  const tree = new (TaffyTree())();
  const first = tree.newLeaf({});
  const second = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [first]);

  tree.addChild(parent, second);
  assert.deepEqual(tree.getChildren(parent), [first, second]);
  assert.equal(tree.getParent(second), parent);
  assert.equal(tree.getNodeCount(), 3);
});

contractTest("API-TREE-011/dirty", () => {
  const tree = new (TaffyTree())();
  const container = tree.newLeaf({});
  const root = tree.newWithChildren({}, [container]);
  const child = tree.newLeaf({});
  tree.computeLayout({ root, availableSpace: maxContentSpace() });
  assert.equal(tree.isDirty(container), false);
  assert.equal(tree.isDirty(root), false);

  tree.addChild(container, child);
  assert.equal(tree.isDirty(container), true);
  assert.equal(tree.isDirty(root), true);
});

contractTest("API-TREE-011/topology-reject", () => {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({});
  const firstParent = tree.newWithChildren({}, [child]);
  const secondParent = tree.newLeaf({});

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

  const descendant = tree.newLeaf({});
  const middle = tree.newWithChildren({}, [descendant]);
  const root = tree.newWithChildren({}, [middle]);
  assert.equal(
    captureError(() => tree.addChild(descendant, root)).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
});

contractTest("API-TREE-011/id-roles", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const parent = tree.newLeaf({});
  const child = tree.newLeaf({});
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.addChild(1 as never, child)).constructor, TypeError);
  assert.equal(captureError(() => tree.addChild(parent, 0n)).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(captureError(() => tree.addChild(foreign, child)).code, "ERR_TAFFY_FOREIGN_NODE_ID");
  assert.equal(
    captureError(() => tree.addChild(parent, foreign)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );

  const staleParent = tree.newLeaf({});
  const staleChild = tree.newLeaf({});
  tree.clear();
  const currentParent = tree.newLeaf({});
  const currentChild = tree.newLeaf({});
  assert.equal(
    captureError(() => tree.addChild(staleParent, currentChild)).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.addChild(currentParent, staleChild)).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
});

contractTest("API-TREE-011/failure-atomic", () => {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({ flexGrow: 1 });
  const parent = tree.newWithChildren({}, [child]);
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
