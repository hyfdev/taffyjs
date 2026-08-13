import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };
type Tree = {
  addChild(parent: bigint, child: bigint): void;
  clear(): void;
  getParent(node: bigint): bigint | null;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  removeChild(parent: bigint, child: bigint): void;
  setChildren(parent: bigint, children: readonly bigint[]): void;
};
type TreeConstructor = new () => Tree;

const SLOT_MASK = (1n << 32n) - 1n;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(typeof Reflect.get(value.prototype, "getParent"), "function", "getParent is public");
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

test("root-null", () => {
  const tree = new (TaffyTree())();
  const leaf = tree.newLeaf({});
  const emptyParent = tree.newWithChildren({}, []);

  assert.equal(tree.getParent(leaf), null);
  assert.equal(tree.getParent(emptyParent), null);
});

test("attached", () => {
  const tree = new (TaffyTree())();
  const children = [tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, children);

  assert.equal(tree.getParent(children[0]), parent);
  assert.equal(tree.getParent(children[1]), parent);
});

test("transitions", () => {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({});
  const firstParent = tree.newWithChildren({}, [child]);
  const secondParent = tree.newLeaf({});
  assert.equal(tree.getParent(child), firstParent);

  tree.setChildren(secondParent, [child]);
  assert.equal(tree.getParent(child), secondParent);
  tree.removeChild(secondParent, child);
  assert.equal(tree.getParent(child), null);
  tree.addChild(firstParent, child);
  assert.equal(tree.getParent(child), firstParent);
  tree.setChildren(firstParent, []);
  assert.equal(tree.getParent(child), null);
});

test("slot-reuse", () => {
  const tree = new (TaffyTree())();
  const firstChild = tree.newLeaf({});
  const firstParent = tree.newWithChildren({}, [firstChild]);
  tree.clear();

  const secondChild = tree.newLeaf({});
  const secondParent = tree.newWithChildren({}, [secondChild]);
  const byValue = (left: bigint, right: bigint) => (left < right ? -1 : left > right ? 1 : 0);
  const firstSlots = [firstChild & SLOT_MASK, firstParent & SLOT_MASK].sort(byValue);
  const secondSlots = [secondChild & SLOT_MASK, secondParent & SLOT_MASK].sort(byValue);
  assert.deepEqual(secondSlots, firstSlots);
  assert.equal(tree.getParent(secondChild), secondParent);
  assert.notEqual(secondParent, firstChild);
  assert.notEqual(secondParent, firstParent);
  assert.notEqual(tree.getParent(secondChild), firstParent);
  assert.equal(captureError(() => tree.getParent(firstChild)).code, "ERR_TAFFY_STALE_NODE_ID");
});

test("invalid-id", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.getParent(1 as never)).constructor, TypeError);
  assert.equal(captureError(() => tree.getParent(0n)).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(captureError(() => tree.getParent(foreign)).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.getParent(stale)).code, "ERR_TAFFY_STALE_NODE_ID");
});
