import assert from "node:assert/strict";
import { TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

const SLOT_MASK = (1n << 32n) - 1n;

test("root-null", () => {
  const tree = new TaffyTree();
  const leaf = tree.newLeaf();
  const emptyParent = tree.newWithChildren([]);

  assert.equal(tree.getParent(leaf), null);
  assert.equal(tree.getParent(emptyParent), null);
});

test("attached", () => {
  const tree = new TaffyTree();
  const children = [tree.newLeaf(), tree.newLeaf()];
  const parent = tree.newWithChildren(children);

  assert.equal(tree.getParent(children[0]), parent);
  assert.equal(tree.getParent(children[1]), parent);
});

test("transitions", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf();
  const firstParent = tree.newWithChildren([child]);
  const secondParent = tree.newLeaf();
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
  const tree = new TaffyTree();
  const firstChild = tree.newLeaf();
  const firstParent = tree.newWithChildren([firstChild]);
  tree.clear();

  const secondChild = tree.newLeaf();
  const secondParent = tree.newWithChildren([secondChild]);
  const byValue = (left: bigint, right: bigint) => (left < right ? -1 : left > right ? 1 : 0);
  const firstSlots = [firstChild & SLOT_MASK, firstParent & SLOT_MASK].sort(byValue);
  const secondSlots = [secondChild & SLOT_MASK, secondParent & SLOT_MASK].sort(byValue);
  assert.deepEqual(secondSlots, firstSlots);
  assert.equal(tree.getParent(secondChild), secondParent);
  assert.notEqual(secondParent, firstChild);
  assert.notEqual(secondParent, firstParent);
  assert.notEqual(tree.getParent(secondChild), firstParent);
});
