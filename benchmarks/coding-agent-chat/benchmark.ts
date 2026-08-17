import type { MeasureFunction, NodeId, StyleInput, TaffyTree } from "@taffyjs/node";
import type { Config, Node } from "@taffyjs/yoga";

import {
  createLayoutObservation,
  readTaffyLayouts,
  readYogaLayouts,
  type BenchmarkScenario,
  type LayoutObservation,
  type TaffyApi,
  type YogaApi,
} from "../scenario.ts";

interface TextContext {
  readonly characters: number;
  readonly lineHeight: number;
}

interface DimensionConstraint {
  readonly mode: "exact" | "at-most" | "undefined";
  readonly value: number;
}

interface TaffyChatFixture {
  readonly tree: TaffyTree<TextContext>;
  readonly nodes: readonly NodeId[];
  readonly root: NodeId;
  compute(width: number, height: number): void;
}

interface YogaChatFixture {
  readonly config: Config;
  readonly nodes: readonly Node[];
  readonly root: Node;
  compute(width: number, height: number): void;
  dispose(): void;
}

const sessionCount = 18;
const messageCount = 32;
const chatNodeCount = sessionCount * 3 + 1 + messageCount * 7 + 1 + 3 + 1 + 1;
const initialViewport = { width: 1280, height: 800 } as const;
const resizedViewport = { width: 1024, height: 768 } as const;
const sessionContexts = Array.from({ length: sessionCount }, (_, index) => ({
  characters: 14 + ((index * 7) % 24),
  lineHeight: 16,
}));
const messageContexts = Array.from({ length: messageCount }, (_, index) => ({
  characters: 56 + ((index * 37) % 280),
  lineHeight: 18,
}));

function resolveDimension(natural: number, constraint: DimensionConstraint): number {
  if (constraint.mode === "exact") return Math.max(0, constraint.value);
  if (constraint.mode === "at-most") {
    return Math.min(natural, Math.max(0, constraint.value));
  }
  return natural;
}

function measureText(
  context: TextContext,
  widthConstraint: DimensionConstraint,
  heightConstraint: DimensionConstraint,
): { readonly width: number; readonly height: number } {
  const naturalWidth = Math.max(8, context.characters * 7);
  const width = resolveDimension(naturalWidth, widthConstraint);
  const lineCount = Math.max(1, Math.ceil(naturalWidth / Math.max(1, width)));
  const naturalHeight = lineCount * context.lineHeight;
  return {
    width,
    height: resolveDimension(naturalHeight, heightConstraint),
  };
}

function mapTaffyConstraint(
  api: TaffyApi,
  knownDimension: number | undefined,
  availableSpace: { readonly kind: number; readonly value?: number },
): DimensionConstraint {
  if (knownDimension !== undefined) {
    return { mode: "exact", value: knownDimension };
  }
  if (availableSpace.kind === api.AvailableSpaceKind.Definite) {
    return { mode: "at-most", value: availableSpace.value ?? 0 };
  }
  if (availableSpace.kind === api.AvailableSpaceKind.MinContent) {
    return { mode: "at-most", value: 0 };
  }
  return { mode: "undefined", value: Number.NaN };
}

function mapYogaConstraint(api: YogaApi, value: number, mode: number): DimensionConstraint {
  if (mode === api.MeasureMode.Exactly) return { mode: "exact", value };
  if (mode === api.MeasureMode.AtMost) return { mode: "at-most", value };
  return { mode: "undefined", value: Number.NaN };
}

