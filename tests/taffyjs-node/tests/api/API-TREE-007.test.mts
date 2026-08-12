import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type CodedError = Error & { code?: string };
type Tree = {
  clear(): void;
  getNodeCount(): number;
  getStyle(node: bigint): object;
  newLeaf(style: object): bigint;
};
type TreeConstructor = new () => Tree;

const U64_MASK = (1n << 64n) - 1n;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(typeof Reflect.get(value.prototype, "clear"), "function", "clear is public");
  return value as unknown as TreeConstructor;
}

function captureError(body: () => unknown): CodedError {
  try {
    body();
  } catch (error) {
    assert.ok(error instanceof Error);
    return error;
  }
  assert.fail("Expected operation to throw");
}

contractTest("API-TREE-007/empty-tree", () => {
  const tree = new (TaffyTree())();
  tree.clear();
  tree.clear();
  assert.equal(tree.getNodeCount(), 0);
});

contractTest("API-TREE-007/leaf-tree", () => {
  const tree = new (TaffyTree())();
  tree.newLeaf({});
  tree.newLeaf({});
  assert.equal(tree.getNodeCount(), 2);
  tree.clear();
  assert.equal(tree.getNodeCount(), 0);
});

contractTest("API-TREE-007/ids-stale", () => {
  const tree = new (TaffyTree())();
  const nodes = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  tree.clear();

  for (const node of nodes) {
    assert.equal(captureError(() => tree.getStyle(node)).code, "ERR_TAFFY_STALE_NODE_ID");
  }
});

contractTest("API-TREE-007/serial-monotonic", () => {
  const tree = new (TaffyTree())();
  const first = tree.newLeaf({});
  tree.clear();
  const second = tree.newLeaf({});

  assert.equal(first & U64_MASK, second & U64_MASK, "native slot is reused by the fixture");
  assert.equal((second >> 64n) & U64_MASK, ((first >> 64n) & U64_MASK) + 1n);
  assert.notEqual(first, second);
});
