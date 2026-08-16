import type { NodeId, StyleInput } from "@taffyjs/node";

import { readLayoutChecksum, type TaffyBenchmarkScenario } from "../scenario.ts";

function createDeepTreeScenario(leafCount: number): TaffyBenchmarkScenario {
  const nodeCount = leafCount * 2 - 1;
  const depth = Math.log2(leafCount) + 1;

  return {
    id: `deep-tree-${nodeCount}-nodes`,
    name: `Deep tree: ${nodeCount.toLocaleString("en-US")} nodes`,
    question: `How does the complete public transaction scale for a balanced binary tree with ${depth} levels?`,
    description:
      "A deterministic binary hierarchy alternates row and column Flexbox containers, exercising nested traversal without adding random-number generation to the measured work.",
    transaction:
      "Create all leaves and ancestors through TaffyTree, compute the layout, then read every unrounded layout snapshot.",
    parameters: {
      leafCount,
      nodeCount,
      depth,
      branchingFactor: 2,
    },
    createTransaction(api) {
      const leafStyle: StyleInput = {
        flexGrow: 1,
        size: { width: 10, height: 10 },
      };
      const containerStyles: readonly StyleInput[] = [
        {
          display: api.Display.Flex,
          flexDirection: api.FlexDirection.Row,
          flexGrow: 1,
          minSize: { width: 0, height: 0 },
          padding: 1,
          gap: 1,
        },
        {
          display: api.Display.Flex,
          flexDirection: api.FlexDirection.Column,
          flexGrow: 1,
          minSize: { width: 0, height: 0 },
          padding: 1,
          gap: 1,
        },
      ];
      const rootStyle: StyleInput = {
        ...containerStyles[(depth - 1) % containerStyles.length],
        size: { width: 1200, height: 800 },
      };

      return () => {
        const tree = new api.TaffyTree();
        const nodes: NodeId[] = [];
        let level = Array.from({ length: leafCount }, () => {
          const node = tree.newLeaf(leafStyle);
          nodes.push(node);
          return node;
        });
        let levelIndex = 0;

        while (level.length > 1) {
          const nextLevel: NodeId[] = [];
          const style = level.length === 2 ? rootStyle : containerStyles[levelIndex % 2];
          for (let index = 0; index < level.length; index += 2) {
            const node = tree.newWithChildren(style, [level[index], level[index + 1]]);
            nodes.push(node);
            nextLevel.push(node);
          }
          level = nextLevel;
          levelIndex += 1;
        }

        const root = level[0];
        tree.computeLayout({ root, availableSpace: { width: 1200, height: 800 } });
        return readLayoutChecksum(tree, nodes);
      };
    },
  };
}

export const deepTreeScenarios: readonly TaffyBenchmarkScenario[] = [
  createDeepTreeScenario(256),
  createDeepTreeScenario(512),
];
