import assert from "node:assert/strict";
import * as native from "../../native.js";
import { AlignItems, DetailedLayoutInfoKind, Display, TrackSizingKind } from "../../src/index.ts";
import { test } from "vite-plus/test";

type NativeTaffyTree = {
  rawGetStyle(node: bigint): { display: number };
  rawNewLeaf(style: object): bigint;
  rawNodeCount(): number;
};
type NativeTaffyTreeConstructor = new () => NativeTaffyTree;

const NativeTaffyTree = Reflect.get(native, "NativeTaffyTree") as NativeTaffyTreeConstructor;

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
  const owner = new NativeTaffyTree();
  const node = owner.rawNewLeaf({ display: 0 });
  assert.equal(owner.rawGetStyle(node).display, 0);
});

test("native input rejects an invalid numeric value atomically", () => {
  const owner = new NativeTaffyTree();
  const before = owner.rawNodeCount();
  assert.throws(() => owner.rawNewLeaf({ display: 255 }), RangeError);
  assert.equal(owner.rawNodeCount(), before);
});
