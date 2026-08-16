import { TaffyTree } from "@taffyjs/node";

import { runRuntimeSmoke } from "../../../tests/runtime-smoke.ts";

const packageName = "@taffyjs/node";
const resolvedEntry = import.meta.resolve(packageName);

if (!resolvedEntry.endsWith("/index.js")) {
  throw new Error(`${packageName} resolved to an unexpected entry: ${resolvedEntry}`);
}

runRuntimeSmoke(packageName, new TaffyTree());
