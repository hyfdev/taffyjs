import { applicationShape, applicationTree } from "../fixtures/application-tree.ts";
import { buildTaffyTree, buildYogaTree, type BuiltTree, type Counter } from "../fixtures/build.ts";
import type { BenchmarkScenario, BenchmarkTransaction } from "../scenario.ts";

const size = 1200;
const spec = applicationTree(size);
const shape = applicationShape(size);
const allTargets = ["node", "wasm", "taffy-yoga", "taffy-yoga-wasm", "yoga-layout"] as const;

interface Dial {
  readonly suffix: string;
  readonly label: string;
  readonly fraction: number;
  readonly dirtyText: string;
}

const dials: readonly Dial[] = [
  { suffix: "one-leaf", label: "one text node", fraction: 0, dirtyText: "1" },
  { suffix: "one-tenth", label: "a tenth of the text nodes", fraction: 0.1, dirtyText: "10%" },
  { suffix: "every-leaf", label: "every text node", fraction: 1, dirtyText: "100%" },
];

function transaction(
  build: () => BuiltTree,
  counter: Counter,
  fraction: number,
): BenchmarkTransaction {
  const tree = build();
  tree.compute(spec.viewport.width, spec.viewport.height);
  tree.read("boxes");
  return {
    run() {
      counter.measureCalls = 0;
      tree.markDirtyLeaves(fraction);
      tree.compute(spec.viewport.width, spec.viewport.height);
      const { checksum, readCount } = tree.read("boxes");
      return { checksum, readCount, measureCalls: counter.measureCalls, nodeCount: tree.nodeCount };
    },
    dispose() {
      tree.dispose();
    },
  };
}

export const incrementalFrameScenarios: readonly BenchmarkScenario[] = dials.map((dial) => ({
  id: `incremental-frame-${dial.suffix}`,
  name: `Incremental frame: ${dial.label}`,
  question: `What does one frame cost when ${dial.label} changed on a tree that is already laid out?`,
  description:
    "An application screen stays in memory between frames. Each transaction dirties part of it, recomputes, and reads every box, the way a terminal UI or any persistent interface does on every commit.",
  transaction:
    "Mark the changed text nodes dirty, compute layout, and read left/top/width/height for every node. Building the tree and releasing it stay outside timing.",
  parameters: {
    nodeCount: shape.nodeCount,
    textNodeCount: shape.textCount,
    dirtyTextNodes: dial.dirtyText,
    maxDepth: shape.maxDepth,
    meanLeafDepth: shape.meanLeafDepth,
    viewportWidth: spec.viewport.width,
    viewportHeight: spec.viewport.height,
  },
  targetIds: allTargets,
  baselineTargetId: "yoga-layout",
  createTaffyTransaction(api) {
    const counter: Counter = { measureCalls: 0 };
    return transaction(() => buildTaffyTree(api, spec, counter), counter, dial.fraction);
  },
  createYogaTransaction(api) {
    const counter: Counter = { measureCalls: 0 };
    return transaction(() => buildYogaTree(api, spec, counter), counter, dial.fraction);
  },
}));
