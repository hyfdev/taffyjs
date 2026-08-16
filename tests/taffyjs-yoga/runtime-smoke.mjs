import Yoga from "yoga-layout";
import { loadYoga } from "yoga-layout/load";

import { runYogaRuntimeSmoke } from "../runtime-smoke.ts";

const packageName = "@taffyjs/yoga";
const loadEntryName = "@taffyjs/yoga/load";
const resolvedEntry = import.meta.resolve("yoga-layout");
const resolvedLoadEntry = import.meta.resolve("yoga-layout/load");

if (!resolvedEntry.endsWith("/dist/index.js")) {
  throw new Error(`${packageName} resolved to an unexpected entry: ${resolvedEntry}`);
}

if (!resolvedLoadEntry.endsWith("/dist/load.js")) {
  throw new Error(`${loadEntryName} resolved to an unexpected entry: ${resolvedLoadEntry}`);
}

runYogaRuntimeSmoke(packageName, Yoga);
runYogaRuntimeSmoke(loadEntryName, await loadYoga());
