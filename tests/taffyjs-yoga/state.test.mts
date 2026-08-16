import assert from "node:assert/strict";
import Yoga, { Edge } from "yoga-layout";
import OracleYoga from "yoga-layout-oracle";
import { test } from "vite-plus/test";

function flags(node: { isDirty(): boolean; hasNewLayout(): boolean }): readonly [boolean, boolean] {
  return [node.isDirty(), node.hasNewLayout()];
}

test("declaration changes preserve Yoga dirty and new-layout transitions", () => {
  const node = Yoga.Node.create();
  const oracle = OracleYoga.Node.create();
  try {
    assert.deepEqual(flags(node), flags(oracle));
    node.markLayoutSeen();
    oracle.markLayoutSeen();
    assert.deepEqual(flags(node), flags(oracle));

    node.setWidth(10);
    oracle.setWidth(10);
    assert.deepEqual(flags(node), flags(oracle));
    node.calculateLayout(undefined, undefined);
    oracle.calculateLayout(undefined, undefined);
    assert.deepEqual(flags(node), flags(oracle));
    node.markLayoutSeen();
    oracle.markLayoutSeen();

    node.setWidth(10);
    oracle.setWidth(10);
    assert.deepEqual(flags(node), flags(oracle));
    node.setMargin(Edge.All, 2);
    oracle.setMargin(OracleYoga.EDGE_ALL, 2);
    assert.deepEqual(flags(node), flags(oracle));
    assert.equal(node.getComputedWidth(), 10);
    node.setHeight(4);
    oracle.setHeight(4);
    assert.deepEqual(flags(node), flags(oracle));

    node.calculateLayout(undefined, undefined);
    oracle.calculateLayout(undefined, undefined);
    assert.deepEqual(flags(node), flags(oracle));
  } finally {
    node.free();
    oracle.free();
  }
});

test("copyStyle dirties only when raw declarations differ", () => {
  const source = Yoga.Node.create();
  const destination = Yoga.Node.create();
  source.setWidth(20);
  destination.calculateLayout(undefined, undefined);
  destination.markLayoutSeen();

  destination.copyStyle(source);
  assert.deepEqual(flags(destination), [true, false]);
  assert.deepEqual(destination.getWidth(), source.getWidth());
  destination.calculateLayout(undefined, undefined);
  destination.markLayoutSeen();
  destination.copyStyle(source);
  assert.deepEqual(flags(destination), [false, false]);

  source.free();
  destination.free();
});

test("calculateLayout commits public state only for the selected subtree", () => {
  const root = Yoga.Node.create();
  const child = Yoga.Node.create();
  const grandchild = Yoga.Node.create();
  root.insertChild(child, 0);
  child.insertChild(grandchild, 0);

  root.calculateLayout(undefined, undefined);
  for (const node of [root, child, grandchild]) node.markLayoutSeen();

  root.calculateLayout(undefined, undefined);
  assert.deepEqual(flags(root), [false, true]);
  assert.deepEqual(flags(child), [false, false]);
  assert.deepEqual(flags(grandchild), [false, false]);

  for (const node of [root, child, grandchild]) node.markLayoutSeen();
  root.calculateLayout(100, 100);
  assert.deepEqual(flags(root), [false, true]);
  assert.deepEqual(flags(child), [false, true]);
  assert.deepEqual(flags(grandchild), [false, true]);

  for (const node of [root, child, grandchild]) node.markLayoutSeen();
  child.calculateLayout(undefined, undefined);
  assert.deepEqual(flags(root), [false, false]);
  assert.deepEqual(flags(child), [false, true]);
  assert.deepEqual(flags(grandchild), [false, true]);

  for (const node of [root, child, grandchild]) node.markLayoutSeen();
  child.calculateLayout(undefined, undefined);
  assert.deepEqual(flags(root), [false, false]);
  assert.deepEqual(flags(child), [false, true]);
  assert.deepEqual(flags(grandchild), [false, false]);

  for (const node of [root, child, grandchild]) node.markLayoutSeen();
  grandchild.setWidth(3);
  assert.deepEqual(flags(root), [true, false]);
  assert.deepEqual(flags(child), [true, false]);
  assert.deepEqual(flags(grandchild), [true, false]);
  child.calculateLayout(undefined, undefined);
  assert.deepEqual(flags(root), [true, false]);
  assert.deepEqual(flags(child), [false, true]);
  assert.deepEqual(flags(grandchild), [false, true]);

  root.freeRecursive();
});

