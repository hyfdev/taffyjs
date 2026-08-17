import assert from "node:assert/strict";
import { AvailableSpace, type NodeId, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };
type MeasureArgs = { node: NodeId; context: unknown };

function availableSpace() {
  return { width: AvailableSpace.MinContent, height: AvailableSpace.MinContent };
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

function computeWithMeasure(tree: TaffyTree, root: NodeId, measure: (args: MeasureArgs) => void) {
  tree.computeLayout({
    root,
    availableSpace: availableSpace(),
    measure(args) {
      measure(args);
      return { width: 10, height: 10 };
    },
  });
}

test("replace-identity", () => {
  const tree = new TaffyTree();
  const initial = { version: 1 };
  const replacement = { version: 2 };
  const node = tree.newLeafWithContext({}, initial);

  tree.setNodeContext(node, replacement);
  assert.equal(tree.getNodeContext(node), replacement);
  assert.notEqual(tree.getNodeContext(node), initial);
});

test("undefined-clears", () => {
  const tree = new TaffyTree();
  const node = tree.newLeafWithContext({}, { present: true });

  tree.setNodeContext(node, undefined);
  assert.equal(tree.getNodeContext(node), undefined);
  let calls = 0;
  computeWithMeasure(tree, node, ({ context }) => {
    calls += 1;
    assert.equal(context, undefined);
  });
  assert.equal(calls > 0, true);
});

test("null-present", () => {
  const tree = new TaffyTree();
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

test("always-dirty", () => {
  const tree = new TaffyTree();
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

test("measure-delivery", () => {
  const tree = new TaffyTree();
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

test("invalid-atomic", () => {
  const tree = new TaffyTree();
  const original = { unchanged: true };
  const replacement = { unchanged: false };
  const node = tree.newLeafWithContext({}, original);
  const foreign = new TaffyTree().newLeaf({});
  tree.computeLayout({ root: node, availableSpace: availableSpace() });
  assert.equal(tree.isDirty(node), false);

  for (const invalid of [1 as never, 0n as never, foreign]) {
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
