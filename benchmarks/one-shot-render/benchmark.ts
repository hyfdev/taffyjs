import { applicationTree } from "../fixtures/application-tree.ts";
import { buildTaffyTree, buildYogaTree, type BuiltTree, type Counter } from "../fixtures/build.ts";
import { freezeText, measureShape, type TreeSpec } from "../fixtures/tree-spec.ts";
import type { BenchmarkScenario, BenchmarkTransaction } from "../scenario.ts";

/**
 * Build a screen from nothing, lay it out once, read the whole box model, release it.
 * The measured variant is the same tree and node count with its text sized through the
 * public measure callback rather than by a fixed size.
 */

const allTargets = ["node", "wasm", "taffy-yoga", "taffy-yoga-wasm", "yoga-layout"] as const;

const tiers = [
  { suffix: "small", label: "Small", size: 32 },
  { suffix: "medium", label: "Medium", size: 300 },
  { suffix: "large", label: "Large", size: 1200 },
] as const;

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
      const { checksum, readCount } = tree.read("full-box-model");
      const nodeCount = tree.nodeCount;
      tree.dispose();
      return { checksum, readCount, measureCalls: counter.measureCalls, nodeCount };
    },
  };
}

function renderScenario(
  id: string,
  name: string,
  question: string,
  description: string,
  spec: TreeSpec,
): BenchmarkScenario {
  const shape = measureShape(spec);
  return {
    id,
    name,
    question,
    description,
    transaction:
      "Create every node with its style, attach measure callbacks where the fixture has text, compute layout, read the complete box model for every node, and release the tree.",
    parameters: {
      nodeCount: shape.nodeCount,
      textNodeCount: shape.textCount,
      maxDepth: shape.maxDepth,
      meanLeafDepth: shape.meanLeafDepth,
      valuesReadPerNode: 16,
      viewportWidth: spec.viewport.width,
      viewportHeight: spec.viewport.height,
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
}

export const oneShotRenderScenarios: readonly BenchmarkScenario[] = tiers.map((tier) =>
  renderScenario(
    `one-shot-render-${tier.suffix}`,
    `One-shot render: ${tier.label.toLowerCase()} screen`,
    `What does building, laying out, reading and releasing a ${tier.label.toLowerCase()} screen cost?`,
    "Every text size is already known, so the transaction is node creation, style conversion, one layout pass, a complete box-model read, and teardown. This is the shape a document or image renderer repeats per page.",
    freezeText(applicationTree(tier.size)),
  ),
);

export const measuredRenderScenario: BenchmarkScenario = renderScenario(
  "measured-render-medium",
  "Measured render: medium screen",
  "What does the same render cost when text sizes come from a JavaScript callback?",
  "The medium one-shot render tree with its text sized through the public measure callback instead of fixed sizes. Node count and structure are unchanged, but measured text wraps, so this scenario carries both the callback crossings and the layout work that wrapping creates.",
  applicationTree(300),
);
