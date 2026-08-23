import { applicationShape } from "../fixtures/application-tree.ts";
import type { BenchmarkScenario } from "../scenario.ts";

/**
 * A process that lays out once and exits. Measured as one whole process per sample,
 * starting before the package is imported, because module load and runtime
 * instantiation are the whole cost for a CLI invocation or a cold function.
 */

const shape = applicationShape(32);

export const coldStartScenario: BenchmarkScenario = {
  id: "cold-start",
  name: "Cold start to first layout",
  question: "What does the first layout in a fresh process cost, before anything is warm?",
  description:
    "A new Node process imports the package, builds a small screen, lays it out once, reads every box, and exits. Nothing is warmed and nothing is amortised, so module load and runtime instantiation are inside the number.",
  transaction:
    "In a fresh process, with the harness already loaded: import the package, build the tree, compute layout, and read left/top/width/height for every node. One process is one sample, so nothing is warm and nothing is amortised.",
  parameters: {
    nodeCount: shape.nodeCount,
    textNodeCount: shape.textCount,
    maxDepth: shape.maxDepth,
    processesPerTarget: 25,
  },
  targetIds: ["node", "wasm", "taffy-yoga", "taffy-yoga-wasm", "yoga-layout"],
  baselineTargetId: "yoga-layout",
  mode: "process",
};
