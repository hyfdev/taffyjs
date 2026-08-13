import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };
type ChildRangeInput = { start: number; end: number };
type Tree = {
  addChild(parent: bigint, child: bigint): void;
  getChildren(parent: bigint): readonly bigint[];
  getNodeCount(): number;
  getParent(node: bigint): bigint | null;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  removeChildrenRange(parent: bigint, range: ChildRangeInput): void;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "removeChildrenRange"),
    "function",
    "removeChildrenRange is public",
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

test("ranges", () => {
  const tree = new (TaffyTree())();
  const children = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, children);

  tree.removeChildrenRange(parent, { start: 1, end: 1 });
  assert.deepEqual(tree.getChildren(parent), children);
  tree.removeChildrenRange(parent, { start: 1, end: 3 });
  assert.deepEqual(tree.getChildren(parent), [children[0], children[3]]);
  tree.removeChildrenRange(parent, { start: 0, end: 2 });
  assert.deepEqual(tree.getChildren(parent), []);
});

test("detached-live", () => {
  const tree = new (TaffyTree())();
  const [first, second, third] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second, third]);
  const nextParent = tree.newLeaf({});
  const count = tree.getNodeCount();

  tree.removeChildrenRange(parent, { start: 0, end: 2 });
  assert.equal(tree.getParent(first), null);
  assert.equal(tree.getParent(second), null);
  assert.equal(tree.getParent(third), parent);
  assert.equal(tree.getNodeCount(), count);
  tree.addChild(nextParent, first);
  assert.equal(tree.getParent(first), nextParent);
});

test("range-errors", () => {
  const tree = new (TaffyTree())();
  const children = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, children);
  const invalidRanges = [
    { start: 2, end: 1 },
    { start: 0, end: 4 },
    { start: -1, end: 1 },
    { start: 0.5, end: 1 },
    { start: 0, end: Number.NaN },
    { start: 0, end: Number.POSITIVE_INFINITY },
    { start: 0, end: 2 ** 53 },
  ];

  for (const range of invalidRanges) {
    const error = captureError(() => tree.removeChildrenRange(parent, range));
    assert.equal(error.constructor, RangeError);
    assert.equal(error.code, undefined);
  }
});

test("extra-properties", () => {
  const tree = new (TaffyTree())();
  const [first, second] = [tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second]);

  tree.removeChildrenRange(parent, { start: 0, end: 1, ignored: true } as ChildRangeInput);
  assert.deepEqual(tree.getChildren(parent), [second]);
});

test("failure-atomic", () => {
  const tree = new (TaffyTree())();
  const [first, second, third] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second, third]);
  const nodes = [first, second, third, parent];
  const before = topology(tree, nodes);
  const rejectedCalls = [
    () => tree.removeChildrenRange(parent, null as unknown as ChildRangeInput),
    () => tree.removeChildrenRange(parent, [] as unknown as ChildRangeInput),
    () => tree.removeChildrenRange(parent, { end: 1 } as ChildRangeInput),
    () => tree.removeChildrenRange(parent, { start: 0 } as ChildRangeInput),
    () => tree.removeChildrenRange(parent, { start: "0", end: 1 } as unknown as ChildRangeInput),
    () => tree.removeChildrenRange(parent, { start: 2, end: 1 }),
    () => tree.removeChildrenRange(parent, { start: 0, end: 4 }),
  ];

  for (const rejectedCall of rejectedCalls) {
    captureError(rejectedCall);
    assert.deepEqual(topology(tree, nodes), before);
  }
});
