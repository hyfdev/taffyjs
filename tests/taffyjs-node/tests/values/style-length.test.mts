import assert from "node:assert/strict";
import { Dimension, FlexWrap, LengthUnit, TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

function createOwner() {
  return new TaffyTree();
}

function storedStyle(style: unknown) {
  const owner = createOwner();
  const node = owner.newLeaf(style as never);
  return owner.getStyle(node);
}

function rejectsWithoutNode(style: unknown, error: typeof TypeError | typeof RangeError): void {
  const owner = createOwner();
  assert.throws(() => owner.newLeaf(style as never), error);
  assert.equal(owner.getNodeCount(), 0);
}

test("Dimension helpers and direct tagged records store the same values", () => {
  for (const [helper, direct] of [
    [Dimension.Length(12), { unit: 0, value: 12 }],
    [Dimension.Percent(50), { unit: 1, value: 50 }],
    [Dimension.Auto, { unit: 2 }],
    [Dimension.MinContent, { unit: 3 }],
    [Dimension.MaxContent, { unit: 4 }],
    [Dimension.FitContent, { unit: 5 }],
    [Dimension.FitContentLength(36), { unit: 6, value: 36 }],
    [Dimension.FitContentPercent(25), { unit: 7, value: 25 }],
    [Dimension.Stretch, { unit: 8 }],
    [Dimension.Content, { unit: 9 }],
  ] as const) {
    assert.deepEqual(
      storedStyle({ flexBasis: helper }).flexBasis,
      storedStyle({ flexBasis: direct }).flexBasis,
    );
  }
});

test("number shorthand and Dimension.Length store the same value", () => {
  assert.deepEqual(
    storedStyle({ flexBasis: 12 }).flexBasis,
    storedStyle({ flexBasis: Dimension.Length(12) }).flexBasis,
  );
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

  const fitContent = storedStyle({
    flexBasis: Dimension.FitContentPercent(33.3),
  }).flexBasis as { value: number };
  assert.equal(fitContent.value, Math.fround(33.3 / 100) * 100);
});

test("length payloads preserve the shared f32 special-value behavior", () => {
  for (const value of [-1, Number.MAX_VALUE, Number.MIN_VALUE, NaN, Infinity, -Infinity]) {
    const length = storedStyle({ flexBasis: value }).flexBasis as {
      value: number;
    };
    assert.ok(Object.is(length.value, Math.fround(value)), `length ${value}`);

    const percent = storedStyle({ flexBasis: { unit: 1, value } }).flexBasis as {
      value: number;
    };
    assert.ok(Object.is(percent.value, Math.fround(value / 100) * 100), `percent ${value}`);

    const fitContentLength = storedStyle({
      flexBasis: Dimension.FitContentLength(value),
    }).flexBasis as { value: number };
    assert.ok(Object.is(fitContentLength.value, Math.fround(value)), `fit-content length ${value}`);

    const fitContentPercent = storedStyle({
      flexBasis: Dimension.FitContentPercent(value),
    }).flexBasis as { value: number };
    assert.ok(
      Object.is(fitContentPercent.value, Math.fround(value / 100) * 100),
      `fit-content percent ${value}`,
    );
  }
});

test("semantic lengths reject unsupported shapes and unit values", () => {
  for (const value of ["auto", true, null, {}, [], { unit: 0 }, { unit: 1 }]) {
    rejectsWithoutNode({ flexBasis: value }, TypeError);
  }
  for (const value of [{ unit: -1 }, { unit: 10 }, { unit: 0.5 }, { unit: Number.NaN }]) {
    rejectsWithoutNode({ flexBasis: value }, RangeError);
  }
  for (const unit of [LengthUnit.FitContentLength, LengthUnit.FitContentPercent]) {
    rejectsWithoutNode({ flexBasis: { unit } }, TypeError);
  }
});

test("intrinsic Dimension values stay limited to size and flexBasis", () => {
  for (const value of [
    Dimension.MinContent,
    Dimension.MaxContent,
    Dimension.FitContent,
    Dimension.FitContentLength(40),
    Dimension.FitContentPercent(50),
    Dimension.Stretch,
    Dimension.Content,
  ]) {
    assert.deepEqual(storedStyle({ size: value }).size, { width: value, height: value });
    rejectsWithoutNode({ minSize: value }, RangeError);
    rejectsWithoutNode({ maxSize: { width: value } }, RangeError);
  }
});

test("balanced flex values and the u16 line count round-trip", () => {
  for (const flexWrap of [FlexWrap.Balance, FlexWrap.BalanceReverse]) {
    const style = storedStyle({ flexWrap, flexLineCount: 3 });
    assert.equal(style.flexWrap, flexWrap);
    assert.equal(style.flexLineCount, 3);
  }

  assert.equal(storedStyle({ flexLineCount: 0 }).flexLineCount, 0);
  assert.equal(storedStyle({ flexLineCount: 0xffff }).flexLineCount, 0xffff);
  for (const flexLineCount of [-1, 0x1_0000, 1.5, Number.NaN]) {
    rejectsWithoutNode({ flexLineCount }, RangeError);
  }
  rejectsWithoutNode({ flexLineCount: "2" }, TypeError);
});

test("Auto ignores fields from payload-carrying variants", () => {
  assert.deepEqual(
    storedStyle({ flexBasis: { unit: 2, value: 10, ignored: { nested: true } } }).flexBasis,
    { unit: 2 },
  );
});

test("length output is canonical, detached, and reusable", () => {
  const first = storedStyle({ flexBasis: 8 }).flexBasis;
  const second = storedStyle({ flexBasis: first }).flexBasis;
  assert.deepEqual(first, { unit: 0, value: 8 });
  assert.deepEqual(second, first);
  assert.notEqual(first, second);
  assert.equal(Object.isFrozen(first), false);
});

test("number lengths work in homogeneous and partial geometry inputs", () => {
  const output = { unit: 0, value: 7 };
  const style = storedStyle({ size: 7, margin: 7, gap: 7, maxSize: { width: 9 } });
  assert.deepEqual(style.size, { width: output, height: output });
  assert.deepEqual(style.margin, {
    left: output,
    right: output,
    top: output,
    bottom: output,
  });
  assert.deepEqual(style.gap, { width: output, height: output });
  assert.deepEqual(style.maxSize, {
    width: { unit: 0, value: 9 },
    height: { unit: 2 },
  });
});
