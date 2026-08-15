import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, type Plugin } from "vite-plus";

const packageDirectory = dirname(fileURLToPath(import.meta.url));
const publicEntry = resolve(packageDirectory, "../taffyjs-node/src/index.ts");
const bindingFile = resolve(packageDirectory, "../taffyjs-node/binding.js");

function resolveInlineWasiBinding(bindingEntry: string): Plugin {
  return {
    name: "resolve-inline-wasi-binding",
    resolveId: {
      filter: { id: /\bbinding\b/ },
      async handler(id, importer, options) {
        const resolution = await this.resolve(id, importer, options);

        if (resolution?.id === bindingFile) {
          if (importer && /\.d\.[cm]?ts$/.test(importer)) return resolution;
          return {
            id: bindingEntry,
            external: true,
          };
        }

        return resolution;
      },
    },
  };
}

export default defineConfig({
  pack: [
    {
      entry: { index: publicEntry },
      format: "esm",
      outDir: "dist",
      clean: true,
      dts: true,
      platform: "node",
      target: "node22.18",
      fixedExtension: false,
      plugins: [resolveInlineWasiBinding("./taffyjs.node.js")],
    },
    {
      entry: { "index.browser": publicEntry },
      format: "esm",
      outDir: "dist",
      clean: true,
      dts: false,
      platform: "browser",
      target: "es2022",
      fixedExtension: false,
      plugins: [resolveInlineWasiBinding("./taffyjs.browser.js")],
    },
  ],
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
