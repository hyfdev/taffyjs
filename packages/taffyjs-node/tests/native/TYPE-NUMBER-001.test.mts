import assert from "node:assert/strict";
import * as native from "../../native.js";
import { contractTest } from "../contract-test.mts";

type RawStyle = Record<string, unknown>;
type NativeTaffyTree = {
  rawGetStyle(node: bigint, publicMethod: string): RawStyle;
  rawNewLeaf(style: RawStyle, publicMethod: string): bigint;
  rawNodeCount(publicMethod: string): number;
};
type NativeTaffyTreeConstructor = new () => NativeTaffyTree;

const NativeTaffyTree = Reflect.get(native, "NativeTaffyTree") as NativeTaffyTreeConstructor;

function createOwner(): NativeTaffyTree {
  const owner = new NativeTaffyTree();
  for (const method of ["rawGetStyle", "rawNewLeaf", "rawNodeCount"] as const) {
    assert.equal(typeof owner[method], "function", `${method} is available`);
  }
  return owner;
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

contractTest("TYPE-NUMBER-001/number-only", () => {
  for (const value of ["1", true, 1n, null, {}, [], new Number(1)]) {
    rejectsWithoutNode({ flexGrow: value }, TypeError);
  }
});

contractTest("TYPE-NUMBER-001/f32-truth", () => {
  for (const value of [0, -0, 0.1, -123.25, Math.PI, Number.MIN_VALUE]) {
    const actual = storedStyle({ flexGrow: value }).flexGrow;
    assert.equal(typeof actual, "number");
    assert.ok(Object.is(actual, Math.fround(value)), `${value}`);
  }
});

contractTest("TYPE-NUMBER-001/f32-special", () => {
  for (const value of [-1, Number.MAX_VALUE, Number.MIN_VALUE, NaN, Infinity, -Infinity]) {
    const actual = storedStyle({ flexGrow: value }).flexGrow;
    assert.equal(typeof actual, "number");
    assert.ok(Object.is(actual, Math.fround(value)), `${value}`);
  }
});

contractTest("TYPE-NUMBER-001/integer-bounds", () => {
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

contractTest("TYPE-NUMBER-001/no-coercion", () => {
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
