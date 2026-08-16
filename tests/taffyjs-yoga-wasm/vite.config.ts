import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { defineConfig } from "vite-plus";

const wasmEntry = resolve(import.meta.dirname, "../../packages/taffyjs-wasm/dist/index.js");
const yogaWasmEntry = resolve(
  import.meta.dirname,
  "../../packages/taffyjs-yoga-wasm/dist/index.js",
);
const yogaWasmLoadEntry = resolve(
  import.meta.dirname,
  "../../packages/taffyjs-yoga-wasm/dist/load.js",
);

export default defineConfig({
  resolve: {
    alias: [
      { find: /^yoga-layout$/, replacement: yogaWasmEntry },
      { find: /^yoga-layout\/load$/, replacement: yogaWasmLoadEntry },
      { find: /^@taffyjs\/node$/, replacement: wasmEntry },
    ],
  },
  test: {
    include: ["../taffyjs-yoga/*.test.mts"],
    retry: 0,
    sequence: { concurrent: true },
    env: {
      TAFFYJS_TEST_ENTRY: pathToFileURL(wasmEntry).href,
      TAFFYJS_YOGA_TEST_ENTRY: pathToFileURL(yogaWasmEntry).href,
    },
  },
});
