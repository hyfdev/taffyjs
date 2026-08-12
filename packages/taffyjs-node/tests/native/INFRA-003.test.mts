import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as native from "../../native.js";
import * as publicApi from "../../src/index.ts";
import { contractTest } from "../contract-test.mts";

const root = resolve(fileURLToPath(new URL("../../../..", import.meta.url)));

type NativeTaffyTree = {
  rawGetStyle(node: bigint, publicMethod: string): { display: number };
  rawNewLeaf(style: object, publicMethod: string): bigint;
  rawNodeCount(publicMethod: string): number;
};
type NativeTaffyTreeConstructor = new () => NativeTaffyTree;

const NativeTaffyTree = Reflect.get(native, "NativeTaffyTree") as NativeTaffyTreeConstructor;

async function contract() {
  return JSON.parse(await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"));
}

contractTest("INFRA-003/generate-check", async () => {
  const checker = await import("../../../../tools/taffy-api/src/index.mjs");
  const goal = await readFile(resolve(root, ".agents/docs/loop-goal.md"), "utf8");
  const generated = await checker.generateArtifacts({ root, goal, write: false });
  assert.equal(
    generated.numericTypeScript,
    await readFile(
      resolve(root, "packages/taffyjs-node/src/generated/numeric-families.ts"),
      "utf8",
    ),
  );
  assert.equal(
    generated.numericRust,
    await readFile(resolve(root, "crates/taffyjs_binding/src/generated_numeric.rs"), "utf8"),
  );
  assert.equal(
    generated.numericTypeFixture,
    await readFile(
      resolve(root, "tests/taffyjs-node/tests/types/INFRA-003/narrowing.test-d.ts"),
      "utf8",
    ),
  );
});

contractTest("INFRA-003/codes", async () => {
  const { numericFamilies } = await contract();
  for (const [family, members] of Object.entries(numericFamilies) as Array<[string, string[]]>) {
    assert.deepEqual(
      Reflect.get(publicApi, family),
      Object.fromEntries(members.map((member, index) => [member, index])),
      family,
    );
  }
});

contractTest("INFRA-003/frozen", async () => {
  const { numericFamilies } = await contract();
  for (const family of Object.keys(numericFamilies)) {
    const value = Reflect.get(publicApi, family);
    assert.equal(typeof value, "object", `${family} is exported`);
    assert.notEqual(value, null, `${family} is exported`);
    assert.equal(Object.isFrozen(value), true, family);
  }
});

contractTest("INFRA-003/raw-literal", () => {
  const owner = new NativeTaffyTree();
  const node = owner.rawNewLeaf({ display: 0 }, "newLeaf");
  assert.equal(owner.rawGetStyle(node, "getStyle").display, 0);
});

contractTest("INFRA-003/invalid-code", () => {
  const owner = new NativeTaffyTree();
  const before = owner.rawNodeCount("getNodeCount");
  assert.throws(() => owner.rawNewLeaf({ display: 255 }, "newLeaf"), RangeError);
  assert.equal(owner.rawNodeCount("getNodeCount"), before);
});
