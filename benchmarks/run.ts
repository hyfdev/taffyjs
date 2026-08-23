import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { arch, cpus, platform, release } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  BenchmarkProfile,
  BenchmarkScenario,
  BenchmarkTarget,
  BenchmarkWorkerResult,
  SampledBenchmarkResult,
  TransactionOutcome,
} from "./scenario.ts";
import { benchmarkProfiles, benchmarkScenarios, benchmarkTargets } from "./suite.ts";

const benchmarkDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(benchmarkDirectory, "..");
const workerPath = resolve(benchmarkDirectory, "worker.ts");
const coldStartWorkerPath = resolve(benchmarkDirectory, "cold-start-worker.ts");

const arguments_ = process.argv.slice(2);
const requestedScenarioIds: string[] = [];
let updateWebsite = false;
for (const argument of arguments_) {
  if (argument === "--update-website") updateWebsite = true;
  else if (argument.startsWith("--scenario=")) requestedScenarioIds.push(argument.slice(11));
  else throw new Error(`Unknown benchmark argument: ${argument}`);
}
if (updateWebsite && requestedScenarioIds.length > 0) {
  throw new Error("benchmark:update-website requires the complete scenario suite");
}
const requested = new Set(requestedScenarioIds);
const knownScenarioIds = new Set(benchmarkScenarios.map(({ id }) => id));
for (const id of requested) assert.ok(knownScenarioIds.has(id), `Unknown benchmark scenario ${id}`);
const selectedScenarios = benchmarkScenarios.filter(
  ({ id }) => requested.size === 0 || requested.has(id),
);
const profileId = updateWebsite ? "publication" : "local";
const profile = benchmarkProfiles.find(({ id }) => id === profileId);
assert.ok(profile, `Missing benchmark profile ${profileId}`);

function targetById(id: string): BenchmarkTarget {
  const target = benchmarkTargets.find((candidate) => candidate.id === id);
  assert.ok(target, `Unknown benchmark target ${id}`);
  return target;
}

