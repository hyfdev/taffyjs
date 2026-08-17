import assert from "node:assert/strict";
import { AvailableSpace, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };

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

test("absence", () => {
  const tree = new TaffyTree();
  const leaf = tree.newLeaf({});
  const undefinedContext = tree.newLeafWithContext({}, undefined);
  const parent = tree.newWithChildren({}, [leaf, undefinedContext]);

  assert.equal(tree.getNodeContext(leaf), undefined);
  assert.equal(tree.getNodeContext(undefinedContext), undefined);
  assert.equal(tree.getNodeContext(parent), undefined);
});

test("identity", () => {
  const tree = new TaffyTree();
  const object = { mutable: true };
  const symbol = Symbol("context");
  const entries = [object, false, 0, "", 1n, symbol, null];
  const nodes = entries.map((context) => tree.newLeafWithContext({}, context));

  for (const [index, node] of nodes.entries()) {
    assert.equal(tree.getNodeContext(node), entries[index]);
  }

  tree.computeLayout({
    root: nodes[0],
    availableSpace: availableSpace(),
    measure: ({ node }) => {
      assert.equal(tree.getNodeContext(node), object, "getter remains callable during measurement");
      return { width: 10, height: 10 };
    },
  });
});

test("manual-dirty", () => {
  const tree = new TaffyTree();
  const context = { value: 1 };
  const node = tree.newLeafWithContext({}, context);
  tree.computeLayout({ root: node, availableSpace: availableSpace() });
  assert.equal(tree.isDirty(node), false);

  context.value = 2;
  assert.equal(tree.getNodeContext(node), context);
  assert.equal((tree.getNodeContext(node) as { value: number }).value, 2);
  assert.equal(tree.isDirty(node), false);

  tree.markDirty(node);
  assert.equal(tree.isDirty(node), true);
});

test("invalid-id", () => {
  const tree = new TaffyTree();
  const foreign = new TaffyTree().newLeaf({});

  assert.equal(captureError(() => tree.getNodeContext(1 as never)).constructor, TypeError);
  assert.equal(
    captureError(() => tree.getNodeContext(0n as never)).code,
    "ERR_TAFFY_INVALID_NODE_ID",
  );
  assert.equal(captureError(() => tree.getNodeContext(foreign)).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.getNodeContext(stale)).code, "ERR_TAFFY_STALE_NODE_ID");
});
