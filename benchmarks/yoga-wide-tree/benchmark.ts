import type { Node } from "@taffyjs/yoga";

import { readYogaLayoutChecksum, type YogaBenchmarkScenario } from "../scenario.ts";

function createYogaWideTreeScenario(leafCount: number): YogaBenchmarkScenario {
  return {
    id: `yoga-wide-tree-${leafCount}-leaves`,
    name: `Yoga wide tree: ${leafCount.toLocaleString("en-US")} leaves`,
    question: `How does a complete Yoga public transaction scale for a shallow root with ${leafCount.toLocaleString("en-US")} children?`,
    description:
      "A two-level wrapping Flexbox tree stresses public Yoga Node creation, style setters, child insertion, layout calculation, output reads, and release.",
    transaction:
      "Create Config and Nodes, apply styles, attach every leaf, calculate layout, read every computed layout, then release the tree and Config.",
    parameters: {
      leafCount,
      nodeCount: leafCount + 1,
      depth: 2,
    },
    createTransaction(api) {
      const leafWidths = [40, 52, 64, 76] as const;

      return () => {
        const Yoga = api.default;
        const config = Yoga.Config.create();
        config.setPointScaleFactor(1);
        const nodes: Node[] = [];
        const root = Yoga.Node.createWithConfig(config);
        nodes.push(root);
        root.setFlexDirection(api.FlexDirection.Row);
        root.setFlexWrap(api.Wrap.Wrap);
        root.setWidth(1200);
        root.setPadding(api.Edge.All, 4);
        root.setGap(api.Gutter.All, 2);

        for (let index = 0; index < leafCount; index += 1) {
          const leaf = Yoga.Node.createWithConfig(config);
          nodes.push(leaf);
          leaf.setWidth(leafWidths[index % leafWidths.length]);
          leaf.setHeight(16 + (index % leafWidths.length) * 2);
          leaf.setFlexGrow(1);
          root.insertChild(leaf, index);
        }

        try {
          root.calculateLayout(1200, undefined, api.Direction.LTR);
          return readYogaLayoutChecksum(nodes);
        } finally {
          root.freeRecursive();
          Yoga.Config.destroy(config);
        }
      };
    },
  };
}

export const yogaWideTreeScenarios: readonly YogaBenchmarkScenario[] = [
  createYogaWideTreeScenario(1_000),
];
