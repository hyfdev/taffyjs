import {
  AlignItems as TaffyAlignItems,
  AvailableSpace,
  Direction as TaffyDirection,
  Display as TaffyDisplay,
  FlexDirection as TaffyFlexDirection,
  TaffyTree,
  type Direction as TaffyDirectionValue,
  type NodeId,
  type StyleInput,
} from "@taffyjs/node";
import { Direction, legacyConstants } from "./enums.js";
import type {
  Config,
  ConfigFactory,
  Layout,
  LayoutDimension,
  Node,
  NodeFactory,
  Yoga,
} from "./types.js";

const initialLayout = (): Layout => ({
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  width: Number.NaN,
  height: Number.NaN,
});

class FacadeRuntime {
  readonly tree = new TaffyTree();
  readonly nodes = new Map<NodeId, YogaNode>();
  readonly defaultConfig = new ConfigState();

  constructor() {
    this.tree.disableRounding();
  }
}

class ConfigState {}

interface ConfigRecord {
  readonly runtime: FacadeRuntime;
  readonly state: ConfigState;
  alive: boolean;
}

const configRecords = new WeakMap<object, ConfigRecord>();

class YogaConfig implements Config {
  constructor(runtime: FacadeRuntime, state: ConfigState) {
    configRecords.set(this, { runtime, state, alive: true });
  }

  free(): void {
    freeConfig(requireConfig(undefined, this));
  }
}

function requireConfig(runtime: FacadeRuntime | undefined, value: Config): ConfigRecord {
  if (!(value instanceof YogaConfig)) throw new TypeError("Expected a Yoga Config");
  const record = configRecords.get(value);
  if (record === undefined) throw new Error("Yoga Config state is unavailable");
  if (runtime !== undefined && record.runtime !== runtime) {
    throw new TypeError("Config belongs to another Yoga facade");
  }
  if (!record.alive) throw new Error("Config has been freed");
  return record;
}

function freeConfig(record: ConfigRecord): void {
  record.alive = false;
}

function requireDimension(value: number | string | undefined, name: string): number | undefined {
  if (value === undefined || Number.isNaN(value)) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number or undefined`);
  }
  return value;
}

function requireCalculationDimension(value: LayoutDimension, name: string) {
  if (value === undefined || value === "auto" || Number.isNaN(value)) {
    return AvailableSpace.MaxContent;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number, auto, or undefined`);
  }
  return value;
}

interface NodeRecord {
  readonly runtime: FacadeRuntime;
  readonly config: ConfigState;
  readonly nodeId: NodeId;
  alive: boolean;
  width: number | undefined;
  height: number | undefined;
  layout: Layout;
}

const nodeRecords = new WeakMap<object, NodeRecord>();

function styleFor(
  width: number | undefined,
  height: number | undefined,
  direction: TaffyDirectionValue = TaffyDirection.Ltr,
): StyleInput {
  return {
    display: TaffyDisplay.Flex,
    direction,
    flexDirection: TaffyFlexDirection.Column,
    alignItems: TaffyAlignItems.FlexStart,
    size: { width, height },
  };
}

class YogaNode implements Node {
  constructor(runtime: FacadeRuntime, config: ConfigState) {
    const nodeId = runtime.tree.newLeaf(styleFor(undefined, undefined));
    nodeRecords.set(this, {
      runtime,
      config,
      nodeId,
      alive: true,
      width: undefined,
      height: undefined,
      layout: initialLayout(),
    });
    runtime.nodes.set(nodeId, this);
  }

  free(): void {
    freeNode(requireNode(undefined, this));
  }

  setWidth(value: number | string | undefined): void {
    const record = requireNode(undefined, this);
    const width = requireDimension(value, "width");
    record.runtime.tree.setStyle(record.nodeId, styleFor(width, record.height));
    record.width = width;
  }

  setHeight(value: number | string | undefined): void {
    const record = requireNode(undefined, this);
    const height = requireDimension(value, "height");
    record.runtime.tree.setStyle(record.nodeId, styleFor(record.width, height));
    record.height = height;
  }

  calculateLayout(
    width?: LayoutDimension,
    height?: LayoutDimension,
    direction: Direction = Direction.LTR,
  ): void {
    const record = requireNode(undefined, this);
    if (direction !== Direction.LTR && direction !== Direction.RTL) {
      throw new TypeError("calculateLayout direction must be LTR or RTL");
    }
    const resolvedDirection = direction === Direction.RTL ? TaffyDirection.Rtl : TaffyDirection.Ltr;
    record.runtime.tree.setStyle(
      record.nodeId,
      styleFor(record.width, record.height, resolvedDirection),
    );
    record.runtime.tree.computeLayout({
      root: record.nodeId,
      availableSpace: {
        width: requireCalculationDimension(width, "width"),
        height: requireCalculationDimension(height, "height"),
      },
    });
    const layout = record.runtime.tree.getUnroundedLayout(record.nodeId);
    record.layout = {
      left: layout.location.x,
      right: 0,
      top: layout.location.y,
      bottom: 0,
      width: layout.size.width,
      height: layout.size.height,
    };
  }

  getComputedLeft(): number {
    return requireNode(undefined, this).layout.left;
  }

  getComputedRight(): number {
    return requireNode(undefined, this).layout.right;
  }

  getComputedTop(): number {
    return requireNode(undefined, this).layout.top;
  }

  getComputedBottom(): number {
    return requireNode(undefined, this).layout.bottom;
  }

  getComputedWidth(): number {
    return requireNode(undefined, this).layout.width;
  }

  getComputedHeight(): number {
    return requireNode(undefined, this).layout.height;
  }

  getComputedLayout(): Layout {
    return { ...requireNode(undefined, this).layout };
  }
}

function requireNode(runtime: FacadeRuntime | undefined, value: Node): NodeRecord {
  if (!(value instanceof YogaNode)) throw new TypeError("Expected a Yoga Node");
  const record = nodeRecords.get(value);
  if (record === undefined) throw new Error("Yoga Node state is unavailable");
  if (runtime !== undefined && record.runtime !== runtime) {
    throw new TypeError("Node belongs to another Yoga facade");
  }
  if (!record.alive) throw new Error("Node has been freed");
  return record;
}

function freeNode(record: NodeRecord): void {
  record.runtime.tree.remove(record.nodeId);
  record.runtime.nodes.delete(record.nodeId);
  record.alive = false;
}

function createFactories(runtime: FacadeRuntime): {
  Config: ConfigFactory;
  Node: NodeFactory;
} {
  const Config: ConfigFactory = Object.freeze({
    create: () => new YogaConfig(runtime, new ConfigState()),
    destroy: (config: Config) => freeConfig(requireConfig(runtime, config)),
  });
  const Node: NodeFactory = Object.freeze({
    create: (config?: Config) =>
      new YogaNode(
        runtime,
        config === undefined ? runtime.defaultConfig : requireConfig(runtime, config).state,
      ),
    createDefault: () => new YogaNode(runtime, runtime.defaultConfig),
    createWithConfig: (config: Config) =>
      new YogaNode(runtime, requireConfig(runtime, config).state),
    destroy: (node: Node) => freeNode(requireNode(runtime, node)),
  });
  return { Config, Node };
}

export function createYoga(): Yoga {
  const runtime = new FacadeRuntime();
  return Object.freeze({ ...createFactories(runtime), ...legacyConstants });
}
