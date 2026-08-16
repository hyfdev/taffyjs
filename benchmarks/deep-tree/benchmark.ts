import type { NodeId, StyleInput } from "@taffyjs/node";

import { readLayoutChecksum, type TaffyBenchmarkScenario } from "../scenario.ts";

function createDeepTreeScenario(nodeCount: number): TaffyBenchmarkScenario {
  const leafCount = Math.floor((nodeCount + 1) / 2);
  const needsUnaryRoot = nodeCount % 2 === 0;
  const depth = Math.ceil(Math.log2(leafCount)) + 1 + (needsUnaryRoot ? 1 : 0);

  return {
    id: `deep-tree-${nodeCount}-nodes`,
    name: `Deep tree: ${nodeCount.toLocaleString("en-US")} nodes`,
    question: `How does the complete public transaction scale for a near-balanced hierarchy with ${depth} levels?`,
    description:
      "A deterministic hierarchy with at most two children per node alternates row and column Flexbox containers, exercising nested traversal without adding random-number generation to the measured work.",
    transaction:
      "Create all leaves and ancestors through TaffyTree, compute the layout, then read every unrounded layout snapshot.",
    parameters: {
      leafCount,
      nodeCount,
      depth,
      maximumBranchingFactor: 2,
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
          const style =
            level.length === 2 && !needsUnaryRoot ? rootStyle : containerStyles[levelIndex % 2];
          for (let index = 0; index < level.length; index += 2) {
            const left = level[index];
            const right = level[index + 1];
            if (right === undefined) {
              nextLevel.push(left);
              continue;
            }
            const node = tree.newWithChildren(style, [left, right]);
            nodes.push(node);
            nextLevel.push(node);
          }
          level = nextLevel;
          levelIndex += 1;
        }

        const root = needsUnaryRoot ? tree.newWithChildren(rootStyle, [level[0]]) : level[0];
        if (needsUnaryRoot) {
          nodes.push(root);
        }
        tree.computeLayout({ root, availableSpace: { width: 1200, height: 800 } });
        return readLayoutChecksum(tree, nodes);
      };
    },
  };
}

export const deepTreeScenarios: readonly TaffyBenchmarkScenario[] = [createDeepTreeScenario(500)];
