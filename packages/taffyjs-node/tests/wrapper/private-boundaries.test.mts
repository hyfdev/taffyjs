import assert from "node:assert/strict";
import { AvailableSpace } from "../../src/available-space.js";
import { Dimension } from "../../src/length.js";
import { createTaffyTreeForTesting } from "../../src/tree.js";
import { test } from "vite-plus/test";

const U64_MAX = (1n << 64n) - 1n;

function assertRandomFailureIsAtomic() {
  const failure = new Error("injected random failure");
  let tree: ReturnType<typeof createTaffyTreeForTesting> | undefined;
  let calls = 0;
  assert.throws(
    () => {
      tree = createTaffyTreeForTesting({
        randomSource() {
          calls += 1;
          throw failure;
        },
      });
    },
    (error) => error === failure,
  );
  assert.equal(calls, 1);
  assert.equal(tree, undefined, "a failed constructor does not return a tree");

  const healthyTree = createTaffyTreeForTesting();
  assert.equal(healthyTree.getNodeCount(), 0);
  assert.equal(typeof healthyTree.newLeaf({}), "bigint");
}

type NodeCreationMethod = "newLeaf" | "newLeafWithContext" | "newWithChildren";

function assertSerialExhaustionIsAtomic(method: NodeCreationMethod) {
  const randomSource = (bytes: Uint8Array) => bytes.fill(0x5a);
  const tree = createTaffyTreeForTesting({ randomSource, nextSerial: U64_MAX });
  const context = { retained: true };
  const node = tree.newLeafWithContext(
    {
      size: { width: Dimension.Length(10.4), height: Dimension.Length(20.6) },
    },
    context,
  );
  tree.computeLayout({
    root: node,
    availableSpace: { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent },
  });

  const snapshot = () => {
    assert.equal(tree.getNodeContext(node), context);
    const children = [...tree.getChildren(node)];
    assert.equal(tree.getChildCount(node), children.length);
    return {
      count: tree.getNodeCount(),
      parent: tree.getParent(node),
      children,
      style: tree.getStyle(node),
      layout: tree.getLayout(node),
      unroundedLayout: tree.getUnroundedLayout(node),
      details: tree.getDetailedLayoutInfo(node),
      dirty: tree.isDirty(node),
    };
  };
  const before = snapshot();
  assert.notDeepEqual(before.layout, before.unroundedLayout, "rounding probe");

  const operation = {
    newLeaf: () => tree.newLeaf({}),
    newLeafWithContext: () => tree.newLeafWithContext({}, { rejected: true }),
    newWithChildren: () => tree.newWithChildren({}, [node]),
  }[method];
  assert.throws(operation, (error: unknown) => {
    assert.ok(error instanceof Error);
    assert.equal(error.constructor, RangeError);
    assert.equal((error as RangeError & { code?: string }).code, undefined);
    return true;
  });
  assert.deepEqual(snapshot(), before);
  assert.equal("size" in tree.getStyle(node), true, "tree remains usable");
}

test("constructor failure does not create a tree", () => {
  assertRandomFailureIsAtomic();
});

test("node serial boundary", () => {
  const randomSource = (bytes: Uint8Array) => bytes.fill(0x5a);
  const lastSerialTree = createTaffyTreeForTesting({ randomSource, nextSerial: U64_MAX });
  const last = lastSerialTree.newLeaf({});
  assert.equal((last >> 64n) & U64_MAX, U64_MAX);
  assert.equal(lastSerialTree.getNodeCount(), 1);
  assert.throws(() => lastSerialTree.newLeaf({}), RangeError);
  assert.equal(lastSerialTree.getNodeCount(), 1, "overflow rejects before native creation");

  const exhaustedTree = createTaffyTreeForTesting({ randomSource, nextSerial: U64_MAX + 1n });
  assert.throws(() => exhaustedTree.newLeaf({}), RangeError);
  assert.equal(exhaustedTree.getNodeCount(), 0, "exhaustion rejects before native creation");
});

for (const method of ["newLeaf", "newLeafWithContext", "newWithChildren"] as const) {
  test(`${method} rejects an exhausted node serial atomically`, () => {
    assertSerialExhaustionIsAtomic(method);
  });
}
