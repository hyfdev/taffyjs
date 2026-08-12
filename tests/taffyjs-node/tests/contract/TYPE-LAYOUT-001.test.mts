import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type Tree = {
  computeLayout(options: object): void;
  getLayout(node: bigint): Layout;
  getUnroundedLayout(node: bigint): Layout;
  newLeaf(style: object): bigint;
};
type TreeConstructor = new () => Tree;
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

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  return value as unknown as TreeConstructor;
}

function minContentSpace() {
  const value = Reflect.get(api, "AvailableSpace") as {
    MinContent: object;
  };
  return { width: value.MinContent, height: value.MinContent };
}

contractTest("TYPE-LAYOUT-001/zero", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  assert.deepEqual(tree.getLayout(node), ZERO_LAYOUT);
  assert.deepEqual(tree.getUnroundedLayout(node), ZERO_LAYOUT);
});

contractTest("TYPE-LAYOUT-001/f32-special", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({
    size: { width: { unit: 0, value: Infinity }, height: { unit: 0, value: Infinity } },
    border: { right: { unit: 0, value: NaN } },
    padding: { bottom: { unit: 0, value: NaN } },
  });
  tree.computeLayout({ root: node, availableSpace: minContentSpace() });
  const layout = tree.getUnroundedLayout(node);
  assert.equal(layout.size.width, Infinity);
  assert.equal(layout.size.height, Infinity);
  assert.equal(Number.isNaN(layout.border.right), true);
  assert.equal(Number.isNaN(layout.padding.bottom), true);
});

contractTest("TYPE-LAYOUT-001/exact-keys", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  const layout = tree.getLayout(node);
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
  assert.deepEqual(Object.keys(layout.location), ["x", "y"]);
  assert.deepEqual(Object.keys(layout.size), ["width", "height"]);
  for (const field of ["border", "padding", "margin"] as const) {
    assert.deepEqual(Object.keys(layout[field]), ["left", "right", "top", "bottom"]);
  }
});

contractTest("TYPE-LAYOUT-001/detached", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  const first = tree.getLayout(node);
  const second = tree.getLayout(node);
  assert.notEqual(first, second);
  assert.notEqual(first.location, second.location);
  assert.notEqual(first.size, second.size);
  assert.equal(Object.isFrozen(first), false);
  first.location.x = 99;
  first.padding.left = 88;
  assert.deepEqual(second, ZERO_LAYOUT);
  assert.deepEqual(tree.getLayout(node), ZERO_LAYOUT);
});

contractTest("TYPE-LAYOUT-001/shared-converter", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  const rounded = tree.getLayout(node);
  const unrounded = tree.getUnroundedLayout(node);
  assert.deepEqual(rounded, unrounded);
  assert.deepEqual(Object.keys(rounded), Object.keys(unrounded));
  for (const field of [
    "location",
    "size",
    "contentSize",
    "scrollbarSize",
    "border",
    "padding",
    "margin",
  ] as const) {
    assert.notEqual(rounded[field], unrounded[field]);
  }
});
