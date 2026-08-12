import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type CodedError = Error & { code?: string };
type Tree = {
  clear(): void;
  getChildren(parent: bigint): readonly bigint[];
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  removeChild(parent: bigint, child: bigint): void;
  setChildren(parent: bigint, children: readonly bigint[]): void;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "getChildren"),
    "function",
    "getChildren is public",
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

contractTest("API-TREE-022/empty", () => {
  const tree = new (TaffyTree())();
  const leaf = tree.newLeaf({});
  const parent = tree.newWithChildren({}, []);

  assert.deepEqual(tree.getChildren(leaf), []);
  assert.deepEqual(tree.getChildren(parent), []);
});

contractTest("API-TREE-022/ordered", () => {
  const tree = new (TaffyTree())();
  const [first, second, third] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [third, first, second]);
  assert.deepEqual(tree.getChildren(parent), [third, first, second]);

  const otherParent = tree.newLeaf({});
  tree.setChildren(otherParent, [first, third]);
  assert.deepEqual(tree.getChildren(parent), [second]);
  assert.deepEqual(tree.getChildren(otherParent), [first, third]);

  tree.removeChild(otherParent, first);
  assert.deepEqual(tree.getChildren(otherParent), [third]);
});

contractTest("API-TREE-022/stable-ids", () => {
  const tree = new (TaffyTree())();
  const children = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, children);
  const read = tree.getChildren(parent);

  for (let index = 0; index < children.length; index += 1) {
    assert.equal(read[index], children[index]);
  }
  assert.equal(new Map(children.map((node, index) => [node, index])).get(read[1]), 1);
});

contractTest("API-TREE-022/detached-array", () => {
  const tree = new (TaffyTree())();
  const children = [tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, children);
  const firstRead = tree.getChildren(parent) as bigint[];

  firstRead.reverse();
  firstRead.push(tree.newLeaf({}));
  assert.deepEqual(tree.getChildren(parent), children);
  assert.notEqual(tree.getChildren(parent), tree.getChildren(parent));
});

contractTest("API-TREE-022/invalid-parent", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.getChildren(1 as never)).constructor, TypeError);
  assert.equal(captureError(() => tree.getChildren(0n)).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(captureError(() => tree.getChildren(foreign)).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.getChildren(stale)).code, "ERR_TAFFY_STALE_NODE_ID");
});
