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
  test: {
    projects: [
      {
        resolve: {
          alias: [
            { find: /^yoga-layout$/, replacement: yogaWasmEntry },
            { find: /^yoga-layout\/load$/, replacement: yogaWasmLoadEntry },
            { find: /^@taffyjs\/node$/, replacement: wasmEntry },
          ],
        },
        test: {
          name: "maintained",
          include: ["../taffyjs-yoga/*.test.mts"],
          retry: 0,
          sequence: { concurrent: true },
          env: {
            TAFFYJS_TEST_ENTRY: pathToFileURL(wasmEntry).href,
            TAFFYJS_YOGA_TEST_ENTRY: pathToFileURL(yogaWasmEntry).href,
          },
        },
      },
      {
        resolve: {
          alias: [{ find: /^yoga-layout$/, replacement: yogaWasmEntry }],
        },
        test: {
          name: "official",
          globals: true,
          include: [
            "../taffyjs-yoga/yoga-official/tests/*.test.ts",
            "../taffyjs-yoga/yoga-official/tests/generated/*.test.ts",
          ],
          retry: 0,
          sequence: { concurrent: true },
          setupFiles: [resolve(import.meta.dirname, "../taffyjs-yoga/yoga-official/setup.ts")],
        },
      },
    ],
  },
});
