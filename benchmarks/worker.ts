import assert from "node:assert/strict";

import { Bench } from "tinybench";

import type {
  BenchmarkScenario,
  BenchmarkTransaction,
  BenchmarkWorkerResult,
  TaffyApi,
  YogaApi,
} from "./scenario.ts";
import { benchmarkProfiles, benchmarkScenarios, benchmarkTargets } from "./suite.ts";

const [targetId, scenarioId, profileId] = process.argv.slice(2);
const target = benchmarkTargets.find(({ id }) => id === targetId);
const scenario = benchmarkScenarios.find(({ id }) => id === scenarioId);
const profile = benchmarkProfiles.find(({ id }) => id === profileId);
assert.ok(target, `Unknown benchmark target ${targetId ?? "<missing>"}`);
assert.ok(scenario, `Unknown benchmark scenario ${scenarioId ?? "<missing>"}`);
assert.ok(profile, `Unknown benchmark profile ${profileId ?? "<missing>"}`);

const importedApi: unknown = await import(target.packageName);
const targetApiKind = target.apiKind;

function createTransaction(scenario: BenchmarkScenario): BenchmarkTransaction {
  if (targetApiKind === "taffy") {
    return scenario.createTaffyTransaction(importedApi as TaffyApi);
  }
  return scenario.createYogaTransaction(importedApi as YogaApi);
}

const validationTransaction = createTransaction(scenario);
const observations: number[][] = [];
try {
  const validationRuns = scenario.validationRuns ?? 1;
  for (let run = 0; run < validationRuns; run += 1) {
    const observation = Array.from(validationTransaction.run());
    assert.ok(observation.length > 0, `${scenario.id}/${target.id} returned no layout values`);
    assert.ok(
      observation.every(Number.isFinite),
      `${scenario.id}/${target.id} returned a non-finite layout value`,
    );
    observations.push(observation);
  }
} finally {
  validationTransaction.dispose?.();
}

const transaction = createTransaction(scenario);
const bench = new Bench({ ...profile.settings, throws: true });
let blackhole = 0;
bench.add(target.id, () => {
  const observation = transaction.run();
  blackhole = observation[0] + observation[observation.length - 1] + observation.length;
});

try {
  await bench.warmup();
  const garbageCollector = (
    globalThis as typeof globalThis & {
      gc?: () => void;
    }
  ).gc;
  assert.ok(garbageCollector, "Benchmark workers require --expose-gc");
  garbageCollector();
  await bench.run();
} finally {
  transaction.dispose?.();
}
assert.ok(Number.isFinite(blackhole), `${scenario.id}/${target.id} produced invalid output`);

const task = bench.tasks[0];
assert.ok(task?.result, `${scenario.id}/${target.id} did not produce a result`);
assert.equal(task.result.error, undefined, `${scenario.id}/${target.id} failed`);
assert.ok(task.result.samples.length > 0, `${scenario.id}/${target.id} produced no samples`);

const sortedSamples = [...task.result.samples].sort((left, right) => left - right);
const middle = Math.floor(sortedSamples.length / 2);
const medianMs =
  sortedSamples.length % 2 === 0
    ? (sortedSamples[middle - 1] + sortedSamples[middle]) / 2
    : sortedSamples[middle];
const output: BenchmarkWorkerResult = {
  targetId: target.id,
  scenarioId: scenario.id,
  observations,
  result: {
    hz: task.result.hz,
    meanMs: task.result.mean,
    medianMs,
    minMs: task.result.min,
    maxMs: task.result.max,
    p75Ms: task.result.p75,
    p99Ms: task.result.p99,
    relativeMarginOfError: task.result.rme,
    sampleCount: task.result.samples.length,
    samplesMs: task.result.samples,
  },
};

process.stdout.write(JSON.stringify(output));
