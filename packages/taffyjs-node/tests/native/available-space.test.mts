import assert from "node:assert/strict";
import * as native from "../../native.js";
import * as publicApi from "../../src/index.ts";
import { test } from "vite-plus/test";

type RawLayout = { size: { width: number; height: number } } & Record<string, unknown>;
type NativeTaffyTree = {
  rawComputeLayout(node: bigint, availableSpace: unknown, publicMethod: string): void;
  rawGetLayout(node: bigint, publicMethod: string): RawLayout;
  rawNewLeaf(style: Record<string, unknown>, publicMethod: string): bigint;
};
type NativeTaffyTreeConstructor = new () => NativeTaffyTree;
type AvailableSpaceHelper = Readonly<{
  Definite(value: number): { kind: number; value: number };
  MinContent: Readonly<{ kind: number }>;
  MaxContent: Readonly<{ kind: number }>;
}>;

const NativeTaffyTree = Reflect.get(native, "NativeTaffyTree") as NativeTaffyTreeConstructor;

function createOwner(): NativeTaffyTree {
  const owner = new NativeTaffyTree();
  for (const method of ["rawComputeLayout", "rawGetLayout", "rawNewLeaf"] as const) {
    assert.equal(typeof owner[method], "function", `${method} is available`);
  }
  return owner;
}

function availableSpace(): AvailableSpaceHelper {
  const value = Reflect.get(publicApi, "AvailableSpace");
  assert.equal(typeof value, "object", "AvailableSpace is exported");
  assert.notEqual(value, null, "AvailableSpace is exported");
  return value as AvailableSpaceHelper;
}

function layoutFor(width: unknown, height: unknown = width): RawLayout {
  const owner = createOwner();
  const node = owner.rawNewLeaf(
    {
      size: {
        width: { unit: 1, value: 100 },
        height: { unit: 1, value: 100 },
      },
    },
    "newLeaf",
  );
  owner.rawComputeLayout(node, { width, height }, "computeLayout");
  return owner.rawGetLayout(node, "getLayout");
}

test("available space requires complete named width and height fields", () => {
  const owner = createOwner();
  const node = owner.rawNewLeaf({}, "newLeaf");
  for (const value of [
    [
      { kind: 0, value: 10 },
      { kind: 0, value: 20 },
    ],
    { width: { kind: 0, value: 10 } },
    { height: { kind: 0, value: 20 } },
    { width: { kind: 0, value: 10 }, height: { kind: 0, value: 20 }, depth: { kind: 1 } },
  ]) {
    assert.throws(() => owner.rawComputeLayout(node, value, "computeLayout"), TypeError);
  }
});

test("AvailableSpace helpers and direct tagged records compute the same layout", () => {
  const AvailableSpace = availableSpace();
  for (const [helper, direct] of [
    [AvailableSpace.Definite(120), { kind: 0, value: 120 }],
    [AvailableSpace.MinContent, { kind: 1 }],
    [AvailableSpace.MaxContent, { kind: 2 }],
  ] as const) {
    assert.deepEqual(layoutFor(helper), layoutFor(direct));
  }
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
    const layout = layoutFor({ kind: 0, value });
    assert.equal(typeof layout.size.width, "number");
  }
  assert.deepEqual(
    layoutFor({ kind: 0, value: 0.1 }),
    layoutFor({ kind: 0, value: Math.fround(0.1) }),
  );
});

test("available space rejects unsupported shapes and kind values", () => {
  for (const value of [0, "max-content", true, null, {}, []]) {
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
