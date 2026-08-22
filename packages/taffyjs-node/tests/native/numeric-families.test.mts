import assert from "node:assert/strict";
import { BindingTaffyTree } from "../../src/binding.ts";
import { AlignItems, DetailedLayoutInfoKind, Display, TrackSizingKind } from "../../src/index.ts";
import { withEncodedStyle } from "../../src/style-input.ts";
import { test } from "vite-plus/test";

test("representative numeric values are stable", () => {
  assert.equal(Display.Block, 0);
  assert.equal(Display.None, 4);
  assert.equal(AlignItems.SafeCenter, 15);
  assert.equal(TrackSizingKind.Fr, 6);
  assert.equal(DetailedLayoutInfoKind.Grid, 1);
});

test("numeric families are frozen", () => {
  assert.equal(Object.isFrozen(Display), true);
});

test("native input accepts a numeric literal", () => {
  const owner = new BindingTaffyTree();
  const node = withEncodedStyle({ display: 0 }, (encoded) => owner.rawNewLeaf(encoded));
  assert.equal(owner.rawGetStyle(node).display, 0);
});

test("native input rejects an invalid numeric value atomically", () => {
  const owner = new BindingTaffyTree();
  const before = owner.rawGetNodeCount();
  assert.throws(
    () => withEncodedStyle({ display: 255 as never }, (encoded) => owner.rawNewLeaf(encoded)),
    RangeError,
  );
  assert.equal(owner.rawGetNodeCount(), before);
});
