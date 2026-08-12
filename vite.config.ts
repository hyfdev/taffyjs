import { defineConfig } from "vite-plus";

const testTasks = {
  "check:test:native": {
    command:
      "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/native",
    dependsOn: ["build", "check:contract"],
  },
  "check:test:wrapper": {
    command:
      "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/wrapper",
    dependsOn: ["build", "check:contract"],
  },
  "check:test:integration": {
    command: "vp run @taffyjs/node-integration-tests#test",
    dependsOn: ["build", "check:contract"],
  },
  "check:test:types": {
    command: "node tools/taffy-api/src/run-type-tests.mjs",
    dependsOn: ["build", "check:contract"],
  },
  "check:test:node-minimum": {
    command: "vp env exec --node 22.18.0 -- node tests/taffyjs-node/minimum-node/run.mjs",
    dependsOn: ["build", "check:contract"],
  },
  "check:test:rust-contract": {
    command: "node tools/taffy-api/src/run-rust-tests.mjs",
    dependsOn: ["build", "check:contract"],
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
      "check:contract:generate": {
        command: "node tools/taffy-api/src/index.mjs generate --check",
      },
      "check:contract:self-test": {
        command:
          "vp test --config tools/taffy-api/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs",
      },
      "check:contract": {
        command: "node tools/taffy-api/src/index.mjs check",
        dependsOn: ["build", "check:contract:generate", "check:contract:self-test"],
      },
      "check:contract:all": {
        command: "node tools/taffy-api/src/index.mjs check --all",
        dependsOn: ["build", "check:contract:generate", "check:contract:self-test"],
      },
      "check:test:prefix": {
        command: "node tools/taffy-api/src/run-prefix-tests.mjs",
        dependsOn: ["build", "check:contract"],
      },
      "check:completion": {
        command: "node tools/taffy-api/src/index.mjs completion",
      },
      "check:review-completion": {
        command: "node tools/taffy-api/src/index.mjs review-completion",
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
        dependsOn: ["build"],
      },
      "check:lint": {
        command: "vp lint --deny-warnings",
        dependsOn: ["build"],
      },
      "check:rust": {
        command:
          "cargo fmt --all -- --check && cargo clippy --workspace --all-targets --all-features -- -D warnings && cargo test --workspace --all-features",
      },
      ...testTasks,
      "check:test": {
        command: "echo tests ok",
        dependsOn: Object.keys(testTasks),
      },
      check: {
        command: "echo check ok",
        dependsOn: ["check:contract:all", "check:format", "check:lint", "check:rust", "check:test"],
      },
      "ready:loop:body": {
        command: "echo ready:loop checks passed",
        dependsOn: [
          "check:contract",
          "check:format",
          "check:lint",
          "check:rust",
          "check:test:prefix",
        ],
      },
      "ready:loop": {
        command: "node tools/taffy-api/src/run-ready.mjs loop",
      },
      "ready:body": {
        command: "echo ready checks passed",
        dependsOn: ["check"],
      },
      ready: {
        command: "node tools/taffy-api/src/run-ready.mjs all",
      },
    },
  },
});
