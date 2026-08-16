import assert from "node:assert/strict";
import Yoga, { Align, FlexDirection, Unit } from "yoga-layout";
import { test } from "vite-plus/test";

test("free removes exactly one attached node and preserves its child subtrees", () => {
  const root = Yoga.Node.create();
  const middle = Yoga.Node.create();
  const leaf = Yoga.Node.create();
  middle.setWidth(30);
  middle.setHeight(10);
  root.insertChild(middle, 0);
  middle.insertChild(leaf, 0);
  root.calculateLayout(undefined, undefined);
  root.markLayoutSeen();
  middle.markLayoutSeen();
  leaf.markLayoutSeen();
  assert.equal(root.getComputedWidth(), 30);
  assert.equal(root.getComputedHeight(), 10);

  middle.free();
  assert.equal(root.getChildCount(), 0);
  assert.equal(root.isDirty(), true);
  assert.equal(leaf.getParent(), null);
  assert.equal(leaf.isDirty(), false);
  assert.equal(leaf.hasNewLayout(), false);
  assert.throws(() => middle.getParent(), /freed/);

  root.calculateLayout(undefined, undefined);
  assert.equal(root.getComputedWidth(), 0);
  assert.equal(root.getComputedHeight(), 0);

  leaf.setWidth(7);
  leaf.calculateLayout(undefined, undefined);
  assert.equal(leaf.getComputedWidth(), 7);
  root.free();
  leaf.free();
});

test("freeRecursive invalidates only the selected subtree", () => {
  const root = Yoga.Node.create();
  const selected = Yoga.Node.create();
  const descendant = Yoga.Node.create();
  const sibling = Yoga.Node.create();
  selected.setWidth(30);
  selected.setHeight(10);
  root.insertChild(selected, 0);
  root.insertChild(sibling, 1);
  selected.insertChild(descendant, 0);
  root.calculateLayout(undefined, undefined);
  root.markLayoutSeen();
  sibling.markLayoutSeen();
  assert.equal(root.getComputedWidth(), 30);
  assert.equal(root.getComputedHeight(), 10);

  selected.freeRecursive();
  assert.equal(root.getChildCount(), 1);
  assert.equal(root.getChild(0), sibling);
  assert.equal(sibling.getParent(), root);
  assert.equal(root.isDirty(), true);
  assert.equal(sibling.isDirty(), false);
  assert.throws(() => selected.getChildCount(), /freed/);
  assert.throws(() => descendant.getParent(), /freed/);

  root.calculateLayout(undefined, undefined);
  assert.equal(root.getComputedWidth(), 0);
  assert.equal(root.getComputedHeight(), 0);

  root.freeRecursive();
});

test("factory destroy uses the same deterministic lifetime path", () => {
  const node = Yoga.Node.create();
  Yoga.Node.destroy(node);
  assert.throws(() => node.getWidth(), /freed/);
  assert.throws(() => Yoga.Node.destroy(node), /freed/);
});

test("reset preserves identity and Config while restoring every Node-owned input", () => {
  const config = Yoga.Config.create();
  const node = Yoga.Node.createWithConfig(config);
  let dirtiedCalls = 0;
  node.setWidth(30);
  node.setFlexGrow(2);
  node.setMeasureFunc(() => ({ width: 3, height: 4 }));
  node.setDirtiedFunc(() => {
    dirtiedCalls += 1;
  });
  node.setAlwaysFormsContainingBlock(true);
  node.calculateLayout(undefined, undefined);
  node.markLayoutSeen();

  config.setUseWebDefaults(true);
  node.reset();
  assert.deepEqual(node.getWidth(), { value: Number.NaN, unit: Unit.Auto });
  assert.equal(node.getFlexGrow(), 0);
  assert.equal(node.getFlexShrink(), 1);
  assert.equal(node.getFlexDirection(), FlexDirection.Row);
  assert.equal(node.getAlignContent(), Align.Stretch);
  assert.equal(node.isReferenceBaseline(), false);
  assert.equal(node.isDirty(), true);
  assert.equal(node.hasNewLayout(), true);
  assert.deepEqual(node.getComputedLayout(), {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: Number.NaN,
    height: Number.NaN,
  });

  node.calculateLayout(undefined, undefined);
  node.setWidth(9);
  assert.equal(dirtiedCalls, 0);

  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  parent.insertChild(node, 0);
  assert.equal(parent.getChild(0), node);
  parent.removeChild(node);
  parent.insertChild(child, 0);
  assert.throws(() => parent.reset(), /detached Yoga leaf/);
  assert.throws(() => child.reset(), /detached Yoga leaf/);
  assert.equal(parent.getChild(0), child);

  parent.freeRecursive();
  node.free();
  config.free();
});
