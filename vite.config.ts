import { defineConfig } from "vite-plus";

const testTasks = {
  "check:test:rust": {
    command: "cargo test --workspace --all-features --locked",
  },
  "check:test:native": {
    command:
      "vp test --config packages/taffyjs-node/vite.config.ts packages/taffyjs-node/tests/native",
    dependsOn: ["build"],
  },
  "check:test:integration": {
    command: "vp run tests-taffy-node#test",
    dependsOn: ["build"],
  },
  "check:test:types": {
    command: "vp exec tsc --project tests/taffyjs-node/tests/types/tsconfig.json",
    dependsOn: ["build"],
  },
  "check:test:yoga": {
    command: "vp run @taffyjs/yoga-integration-tests#test",
    dependsOn: ["build"],
  },
  "check:test:yoga:types": {
    command: "vp exec tsc --project tests/taffyjs-yoga/types/tsconfig.json",
    dependsOn: ["build"],
  },
};

const wasmTasks = {
  "check:wasm:api": {
    command: "vp run tests-taffy-wasm#test:api",
    dependsOn: ["build:wasm"],
  },
  "check:wasm:packed-consumers": {
    command: "vp run tests-taffy-wasm#test:packed",
    dependsOn: ["build:wasm"],
  },
  "check:wasm:types": {
    command: "vp run tests-taffy-wasm#check:types",
    dependsOn: ["build:wasm"],
  },
  "check:wasm:package": {
    command: "vp run tests-taffy-wasm#check:package",
    dependsOn: ["build:wasm"],
  },
  "check:wasm:browser-runtime": {
    command: "vp run tests-taffy-wasm#test:browser",
    dependsOn: ["build:wasm"],
  },
  "build:wasm:browser-consumer": {
    command: "vp run tests-taffy-wasm#build:browser",
    dependsOn: ["build:wasm"],
  },
  "check:wasm:browser-bundle": {
    command: "vp run tests-taffy-wasm#check:browser-bundle",
    dependsOn: ["build:wasm:browser-consumer"],
  },
};

export default defineConfig({
  fmt: {
    ignorePatterns: [
      "packages/taffyjs-node/index.js",
      "packages/taffyjs-node/index.d.ts",
      "packages/taffyjs-wasm/dist",
      "packages/.taffyjs-*.napi-stage-*",
      "packages/**/.napi-rs-filesystem-transaction*",
      "tests/taffyjs-wasm/browser/dist",
      "packages/taffyjs-yoga/dist",
    ],
    overrides: [
      {
        files: ["**/*.md"],
        options: { proseWrap: "preserve" },
      },
    ],
  },
  lint: {
    ignorePatterns: [
      "packages/taffyjs-node/index.js",
      "packages/taffyjs-node/index.d.ts",
      "packages/taffyjs-node/binding.js",
      "packages/taffyjs-node/binding.d.ts",
      "packages/taffyjs-wasm/dist",
      "packages/.taffyjs-*.napi-stage-*",
      "packages/**/.napi-rs-filesystem-transaction*",
      "tests/taffyjs-wasm/browser/dist",
      "packages/taffyjs-yoga/dist",
    ],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "unicorn/prefer-node-protocol": "error",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: false,
    tasks: {
      codegen: {
        command: "node tools/api-codegen/src/generate.ts",
      },
      "check:codegen": {
        command:
          "node tools/api-codegen/src/generate.ts && git add --intent-to-add --all && git diff --exit-code",
      },
      "build:node:binding": {
        command:
          "vp exec --filter @taffyjs/node -- napi build --manifest-path ../../crates/taffyjs_binding/Cargo.toml --package-json-path package.json --output-dir . --platform --js binding.js --dts binding.d.ts --esm --release -- --locked",
      },
      "build:node:normalize-builtins": {
        command: "node tools/taffy-node/normalize-node-builtin-specifiers.ts",
        dependsOn: ["build:node:binding"],
      },
      "build:node:format": {
        command: "vp exec --filter @taffyjs/node -- vp fmt binding.js binding.d.ts package.json",
        dependsOn: ["build:node:normalize-builtins"],
      },
      "build:node:platform-artifact": {
        command: "node tools/sync-platform-artifact.ts",
        dependsOn: ["build:node:format"],
      },
      "build:node:entries": {
        command: "vp exec --filter @taffyjs/node -- vp pack",
        dependsOn: ["build:node:format"],
      },
      "build:wasm:binding": {
        command:
          "vp exec --filter @taffyjs/wasm -- napi build --manifest-path ../../crates/taffyjs_binding/Cargo.toml --package-json-path package.json --output-dir .napi-build --target wasm32-wasip1 --platform --js binding.js --dts binding.d.cts --esm --release -- --locked",
      },
      "build:wasm:entries": {
        command: "vp exec --filter @taffyjs/wasm -- vp pack",
        dependsOn: ["build:wasm:binding"],
      },
      "build:wasm": {
        command: "node tools/taffy-wasm/generate-inline-wasm-runtime-files.ts",
        dependsOn: ["build:wasm:entries"],
      },
      "build:website": {
        command: "vp run @taffyjs/website#build",
        dependsOn: ["build:wasm"],
      },
      "dev:website": {
        command: "vp run @taffyjs/website#dev",
        dependsOn: ["build:wasm"],
      },
      "build:yoga": {
        command: "vp run @taffyjs/yoga#build",
        dependsOn: ["build:node:entries"],
      },
      build: {
        command: "echo build ok",
        dependsOn: ["build:node:platform-artifact", "build:node:entries", "build:yoga"],
      },
      "check:format": {
        command: "vp fmt --check",
      },
      "check:format:after-build": {
        command: "vp fmt --check",
        dependsOn: ["build"],
      },
      "check:lint": {
        command: "vp lint --deny-warnings",
      },
      "check:rust": {
        command:
          "cargo fmt --all -- --check && cargo clippy --workspace --all-targets --all-features --locked -- -D warnings",
      },
      ...testTasks,
      ...wasmTasks,
      "check:test": {
        command: "echo tests ok",
        dependsOn: Object.keys(testTasks),
      },
      check: {
        command: "echo check ok",
        dependsOn: ["check:format:after-build", "check:lint", "check:rust", "check:test"],
      },
      "check:wasm": {
        command: "echo wasm checks passed",
        dependsOn: [
          "check:wasm:api",
          "check:wasm:packed-consumers",
          "check:wasm:types",
          "check:wasm:package",
          "check:wasm:browser-runtime",
          "check:wasm:browser-bundle",
          "build:website",
        ],
      },
      ready: {
        command: "echo ready checks passed",
        dependsOn: ["check"],
      },
    },
  },
});
