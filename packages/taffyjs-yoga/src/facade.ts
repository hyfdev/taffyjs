import { AvailableSpace, TaffyTree, type NodeId } from "@taffyjs/node";
import {
  cloneDeclarations,
  createDeclarations,
  sameDeclarations,
  type YogaDeclarations,
} from "./declarations.js";
import {
  Align,
  BoxSizing,
  Direction,
  Display,
  Edge,
  Errata,
  ExperimentalFeature,
  FlexDirection,
  Gutter,
  Justify,
  Overflow,
  PositionType,
  Wrap,
  legacyConstants,
} from "./enums.js";
import { declarationDirection, translateStyle } from "./translate.js";
import type {
  AlignContentValue,
  AlignItemsValue,
  AlignSelfValue,
  Config,
  ConfigFactory,
  Layout,
  LayoutDimension,
  Node,
  NodeFactory,
  Value,
  Yoga,
} from "./types.js";
import {
  autoValue,
  normalizeAspectRatio,
  normalizeFlexNumber,
  normalizeLength,
  normalizePercent,
  normalizePoint,
  publicValue,
} from "./values.js";

const initialLayout = (): Layout => ({
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  width: Number.NaN,
  height: Number.NaN,
});

class ConfigState {
  useWebDefaults = false;
  pointScaleFactor = 1;
  errata = Errata.None;
  webFlexBasis = false;
  revision = 0;
}

class FacadeRuntime {
  readonly tree = new TaffyTree();
  readonly nodes = new Map<NodeId, YogaNode>();
  readonly defaultConfig = new ConfigState();

  constructor() {
    this.tree.disableRounding();
  }
}

interface ConfigRecord {
  readonly runtime: FacadeRuntime;
  readonly state: ConfigState;
  alive: boolean;
}

const configRecords = new WeakMap<object, ConfigRecord>();

function requireBoolean(value: boolean, name: string): boolean {
  if (typeof value !== "boolean") throw new TypeError(`${name} must be a boolean`);
  return value;
}

function requireEnum<T extends number>(value: T, name: string, allowed: readonly number[]): T {
  if (typeof value !== "number" || !allowed.includes(value)) {
    throw new TypeError(`${name} is unsupported`);
  }
  return value;
}

class YogaConfig implements Config {
  constructor(runtime: FacadeRuntime, state: ConfigState) {
    configRecords.set(this, { runtime, state, alive: true });
  }

  free(): void {
    freeConfig(requireConfig(undefined, this));
  }

  isExperimentalFeatureEnabled(feature: ExperimentalFeature): boolean {
    const record = requireConfig(undefined, this);
    requireEnum(feature, "experimental feature", [ExperimentalFeature.WebFlexBasis]);
    return record.state.webFlexBasis;
  }

  setExperimentalFeatureEnabled(feature: ExperimentalFeature, enabled: boolean): void {
    const record = requireConfig(undefined, this);
    requireEnum(feature, "experimental feature", [ExperimentalFeature.WebFlexBasis]);
    const next = requireBoolean(enabled, "enabled");
    if (record.state.webFlexBasis === next) return;
    record.state.webFlexBasis = next;
    record.state.revision += 1;
  }

  setPointScaleFactor(factor: number): void {
    const record = requireConfig(undefined, this);
    if (typeof factor !== "number" || Number.isNaN(factor) || factor < 0) {
      throw new TypeError("pointScaleFactor must be a non-negative number");
    }
    const next = Number.isFinite(factor) ? Math.fround(factor) : factor;
    if (Object.is(record.state.pointScaleFactor, next)) return;
    record.state.pointScaleFactor = next;
    record.state.revision += 1;
  }

  getErrata(): Errata {
    return requireConfig(undefined, this).state.errata;
  }

  setErrata(errata: Errata): void {
    const record = requireConfig(undefined, this);
    requireEnum(errata, "errata", [Errata.None]);
    record.state.errata = Errata.None;
  }

  useWebDefaults(): boolean {
    return requireConfig(undefined, this).state.useWebDefaults;
  }

