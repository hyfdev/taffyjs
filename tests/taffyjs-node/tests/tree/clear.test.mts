import assert from "node:assert/strict";
import { TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };

const U32_MASK = (1n << 32n) - 1n;
const U64_MASK = (1n << 64n) - 1n;

function captureError(body: () => unknown): CodedError {
  try {
    body();
  } catch (error) {
    assert.ok(error instanceof Error);
    return error;
  }
  assert.fail("Expected operation to throw");
}

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

test("ids-stale", () => {
  const tree = new TaffyTree();
  const nodes = [tree.newLeaf(), tree.newLeaf(), tree.newLeaf()];
  tree.clear();

  for (const node of nodes) {
    assert.equal(captureError(() => tree.getStyle(node)).code, "ERR_TAFFY_STALE_NODE_ID");
  }
});

test("serial-monotonic", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf();
  tree.clear();
  const second = tree.newLeaf();

  assert.equal(first & U32_MASK, second & U32_MASK, "native slot is reused by the fixture");
  assert.equal((second >> 64n) & U64_MASK, ((first >> 64n) & U64_MASK) + 1n);
  assert.notEqual(first, second);
});
