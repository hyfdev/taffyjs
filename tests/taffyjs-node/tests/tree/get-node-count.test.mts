import assert from "node:assert/strict";
import { TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

test("initial", () => {
  const tree = new TaffyTree();
  assert.equal(tree.getNodeCount(), 0);
});

test("leaf-clear", () => {
  const tree = new TaffyTree();
  tree.newLeaf();
  tree.newLeaf();
  tree.newLeaf();
  assert.equal(tree.getNodeCount(), 3);
  tree.clear();
  assert.equal(tree.getNodeCount(), 0);
});

test("number-result", () => {
  const tree = new TaffyTree();
  for (let index = 0; index < 4; index += 1) {
    const count = tree.getNodeCount();
    assert.equal(typeof count, "number");
    assert.equal(Number.isSafeInteger(count), true);
    assert.equal(count, index);
    tree.newLeaf();
  }
});