test("Config translation revisions do not dirty Nodes but refresh the next selected subtree", () => {
  const config = Yoga.Config.create();
  const root = Yoga.Node.createWithConfig(config);
  const child = Yoga.Node.createWithConfig(config);
  root.insertChild(child, 0);
  root.calculateLayout(undefined, undefined);
  root.markLayoutSeen();
  child.markLayoutSeen();

  config.setUseWebDefaults(true);
  assert.deepEqual(flags(root), [false, false]);
  assert.deepEqual(flags(child), [false, false]);
  root.calculateLayout(undefined, undefined);
  assert.deepEqual(flags(root), [false, true]);
  assert.deepEqual(flags(child), [false, true]);

  root.freeRecursive();
  config.free();
});

test("a descendant's independent Config refreshes the whole selected subtree", () => {
  const childConfig = Yoga.Config.create();
  const root = Yoga.Node.create();
  const child = Yoga.Node.createWithConfig(childConfig);
  root.insertChild(child, 0);
  root.calculateLayout(undefined, undefined);
  root.markLayoutSeen();
  child.markLayoutSeen();

  childConfig.setUseWebDefaults(true);
  assert.deepEqual(flags(root), [false, false]);
  assert.deepEqual(flags(child), [false, false]);
  root.calculateLayout(undefined, undefined);
  assert.deepEqual(flags(root), [false, true]);
  assert.deepEqual(flags(child), [false, true]);
  assert.equal(child.getFlexShrink(), 1);

  root.freeRecursive();
  childConfig.free();
});

test("dirtied callbacks receive canonical Nodes after state is committed", () => {
  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  parent.insertChild(child, 0);
  parent.calculateLayout(undefined, undefined);
  parent.markLayoutSeen();
  child.markLayoutSeen();

  const calls = new Set<unknown>();
  parent.setDirtiedFunc((node) => {
    assert.equal(node.isDirty(), true);
    calls.add(node);
  });
  child.setDirtiedFunc((node) => {
    assert.equal(parent.isDirty(), true);
    assert.equal(node.isDirty(), true);
    calls.add(node);
  });
  child.setWidth(8);
  assert.deepEqual(calls, new Set([parent, child]));

  parent.calculateLayout(undefined, undefined);
  parent.setDirtiedFunc(null);
  child.unsetDirtiedFunc();
  calls.clear();
  child.setWidth(9);
  assert.equal(calls.size, 0);

  parent.freeRecursive();
});

test("a dirtied callback error is post-commit and preserves thrown identity", () => {
  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  parent.insertChild(child, 0);
  parent.calculateLayout(undefined, undefined);
  const sentinel = { reason: "expected" };
  child.setDirtiedFunc(() => {
    throw sentinel;
  });

  assert.throws(
    () => child.setWidth(14),
    (error) => error === sentinel,
  );
  assert.deepEqual(child.getWidth(), { value: 14, unit: Yoga.UNIT_POINT });
  assert.equal(child.isDirty(), true);
  assert.equal(parent.isDirty(), true);

  child.unsetDirtiedFunc();
  parent.freeRecursive();
});

test("markDirty is restricted to measured leaves and propagates public dirty state", () => {
  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  parent.insertChild(child, 0);
  parent.calculateLayout(undefined, undefined);
  parent.markLayoutSeen();
  child.markLayoutSeen();

  assert.throws(() => child.markDirty(), /measured Yoga leaves/);
  child.setMeasureFunc(() => ({ width: 1, height: 2 }));
  assert.deepEqual(flags(child), [false, false]);
  child.markDirty();
  assert.deepEqual(flags(child), [true, false]);
  assert.deepEqual(flags(parent), [true, false]);

  parent.calculateLayout(undefined, undefined);
  parent.markLayoutSeen();
  child.markLayoutSeen();
  child.setMeasureFunc(() => ({ width: 3, height: 4 }));
  assert.deepEqual(flags(child), [false, false]);
  child.setMeasureFunc(null);
  assert.deepEqual(flags(child), [false, false]);
  assert.throws(() => child.markDirty(), /measured Yoga leaves/);

  parent.freeRecursive();
});

test("supported inert flags stay clean and unsupported baseline selection is atomic", () => {
  const node = Yoga.Node.create();
  node.calculateLayout(undefined, undefined);
  node.markLayoutSeen();
  node.setAlwaysFormsContainingBlock(true);
  assert.deepEqual(flags(node), [false, false]);
  node.setAlwaysFormsContainingBlock(false);
  assert.deepEqual(flags(node), [false, false]);
  node.setIsReferenceBaseline(false);
  assert.equal(node.isReferenceBaseline(), false);
  assert.deepEqual(flags(node), [false, false]);
  assert.throws(() => node.setIsReferenceBaseline(true as never), /unsupported/);
  assert.equal(node.isReferenceBaseline(), false);
  assert.deepEqual(flags(node), [false, false]);
  node.free();
});
