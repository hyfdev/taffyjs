import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

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
type Tree = {
  clear(): void;
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  disableRounding(): void;
  enableRounding(): void;
  getUnroundedLayout(node: bigint): Layout;
  newLeaf(style: object): bigint;
  setStyle(node: bigint, style: object): void;
};
type TreeConstructor = new () => Tree;

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

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "getUnroundedLayout"),
    "function",
    "getUnroundedLayout is public",
  );
  return value as unknown as TreeConstructor;
}

function maxContentSpace() {
  return { width: api.AvailableSpace.MaxContent, height: api.AvailableSpace.MaxContent };
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

contractTest("API-TREE-026/exact-zero", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  assert.deepEqual(tree.getUnroundedLayout(node), ZERO_LAYOUT);
});

contractTest("API-TREE-026/fractional", () => {
  for (const rounding of ["enabled", "disabled"] as const) {
    const tree = new (TaffyTree())();
    const node = tree.newLeaf({
      size: { width: api.Dimension.Length(10.5), height: api.Dimension.Length(6.25) },
    });
    if (rounding === "enabled") tree.enableRounding();
    else tree.disableRounding();

    tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
    assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 10.5, height: 6.25 });
  }
});

contractTest("API-TREE-026/stale-stored", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({
    size: { width: api.Dimension.Length(20), height: api.Dimension.Length(10) },
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const before = tree.getUnroundedLayout(node);

  tree.setStyle(node, {
    size: { width: api.Dimension.Length(40), height: api.Dimension.Length(30) },
  });
  assert.deepEqual(tree.getUnroundedLayout(node), before);
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 40, height: 30 });
});

contractTest("API-TREE-026/detached", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({
    size: { width: api.Dimension.Length(20), height: api.Dimension.Length(10) },
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const first = tree.getUnroundedLayout(node);
  const second = tree.getUnroundedLayout(node);

  assert.notEqual(first, second);
  assert.notEqual(first.size, second.size);
  first.size.width = 99;
  first.padding.left = 88;
  assert.deepEqual(tree.getUnroundedLayout(node), second);
});

contractTest("API-TREE-026/invalid-id", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.getUnroundedLayout(1 as never)).constructor, TypeError);
  assert.equal(captureError(() => tree.getUnroundedLayout(0n)).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(
    captureError(() => tree.getUnroundedLayout(foreign)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.getUnroundedLayout(stale)).code, "ERR_TAFFY_STALE_NODE_ID");
});
