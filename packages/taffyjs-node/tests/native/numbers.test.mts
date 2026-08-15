import assert from "node:assert/strict";
import { BindingTaffyTree } from "../../src/binding.ts";
import { test } from "vite-plus/test";

function createOwner() {
  return new BindingTaffyTree();
}

function storedStyle(style: unknown) {
  const owner = createOwner();
  const node = owner.rawNewLeaf(style);
  return owner.rawGetStyle(node);
}

function rejectsWithoutNode(style: unknown, error: typeof TypeError | typeof RangeError): void {
  const owner = createOwner();
  assert.throws(() => owner.rawNewLeaf(style), error);
  assert.equal(owner.rawGetNodeCount(), 0);
}

test("numeric fields accept only primitive numbers", () => {
  for (const value of ["1", true, 1n, null, {}, [], new Number(1)]) {
    rejectsWithoutNode({ flexGrow: value }, TypeError);
  }
});

test("floating-point fields store f32 values", () => {
  for (const value of [0, -0, 0.1, -123.25, Math.PI, Number.MIN_VALUE]) {
    const actual = storedStyle({ flexGrow: value }).flexGrow;
    assert.equal(typeof actual, "number");
    assert.ok(Object.is(actual, Math.fround(value)), `${value}`);
  }
});

test("floating-point fields preserve f32 special values", () => {
  for (const value of [-1, Number.MAX_VALUE, Number.MIN_VALUE, NaN, Infinity, -Infinity]) {
    const actual = storedStyle({ flexGrow: value }).flexGrow;
    assert.equal(typeof actual, "number");
    assert.ok(Object.is(actual, Math.fround(value)), `${value}`);
  }
});

test("integer fields enforce their numeric ranges", () => {
  for (const display of [0, 4]) {
    assert.equal(storedStyle({ display }).display, display);
  }
  for (const display of [-1, 5, 0.5, NaN, Infinity]) {
    rejectsWithoutNode({ display }, RangeError);
  }

  for (const index of [-32768, 32767]) {
    const gridRow = storedStyle({ gridRow: { start: { kind: 1, index } } }).gridRow as {
      start: { index: number };
    };
    assert.equal(gridRow.start.index, index);
  }
  for (const index of [-32769, 32768, 0.5, NaN, Infinity]) {
    rejectsWithoutNode({ gridRow: { start: { kind: 1, index } } }, RangeError);
  }

  for (const span of [0, 65535]) {
    const gridRow = storedStyle({ gridRow: { start: { kind: 3, span } } }).gridRow as {
      start: { span: number };
    };
    assert.equal(gridRow.start.span, span);
  }
  for (const span of [-1, 65536, 0.5, NaN, Infinity]) {
    rejectsWithoutNode({ gridRow: { start: { kind: 3, span } } }, RangeError);
  }
});

test("numeric fields do not coerce objects", () => {
  let coerced = false;
  const coercible = {
    valueOf() {
      coerced = true;
      return 1;
    },
  };
  rejectsWithoutNode({ flexGrow: coercible }, TypeError);
  rejectsWithoutNode({ display: coercible }, TypeError);
  rejectsWithoutNode({ gridRow: { start: { kind: 1, index: coercible } } }, TypeError);
  assert.equal(coerced, false);
});
