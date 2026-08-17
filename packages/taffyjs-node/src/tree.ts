import { BindingTaffyTree } from "./binding.js";
import { NodeIdRegistry, type NodeId } from "./node-id.js";
import type {
  ChildRangeInput,
  ComputeLayoutOptions,
  DetailedLayoutInfo,
  Layout,
  MeasureFunction,
  Size,
  Style,
  StyleInput,
  StyleUpdate,
} from "./public-types.js";
import type { AvailableSpace } from "./tagged-values.js";

type RawMeasureArgs = {
  knownDimensions: Size<number | undefined>;
  availableSpace: Size<AvailableSpace>;
  node: bigint;
  getStyle: () => Style;
};

function checkedChildIndex(index: number): number {
  if (typeof index !== "number") throw new TypeError("Child index must be a number");
  return index;
}

/** Owns one independent node tree, its contexts, styles, and stored layouts. */
export class TaffyTree<TContext = unknown> {
  readonly #inner: BindingTaffyTree;
  readonly #nodes = new NodeIdRegistry();
  readonly #contexts = new Map<NodeId, TContext>();
  readonly #measures = new Map<NodeId, MeasureFunction<TContext>>();

  /** Creates an independent Taffy tree with its own NodeId namespace. */
  constructor() {
    this.#inner = new BindingTaffyTree();
  }

  /** Enables pixel rounding for subsequently computed public layouts. */
  enableRounding(): void {
    this.#inner.rawEnableRounding();
  }

  /** Disables pixel rounding while retaining unrounded layout values. */
  disableRounding(): void {
    this.#inner.rawDisableRounding();
  }

  /** Returns the number of live nodes owned by this tree. */
  getNodeCount(): number {
    return this.#inner.rawGetNodeCount();
  }

  /** Returns the current number of children for one parent. */
  getChildCount(parent: NodeId): number {
    return this.#inner.rawGetChildCount(this.#nodes.resolve(parent));
  }

  /** Returns the current parent or null for a root node. */
  getParent(node: NodeId): NodeId | null {
    const rawParent = this.#inner.rawGetParent(this.#nodes.resolve(node));
    return rawParent === null ? null : this.#nodes.fromRaw(rawParent);
  }

