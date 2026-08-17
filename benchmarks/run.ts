import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { arch, cpus, platform, release } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  BenchmarkProfile,
  BenchmarkScenarioMetadata,
  BenchmarkTarget,
  BenchmarkWorkerResult,
  SampledBenchmarkResult,
} from "./scenario.ts";
import {
  benchmarkBaselineTargetId,
  benchmarkProfiles,
  benchmarkScenarios,
  benchmarkTargets,
} from "./suite.ts";

const benchmarkDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(benchmarkDirectory, "..");
const workerPath = resolve(benchmarkDirectory, "worker.ts");
const layoutValueNames = ["left", "top", "width", "height"] as const;
const layoutTolerance = 1e-3;

const arguments_ = process.argv.slice(2);
const requestedScenarioIds: string[] = [];
let updateWebsite = false;
for (const argument of arguments_) {
  if (argument === "--update-website") {
    updateWebsite = true;
  } else if (argument.startsWith("--scenario=")) {
    requestedScenarioIds.push(argument.slice("--scenario=".length));
  } else {
    throw new Error(`Unknown benchmark argument: ${argument}`);
  }
}
if (updateWebsite && requestedScenarioIds.length > 0) {
  throw new Error("benchmark:update-website requires the complete scenario suite");
}
const requestedScenarioSet = new Set(requestedScenarioIds);
const knownScenarioIds = new Set(benchmarkScenarios.map(({ id }) => id));
for (const requestedScenarioId of requestedScenarioSet) {
  assert.ok(
    knownScenarioIds.has(requestedScenarioId),
    `Unknown benchmark scenario ${requestedScenarioId}`,
  );
}
const selectedScenarios = benchmarkScenarios.filter(
  ({ id }) => requestedScenarioSet.size === 0 || requestedScenarioSet.has(id),
);
const profileId = updateWebsite ? "publication" : "local";
const profile = benchmarkProfiles.find(({ id }) => id === profileId);
assert.ok(profile, `Missing benchmark profile ${profileId}`);

function repositoryOutput(args: readonly string[]): string {
  return execFileSync("git", args, {
    cwd: repositoryDirectory,
    encoding: "utf8",
  }).trim();
}

