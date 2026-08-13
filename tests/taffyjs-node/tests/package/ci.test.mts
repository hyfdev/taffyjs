import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "vite-plus/test";
import { platforms } from "../../../../tools/platforms.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

async function sources() {
  const [config, workflow, readyRunner, typeRunner, readme, integrationManifest] =
    await Promise.all([
      import(`${pathToFileURL(resolve(root, "vite.config.ts")).href}?ci-test`),
      readFile(resolve(root, ".github/workflows/ci.yml"), "utf8"),
      readFile(resolve(root, "tools/run-ready.mjs"), "utf8"),
      readFile(resolve(root, "tools/run-type-tests.mjs"), "utf8"),
      readFile(resolve(root, "packages/taffyjs-node/README.md"), "utf8"),
      readFile(resolve(root, "tests/taffyjs-node/package.json"), "utf8").then(JSON.parse),
    ]);
  return {
    tasks: config.default.run.tasks as Record<string, { command?: string; dependsOn?: string[] }>,
    workflow,
    readyRunner,
    typeRunner,
    readme,
    integrationManifest,
  };
}

function reachableTasks(
  tasks: Record<string, { command?: string; dependsOn?: string[] }>,
  rootTask: string,
) {
  const seen = new Set<string>();
  function visit(name: string) {
    if (seen.has(name)) return;
    const task = tasks[name];
    assert.ok(task, `Missing root task ${name}`);
    seen.add(name);
    for (const dependency of task.dependsOn ?? []) visit(dependency);
  }
  visit(rootTask);
  return seen;
}

test("ready runs every local check", async () => {
  const { integrationManifest, readyRunner, tasks, typeRunner } = await sources();
  const seen = reachableTasks(tasks, "ready:body");
  for (const required of [
    "build",
    "check:generated",
    "check:format",
    "check:lint",
    "check:rust",
    "check:test:native",
    "check:test:wrapper",
    "check:test:integration",
    "check:test:types",
    "check:test:node-minimum",
  ]) {
    assert.equal(seen.has(required), true, required);
  }
  assert.match(readyRunner, /"--concurrency-limit", "1", "ready:body"/u);
  assert.match(typeRunner, /tests\.length === 0/u);
  assert.equal(integrationManifest.scripts.test, "vp test");
});

test("CI builds every supported native target", async () => {
  const { workflow } = await sources();
  const targets = Array.from(workflow.matchAll(/^\s+- target: ([^\s]+)$/gmu), (match) => match[1]);
  assert.deepEqual(
    targets.toSorted((left, right) => left.localeCompare(right)),
    platforms
      .map((platform) => platform.target)
      .toSorted((left, right) => left.localeCompare(right)),
  );
  assert.equal(new Set(targets).size, targets.length);
  assert.match(workflow, /node-version: 22\.18\.0/u);
  assert.match(workflow, /run: pnpm exec vp run --concurrency-limit 1 ready:body/u);
  assert.doesNotMatch(workflow, /(?:npm|pnpm|cargo|napi)\s+(?:pre)?publish\b/u);
  assert.match(workflow, /permissions:\n\s+contents: read/u);
});

test("README distinguishes local and remote platform checks", async () => {
  const { readme } = await sources();
  assert.match(readme, /workflow definition is not proof that a remote target passed/u);
  assert.match(readme, /locally executed host separately from remote jobs that have actually run/u);
  assert.match(readme, /Nothing in this repository publishes it to a registry/u);
});
