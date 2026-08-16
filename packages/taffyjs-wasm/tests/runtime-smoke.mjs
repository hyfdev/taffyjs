import { TaffyTree } from "@taffyjs/wasm";

import { runRuntimeSmoke } from "../../../tests/runtime-smoke.ts";

const packageName = "@taffyjs/wasm";
const resolvedEntry = import.meta.resolve(packageName);

if (!resolvedEntry.endsWith("/dist/index.js")) {
  throw new Error(`${packageName} resolved to an unexpected entry: ${resolvedEntry}`);
}

runRuntimeSmoke(packageName, new TaffyTree());
