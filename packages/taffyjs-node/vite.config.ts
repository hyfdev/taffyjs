import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: "esm",
    outDir: ".",
    clean: false,
    dts: true,
    platform: "node",
    target: "node22.20",
    fixedExtension: false,
  },
  fmt: {
    ignorePatterns: ["index.js", "index.d.ts"],
  },
  lint: {
    ignorePatterns: ["index.js", "index.d.ts", "binding.js", "binding.d.ts"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ["tests/**/*.test.mts", "packages/taffyjs-node/tests/**/*.test.mts"],
    retry: 0,
    sequence: { concurrent: true },
  },
});
