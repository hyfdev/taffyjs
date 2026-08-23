import assert from "node:assert/strict";

import { Bench } from "tinybench";

import type {
  BenchmarkScenario,
  BenchmarkTarget,
  BenchmarkTransaction,
  BenchmarkWorkerResult,
  TaffyApi,
  TransactionOutcome,
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
assert.ok(
  scenario.targetIds.includes(target.id),
  `${scenario.id} does not run ${target.packageName}`,
);

const importedApi: unknown = await import(target.packageName);

function createTransaction(
  scenario: BenchmarkScenario,
  target: BenchmarkTarget,
): BenchmarkTransaction {
  const transaction =
    target.apiKind === "taffy"
      ? scenario.createTaffyTransaction?.(importedApi as TaffyApi)
      : scenario.createYogaTransaction?.(importedApi as YogaApi);
  assert.ok(transaction, `${scenario.id} has no ${target.apiLabel} implementation`);
  return transaction;
}

/** Checks that this implementation completed the transaction and repeated it identically. */
function assertCompleted(
  scenario: BenchmarkScenario,
  target: BenchmarkTarget,
  first: TransactionOutcome,
  second: TransactionOutcome,
): void {
  const where = `${scenario.id}/${target.id}`;
  assert.ok(Number.isFinite(first.checksum), `${where} produced a non-finite layout`);
  assert.notEqual(first.checksum, 0, `${where} produced an empty layout`);
  assert.equal(
    first.nodeCount,
    scenario.parameters.nodeCount,
    `${where} laid out ${first.nodeCount} nodes, expected ${scenario.parameters.nodeCount}`,
  );
  assert.ok(first.readCount > 0, `${where} read no layout output`);
  assert.equal(second.checksum, first.checksum, `${where} is not deterministic between runs`);
  assert.equal(second.readCount, first.readCount, `${where} read a different amount twice`);
}

const validation = createTransaction(scenario, target);
let outcome: TransactionOutcome;
try {
  const first = validation.run();
  const second = validation.run();
  assertCompleted(scenario, target, first, second);
  outcome = second;
} finally {
  validation.dispose?.();
}

const transaction = createTransaction(scenario, target);
const bench = new Bench({ ...profile.settings, throws: true });
let blackhole = 0;
bench.add(target.id, () => {
  blackhole += transaction.run().checksum;
});

try {
  await bench.warmup();
  const garbageCollector = (globalThis as typeof globalThis & { gc?: () => void }).gc;
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

const sorted = [...task.result.samples].sort((left, right) => left - right);
const middle = Math.floor(sorted.length / 2);
const medianMs =
  sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];

const output: BenchmarkWorkerResult = {
  targetId: target.id,
  scenarioId: scenario.id,
  outcome,
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
