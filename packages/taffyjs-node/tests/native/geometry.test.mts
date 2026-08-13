import assert from "node:assert/strict";
import { NativeTaffyTree } from "../../native.js";
import { test } from "vite-plus/test";

function createOwner() {
  return new NativeTaffyTree();
}

function storedStyle(style: unknown) {
  const owner = createOwner();
  const node = owner.rawNewLeaf(style);
  return owner.rawGetStyle(node);
}

function rejectsWithoutNode(style: unknown): void {
  const owner = createOwner();
  assert.throws(() => owner.rawNewLeaf(style), TypeError);
  assert.equal(owner.rawNodeCount(), 0);
}

const length = (value: number) => ({ unit: 0, value });
const percent = (value: number) => ({ unit: 1, value });

test("partial Style geometry fills omitted components from defaults", () => {
  const style = storedStyle({
    overflow: { x: 3 },
    size: { width: length(10) },
    inset: { left: length(1) },
    gridRow: { start: { kind: 1, index: 3 } },
  });
  assert.deepEqual(style.overflow, { x: 3, y: 0 });
  assert.deepEqual(style.size, { width: length(10), height: { unit: 2 } });
  assert.deepEqual(style.inset, {
    left: length(1),
    right: { unit: 2 },
    top: { unit: 2 },
    bottom: { unit: 2 },
  });
  assert.deepEqual(style.gridRow, { start: { kind: 1, index: 3 }, end: { kind: 0 } });
});

test("geometry records preserve all named components", () => {
  const style = storedStyle({
    overflow: { x: 1, y: 2 },
    size: { width: length(10), height: percent(50) },
    padding: {
      left: length(1),
      right: length(2),
      top: length(3),
      bottom: length(4),
    },
    gridRow: { start: { kind: 1, index: -2 }, end: { kind: 3, span: 3 } },
  });
  assert.deepEqual(style.overflow, { x: 1, y: 2 });
  assert.deepEqual(style.size, { width: length(10), height: percent(50) });
  assert.deepEqual(style.padding, {
    left: length(1),
    right: length(2),
    top: length(3),
    bottom: length(4),
  });
  assert.deepEqual(style.gridRow, {
    start: { kind: 1, index: -2 },
    end: { kind: 3, span: 3 },
  });
});

test("geometry records reject arrays and unknown components", () => {
  for (const style of [
    { overflow: [1, 2] },
    { overflow: { x: 1, y: 2, z: 3 } },
    { size: { width: length(1), height: length(2), depth: length(3) } },
    { padding: { left: length(1), diagonal: length(2) } },
    { gridRow: { start: { kind: 0 }, middle: { kind: 0 } } },
  ]) {
    rejectsWithoutNode(style);
  }
});

test("only semantic-length Size and Rect fields accept a scalar", () => {
  for (const field of [
    "inset",
    "size",
    "minSize",
    "maxSize",
    "margin",
    "padding",
    "border",
    "gap",
  ] as const) {
    const style = storedStyle({ [field]: length(7) });
    const geometry = style[field] as unknown as Record<string, unknown>;
    for (const value of Object.values(geometry)) assert.deepEqual(value, length(7), field);
  }
  rejectsWithoutNode({ overflow: 1 });
  rejectsWithoutNode({ gridRow: { kind: 0 } });
});

test("geometry output is detached and can be reused as input", () => {
  const owner = createOwner();
  const node = owner.rawNewLeaf({
    overflow: { x: 1, y: 2 },
    size: { width: length(10), height: percent(50) },
    padding: length(3),
    gridRow: { start: { kind: 1, index: 2 }, end: { kind: 0 } },
  });
  const first = owner.rawGetStyle(node);
  const second = owner.rawGetStyle(node);
  for (const field of ["overflow", "size", "padding", "gridRow"] as const) {
    assert.notEqual(first[field], second[field], field);
    assert.equal(Object.isFrozen(first[field]), false, field);
  }

  (first.overflow as { x: number }).x = 3;
  (first.size as { width: { value: number } }).width.value = 12;
  assert.deepEqual(second.overflow, { x: 1, y: 2 });
  assert.deepEqual((second.size as { width: unknown }).width, length(10));

  const reused = storedStyle({
    overflow: first.overflow,
    size: first.size,
    padding: first.padding,
    gridRow: first.gridRow,
  });
  assert.deepEqual(reused.overflow, { x: 3, y: 2 });
  assert.deepEqual((reused.size as { width: unknown }).width, length(12));
});