function buildTaffyChat(api: TaffyApi): TaffyChatFixture {
  const rootStyle: StyleInput = {
    display: api.Display.Flex,
    flexDirection: api.FlexDirection.Row,
    flexShrink: 0,
    size: initialViewport,
  };
  const sidebarStyle: StyleInput = {
    display: api.Display.Flex,
    flexDirection: api.FlexDirection.Column,
    flexShrink: 0,
    size: { width: 264 },
    padding: 12,
    gap: 8,
  };
  const sessionStyle: StyleInput = {
    display: api.Display.Flex,
    flexDirection: api.FlexDirection.Row,
    flexShrink: 0,
    size: { height: 32 },
    padding: { left: 8, right: 8 },
    gap: 6,
  };
  const mainStyle: StyleInput = {
    display: api.Display.Flex,
    flexDirection: api.FlexDirection.Column,
    flexGrow: 1,
    flexShrink: 1,
    minSize: { width: 0 },
    padding: 16,
    gap: 12,
  };
  const transcriptStyle: StyleInput = {
    display: api.Display.Flex,
    flexDirection: api.FlexDirection.Column,
    flexGrow: 1,
    flexShrink: 1,
    minSize: { height: 0 },
    gap: 12,
  };
  const messageStyle: StyleInput = {
    display: api.Display.Flex,
    flexDirection: api.FlexDirection.Row,
    flexShrink: 0,
    gap: 10,
  };
  const messageBodyStyle: StyleInput = {
    display: api.Display.Flex,
    flexDirection: api.FlexDirection.Column,
    flexGrow: 1,
    flexShrink: 1,
    minSize: { width: 0 },
    gap: 6,
  };
  const actionRowStyle: StyleInput = {
    display: api.Display.Flex,
    flexDirection: api.FlexDirection.Row,
    flexShrink: 0,
    gap: 6,
    size: { height: 20 },
  };
  const composerStyle: StyleInput = {
    display: api.Display.Flex,
    flexDirection: api.FlexDirection.Row,
    flexShrink: 0,
    size: { height: 72 },
    padding: 12,
    gap: 8,
  };
  const textStyle: StyleInput = {
    display: api.Display.Flex,
    flexShrink: 1,
    minSize: { width: 0 },
  };
  const tree = new api.TaffyTree<TextContext>();
  tree.disableRounding();
  const nodes: NodeId[] = [];
  const measure: MeasureFunction<TextContext> = ({ knownDimensions, availableSpace, context }) =>
    measureText(
      context ?? { characters: 1, lineHeight: 16 },
      mapTaffyConstraint(api, knownDimensions.width, availableSpace.width),
      mapTaffyConstraint(api, knownDimensions.height, availableSpace.height),
    );
  const fixedLeaf = (width: number, height: number): NodeId => {
    const node = tree.newLeaf({
      display: api.Display.Flex,
      flexShrink: 0,
      size: { width, height },
    });
    nodes.push(node);
    return node;
  };
  const measuredLeaf = (context: TextContext): NodeId => {
    const node = tree.newLeafWithContext(textStyle, context);
    tree.setMeasure(node, measure);
    nodes.push(node);
    return node;
  };
  const parent = (style: StyleInput, children: readonly NodeId[]): NodeId => {
    const node = tree.newWithChildren(style, children);
    nodes.push(node);
    return node;
  };

  const sessions = sessionContexts.map((context) =>
    parent(sessionStyle, [measuredLeaf(context), fixedLeaf(18, 18)]),
  );
  const sidebar = parent(sidebarStyle, sessions);
  const messages = messageContexts.map((context, index) => {
    const actions = parent(actionRowStyle, [
      fixedLeaf(42 + (index % 3) * 8, 20),
      fixedLeaf(52, 20),
    ]);
    const body = parent(messageBodyStyle, [measuredLeaf(context), actions]);
    return parent(messageStyle, [fixedLeaf(32, 32), body]);
  });
  const transcript = parent(transcriptStyle, messages);
  const composer = parent(composerStyle, [
    measuredLeaf({ characters: 24, lineHeight: 18 }),
    fixedLeaf(72, 40),
  ]);
  const main = parent(mainStyle, [transcript, composer]);
  const root = parent(rootStyle, [sidebar, main]);

  return {
    tree,
    nodes,
    root,
    compute(width, height) {
      tree.computeLayout({
        root,
        availableSpace: { width, height },
      });
    },
  };
}

