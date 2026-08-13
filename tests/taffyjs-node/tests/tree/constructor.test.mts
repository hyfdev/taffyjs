import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type Tree = {
  getNodeCount(): number;
  newLeaf(style: object): bigint;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  return value as unknown as TreeConstructor;
}

test("construct", () => {
  const Tree = TaffyTree();
  const first = new Tree();
  const second = new Tree();

  assert.equal(first.getNodeCount(), 0);
  assert.equal(second.getNodeCount(), 0);
  assert.notEqual(first.newLeaf({}), second.newLeaf({}), "each tree has an independent token");
});

test("export-boundary", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  let injectedRandomCalled = false;
  const treeWithIgnoredOptions = new (Tree as unknown as new (options: object) => Tree)({
    randomSource() {
      injectedRandomCalled = true;
      throw new Error("public constructor reached private options");
    },
  });

  assert.equal(Reflect.get(api, "NativeTaffyTree"), undefined);
  assert.equal(Reflect.get(api, "__bootstrap"), undefined);
  assert.equal(Reflect.get(api, "default"), undefined);
  assert.equal(Reflect.get(tree, "rawNewLeaf"), undefined);
  assert.equal(Reflect.get(tree, "inner"), undefined);
  assert.equal(injectedRandomCalled, false);
  assert.ok(treeWithIgnoredOptions instanceof Tree);
});
