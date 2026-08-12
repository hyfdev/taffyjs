import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type CodedError = Error & { code?: string };
type MeasureArgs = { node: bigint; context: unknown };
type Tree = {
  clear(): void;
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  computeLayoutWithMeasure(options: {
    root: bigint;
    availableSpace: object;
    measure: (args: MeasureArgs) => object;
  }): void;
  getNodeContext(node: bigint): unknown;
  isDirty(node: bigint): boolean;
  newLeaf(style: object): bigint;
  newLeafWithContext(style: object, context: unknown): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  setNodeContext(node: bigint, context: unknown): void;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "setNodeContext"),
    "function",
    "setNodeContext is public",
  );
  return value as unknown as TreeConstructor;
}

function availableSpace() {
  return { width: api.AvailableSpace.MinContent, height: api.AvailableSpace.MinContent };
}

function captureError(body: () => unknown): CodedError {
  try {
    body();
  } catch (error) {
    assert.ok(error instanceof Error);
    return error;
  }
  assert.fail("Expected operation to throw");
}

function computeWithMeasure(tree: Tree, root: bigint, measure: (args: MeasureArgs) => void) {
  tree.computeLayoutWithMeasure({
    root,
    availableSpace: availableSpace(),
    measure(args) {
      measure(args);
      return { width: 10, height: 10 };
    },
  });
}

contractTest("API-TREE-009/replace-identity", () => {
  const tree = new (TaffyTree())();
  const initial = { version: 1 };
  const replacement = { version: 2 };
  const node = tree.newLeafWithContext({}, initial);

  tree.setNodeContext(node, replacement);
  assert.equal(tree.getNodeContext(node), replacement);
  assert.notEqual(tree.getNodeContext(node), initial);
});

contractTest("API-TREE-009/undefined-clears", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeafWithContext({}, { present: true });

  tree.setNodeContext(node, undefined);
  assert.equal(tree.getNodeContext(node), undefined);
  let calls = 0;
  computeWithMeasure(tree, node, () => {
    calls += 1;
  });
  assert.equal(calls, 0);
});

contractTest("API-TREE-009/null-present", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});

  tree.setNodeContext(node, null);
  assert.equal(tree.getNodeContext(node), null);
  let calls = 0;
  computeWithMeasure(tree, node, ({ context }) => {
    calls += 1;
    assert.equal(context, null);
  });
  assert.equal(calls > 0, true);
});

contractTest("API-TREE-009/always-dirty", () => {
  const tree = new (TaffyTree())();
  const context = { unchanged: true };
  const child = tree.newLeafWithContext({}, context);
  const root = tree.newWithChildren({}, [child]);
  tree.computeLayout({ root, availableSpace: availableSpace() });
  assert.equal(tree.isDirty(child), false);
  assert.equal(tree.isDirty(root), false);

  tree.setNodeContext(child, context);
  assert.equal(tree.getNodeContext(child), context);
  assert.equal(tree.isDirty(child), true);
  assert.equal(tree.isDirty(root), true);
});

contractTest("API-TREE-009/measure-delivery", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeafWithContext({}, { version: 1 });
  const replacement = { version: 2 };
  tree.setNodeContext(node, replacement);
  let calls = 0;

  computeWithMeasure(tree, node, (args) => {
    calls += 1;
    assert.equal(args.node, node);
    assert.equal(args.context, replacement);
  });
  assert.equal(calls > 0, true);
});

contractTest("API-TREE-009/invalid-atomic", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const original = { unchanged: true };
  const replacement = { unchanged: false };
  const node = tree.newLeafWithContext({}, original);
  const foreign = new Tree().newLeaf({});
  tree.computeLayout({ root: node, availableSpace: availableSpace() });
  assert.equal(tree.isDirty(node), false);

  for (const invalid of [1 as never, 0n, foreign]) {
    captureError(() => tree.setNodeContext(invalid, replacement));
    assert.equal(tree.getNodeContext(node), original);
    assert.equal(tree.isDirty(node), false);
  }

  const stale = tree.newLeaf({});
  tree.clear();
  const current = tree.newLeafWithContext({}, original);
  tree.computeLayout({ root: current, availableSpace: availableSpace() });
  assert.equal(
    captureError(() => tree.setNodeContext(stale, replacement)).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
  assert.equal(tree.getNodeContext(current), original);
  assert.equal(tree.isDirty(current), false);
});
