import { defineConfig } from "vite-plus";

const testTasks = {
  "check:test:native": {
    command:
      "vp test --config packages/taffyjs-node/vite.config.ts packages/taffyjs-node/tests/native",
    dependsOn: ["build"],
  },
  "check:test:wrapper": {
    command:
      "vp test --config packages/taffyjs-node/vite.config.ts packages/taffyjs-node/tests/wrapper",
    dependsOn: ["build"],
  },
  "check:test:integration": {
    command: "vp run @taffyjs/node-integration-tests#test",
    dependsOn: ["build"],
  },
  "check:test:types": {
    command: "node tools/run-type-tests.mjs",
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
      "build:binding": {
        command: "vp run @taffyjs/node#build",
      },
      build: {
        command: "echo build ok",
        dependsOn: ["build:binding"],
      },
      "check:format": {
        command: "vp fmt --check",
        dependsOn: ["build"],
      },
      "check:lint": {
        command: "vp lint --deny-warnings",
        dependsOn: ["build"],
      },
      "check:rust": {
        command:
          "cargo fmt --all -- --check && cargo clippy --workspace --all-targets --all-features -- -D warnings && cargo test --workspace --all-features -- --list && cargo test --workspace --all-features",
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
      "ready:body": {
        command: "echo ready checks passed",
        dependsOn: ["check"],
      },
      ready: {
        command: "node tools/run-ready.mjs",
      },
    },
  },
});
