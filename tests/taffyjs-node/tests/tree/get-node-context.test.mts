import assert from "node:assert/strict";
import { AvailableSpace, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

function availableSpace() {
  return { width: AvailableSpace.MinContent, height: AvailableSpace.MinContent };
}

test("absence", () => {
  const tree = new TaffyTree();
  const leaf = tree.newLeaf();
  const undefinedContext = tree.newLeafWithContext(undefined);
  const parent = tree.newWithChildren([leaf, undefinedContext]);

  assert.equal(tree.getNodeContext(leaf), undefined);
  assert.equal(tree.getNodeContext(undefinedContext), undefined);
  assert.equal(tree.getNodeContext(parent), undefined);
});

test("identity", () => {
  const tree = new TaffyTree();
  const object = { mutable: true };
  const symbol = Symbol("context");
  const entries = [object, false, 0, "", 1n, symbol, null];
  const nodes = entries.map((context) => tree.newLeafWithContext(context));

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
  const node = tree.newLeafWithContext(context);
  tree.computeLayout({ root: node, availableSpace: availableSpace() });
  assert.equal(tree.isDirty(node), false);

  context.value = 2;
  assert.equal(tree.getNodeContext(node), context);
  assert.equal((tree.getNodeContext(node) as { value: number }).value, 2);
  assert.equal(tree.isDirty(node), false);

  tree.markDirty(node);
  assert.equal(tree.isDirty(node), true);
});
