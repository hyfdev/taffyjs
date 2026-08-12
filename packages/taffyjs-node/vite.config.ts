import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts"],
    format: "esm",
    outDir: ".",
    clean: false,
    dts: true,
    platform: "node",
    target: "node22.18",
    fixedExtension: false,
    deps: {
      neverBundle: [/^#native$/u],
    },
  },
  fmt: {},
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ["tests/**/*.test.mts", "packages/taffyjs-node/tests/**/*.test.mts"],
    retry: 0,
  },
});