function buildYogaChat(api: YogaApi): YogaChatFixture {
  const Yoga = api.default;
  const config = Yoga.Config.create();
  config.setPointScaleFactor(0);
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
      node.setFlexShrink(0);
    });
  const measuredLeaf = (context: TextContext): Node =>
    createNode((node) => {
      node.setFlexShrink(1);
      node.setMinWidth(0);
      node.setMeasureFunc((width, widthMode, height, heightMode) =>
        measureText(
          context,
          mapYogaConstraint(api, width, widthMode),
          mapYogaConstraint(api, height, heightMode),
        ),
      );
    });

  const sessions = sessionContexts.map((context) =>
    parent(
      (node) => {
        node.setFlexDirection(api.FlexDirection.Row);
        node.setFlexShrink(0);
        node.setHeight(32);
        node.setPadding(api.Edge.Horizontal, 8);
        node.setGap(api.Gutter.All, 6);
      },
      [measuredLeaf(context), fixedLeaf(18, 18)],
    ),
  );
  const sidebar = parent((node) => {
    node.setFlexShrink(0);
    node.setWidth(264);
    node.setPadding(api.Edge.All, 12);
    node.setGap(api.Gutter.All, 8);
  }, sessions);
  const messages = messageContexts.map((context, index) => {
    const actions = parent(
      (node) => {
        node.setFlexDirection(api.FlexDirection.Row);
        node.setFlexShrink(0);
        node.setHeight(20);
        node.setGap(api.Gutter.All, 6);
      },
      [fixedLeaf(42 + (index % 3) * 8, 20), fixedLeaf(52, 20)],
    );
    const body = parent(
      (node) => {
        node.setFlexGrow(1);
        node.setFlexShrink(1);
        node.setMinWidth(0);
        node.setGap(api.Gutter.All, 6);
      },
      [measuredLeaf(context), actions],
    );
    return parent(
      (node) => {
        node.setFlexDirection(api.FlexDirection.Row);
        node.setFlexShrink(0);
        node.setGap(api.Gutter.All, 10);
      },
      [fixedLeaf(32, 32), body],
    );
  });
  const transcript = parent((node) => {
    node.setFlexGrow(1);
    node.setFlexShrink(1);
    node.setMinHeight(0);
    node.setGap(api.Gutter.All, 12);
  }, messages);
  const composer = parent(
    (node) => {
      node.setFlexDirection(api.FlexDirection.Row);
      node.setFlexShrink(0);
      node.setHeight(72);
      node.setPadding(api.Edge.All, 12);
      node.setGap(api.Gutter.All, 8);
    },
    [measuredLeaf({ characters: 24, lineHeight: 18 }), fixedLeaf(72, 40)],
  );
  const main = parent(
    (node) => {
      node.setFlexGrow(1);
      node.setFlexShrink(1);
      node.setMinWidth(0);
      node.setPadding(api.Edge.All, 16);
      node.setGap(api.Gutter.All, 12);
    },
    [transcript, composer],
  );
  const root = parent(
    (node) => {
      node.setFlexDirection(api.FlexDirection.Row);
      node.setFlexShrink(0);
      node.setWidth(initialViewport.width);
      node.setHeight(initialViewport.height);
    },
    [sidebar, main],
  );

  return {
    config,
    nodes,
    root,
    compute(width, height) {
      root.calculateLayout(width, height, api.Direction.LTR);
    },
    dispose() {
      root.freeRecursive();
      Yoga.Config.destroy(config);
    },
  };
}

function createInitialTaffyTransaction(api: TaffyApi) {
  const observation = createLayoutObservation(chatNodeCount);
  return {
    run(): LayoutObservation {
      const fixture = buildTaffyChat(api);
      fixture.compute(initialViewport.width, initialViewport.height);
      return readTaffyLayouts(fixture.tree, fixture.nodes, observation);
    },
  };
}

