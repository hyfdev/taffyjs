import { createRequire } from "node:module";
import { NodeIdRegistry, type NodeId, type RandomSource } from "./node-id.js";
import type {
  AvailableSpace,
  ChildRangeInput,
  ComputeLayoutOptions,
  ComputeLayoutWithMeasureOptions,
  DetailedLayoutInfo,
  Layout,
  Size,
  Style,
  StyleInput,
} from "./public-types.js";

type NativeModule = typeof import("#native");
type NativeTree = InstanceType<NativeModule["NativeTaffyTree"]>;

const { NativeTaffyTree } = createRequire(import.meta.url)("#native") as NativeModule;

type PrivateTreeOptions = Readonly<{
  randomSource?: RandomSource;
  nextSerial?: bigint;
}>;

const privateConstructor = Symbol();
type PrivateConstructorArgs = [] | [key: typeof privateConstructor, options: PrivateTreeOptions];

type RawMeasureArgs = {
  knownDimensions: Size<number | undefined>;
  availableSpace: Size<AvailableSpace>;
  node: bigint;
  style: Style;
};

/** Describes the public operations of one independent Taffy tree. */
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging -- The implementation explicitly implements this interface, and the shared name preserves the public constructor name.
export interface TaffyTree<TContext = unknown> {
  /** Enables pixel rounding for subsequently computed public layouts. */ enableRounding(): void;
  /** Disables pixel rounding while retaining unrounded layout values. */ disableRounding(): void;
  /** Creates a leaf node from the supplied public style input. */ newLeaf(
    style: StyleInput,
  ): NodeId;
  /** Creates a leaf node and associates optional JavaScript context. */ newLeafWithContext(
    style: StyleInput,
    context: TContext | undefined,
  ): NodeId;
  /** Creates a parent node with the supplied ordered children. */ newWithChildren(
    style: StyleInput,
    children: readonly NodeId[],
  ): NodeId;
  /** Removes every node and context value from this tree. */ clear(): void;
  /** Removes one node and invalidates its public NodeId. */ remove(node: NodeId): void;
  /** Replaces or clears the JavaScript context for one node. */ setNodeContext(
    node: NodeId,
    context: TContext | undefined,
  ): void;
  /** Returns the JavaScript context currently associated with one node. */ getNodeContext(
    node: NodeId,
  ): TContext | undefined;
  /** Appends an existing node to the parent child list. */ addChild(
    parent: NodeId,
    child: NodeId,
  ): void;
  /** Inserts an existing child at the requested parent index. */ insertChildAtIndex(
    parent: NodeId,
    index: number,
    child: NodeId,
  ): void;
  /** Replaces the complete ordered child list for one parent. */ setChildren(
    parent: NodeId,
    children: readonly NodeId[],
  ): void;
  /** Detaches the selected child from its current parent. */ removeChild(
    parent: NodeId,
    child: NodeId,
  ): void;
  /** Detaches and returns the child at the requested index. */ removeChildAtIndex(
    parent: NodeId,
    index: number,
  ): NodeId;
  /** Detaches children in the supplied half-open index range. */ removeChildrenRange(
    parent: NodeId,
    range: ChildRangeInput,
  ): void;
  /** Replaces and returns the child at the requested index. */ replaceChildAtIndex(
    parent: NodeId,
    index: number,
    newChild: NodeId,
  ): NodeId;
  /** Returns the child at the requested parent index. */ getChildAtIndex(
    parent: NodeId,
    index: number,
  ): NodeId;
  /** Returns the current number of children for one parent. */ getChildCount(
    parent: NodeId,
  ): number;
  /** Returns the number of live nodes owned by this tree. */ getNodeCount(): number;
  /** Returns the current parent or null for a root node. */ getParent(node: NodeId): NodeId | null;
  /** Returns a detached readonly snapshot of the ordered children. */ getChildren(
    parent: NodeId,
  ): readonly NodeId[];
  /** Replaces a node style and marks affected layout state dirty. */ setStyle(
    node: NodeId,
    style: StyleInput,
  ): void;
  /** Returns a detached readable snapshot of the node style. */ getStyle(node: NodeId): Style;
  /** Returns the most recently stored rounded layout snapshot. */ getLayout(node: NodeId): Layout;
  /** Returns the most recently stored unrounded layout snapshot. */ getUnroundedLayout(
    node: NodeId,
  ): Layout;
  /** Returns detailed Grid tracks and item placement when available. */ getDetailedLayoutInfo(
    node: NodeId,
  ): DetailedLayoutInfo;
  /** Explicitly marks a node for layout recomputation. */ markDirty(node: NodeId): void;
  /** Reports whether a node currently needs layout recomputation. */ isDirty(
    node: NodeId,
  ): boolean;
  /** Computes and stores layout for a tree root synchronously. */ computeLayout(
    options: ComputeLayoutOptions,
  ): void;
  /** Computes synchronously with Taffy-controlled measurement caching; changed external data or a different callback requires explicit dirtying. */ computeLayoutWithMeasure(
    options: ComputeLayoutWithMeasureOptions<TContext>,
  ): void;
}

