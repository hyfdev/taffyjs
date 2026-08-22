import type { NodeId, StyleInput } from "@taffyjs/node";
import type { Node } from "@taffyjs/yoga";

import {
  createLayoutObservation,
  readTaffyLayouts,
  readYogaLayouts,
  type BenchmarkScenario,
} from "../scenario.ts";

interface NestedTreeShape {
  readonly nodeCount: number;
  readonly leafCount: number;
  readonly depth: number;
  readonly needsUnaryRoot: boolean;
}

function createNestedTreeShape(nodeCount: number): NestedTreeShape {
  const leafCount = Math.floor((nodeCount + 1) / 2);
  const needsUnaryRoot = nodeCount % 2 === 0;
  return {
    nodeCount,
    leafCount,
    depth: Math.ceil(Math.log2(leafCount)) + 1 + (needsUnaryRoot ? 1 : 0),
    needsUnaryRoot,
  };
}

function createNestedUiScenario(nodeCount: number, name: string): BenchmarkScenario {
  const shape = createNestedTreeShape(nodeCount);
  return {
    id: `nested-ui-${nodeCount}-nodes`,
    name,
    question: `What does a complete ${nodeCount.toLocaleString("en-US")}-node nested layout transaction cost?`,
    description:
      "A deterministic near-balanced hierarchy alternates row and column Flexbox containers. It represents nested application UI while keeping the topology identical for every package and API.",
    transaction:
      "Create the public tree, apply styles, attach every child, calculate layout, read left/top/width/height for every node, and release resources when the API requires it.",
    parameters: {
      nodeCount,
      leafCount: shape.leafCount,
      depth: shape.depth,
      maximumBranchingFactor: 2,
      viewportWidth: 1200,
      viewportHeight: 800,
    },
    createTaffyTransaction(api) {
      const leafStyle: StyleInput = {
        display: api.Display.Flex,
        flexGrow: 1,
        flexShrink: 0,
        size: { width: 10, height: 10 },
      };
      const containerStyles: readonly StyleInput[] = [
        {
          display: api.Display.Flex,
          flexDirection: api.FlexDirection.Row,
          flexGrow: 1,
          flexShrink: 0,
          minSize: { width: 0, height: 0 },
          padding: 1,
          gap: 1,
        },
        {
          display: api.Display.Flex,
          flexDirection: api.FlexDirection.Column,
          flexGrow: 1,
          flexShrink: 0,
          minSize: { width: 0, height: 0 },
          padding: 1,
          gap: 1,
        },
      ];
      const rootStyle: StyleInput = {
        ...containerStyles[(shape.depth - 1) % containerStyles.length],
        size: { width: 1200, height: 800 },
      };
      const observation = createLayoutObservation(shape.nodeCount);

      return {
        run() {
          const tree = new api.TaffyTree();
          tree.disableRounding();
          const nodes: NodeId[] = [];
          let level = Array.from({ length: shape.leafCount }, () => {
            const node = tree.newLeaf(leafStyle);
            nodes.push(node);
            return node;
          });
          let levelIndex = 0;

          while (level.length > 1) {
            const nextLevel: NodeId[] = [];
            const style =
              level.length === 2 && !shape.needsUnaryRoot
                ? rootStyle
                : containerStyles[levelIndex % containerStyles.length];
            for (let index = 0; index < level.length; index += 2) {
              const left = level[index];
              const right = level[index + 1];
              if (right === undefined) {
                nextLevel.push(left);
                continue;
              }
              const node = tree.newWithChildren([left, right], style);
              nodes.push(node);
              nextLevel.push(node);
            }
            level = nextLevel;
            levelIndex += 1;
          }

          const root = shape.needsUnaryRoot
            ? tree.newWithChildren([level[0]], rootStyle)
            : level[0];
          if (shape.needsUnaryRoot) nodes.push(root);
          tree.computeLayout({ root, availableSpace: { width: 1200, height: 800 } });
          return readTaffyLayouts(tree, nodes, observation);
        },
      };
    },
    createYogaTransaction(api) {
      const observation = createLayoutObservation(shape.nodeCount);
      return {
        run() {
          const Yoga = api.default;
          const config = Yoga.Config.create();
          config.setPointScaleFactor(0);
          const nodes: Node[] = [];
          let level = Array.from({ length: shape.leafCount }, () => {
            const node = Yoga.Node.createWithConfig(config);
            nodes.push(node);
            node.setWidth(10);
            node.setHeight(10);
            node.setFlexGrow(1);
            node.setFlexShrink(0);
            return node;
          });
          let levelIndex = 0;

          while (level.length > 1) {
            const nextLevel: Node[] = [];
            const isRootLevel = level.length === 2 && !shape.needsUnaryRoot;
            const styleIndex = isRootLevel ? shape.depth - 1 : levelIndex;
            for (let index = 0; index < level.length; index += 2) {
              const left = level[index];
              const right = level[index + 1];
              if (right === undefined) {
                nextLevel.push(left);
                continue;
              }
              const node = Yoga.Node.createWithConfig(config);
              nodes.push(node);
              configureYogaContainer(api, node, styleIndex);
              if (isRootLevel) {
                node.setWidth(1200);
                node.setHeight(800);
              }
              node.insertChild(left, 0);
              node.insertChild(right, 1);
              nextLevel.push(node);
            }
            level = nextLevel;
            levelIndex += 1;
          }

          let root = level[0];
          if (shape.needsUnaryRoot) {
            root = Yoga.Node.createWithConfig(config);
            nodes.push(root);
            configureYogaContainer(api, root, shape.depth - 1);
            root.setWidth(1200);
            root.setHeight(800);
            root.insertChild(level[0], 0);
          }

          try {
            root.calculateLayout(1200, 800, api.Direction.LTR);
            return readYogaLayouts(nodes, observation);
          } finally {
            root.freeRecursive();
            Yoga.Config.destroy(config);
          }
        },
      };
    },
  };
}

function configureYogaContainer(
  api: Parameters<BenchmarkScenario["createYogaTransaction"]>[0],
  node: Node,
  levelIndex: number,
): void {
  node.setFlexDirection(levelIndex % 2 === 0 ? api.FlexDirection.Row : api.FlexDirection.Column);
  node.setFlexGrow(1);
  node.setFlexShrink(0);
  node.setMinWidth(0);
  node.setMinHeight(0);
  node.setPadding(api.Edge.All, 1);
  node.setGap(api.Gutter.All, 1);
}

export const nestedUiScenarios: readonly BenchmarkScenario[] = [
  createNestedUiScenario(50, "Small nested UI: 50 nodes"),
  createNestedUiScenario(500, "Nested UI: 500 nodes"),
];
