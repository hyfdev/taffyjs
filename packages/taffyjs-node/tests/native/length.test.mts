import assert from "node:assert/strict";
import * as native from "../../native.js";
import * as publicApi from "../../src/index.ts";
import { test } from "vite-plus/test";

type RawStyle = Record<string, unknown>;
type NativeTaffyTree = {
  rawGetStyle(node: bigint, publicMethod: string): RawStyle;
  rawNewLeaf(style: RawStyle, publicMethod: string): bigint;
  rawNodeCount(publicMethod: string): number;
};
type NativeTaffyTreeConstructor = new () => NativeTaffyTree;
type DimensionHelper = Readonly<{
  Length(value: number): { unit: number; value: number };
  Percent(value: number): { unit: number; value: number };
  Auto: Readonly<{ unit: number }>;
}>;

const NativeTaffyTree = Reflect.get(native, "NativeTaffyTree") as NativeTaffyTreeConstructor;

function createOwner(): NativeTaffyTree {
  const owner = new NativeTaffyTree();
  for (const method of ["rawGetStyle", "rawNewLeaf", "rawNodeCount"] as const) {
    assert.equal(typeof owner[method], "function", `${method} is available`);
  }
  return owner;
}

function dimension(): DimensionHelper {
  const value = Reflect.get(publicApi, "Dimension");
  assert.equal(typeof value, "object", "Dimension is exported");
  assert.notEqual(value, null, "Dimension is exported");
  return value as DimensionHelper;
}

function storedStyle(style: RawStyle): RawStyle {
  const owner = createOwner();
  const node = owner.rawNewLeaf(style, "newLeaf");
  return owner.rawGetStyle(node, "getStyle");
}

function rejectsWithoutNode(style: RawStyle, error: typeof TypeError | typeof RangeError): void {
  const owner = createOwner();
  assert.throws(() => owner.rawNewLeaf(style, "newLeaf"), error);
  assert.equal(owner.rawNodeCount("getNodeCount"), 0);
}

test("Dimension helpers and direct tagged records store the same values", () => {
  const Dimension = dimension();
  for (const [helper, direct] of [
    [Dimension.Length(12), { unit: 0, value: 12 }],
    [Dimension.Percent(50), { unit: 1, value: 50 }],
    [Dimension.Auto, { unit: 2 }],
  ] as const) {
    assert.deepEqual(
      storedStyle({ flexBasis: helper }).flexBasis,
      storedStyle({ flexBasis: direct }).flexBasis,
    );
  }
});

test("percent values use user-facing magnitudes and stored f32 precision", () => {
  assert.deepEqual(storedStyle({ flexBasis: { unit: 1, value: 50 } }).flexBasis, {
    unit: 1,
    value: 50,
  });

  const value = 1e39;
  const result = storedStyle({ flexBasis: { unit: 1, value } }).flexBasis as { value: number };
  assert.equal(result.value, Math.fround(value / 100) * 100);
  assert.equal(Number.isFinite(result.value), true);
});

test("length payloads preserve the shared f32 special-value behavior", () => {
  for (const value of [-1, Number.MAX_VALUE, Number.MIN_VALUE, NaN, Infinity, -Infinity]) {
    const length = storedStyle({ flexBasis: { unit: 0, value } }).flexBasis as {
      value: number;
    };
    assert.ok(Object.is(length.value, Math.fround(value)), `length ${value}`);

    const percent = storedStyle({ flexBasis: { unit: 1, value } }).flexBasis as {
      value: number;
    };
    assert.ok(Object.is(percent.value, Math.fround(value / 100) * 100), `percent ${value}`);
  }
});

test("semantic lengths reject unsupported shapes and unit values", () => {
  for (const value of [0, "auto", true, null, {}, { unit: 0 }, { unit: 1 }]) {
    rejectsWithoutNode({ flexBasis: value }, TypeError);
  }
  for (const value of [{ unit: -1 }, { unit: 3 }, { unit: 0.5 }, { unit: NaN }]) {
    rejectsWithoutNode({ flexBasis: value }, RangeError);
  }
});

test("Auto ignores fields from payload-carrying variants", () => {
  assert.deepEqual(
    storedStyle({ flexBasis: { unit: 2, value: 10, ignored: { nested: true } } }).flexBasis,
    { unit: 2 },
  );
});

test("length output is canonical, detached, and reusable", () => {
  const Dimension = dimension();
  const input = Dimension.Length(8);
  const first = storedStyle({ flexBasis: input }).flexBasis;
  const second = storedStyle({ flexBasis: { unit: 0, value: 8, ignored: true } }).flexBasis;
  assert.deepEqual(first, { unit: 0, value: 8 });
  assert.deepEqual(second, first);
  assert.notEqual(first, input);
  assert.equal(Object.isFrozen(first), false);
});

test("one semantic length expands across supported Size and Rect fields", () => {
  const scalar = { unit: 0, value: 7 };
  const style = storedStyle({ size: scalar, margin: scalar, gap: scalar });
  assert.deepEqual(style.size, { width: scalar, height: scalar });
  assert.deepEqual(style.margin, {
    left: scalar,
    right: scalar,
    top: scalar,
    bottom: scalar,
  });
  assert.deepEqual(style.gap, { width: scalar, height: scalar });
});
