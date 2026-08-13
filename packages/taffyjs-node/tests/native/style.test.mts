import assert from "node:assert/strict";
import * as native from "../../native.js";
import { test } from "vite-plus/test";

const styleFields = [
  "display",
  "itemIsTable",
  "itemIsReplaced",
  "boxSizing",
  "direction",
  "overflow",
  "scrollbarWidth",
  "float",
  "clear",
  "position",
  "inset",
  "size",
  "minSize",
  "maxSize",
  "aspectRatio",
  "margin",
  "padding",
  "border",
  "alignItems",
  "alignSelf",
  "justifyItems",
  "justifySelf",
  "alignContent",
  "justifyContent",
  "gap",
  "textAlign",
  "flexDirection",
  "flexWrap",
  "flexBasis",
  "flexGrow",
  "flexShrink",
  "gridTemplateRows",
  "gridTemplateColumns",
  "gridAutoRows",
  "gridAutoColumns",
  "gridAutoFlow",
  "gridTemplateAreas",
  "gridTemplateColumnNames",
  "gridTemplateRowNames",
  "gridRow",
  "gridColumn",
] as const;
const nullableFields = [
  "aspectRatio",
  "alignItems",
  "alignSelf",
  "justifyItems",
  "justifySelf",
  "alignContent",
  "justifyContent",
  "gridTemplateAreas",
] as const;

type RawStyle = Record<string, unknown>;
type NativeTaffyTree = {
  rawGetStyle(node: bigint, publicMethod: string): RawStyle;
  rawNewLeaf(style: unknown, publicMethod: string): bigint;
  rawNodeCount(publicMethod: string): number;
  rawSetStyle(node: bigint, style: unknown, publicMethod: string): void;
};
type NativeTaffyTreeConstructor = new () => NativeTaffyTree;

const NativeTaffyTree = Reflect.get(
  native,
  "NativeTaffyTree",
) as unknown as NativeTaffyTreeConstructor;

function createOwner(): NativeTaffyTree {
  const owner = new NativeTaffyTree();
  for (const method of ["rawGetStyle", "rawNewLeaf", "rawNodeCount", "rawSetStyle"] as const) {
    assert.equal(typeof owner[method], "function", `${method} is available`);
  }
  return owner;
}

function storedStyle(style: unknown): RawStyle {
  const owner = createOwner();
  const node = owner.rawNewLeaf(style, "newLeaf");
  return owner.rawGetStyle(node, "getStyle");
}

test("output contains every public style field", () => {
  const output = storedStyle({});
  assert.deepEqual(Object.keys(output), styleFields);
});

test("undefined fields use their defaults", () => {
  const absent = storedStyle({});
  const undefinedFields = storedStyle(
    Object.fromEntries(styleFields.map((field) => [field, undefined])),
  );
  assert.deepEqual(undefinedFields, absent);
});

test("only optional Taffy values accept null", () => {
  assert.equal(nullableFields.length, 8);

  const nullableOutput = storedStyle(
    Object.fromEntries(nullableFields.map((field) => [field, null])),
  );
  for (const field of nullableFields) assert.equal(nullableOutput[field], null, field);

  const nullable = new Set<string>(nullableFields);
  for (const field of styleFields.filter((field) => !nullable.has(field))) {
    const owner = createOwner();
    assert.throws(() => owner.rawNewLeaf({ [field]: null }, "newLeaf"), TypeError, field);
    assert.equal(owner.rawNodeCount("getNodeCount"), 0, field);
  }
});

test("style input accepts objects and rejects other values", () => {
  class StyleInput {
    flexGrow = 2;
  }

  assert.equal(storedStyle(new StyleInput()).flexGrow, 2);

  let read = false;
  const proxy = new Proxy(
    { flexGrow: 3 },
    {
      get(target, property, receiver) {
        if (property === "flexGrow") read = true;
        return Reflect.get(target, property, receiver);
      },
    },
  );
  assert.equal(storedStyle(proxy).flexGrow, 3);
  assert.equal(read, true);

  for (const value of [undefined, null, 0, "", true, 1n, Symbol("style"), () => {}, []]) {
    const owner = createOwner();
    assert.throws(() => owner.rawNewLeaf(value, "newLeaf"), TypeError);
    assert.equal(owner.rawNodeCount("getNodeCount"), 0);
  }
});

test("unknown style fields and calc values are rejected", () => {
  for (const style of [
    { unknownField: true },
    { calc: true },
    { flexBasis: { calc: "1px + 2%" } },
  ]) {
    const owner = createOwner();
    assert.throws(() => owner.rawNewLeaf(style, "newLeaf"), TypeError);
    assert.equal(owner.rawNodeCount("getNodeCount"), 0);
  }
});

test("style conversion finishes before native state changes", () => {
  const owner = createOwner();
  const node = owner.rawNewLeaf({ flexGrow: 1 }, "newLeaf");

  owner.rawSetStyle(node, { flexGrow: 2 }, "setStyle");
  assert.equal(owner.rawGetStyle(node, "getStyle").flexGrow, 2);

  const before = owner.rawGetStyle(node, "getStyle");
  assert.throws(
    () => owner.rawSetStyle(node, { flexGrow: 3, display: 255 }, "setStyle"),
    RangeError,
  );
  assert.deepEqual(owner.rawGetStyle(node, "getStyle"), before);

  assert.throws(() => owner.rawNewLeaf({ flexGrow: 3, display: 255 }, "newLeaf"), RangeError);
  assert.equal(owner.rawNodeCount("getNodeCount"), 1);
});

test("output snapshots are detached", () => {
  const owner = createOwner();
  const node = owner.rawNewLeaf(
    {
      flexGrow: 2,
      size: { width: { unit: 0, value: 10 } },
      gridTemplateRowNames: [["row"]],
    },
    "newLeaf",
  );
  const first = owner.rawGetStyle(node, "getStyle");
  const second = owner.rawGetStyle(node, "getStyle");

  assert.deepEqual(Object.keys(first), styleFields);
  assert.deepEqual(first, second);
  assert.notEqual(first, second);
  assert.notEqual(first.size, second.size);
  assert.notEqual(first.gridTemplateRowNames, second.gridTemplateRowNames);
  assert.equal(Object.isFrozen(first), false);
  assert.equal(Object.isFrozen(first.size), false);

  first.flexGrow = 4;
  (first.size as { width: { value: number } }).width.value = 20;
  (first.gridTemplateRowNames as string[][])[0][0] = "changed";

  const third = owner.rawGetStyle(node, "getStyle");
  assert.equal(third.flexGrow, 2);
  assert.deepEqual((third.size as { width: unknown }).width, { unit: 0, value: 10 });
  assert.deepEqual(third.gridTemplateRowNames, [["row"]]);
});
