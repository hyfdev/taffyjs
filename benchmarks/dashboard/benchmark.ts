import { buildTaffyTree, buildYogaTree, type BuiltTree, type Counter } from "../fixtures/build.ts";
import { dashboardFlex, dashboardGrid } from "../fixtures/dashboard.ts";
import { measureShape, type TreeSpec } from "../fixtures/tree-spec.ts";
import type { BenchmarkScenario, BenchmarkTransaction } from "../scenario.ts";

/**
 * One dashboard reached two ways. The Grid form needs no row containers, so the pair
 * answers what expressing a grid as a grid costs against the nested-flex emulation a
 * Yoga user writes today.
 */

function transaction(
  build: () => BuiltTree,
  counter: Counter,
  spec: TreeSpec,
): BenchmarkTransaction {
  return {
    run() {
      counter.measureCalls = 0;
      const tree = build();
      tree.compute(spec.viewport.width, spec.viewport.height);
      const { checksum, readCount } = tree.read("boxes");
      const nodeCount = tree.nodeCount;
      tree.dispose();
      return { checksum, readCount, measureCalls: counter.measureCalls, nodeCount };
    },
  };
}

const gridSpec = dashboardGrid();
const flexSpec = dashboardFlex();
const gridShape = measureShape(gridSpec);
const flexShape = measureShape(flexSpec);

const sharedTransaction =
  "Create every node with its style, compute layout, read left/top/width/height for every node, and release the tree.";

export const dashboardGridScenario: BenchmarkScenario = {
  id: "dashboard-grid",
  name: "Dashboard: CSS Grid",
  question: "What does a twelve-column dashboard cost when it is written as a Grid?",
  description:
    "Twenty-four cards placed by column span in one Grid container. Yoga has no Grid, so this scenario runs only the packages that do and takes @taffyjs/node as its reference.",
  transaction: sharedTransaction,
  parameters: {
    nodeCount: gridShape.nodeCount,
    cardCount: 24,
    columns: 12,
    maxDepth: gridShape.maxDepth,
    viewportWidth: gridSpec.viewport.width,
    viewportHeight: gridSpec.viewport.height,
  },
  targetIds: ["node", "wasm"],
  baselineTargetId: "node",
  createTaffyTransaction(api) {
    const counter: Counter = { measureCalls: 0 };
    return transaction(() => buildTaffyTree(api, gridSpec, counter), counter, gridSpec);
  },
};

export const dashboardFlexScenario: BenchmarkScenario = {
  id: "dashboard-flex-emulation",
  name: "Dashboard: nested flex",
  question: "What does the same dashboard cost when it is emulated in nested flexbox?",
  description:
    "The same twenty-four cards and the same picture, built the way a Yoga user has to build it: rows of percentage-width columns. It needs its own row containers, which is why its node count is higher.",
  transaction: sharedTransaction,
  parameters: {
    nodeCount: flexShape.nodeCount,
    cardCount: 24,
    maxDepth: flexShape.maxDepth,
    viewportWidth: flexSpec.viewport.width,
    viewportHeight: flexSpec.viewport.height,
  },
  targetIds: ["node", "wasm", "taffy-yoga", "taffy-yoga-wasm", "yoga-layout"],
  baselineTargetId: "yoga-layout",
  createTaffyTransaction(api) {
    const counter: Counter = { measureCalls: 0 };
    return transaction(() => buildTaffyTree(api, flexSpec, counter), counter, flexSpec);
  },
  createYogaTransaction(api) {
    const counter: Counter = { measureCalls: 0 };
    return transaction(() => buildYogaTree(api, flexSpec, counter), counter, flexSpec);
  },
};
