import type { Node } from "@taffyjs/yoga";

import { readYogaLayoutChecksum, type YogaBenchmarkScenario } from "../scenario.ts";

function createYogaDeepTreeScenario(leafCount: number): YogaBenchmarkScenario {
  const nodeCount = leafCount * 2 - 1;
  const depth = Math.log2(leafCount) + 1;

  return {
    id: `yoga-deep-tree-${nodeCount}-nodes`,
    name: `Yoga deep tree: ${nodeCount.toLocaleString("en-US")} nodes`,
    question: `How does a complete Yoga public transaction scale for a balanced binary tree with ${depth} levels?`,
    description:
      "A deterministic binary hierarchy alternates row and column Flexbox containers while exercising public Node creation, style setters, topology, output reads, and release.",
    transaction:
      "Create Config and Nodes, build every hierarchy level, calculate layout, read every computed layout, then release the tree and Config.",
    parameters: {
      leafCount,
      nodeCount,
      depth,
      branchingFactor: 2,
    },
    createTransaction(api) {
      return () => {
        const Yoga = api.default;
        const config = Yoga.Config.create();
        config.setPointScaleFactor(1);
        const nodes: Node[] = [];
        let level = Array.from({ length: leafCount }, () => {
          const node = Yoga.Node.createWithConfig(config);
          nodes.push(node);
          node.setWidth(10);
          node.setHeight(10);
          node.setFlexGrow(1);
          return node;
        });
        let levelIndex = 0;

        while (level.length > 1) {
          const nextLevel: Node[] = [];
          for (let index = 0; index < level.length; index += 2) {
            const node = Yoga.Node.createWithConfig(config);
            nodes.push(node);
            node.setFlexDirection(
              levelIndex % 2 === 0 ? api.FlexDirection.Row : api.FlexDirection.Column,
            );
            node.setFlexGrow(1);
            node.setMinWidth(0);
            node.setMinHeight(0);
            node.setPadding(api.Edge.All, 1);
            node.setGap(api.Gutter.All, 1);
            node.insertChild(level[index], 0);
            node.insertChild(level[index + 1], 1);
            nextLevel.push(node);
          }
          level = nextLevel;
          levelIndex += 1;
        }

        const root = level[0];
        root.setWidth(1200);
        root.setHeight(800);
        try {
          root.calculateLayout(1200, 800, api.Direction.LTR);
          return readYogaLayoutChecksum(nodes);
        } finally {
          root.freeRecursive();
          Yoga.Config.destroy(config);
        }
      };
    },
  };
}

export const yogaDeepTreeScenarios: readonly YogaBenchmarkScenario[] = [
  createYogaDeepTreeScenario(256),
];
