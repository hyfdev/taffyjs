import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts", "src/load.ts"],
    format: "esm",
    outDir: "dist",
    clean: true,
    dts: true,
    platform: "node",
    target: "node22.20",
    fixedExtension: false,
  },
  fmt: {
    ignorePatterns: ["dist"],
  },
  lint: {
    ignorePatterns: ["dist"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