  setUseWebDefaults(useWebDefaults: boolean): void {
    const record = requireConfig(undefined, this);
    const next = requireBoolean(useWebDefaults, "useWebDefaults");
    if (record.state.useWebDefaults === next) return;
    record.state.useWebDefaults = next;
    record.state.revision += 1;
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
  declarations: YogaDeclarations;
  ownerDirection: Direction.LTR | Direction.RTL;
  appliedDirection: Direction.LTR | Direction.RTL;
  appliedConfigRevision: number;
  layout: Layout;
}

const nodeRecords = new WeakMap<object, NodeRecord>();

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

function effectiveDirection(record: NodeRecord, declarations = record.declarations) {
  return declarationDirection(declarations, record.ownerDirection);
}

function applyDeclarations(record: NodeRecord, declarations: YogaDeclarations): void {
  if (sameDeclarations(record.declarations, declarations)) return;
  const direction = effectiveDirection(record, declarations);
  const style = translateStyle(declarations, record.config, direction);
  record.runtime.tree.setStyle(record.nodeId, style);
  record.declarations = declarations;
  record.appliedDirection = direction;
  record.appliedConfigRevision = record.config.revision;
}

function mutateDeclarations(
  node: YogaNode,
  mutate: (declarations: YogaDeclarations) => void,
): void {
  const record = requireNode(undefined, node);
  const next = cloneDeclarations(record.declarations);
  mutate(next);
  applyDeclarations(record, next);
}

function syncStyle(record: NodeRecord): void {
  const direction = effectiveDirection(record);
  if (
    record.appliedConfigRevision === record.config.revision &&
    record.appliedDirection === direction
  ) {
    return;
  }
  record.runtime.tree.setStyle(
    record.nodeId,
    translateStyle(record.declarations, record.config, direction),
  );
  record.appliedDirection = direction;
  record.appliedConfigRevision = record.config.revision;
}

const physicalEdges = [
  Edge.Left,
  Edge.Top,
  Edge.Right,
  Edge.Bottom,
  Edge.Start,
  Edge.End,
  Edge.Horizontal,
  Edge.Vertical,
  Edge.All,
] as const;

function requireEdge(edge: Edge): Edge {
  return requireEnum(edge, "edge", physicalEdges);
}

function requireGutter(gutter: Gutter): Gutter {
  return requireEnum(gutter, "gutter", [Gutter.Column, Gutter.Row, Gutter.All]);
}

class YogaNode implements Node {
  constructor(runtime: FacadeRuntime, config: ConfigState) {
    const declarations = createDeclarations(config.useWebDefaults);
    const ownerDirection = Direction.LTR;
    const appliedDirection = declarationDirection(declarations, ownerDirection);
    const nodeId = runtime.tree.newLeaf(translateStyle(declarations, config, appliedDirection));
    nodeRecords.set(this, {
      runtime,
      config,
      nodeId,
      alive: true,
      declarations,
      ownerDirection,
      appliedDirection,
      appliedConfigRevision: config.revision,
      layout: initialLayout(),
    });
    runtime.nodes.set(nodeId, this);
  }

  free(): void {
    freeNode(requireNode(undefined, this));
  }

  copyStyle(node: Node): void {
    const record = requireNode(undefined, this);
    const source = requireNode(record.runtime, node);
    applyDeclarations(record, cloneDeclarations(source.declarations));
  }

  getAlignContent(): Align {
    return requireNode(undefined, this).declarations.alignContent;
  }

  getAlignItems(): Align {
    return requireNode(undefined, this).declarations.alignItems;
  }

  getAlignSelf(): Align {
    return requireNode(undefined, this).declarations.alignSelf;
  }

  getAspectRatio(): number {
    return requireNode(undefined, this).declarations.aspectRatio ?? Number.NaN;
  }

  getBorder(edge: Edge): number {
    return requireNode(undefined, this).declarations.border[requireEdge(edge)] ?? Number.NaN;
  }

  getDirection(): Direction {
    return requireNode(undefined, this).declarations.direction;
  }

  getDisplay(): Display {
    return requireNode(undefined, this).declarations.display;
  }

  getFlexBasis(): Value {
    return publicValue(requireNode(undefined, this).declarations.flexBasis);
  }

  getFlexDirection(): FlexDirection {
    return requireNode(undefined, this).declarations.flexDirection;
  }

  getFlexGrow(): number {
    return requireNode(undefined, this).declarations.flexGrow ?? 0;
  }

  getFlexShrink(): number {
    const record = requireNode(undefined, this);
    return record.declarations.flexShrink ?? (record.config.useWebDefaults ? 1 : 0);
  }

  getFlexWrap(): Wrap {
    return requireNode(undefined, this).declarations.flexWrap;
  }

