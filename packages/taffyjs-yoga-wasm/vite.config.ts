import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, type Plugin } from "vite-plus";

const packageDirectory = dirname(fileURLToPath(import.meta.url));
const yogaSourceDirectory = resolve(packageDirectory, "../taffyjs-yoga/src");

function resolveWasmBackend(): Plugin {
  return {
    name: "resolve-yoga-wasm-backend",
    resolveId: {
      filter: { id: /^@taffyjs\/node$/ },
      handler() {
        return {
          id: "@taffyjs/wasm",
          external: true,
        };
      },
    },
  };
}

export default defineConfig({
  pack: {
    entry: {
      index: resolve(yogaSourceDirectory, "index.ts"),
      load: resolve(yogaSourceDirectory, "load.ts"),
    },
    format: "esm",
    outDir: "dist",
    root: yogaSourceDirectory,
    clean: true,
    dts: {
      tsconfig: resolve(packageDirectory, "../taffyjs-yoga/tsconfig.json"),
    },
    platform: "neutral",
    target: "es2022",
    fixedExtension: false,
    plugins: [resolveWasmBackend()],
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