function repositoryOutput(args: readonly string[]): string {
  return execFileSync("git", args, { cwd: repositoryDirectory, encoding: "utf8" }).trim();
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function percentile(sorted: readonly number[], fraction: number): number {
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
}

function runWorker(
  target: BenchmarkTarget,
  scenario: BenchmarkScenario,
  profile: BenchmarkProfile,
): BenchmarkWorkerResult {
  const output = execFileSync(
    process.execPath,
    ["--expose-gc", workerPath, target.id, scenario.id, profile.id],
    { cwd: benchmarkDirectory, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
  );
  return JSON.parse(output) as BenchmarkWorkerResult;
}

/** One fresh process per sample, because module load and instantiation are the subject. */
function runColdStart(target: BenchmarkTarget, processCount: number): BenchmarkWorkerResult {
  const samplesMs: number[] = [];
  let outcome: TransactionOutcome | undefined;
  for (let index = 0; index < processCount; index += 1) {
    const output = execFileSync(process.execPath, [coldStartWorkerPath, target.id], {
      cwd: benchmarkDirectory,
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    });
    const parsed = JSON.parse(output) as { elapsed: number; outcome: TransactionOutcome };
    samplesMs.push(parsed.elapsed);
    outcome = parsed.outcome;
  }
  assert.ok(outcome, `${target.id} produced no cold-start outcome`);
  const sorted = [...samplesMs].sort((left, right) => left - right);
  const mean = samplesMs.reduce((total, value) => total + value, 0) / samplesMs.length;
  const variance =
    samplesMs.reduce((total, value) => total + (value - mean) ** 2, 0) / (samplesMs.length - 1);
  const standardError = Math.sqrt(variance) / Math.sqrt(samplesMs.length);
  return {
    targetId: target.id,
    scenarioId: "cold-start",
    outcome,
    result: {
      hz: 1000 / mean,
      meanMs: mean,
      medianMs: median(samplesMs),
      minMs: sorted[0],
      maxMs: sorted[sorted.length - 1],
      p75Ms: percentile(sorted, 0.75),
      p99Ms: percentile(sorted, 0.99),
      relativeMarginOfError: ((standardError * 1.96) / mean) * 100,
      sampleCount: samplesMs.length,
      samplesMs,
    },
  };
}

/**
 * The four TaffyJS packages are two public APIs over one engine, each on two runtimes.
 * A runtime never changes the result, so the two packages of an API must agree exactly.
 * The two APIs round differently by design — the Yoga facade reproduces Yoga's own
 * point grid — so across APIs the geometry only has to be the same layout, which a
 * builder mistake is not.
 */
function assertOneEngineAgrees(
  scenario: BenchmarkScenario,
  workers: readonly BenchmarkWorkerResult[],
): void {
  const byApi = new Map<string, BenchmarkWorkerResult[]>();
  for (const worker of workers) {
    if (worker.targetId === "yoga-layout") continue;
    const api = targetById(worker.targetId).apiKind;
    byApi.set(api, [...(byApi.get(api) ?? []), worker]);
  }
  const checksums: number[] = [];
  for (const [api, group] of byApi) {
    const first = group[0];
    for (const worker of group) {
      assert.equal(
        worker.outcome.checksum,
        first.outcome.checksum,
        `${scenario.id}/${worker.targetId} and ${first.targetId} share the ${api} API but laid out differently`,
      );
    }
    checksums.push(first.outcome.checksum);
  }
  if (checksums.length < 2) return;
  const spread = (Math.max(...checksums) - Math.min(...checksums)) / Math.max(...checksums);
  assert.ok(
    spread <= 0.01,
    `${scenario.id} lays out differently through the two public APIs: ${checksums.join(" vs ")}`,
  );
}

function summarizeTarget(
  target: BenchmarkTarget,
  rounds: readonly SampledBenchmarkResult[],
  outcome: TransactionOutcome,
) {
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
    measureCalls: outcome.measureCalls,
    readCount: outcome.readCount,
    roundCount: rounds.length,
    sampleCount: rounds.reduce((total, result) => total + result.sampleCount, 0),
    rounds: rounds.map(({ samplesMs: _samples, ...summary }) => summary),
  };
}

function assertPublicationStability(
  scenario: BenchmarkScenario,
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
  if (profile.maxRoundMedianSpread !== null && rounds.length > 1) {
    const medians = rounds.map(({ medianMs }) => medianMs);
    const spread = (Math.max(...medians) - Math.min(...medians)) / median(medians);
    assert.ok(
      spread <= profile.maxRoundMedianSpread,
      `${scenario.id}/${target.id} round median spread ${(spread * 100).toFixed(2)}% exceeds ${profile.maxRoundMedianSpread * 100}%`,
    );
  }
}

function relativeTime(medianMs: number, baselineMs: number): string {
  const ratio = medianMs / baselineMs;
  if (Math.abs(ratio - 1) < 1e-9) return "1.00x";
  const magnitude = ratio >= 1 ? ratio : 1 / ratio;
  const formatted =
    magnitude >= 100
      ? String(Math.round(magnitude))
      : magnitude >= 10
        ? magnitude.toFixed(0)
        : magnitude.toFixed(1);
  return `${ratio >= 1 ? "-" : "+"}${formatted}x`;
}

function printScenario(
  scenario: BenchmarkScenario,
  results: readonly ReturnType<typeof summarizeTarget>[],
): void {
  const baseline = results.find(({ targetId }) => targetId === scenario.baselineTargetId);
  assert.ok(baseline, `${scenario.id} is missing its baseline result`);
  console.log(`\n${scenario.name}\n${scenario.question}`);
  console.table(
    results.map((result) => ({
      package: result.packageName,
      "vs baseline": relativeTime(result.medianMs, baseline.medianMs),
      "median (ms)": result.medianMs.toFixed(4),
      "p99 (ms)": result.p99Ms.toFixed(4),
      "measure calls": result.measureCalls,
      reads: result.readCount,
      samples: result.sampleCount,
      "max rme": `${result.maxRelativeMarginOfError.toFixed(2)}%`,
    })),
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
  const targets = scenario.targetIds.map(targetById);
  const workers: BenchmarkWorkerResult[] = [];
  if (scenario.mode === "process") {
    const processCount = Math.max(
      3,
      Math.round((scenario.processesPerTarget ?? 25) / profile.rounds),
    );
    for (const target of targets) workers.push(runColdStart(target, processCount * profile.rounds));
  } else {
    for (let round = 0; round < profile.rounds; round += 1) {
      const ordered = round % 2 === 0 ? targets : [...targets].reverse();
      for (const target of ordered) workers.push(runWorker(target, scenario, profile));
    }
  }

  assertOneEngineAgrees(scenario, workers);

  const results = targets.map((target) => {
    const own = workers.filter(({ targetId }) => target.id === targetId);
    assert.ok(own.length > 0, `${scenario.id}/${target.id} produced no result`);
    const rounds = own.map(({ result }) => result);
    if (scenario.mode !== "process") {
      assert.equal(rounds.length, profile.rounds, `${scenario.id}/${target.id} missed a round`);
    }
    assertPublicationStability(scenario, target, profile, rounds);
    return summarizeTarget(target, rounds, own[0].outcome);
  });
  printScenario(scenario, results);
  scenarioResults.push({
    id: scenario.id,
    name: scenario.name,
    question: scenario.question,
    description: scenario.description,
    transaction: scenario.transaction,
    parameters: scenario.parameters,
    baselineTargetId: scenario.baselineTargetId,
    targetIds: scenario.targetIds,
    results,
  });
}

const report = {
  schemaVersion: 3,
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