  getHeight(): Value {
    return publicValue(requireNode(undefined, this).declarations.height);
  }

  getJustifyContent(): Justify {
    return requireNode(undefined, this).declarations.justifyContent;
  }

  getGap(gutter: Gutter): Value {
    const value = requireNode(undefined, this).declarations.gap[requireGutter(gutter)];
    return value.value as unknown as Value;
  }

  getMargin(edge: Edge): Value {
    return publicValue(requireNode(undefined, this).declarations.margin[requireEdge(edge)]);
  }

  getMaxHeight(): Value {
    return publicValue(requireNode(undefined, this).declarations.maxHeight);
  }

  getMaxWidth(): Value {
    return publicValue(requireNode(undefined, this).declarations.maxWidth);
  }

  getMinHeight(): Value {
    return publicValue(requireNode(undefined, this).declarations.minHeight);
  }

  getMinWidth(): Value {
    return publicValue(requireNode(undefined, this).declarations.minWidth);
  }

  getOverflow(): Overflow {
    return requireNode(undefined, this).declarations.overflow;
  }

  getPadding(edge: Edge): Value {
    return publicValue(requireNode(undefined, this).declarations.padding[requireEdge(edge)]);
  }

  getPosition(edge: Edge): Value {
    return publicValue(requireNode(undefined, this).declarations.position[requireEdge(edge)]);
  }

  getPositionType(): PositionType {
    return requireNode(undefined, this).declarations.positionType;
  }

  getBoxSizing(): BoxSizing {
    return requireNode(undefined, this).declarations.boxSizing;
  }

  getWidth(): Value {
    return publicValue(requireNode(undefined, this).declarations.width);
  }

  setAlignContent(alignContent: AlignContentValue): void {
    const value = requireEnum(alignContent, "alignContent", [
      Align.FlexStart,
      Align.Center,
      Align.FlexEnd,
      Align.Stretch,
      Align.SpaceBetween,
      Align.SpaceAround,
      Align.SpaceEvenly,
    ]);
    mutateDeclarations(this, (declarations) => {
      declarations.alignContent = value;
    });
  }

  setAlignItems(alignItems: AlignItemsValue): void {
    const value = requireEnum(alignItems, "alignItems", [
      Align.FlexStart,
      Align.Center,
      Align.FlexEnd,
      Align.Stretch,
      Align.Baseline,
    ]);
    mutateDeclarations(this, (declarations) => {
      declarations.alignItems = value;
    });
  }

  setAlignSelf(alignSelf: AlignSelfValue): void {
    const value = requireEnum(alignSelf, "alignSelf", [
      Align.Auto,
      Align.FlexStart,
      Align.Center,
      Align.FlexEnd,
      Align.Stretch,
      Align.Baseline,
    ]);
    mutateDeclarations(this, (declarations) => {
      declarations.alignSelf = value;
    });
  }

  setAspectRatio(aspectRatio: number | undefined): void {
    const value = normalizeAspectRatio(aspectRatio);
    mutateDeclarations(this, (declarations) => {
      declarations.aspectRatio = value;
    });
  }

  setBorder(edge: Edge, borderWidth: number | undefined): void {
    const index = requireEdge(edge);
    const value = normalizePoint(borderWidth, "borderWidth");
    mutateDeclarations(this, (declarations) => {
      declarations.border[index] = value;
    });
  }

  setDirection(direction: Direction): void {
    const value = requireEnum(direction, "direction", [
      Direction.Inherit,
      Direction.LTR,
      Direction.RTL,
    ]);
    mutateDeclarations(this, (declarations) => {
      declarations.direction = value;
    });
  }

  setDisplay(display: Display): void {
    const value = requireEnum(display, "display", [Display.Flex, Display.None]);
    mutateDeclarations(this, (declarations) => {
      declarations.display = value;
    });
  }

  setFlex(flex: number | undefined): void {
    const value = normalizeFlexNumber(flex, "flex");
    mutateDeclarations(this, (declarations) => {
      declarations.flex = value;
    });
  }

  setFlexBasis(flexBasis: number | "auto" | `${number}%` | undefined): void {
    const value = normalizeLength(flexBasis, "flexBasis", true);
    mutateDeclarations(this, (declarations) => {
      declarations.flexBasis = value;
    });
  }