const secureRandom: RandomSource = (bytes) => globalThis.crypto.getRandomValues(bytes);

/** Owns one independent node tree, its contexts, styles, and stored layouts. */
const TaffyTreeImplementation = class TaffyTree<TContext = unknown> implements TaffyTree<TContext> {
  readonly #inner: NativeTree;
  readonly #nodes: NodeIdRegistry;
  readonly #contexts = new Map<NodeId, TContext>();

  constructor(...args: PrivateConstructorArgs) {
    const options = args.length === 2 && args[0] === privateConstructor ? args[1] : {};
    this.#nodes = new NodeIdRegistry(options.randomSource ?? secureRandom, options.nextSerial);
    this.#inner = new NativeTaffyTree();
  }

  /** Enables pixel rounding for subsequently computed public layouts. */
  enableRounding(): void {
    this.#inner.rawEnableRounding("enableRounding");
  }

  /** Disables pixel rounding while retaining unrounded layout values. */
  disableRounding(): void {
    this.#inner.rawDisableRounding("disableRounding");
  }

  /** Returns the number of live nodes owned by this tree. */
  getNodeCount(): number {
    return this.#getNodeCount();
  }

  /** Returns the current number of children for one parent. */
  getChildCount(parent: NodeId): number {
    return this.#getChildCount(parent);
  }

  /** Returns the current parent or null for a root node. */
  getParent(node: NodeId): NodeId | null {
    return this.#getParent(node);
  }

  /** Returns a detached readonly snapshot of the ordered children. */
  getChildren(parent: NodeId): readonly NodeId[] {
    return this.#getChildren(parent);
  }

  /** Returns the child at the requested parent index. */
  getChildAtIndex(parent: NodeId, index: number): NodeId {
    return this.#getChildAtIndex(parent, index);
  }

  /** Appends an existing node to the parent child list. */
  addChild(parent: NodeId, child: NodeId): void {
    this.#addChild(parent, child);
  }

  /** Inserts an existing child at the requested parent index. */
  insertChildAtIndex(parent: NodeId, index: number, child: NodeId): void {
    this.#insertChildAtIndex(parent, index, child);
  }

  /** Replaces the complete ordered child list for one parent. */
  setChildren(parent: NodeId, children: readonly NodeId[]): void {
    this.#setChildren(parent, children);
  }

  /** Detaches the selected child from its current parent. */
  removeChild(parent: NodeId, child: NodeId): void {
    this.#removeChild(parent, child);
  }

  /** Detaches and returns the child at the requested index. */
  removeChildAtIndex(parent: NodeId, index: number): NodeId {
    return this.#removeChildAtIndex(parent, index);
  }

  /** Detaches children in the supplied half-open index range. */
  removeChildrenRange(parent: NodeId, range: ChildRangeInput): void {
    this.#removeChildrenRange(parent, range);
  }

  /** Replaces and returns the child at the requested index. */
  replaceChildAtIndex(parent: NodeId, index: number, newChild: NodeId): NodeId {
    return this.#replaceChildAtIndex(parent, index, newChild);
  }

  /** Creates a leaf node from the supplied public style input. */
  newLeaf(style: StyleInput): NodeId {
    return this.#newLeaf(style);
  }

  /** Creates a leaf node and associates optional JavaScript context. */
  newLeafWithContext(style: StyleInput, context: TContext | undefined): NodeId {
    return this.#newLeafWithContext(style, context);
  }

  /** Creates a parent node with the supplied ordered children. */
  newWithChildren(style: StyleInput, children: readonly NodeId[]): NodeId {
    return this.#newWithChildren(style, children);
  }

  /** Removes one node and invalidates its public NodeId. */
  remove(node: NodeId): void {
    this.#remove(node);
  }

  /** Returns the JavaScript context currently associated with one node. */
  getNodeContext(node: NodeId): TContext | undefined {
    return this.#getNodeContext(node);
  }

  /** Replaces or clears the JavaScript context for one node. */
  setNodeContext(node: NodeId, context: TContext | undefined): void {
    this.#setNodeContext(node, context);
  }

  /** Replaces a node style and marks affected layout state dirty. */
  setStyle(node: NodeId, style: StyleInput): void {
    const raw = this.#nodes.resolve(node);
    this.#inner.rawSetStyle(raw, style, "setStyle");
  }

  /** Returns a detached readable snapshot of the node style. */
  getStyle(node: NodeId): Style {
    return this.#getStyle(node);
  }

  /** Returns the most recently stored rounded layout snapshot. */
  getLayout(node: NodeId): Layout {
    return this.#getLayout(node);
  }

  /** Returns the most recently stored unrounded layout snapshot. */
  getUnroundedLayout(node: NodeId): Layout {
    return this.#getUnroundedLayout(node);
  }

  /** Returns detailed Grid tracks and item placement when available. */
  getDetailedLayoutInfo(node: NodeId): DetailedLayoutInfo {
    return this.#getDetailedLayoutInfo(node);
  }

  /** Explicitly marks a node for layout recomputation. */
  markDirty(node: NodeId): void {
    this.#markDirty(node);
  }

  /** Reports whether a node currently needs layout recomputation. */
  isDirty(node: NodeId): boolean {
    return this.#isDirty(node);
  }

  /** Removes every node and context value from this tree. */
  clear(): void {
    this.#clear();
  }

  /** Computes and stores layout for a tree root synchronously. */
  computeLayout(options: ComputeLayoutOptions): void {
    this.#computeLayout(options);
  }

  /** Computes synchronously with a per-call measurement callback. */
  computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void {
    this.#computeLayoutWithMeasure(options);
  }

  #newLeaf(style: StyleInput): NodeId {
    const serial = this.#nodes.reserveSerial();
    const raw = this.#inner.rawNewLeaf(style, "newLeaf");
    return this.#nodes.register(raw, serial);
  }

  #newLeafWithContext(style: StyleInput, context: TContext | undefined): NodeId {
    const serial = this.#nodes.reserveSerial();
    const hasContext = context !== undefined;
    const raw = this.#inner.rawNewLeafWithContext(style, hasContext, "newLeafWithContext");
    const node = this.#nodes.register(raw, serial);
    if (context !== undefined) this.#contexts.set(node, context);
    return node;
  }

  #newWithChildren(style: StyleInput, children: readonly NodeId[]): NodeId {
    if (!Array.isArray(children)) throw new TypeError("children must be an array");
    const rawChildren = Array.from(children, (child) => this.#nodes.resolve(child));
    const serial = this.#nodes.reserveSerial();
    const raw = this.#inner.rawNewWithChildren(style, rawChildren, "newWithChildren");
    return this.#nodes.register(raw, serial);
  }

  #remove(node: NodeId): void {
    const raw = this.#nodes.resolve(node);
    this.#inner.rawRemove(raw, "remove");
    this.#nodes.unregister(node, raw);
    this.#contexts.delete(node);
  }

  #getNodeContext(node: NodeId): TContext | undefined {
    this.#nodes.resolve(node);
    return this.#contexts.get(node);
  }

  #setNodeContext(node: NodeId, context: TContext | undefined): void {
    const raw = this.#nodes.resolve(node);
    this.#inner.rawSetNodeContext(raw, context !== undefined, "setNodeContext");
    if (context === undefined) this.#contexts.delete(node);
    else this.#contexts.set(node, context);
  }

  #clear(): void {
    this.#inner.rawClear("clear");
    this.#nodes.clear();
    this.#contexts.clear();
  }

  #getChildCount(parent: NodeId): number {
    const rawParent = this.#nodes.resolve(parent);
    return this.#inner.rawChildCount(rawParent, "getChildCount");
  }

  #getParent(node: NodeId): NodeId | null {
    const rawNode = this.#nodes.resolve(node);
    const rawParent = this.#inner.rawParent(rawNode, "getParent");
    return rawParent === null ? null : this.#nodes.fromRaw(rawParent);
  }

  #getChildren(parent: NodeId): readonly NodeId[] {
    const rawParent = this.#nodes.resolve(parent);
    return this.#inner
      .rawChildren(rawParent, "getChildren")
      .map((child) => this.#nodes.fromRaw(child));
  }

  #getNodeCount(): number {
    return this.#inner.rawNodeCount("getNodeCount");
  }

  #getStyle(node: NodeId): Style {
    const raw = this.#nodes.resolve(node);
    return this.#inner.rawGetStyle(raw, "getStyle") as Style;
  }

  #getLayout(node: NodeId): Layout {
    const raw = this.#nodes.resolve(node);
    return this.#inner.rawGetLayout(raw, "getLayout");
  }

  #getUnroundedLayout(node: NodeId): Layout {
    const raw = this.#nodes.resolve(node);
    return this.#inner.rawGetUnroundedLayout(raw, "getUnroundedLayout");
  }

  #getDetailedLayoutInfo(node: NodeId): DetailedLayoutInfo {
    const raw = this.#nodes.resolve(node);
    return this.#inner.rawGetDetailedLayoutInfo(raw, "getDetailedLayoutInfo") as DetailedLayoutInfo;
  }

  #markDirty(node: NodeId): void {
    const raw = this.#nodes.resolve(node);
    this.#inner.rawMarkDirty(raw, "markDirty");
  }

  #isDirty(node: NodeId): boolean {
    const raw = this.#nodes.resolve(node);
    return this.#inner.rawIsDirty(raw, "isDirty");
  }

  #computeLayout(options: ComputeLayoutOptions): void {
    const rawRoot = this.#nodes.resolve(options.root);
    this.#inner.rawComputeLayout(rawRoot, options.availableSpace, "computeLayout");
  }

  #computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void {
    const rawRoot = this.#nodes.resolve(options.root);
    const measure = options.measure;
    this.#inner.rawComputeLayoutWithMeasure(
      rawRoot,
      options.availableSpace,
      (value) => {
        const args = value as RawMeasureArgs;
        const node = this.#nodes.fromRaw(args.node);
        return measure({
          knownDimensions: args.knownDimensions,
          availableSpace: args.availableSpace,
          node,
          context: this.#contexts.get(node),
          style: args.style,
        });
      },
      "computeLayoutWithMeasure",
    );
  }

  #getChildAtIndex(parent: NodeId, index: number): NodeId {
    const rawParent = this.#nodes.resolve(parent);
    const rawChild = this.#inner.rawChildAtIndex(rawParent, index, "getChildAtIndex");
    return this.#nodes.fromRaw(rawChild);
  }

  #addChild(parent: NodeId, child: NodeId): void {
    const rawParent = this.#nodes.resolve(parent);
    const rawChild = this.#nodes.resolve(child);
    this.#inner.rawAddChild(rawParent, rawChild, "addChild");
  }

  #insertChildAtIndex(parent: NodeId, index: number, child: NodeId): void {
    const rawParent = this.#nodes.resolve(parent);
    const rawChild = this.#nodes.resolve(child);
    this.#inner.rawInsertChildAtIndex(rawParent, index, rawChild, "insertChildAtIndex");
  }

  #setChildren(parent: NodeId, children: readonly NodeId[]): void {
    const rawParent = this.#nodes.resolve(parent);
    if (!Array.isArray(children)) throw new TypeError("children must be an array");
    const rawChildren = Array.from(children, (child) => this.#nodes.resolve(child));
    this.#inner.rawSetChildren(rawParent, rawChildren, "setChildren");
  }

  #removeChild(parent: NodeId, child: NodeId): void {
    const rawParent = this.#nodes.resolve(parent);
    const rawChild = this.#nodes.resolve(child);
    this.#inner.rawRemoveChild(rawParent, rawChild, "removeChild");
  }

  #removeChildAtIndex(parent: NodeId, index: number): NodeId {
    const rawParent = this.#nodes.resolve(parent);
    const rawChild = this.#inner.rawRemoveChildAtIndex(rawParent, index, "removeChildAtIndex");
    return this.#nodes.fromRaw(rawChild);
  }

  #removeChildrenRange(parent: NodeId, range: ChildRangeInput): void {
    const rawParent = this.#nodes.resolve(parent);
    this.#inner.rawRemoveChildrenRange(rawParent, range, "removeChildrenRange");
  }

  #replaceChildAtIndex(parent: NodeId, index: number, newChild: NodeId): NodeId {
    const rawParent = this.#nodes.resolve(parent);
    const rawNewChild = this.#nodes.resolve(newChild);
    const rawOldChild = this.#inner.rawReplaceChildAtIndex(
      rawParent,
      index,
      rawNewChild,
      "replaceChildAtIndex",
    );
    return this.#nodes.fromRaw(rawOldChild);
  }
};

interface TaffyTreeConstructor {
  // oxlint-disable-next-line typescript/no-explicit-any -- A generic class constructor exposes its prototype with the same TypeScript any behavior.
  readonly prototype: TaffyTree<any>;
  new <TContext = unknown>(): TaffyTree<TContext>;
}

/** Creates an independent Taffy tree with its own NodeId namespace. */
export const TaffyTree: TaffyTreeConstructor = TaffyTreeImplementation;

export function createTaffyTreeForTesting(options: PrivateTreeOptions = {}): TaffyTree<unknown> {
  return new TaffyTreeImplementation(privateConstructor, options);
}

export type { NodeId };
