import assert from "node:assert/strict";
import { BoxSizing, Dimension, Display, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

test("default-style", () => {
  const tree = new TaffyTree();
  const omitted = tree.newLeaf();
  const explicitUndefined = tree.newLeaf(undefined);
  const emptyInput = tree.newLeaf({});
  const style = tree.getStyle(omitted);

  assert.equal(style.display, Display.Flex);
  assert.equal(style.boxSizing, BoxSizing.BorderBox);
  assert.equal(style.flexGrow, 0);
  assert.equal(style.aspectRatio, null);
  assert.deepEqual(tree.getStyle(explicitUndefined), style);
  assert.deepEqual(tree.getStyle(emptyInput), style);
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
  const first = tree.newLeaf();
  const second = tree.newLeaf();

  assert.equal(typeof first, "bigint");
  assert.equal(typeof second, "bigint");
  assert.notEqual(first, second);
  assert.equal(tree.getNodeCount(), 2);
});

test("conversion-atomic", () => {
  const tree = new TaffyTree();

  const ignored = tree.newLeaf({ unknownField: true } as never);
  assert.equal(tree.getStyle(ignored).flexGrow, 0);
  assert.throws(() => tree.newLeaf({ display: 999 } as never), RangeError);
  assert.equal(tree.getNodeCount(), 1);

  tree.newLeaf();
  assert.equal(tree.getNodeCount(), 2);
});
