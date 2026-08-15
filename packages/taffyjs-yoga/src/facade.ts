import {
  AvailableSpace,
  TaffyTree,
  type MeasureArgs as NativeMeasureArgs,
  type NodeId,
} from "@taffyjs/node";
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
import {
  initialComputedEdges,
  projectOutputs,
  type ComputedEdges,
  type ProjectionEntry,
} from "./projection.js";
import { invokeYogaMeasure } from "./measurement.js";
import { declarationDirection, translateCalculationStyle, translateStyle } from "./translate.js";
import type {
  AlignContentValue,
  AlignItemsValue,
  AlignSelfValue,
  Config,
  ConfigFactory,
  DirtiedFunction,
  Layout,
  LayoutDimension,
  MeasureFunction,
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
  readonly measure = (args: NativeMeasureArgs<unknown>) => {
    const callback = recordForId(this, args.node).measureFunction;
    if (callback === null) return { width: 0, height: 0 };
    const context = this.activeMeasureContext;
    const isSelectedRoot = context?.root === args.node;
    return invokeYogaMeasure(args, callback, {
      width: isSelectedRoot === true && context.exactWidth,
      height: isSelectedRoot === true && context.exactHeight,
    });
  };
  activeMeasureContext: ActiveMeasureContext | null = null;
  measurementRevision = 0;
  poisoned: Error | null = null;

  constructor() {
    this.tree.disableRounding();
  }
}

interface ActiveMeasureContext {
  readonly root: NodeId;
  readonly exactWidth: boolean;
  readonly exactHeight: boolean;
}

function assertRuntimeUsable(runtime: FacadeRuntime): void {
  if (runtime.poisoned !== null) throw runtime.poisoned;
}

function poisonRuntime(runtime: FacadeRuntime, cause: unknown): Error {
  const error = new Error("Yoga facade is unusable after an unexpected partial native failure", {
    cause,
  });
  runtime.poisoned = error;
  return error;
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
    assertRuntimeUsable(runtime);
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
  assertRuntimeUsable(record.runtime);
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
  computedMargin: ComputedEdges;
  computedPadding: ComputedEdges;
  computedBorder: ComputedEdges;
  layoutDirection: Direction.LTR | Direction.RTL;
  dirty: boolean;
  hasNewLayout: boolean;
  dirtiedFunction: DirtiedFunction | null;
  measureFunction: MeasureFunction | null;
  measurementRevision: number;
  outputStale: boolean;
  referenceBaseline: boolean;
  alwaysFormsContainingBlock: boolean;
  lastCalculation: CalculationSignature | undefined;
}

interface CalculationSignature {
  readonly width: number | undefined;
  readonly height: number | undefined;
  readonly direction: Direction.LTR | Direction.RTL;
  readonly measurementRevision: number;
}

const nodeRecords = new WeakMap<object, NodeRecord>();

function requireNode(runtime: FacadeRuntime | undefined, value: Node): NodeRecord {
  if (!(value instanceof YogaNode)) throw new TypeError("Expected a Yoga Node");
  const record = nodeRecords.get(value);
  if (record === undefined) throw new Error("Yoga Node state is unavailable");
  if (runtime !== undefined && record.runtime !== runtime) {
    throw new TypeError("Node belongs to another Yoga facade");
  }
  assertRuntimeUsable(record.runtime);
  if (!record.alive) throw new Error("Node has been freed");
  return record;
}

function nodeForRecord(record: NodeRecord): YogaNode {
  const node = record.runtime.nodes.get(record.nodeId);
  if (node === undefined) throw poisonRuntime(record.runtime, new Error("Node registry mismatch"));
  return node;
}

function recordForId(runtime: FacadeRuntime, nodeId: NodeId): NodeRecord {
  const node = runtime.nodes.get(nodeId);
  if (node === undefined) throw poisonRuntime(runtime, new Error("Node registry mismatch"));
  const record = nodeRecords.get(node);
  if (record === undefined || !record.alive) {
    throw poisonRuntime(runtime, new Error("Node record mismatch"));
  }
  return record;
}

