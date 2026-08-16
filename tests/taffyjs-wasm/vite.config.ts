import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus";

const wasmEntry = resolve(import.meta.dirname, "../../packages/taffyjs-wasm/dist/index.js");

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: [
            {
              find: /^@taffyjs\/node$/,
              replacement: wasmEntry,
            },
          ],
        },
        test: {
          name: "api",
          include: ["../taffyjs-node/tests/**/*.test.mts"],
          retry: 0,
          sequence: { concurrent: true },
          env: { TAFFYJS_TEST_ENTRY: pathToFileURL(wasmEntry).href },
        },
      },
      {
        test: {
          name: "browser",
          include: ["tests/**/*.browser.test.ts"],
          retry: 0,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
