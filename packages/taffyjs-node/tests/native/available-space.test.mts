import assert from "node:assert/strict";
import { BindingTaffyTree } from "../../src/binding.ts";
import { AvailableSpace } from "../../src/index.ts";
import { withEncodedStyle } from "../../src/style-input.ts";
import { test } from "vite-plus/test";

function createOwner() {
  return new BindingTaffyTree();
}

function newLeaf(owner: BindingTaffyTree, style: unknown) {
  return withEncodedStyle(style as never, (encoded) => owner.rawNewLeaf(encoded));
}

function layoutFor(width: unknown, height: unknown = width) {
  const owner = createOwner();
  const node = newLeaf(owner, {
    size: {
      width: { unit: 1, value: 100 },
      height: { unit: 1, value: 100 },
    },
  });
  owner.rawComputeLayout(node, { width, height });
  return owner.rawGetLayout(node);
}

test("available space requires complete named width and height fields", () => {
  const owner = createOwner();
  const node = newLeaf(owner, {});
  for (const value of [
    [
      { kind: 0, value: 10 },
      { kind: 0, value: 20 },
    ],
    { width: { kind: 0, value: 10 } },
    { height: { kind: 0, value: 20 } },
    { width: { kind: 0, value: 10 }, height: { kind: 0, value: 20 }, depth: { kind: 1 } },
  ]) {
    assert.throws(() => owner.rawComputeLayout(node, value), TypeError);
  }
});

test("AvailableSpace helpers and direct tagged records compute the same layout", () => {
  for (const [helper, direct] of [
    [AvailableSpace.Definite(120), { kind: 0, value: 120 }],
    [AvailableSpace.MinContent, { kind: 1 }],
    [AvailableSpace.MaxContent, { kind: 2 }],
  ] as const) {
    assert.deepEqual(layoutFor(helper), layoutFor(direct));
  }
});

test("number shorthand and AvailableSpace.Definite compute the same layout", () => {
  assert.deepEqual(layoutFor(120), layoutFor(AvailableSpace.Definite(120)));
});

test("Definite available space requires a numeric value", () => {
  assert.throws(() => layoutFor({ kind: 0 }), TypeError);
  for (const value of ["1", true, 1n, {}, []]) {
    assert.throws(() => layoutFor({ kind: 0, value }), TypeError);
  }
});

test("content constraints ignore fields from inactive variants", () => {
  assert.deepEqual(layoutFor({ kind: 1, value: 10, ignored: true }), layoutFor({ kind: 1 }));
  assert.deepEqual(layoutFor({ kind: 2, value: 10, ignored: true }), layoutFor({ kind: 2 }));
});

test("Definite available space follows the shared f32 conversion", () => {
  for (const value of [-1, Number.MAX_VALUE, Number.MIN_VALUE, NaN, Infinity, -Infinity]) {
    const layout = layoutFor(value);
    assert.equal(typeof layout.size.width, "number");
  }
  assert.deepEqual(layoutFor(0.1), layoutFor(Math.fround(0.1)));
});

test("available space rejects unsupported shapes and kind values", () => {
  for (const value of ["max-content", true, null, {}, []]) {
    assert.throws(() => layoutFor(value), TypeError);
  }
  for (const value of [
    { kind: -1 },
    { kind: 0.5 },
    { kind: 3 },
    { kind: NaN },
    { kind: Infinity },
  ]) {
    assert.throws(() => layoutFor(value), RangeError);
  }
});