function collectAncestors(record: NodeRecord, includeSelf: boolean): NodeRecord[] {
  const records: NodeRecord[] = [];
  let nodeId: NodeId | null = includeSelf
    ? record.nodeId
    : record.runtime.tree.getParent(record.nodeId);
  while (nodeId !== null) {
    const current = recordForId(record.runtime, nodeId);
    records.push(current);
    nodeId = record.runtime.tree.getParent(nodeId);
  }
  return records;
}

function collectSubtree(record: NodeRecord): NodeRecord[] {
  const records: NodeRecord[] = [];
  const pending = [record.nodeId];
  while (pending.length > 0) {
    const nodeId = pending.pop();
    if (nodeId === undefined) break;
    records.push(recordForId(record.runtime, nodeId));
    const children = record.runtime.tree.getChildren(nodeId);
    for (let index = children.length - 1; index >= 0; index -= 1) {
      pending.push(children[index]);
    }
  }
  return records;
}

function markDirtyRecords(records: readonly NodeRecord[]): void {
  const notifications: Array<readonly [DirtiedFunction, YogaNode]> = [];
  for (const record of records) {
    if (record.dirty) continue;
    record.dirty = true;
    if (record.dirtiedFunction !== null) {
      notifications.push([record.dirtiedFunction, nodeForRecord(record)]);
    }
  }
  for (const [callback, node] of notifications) callback(node);
}

function effectiveDirection(record: NodeRecord, declarations = record.declarations) {
  return declarationDirection(declarations, record.ownerDirection);
}

