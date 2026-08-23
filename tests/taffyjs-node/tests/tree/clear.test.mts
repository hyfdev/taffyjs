import assert from "node:assert/strict";
import { TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

test("empty-tree", () => {
  const tree = new TaffyTree();
  tree.clear();
  tree.clear();
  assert.equal(tree.getNodeCount(), 0);
});

test("leaf-tree", () => {
  const tree = new TaffyTree();
  tree.newLeaf();
  tree.newLeaf();
  assert.equal(tree.getNodeCount(), 2);
  tree.clear();
  assert.equal(tree.getNodeCount(), 0);
});
