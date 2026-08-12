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
  getLayout(node: bigint): Layout;
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
  assert.equal(typeof Reflect.get(value.prototype, "getLayout"), "function", "getLayout is public");
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

contractTest("API-TREE-025/exact-zero", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  const layout = tree.getLayout(node);

  assert.deepEqual(layout, ZERO_LAYOUT);
  assert.deepEqual(Object.keys(layout), [
    "order",
    "location",
    "size",
    "contentSize",
    "scrollbarSize",
    "border",
    "padding",
    "margin",
  ]);
});

contractTest("API-TREE-025/rounding-selection", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({
    size: { width: api.Dimension.Length(10.5), height: api.Dimension.Length(6.25) },
  });
  const options = { root: node, availableSpace: maxContentSpace() };

  tree.disableRounding();
  tree.computeLayout(options);
  assert.deepEqual(tree.getLayout(node).size, { width: 10.5, height: 6.25 });

  tree.enableRounding();
  tree.computeLayout(options);
  assert.deepEqual(tree.getLayout(node).size, { width: 11, height: 6 });
});

contractTest("API-TREE-025/stale-stored", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({
    size: { width: api.Dimension.Length(20), height: api.Dimension.Length(10) },
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const before = tree.getLayout(node);

  tree.setStyle(node, {
    size: { width: api.Dimension.Length(40), height: api.Dimension.Length(30) },
  });
  assert.deepEqual(tree.getLayout(node), before, "getter does not compute a dirty node");

  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.deepEqual(tree.getLayout(node).size, { width: 40, height: 30 });
});

contractTest("API-TREE-025/detached", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({
    margin: { left: api.Dimension.Length(3) },
    size: { width: api.Dimension.Length(20), height: api.Dimension.Length(10) },
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const first = tree.getLayout(node);
  const second = tree.getLayout(node);

  assert.notEqual(first, second);
  assert.notEqual(first.location, second.location);
  assert.notEqual(first.size, second.size);
  assert.notEqual(first.margin, second.margin);
  first.location.x = 99;
  first.size.width = 88;
  first.margin.left = 77;
  assert.deepEqual(tree.getLayout(node), second);
});

contractTest("API-TREE-025/numeric-widening", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({
    size: { width: api.Dimension.Length(12.2500001), height: api.Dimension.Length(8.5000001) },
  });
  tree.disableRounding();
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const layout = tree.getLayout(node);

  assert.equal(layout.size.width, Math.fround(12.2500001));
  assert.equal(layout.size.height, Math.fround(8.5000001));
  assert.equal(typeof layout.order, "number");
  assert.equal(Number.isSafeInteger(layout.order), true);
});

contractTest("API-TREE-025/invalid-id", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.getLayout(1 as never)).constructor, TypeError);
  assert.equal(captureError(() => tree.getLayout(0n)).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(captureError(() => tree.getLayout(foreign)).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.getLayout(stale)).code, "ERR_TAFFY_STALE_NODE_ID");
});
