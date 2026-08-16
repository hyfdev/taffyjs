import assert from "node:assert/strict";

import { Bench } from "tinybench";

import type { BenchmarkWorkerResult, TaffyApi } from "./scenario.ts";
import { benchmarkProfiles, taffyScenarios, taffyTargets } from "./suite.ts";

const [targetId, scenarioId, profileId] = process.argv.slice(2);
const target = taffyTargets.find(({ id }) => id === targetId);
const scenario = taffyScenarios.find(({ id }) => id === scenarioId);
const profile = benchmarkProfiles.find(({ id }) => id === profileId);
assert.ok(target, `Unknown benchmark target ${targetId ?? "<missing>"}`);
assert.ok(scenario, `Unknown benchmark scenario ${scenarioId ?? "<missing>"}`);
assert.ok(profile, `Unknown benchmark profile ${profileId ?? "<missing>"}`);

const api = (await import(target.packageName)) as TaffyApi;
const checksum = scenario.createTransaction(api)();
assert.ok(Number.isFinite(checksum), `${scenario.id}/${target.id} returned a non-finite checksum`);

const transaction = scenario.createTransaction(api);
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
