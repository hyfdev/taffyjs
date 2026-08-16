import type { NodeId, StyleInput } from "@taffyjs/node";

import { readLayoutChecksum, type TaffyBenchmarkScenario } from "../scenario.ts";

function createWideTreeScenario(leafCount: number): TaffyBenchmarkScenario {
  return {
    id: `wide-tree-${leafCount}-leaves`,
    name: `Wide tree: ${leafCount.toLocaleString("en-US")} leaves`,
    question: `How does the complete public transaction scale for a shallow root with ${leafCount.toLocaleString("en-US")} children?`,
    description:
      "A two-level wrapping Flexbox tree stresses broad child lists and repeated public style conversion without introducing random fixture generation.",
    transaction:
      "Create every leaf and the root through TaffyTree, compute the layout, then read every unrounded layout snapshot.",
    parameters: {
      leafCount,
      nodeCount: leafCount + 1,
      depth: 2,
    },
    createTransaction(api) {
      const rootStyle: StyleInput = {
        display: api.Display.Flex,
        flexDirection: api.FlexDirection.Row,
        flexWrap: api.FlexWrap.Wrap,
        size: { width: 1200 },
        padding: 4,
        gap: 2,
      };
      const leafStyles: readonly StyleInput[] = [
        { size: { width: 40, height: 16 }, flexGrow: 1 },
        { size: { width: 52, height: 18 }, flexGrow: 1 },
        { size: { width: 64, height: 20 }, flexGrow: 1 },
        { size: { width: 76, height: 22 }, flexGrow: 1 },
      ];

      return () => {
        const tree = new api.TaffyTree();
        const nodes: NodeId[] = [];
        const children = Array.from({ length: leafCount }, (_, index) => {
          const node = tree.newLeaf(leafStyles[index % leafStyles.length]);
          nodes.push(node);
          return node;
        });
        const root = tree.newWithChildren(rootStyle, children);
        nodes.push(root);
        tree.computeLayout({
          root,
          availableSpace: { width: 1200, height: api.AvailableSpace.MaxContent },
        });
        return readLayoutChecksum(tree, nodes);
      };
    },
  };
}

export const wideTreeScenarios: readonly TaffyBenchmarkScenario[] = [
  createWideTreeScenario(1_000),
  createWideTreeScenario(10_000),
];
