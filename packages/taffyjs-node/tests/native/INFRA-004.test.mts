import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as native from "../../native.js";
import { contractTest } from "../contract-test.mts";

type CodedError = Error & { code?: string };
type NativeTaffyTree = {
  rawNewLeaf(style: object, publicMethod: string): bigint;
  rawNodeCount(publicMethod: string): number;
  rawSetStyle(node: bigint, style: object, publicMethod: string): void;
};
type NativeTaffyTreeConstructor = new () => NativeTaffyTree;
type NativeTestHooksTree = {
  __throwValue(value: unknown): void;
  __triggerError(condition: string): void;
};
type NativeTestHooksTreeConstructor = new () => NativeTestHooksTree;

const NativeTaffyTree = Reflect.get(native, "NativeTaffyTree") as NativeTaffyTreeConstructor;
const testHooksPath = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
  "node_modules/.cache/taffyjs-test-hooks/test-hooks.js",
);
const testHooksModule = (await import(pathToFileURL(testHooksPath).href)) as {
  NativeTaffyTree: NativeTestHooksTreeConstructor;
};
const NativeTestHooksTree = testHooksModule.NativeTaffyTree;

function captureError(body: () => unknown): CodedError {
  try {
    body();
  } catch (error) {
    assert.ok(error instanceof Error);
    return error;
  }
  assert.fail("Expected operation to throw");
}

function captureThrown(body: () => unknown): unknown {
  try {
    body();
  } catch (error) {
    return error;
  }
  assert.fail("Expected operation to throw");
}

function reentrantStyle(owner: NativeTaffyTree, method: string) {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "display") owner.rawNodeCount(method);
        return undefined;
      },
    },
  );
}

function runPanicChild() {
  const fixture = fileURLToPath(new URL("./fixtures/infra-004-child.mjs", import.meta.url));
  const hooks = resolve(
    fileURLToPath(new URL("../../", import.meta.url)),
    "node_modules/.cache/taffyjs-test-hooks/test-hooks.js",
  );
  const child = spawnSync(process.execPath, [fixture], {
    encoding: "utf8",
    env: { ...process.env, TAFFY_TEST_HOOKS: hooks },
    timeout: 10_000,
  });
  assert.equal(child.signal, null);
  assert.equal(child.status, 0, child.stderr);
  const lines = child.stdout.trim().split("\n");
  assert.equal(lines.length, 1);
  return JSON.parse(lines[0]);
}

contractTest("INFRA-004/taxonomy", () => {
  const hooks = new NativeTestHooksTree();
  const cases = [
    ["wrong-type-or-shape", TypeError, undefined],
    ["discrete-range-or-enum", RangeError, undefined],
    ["child-index-out-of-bounds", RangeError, "ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS"],
    ["node-id-not-bigint", TypeError, undefined],
    ["malformed-node-id", Error, "ERR_TAFFY_INVALID_NODE_ID"],
    ["foreign-node-id", Error, "ERR_TAFFY_FOREIGN_NODE_ID"],
    ["stale-node-id", Error, "ERR_TAFFY_STALE_NODE_ID"],
    ["random-source-failure", Error, undefined],
    ["node-id-serial-exhaustion", RangeError, undefined],
    ["invalid-topology", Error, "ERR_TAFFY_INVALID_TOPOLOGY"],
  ] as const;
  for (const [condition, errorClass, code] of cases) {
    const error = captureError(() => hooks.__triggerError(condition));
    assert.equal(error.constructor, errorClass, condition);
    assert.equal(error.code, code, condition);
  }

  const owner = new NativeTaffyTree();
  const node = owner.rawNewLeaf({}, "newLeaf");
  const busy = captureError(() =>
    owner.rawSetStyle(node, reentrantStyle(owner, "setStyle"), "setStyle"),
  );
  assert.equal(busy.constructor, Error);
  assert.equal(busy.code, "ERR_TAFFY_TREE_BUSY");

  const panic = runPanicChild();
  assert.deepEqual(panic.first, { class: "Error", code: "ERR_TAFFY_INTERNAL" });
  assert.deepEqual(panic.second, { class: "Error", code: "ERR_TAFFY_TREE_POISONED" });

  const callbackValue = { reason: "callback failed" };
  assert.equal(
    captureThrown(() => hooks.__throwValue(callbackValue)),
    callbackValue,
  );
});

contractTest("INFRA-004/busy-unit", () => {
  const owner = new NativeTaffyTree();
  const node = owner.rawNewLeaf({}, "newLeaf");
  const error = captureError(() =>
    owner.rawSetStyle(node, reentrantStyle(owner, "setStyle"), "setStyle"),
  );
  assert.equal(error.code, "ERR_TAFFY_TREE_BUSY");
  assert.equal(
    error.message,
    "Cannot call setStyle on this TaffyTree while it is computing layout from a measure callback",
  );
});

contractTest("INFRA-004/expected-reuse", () => {
  const owner = new NativeTaffyTree();
  const node = owner.rawNewLeaf({}, "newLeaf");
  const style = reentrantStyle(owner, "getNodeCount");
  assert.throws(() => owner.rawSetStyle(node, style, "setStyle"), {
    code: "ERR_TAFFY_TREE_BUSY",
  });
  assert.equal(owner.rawNodeCount("getNodeCount"), 1);
});

contractTest("INFRA-004/panic-poisons", () => {
  const result = runPanicChild();
  assert.deepEqual(result.first, { class: "Error", code: "ERR_TAFFY_INTERNAL" });
  assert.deepEqual(result.second, { class: "Error", code: "ERR_TAFFY_TREE_POISONED" });
});

contractTest("INFRA-004/process-survives", () => {
  assert.deepEqual(runPanicChild(), {
    first: { class: "Error", code: "ERR_TAFFY_INTERNAL" },
    second: { class: "Error", code: "ERR_TAFFY_TREE_POISONED" },
    accessedAfterPoison: false,
    survived: true,
  });
});
