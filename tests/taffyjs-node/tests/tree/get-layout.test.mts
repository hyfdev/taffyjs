import assert from "node:assert/strict";
import { AvailableSpace, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

type Layout = {
  order: number;
  location: { x: number; y: number };
  size: { width: number; height: number };
  scrollableOverflowRect: { left: number; right: number; top: number; bottom: number };
  scrollbarSize: { width: number; height: number };
  border: { left: number; right: number; top: number; bottom: number };
  padding: { left: number; right: number; top: number; bottom: number };
  margin: { left: number; right: number; top: number; bottom: number };
};

const ZERO_LAYOUT: Layout = {
  order: 0,
  location: { x: 0, y: 0 },
  size: { width: 0, height: 0 },
  scrollableOverflowRect: { left: 0, right: 0, top: 0, bottom: 0 },
  scrollbarSize: { width: 0, height: 0 },
  border: { left: 0, right: 0, top: 0, bottom: 0 },
  padding: { left: 0, right: 0, top: 0, bottom: 0 },
  margin: { left: 0, right: 0, top: 0, bottom: 0 },
};

function maxContentSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
}

test("exact-zero", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf();
  const layout = tree.getLayout(node);

  assert.deepEqual(layout, ZERO_LAYOUT);
  assert.deepEqual(Object.keys(layout), [
    "order",
    "location",
    "size",
    "scrollableOverflowRect",
    "scrollbarSize",
    "border",
    "padding",
    "margin",
  ]);
});

test("rounding-selection", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: 10.5, height: 6.25 },
  });
  const options = { root: node, availableSpace: maxContentSpace() };

  tree.disableRounding();
  tree.computeLayout(options);
  assert.deepEqual(tree.getLayout(node).size, { width: 10.5, height: 6.25 });

  tree.enableRounding();
  tree.computeLayout(options);
  assert.deepEqual(tree.getLayout(node).size, { width: 11, height: 6 });
});

test("stale-stored", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: 20, height: 10 },
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const before = tree.getLayout(node);

  tree.setStyle(node, {
    size: { width: 40, height: 30 },
  });
  assert.deepEqual(tree.getLayout(node), before, "getter does not compute a dirty node");

  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.deepEqual(tree.getLayout(node).size, { width: 40, height: 30 });
});

test("detached", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    margin: { left: 3 },
    size: { width: 20, height: 10 },
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const first = tree.getLayout(node);
  const second = tree.getLayout(node);

  assert.notEqual(first, second);
  assert.notEqual(first.location, second.location);
  assert.notEqual(first.size, second.size);
  assert.notEqual(first.margin, second.margin);
  const mutableFirst = first as {
    location: { x: number };
    size: { width: number };
    margin: { left: number };
  };
  mutableFirst.location.x = 99;
  mutableFirst.size.width = 88;
  mutableFirst.margin.left = 77;
  assert.deepEqual(tree.getLayout(node), second);
});

test("numeric-widening", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: 12.2500001, height: 8.5000001 },
  });
  tree.disableRounding();
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const layout = tree.getLayout(node);

  assert.equal(layout.size.width, Math.fround(12.2500001));
  assert.equal(layout.size.height, Math.fround(8.5000001));
  assert.equal(typeof layout.order, "number");
  assert.equal(Number.isSafeInteger(layout.order), true);
});
