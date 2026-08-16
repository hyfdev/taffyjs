import type { Node } from "@taffyjs/yoga";

import { readYogaLayoutChecksum, type YogaApi, type YogaBenchmarkScenario } from "../scenario.ts";

type Yoga = YogaApi["default"];

const sessionCount = 18;
const messageCount = 32;

export const yogaCodingAgentChatScenario: YogaBenchmarkScenario = {
  id: "yoga-coding-agent-chat-initial-layout",
  name: "Yoga coding-agent chat: initial layout",
  question:
    "How long does a Yoga consumer take to build, measure, lay out, read, and release a modeled coding-agent screen?",
  description:
    "A fixed desktop chat model contains a session sidebar, measured labels, a message transcript, and a composer. All targets execute the same public Yoga API calls.",
  transaction:
    "Create Config and Nodes, apply styles and constant intrinsic-size callbacks, build the tree, calculate layout, read every computed layout, then release the tree and Config.",
  parameters: {
    viewportWidth: 1280,
    viewportHeight: 800,
    sessionCount,
    messageCount,
  },
  createTransaction(api) {
    const sessionContexts = Array.from({ length: sessionCount }, (_, index) => ({
      characters: 14 + ((index * 7) % 24),
      lineHeight: 16,
    }));
    const messageContexts = Array.from({ length: messageCount }, (_, index) => ({
      characters: 56 + ((index * 37) % 280),
      lineHeight: 18,
    }));

    return () => {
      const Yoga: Yoga = api.default;
      const config = Yoga.Config.create();
      config.setPointScaleFactor(1);
      const nodes: Node[] = [];
      const createNode = (configure?: (node: Node) => void): Node => {
        const node = Yoga.Node.createWithConfig(config);
        nodes.push(node);
        configure?.(node);
        return node;
      };
      const parent = (configure: (node: Node) => void, children: readonly Node[]): Node => {
        const node = createNode(configure);
        for (const [index, child] of children.entries()) node.insertChild(child, index);
        return node;
      };
      const fixedLeaf = (width: number, height: number): Node =>
        createNode((node) => {
          node.setWidth(width);
          node.setHeight(height);
        });
      const measuredLeaf = (characters: number, lineHeight: number): Node =>
        createNode((node) => {
          node.setFlexShrink(1);
          node.setMinWidth(0);
          node.setMeasureFunc(() => {
            const naturalWidth = Math.max(8, characters * 7);
            const width = Math.min(naturalWidth, 280);
            return {
              width,
              height: Math.max(1, Math.ceil(naturalWidth / width)) * lineHeight,
            };
          });
        });

      const sessions = sessionContexts.map((context) =>
        parent(
          (node) => {
            node.setFlexDirection(api.FlexDirection.Row);
            node.setHeight(32);
            node.setPadding(api.Edge.Horizontal, 8);
            node.setGap(api.Gutter.All, 6);
          },
          [measuredLeaf(context.characters, context.lineHeight), fixedLeaf(18, 18)],
        ),
      );
      const sidebar = parent((node) => {
        node.setWidth(264);
        node.setPadding(api.Edge.All, 12);
        node.setGap(api.Gutter.All, 8);
      }, sessions);

      const messages = messageContexts.map((context, index) => {
        const actions = parent(
          (node) => {
            node.setFlexDirection(api.FlexDirection.Row);
            node.setHeight(20);
            node.setGap(api.Gutter.All, 6);
          },
          [fixedLeaf(42 + (index % 3) * 8, 20), fixedLeaf(52, 20)],
        );
        const body = parent(
          (node) => {
            node.setFlexGrow(1);
            node.setMinWidth(0);
            node.setGap(api.Gutter.All, 6);
          },
          [measuredLeaf(context.characters, context.lineHeight), actions],
        );
        return parent(
          (node) => {
            node.setFlexDirection(api.FlexDirection.Row);
            node.setGap(api.Gutter.All, 10);
          },
          [fixedLeaf(32, 32), body],
        );
      });
      const transcript = parent((node) => {
        node.setFlexGrow(1);
        node.setMinHeight(0);
        node.setGap(api.Gutter.All, 12);
      }, messages);
      const composer = parent(
        (node) => {
          node.setFlexDirection(api.FlexDirection.Row);
          node.setHeight(72);
          node.setPadding(api.Edge.All, 12);
          node.setGap(api.Gutter.All, 8);
        },
        [measuredLeaf(24, 18), fixedLeaf(72, 40)],
      );
      const main = parent(
        (node) => {
          node.setFlexGrow(1);
          node.setMinWidth(0);
          node.setPadding(api.Edge.All, 16);
          node.setGap(api.Gutter.All, 12);
        },
        [transcript, composer],
      );
      const root = parent(
        (node) => {
          node.setFlexDirection(api.FlexDirection.Row);
          node.setWidth(1280);
          node.setHeight(800);
        },
        [sidebar, main],
      );

      try {
        root.calculateLayout(1280, 800, api.Direction.LTR);
        return readYogaLayoutChecksum(nodes);
      } finally {
        root.freeRecursive();
        Yoga.Config.destroy(config);
      }
    };
  },
};
