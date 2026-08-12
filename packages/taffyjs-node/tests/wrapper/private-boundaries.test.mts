import assert from "node:assert/strict";
import { TaffyTree } from "../../src/tree.js";
import { contractTest } from "../contract-test.mts";

const U64_MAX = (1n << 64n) - 1n;

contractTest("TYPE-NODEID-001/rng", () => {
  const failure = new Error("injected random failure");
  assert.throws(
    () =>
      new TaffyTree({
        randomSource() {
          throw failure;
        },
      }),
    (error) => error === failure,
  );

  const tree = new TaffyTree();
  assert.equal(tree.getNodeCount(), 0);
  assert.equal(typeof tree.newLeaf({}), "bigint");
});

contractTest("TYPE-NODEID-001/serial-boundary", () => {
  const randomSource = (bytes: Uint8Array) => bytes.fill(0x5a);
  const lastSerialTree = new TaffyTree({ randomSource, nextSerial: U64_MAX });
  const last = lastSerialTree.newLeaf({});
  assert.equal((last >> 64n) & U64_MAX, U64_MAX);
  assert.equal(lastSerialTree.getNodeCount(), 1);
  assert.throws(() => lastSerialTree.newLeaf({}), RangeError);
  assert.equal(lastSerialTree.getNodeCount(), 1, "overflow rejects before native creation");

  const exhaustedTree = new TaffyTree({ randomSource, nextSerial: U64_MAX + 1n });
  assert.throws(() => exhaustedTree.newLeaf({}), RangeError);
  assert.equal(exhaustedTree.getNodeCount(), 0, "exhaustion rejects before native creation");
});
