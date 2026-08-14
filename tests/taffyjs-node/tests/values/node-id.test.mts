import assert from "node:assert/strict";
import { TaffyTree } from "@taffyjs/node";
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

test("js-identity", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);

  assert.equal(typeof child, "bigint");
  assert.equal(tree.getChildAtIndex(parent, 0), child);
  assert.equal(tree.getChildren(parent)[0], child);
  assert.equal(tree.getParent(child), parent);
  assert.equal(new Map([[child, "value"]]).get(tree.getChildAtIndex(parent, 0)), "value");
  assert.equal(new Set([child]).has(tree.getChildren(parent)[0]), true);
  assert.equal([child].includes(tree.getChildAtIndex(parent, 0)), true);
});

test("malformed", () => {
  const tree = new TaffyTree();

  assert.equal(captureError(() => tree.getStyle(1 as never)).constructor, TypeError);
  for (const value of [-1n, 0n, 1n, 1n << 256n]) {
    const error = captureError(() => tree.getStyle(value as never));
    assert.equal(error.constructor, Error);
    assert.equal(error.code, "ERR_TAFFY_INVALID_NODE_ID");
  }
});

test("foreign", () => {
  const first = new TaffyTree();
  const second = new TaffyTree();
  const node = first.newLeaf({});

  const error = captureError(() => second.getStyle(node));
  assert.equal(error.constructor, Error);
  assert.equal(error.code, "ERR_TAFFY_FOREIGN_NODE_ID");
  assert.deepEqual(first.getStyle(node), first.getStyle(node));
});

test("stale-clear", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({});
  tree.clear();

  const error = captureError(() => tree.getStyle(node));
  assert.equal(error.constructor, Error);
  assert.equal(error.code, "ERR_TAFFY_STALE_NODE_ID");
});

test("slot-reuse", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf({});
  tree.clear();
  const second = tree.newLeaf({});

  assert.equal(first & SLOT_MASK, second & SLOT_MASK, "fixture reuses the native slot");
  assert.notEqual(first, second);
  assert.throws(() => tree.getStyle(first), { code: "ERR_TAFFY_STALE_NODE_ID" });
  assert.deepEqual(tree.getStyle(second), tree.getStyle(second));
});
