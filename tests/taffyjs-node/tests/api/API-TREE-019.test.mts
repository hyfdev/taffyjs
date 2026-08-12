import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type CodedError = Error & { code?: string };
type Tree = {
  addChild(parent: bigint, child: bigint): void;
  clear(): void;
  getChildCount(parent: bigint): number;
  insertChildAtIndex(parent: bigint, index: number, child: bigint): void;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  removeChild(parent: bigint, child: bigint): void;
  removeChildAtIndex(parent: bigint, index: number): bigint;
  removeChildrenRange(parent: bigint, range: { start: number; end: number }): void;
  setChildren(parent: bigint, children: readonly bigint[]): void;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "getChildCount"),
    "function",
    "getChildCount is public",
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

contractTest("API-TREE-019/empty", () => {
  const tree = new (TaffyTree())();
  const leaf = tree.newLeaf({});
  const emptyParent = tree.newWithChildren({}, []);

  assert.equal(tree.getChildCount(leaf), 0);
  assert.equal(tree.getChildCount(emptyParent), 0);
});

contractTest("API-TREE-019/topology-sequence", () => {
  const tree = new (TaffyTree())();
  const [first, second, third, fourth] = [
    tree.newLeaf({}),
    tree.newLeaf({}),
    tree.newLeaf({}),
    tree.newLeaf({}),
  ];
  const parent = tree.newWithChildren({}, [first, second]);
  assert.equal(tree.getChildCount(parent), 2);

  tree.addChild(parent, third);
  assert.equal(tree.getChildCount(parent), 3);
  tree.insertChildAtIndex(parent, 1, fourth);
  assert.equal(tree.getChildCount(parent), 4);
  tree.setChildren(parent, [fourth, first]);
  assert.equal(tree.getChildCount(parent), 2);
  tree.removeChild(parent, fourth);
  assert.equal(tree.getChildCount(parent), 1);
  tree.addChild(parent, third);
  assert.equal(tree.getChildCount(parent), 2);
  assert.equal(tree.removeChildAtIndex(parent, 0), first);
  assert.equal(tree.getChildCount(parent), 1);
  tree.addChild(parent, second);
  tree.removeChildrenRange(parent, { start: 0, end: 2 });
  assert.equal(tree.getChildCount(parent), 0);

  tree.clear();
  const afterClear = tree.newLeaf({});
  assert.equal(tree.getChildCount(afterClear), 0);
});

contractTest("API-TREE-019/number-result", () => {
  const tree = new (TaffyTree())();
  const children = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, children);
  const count = tree.getChildCount(parent);

  assert.equal(count, 3);
  assert.equal(typeof count, "number");
  assert.equal(Number.isSafeInteger(count), true);
  assert.equal(count >= 0, true);
});

contractTest("API-TREE-019/invalid-parent", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.getChildCount(1 as never)).constructor, TypeError);
  assert.equal(captureError(() => tree.getChildCount(0n)).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(captureError(() => tree.getChildCount(foreign)).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.getChildCount(stale)).code, "ERR_TAFFY_STALE_NODE_ID");
});
