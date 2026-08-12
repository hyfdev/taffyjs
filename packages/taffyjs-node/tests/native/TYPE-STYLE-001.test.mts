import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as native from "../../native.js";
import { contractTest } from "../contract-test.mts";

const root = resolve(fileURLToPath(new URL("../../../..", import.meta.url)));

type RawStyle = Record<string, unknown>;
type NativeTaffyTree = {
  rawGetStyle(node: bigint, publicMethod: string): RawStyle;
  rawNewLeaf(style: unknown, publicMethod: string): bigint;
  rawNodeCount(publicMethod: string): number;
  rawSetStyle(node: bigint, style: unknown, publicMethod: string): void;
};
type NativeTaffyTreeConstructor = new () => NativeTaffyTree;

const NativeTaffyTree = Reflect.get(native, "NativeTaffyTree") as NativeTaffyTreeConstructor;

async function styleContract(): Promise<{
  fields: string[];
  nullableFields: string[];
}> {
  const contract = JSON.parse(
    await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"),
  ) as {
    styleFields: Array<[string, string]>;
    nullableStyleFields: string[];
  };
  const namesById = new Map(contract.styleFields);
  return {
    fields: contract.styleFields.map(([, name]) => name),
    nullableFields: contract.nullableStyleFields.map((id) => {
      const name = namesById.get(id);
      assert.notEqual(name, undefined, id);
      return name as string;
    }),
  };
}

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

contractTest("TYPE-STYLE-001/field-set", async () => {
  const { fields } = await styleContract();
  const source = await readFile(resolve(root, "crates/taffyjs_binding/src/style.rs"), "utf8");
  const declaration = source.match(
    /pub\(crate\) const STYLE_FIELDS: &\[&str\] = &\[(?<fields>[\s\S]*?)\];/,
  );
  assert.notEqual(declaration, null, "STYLE_FIELDS is declared in the converter");
  const sourceFields = Array.from(
    declaration?.groups?.fields.matchAll(/"([^"]+)"/g) ?? [],
    (match) => match[1],
  );
  assert.deepEqual(sourceFields, fields);

  const output = storedStyle({});
  assert.deepEqual(Object.keys(output), fields);
});

contractTest("TYPE-STYLE-001/default-dispatch", async () => {
  const { fields } = await styleContract();
  const absent = storedStyle({});
  const undefinedFields = storedStyle(
    Object.fromEntries(fields.map((field) => [field, undefined])),
  );
  assert.deepEqual(undefinedFields, absent);
});

contractTest("TYPE-STYLE-001/nullable-dispatch", async () => {
  const { fields, nullableFields } = await styleContract();
  assert.equal(nullableFields.length, 8);

  const nullableOutput = storedStyle(
    Object.fromEntries(nullableFields.map((field) => [field, null])),
  );
  for (const field of nullableFields) assert.equal(nullableOutput[field], null, field);

  const nullable = new Set(nullableFields);
  for (const field of fields.filter((field) => !nullable.has(field))) {
    const owner = createOwner();
    assert.throws(() => owner.rawNewLeaf({ [field]: null }, "newLeaf"), TypeError, field);
    assert.equal(owner.rawNodeCount("getNodeCount"), 0, field);
  }
});

contractTest("TYPE-STYLE-001/container-shape", () => {
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

contractTest("TYPE-STYLE-001/unknown-calc", () => {
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

contractTest("TYPE-STYLE-001/complete-before-native", () => {
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

contractTest("TYPE-STYLE-001/eager-output", async () => {
  const { fields } = await styleContract();
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

  assert.deepEqual(Object.keys(first), fields);
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
