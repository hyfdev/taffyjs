import assert from "node:assert/strict";
import { AvailableSpace, type NodeId, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };

function maxContentSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
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

function topology(tree: TaffyTree, nodes: readonly NodeId[]) {
  return {
    count: tree.getNodeCount(),
    nodes: nodes.map((node) => ({
      node,
      parent: tree.getParent(node),
      children: [...tree.getChildren(node)],
    })),
  };
}

test("replace", () => {
  const tree = new TaffyTree();
  const [first, second, third, replacement] = [
    tree.newLeaf({}),
    tree.newLeaf({}),
    tree.newLeaf({}),
    tree.newLeaf({}),
  ];
  const parent = tree.newWithChildren({}, [first, second, third]);

  assert.equal(tree.replaceChildAtIndex(parent, 1, replacement), second);
  assert.deepEqual(tree.getChildren(parent), [first, replacement, third]);
  assert.equal(tree.getParent(replacement), parent);
  assert.equal(tree.getParent(second), null);
});

test("returned-id", () => {
  const tree = new TaffyTree();
  const oldChild = tree.newLeaf({});
  const replacement = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [oldChild]);
  const nextParent = tree.newLeaf({});
  const count = tree.getNodeCount();

  const returned = tree.replaceChildAtIndex(parent, 0, replacement);
  assert.equal(returned, oldChild);
  assert.equal(tree.getNodeCount(), count);
  tree.addChild(nextParent, returned);
  assert.equal(tree.getParent(oldChild), nextParent);
});

test("dirty", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({});
  const replacement = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  const root = tree.newWithChildren({}, [parent]);
  tree.computeLayout({ root, availableSpace: maxContentSpace() });
  assert.equal(tree.isDirty(parent), false);
  assert.equal(tree.isDirty(root), false);

  tree.replaceChildAtIndex(parent, 0, replacement);
  assert.equal(tree.isDirty(parent), true);
  assert.equal(tree.isDirty(root), true);
});

test("same-noop", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  tree.computeLayout({ root: parent, availableSpace: maxContentSpace() });
  const before = topology(tree, [child, parent]);
  assert.equal(tree.isDirty(parent), false);

  assert.equal(tree.replaceChildAtIndex(parent, 0, child), child);
  assert.deepEqual(topology(tree, [child, parent]), before);
  assert.equal(tree.isDirty(parent), false);
});

test("reject", () => {
  const tree = new TaffyTree();
  const [first, second, free] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [first, second]);

  assert.equal(
    captureError(() => tree.replaceChildAtIndex(parent, 0, second)).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );

  const descendant = tree.newLeaf({});
  const middle = tree.newWithChildren({}, [descendant]);
  const root = tree.newWithChildren({}, [middle]);
  assert.equal(
    captureError(() => tree.replaceChildAtIndex(descendant, 0, root)).code,
    "ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS",
  );
  tree.addChild(descendant, free);
  assert.equal(
    captureError(() => tree.replaceChildAtIndex(descendant, 0, root)).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );

  for (const index of [-1, 0.5]) {
    assert.equal(
      captureError(() => tree.replaceChildAtIndex(parent, index, free)).constructor,
      RangeError,
    );
  }
  assert.equal(
    captureError(() => tree.replaceChildAtIndex(parent, 2, free)).code,
    "ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS",
  );
});

test("id-roles", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf({});
  const replacement = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  const foreign = new TaffyTree().newLeaf({});

  assert.equal(
    captureError(() => tree.replaceChildAtIndex(1 as never, 0, replacement)).constructor,
    TypeError,
  );
  assert.equal(
    captureError(() => tree.replaceChildAtIndex(parent, 0, 0n as never)).code,
    "ERR_TAFFY_INVALID_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.replaceChildAtIndex(foreign, 0, replacement)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.replaceChildAtIndex(parent, 0, foreign)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );

  const staleParent = tree.newLeaf({});
  const staleChild = tree.newLeaf({});
  tree.clear();
  const currentParent = tree.newLeaf({});
  const currentChild = tree.newLeaf({});
  assert.equal(
    captureError(() => tree.replaceChildAtIndex(staleParent, 0, currentChild)).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.replaceChildAtIndex(currentParent, 0, staleChild)).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
});

test("failure-atomic", () => {
  const tree = new TaffyTree();
  const [first, second, attached, free] = [
    tree.newLeaf({}),
    tree.newLeaf({}),
    tree.newLeaf({}),
    tree.newLeaf({}),
  ];
  const parent = tree.newWithChildren({}, [first, second]);
  const otherParent = tree.newWithChildren({}, [attached]);
  const root = tree.newWithChildren({}, [parent, otherParent]);
  const nodes = [first, second, attached, free, parent, otherParent, root];
  const before = topology(tree, nodes);
  const rejectedCalls = [
    () => tree.replaceChildAtIndex(parent, 0, second),
    () => tree.replaceChildAtIndex(parent, 0, attached),
    () => tree.replaceChildAtIndex(parent, 0, root),
    () => tree.replaceChildAtIndex(parent, 2, free),
    () => tree.replaceChildAtIndex(parent, -1, free),
    () => tree.replaceChildAtIndex(parent, "0" as unknown as number, free),
  ];

  for (const rejectedCall of rejectedCalls) {
    captureError(rejectedCall);
    assert.deepEqual(topology(tree, nodes), before);
  }
});
