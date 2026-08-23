import assert from "node:assert/strict";
import { TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

const SLOT_MASK = (1n << 32n) - 1n;
const U64_LIMIT = 1n << 64n;

test("js-identity", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf();
  const parent = tree.newWithChildren([child]);

  assert.equal(typeof child, "bigint");
  assert.equal(tree.getChildAtIndex(parent, 0), child);
  assert.equal(tree.getChildren(parent)[0], child);
  assert.equal(tree.getParent(child), parent);
  assert.equal(new Map([[child, "value"]]).get(tree.getChildAtIndex(parent, 0)), "value");
  assert.equal(new Set([child]).has(tree.getChildren(parent)[0]), true);
  assert.equal([child].includes(tree.getChildAtIndex(parent, 0)), true);
});

test("u64-representation", () => {
  const tree = new TaffyTree();

  for (const value of [1, -1n, U64_LIMIT]) {
    assert.throws(() => tree.getStyle(value as never), TypeError);
    assert.throws(() => tree.getNodeContext(value as never), TypeError);
  }
});

test("tree-local-values", () => {
  const first = new TaffyTree();
  const second = new TaffyTree();
  const firstNode = first.newLeaf({ flexGrow: 1 });
  const secondNode = second.newLeaf({ flexGrow: 2 });

  assert.equal(firstNode, secondNode, "independent trees can issue the same raw key");
  assert.equal(first.getStyle(secondNode).flexGrow, 1);
  assert.equal(second.getStyle(firstNode).flexGrow, 2);
});

test("slot-reuse", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf();
  tree.clear();
  const second = tree.newLeaf();

  assert.equal(first & SLOT_MASK, second & SLOT_MASK, "fixture reuses the native slot");
  assert.notEqual(first, second);
  assert.deepEqual(tree.getStyle(second), tree.getStyle(second));
});
