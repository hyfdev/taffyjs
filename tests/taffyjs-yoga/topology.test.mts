import assert from "node:assert/strict";
import { TaffyTree, type NodeId } from "@taffyjs/node";
import Yoga, { FlexDirection } from "yoga-layout";
import { loadYoga } from "yoga-layout/load";
import { test } from "vite-plus/test";

test("topology reads return canonical wrappers and preserve native order", () => {
  const parent = Yoga.Node.create();
  const first = Yoga.Node.create();
  const second = Yoga.Node.create();
  const grandchild = Yoga.Node.create();
  try {
    parent.insertChild(second, 0);
    parent.insertChild(first, 0);
    second.insertChild(grandchild, 0);

    assert.equal(parent.getChildCount(), 2);
    assert.equal(parent.getChild(0), first);
    assert.equal(parent.getChild(1), second);
    assert.equal(parent.getChild(2) as unknown, null);
    assert.equal(parent.getChild(-1) as unknown, null);
    assert.equal(parent.getChild(0.5) as unknown, null);
    assert.equal(first.getParent(), parent);
    assert.equal(grandchild.getParent(), second);

    assert.throws(() => parent.getChild("0" as never), TypeError);
  } finally {
    parent.freeRecursive();
  }
});

test("insertChild validates ownership, cycles, indices, and measured parents before mutation", async () => {
  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  const otherParent = Yoga.Node.create();
  const measured = Yoga.Node.create();
  const measuredChild = Yoga.Node.create();
  const facade = await loadYoga();
  const foreign = facade.Node.create();
  try {
    assert.throws(() => parent.insertChild(child, -1), RangeError);
    assert.throws(() => parent.insertChild(child, 0.5), RangeError);
    assert.throws(() => parent.insertChild(child, 1), RangeError);
    assert.equal(parent.getChildCount(), 0);
    assert.equal(child.getParent(), null);

    parent.insertChild(child, 0);
    assert.throws(() => otherParent.insertChild(child, 0), /already has a parent/);
    assert.throws(() => child.insertChild(parent, 0), /cycle/);
    assert.throws(() => parent.insertChild(parent, 1), /cycle/);
    assert.throws(() => parent.insertChild(foreign, 1), /another Yoga facade/);
    assert.equal(parent.getChildCount(), 1);
    assert.equal(child.getParent(), parent);

    measured.setMeasureFunc(() => ({ width: 1, height: 1 }));
    assert.throws(() => measured.insertChild(measuredChild, 0), /Measured/);
    assert.equal(measured.getChildCount(), 0);
    assert.equal(measuredChild.getParent(), null);

    otherParent.insertChild(measuredChild, 0);
    assert.throws(() => otherParent.setMeasureFunc(() => ({ width: 1, height: 1 })), /Measured/);
    assert.equal(otherParent.getChild(0), measuredChild);
  } finally {
    parent.freeRecursive();
    otherParent.freeRecursive();
    measured.free();
    foreign.free();
  }
});

test("removeChild is a no-op for non-children and resets a detached child's output", () => {
  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  const unrelated = Yoga.Node.create();
  let dirtiedCalls = 0;
  try {
    child.setWidth(10);
    child.setHeight(4);
    child.calculateLayout(undefined, undefined);
    child.markLayoutSeen();
    assert.equal(child.isDirty(), false);
    assert.equal(child.getComputedWidth(), 10);

    parent.calculateLayout(undefined, undefined);
    parent.markLayoutSeen();
    parent.setDirtiedFunc((node) => {
      assert.equal(node, parent);
      dirtiedCalls += 1;
    });
    parent.removeChild(unrelated);
    assert.equal(parent.isDirty(), false);
    assert.equal(dirtiedCalls, 0);
    assert.equal(unrelated.getParent(), null);

    parent.insertChild(child, 0);
    assert.equal(parent.isDirty(), true);
    assert.equal(child.isDirty(), false);
    assert.equal(dirtiedCalls, 1);
    parent.calculateLayout(undefined, undefined);
    parent.markLayoutSeen();
    child.markLayoutSeen();

    parent.removeChild(child);
    assert.equal(parent.isDirty(), true);
    assert.equal(dirtiedCalls, 2);
    assert.equal(child.isDirty(), false);
    assert.equal(child.hasNewLayout(), false);
    assert.equal(child.getParent(), null);
    assert.deepEqual(child.getComputedLayout(), {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: Number.NaN,
      height: Number.NaN,
    });
    assert.deepEqual(child.getWidth(), { value: 10, unit: Yoga.UNIT_POINT });
  } finally {
    parent.free();
    child.free();
    unrelated.free();
  }
});

test("different Config states may coexist in one native topology", () => {
  const config = Yoga.Config.create();
  config.setUseWebDefaults(true);
  const parent = Yoga.Node.create();
  const child = Yoga.Node.createWithConfig(config);
  try {
    parent.insertChild(child, 0);
    assert.equal(parent.getFlexDirection(), FlexDirection.Column);
    assert.equal(child.getFlexDirection(), FlexDirection.Row);
    assert.equal(child.getParent(), parent);
  } finally {
    parent.freeRecursive();
    config.free();
  }
});

test("a pre-commit native topology failure preserves public state", async () => {
  const facade = await loadYoga();
  const parent = facade.Node.create();
  const child = facade.Node.create();
  parent.calculateLayout(undefined, undefined);
  parent.markLayoutSeen();

  const prototype = TaffyTree.prototype;
  const originalInsert = Object.getOwnPropertyDescriptor(prototype, "insertChildAtIndex")
    ?.value as TaffyTree["insertChildAtIndex"];
  const sentinel = new Error("expected insert failure");
  prototype.insertChildAtIndex = function (): never {
    throw sentinel;
  };
  try {
    assert.throws(
      () => parent.insertChild(child, 0),
      (error) => error === sentinel,
    );
  } finally {
    prototype.insertChildAtIndex = originalInsert;
  }

  assert.equal(parent.getChildCount(), 0);
  assert.equal(parent.isDirty(), false);
  assert.equal(parent.hasNewLayout(), false);
  assert.equal(child.getParent(), null);

  parent.insertChild(child, 0);
  assert.equal(parent.getChild(0), child);
  parent.freeRecursive();
});

test("an unexpected partial recursive free poisons only its isolated facade", async () => {
  const facade = await loadYoga();
  const root = facade.Node.create();
  const child = facade.Node.create();
  root.insertChild(child, 0);

  const prototype = TaffyTree.prototype;
  const originalRemove = Object.getOwnPropertyDescriptor(prototype, "remove")
    ?.value as TaffyTree["remove"];
  const sentinel = new Error("expected second remove failure");
  let removeCalls = 0;
  prototype.remove = function (this: TaffyTree, node: NodeId): void {
    removeCalls += 1;
    if (removeCalls === 2) throw sentinel;
    originalRemove.call(this, node);
  };
  try {
    assert.throws(() => root.freeRecursive(), /facade is unusable/);
  } finally {
    prototype.remove = originalRemove;
  }

  assert.equal(removeCalls, 2);
  assert.throws(() => root.getChildCount(), /facade is unusable/);
  assert.throws(() => child.getParent(), /facade is unusable/);

  const healthy = await loadYoga();
  const healthyNode = healthy.Node.create();
  healthyNode.setWidth(3);
  healthyNode.calculateLayout(undefined, undefined);
  assert.equal(healthyNode.getComputedWidth(), 3);
  healthyNode.free();
});
