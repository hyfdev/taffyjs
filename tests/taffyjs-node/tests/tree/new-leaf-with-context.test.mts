import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type MeasureArgs = { node: bigint; context: unknown };
type Tree = {
  computeLayoutWithMeasure(options: {
    root: bigint;
    availableSpace: object;
    measure: (args: MeasureArgs) => object;
  }): void;
  getNodeContext(node: bigint): unknown;
  getNodeCount(): number;
  newLeafWithContext(style: object, context: unknown): bigint;
};
type TreeConstructor = new () => Tree;

const U64_MASK = (1n << 64n) - 1n;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "newLeafWithContext"),
    "function",
    "newLeafWithContext is public",
  );
  return value as unknown as TreeConstructor;
}

function availableSpace() {
  return { width: api.AvailableSpace.MinContent, height: api.AvailableSpace.MinContent };
}

function creationSerial(node: bigint) {
  return (node >> 64n) & U64_MASK;
}

function measure(tree: Tree, root: bigint, callback: (args: MeasureArgs) => void) {
  tree.computeLayoutWithMeasure({
    root,
    availableSpace: availableSpace(),
    measure(args) {
      callback(args);
      return { width: 10, height: 10 };
    },
  });
}

test("identity", () => {
  const tree = new (TaffyTree())();
  const context = { label: "same object" };
  const node = tree.newLeafWithContext({}, context);
  let measured: unknown;

  assert.equal(tree.getNodeContext(node), context);
  measure(tree, node, ({ context: received }) => {
    measured = received;
  });
  assert.equal(measured, context);
});

test("primitive-null-undefined", () => {
  const tree = new (TaffyTree())();
  const symbol = Symbol("context");
  for (const context of [false, 0, "", 1n, symbol, null]) {
    const node = tree.newLeafWithContext({}, context);
    let calls = 0;
    assert.equal(tree.getNodeContext(node), context);
    measure(tree, node, ({ context: received }) => {
      calls += 1;
      assert.equal(received, context);
    });
    assert.equal(calls > 0, true);
  }

  const absent = tree.newLeafWithContext({}, undefined);
  let absentCalls = 0;
  assert.equal(tree.getNodeContext(absent), undefined);
  measure(tree, absent, ({ context }) => {
    absentCalls += 1;
    assert.equal(context, undefined);
  });
  assert.equal(absentCalls > 0, true);
});

test("removal-cleanup", () => {
  const fixture = fileURLToPath(new URL("./fixtures/context-lifetime.mjs", import.meta.url));
  const child = spawnSync(process.execPath, ["--expose-gc", fixture], {
    encoding: "utf8",
    timeout: 20_000,
  });
  assert.equal(child.signal, null);
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout), {
    removedCollected: true,
    clearedCollected: true,
    failedConversionCollected: true,
  });
});

test("callback-delivery", () => {
  const tree = new (TaffyTree())();
  const context = { width: 42 };
  const node = tree.newLeafWithContext({}, context);
  let calls = 0;

  measure(tree, node, (args) => {
    calls += 1;
    assert.equal(args.node, node);
    assert.equal(args.context, context);
  });
  assert.equal(calls > 0, true);
});

test("conversion-atomic", () => {
  const tree = new (TaffyTree())();
  const context = { retained: false };

  assert.throws(() => tree.newLeafWithContext({ unknownField: true }, context), TypeError);
  assert.equal(tree.getNodeCount(), 0);

  const first = tree.newLeafWithContext({}, context);
  assert.equal(creationSerial(first), 1n, "failed conversion does not consume a serial");
  assert.equal(tree.getNodeCount(), 1);
  assert.equal(tree.getNodeContext(first), context);
});