  setFlexBasisPercent(flexBasis: number | undefined): void {
    const value = normalizePercent(flexBasis, "flexBasis");
    mutateDeclarations(this, (declarations) => {
      declarations.flexBasis = value;
    });
  }

  setFlexBasisAuto(): void {
    mutateDeclarations(this, (declarations) => {
      declarations.flexBasis = autoValue();
    });
  }

  setFlexDirection(flexDirection: FlexDirection): void {
    const value = requireEnum(flexDirection, "flexDirection", [
      FlexDirection.Column,
      FlexDirection.ColumnReverse,
      FlexDirection.Row,
      FlexDirection.RowReverse,
    ]);
    mutateDeclarations(this, (declarations) => {
      declarations.flexDirection = value;
    });
  }

  setFlexGrow(flexGrow: number | undefined): void {
    const value = normalizeFlexNumber(flexGrow, "flexGrow");
    mutateDeclarations(this, (declarations) => {
      declarations.flexGrow = value;
    });
  }

  setFlexShrink(flexShrink: number | undefined): void {
    const value = normalizeFlexNumber(flexShrink, "flexShrink");
    mutateDeclarations(this, (declarations) => {
      declarations.flexShrink = value;
    });
  }

  setFlexWrap(flexWrap: Wrap): void {
    const value = requireEnum(flexWrap, "flexWrap", [Wrap.NoWrap, Wrap.Wrap, Wrap.WrapReverse]);
    mutateDeclarations(this, (declarations) => {
      declarations.flexWrap = value;
    });
  }

  setHeight(height: number | "auto" | `${number}%` | undefined): void {
    const value = normalizeLength(height, "height", true);
    mutateDeclarations(this, (declarations) => {
      declarations.height = value;
    });
  }

  setHeightAuto(): void {
    mutateDeclarations(this, (declarations) => {
      declarations.height = autoValue();
    });
  }

  setHeightPercent(height: number | undefined): void {
    const value = normalizePercent(height, "height");
    mutateDeclarations(this, (declarations) => {
      declarations.height = value;
    });
  }

  setJustifyContent(justifyContent: Justify): void {
    const value = requireEnum(justifyContent, "justifyContent", [
      Justify.FlexStart,
      Justify.Center,
      Justify.FlexEnd,
      Justify.SpaceBetween,
      Justify.SpaceAround,
      Justify.SpaceEvenly,
    ]);
    mutateDeclarations(this, (declarations) => {
      declarations.justifyContent = value;
    });
  }

  setGap(gutter: Gutter, gapLength: number | `${number}%` | undefined): Value {
    const index = requireGutter(gutter);
    const value = normalizeLength(gapLength, "gapLength", false);
    mutateDeclarations(this, (declarations) => {
      declarations.gap[index] = value;
    });
    return undefined as unknown as Value;
  }

  setGapPercent(gutter: Gutter, gapLength: number | undefined): Value {
    const index = requireGutter(gutter);
    const value = normalizePercent(gapLength, "gapLength");
    mutateDeclarations(this, (declarations) => {
      declarations.gap[index] = value;
    });
    return undefined as unknown as Value;
  }

  setMargin(edge: Edge, margin: number | "auto" | `${number}%` | undefined): void {
    const index = requireEdge(edge);
    const value = normalizeLength(margin, "margin", true);
    mutateDeclarations(this, (declarations) => {
      declarations.margin[index] = value;
    });
  }

  setMarginAuto(edge: Edge): void {
    const index = requireEdge(edge);
    mutateDeclarations(this, (declarations) => {
      declarations.margin[index] = autoValue();
    });
  }

  setMarginPercent(edge: Edge, margin: number | undefined): void {
    const index = requireEdge(edge);
    const value = normalizePercent(margin, "margin");
    mutateDeclarations(this, (declarations) => {
      declarations.margin[index] = value;
    });
  }

  setMaxHeight(maxHeight: number | `${number}%` | undefined): void {
    const value = normalizeLength(maxHeight, "maxHeight", false);
    mutateDeclarations(this, (declarations) => {
      declarations.maxHeight = value;
    });
  }

  setMaxHeightPercent(maxHeight: number | undefined): void {
    const value = normalizePercent(maxHeight, "maxHeight");
    mutateDeclarations(this, (declarations) => {
      declarations.maxHeight = value;
    });
  }

