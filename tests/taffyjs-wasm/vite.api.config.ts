import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { defineConfig } from "vite-plus";

const wasmEntry = resolve(import.meta.dirname, "../../packages/taffyjs-wasm/dist/index.js");

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@taffyjs\/node$/,
        replacement: wasmEntry,
      },
    ],
  },
  test: {
    include: ["../taffyjs-node/tests/**/*.test.mts"],
    retry: 0,
    sequence: { concurrent: true },
    env: { TAFFYJS_TEST_ENTRY: pathToFileURL(wasmEntry).href },
  },
});
