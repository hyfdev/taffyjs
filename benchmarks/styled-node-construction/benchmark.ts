import type { NodeId, StyleInput } from "@taffyjs/node";
import type { Node } from "@taffyjs/yoga";

import {
  createLayoutObservation,
  readTaffyLayouts,
  readYogaLayouts,
  type BenchmarkScenario,
} from "../scenario.ts";

const leafCount = 500;
const viewportWidth = 1200;
const leafWidth = 120;
const leafHeight = 40;

export const styledNodeConstructionScenario: BenchmarkScenario = {
  id: "styled-node-construction-500-leaves",
  name: "Styled node construction: 500 leaves",
  question: "What does creating many nodes from one reused multi-field Style cost?",
  description:
    "One Style value carrying fifteen fields is applied to every leaf, so the transaction is dominated by public Style input conversion and node creation rather than by tree shape or layout work.",
  transaction:
    "Create the public root and 500 leaves from one shared Style value, attach every leaf, calculate layout, read left/top/width/height for every node, and release resources when the API requires it.",
  parameters: {
    leafCount,
    nodeCount: leafCount + 1,
    styleFieldCount: 15,
    viewportWidth,
  },
  createTaffyTransaction(api) {
    const rootStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Row,
      flexWrap: api.FlexWrap.Wrap,
      size: { width: viewportWidth },
    };
    const leafStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Column,
      position: api.Position.Relative,
      size: { width: leafWidth, height: leafHeight },
      minSize: { width: 40 },
      maxSize: { width: 240 },
      margin: 2,
      padding: 3,
      border: 1,
      alignItems: api.AlignItems.Center,
      justifyContent: api.AlignContent.FlexStart,
      gap: 2,
      flexBasis: leafWidth,
      flexGrow: 0,
      flexShrink: 0,
    };
    const observation = createLayoutObservation(leafCount + 1);

    return {
      run() {
        const tree = new api.TaffyTree();
        tree.disableRounding();
        const leaves = Array.from({ length: leafCount }, () => tree.newLeaf(leafStyle));
        const root = tree.newWithChildren(leaves, rootStyle);
        const nodes: readonly NodeId[] = [root, ...leaves];
        tree.computeLayout({
          root,
          availableSpace: { width: viewportWidth, height: api.AvailableSpace.MaxContent },
        });
        return readTaffyLayouts(tree, nodes, observation);
      },
    };
  },
  createYogaTransaction(api) {
    const observation = createLayoutObservation(leafCount + 1);
    return {
      run() {
        const Yoga = api.default;
        const config = Yoga.Config.create();
        config.setPointScaleFactor(0);
        const root = Yoga.Node.createWithConfig(config);
        const nodes: Node[] = [root];
        root.setFlexDirection(api.FlexDirection.Row);
        root.setFlexWrap(api.Wrap.Wrap);
        root.setWidth(viewportWidth);

        for (let index = 0; index < leafCount; index += 1) {
          const leaf = Yoga.Node.createWithConfig(config);
          nodes.push(leaf);
          leaf.setFlexDirection(api.FlexDirection.Column);
          leaf.setPositionType(api.PositionType.Relative);
          leaf.setWidth(leafWidth);
          leaf.setHeight(leafHeight);
          leaf.setMinWidth(40);
          leaf.setMaxWidth(240);
          leaf.setMargin(api.Edge.All, 2);
          leaf.setPadding(api.Edge.All, 3);
          leaf.setBorder(api.Edge.All, 1);
          leaf.setAlignItems(api.Align.Center);
          leaf.setJustifyContent(api.Justify.FlexStart);
          leaf.setGap(api.Gutter.All, 2);
          leaf.setFlexBasis(leafWidth);
          leaf.setFlexGrow(0);
          leaf.setFlexShrink(0);
          root.insertChild(leaf, index);
        }

        try {
          root.calculateLayout(viewportWidth, undefined, api.Direction.LTR);
          return readYogaLayouts(nodes, observation);
        } finally {
          root.freeRecursive();
          Yoga.Config.destroy(config);
        }
      },
    };
  },
};
