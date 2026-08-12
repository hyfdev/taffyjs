import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

type Tree = {
  getNodeCount(): number;
  getStyle(node: bigint): Record<string, unknown>;
  newLeaf(style: object): bigint;
};
type TreeConstructor = new () => Tree;

const U64_MASK = (1n << 64n) - 1n;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  return value as unknown as TreeConstructor;
}

function creationSerial(node: bigint) {
  return (node >> 64n) & U64_MASK;
}

contractTest("API-TREE-004/default-style", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  const style = tree.getStyle(node);

  assert.equal(style.display, api.Display.Block);
  assert.equal(style.boxSizing, api.BoxSizing.BorderBox);
  assert.equal(style.flexGrow, 0);
  assert.equal(style.aspectRatio, null);
});

contractTest("API-TREE-004/nondefault-style", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({
    display: api.Display.Flex,
    flexGrow: 1.25,
    size: { width: api.Dimension.Length(12) },
  });
  const style = tree.getStyle(node);

  assert.equal(style.display, api.Display.Flex);
  assert.equal(style.flexGrow, Math.fround(1.25));
  assert.deepEqual((style.size as { width: unknown }).width, api.Dimension.Length(12));
});

contractTest("API-TREE-004/stable-id", () => {
  const tree = new (TaffyTree())();
  const first = tree.newLeaf({});
  const second = tree.newLeaf({});

  assert.equal(typeof first, "bigint");
  assert.equal(typeof second, "bigint");
  assert.notEqual(first, second);
  assert.equal(tree.getNodeCount(), 2);
});

contractTest("API-TREE-004/conversion-atomic", () => {
  const tree = new (TaffyTree())();

  assert.throws(() => tree.newLeaf({ unknownField: true }), TypeError);
  assert.throws(() => tree.newLeaf({ display: 999 }), RangeError);
  assert.equal(tree.getNodeCount(), 0);

  const first = tree.newLeaf({});
  assert.equal(creationSerial(first), 1n, "failed conversion does not consume a serial");
  assert.equal(tree.getNodeCount(), 1);
});
