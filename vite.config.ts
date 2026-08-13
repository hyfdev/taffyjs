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
    command: "vp run @taffyjs/node-integration-tests#test",
    dependsOn: ["build"],
  },
  "check:test:types": {
    command: "vp exec tsc --project tests/taffyjs-node/tests/types/tsconfig.json",
    dependsOn: ["build"],
  },
  "check:test:packed-consumer": {
    command: "node tests/taffyjs-node/packed-consumer/run.mjs",
    dependsOn: ["build"],
  },
};

export default defineConfig({
  fmt: {
    overrides: [
      {
        files: ["**/*.md"],
        options: { proseWrap: "preserve" },
      },
    ],
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
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
      "build:binding": {
        command: "vp run @taffyjs/node#build",
      },
      build: {
        command: "echo build ok",
        dependsOn: ["build:binding"],
      },
      "check:format": {
        command: "vp fmt --check",
      },
      "check:lint": {
        command: "vp lint --deny-warnings",
      },
      "check:rust": {
        command:
          "cargo fmt --all -- --check && cargo clippy --workspace --all-targets --all-features --locked -- -D warnings",
      },
      ...testTasks,
      "check:test": {
        command: "echo tests ok",
        dependsOn: Object.keys(testTasks),
      },
      check: {
        command: "echo check ok",
        dependsOn: ["check:format", "check:lint", "check:rust", "check:test"],
      },
      ready: {
        command: "echo ready checks passed",
        dependsOn: ["check"],
      },
    },
  },
});
