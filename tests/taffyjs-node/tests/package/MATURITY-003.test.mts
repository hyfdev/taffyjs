import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  expandContract,
  extractLoopStatus,
  validateRunnerTaskGraph,
} from "../../../../tools/taffy-api/src/index.mjs";
import { contractTest } from "../contract-test.mts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");

async function sources() {
  const [
    contract,
    statusSource,
    config,
    workflow,
    readyRunner,
    rustRunner,
    typeRunner,
    readme,
    integrationManifest,
  ] = await Promise.all([
    readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8").then(JSON.parse),
    readFile(resolve(root, ".agents/docs/loop-status.md"), "utf8"),
    import(`${pathToFileURL(resolve(root, "vite.config.ts")).href}?maturity=003`),
    readFile(resolve(root, ".github/workflows/ci.yml"), "utf8"),
    readFile(resolve(root, "tools/taffy-api/src/run-ready.mjs"), "utf8"),
    readFile(resolve(root, "tools/taffy-api/src/run-rust-tests.mjs"), "utf8"),
    readFile(resolve(root, "tools/taffy-api/src/run-type-tests.mjs"), "utf8"),
    readFile(resolve(root, "packages/taffyjs-node/README.md"), "utf8"),
    readFile(resolve(root, "tests/taffyjs-node/package.json"), "utf8").then(JSON.parse),
  ]);
  return {
    contract,
    status: extractLoopStatus(statusSource),
    tasks: config.default.run.tasks as Record<string, { command?: string; dependsOn?: string[] }>,
    workflow,
    readyRunner,
    rustRunner,
    typeRunner,
    readme,
    integrationManifest,
  };
}

contractTest("MATURITY-003/ready-graph", async () => {
  const { contract, status, tasks } = await sources();
  validateRunnerTaskGraph(contract, expandContract(contract), status, tasks);
  const seen = new Set<string>();
  function visit(name: string) {
    if (seen.has(name)) return;
    const task = tasks[name];
    assert.ok(task, `Missing root task ${name}`);
    seen.add(name);
    for (const dependency of task.dependsOn ?? []) visit(dependency);
  }
  visit("ready:body");
  assert.deepEqual(
    [
      "build",
      "check:contract:all",
      "check:format",
      "check:lint",
      "check:rust",
      "check:test:native",
      "check:test:wrapper",
      "check:test:integration",
      "check:test:types",
      "check:test:node-minimum",
      "check:test:rust-contract",
    ].filter((name) => !seen.has(name)),
    [],
  );
});

contractTest("MATURITY-003/no-empty-suite", async () => {
  const { integrationManifest, readyRunner, rustRunner, tasks, typeRunner } = await sources();
  assert.doesNotMatch(JSON.stringify(tasks), /passWithNoTests/u);
  assert.match(
    readyRunner,
    /await checkCandidate\(\{ root \}\);[\s\S]*await runBody\(\);[\s\S]*await checkCandidate\(\{ root \}\);/u,
  );
  assert.match(rustRunner, /"--list"[\s\S]*expectedIdentities[\s\S]*"--exact"/u);
  assert.match(typeRunner, /results\.length === 0/u);
  for (const name of ["check:test:native", "check:test:wrapper"]) {
    assert.match(tasks[name].command ?? "", /contract-reporter\.mjs/u);
  }
  assert.match(
    tasks["check:test:integration"].command ?? "",
    /@taffyjs\/node-integration-tests#test/u,
  );
  assert.match(integrationManifest.scripts.test, /contract-reporter\.mjs/u);
});

contractTest("MATURITY-003/ci-targets", async () => {
  const { contract, workflow } = await sources();
  const targets = Array.from(workflow.matchAll(/^\s+- target: ([^\s]+)$/gmu), (match) => match[1]);
  assert.deepEqual(
    targets.sort((left, right) => left.localeCompare(right)),
    [...contract.targets].sort((left, right) => left.localeCompare(right)),
  );
  assert.equal(new Set(targets).size, targets.length);
  assert.match(workflow, /node-version: 22\.18\.0/u);
  assert.match(workflow, /run: pnpm exec vp run --concurrency-limit 1 ready:body/u);
  assert.doesNotMatch(workflow, /run: pnpm exec vp run ready\s*$/mu);
  assert.doesNotMatch(workflow, /(?:npm|pnpm|cargo|napi)\s+(?:pre)?publish\b/u);
  assert.match(workflow, /permissions:\n\s+contents: read/u);
});

contractTest("MATURITY-003/handover-truth", async () => {
  const { readme } = await sources();
  assert.match(readme, /workflow definition is not proof that a remote target passed/u);
  assert.match(readme, /locally executed host separately from remote jobs that have actually run/u);
  assert.match(readme, /Nothing in this repository publishes it to a registry/u);
});
