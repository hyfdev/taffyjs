import assert from "node:assert/strict";
import { AvailableSpace, Overflow, TaffyTree } from "@taffyjs/node";
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
  const node = tree.newLeaf();
  assert.deepEqual(tree.getLayout(node), ZERO_LAYOUT);
  assert.deepEqual(tree.getUnroundedLayout(node), ZERO_LAYOUT);
});

test("f32-special", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: Infinity, height: Infinity },
    border: { left: -0, right: +0, top: NaN, bottom: Infinity },
    padding: { left: -Infinity, right: NaN },
    margin: { left: -0, right: +0 },
  });
  tree.computeLayout({ root: node, availableSpace: minContentSpace() });
  const layout = tree.getUnroundedLayout(node);
  assert.equal(layout.size.width, Infinity);
  assert.equal(layout.size.height, Infinity);
  assert.equal(Object.is(layout.border.left, -0), true);
  assert.equal(Object.is(layout.border.right, +0), true);
  assert.equal(Number.isNaN(layout.border.top), true);
  assert.equal(layout.border.bottom, Infinity);
  assert.equal(layout.padding.left, -Infinity);
  assert.equal(Number.isNaN(layout.padding.right), true);
  assert.equal(Object.is(layout.margin.left, -0), true);
  assert.equal(Object.is(layout.margin.right, +0), true);
});

test("complete-values", () => {
  const tree = new TaffyTree();
  tree.disableRounding();
  const child = tree.newLeaf({
    size: { width: 30, height: 40 },
    margin: { left: 1, right: 2, top: 3, bottom: 4 },
    padding: { left: 5, right: 6, top: 7, bottom: 8 },
    border: { left: 9, right: 10, top: 11, bottom: 12 },
    overflow: { x: Overflow.Scroll, y: Overflow.Scroll },
    scrollbarWidth: 13,
  });
  const root = tree.newWithChildren([child], {
    size: { width: 100, height: 120 },
    padding: { left: 2, right: 3, top: 4, bottom: 5 },
  });
  tree.computeLayout({ root, availableSpace: minContentSpace() });

  assert.deepEqual(tree.getUnroundedLayout(child), {
    order: 0,
    location: { x: 3, y: 7 },
    size: { width: 30, height: 40 },
    contentSize: { width: 11, height: 15 },
    scrollbarSize: { width: 13, height: 13 },
    border: { left: 9, right: 10, top: 11, bottom: 12 },
    padding: { left: 5, right: 6, top: 7, bottom: 8 },
    margin: { left: 1, right: 2, top: 3, bottom: 4 },
  });
});

test("exact-keys", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf();
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
  assert.deepEqual(Object.keys(layout.contentSize), ["width", "height"]);
  assert.deepEqual(Object.keys(layout.scrollbarSize), ["width", "height"]);
  for (const field of ["border", "padding", "margin"] as const) {
    assert.deepEqual(Object.keys(layout[field]), ["left", "right", "top", "bottom"]);
  }
  for (const value of [
    layout,
    layout.location,
    layout.size,
    layout.contentSize,
    layout.scrollbarSize,
    layout.border,
    layout.padding,
    layout.margin,
  ]) {
    assert.equal(Object.getPrototypeOf(value), Object.prototype);
    for (const key of Object.keys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      assert.ok(descriptor);
      assert.equal(descriptor.enumerable, true);
      assert.equal(descriptor.writable, true);
      assert.equal(descriptor.configurable, true);
    }
  }
});

test("detached", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf();
  const first = tree.getLayout(node);
  const second = tree.getLayout(node);
  assert.notEqual(first, second);
  assert.notEqual(first.location, second.location);
  assert.notEqual(first.size, second.size);
  assert.notEqual(first.contentSize, second.contentSize);
  assert.notEqual(first.scrollbarSize, second.scrollbarSize);
  assert.notEqual(first.border, second.border);
  assert.notEqual(first.padding, second.padding);
  assert.notEqual(first.margin, second.margin);
  assert.equal(Object.isFrozen(first), false);
  const mutableFirst = first as { location: { x: number }; padding: { left: number } };
  mutableFirst.location.x = 99;
  mutableFirst.padding.left = 88;
  assert.deepEqual(second, ZERO_LAYOUT);
  assert.deepEqual(tree.getLayout(node), ZERO_LAYOUT);
});

test("scratch-isolation", () => {
  const populatedTree = new TaffyTree();
  const populated = populatedTree.newLeaf({
    size: { width: 30, height: 40 },
    margin: { left: 1, right: 2, top: 3, bottom: 4 },
    padding: { left: 5, right: 6, top: 7, bottom: 8 },
    border: { left: 9, right: 10, top: 11, bottom: 12 },
  });
  populatedTree.computeLayout({ root: populated, availableSpace: minContentSpace() });

  const zeroTree = new TaffyTree();
  const zero = zeroTree.newLeaf({});
  for (let index = 0; index < 20; index += 1) {
    assert.equal(populatedTree.getLayout(populated).size.width, 30);
    assert.deepEqual(zeroTree.getUnroundedLayout(zero), ZERO_LAYOUT);
  }
});

test("binding-error-does-not-leak-scratch", () => {
  const tree = new TaffyTree();
  const measured = tree.newLeafWithContext(true, {});
  let busyCode: unknown;
  tree.computeLayout({
    root: measured,
    availableSpace: minContentSpace(),
    measure() {
      try {
        tree.getLayout(measured);
      } catch (error) {
        busyCode ??=
          typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
      }
      return { width: 17, height: 9 };
    },
  });
  assert.equal(busyCode, "ERR_TAFFY_TREE_BUSY");
  assert.deepEqual(tree.getUnroundedLayout(measured).size, { width: 17, height: 9 });
});

test("shared-converter", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf();
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
