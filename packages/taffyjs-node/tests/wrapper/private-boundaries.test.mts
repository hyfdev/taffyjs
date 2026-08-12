import assert from "node:assert/strict";
import { createTaffyTreeForTesting } from "../../src/tree.js";
import { contractTest } from "../contract-test.mts";

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

contractTest("TYPE-NODEID-001/rng", () => {
  assertRandomFailureIsAtomic();
});

contractTest("API-TREE-001/rng-failure", () => {
  assertRandomFailureIsAtomic();
});

contractTest("TYPE-NODEID-001/serial-boundary", () => {
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
