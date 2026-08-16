import { resolve } from "node:path";

import { defineConfig } from "vite-plus";

const yogaEntry = resolve(import.meta.dirname, "../../packages/taffyjs-yoga/dist/index.js");
const yogaLoadEntry = resolve(import.meta.dirname, "../../packages/taffyjs-yoga/dist/load.js");

export default defineConfig({
  fmt: {},
  lint: {
    ignorePatterns: ["types/public-api.test-d.ts"],
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
    include: ["*.test.mts"],
    retry: 0,
    sequence: { concurrent: true },
  },
});
