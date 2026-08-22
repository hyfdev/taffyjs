import type { NodeId, StyleInput } from "@taffyjs/node";
import type { Node } from "@taffyjs/yoga";

import {
  createLayoutObservation,
  readTaffyLayouts,
  readYogaLayouts,
  type BenchmarkScenario,
} from "../scenario.ts";

const itemCount = 500;
const itemWidths = [40, 52, 64, 76] as const;

export const wideWrappingCollectionScenario: BenchmarkScenario = {
  id: "wide-wrapping-collection-500-items",
  name: "Wide wrapping collection: 500 items",
  question: "What does a complete layout transaction cost for one broad wrapping collection?",
  description:
    "A two-level Flexbox collection exercises broad child lists, wrapping, repeated style conversion, child attachment, layout reads, and resource release without random fixture generation.",
  transaction:
    "Create the public root and 500 items, apply styles, attach every item, calculate layout, read left/top/width/height for every node, and release resources when the API requires it.",
  parameters: {
    itemCount,
    nodeCount: itemCount + 1,
    depth: 2,
    viewportWidth: 1200,
  },
  createTaffyTransaction(api) {
    const rootStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Row,
      flexWrap: api.FlexWrap.Wrap,
      flexShrink: 0,
      size: { width: 1200 },
      padding: 4,
      gap: 2,
    };
    const itemStyles: readonly StyleInput[] = itemWidths.map((width, index) => ({
      display: api.Display.Flex,
      flexGrow: 1,
      flexShrink: 0,
      size: { width, height: 16 + index * 2 },
    }));
    const observation = createLayoutObservation(itemCount + 1);

    return {
      run() {
        const tree = new api.TaffyTree();
        tree.disableRounding();
        const items = Array.from({ length: itemCount }, (_, index) =>
          tree.newLeaf(itemStyles[index % itemStyles.length]),
        );
        const root = tree.newWithChildren(items, rootStyle);
        const nodes: readonly NodeId[] = [root, ...items];
        tree.computeLayout({
          root,
          availableSpace: { width: 1200, height: api.AvailableSpace.MaxContent },
        });
        return readTaffyLayouts(tree, nodes, observation);
      },
    };
  },
  createYogaTransaction(api) {
    const observation = createLayoutObservation(itemCount + 1);
    return {
      run() {
        const Yoga = api.default;
        const config = Yoga.Config.create();
        config.setPointScaleFactor(0);
        const root = Yoga.Node.createWithConfig(config);
        const nodes: Node[] = [root];
        root.setFlexDirection(api.FlexDirection.Row);
        root.setFlexWrap(api.Wrap.Wrap);
        root.setFlexShrink(0);
        root.setWidth(1200);
        root.setPadding(api.Edge.All, 4);
        root.setGap(api.Gutter.All, 2);

        for (let index = 0; index < itemCount; index += 1) {
          const item = Yoga.Node.createWithConfig(config);
          nodes.push(item);
          item.setWidth(itemWidths[index % itemWidths.length]);
          item.setHeight(16 + (index % itemWidths.length) * 2);
          item.setFlexGrow(1);
          item.setFlexShrink(0);
          root.insertChild(item, index);
        }

        try {
          root.calculateLayout(1200, undefined, api.Direction.LTR);
          return readYogaLayouts(nodes, observation);
        } finally {
          root.freeRecursive();
          Yoga.Config.destroy(config);
        }
      },
    };
  },
};
