import assert from "node:assert/strict";

import { Bench } from "tinybench";

import type {
  BenchmarkScenarioMetadata,
  BenchmarkWorkerResult,
  TaffyApi,
  YogaApi,
} from "./scenario.ts";
import { benchmarkComparisonGroups, benchmarkProfiles } from "./suite.ts";

const [groupId, targetId, scenarioId, profileId] = process.argv.slice(2);
const group = benchmarkComparisonGroups.find(({ id }) => id === groupId);
const profile = benchmarkProfiles.find(({ id }) => id === profileId);
assert.ok(group, `Unknown benchmark comparison group ${groupId ?? "<missing>"}`);
const target = group.targets.find(({ id }) => id === targetId);
assert.ok(target, `Unknown benchmark target ${targetId ?? "<missing>"}`);
assert.ok(profile, `Unknown benchmark profile ${profileId ?? "<missing>"}`);

const importedApi: unknown = await import(target.packageName);
let scenario: BenchmarkScenarioMetadata;
let createTransaction: () => () => number;
if (group.id === "taffy-api") {
  const typedScenario = group.scenarios.find(({ id }) => id === scenarioId);
  assert.ok(typedScenario, `Unknown benchmark scenario ${scenarioId ?? "<missing>"}`);
  const api = importedApi as TaffyApi;
  scenario = typedScenario;
  createTransaction = () => typedScenario.createTransaction(api);
} else {
  const typedScenario = group.scenarios.find(({ id }) => id === scenarioId);
  assert.ok(typedScenario, `Unknown benchmark scenario ${scenarioId ?? "<missing>"}`);
  const api = importedApi as YogaApi;
  scenario = typedScenario;
  createTransaction = () => typedScenario.createTransaction(api);
}

const checksum = createTransaction()();
assert.ok(Number.isFinite(checksum), `${scenario.id}/${target.id} returned a non-finite checksum`);

const transaction = createTransaction();
const bench = new Bench({ ...profile.settings, throws: true });
let blackhole = 0;
bench.add(target.id, () => {
  blackhole = transaction();
});

await bench.warmup();
const garbageCollector = (
  globalThis as typeof globalThis & {
    gc?: () => void;
  }
).gc;
assert.ok(garbageCollector, "Benchmark workers require --expose-gc");
garbageCollector();
await bench.run();
assert.ok(Number.isFinite(blackhole), `${scenario.id}/${target.id} produced a non-finite checksum`);

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
  groupId: group.id,
  targetId: target.id,
  scenarioId: scenario.id,
  checksum,
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
