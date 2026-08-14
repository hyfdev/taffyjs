import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

test("construct", () => {
  const first = new TaffyTree();
  const second = new TaffyTree();

  assert.equal(first.getNodeCount(), 0);
  assert.equal(second.getNodeCount(), 0);
  assert.notEqual(first.newLeaf({}), second.newLeaf({}), "each tree has an independent token");
});

test("export-boundary", () => {
  const tree = new TaffyTree();

  assert.equal(Reflect.get(api, "NativeTaffyTree"), undefined);
  assert.equal(Reflect.get(api, "__bootstrap"), undefined);
  assert.equal(Reflect.get(api, "default"), undefined);
  assert.equal(Reflect.get(tree, "rawNewLeaf"), undefined);
  assert.equal(Reflect.get(tree, "inner"), undefined);
});
