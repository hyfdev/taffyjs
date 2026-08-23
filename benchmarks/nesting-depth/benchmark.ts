import { buildTaffyTree, buildYogaTree, type BuiltTree, type Counter } from "../fixtures/build.ts";
import { measureShape, type NodeSpec, type TreeSpec } from "../fixtures/tree-spec.ts";
import type { BenchmarkScenario, BenchmarkTransaction } from "../scenario.ts";

/**
 * The same node budget arranged shallow or deep. Wrapper columns carry no explicit
 * width, so their cross size comes from the parent — the ordinary result of writing
 * a column inside a column, and the shape production trees are full of.
 */

const nodeBudget = 200;
const viewport = { width: 1280, height: 800 } as const;
const allTargets = ["node", "wasm", "taffy-yoga", "taffy-yoga-wasm", "yoga-layout"] as const;
const depths = [2, 6, 10] as const;

function nestedTree(depth: number): TreeSpec {
  const perRow = depth + 3;
  const rowCount = Math.max(1, Math.round((nodeBudget - 2) / perRow));
  const rows = Array.from({ length: rowCount }, (): NodeSpec => {
    let node: NodeSpec = {
      style: { direction: "row", shrink: 0, gap: 10 },
      children: [{ style: { width: 100, height: 20 } }, { style: { width: 120, height: 20 } }],
    };
    for (let level = 0; level < depth; level += 1) {
      node = { style: { direction: "column", shrink: 0 }, children: [node] };
    }
    return node;
  });
  return {
    root: {
      style: { direction: "column", width: viewport.width, height: viewport.height },
      children: [{ style: { direction: "column", grow: 1, minHeight: 0, gap: 8 }, children: rows }],
    },
    viewport,
  };
}

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

export const nestingDepthScenarios: readonly BenchmarkScenario[] = depths.map((depth) => {
  const spec = nestedTree(depth);
  const shape = measureShape(spec);
  return {
    id: `nesting-depth-${depth}`,
    name: `Nesting depth: ${depth} wrapper levels`,
    question: `What does the same screen cost when its content sits ${depth} wrapper levels deep?`,
    description:
      "One node budget, rearranged. Each row of content is wrapped in a chain of column containers whose width comes from the parent rather than an explicit value, which is what writing a column inside a column produces.",
    transaction:
      "Create every node with its style, compute layout, read left/top/width/height for every node, and release the tree.",
    parameters: {
      nodeCount: shape.nodeCount,
      wrapperLevels: depth,
      maxDepth: shape.maxDepth,
      meanLeafDepth: shape.meanLeafDepth,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
    },
    targetIds: allTargets,
    baselineTargetId: "yoga-layout",
    createTaffyTransaction(api) {
      const counter: Counter = { measureCalls: 0 };
      return transaction(() => buildTaffyTree(api, spec, counter), counter, spec);
    },
    createYogaTransaction(api) {
      const counter: Counter = { measureCalls: 0 };
      return transaction(() => buildYogaTree(api, spec, counter), counter, spec);
    },
  };
});
