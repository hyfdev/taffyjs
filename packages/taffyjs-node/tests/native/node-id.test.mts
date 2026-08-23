import assert from "node:assert/strict";
import { BindingTaffyTree } from "../../src/binding.ts";
import { withEncodedStyle } from "../../src/style-input.ts";
import { test } from "vite-plus/test";

test("native NodeId inputs require a lossless u64 bigint", () => {
  const owner = new BindingTaffyTree();
  const node = withEncodedStyle({}, (encoded) => owner.rawNewLeaf(encoded));

  assert.throws(() => owner.rawGetStyle(1 as never), { code: "BigintExpected" });
  for (const value of [-1n, 1n << 64n]) {
    assert.throws(() => owner.rawGetStyle(value as never), TypeError);
    assert.deepEqual(owner.rawGetStyle(node), owner.rawGetStyle(node));
  }
});
