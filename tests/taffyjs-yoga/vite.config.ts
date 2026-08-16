import { resolve } from "node:path";

import { defineConfig } from "vite-plus";

const yogaEntry = resolve(import.meta.dirname, "../../packages/taffyjs-yoga/dist/index.js");
const yogaLoadEntry = resolve(import.meta.dirname, "../../packages/taffyjs-yoga/dist/load.js");

export default defineConfig({
  fmt: { ignorePatterns: ["yoga-official/tests"] },
  lint: {
    ignorePatterns: ["types/public-api.test-d.ts", "yoga-official/tests"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  resolve: {
    alias: [
      {
        find: /^yoga-layout$/,
        replacement: yogaEntry,
      },
      {
        find: /^yoga-layout\/load$/,
        replacement: yogaLoadEntry,
      },
    ],
  },
  test: {
    globals: true,
    include: [
      "*.test.mts",
      "yoga-official/tests/*.test.ts",
      "yoga-official/tests/generated/*.test.ts",
    ],
    retry: 0,
    sequence: { concurrent: true },
    setupFiles: [resolve(import.meta.dirname, "yoga-official/setup.ts")],
  },
});
