import { createRequire } from "node:module";
import { NodeIdRegistry, type NodeId } from "./node-id.js";
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

type RawMeasureArgs = {
  knownDimensions: Size<number | undefined>;
  availableSpace: Size<AvailableSpace>;
  node: bigint;
  style: Style;
};

function checkedChildIndex(index: number): number {
  if (typeof index !== "number") throw new TypeError("Child index must be a number");
  return index;
}

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

const TaffyTreeImplementation = class TaffyTree<TContext = unknown> implements TaffyTree<TContext> {
  readonly #inner: NativeTree;
  readonly #nodes = new NodeIdRegistry();
  readonly #contexts = new Map<NodeId, TContext>();

  constructor() {
    this.#inner = new NativeTaffyTree();
  }

  enableRounding(): void {
    this.#inner.rawEnableRounding();
  }

  disableRounding(): void {
    this.#inner.rawDisableRounding();
  }

  getNodeCount(): number {
    return this.#inner.rawNodeCount();
  }

  getChildCount(parent: NodeId): number {
    return this.#inner.rawChildCount(this.#nodes.resolve(parent));
  }

  getParent(node: NodeId): NodeId | null {
    const rawParent = this.#inner.rawParent(this.#nodes.resolve(node));
    return rawParent === null ? null : this.#nodes.fromRaw(rawParent);
  }

  getChildren(parent: NodeId): readonly NodeId[] {
    return this.#inner
      .rawChildren(this.#nodes.resolve(parent))
      .map((child) => this.#nodes.fromRaw(child));
  }

  getChildAtIndex(parent: NodeId, index: number): NodeId {
    const rawChild = this.#inner.rawChildAtIndex(
      this.#nodes.resolve(parent),
      checkedChildIndex(index),
    );
    return this.#nodes.fromRaw(rawChild);
  }

  addChild(parent: NodeId, child: NodeId): void {
    const rawParent = this.#nodes.resolve(parent);
    const rawChild = this.#nodes.resolve(child);
    this.#inner.rawAddChild(rawParent, rawChild);
  }

  insertChildAtIndex(parent: NodeId, index: number, child: NodeId): void {
    const rawParent = this.#nodes.resolve(parent);
    const rawChild = this.#nodes.resolve(child);
    this.#inner.rawInsertChildAtIndex(rawParent, checkedChildIndex(index), rawChild);
  }

  setChildren(parent: NodeId, children: readonly NodeId[]): void {
    const rawParent = this.#nodes.resolve(parent);
    if (!Array.isArray(children)) throw new TypeError("children must be an array");
    const rawChildren = Array.from(children, (child) => this.#nodes.resolve(child));
    this.#inner.rawSetChildren(rawParent, rawChildren);
  }

  removeChild(parent: NodeId, child: NodeId): void {
    const rawParent = this.#nodes.resolve(parent);
    const rawChild = this.#nodes.resolve(child);
    this.#inner.rawRemoveChild(rawParent, rawChild);
  }

  removeChildAtIndex(parent: NodeId, index: number): NodeId {
    const rawChild = this.#inner.rawRemoveChildAtIndex(
      this.#nodes.resolve(parent),
      checkedChildIndex(index),
    );
    return this.#nodes.fromRaw(rawChild);
  }

  removeChildrenRange(parent: NodeId, range: ChildRangeInput): void {
    this.#inner.rawRemoveChildrenRange(this.#nodes.resolve(parent), range);
  }

  replaceChildAtIndex(parent: NodeId, index: number, newChild: NodeId): NodeId {
    const rawParent = this.#nodes.resolve(parent);
    const rawNewChild = this.#nodes.resolve(newChild);
    const rawOldChild = this.#inner.rawReplaceChildAtIndex(
      rawParent,
      checkedChildIndex(index),
      rawNewChild,
    );
    return this.#nodes.fromRaw(rawOldChild);
  }

  newLeaf(style: StyleInput): NodeId {
    const serial = this.#nodes.reserveSerial();
    return this.#nodes.register(this.#inner.rawNewLeaf(style), serial);
  }

  newLeafWithContext(style: StyleInput, context: TContext | undefined): NodeId {
    const serial = this.#nodes.reserveSerial();
    const raw = this.#inner.rawNewLeafWithContext(style, context !== undefined);
    const node = this.#nodes.register(raw, serial);
    if (context !== undefined) this.#contexts.set(node, context);
    return node;
  }

  newWithChildren(style: StyleInput, children: readonly NodeId[]): NodeId {
    if (!Array.isArray(children)) throw new TypeError("children must be an array");
    const rawChildren = Array.from(children, (child) => this.#nodes.resolve(child));
    const serial = this.#nodes.reserveSerial();
    return this.#nodes.register(this.#inner.rawNewWithChildren(style, rawChildren), serial);
  }

  remove(node: NodeId): void {
    const raw = this.#nodes.resolve(node);
    this.#inner.rawRemove(raw);
    this.#nodes.unregister(node, raw);
    this.#contexts.delete(node);
  }

  getNodeContext(node: NodeId): TContext | undefined {
    this.#nodes.resolve(node);
    return this.#contexts.get(node);
  }

  setNodeContext(node: NodeId, context: TContext | undefined): void {
    const raw = this.#nodes.resolve(node);
    this.#inner.rawSetNodeContext(raw, context !== undefined);
    if (context === undefined) this.#contexts.delete(node);
    else this.#contexts.set(node, context);
  }

  setStyle(node: NodeId, style: StyleInput): void {
    this.#inner.rawSetStyle(this.#nodes.resolve(node), style);
  }

  getStyle(node: NodeId): Style {
    return this.#inner.rawGetStyle(this.#nodes.resolve(node)) as Style;
  }

  getLayout(node: NodeId): Layout {
    return this.#inner.rawGetLayout(this.#nodes.resolve(node));
  }

  getUnroundedLayout(node: NodeId): Layout {
    return this.#inner.rawGetUnroundedLayout(this.#nodes.resolve(node));
  }

  getDetailedLayoutInfo(node: NodeId): DetailedLayoutInfo {
    return this.#inner.rawGetDetailedLayoutInfo(this.#nodes.resolve(node)) as DetailedLayoutInfo;
  }

  markDirty(node: NodeId): void {
    this.#inner.rawMarkDirty(this.#nodes.resolve(node));
  }

  isDirty(node: NodeId): boolean {
    return this.#inner.rawIsDirty(this.#nodes.resolve(node));
  }

  clear(): void {
    this.#inner.rawClear();
    this.#nodes.clear();
    this.#contexts.clear();
  }

  computeLayout(options: ComputeLayoutOptions): void {
    this.#inner.rawComputeLayout(this.#nodes.resolve(options.root), options.availableSpace);
  }

  computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void {
    this.#inner.rawComputeLayoutWithMeasure(
      this.#nodes.resolve(options.root),
      options.availableSpace,
      (value) => {
        const args = value as RawMeasureArgs;
        const node = this.#nodes.fromRaw(args.node);
        return options.measure({
          knownDimensions: args.knownDimensions,
          availableSpace: args.availableSpace,
          node,
          context: this.#contexts.get(node),
          style: args.style,
        });
      },
    );
  }
};

interface TaffyTreeConstructor {
  // oxlint-disable-next-line typescript/no-explicit-any -- A generic class constructor exposes its prototype with the same TypeScript any behavior.
  readonly prototype: TaffyTree<any>;
  new <TContext = unknown>(): TaffyTree<TContext>;
}

/** Creates an independent Taffy tree with its own NodeId namespace. */
export const TaffyTree: TaffyTreeConstructor = TaffyTreeImplementation;

export type { NodeId };
