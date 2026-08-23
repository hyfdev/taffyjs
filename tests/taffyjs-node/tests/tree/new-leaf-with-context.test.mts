import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { AvailableSpace, type NodeId, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

type MeasureArgs = { node: NodeId; context: unknown };

function availableSpace() {
  return { width: AvailableSpace.MinContent, height: AvailableSpace.MinContent };
}

function measure(tree: TaffyTree, root: NodeId, callback: (args: MeasureArgs) => void) {
  tree.computeLayout({
    root,
    availableSpace: availableSpace(),
    measure(args) {
      callback(args);
      return { width: 10, height: 10 };
    },
  });
}

test("identity", () => {
  const tree = new TaffyTree();
  const context = { label: "same object" };
  const node = tree.newLeafWithContext(context);
  const explicitUndefinedStyle = tree.newLeafWithContext(context, undefined);
  let measured: unknown;

  assert.equal(tree.getNodeContext(node), context);
  assert.equal(tree.getNodeContext(explicitUndefinedStyle), context);
  assert.deepEqual(tree.getStyle(explicitUndefinedStyle), tree.getStyle(node));
  measure(tree, node, ({ context: received }) => {
    measured = received;
  });
  assert.equal(measured, context);
});

test("style-shaped-context", () => {
  const tree = new TaffyTree<{ flexGrow: number }>();
  const context = { flexGrow: 2 };
  const node = tree.newLeafWithContext(context);

  assert.equal(tree.getNodeContext(node), context);
  assert.equal(tree.getStyle(node).flexGrow, 0);
});

test("primitive-null-undefined", () => {
  const tree = new TaffyTree();
  const symbol = Symbol("context");
  for (const context of [false, 0, "", 1n, symbol, null]) {
    const node = tree.newLeafWithContext(context);
    let calls = 0;
    assert.equal(tree.getNodeContext(node), context);
    measure(tree, node, ({ context: received }) => {
      calls += 1;
      assert.equal(received, context);
    });
    assert.equal(calls > 0, true);
  }

  const absent = tree.newLeafWithContext(undefined);
  let absentCalls = 0;
  assert.equal(tree.getNodeContext(absent), undefined);
  measure(tree, absent, ({ context }) => {
    absentCalls += 1;
    assert.equal(context, undefined);
  });
  assert.equal(absentCalls > 0, true);
});

test("removal-cleanup", () => {
  const fixture = fileURLToPath(new URL("./fixtures/context-lifetime.ts", import.meta.url));
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
    callbackCollected: true,
  });
});

test("callback-delivery", () => {
  const tree = new TaffyTree();
  const context = { width: 42 };
  const node = tree.newLeafWithContext(context);
  let calls = 0;

  measure(tree, node, (args) => {
    calls += 1;
    assert.equal(args.node, node);
    assert.equal(args.context, context);
  });
  assert.equal(calls > 0, true);
});

test("conversion-atomic", () => {
  const tree = new TaffyTree();
  const context = { retained: false };

  const ignored = tree.newLeafWithContext(context, { unknownField: true } as never);
  assert.equal(tree.getNodeContext(ignored), context);
  assert.throws(() => tree.newLeafWithContext(context, { display: 999 } as never), RangeError);
  assert.equal(tree.getNodeCount(), 1);

  const first = tree.newLeafWithContext(context);
  assert.equal(tree.getNodeCount(), 2);
  assert.equal(tree.getNodeContext(first), context);
});
