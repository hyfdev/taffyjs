import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type MeasureArgs = {
  knownDimensions: { width: number | undefined; height: number | undefined };
  availableSpace: {
    width: { kind: number; value?: number };
    height: { kind: number; value?: number };
  };
  node: bigint;
  context: unknown;
  style: Record<string, unknown>;
};
type Tree = {
  computeLayoutWithMeasure(options: {
    root: bigint;
    availableSpace: object;
    measure: (args: MeasureArgs) => unknown;
  }): void;
  getNodeContext(node: bigint): unknown;
  getStyle(node: bigint): Record<string, unknown>;
  getUnroundedLayout(node: bigint): { size: { width: number; height: number } };
  isDirty(node: bigint): boolean;
  newLeafWithContext(style: object, context: unknown): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  return value as unknown as TreeConstructor;
}

function availableSpace() {
  const value = Reflect.get(api, "AvailableSpace") as {
    Definite(value: number): object;
    MinContent: object;
  };
  return { width: value.Definite(200), height: value.MinContent };
}

function runMeasureChild() {
  const fixture = fileURLToPath(new URL("./fixtures/type-measure-lifetime.mjs", import.meta.url));
  const child = spawnSync(process.execPath, ["--expose-gc", fixture], {
    encoding: "utf8",
    timeout: 20_000,
  });
  assert.equal(child.signal, null);
  assert.equal(child.status, 0, child.stderr);
  const lines = child.stdout.trim().split("\n");
  assert.equal(lines.length, 1);
  return JSON.parse(lines[0]) as {
    callbackCollected: boolean;
    firstSize: { width: number; height: number };
    secondSize: { width: number; height: number };
    workerExited: boolean;
  };
}

contractTest("TYPE-MEASURE-001/args-owned", () => {
  const tree = new (TaffyTree())();
  const context = { text: "owned" };
  const node = tree.newLeafWithContext({ flexGrow: 2 }, context);
  let saved: MeasureArgs | undefined;
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
  saved.style.flexGrow = 99;
  assert.equal(tree.getStyle(node).flexGrow, 2);
});

contractTest("TYPE-MEASURE-001/result-sync", () => {
  const Tree = TaffyTree();
  const good = new Tree();
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
    const tree = new Tree();
    const node = tree.newLeafWithContext({}, undefined);
    assert.throws(
      () =>
        tree.computeLayoutWithMeasure({
          root: node,
          availableSpace: availableSpace(),
          measure: () => result,
        }),
      TypeError,
    );
  }
});

contractTest("TYPE-MEASURE-001/failure-state", () => {
  const tree = new (TaffyTree())();
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

contractTest("TYPE-MEASURE-001/env-lifetime", () => {
  const result = runMeasureChild();
  assert.equal(result.workerExited, true);
  assert.deepEqual(result.firstSize, { width: 31, height: 17 });
  assert.deepEqual(result.secondSize, { width: 7, height: 5 });
});

contractTest("TYPE-MEASURE-001/no-retention", () => {
  const result = runMeasureChild();
  assert.equal(result.callbackCollected, true);
});
