import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

import { rewriteNodeLoaderVersion, shouldCopyStagePath } from "./assemble.ts";
import { isReleasePath } from "./config.ts";
import { parseRemoteTagCommit, root } from "./lib.ts";
import {
  automaticBump,
  incrementVersion,
  parseConventionalCommit,
  relevantCommits,
  type ConventionalCommit,
} from "./version.ts";

void test("the two release groups own different package paths", () => {
  assert.equal(isReleasePath("core", "packages/taffyjs-node/src/index.ts"), true);
  assert.equal(isReleasePath("core", "packages/taffyjs-yoga/src/index.ts"), false);
  assert.equal(isReleasePath("yoga", "packages/taffyjs-yoga/src/index.ts"), true);
  assert.equal(isReleasePath("yoga", "packages/taffyjs-node/src/index.ts"), false);
  assert.equal(isReleasePath("core", ".github/workflows/publish-core.yml"), false);
  assert.equal(isReleasePath("yoga", "tools/release/plan.ts"), false);
});

void test("release staging keeps sources and excludes generated dependency trees", () => {
  assert.equal(shouldCopyStagePath(resolve(root, "packages/taffyjs-node/index.js")), true);
  assert.equal(shouldCopyStagePath(resolve(root, "packages/taffyjs-node/node_modules")), false);
  assert.equal(
    shouldCopyStagePath(resolve(root, "packages/taffyjs-node/node_modules/dependency/index.js")),
    false,
  );
  assert.equal(shouldCopyStagePath(resolve(root, "packages/taffyjs-wasm/.napi-build")), false);
  assert.equal(
    shouldCopyStagePath(resolve(root, "packages/taffyjs-node/.napi-rs-filesystem-transaction-123")),
    false,
  );
});

void test("release staging rewrites every generated native loader version check", () => {
  const source = [
    'if (bindingPackageVersion !== "0.0.0") throw new Error(`expected 0.0.0 but got ${bindingPackageVersion}`);',
    'if (bindingPackageVersion !== "0.0.0") throw new Error(`expected 0.0.0 but got ${bindingPackageVersion}`);',
  ].join("\n");
  const rewritten = rewriteNodeLoaderVersion(source, "0.0.0", "0.0.1");
  assert.equal(rewritten.includes("0.0.0"), false);
  assert.equal(rewritten.match(/0\.0\.1/g)?.length, 4);
  assert.throws(() =>
    rewriteNodeLoaderVersion(`${source}\nconst unrelated = "0.0.0";`, "0.0.0", "0.0.1"),
  );
});

void test("remote release tags resolve lightweight and annotated commits", () => {
  const commit = "1".repeat(40);
  const tagObject = "2".repeat(40);
  assert.equal(parseRemoteTagCommit(`${commit}\trefs/tags/core-v0.0.1`, "core-v0.0.1"), commit);
  assert.equal(
    parseRemoteTagCommit(
      `${tagObject}\trefs/tags/core-v0.0.1\n${commit}\trefs/tags/core-v0.0.1^{}`,
      "core-v0.0.1",
    ),
    commit,
  );
  assert.equal(parseRemoteTagCommit("", "core-v0.0.1"), null);
});

void test("stable versions begin at 0.0.1 and use patch or minor increments", () => {
  assert.equal(incrementVersion("0.0.1", "patch"), "0.0.2");
  assert.equal(incrementVersion("0.0.9", "minor"), "0.1.0");
  assert.equal(incrementVersion("0.1.4", "minor"), "0.2.0");
  assert.throws(() => incrementVersion("0.0.1-beta.1", "patch"));
});

void test("breaking and feature commits outrank fixes", () => {
  const commits = [
    parsed("fix(node): preserve a value"),
    parsed("feat(node): add an operation"),
    parsed("perf(node): reduce copies"),
  ];
  assert.equal(automaticBump(commits), "minor");
  assert.equal(automaticBump([parsed("fix(node): preserve a value")]), "patch");
  assert.equal(automaticBump([parsed("docs(node): explain a value")]), undefined);
  assert.equal(automaticBump([parsed("fix(node)!: change a result")]), "minor");
});

void test("release relevance follows changed files rather than optional commit scopes", () => {
  const commits: ConventionalCommit[] = [
    commit("feat(runtime): add core behavior", ["packages/taffyjs-node/src/index.ts"]),
    commit("Raise the Node baseline", ["packages/taffyjs-node/package.json"]),
    commit("fix(runtime): correct Yoga behavior", ["packages/taffyjs-yoga/src/index.ts"]),
    commit("docs(repo): explain releases", [".agents/docs/release.md"]),
  ];
  assert.deepEqual(
    relevantCommits("core", commits).map(({ subject }) => subject),
    ["feat(runtime): add core behavior", "Raise the Node baseline"],
  );
  assert.deepEqual(
    relevantCommits("yoga", commits).map(({ subject }) => subject),
    ["fix(runtime): correct Yoga behavior"],
  );
  assert.equal(automaticBump(relevantCommits("core", commits)), "minor");
});

function commit(subject: string, paths: readonly string[]): ConventionalCommit {
  return { hash: "1234567890abcdef", subject, body: "", paths };
}

function parsed(subject: string) {
  return parseConventionalCommit(commit(subject, ["packages/taffyjs-node/src/index.ts"]));
}
