import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type Tree = {
  clear(): void;
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  disableRounding(): void;
  enableRounding(): void;
  getLayout(node: bigint): { size: { width: number; height: number } };
  getUnroundedLayout(node: bigint): { size: { width: number; height: number } };
  newLeaf(style: object): bigint;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "enableRounding"),
    "function",
    "enableRounding is public",
  );
  return value as unknown as TreeConstructor;
}

function maxContentSpace() {
  return { width: api.AvailableSpace.MaxContent, height: api.AvailableSpace.MaxContent };
}

function fractionalNode(tree: Tree) {
  return tree.newLeaf({
    size: { width: api.Dimension.Length(10.5), height: api.Dimension.Length(6.25) },
  });
}

test("select-rounded", () => {
  const tree = new (TaffyTree())();
  const node = fractionalNode(tree);

  tree.enableRounding();
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.deepEqual(tree.getLayout(node).size, { width: 11, height: 6 });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 10.5, height: 6.25 });
});

test("reenable", () => {
  const tree = new (TaffyTree())();
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
  const tree = new (TaffyTree())();
  const node = fractionalNode(tree);

  tree.enableRounding();
  assert.deepEqual(tree.getLayout(node).size, { width: 0, height: 0 });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 0, height: 0 });
});
