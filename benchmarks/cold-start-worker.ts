import assert from "node:assert/strict";

// Harness modules load before the clock starts, so the sample carries the package's
// own import, runtime instantiation, and first layout — not the benchmark's own load.
import { applicationTree } from "./fixtures/application-tree.ts";
import { buildTaffyTree, buildYogaTree, type Counter } from "./fixtures/build.ts";
import type { TaffyApi, TransactionOutcome, YogaApi } from "./scenario.ts";
import { benchmarkTargets } from "./suite.ts";

const [targetId] = process.argv.slice(2);
const target = benchmarkTargets.find(({ id }) => id === targetId);
assert.ok(target, `Unknown benchmark target ${targetId ?? "<missing>"}`);

const spec = applicationTree(32);
const counter: Counter = { measureCalls: 0 };

const started = performance.now();
const importedApi: unknown = await import(target.packageName);
const tree =
  target.apiKind === "taffy"
    ? buildTaffyTree(importedApi as TaffyApi, spec, counter)
    : buildYogaTree(importedApi as YogaApi, spec, counter);
tree.compute(spec.viewport.width, spec.viewport.height);
const { checksum, readCount } = tree.read("boxes");
const elapsed = performance.now() - started;

const outcome: TransactionOutcome = {
  checksum,
  readCount,
  measureCalls: counter.measureCalls,
  nodeCount: tree.nodeCount,
};
assert.ok(Number.isFinite(checksum) && checksum !== 0, `${target.id} produced an empty layout`);

process.stdout.write(JSON.stringify({ targetId: target.id, elapsed, outcome }));
