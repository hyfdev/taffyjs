import { defineConfig } from "vite-plus";

const testTasks = {
  "check:test:unit": {
    command: "vp run @taffyjs/node#test",
    dependsOn: ["build", "check:contract:all"],
  },
  "check:test:integration": {
    command: "vp run @taffyjs/node-integration-tests#test",
    dependsOn: ["build", "check:contract:all"],
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
        command: "vp test --config tools/taffy-api/vite.config.ts --reporter=default",
      },
      "check:contract": {
        command: "node tools/taffy-api/src/index.mjs check",
        dependsOn: ["check:contract:generate", "check:contract:self-test"],
      },
      "check:contract:all": {
        command: "node tools/taffy-api/src/index.mjs check --all",
        dependsOn: ["check:contract:generate", "check:contract:self-test"],
      },
      "check:completion": {
        command: "node tools/taffy-api/src/index.mjs completion",
      },
      "check:review-completion": {
        command: "node tools/taffy-api/src/index.mjs review-completion",
      },
      "build:binding": {
        command: "vp run @taffyjs/node#build:debug",
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
          "cargo fmt --all -- --check && cargo clippy --workspace --all-targets --all-features -- -D warnings",
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
      "ready:loop": {
        command: "echo ready:loop",
        dependsOn: ["check:contract", "check:format", "check:lint", "check:rust"],
      },
      ready: {
        command: "echo ready",
        dependsOn: ["check"],
      },
    },
  },
});
