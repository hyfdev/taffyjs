import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type CodedError = Error & { code?: string };
type Tree = {
  addChild(parent: bigint, child: bigint): void;
  getChildren(parent: bigint): readonly bigint[];
  getNodeCount(): number;
  getParent(node: bigint): bigint | null;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  removeChildAtIndex(parent: bigint, index: number): bigint;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "removeChildAtIndex"),
    "function",
    "removeChildAtIndex is public",
  );
  return value as unknown as TreeConstructor;
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

contractTest("API-TREE-015/positions", () => {
  const tree = new (TaffyTree())();
  const children = [
    tree.newLeaf({}),
    tree.newLeaf({}),
    tree.newLeaf({}),
    tree.newLeaf({}),
    tree.newLeaf({}),
  ];
  const parent = tree.newWithChildren({}, children);

  assert.equal(tree.removeChildAtIndex(parent, 0), children[0]);
  assert.deepEqual(tree.getChildren(parent), children.slice(1));
  assert.equal(tree.removeChildAtIndex(parent, 1), children[2]);
  assert.deepEqual(tree.getChildren(parent), [children[1], children[3], children[4]]);
  assert.equal(tree.removeChildAtIndex(parent, 2), children[4]);
  assert.deepEqual(tree.getChildren(parent), [children[1], children[3]]);
});

contractTest("API-TREE-015/returned-id", () => {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  const nextParent = tree.newLeaf({});
  const count = tree.getNodeCount();

  const removed = tree.removeChildAtIndex(parent, 0);
  assert.equal(removed, child);
  assert.equal(tree.getParent(child), null);
  assert.equal(tree.getNodeCount(), count);
  tree.addChild(nextParent, removed);
  assert.equal(tree.getParent(child), nextParent);
});

contractTest("API-TREE-015/bounds", () => {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  const emptyParent = tree.newLeaf({});

  for (const [target, index] of [
    [emptyParent, 0],
    [parent, 1],
    [parent, Number.MAX_SAFE_INTEGER],
  ] as const) {
    const error = captureError(() => tree.removeChildAtIndex(target, index));
    assert.equal(error.constructor, RangeError);
    assert.equal(error.code, "ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS");
  }
});

contractTest("API-TREE-015/integer", () => {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);

  for (const index of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53]) {
    const error = captureError(() => tree.removeChildAtIndex(parent, index));
    assert.equal(error.constructor, RangeError);
    assert.equal(error.code, undefined);
  }
  assert.equal(
    captureError(() => tree.removeChildAtIndex(parent, "0" as unknown as number)).constructor,
    TypeError,
  );
});

contractTest("API-TREE-015/failure-atomic", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const [first, second] = [tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second]);
  const foreign = new Tree().newLeaf({});
  const nodes = [first, second, parent];
  const before = topology(tree, nodes);

  const rejectedCalls = [
    () => tree.removeChildAtIndex(parent, 2),
    () => tree.removeChildAtIndex(parent, -1),
    () => tree.removeChildAtIndex(parent, 0.5),
    () => tree.removeChildAtIndex(parent, "0" as unknown as number),
    () => tree.removeChildAtIndex(0n, 0),
    () => tree.removeChildAtIndex(foreign, 0),
  ];

  for (const rejectedCall of rejectedCalls) {
    captureError(rejectedCall);
    assert.deepEqual(topology(tree, nodes), before);
  }
});