function runWorker(
  target: BenchmarkTarget,
  scenario: BenchmarkScenarioMetadata,
  profile: BenchmarkProfile,
): BenchmarkWorkerResult {
  const output = execFileSync(
    process.execPath,
    ["--expose-gc", workerPath, target.id, scenario.id, profile.id],
    {
      cwd: benchmarkDirectory,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  return JSON.parse(output) as BenchmarkWorkerResult;
}

function assertWorkerResult(
  target: BenchmarkTarget,
  scenario: BenchmarkScenarioMetadata,
  worker: BenchmarkWorkerResult,
): void {
  assert.equal(worker.targetId, target.id, `${scenario.id} returned the wrong target`);
  assert.equal(worker.scenarioId, scenario.id, `${target.id} returned the wrong scenario`);
  assert.ok(worker.observations.length > 0, `${scenario.id}/${target.id} returned no observations`);
  for (const [runIndex, observation] of worker.observations.entries()) {
    assert.ok(
      observation.length > 0 && observation.length % 4 === 0,
      `${scenario.id}/${target.id} validation run ${runIndex + 1} returned malformed layout data`,
    );
    for (const value of observation) {
      assert.ok(
        Number.isFinite(value),
        `${scenario.id}/${target.id} validation run ${runIndex + 1} returned an invalid layout value`,
      );
    }
  }
  assert.ok(worker.result.sampleCount > 0, `${scenario.id}/${target.id} produced no samples`);
  assert.equal(
    worker.result.sampleCount,
    worker.result.samplesMs.length,
    `${scenario.id}/${target.id} reported an inconsistent sample count`,
  );
  for (const [name, value] of Object.entries(worker.result)) {
    if (name === "samplesMs") continue;
    assert.ok(Number.isFinite(value), `${scenario.id}/${target.id} returned invalid ${name}`);
  }
  for (const sample of worker.result.samplesMs) {
    assert.ok(
      Number.isFinite(sample) && sample >= 0,
      `${scenario.id}/${target.id} returned an invalid sample`,
    );
  }
}

function assertEquivalentObservations(
  scenario: BenchmarkScenarioMetadata,
  workers: readonly BenchmarkWorkerResult[],
): void {
  const baseline = workers.find(({ targetId }) => targetId === benchmarkBaselineTargetId);
  assert.ok(baseline, `${scenario.id} is missing ${benchmarkBaselineTargetId} validation output`);

  for (const worker of workers) {
    assert.equal(
      worker.observations.length,
      baseline.observations.length,
      `${scenario.id}/${worker.targetId} returned the wrong validation run count`,
    );
    for (const [runIndex, actual] of worker.observations.entries()) {
      const expected: readonly number[] = baseline.observations[runIndex];
      assert.equal(
        actual.length,
        expected.length,
        `${scenario.id}/${worker.targetId} returned the wrong layout value count`,
      );
      for (let valueIndex = 0; valueIndex < expected.length; valueIndex += 1) {
        const difference = Math.abs(actual[valueIndex] - expected[valueIndex]);
        assert.ok(
          difference <= layoutTolerance,
          `${scenario.id}/${worker.targetId} validation run ${runIndex + 1}, node ${Math.floor(valueIndex / 4)}, ${layoutValueNames[valueIndex % 4]}=${actual[valueIndex]}, expected ${expected[valueIndex]}`,
        );
      }
    }
  }
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function summarizeTarget(target: BenchmarkTarget, rounds: readonly SampledBenchmarkResult[]) {
  assert.ok(rounds.length > 0, `${target.id} produced no benchmark rounds`);
  return {
    targetId: target.id,
    packageName: target.packageName,
    hz: median(rounds.map(({ hz }) => hz)),
    meanMs: median(rounds.map(({ meanMs }) => meanMs)),
    medianMs: median(rounds.map(({ medianMs }) => medianMs)),
    minMs: Math.min(...rounds.map(({ minMs }) => minMs)),
    maxMs: Math.max(...rounds.map(({ maxMs }) => maxMs)),
    p75Ms: median(rounds.map(({ p75Ms }) => p75Ms)),
    p99Ms: median(rounds.map(({ p99Ms }) => p99Ms)),
    maxRelativeMarginOfError: Math.max(
      ...rounds.map(({ relativeMarginOfError }) => relativeMarginOfError),
    ),
    roundCount: rounds.length,
    sampleCount: rounds.reduce((total, result) => total + result.sampleCount, 0),
    rounds,
  };
}

function assertPublicationStability(
  scenario: BenchmarkScenarioMetadata,
  target: BenchmarkTarget,
  profile: BenchmarkProfile,
  rounds: readonly SampledBenchmarkResult[],
): void {
  if (profile.maxRelativeMarginOfError !== null) {
    for (const [index, round] of rounds.entries()) {
      assert.ok(
        round.relativeMarginOfError <= profile.maxRelativeMarginOfError,
        `${scenario.id}/${target.id} round ${index + 1} RME ${round.relativeMarginOfError.toFixed(2)}% exceeds ${profile.maxRelativeMarginOfError}%`,
      );
    }
  }
  if (profile.maxRoundMedianSpread !== null) {
    const medians = rounds.map(({ medianMs }) => medianMs);
    const center = median(medians);
    const spread = (Math.max(...medians) - Math.min(...medians)) / center;
    assert.ok(
      spread <= profile.maxRoundMedianSpread,
      `${scenario.id}/${target.id} round median spread ${(spread * 100).toFixed(2)}% exceeds ${profile.maxRoundMedianSpread * 100}%`,
    );
  }
}

function printScenario(
  scenario: BenchmarkScenarioMetadata,
  results: readonly ReturnType<typeof summarizeTarget>[],
): void {
  const baseline = results.find(({ targetId }) => targetId === benchmarkBaselineTargetId);
  assert.ok(baseline, `${scenario.id} is missing the baseline result`);
  console.log(`\n${scenario.name}\n${scenario.question}`);
  console.table(
    results.map((result) => {
      const target = benchmarkTargets.find(({ id }) => id === result.targetId);
      assert.ok(target, `Unknown target ${result.targetId}`);
      return {
        package: result.packageName,
        API: target.apiLabel,
        runtime: target.runtimeLabel,
        "ops/s": Math.round(result.hz).toLocaleString("en-US"),
        "median (ms)": result.medianMs.toFixed(4),
        "vs yoga-layout": `${(result.hz / baseline.hz).toFixed(2)}x`,
        rounds: result.roundCount,
        samples: result.sampleCount,
        "max rme": `${result.maxRelativeMarginOfError.toFixed(2)}%`,
      };
    }),
  );
}

const source = {
  commit: repositoryOutput(["rev-parse", "HEAD"]),
  dirty: repositoryOutput(["status", "--porcelain"]).length > 0,
};
if (updateWebsite && source.dirty) {
  throw new Error("benchmark:update-website requires a clean worktree");
}

const scenarioResults = [];
for (const scenario of selectedScenarios) {
  const workers: BenchmarkWorkerResult[] = [];
  for (let round = 0; round < profile.rounds; round += 1) {
    const targets = round % 2 === 0 ? benchmarkTargets : [...benchmarkTargets].reverse();
    for (const target of targets) {
      const worker = runWorker(target, scenario, profile);
      assertWorkerResult(target, scenario, worker);
      workers.push(worker);
    }
  }
  assertEquivalentObservations(scenario, workers);
  const results = benchmarkTargets.map((target) => {
    const rounds = workers
      .filter(({ targetId }) => target.id === targetId)
      .map(({ result }) => result);
    assert.equal(rounds.length, profile.rounds, `${scenario.id}/${target.id} missed a round`);
    assertPublicationStability(scenario, target, profile, rounds);
    return summarizeTarget(target, rounds);
  });
  printScenario(scenario, results);
  scenarioResults.push({
    id: scenario.id,
    name: scenario.name,
    question: scenario.question,
    description: scenario.description,
    transaction: scenario.transaction,
    parameters: scenario.parameters,
    results,
  });
}

const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  source,
  environment: {
    node: process.version,
    platform: platform(),
    release: release(),
    arch: arch(),
    cpu: cpus()[0]?.model ?? "unknown",
  },
  profile,
  baselineTargetId: benchmarkBaselineTargetId,
  targets: benchmarkTargets,
  scenarios: scenarioResults,
};

const outputPath = updateWebsite
  ? resolve(benchmarkDirectory, "results/published.json")
  : resolve(benchmarkDirectory, "results/local/latest.json");
await mkdir(dirname(outputPath), { recursive: true });
const output = `${JSON.stringify(report, null, 2)}\n`;

if (updateWebsite) {
  const nextPath = `${outputPath}.next`;
  await writeFile(nextPath, output);
  await rename(nextPath, outputPath);
} else {
  await writeFile(outputPath, output);
}

console.log(`\nBenchmark report written to ${outputPath}`);
