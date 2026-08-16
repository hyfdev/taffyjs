import assert from "node:assert/strict";
import { AvailableSpace, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

function maxContentSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
}

function fractionalNode(tree: TaffyTree) {
  return tree.newLeaf({
    size: { width: 10.5, height: 6.25 },
  });
}

test("select-unrounded", () => {
  const tree = new TaffyTree();
  const node = fractionalNode(tree);

  tree.disableRounding();
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.deepEqual(tree.getLayout(node).size, { width: 10.5, height: 6.25 });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 10.5, height: 6.25 });
});

test("repeat-toggle", () => {
  const tree = new TaffyTree();
  let node = fractionalNode(tree);
  const options = () => ({ root: node, availableSpace: maxContentSpace() });

  tree.computeLayout(options());
  assert.deepEqual(tree.getLayout(node).size, { width: 11, height: 6 });
  tree.disableRounding();
  tree.disableRounding();
  assert.deepEqual(tree.getLayout(node).size, { width: 10.5, height: 6.25 });
  tree.enableRounding();
  tree.disableRounding();
  assert.deepEqual(tree.getLayout(node).size, { width: 10.5, height: 6.25 });

  tree.clear();
  node = fractionalNode(tree);
  tree.computeLayout(options());
  assert.deepEqual(tree.getLayout(node).size, { width: 10.5, height: 6.25 });
});

test("no-compute", () => {
  const tree = new TaffyTree();
  const node = fractionalNode(tree);

  tree.disableRounding();
  assert.deepEqual(tree.getLayout(node).size, { width: 0, height: 0 });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 0, height: 0 });
});
