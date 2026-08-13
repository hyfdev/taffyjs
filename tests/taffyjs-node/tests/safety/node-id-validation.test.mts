import assert from "node:assert/strict";
import { TaffyTree, type NodeId } from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };

const SLOT_MASK = (1n << 32n) - 1n;

function captureError(body: () => unknown): CodedError {
  try {
    body();
  } catch (error) {
    assert.ok(error instanceof Error);
    return error;
  }
  assert.fail("Expected operation to throw");
}

function expectNodeError(body: () => unknown, ErrorClass: ErrorConstructor, code?: string): void {
  const error = captureError(body);
  assert.equal(error.constructor, ErrorClass);
  assert.equal(error.code, code);
}

test("NodeId rejects wrong, malformed, foreign, removed, and cleared values", () => {
  const tree = new TaffyTree();
  const current = tree.newLeaf({});

  expectNodeError(() => tree.getStyle(1 as unknown as NodeId), TypeError);
  expectNodeError(() => tree.getStyle(0n as NodeId), Error, "ERR_TAFFY_INVALID_NODE_ID");

  const foreign = new TaffyTree().newLeaf({});
  expectNodeError(() => tree.getStyle(foreign), Error, "ERR_TAFFY_FOREIGN_NODE_ID");

  const removed = tree.newLeaf({});
  tree.remove(removed);
  expectNodeError(() => tree.getStyle(removed), Error, "ERR_TAFFY_STALE_NODE_ID");

  tree.clear();
  expectNodeError(() => tree.getStyle(current), Error, "ERR_TAFFY_STALE_NODE_ID");

  const recovered = tree.newLeaf({ flexGrow: 2 });
  assert.equal(tree.getStyle(recovered).flexGrow, 2);
});

test("NodeId creation serial rejects a removed ID after native slot reuse", () => {
  const tree = new TaffyTree();
  const removed = tree.newLeaf({});
  tree.remove(removed);
  const replacement = tree.newLeaf({ flexGrow: 3 });

  assert.equal(removed & SLOT_MASK, replacement & SLOT_MASK, "fixture must reuse a native slot");
  assert.notEqual(removed, replacement);
  expectNodeError(() => tree.getStyle(removed), Error, "ERR_TAFFY_STALE_NODE_ID");
  assert.equal(tree.getStyle(replacement).flexGrow, 3);
});

test("a bad middle array element is rejected before native topology changes", () => {
  const tree = new TaffyTree();
  const parent = tree.newLeaf({});
  const first = tree.newLeaf({});
  const last = tree.newLeaf({});
  const foreign = new TaffyTree().newLeaf({});
  const beforeCount = tree.getNodeCount();

  expectNodeError(
    () => tree.setChildren(parent, [first, foreign, last]),
    Error,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );
  assert.equal(tree.getNodeCount(), beforeCount);
  assert.deepEqual(tree.getChildren(parent), []);
  assert.equal(tree.getParent(first), null);
  assert.equal(tree.getParent(last), null);
});
