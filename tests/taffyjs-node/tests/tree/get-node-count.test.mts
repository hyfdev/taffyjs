import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type Tree = {
  clear(): void;
  getNodeCount(): number;
  newLeaf(style: object): bigint;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  return value as unknown as TreeConstructor;
}

test("initial", () => {
  const tree = new (TaffyTree())();
  assert.equal(tree.getNodeCount(), 0);
});

test("leaf-clear", () => {
  const tree = new (TaffyTree())();
  tree.newLeaf({});
  tree.newLeaf({});
  tree.newLeaf({});
  assert.equal(tree.getNodeCount(), 3);
  tree.clear();
  assert.equal(tree.getNodeCount(), 0);
});

test("number-result", () => {
  const tree = new (TaffyTree())();
  for (let index = 0; index < 4; index += 1) {
    const count = tree.getNodeCount();
    assert.equal(typeof count, "number");
    assert.equal(Number.isSafeInteger(count), true);
    assert.equal(count, index);
    tree.newLeaf({});
  }
});
