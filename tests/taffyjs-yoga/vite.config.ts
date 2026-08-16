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
  test: {
    projects: [
      {
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
          name: "maintained",
          include: ["*.test.mts"],
          retry: 0,
          sequence: { concurrent: true },
        },
      },
      {
        resolve: {
          alias: [
            {
              find: /^yoga-layout$/,
              replacement: yogaEntry,
            },
          ],
        },
        test: {
          name: "official",
          globals: true,
          include: ["yoga-official/tests/*.test.ts", "yoga-official/tests/generated/*.test.ts"],
          retry: 0,
          sequence: { concurrent: true },
          setupFiles: [resolve(import.meta.dirname, "yoga-official/setup.ts")],
        },
      },
    ],
  },
});
