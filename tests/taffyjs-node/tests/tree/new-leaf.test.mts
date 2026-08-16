import assert from "node:assert/strict";
import { BoxSizing, Dimension, Display, type NodeId, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

const U64_MASK = (1n << 64n) - 1n;

function creationSerial(node: NodeId) {
  return (node >> 64n) & U64_MASK;
}

test("default-style", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({});
  const style = tree.getStyle(node);

  assert.equal(style.display, Display.Flex);
  assert.equal(style.boxSizing, BoxSizing.BorderBox);
  assert.equal(style.flexGrow, 0);
  assert.equal(style.aspectRatio, null);
});

test("nondefault-style", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    display: Display.Flex,
    flexGrow: 1.25,
    size: { width: 12 },
  });
  const style = tree.getStyle(node);

  assert.equal(style.display, Display.Flex);
  assert.equal(style.flexGrow, Math.fround(1.25));
  assert.deepEqual((style.size as { width: unknown }).width, Dimension.Length(12));
});

test("stable-id", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf({});
  const second = tree.newLeaf({});

  assert.equal(typeof first, "bigint");
  assert.equal(typeof second, "bigint");
  assert.notEqual(first, second);
  assert.equal(tree.getNodeCount(), 2);
});

test("conversion-atomic", () => {
  const tree = new TaffyTree();

  assert.throws(() => tree.newLeaf({ unknownField: true } as never), TypeError);
  assert.throws(() => tree.newLeaf({ display: 999 } as never), RangeError);
  assert.equal(tree.getNodeCount(), 0);

  const first = tree.newLeaf({});
  assert.equal(creationSerial(first), 1n, "failed conversion does not consume a serial");
  assert.equal(tree.getNodeCount(), 1);
});