function applyDeclarations(record: NodeRecord, declarations: YogaDeclarations): void {
  if (sameDeclarations(record.declarations, declarations)) return;
  const dirtyRecords = collectAncestors(record, true);
  const direction = effectiveDirection(record, declarations);
  const style = translateStyle(declarations, record.config, direction, record.ownerDirection);
  record.runtime.tree.setStyle(record.nodeId, style);
  record.declarations = declarations;
  record.appliedDirection = direction;
  record.appliedConfigRevision = record.config.revision;
  markDirtyRecords(dirtyRecords);
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

interface StyleSyncPlanEntry {
  readonly record: NodeRecord;
  readonly ownerDirection: Direction.LTR | Direction.RTL;
  readonly appliedDirection: Direction.LTR | Direction.RTL;
  readonly style: ReturnType<typeof translateStyle> | undefined;
}

function syncSubtreeStyles(
  root: NodeRecord,
  rootOwnerDirection: Direction.LTR | Direction.RTL,
  subtree: readonly NodeRecord[],
): boolean {
  const directions = new Map<NodeId, Direction.LTR | Direction.RTL>();
  const plan: StyleSyncPlanEntry[] = [];

  for (const record of subtree) {
    let ownerDirection: Direction.LTR | Direction.RTL;
    if (record === root) {
      ownerDirection = rootOwnerDirection;
    } else {
      const parentId = root.runtime.tree.getParent(record.nodeId);
      const parentDirection = parentId === null ? undefined : directions.get(parentId);
      if (parentDirection === undefined) {
        throw poisonRuntime(root.runtime, new Error("Yoga subtree traversal order mismatch"));
      }
      ownerDirection = parentDirection;
    }

    const appliedDirection = declarationDirection(record.declarations, ownerDirection);
    const stale =
      record.appliedConfigRevision !== record.config.revision ||
      record.appliedDirection !== appliedDirection ||
      record.ownerDirection !== ownerDirection;
    plan.push({
      record,
      ownerDirection,
      appliedDirection,
      style: stale
        ? translateStyle(record.declarations, record.config, appliedDirection, ownerDirection)
        : undefined,
    });
    directions.set(record.nodeId, appliedDirection);
  }

  let nativeWrites = 0;
  for (const entry of plan) {
    if (entry.style === undefined) continue;
    try {
      root.runtime.tree.setStyle(entry.record.nodeId, entry.style);
    } catch (error) {
      if (nativeWrites > 0) throw poisonRuntime(root.runtime, error);
      throw error;
    }
    nativeWrites += 1;
  }

  for (const entry of plan) {
    entry.record.ownerDirection = entry.ownerDirection;
    entry.record.appliedDirection = entry.appliedDirection;
    entry.record.appliedConfigRevision = entry.record.config.revision;
  }
  return nativeWrites > 0;
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

function requireInsertIndex(index: number, childCount: number): number {
  if (typeof index !== "number" || !Number.isInteger(index) || index < 0 || index > childCount) {
    throw new RangeError("Child index is out of range");
  }
  return index;
}

function lookupChildIndex(index: number): number | null {
  if (typeof index !== "number") throw new TypeError("Child index must be a number");
  return Number.isInteger(index) && index >= 0 ? index : null;
}

function assertAcyclicInsertion(parent: NodeRecord, child: NodeRecord): void {
  let current: NodeId | null = parent.nodeId;
  while (current !== null) {
    if (current === child.nodeId) throw new Error("Cannot create a cycle in a Yoga tree");
    current = parent.runtime.tree.getParent(current);
  }
}

function sameCalculation(
  left: CalculationSignature | undefined,
  right: CalculationSignature,
): boolean {
  return (
    left !== undefined &&
    Object.is(left.width, right.width) &&
    Object.is(left.height, right.height) &&
    left.direction === right.direction &&
    left.measurementRevision === right.measurementRevision
  );
}

class YogaNode implements Node {
  constructor(runtime: FacadeRuntime, config: ConfigState) {
    assertRuntimeUsable(runtime);
    const declarations = createDeclarations(config.useWebDefaults);
    const ownerDirection = Direction.LTR;
    const appliedDirection = declarationDirection(declarations, ownerDirection);
    const nodeId = runtime.tree.newLeaf(
      translateStyle(declarations, config, appliedDirection, ownerDirection),
    );
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
      computedMargin: initialComputedEdges(),
      computedPadding: initialComputedEdges(),
      computedBorder: initialComputedEdges(),
      layoutDirection: appliedDirection,
      dirty: true,
      hasNewLayout: true,
      dirtiedFunction: null,
      measureFunction: null,
      measurementRevision: 0,
      outputStale: false,
      referenceBaseline: false,
      alwaysFormsContainingBlock: false,
      lastCalculation: undefined,
    });
    runtime.nodes.set(nodeId, this);
  }

  free(): void {
    freeNode(requireNode(undefined, this));
  }

  freeRecursive(): void {
    freeRecursiveNode(requireNode(undefined, this));
  }

  getChild(index: number): Node {
    const record = requireNode(undefined, this);
    const resolvedIndex = lookupChildIndex(index);
    if (
      resolvedIndex === null ||
      resolvedIndex >= record.runtime.tree.getChildCount(record.nodeId)
    ) {
      return null as unknown as Node;
    }
    const childId = record.runtime.tree.getChildAtIndex(record.nodeId, resolvedIndex);
    return nodeForRecord(recordForId(record.runtime, childId));
  }

  getChildCount(): number {
    const record = requireNode(undefined, this);
    return record.runtime.tree.getChildCount(record.nodeId);
  }

  getParent(): Node | null {
    const record = requireNode(undefined, this);
    const parentId = record.runtime.tree.getParent(record.nodeId);
    return parentId === null ? null : nodeForRecord(recordForId(record.runtime, parentId));
  }

  insertChild(child: Node, index: number): void {
    const parentRecord = requireNode(undefined, this);
    const childRecord = requireNode(parentRecord.runtime, child);
    const childCount = parentRecord.runtime.tree.getChildCount(parentRecord.nodeId);
    const resolvedIndex = requireInsertIndex(index, childCount);
    if (parentRecord.measureFunction !== null) {
      throw new Error("Measured Yoga nodes cannot have children");
    }
    if (parentRecord.runtime.tree.getParent(childRecord.nodeId) !== null) {
      throw new Error("Yoga child already has a parent");
    }
    assertAcyclicInsertion(parentRecord, childRecord);
    const dirtyRecords = collectAncestors(parentRecord, true);

    parentRecord.runtime.tree.insertChildAtIndex(
      parentRecord.nodeId,
      resolvedIndex,
      childRecord.nodeId,
    );
    childRecord.lastCalculation = undefined;
    markDirtyRecords(dirtyRecords);
  }

  removeChild(child: Node): void {
    const parentRecord = requireNode(undefined, this);
    const childRecord = requireNode(parentRecord.runtime, child);
    if (parentRecord.runtime.tree.getParent(childRecord.nodeId) !== parentRecord.nodeId) return;
    const dirtyRecords = collectAncestors(parentRecord, true);

    parentRecord.runtime.tree.removeChild(parentRecord.nodeId, childRecord.nodeId);
    try {
      parentRecord.runtime.tree.markDirty(childRecord.nodeId);
    } catch (error) {
      throw poisonRuntime(parentRecord.runtime, error);
    }
    childRecord.layout = initialLayout();
    childRecord.computedMargin = initialComputedEdges();
    childRecord.computedPadding = initialComputedEdges();
    childRecord.computedBorder = initialComputedEdges();
    childRecord.layoutDirection = childRecord.appliedDirection;
    childRecord.lastCalculation = undefined;
    markDirtyRecords(dirtyRecords);
  }

  isDirty(): boolean {
    return requireNode(undefined, this).dirty;
  }

  markDirty(): void {
    const record = requireNode(undefined, this);
    if (record.measureFunction === null || record.runtime.tree.getChildCount(record.nodeId) !== 0) {
      throw new Error("Only measured Yoga leaves can be manually marked dirty");
    }
    const dirtyRecords = collectAncestors(record, true);
    record.runtime.tree.markDirty(record.nodeId);
    markDirtyRecords(dirtyRecords);
  }

  hasNewLayout(): boolean {
    return requireNode(undefined, this).hasNewLayout;
  }

  markLayoutSeen(): void {
    requireNode(undefined, this).hasNewLayout = false;
  }

  reset(): void {
    const record = requireNode(undefined, this);
    if (
      record.runtime.tree.getParent(record.nodeId) !== null ||
      record.runtime.tree.getChildCount(record.nodeId) !== 0
    ) {
      throw new Error("Only a detached Yoga leaf can be reset");
    }
    const declarations = createDeclarations(record.config.useWebDefaults);
    const ownerDirection = Direction.LTR;
    const appliedDirection = declarationDirection(declarations, ownerDirection);
    record.runtime.tree.setStyle(
      record.nodeId,
      translateStyle(declarations, record.config, appliedDirection, ownerDirection),
    );

    record.declarations = declarations;
    record.ownerDirection = ownerDirection;
    record.appliedDirection = appliedDirection;
    record.appliedConfigRevision = record.config.revision;
    record.layout = initialLayout();
    record.computedMargin = initialComputedEdges();
    record.computedPadding = initialComputedEdges();
    record.computedBorder = initialComputedEdges();
    record.layoutDirection = appliedDirection;
    record.dirty = true;
    record.hasNewLayout = true;
    record.dirtiedFunction = null;
    if (record.measureFunction !== null) {
      record.runtime.measurementRevision += 1;
      record.measurementRevision = record.runtime.measurementRevision;
    }
    record.measureFunction = null;
    record.outputStale = false;
    record.referenceBaseline = false;
    record.alwaysFormsContainingBlock = false;
    record.lastCalculation = undefined;
  }

  isReferenceBaseline(): boolean {
    return requireNode(undefined, this).referenceBaseline;
  }

  setIsReferenceBaseline(isReferenceBaseline: boolean): void {
    const record = requireNode(undefined, this);
    const value = requireBoolean(isReferenceBaseline, "isReferenceBaseline");
    if (value) throw new TypeError("Reference baselines are unsupported");
    record.referenceBaseline = false;
  }

  setAlwaysFormsContainingBlock(alwaysFormsContainingBlock: boolean): void {
    const record = requireNode(undefined, this);
    record.alwaysFormsContainingBlock = requireBoolean(
      alwaysFormsContainingBlock,
      "alwaysFormsContainingBlock",
    );
  }

  setMeasureFunc(measureFunc: MeasureFunction | null): void {
    const record = requireNode(undefined, this);
    if (measureFunc !== null && typeof measureFunc !== "function") {
      throw new TypeError("measureFunc must be a function or null");
    }
    if (measureFunc !== null && record.runtime.tree.getChildCount(record.nodeId) !== 0) {
      throw new Error("Measured Yoga nodes cannot have children");
    }
    if (record.measureFunction === measureFunc) return;
    record.runtime.tree.markDirty(record.nodeId);
    record.measureFunction = measureFunc;
    record.runtime.measurementRevision += 1;
    record.measurementRevision = record.runtime.measurementRevision;
  }

  unsetMeasureFunc(): void {
    this.setMeasureFunc(null);
  }

  setDirtiedFunc(dirtiedFunc: DirtiedFunction | null): void {
    const record = requireNode(undefined, this);
    if (dirtiedFunc !== null && typeof dirtiedFunc !== "function") {
      throw new TypeError("dirtiedFunc must be a function or null");
    }
    record.dirtiedFunction = dirtiedFunc;
  }

  unsetDirtiedFunc(): void {
    requireNode(undefined, this).dirtiedFunction = null;
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
    ]) as Direction.LTR | Direction.RTL;
    const availableWidth = requireCalculationDimension(width, "width");
    const availableHeight = requireCalculationDimension(height, "height");
    const subtree = collectSubtree(record);
    const signature: CalculationSignature = {
      width: typeof availableWidth === "number" ? Math.fround(availableWidth) : undefined,
      height: typeof availableHeight === "number" ? Math.fround(availableHeight) : undefined,
      direction: ownerDirection,
      measurementRevision: subtree.reduce(
        (revision, current) => Math.max(revision, current.measurementRevision),
        0,
      ),
    };
    const translationIsStale = syncSubtreeStyles(record, ownerDirection, subtree);
    const recomputeSubtree =
      record.dirty ||
      translationIsStale ||
      subtree.some((current) => current.outputStale) ||
      !sameCalculation(record.lastCalculation, signature);
    const rootHasOwner = record.runtime.tree.getParent(record.nodeId) !== null;
    const calculationStyle = translateCalculationStyle(
      record.declarations,
      record.config,
      record.appliedDirection,
      record.ownerDirection,
      signature.width,
      signature.height,
    );
    const temporaryStyle = calculationStyle.style;
    const ordinaryStyle =
      temporaryStyle === null
        ? null
        : translateStyle(
            record.declarations,
            record.config,
            record.appliedDirection,
            record.ownerDirection,
          );
    for (const current of subtree) current.outputStale = true;
    if (temporaryStyle !== null) record.runtime.tree.setStyle(record.nodeId, temporaryStyle);
    let calculationFailed = false;
    let calculationError: unknown;
    try {
      const options = {
        root: record.nodeId,
        availableSpace: {
          width: availableWidth,
          height: availableHeight,
        },
      };
      if (subtree.some((current) => current.measureFunction !== null)) {
        record.runtime.activeMeasureContext = {
          root: record.nodeId,
          exactWidth: calculationStyle.exactWidth,
          exactHeight: calculationStyle.exactHeight,
        };
        try {
          record.runtime.tree.computeLayoutWithMeasure({
            ...options,
            measure: record.runtime.measure,
          });
        } finally {
          record.runtime.activeMeasureContext = null;
        }
      } else {
        record.runtime.tree.computeLayout(options);
      }
    } catch (error) {
      calculationFailed = true;
      calculationError = error;
    }
    if (ordinaryStyle !== null) {
      try {
        record.runtime.tree.setStyle(record.nodeId, ordinaryStyle);
      } catch (error) {
        throw poisonRuntime(record.runtime, error);
      }
    }
    if (calculationFailed) throw calculationError;

    const subtreeIndices = new Map<NodeId, number>();
    for (const [index, current] of subtree.entries()) {
      subtreeIndices.set(current.nodeId, index);
    }
    const projectionEntries: ProjectionEntry[] = subtree.map((current, index) => {
      let parentIndex: number | null = null;
      if (index !== 0) {
        const parentId = record.runtime.tree.getParent(current.nodeId);
        const resolvedParentIndex = parentId === null ? undefined : subtreeIndices.get(parentId);
        if (resolvedParentIndex === undefined) {
          throw poisonRuntime(record.runtime, new Error("Yoga subtree projection mismatch"));
        }
        parentIndex = resolvedParentIndex;
      }
      return {
        declarations: current.declarations,
        direction: current.appliedDirection,
        pointScaleFactor: current.config.pointScaleFactor,
        measured: current.measureFunction !== null,
        nativeLayout: record.runtime.tree.getUnroundedLayout(current.nodeId),
        parentIndex,
      };
    });
    const outputs = projectOutputs(projectionEntries, {
      ownerWidth: signature.width,
      ownerHeight: signature.height,
      rootHasOwner,
    });
    for (const [index, current] of subtree.entries()) {
      const output = outputs[index];
      current.layout = output.layout;
      current.computedMargin = output.margin;
      current.computedPadding = output.padding;
      current.computedBorder = output.border;
      current.layoutDirection = output.direction;
    }
    for (const current of subtree) {
      current.dirty = false;
      if (recomputeSubtree) current.hasNewLayout = true;
      current.outputStale = false;
    }
    record.hasNewLayout = true;
    record.lastCalculation = signature;
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

  getComputedMargin(edge: Edge): number {
    const record = requireNode(undefined, this);
    return computedEdge(record, record.computedMargin, edge);
  }

  getComputedPadding(edge: Edge): number {
    const record = requireNode(undefined, this);
    return computedEdge(record, record.computedPadding, edge);
  }

  getComputedBorder(edge: Edge): number {
    const record = requireNode(undefined, this);
    return computedEdge(record, record.computedBorder, edge);
  }

  getComputedLayout(): Layout {
    return { ...requireNode(undefined, this).layout };
  }
}

