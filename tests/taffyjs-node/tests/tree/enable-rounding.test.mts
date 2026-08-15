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

test("select-rounded", () => {
  const tree = new TaffyTree();
  const node = fractionalNode(tree);

  tree.enableRounding();
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.deepEqual(tree.getLayout(node).size, { width: 11, height: 6 });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 10.5, height: 6.25 });
});

test("reenable", () => {
  const tree = new TaffyTree();
  let node = fractionalNode(tree);
  const options = () => ({ root: node, availableSpace: maxContentSpace() });

  tree.disableRounding();
  tree.computeLayout(options());
  assert.deepEqual(tree.getLayout(node).size, { width: 10.5, height: 6.25 });
  tree.enableRounding();
  assert.deepEqual(tree.getLayout(node).size, { width: 0, height: 0 });
  tree.computeLayout(options());
  assert.deepEqual(tree.getLayout(node).size, { width: 11, height: 6 });

  tree.clear();
  node = fractionalNode(tree);
  tree.computeLayout(options());
  assert.deepEqual(tree.getLayout(node).size, { width: 11, height: 6 });
});

test("no-compute", () => {
  const tree = new TaffyTree();
  const node = fractionalNode(tree);

  tree.enableRounding();
  assert.deepEqual(tree.getLayout(node).size, { width: 0, height: 0 });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 0, height: 0 });
});
