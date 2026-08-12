import assert from "node:assert/strict";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { contractTest } from "../contract-test.mts";

type LayoutTestHooks = {
  __layoutWithOrder(order: number): { order: number };
};
type LayoutTestHooksConstructor = new () => LayoutTestHooks;

const hooksPath = resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
  "node_modules/.cache/taffyjs-test-hooks/test-hooks.js",
);
const hooksModule = (await import(pathToFileURL(hooksPath).href)) as {
  NativeTaffyTree: LayoutTestHooksConstructor;
};

contractTest("TYPE-LAYOUT-001/order-u32", () => {
  const hooks = new hooksModule.NativeTaffyTree();
  const layout = hooks.__layoutWithOrder(0xffff_ffff);
  assert.equal(layout.order, 0xffff_ffff);
  assert.equal(Number.isSafeInteger(layout.order), true);
});