  /** Returns a detached readonly snapshot of the ordered children. */
  getChildren(parent: NodeId): readonly NodeId[] {
    return this.#inner
      .rawGetChildren(this.#nodes.resolve(parent))
      .map((child) => this.#nodes.fromRaw(child));
  }

  /** Returns the child at the requested parent index. */
  getChildAtIndex(parent: NodeId, index: number): NodeId {
    const rawChild = this.#inner.rawGetChildAtIndex(
      this.#nodes.resolve(parent),
      checkedChildIndex(index),
    );
    return this.#nodes.fromRaw(rawChild);
  }

  /** Appends an existing node to the parent child list. */
  addChild(parent: NodeId, child: NodeId): void {
    const rawParent = this.#nodes.resolve(parent);
    const rawChild = this.#nodes.resolve(child);
    this.#inner.rawAddChild(rawParent, rawChild);
  }

  /** Inserts an existing child at the requested parent index. */
  insertChildAtIndex(parent: NodeId, index: number, child: NodeId): void {
    const rawParent = this.#nodes.resolve(parent);
    const rawChild = this.#nodes.resolve(child);
    this.#inner.rawInsertChildAtIndex(rawParent, checkedChildIndex(index), rawChild);
  }

  /** Replaces the complete ordered child list for one parent. */
  setChildren(parent: NodeId, children: readonly NodeId[]): void {
    const rawParent = this.#nodes.resolve(parent);
    if (!Array.isArray(children)) throw new TypeError("children must be an array");
    const rawChildren = Array.from(children, (child) => this.#nodes.resolve(child));
    this.#inner.rawSetChildren(rawParent, rawChildren);
  }

  /** Detaches the selected child from its current parent. */
  removeChild(parent: NodeId, child: NodeId): void {
    const rawParent = this.#nodes.resolve(parent);
    const rawChild = this.#nodes.resolve(child);
    this.#inner.rawRemoveChild(rawParent, rawChild);
  }

  /** Detaches and returns the child at the requested index. */
  removeChildAtIndex(parent: NodeId, index: number): NodeId {
    const rawChild = this.#inner.rawRemoveChildAtIndex(
      this.#nodes.resolve(parent),
      checkedChildIndex(index),
    );
    return this.#nodes.fromRaw(rawChild);
  }

  /** Detaches children in the supplied half-open index range. */
  removeChildrenRange(parent: NodeId, range: ChildRangeInput): void {
    this.#inner.rawRemoveChildrenRange(this.#nodes.resolve(parent), range);
  }

  /** Replaces and returns the child at the requested index. */
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

  /** Creates a leaf node from the supplied public style input. */
  newLeaf(style: StyleInput): NodeId {
    const serial = this.#nodes.reserveSerial();
    return this.#nodes.register(this.#inner.rawNewLeaf(style), serial);
  }

  /** Creates a leaf node and associates optional JavaScript context. */
  newLeafWithContext(style: StyleInput, context: TContext | undefined): NodeId {
    const serial = this.#nodes.reserveSerial();
    const raw = this.#inner.rawNewLeafWithContext(style, context !== undefined);
    const node = this.#nodes.register(raw, serial);
    if (context !== undefined) this.#contexts.set(node, context);
    return node;
  }

  /** Creates a parent node with the supplied ordered children. */
  newWithChildren(style: StyleInput, children: readonly NodeId[]): NodeId {
    if (!Array.isArray(children)) throw new TypeError("children must be an array");
    const rawChildren = Array.from(children, (child) => this.#nodes.resolve(child));
    const serial = this.#nodes.reserveSerial();
    return this.#nodes.register(this.#inner.rawNewWithChildren(style, rawChildren), serial);
  }

  /** Removes one node, its context and measure function, and invalidates its public NodeId. */
  remove(node: NodeId): void {
    const raw = this.#nodes.resolve(node);
    this.#inner.rawRemove(raw);
    this.#nodes.unregister(node, raw);
    this.#contexts.delete(node);
    this.#measures.delete(node);
  }

  /** Returns the JavaScript context currently associated with one node. */
  getNodeContext(node: NodeId): TContext | undefined {
    this.#nodes.resolve(node);
    return this.#contexts.get(node);
  }

  /** Replaces or clears the JavaScript context for one node. */
  setNodeContext(node: NodeId, context: TContext | undefined): void {
    const raw = this.#nodes.resolve(node);
    this.#inner.rawSetNodeContext(raw, context !== undefined);
    if (context === undefined) this.#contexts.delete(node);
    else this.#contexts.set(node, context);
  }

  /** Sets or clears this node's synchronous measure function; every call marks it dirty, including when the function identity is unchanged. */
  setMeasure(node: NodeId, measure: MeasureFunction<TContext> | undefined): void {
    const raw = this.#nodes.resolve(node);
    if (measure !== undefined && typeof measure !== "function") {
      throw new TypeError("measure must be a function or undefined");
    }
    this.#inner.rawSetMeasure(raw, measure !== undefined);
    if (measure === undefined) this.#measures.delete(node);
    else this.#measures.set(node, measure);
  }

  /** Replaces a node style and marks affected layout state dirty. */
  setStyle(node: NodeId, style: StyleInput): void {
    this.#inner.rawSetStyle(this.#nodes.resolve(node), style);
  }

  /** Updates supplied style fields and geometry components, preserving omitted values. */
  updateStyle(node: NodeId, update: StyleUpdate): void {
    this.#inner.rawUpdateStyle(this.#nodes.resolve(node), update);
  }

  /** Returns a detached readable snapshot of the node style. */
  getStyle(node: NodeId): Style {
    return this.#inner.rawGetStyle(this.#nodes.resolve(node)) as Style;
  }

  /** Returns the most recently stored layout selected by the tree's current rounding mode. */
  getLayout(node: NodeId): Layout {
    return this.#inner.rawGetLayout(this.#nodes.resolve(node));
  }

  /** Returns the most recently stored unrounded layout snapshot. */
  getUnroundedLayout(node: NodeId): Layout {
    return this.#inner.rawGetUnroundedLayout(this.#nodes.resolve(node));
  }

  /** Returns detailed Grid tracks and item placement when available. */
  getDetailedLayoutInfo(node: NodeId): DetailedLayoutInfo {
    return this.#inner.rawGetDetailedLayoutInfo(this.#nodes.resolve(node)) as DetailedLayoutInfo;
  }

  /** Explicitly marks a node for layout recomputation. */
  markDirty(node: NodeId): void {
    this.#inner.rawMarkDirty(this.#nodes.resolve(node));
  }

  /** Reports whether a node currently needs layout recomputation. */
  isDirty(node: NodeId): boolean {
    return this.#inner.rawIsDirty(this.#nodes.resolve(node));
  }

  /** Removes every node, context value, and per-node measure function from this tree. */
  clear(): void {
    this.#inner.rawClear();
    this.#nodes.clear();
    this.#contexts.clear();
    this.#measures.clear();
  }

  /** Computes and stores layout synchronously with configured per-node measures and an optional global fallback. */
  computeLayout(options: ComputeLayoutOptions<TContext>): void {
    const root = this.#nodes.resolve(options.root);
    const measure = options.measure;
    if (measure !== undefined && typeof measure !== "function") {
      throw new TypeError("measure must be a function or undefined");
    }
    if (this.#measures.size === 0 && measure === undefined) {
      this.#inner.rawComputeLayout(root, options.availableSpace);
      return;
    }
    this.#computeMeasuredLayout(root, options.availableSpace, measure);
  }

  #computeMeasuredLayout(
    root: bigint,
    availableSpace: ComputeLayoutOptions<TContext>["availableSpace"],
    fallback: MeasureFunction<TContext> | undefined,
  ): void {
    this.#inner.rawComputeLayoutWithMeasure(
      root,
      availableSpace,
      (value) => {
        const args = value as RawMeasureArgs;
        const node = this.#nodes.fromRaw(args.node);
        const measure = this.#measures.get(node) ?? fallback;
        if (measure === undefined) {
          throw new Error("Native measure marker has no JavaScript measure function");
        }
        return measure({
          knownDimensions: args.knownDimensions,
          availableSpace: args.availableSpace,
          node,
          context: this.#contexts.get(node),
          getStyle: args.getStyle,
        });
      },
      fallback !== undefined,
    );
  }
}
