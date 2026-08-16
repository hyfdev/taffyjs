// Keep this runtime-only harness as JavaScript so clean type-aware checks do not resolve
// the build-only package entries before the WASIP job produces them.
import Yoga from "@taffyjs/yoga-wasm";
import { loadYoga } from "@taffyjs/yoga-wasm/load";

import { runYogaRuntimeSmoke } from "../runtime-smoke.ts";

const packageName = "@taffyjs/yoga-wasm";
const loadEntryName = "@taffyjs/yoga-wasm/load";
const resolvedEntry = import.meta.resolve(packageName);
const resolvedLoadEntry = import.meta.resolve(loadEntryName);

if (!resolvedEntry.endsWith("/packages/taffyjs-yoga-wasm/dist/index.js")) {
  throw new Error(`${packageName} resolved to an unexpected entry: ${resolvedEntry}`);
}

if (!resolvedLoadEntry.endsWith("/packages/taffyjs-yoga-wasm/dist/load.js")) {
  throw new Error(`${loadEntryName} resolved to an unexpected entry: ${resolvedLoadEntry}`);
}

runYogaRuntimeSmoke(packageName, Yoga);
runYogaRuntimeSmoke(loadEntryName, await loadYoga());