  setMaxWidth(maxWidth: number | `${number}%` | undefined): void {
    const value = normalizeLength(maxWidth, "maxWidth", false);
    mutateDeclarations(this, (declarations) => {
      declarations.maxWidth = value;
    });
  }

  setMaxWidthPercent(maxWidth: number | undefined): void {
    const value = normalizePercent(maxWidth, "maxWidth");
    mutateDeclarations(this, (declarations) => {
      declarations.maxWidth = value;
    });
  }

  setMinHeight(minHeight: number | `${number}%` | undefined): void {
    const value = normalizeLength(minHeight, "minHeight", false);
    mutateDeclarations(this, (declarations) => {
      declarations.minHeight = value;
    });
  }

  setMinHeightPercent(minHeight: number | undefined): void {
    const value = normalizePercent(minHeight, "minHeight");
    mutateDeclarations(this, (declarations) => {
      declarations.minHeight = value;
    });
  }

  setMinWidth(minWidth: number | `${number}%` | undefined): void {
    const value = normalizeLength(minWidth, "minWidth", false);
    mutateDeclarations(this, (declarations) => {
      declarations.minWidth = value;
    });
  }

  setMinWidthPercent(minWidth: number | undefined): void {
    const value = normalizePercent(minWidth, "minWidth");
    mutateDeclarations(this, (declarations) => {
      declarations.minWidth = value;
    });
  }

  setOverflow(overflow: Overflow): void {
    const value = requireEnum(overflow, "overflow", [
      Overflow.Visible,
      Overflow.Hidden,
      Overflow.Scroll,
    ]);
    mutateDeclarations(this, (declarations) => {
      declarations.overflow = value;
    });
  }

  setPadding(edge: Edge, padding: number | `${number}%` | undefined): void {
    const index = requireEdge(edge);
    const value = normalizeLength(padding, "padding", false);
    mutateDeclarations(this, (declarations) => {
      declarations.padding[index] = value;
    });
  }

  setPaddingPercent(edge: Edge, padding: number | undefined): void {
    const index = requireEdge(edge);
    const value = normalizePercent(padding, "padding");
    mutateDeclarations(this, (declarations) => {
      declarations.padding[index] = value;
    });
  }

  setPosition(edge: Edge, position: number | `${number}%` | undefined): void {
    const index = requireEdge(edge);
    const value = normalizeLength(position, "position", false);
    mutateDeclarations(this, (declarations) => {
      declarations.position[index] = value;
    });
  }

  setPositionPercent(edge: Edge, position: number | undefined): void {
    const index = requireEdge(edge);
    const value = normalizePercent(position, "position");
    mutateDeclarations(this, (declarations) => {
      declarations.position[index] = value;
    });
  }

  setPositionType(positionType: PositionType): void {
    const value = requireEnum(positionType, "positionType", [
      PositionType.Relative,
      PositionType.Absolute,
    ]);
    mutateDeclarations(this, (declarations) => {
      declarations.positionType = value;
    });
  }

  setPositionAuto(edge: Edge): void {
    const index = requireEdge(edge);
    mutateDeclarations(this, (declarations) => {
      declarations.position[index] = autoValue();
    });
  }

  setBoxSizing(boxSizing: BoxSizing): void {
    const value = requireEnum(boxSizing, "boxSizing", [BoxSizing.BorderBox, BoxSizing.ContentBox]);
    mutateDeclarations(this, (declarations) => {
      declarations.boxSizing = value;
    });
  }

  setWidth(width: number | "auto" | `${number}%` | undefined): void {
    const value = normalizeLength(width, "width", true);
    mutateDeclarations(this, (declarations) => {
      declarations.width = value;
    });
  }

  setWidthAuto(): void {
    mutateDeclarations(this, (declarations) => {
      declarations.width = autoValue();
    });
  }

  setWidthPercent(width: number | undefined): void {
    const value = normalizePercent(width, "width");
    mutateDeclarations(this, (declarations) => {
      declarations.width = value;
    });
  }

  calculateLayout(
    width?: LayoutDimension,
    height?: LayoutDimension,
    direction: Direction = Direction.LTR,
  ): void {
    const record = requireNode(undefined, this);
    const ownerDirection = requireEnum(direction, "calculateLayout direction", [
      Direction.LTR,
      Direction.RTL,
    ]);
    record.ownerDirection = ownerDirection as Direction.LTR | Direction.RTL;
    syncStyle(record);
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
