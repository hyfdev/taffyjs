import type { NodeId, StyleInput } from "@taffyjs/node";

import { readLayoutChecksum, type TaffyBenchmarkScenario } from "../scenario.ts";

type TextContext = {
  readonly characters: number;
  readonly lineHeight: number;
};

const sessionCount = 18;
const messageCount = 32;

export const codingAgentChatScenario: TaffyBenchmarkScenario = {
  id: "coding-agent-chat-initial-layout",
  name: "Coding-agent chat: initial layout",
  question:
    "How long does a modeled coding-agent screen take to build, measure, lay out, and read?",
  description:
    "A fixed desktop chat fixture contains a session sidebar, measured labels, a message transcript, and a composer. It models a complete application layout transaction rather than an engine-only call.",
  transaction:
    "Create the public tree and JavaScript contexts, compute with the public measure callback, then read every unrounded layout snapshot.",
  parameters: {
    viewportWidth: 1280,
    viewportHeight: 800,
    sessionCount,
    messageCount,
  },
  createTransaction(api) {
    const rootStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Row,
      size: { width: 1280, height: 800 },
    };
    const sidebarStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Column,
      size: { width: 264 },
      padding: 12,
      gap: 8,
    };
    const sessionStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Row,
      size: { height: 32 },
      padding: { left: 8, right: 8 },
      gap: 6,
    };
    const mainStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Column,
      flexGrow: 1,
      minSize: { width: 0 },
      padding: 16,
      gap: 12,
    };
    const transcriptStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Column,
      flexGrow: 1,
      minSize: { height: 0 },
      gap: 12,
    };
    const messageStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Row,
      gap: 10,
    };
    const messageBodyStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Column,
      flexGrow: 1,
      minSize: { width: 0 },
      gap: 6,
    };
    const actionRowStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Row,
      gap: 6,
      size: { height: 20 },
    };
    const composerStyle: StyleInput = {
      display: api.Display.Flex,
      flexDirection: api.FlexDirection.Row,
      size: { height: 72 },
      padding: 12,
      gap: 8,
    };
    const textStyle: StyleInput = { flexShrink: 1, minSize: { width: 0 } };
    const sessionContexts = Array.from({ length: sessionCount }, (_, index) => ({
      characters: 14 + ((index * 7) % 24),
      lineHeight: 16,
    }));
    const messageContexts = Array.from({ length: messageCount }, (_, index) => ({
      characters: 56 + ((index * 37) % 280),
      lineHeight: 18,
    }));

    return () => {
      const tree = new api.TaffyTree<TextContext>();
      const nodes: NodeId[] = [];
      const leaf = (style: StyleInput): NodeId => {
        const node = tree.newLeaf(style);
        nodes.push(node);
        return node;
      };
      const measuredLeaf = (context: TextContext): NodeId => {
        const node = tree.newLeafWithContext(textStyle, context);
        nodes.push(node);
        return node;
      };
      const parent = (style: StyleInput, children: readonly NodeId[]): NodeId => {
        const node = tree.newWithChildren(style, children);
        nodes.push(node);
        return node;
      };

      const sessions = sessionContexts.map((context) =>
        parent(sessionStyle, [measuredLeaf(context), leaf({ size: { width: 18, height: 18 } })]),
      );
      const sidebar = parent(sidebarStyle, sessions);

      const messages = messageContexts.map((context, index) => {
        const actions = parent(actionRowStyle, [
          leaf({ size: { width: 42 + (index % 3) * 8, height: 20 } }),
          leaf({ size: { width: 52, height: 20 } }),
        ]);
        const body = parent(messageBodyStyle, [measuredLeaf(context), actions]);
        return parent(messageStyle, [leaf({ size: { width: 32, height: 32 } }), body]);
      });
      const transcript = parent(transcriptStyle, messages);
      const composer = parent(composerStyle, [
        measuredLeaf({ characters: 24, lineHeight: 18 }),
        leaf({ size: { width: 72, height: 40 } }),
      ]);
      const main = parent(mainStyle, [transcript, composer]);
      const root = parent(rootStyle, [sidebar, main]);

      tree.computeLayoutWithMeasure({
        root,
        availableSpace: { width: 1280, height: 800 },
        measure({ knownDimensions, availableSpace, context }) {
          const characters = context?.characters ?? 1;
          const lineHeight = context?.lineHeight ?? 16;
          const naturalWidth = Math.max(8, characters * 7);
          const widthSpace = availableSpace.width;
          let widthLimit = naturalWidth;
          if (widthSpace.kind === api.AvailableSpaceKind.Definite) {
            widthLimit = Math.max(1, widthSpace.value);
          } else if (widthSpace.kind === api.AvailableSpaceKind.MinContent) {
            widthLimit = Math.min(naturalWidth, 56);
          }
          const width = knownDimensions.width ?? Math.min(naturalWidth, widthLimit);
          const lineCount = Math.max(1, Math.ceil(naturalWidth / Math.max(1, width)));
          return {
            width,
            height: knownDimensions.height ?? lineCount * lineHeight,
          };
        },
      });

      return readLayoutChecksum(tree, nodes);
    };
  },
};
