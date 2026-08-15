import assert from "node:assert/strict";
import { AvailableSpace, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";
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

function minContentSpace() {
  return { width: AvailableSpace.MinContent, height: AvailableSpace.MinContent };
}

test("zero", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({});
  assert.deepEqual(tree.getLayout(node), ZERO_LAYOUT);
  assert.deepEqual(tree.getUnroundedLayout(node), ZERO_LAYOUT);
});

test("f32-special", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: Infinity, height: Infinity },
    border: { right: NaN },
    padding: { bottom: NaN },
  });
  tree.computeLayout({ root: node, availableSpace: minContentSpace() });
  const layout = tree.getUnroundedLayout(node);
  assert.equal(layout.size.width, Infinity);
  assert.equal(layout.size.height, Infinity);
  assert.equal(Number.isNaN(layout.border.right), true);
  assert.equal(Number.isNaN(layout.padding.bottom), true);
});

test("exact-keys", () => {
  const tree = new TaffyTree();
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

test("detached", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({});
  const first = tree.getLayout(node);
  const second = tree.getLayout(node);
  assert.notEqual(first, second);
  assert.notEqual(first.location, second.location);
  assert.notEqual(first.size, second.size);
  assert.equal(Object.isFrozen(first), false);
  const mutableFirst = first as { location: { x: number }; padding: { left: number } };
  mutableFirst.location.x = 99;
  mutableFirst.padding.left = 88;
  assert.deepEqual(second, ZERO_LAYOUT);
  assert.deepEqual(tree.getLayout(node), ZERO_LAYOUT);
});

test("shared-converter", () => {
  const tree = new TaffyTree();
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
