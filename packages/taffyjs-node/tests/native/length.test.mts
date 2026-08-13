import assert from "node:assert/strict";
import { NativeTaffyTree } from "../../src/binding.ts";
import { Dimension } from "../../src/index.ts";
import { test } from "vite-plus/test";

function createOwner() {
  return new NativeTaffyTree();
}

function storedStyle(style: unknown) {
  const owner = createOwner();
  const node = owner.rawNewLeaf(style);
  return owner.rawGetStyle(node);
}

function rejectsWithoutNode(style: unknown, error: typeof TypeError | typeof RangeError): void {
  const owner = createOwner();
  assert.throws(() => owner.rawNewLeaf(style), error);
  assert.equal(owner.rawNodeCount(), 0);
}

test("Dimension helpers and direct tagged records store the same values", () => {
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