function computedEdge(record: NodeRecord, edges: ComputedEdges, edge: Edge): number {
  const resolved = requireEnum(edge, "computed edge", [
    Edge.Left,
    Edge.Top,
    Edge.Right,
    Edge.Bottom,
    Edge.Start,
    Edge.End,
  ]);
  if (resolved === Edge.Start) {
    return record.layoutDirection === Direction.RTL ? edges.right : edges.left;
  }
  if (resolved === Edge.End) {
    return record.layoutDirection === Direction.RTL ? edges.left : edges.right;
  }
  if (resolved === Edge.Left) return edges.left;
  if (resolved === Edge.Top) return edges.top;
  if (resolved === Edge.Right) return edges.right;
  return edges.bottom;
}

function freeNode(record: NodeRecord): void {
  const survivingAncestors = collectAncestors(record, false);
  const directChildren = record.runtime.tree
    .getChildren(record.nodeId)
    .map((nodeId) => recordForId(record.runtime, nodeId));
  record.runtime.tree.remove(record.nodeId);
  record.runtime.nodes.delete(record.nodeId);
  record.alive = false;
  for (const child of directChildren) child.lastCalculation = undefined;
  try {
    const survivingParent = survivingAncestors[0];
    if (survivingParent !== undefined) record.runtime.tree.markDirty(survivingParent.nodeId);
    for (const child of directChildren) record.runtime.tree.markDirty(child.nodeId);
  } catch (error) {
    throw poisonRuntime(record.runtime, error);
  }
  markDirtyRecords(survivingAncestors);
}

function freeRecursiveNode(record: NodeRecord): void {
  const survivingAncestors = collectAncestors(record, false);
  const postorder = collectSubtree(record).reverse();
  let removed = 0;
  for (const current of postorder) {
    try {
      record.runtime.tree.remove(current.nodeId);
    } catch (error) {
      if (removed > 0) throw poisonRuntime(record.runtime, error);
      throw error;
    }
    record.runtime.nodes.delete(current.nodeId);
    current.alive = false;
    removed += 1;
  }
  const survivingParent = survivingAncestors[0];
  if (survivingParent !== undefined) {
    try {
      record.runtime.tree.markDirty(survivingParent.nodeId);
    } catch (error) {
      throw poisonRuntime(record.runtime, error);
    }
  }
  markDirtyRecords(survivingAncestors);
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