function createInitialYogaTransaction(api: YogaApi) {
  const observation = createLayoutObservation(chatNodeCount);
  return {
    run(): LayoutObservation {
      const fixture = buildYogaChat(api);
      try {
        fixture.compute(initialViewport.width, initialViewport.height);
        return readYogaLayouts(fixture.nodes, observation);
      } finally {
        fixture.dispose();
      }
    },
  };
}

function createResizeTaffyTransaction(api: TaffyApi) {
  const fixture = buildTaffyChat(api);
  const observation = createLayoutObservation(chatNodeCount);
  const viewports = [initialViewport, resizedViewport] as const;
  let viewportIndex = 1;
  fixture.compute(initialViewport.width, initialViewport.height);
  return {
    run(): LayoutObservation {
      const viewport = viewports[viewportIndex];
      viewportIndex = (viewportIndex + 1) % viewports.length;
      fixture.tree.updateStyle(fixture.root, { size: viewport });
      fixture.compute(viewport.width, viewport.height);
      return readTaffyLayouts(fixture.tree, fixture.nodes, observation);
    },
  };
}

function createResizeYogaTransaction(api: YogaApi) {
  const fixture = buildYogaChat(api);
  const observation = createLayoutObservation(chatNodeCount);
  const viewports = [initialViewport, resizedViewport] as const;
  let viewportIndex = 1;
  fixture.compute(initialViewport.width, initialViewport.height);
  return {
    run(): LayoutObservation {
      const viewport = viewports[viewportIndex];
      viewportIndex = (viewportIndex + 1) % viewports.length;
      fixture.root.setWidth(viewport.width);
      fixture.root.setHeight(viewport.height);
      fixture.compute(viewport.width, viewport.height);
      return readYogaLayouts(fixture.nodes, observation);
    },
    dispose() {
      fixture.dispose();
    },
  };
}

export const codingAgentChatScenarios: readonly BenchmarkScenario[] = [
  {
    id: "coding-agent-chat-initial-layout",
    name: "Coding-agent chat: initial layout",
    question:
      "What does it cost to build, measure, lay out, read, and release a modeled coding-agent screen?",
    description:
      "A fixed desktop chat fixture contains a session sidebar, measured labels, a message transcript, and a composer. Text callbacks use the same intrinsic-size function and constraints for both public APIs.",
    transaction:
      "Create the public tree from fixed fixture data, calculate with public text-measure callbacks, read left/top/width/height for every node, and release resources when the API requires it.",
    parameters: {
      nodeCount: chatNodeCount,
      measuredNodeCount: sessionCount + messageCount + 1,
      sessionCount,
      messageCount,
      viewportWidth: initialViewport.width,
      viewportHeight: initialViewport.height,
    },
    createTaffyTransaction: createInitialTaffyTransaction,
    createYogaTransaction: createInitialYogaTransaction,
  },
  {
    id: "coding-agent-chat-viewport-resize",
    name: "Coding-agent chat: viewport resize",
    question: "What does it cost to relayout an existing measured application tree after a resize?",
    description:
      "The same coding-agent fixture is created and initially laid out before timing. Each transaction alternates between two fixed viewport sizes, recomputes measured layout, and reads every result.",
    transaction:
      "Update the persistent root size through the public API, calculate layout with public text-measure callbacks, then read left/top/width/height for every node. Setup and final release are outside timing.",
    validationRuns: 2,
    parameters: {
      nodeCount: chatNodeCount,
      measuredNodeCount: sessionCount + messageCount + 1,
      sessionCount,
      messageCount,
      initialViewportWidth: initialViewport.width,
      initialViewportHeight: initialViewport.height,
      resizedViewportWidth: resizedViewport.width,
      resizedViewportHeight: resizedViewport.height,
    },
    createTaffyTransaction: createResizeTaffyTransaction,
    createYogaTransaction: createResizeYogaTransaction,
  },
];
