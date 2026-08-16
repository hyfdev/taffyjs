import assert from "node:assert/strict";
import { AvailableSpace, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };
type Layout = {
  order: number;
  location: { x: number; y: number };
  size: { width: number; height: number };
  contentSize: { width: number; height: number };
  scrollbarSize: { width: number; height: number };
  border: { left: number; right: number; top: number; bottom: number };
  padding: { left: number; right: number; top: number; bottom: number };
  margin: { left: number; right: number; top: number; bottom: number };
};

const ZERO_LAYOUT: Layout = {
  order: 0,
  location: { x: 0, y: 0 },
  size: { width: 0, height: 0 },
  contentSize: { width: 0, height: 0 },
  scrollbarSize: { width: 0, height: 0 },
  border: { left: 0, right: 0, top: 0, bottom: 0 },
  padding: { left: 0, right: 0, top: 0, bottom: 0 },
  margin: { left: 0, right: 0, top: 0, bottom: 0 },
};

function maxContentSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
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

test("exact-zero", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({});
  assert.deepEqual(tree.getUnroundedLayout(node), ZERO_LAYOUT);
});

test("fractional", () => {
  for (const rounding of ["enabled", "disabled"] as const) {
    const tree = new TaffyTree();
    const node = tree.newLeaf({
      size: { width: 10.5, height: 6.25 },
    });
    if (rounding === "enabled") tree.enableRounding();
    else tree.disableRounding();

    tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
    assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 10.5, height: 6.25 });
  }
});

test("stale-stored", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: 20, height: 10 },
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const before = tree.getUnroundedLayout(node);

  tree.setStyle(node, {
    size: { width: 40, height: 30 },
  });
  assert.deepEqual(tree.getUnroundedLayout(node), before);
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 40, height: 30 });
});

test("detached", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: 20, height: 10 },
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const first = tree.getUnroundedLayout(node);
  const second = tree.getUnroundedLayout(node);

  assert.notEqual(first, second);
  assert.notEqual(first.size, second.size);
  const mutableFirst = first as { size: { width: number }; padding: { left: number } };
  mutableFirst.size.width = 99;
  mutableFirst.padding.left = 88;
  assert.deepEqual(tree.getUnroundedLayout(node), second);
});

test("invalid-id", () => {
  const tree = new TaffyTree();
  const foreign = new TaffyTree().newLeaf({});

  assert.equal(captureError(() => tree.getUnroundedLayout(1 as never)).constructor, TypeError);
  assert.equal(
    captureError(() => tree.getUnroundedLayout(0n as never)).code,
    "ERR_TAFFY_INVALID_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.getUnroundedLayout(foreign)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.getUnroundedLayout(stale)).code, "ERR_TAFFY_STALE_NODE_ID");
});
