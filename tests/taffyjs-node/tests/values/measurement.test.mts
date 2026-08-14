import assert from "node:assert/strict";
import { AvailableSpace, type MeasureArgs, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

function availableSpace() {
  return { width: AvailableSpace.Definite(200), height: AvailableSpace.MinContent };
}

test("args-owned", () => {
  const tree = new TaffyTree();
  const context = { text: "owned" };
  const node = tree.newLeafWithContext({ flexGrow: 2 }, context);
  let saved: MeasureArgs<unknown> | undefined;
  tree.computeLayoutWithMeasure({
    root: node,
    availableSpace: availableSpace(),
    measure(args) {
      saved = args;
      return { width: 20, height: 10 };
    },
  });

  assert.ok(saved);
  assert.deepEqual(saved.knownDimensions, { width: undefined, height: undefined });
  assert.deepEqual(saved.availableSpace, availableSpace());
  assert.equal(saved.node, node);
  assert.equal(saved.context, context);
  assert.equal(tree.getNodeContext(saved.node), context);
  assert.deepEqual(saved.style, tree.getStyle(node));
  assert.equal(Object.isFrozen(saved), false);
  assert.equal(Object.isFrozen(saved.style), false);
  (saved.style as { flexGrow: number }).flexGrow = 99;
  assert.equal(tree.getStyle(node).flexGrow, 2);
});

test("result-sync", () => {
  const good = new TaffyTree();
  const goodNode = good.newLeafWithContext({}, undefined);
  good.computeLayoutWithMeasure({
    root: goodNode,
    availableSpace: availableSpace(),
    measure: () => ({ width: 12.25, height: 8.5 }),
  });
  assert.deepEqual(good.getUnroundedLayout(goodNode).size, {
    width: Math.fround(12.25),
    height: Math.fround(8.5),
  });

  for (const result of [
    { width: 1 },
    [1, 2],
    Promise.resolve({ width: 1, height: 2 }),
    { width: "1", height: 2 },
  ]) {
    const tree = new TaffyTree();
    const node = tree.newLeafWithContext({}, undefined);
    assert.throws(
      () =>
        tree.computeLayoutWithMeasure({
          root: node,
          availableSpace: availableSpace(),
          measure: () => result as never,
        }),
      TypeError,
    );
  }
});

test("failure-state", () => {
  const tree = new TaffyTree();
  const first = tree.newLeafWithContext({}, "first");
  const second = tree.newLeafWithContext({}, "second");
  const root = tree.newWithChildren({}, [first, second]);
  const thrown = { reason: "stop" };
  let calls = 0;

  assert.throws(
    () =>
      tree.computeLayoutWithMeasure({
        root,
        availableSpace: availableSpace(),
        measure() {
          calls += 1;
          throw thrown;
        },
      }),
    (error) => error === thrown,
  );
  assert.equal(calls, 1, "no callback runs after the first failure");
  assert.equal(tree.isDirty(root), true);
  assert.equal(tree.isDirty(first), true);
  assert.equal(tree.isDirty(second), true);

  let recoveryCalls = 0;
  tree.computeLayoutWithMeasure({
    root,
    availableSpace: availableSpace(),
    measure() {
      recoveryCalls += 1;
      return { width: 10, height: 10 };
    },
  });
  assert.equal(recoveryCalls >= 2, true);
  assert.equal(tree.isDirty(root), false);
});
