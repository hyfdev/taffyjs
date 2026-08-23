import { BindingTaffyTree } from "./binding.js";
import { layoutCodecByteLength, decodeLayout, type Layout } from "./layout-codec.js";
import { toRawNodeId, type NodeId } from "./node-id.js";
import { type StyleInput, type StyleUpdate, withEncodedStyle } from "./style-input.js";
import type {
  ChildRangeInput,
  ComputeLayoutOptions,
  DetailedLayoutInfo,
  MeasureFunction,
  Size,
  Style,
} from "./public-types.js";
import { AvailableSpaceKind } from "./numeric-families.js";
import type { AvailableSpace } from "./tagged-values.js";

// Slot order and tag layout of the private measure-constraint record.
// Keep identical to crates/taffyjs_binding/src/measure.rs.
const CONSTRAINT_SLOTS = 7;
const SLOT_KNOWN_WIDTH = 0;
const SLOT_KNOWN_HEIGHT = 1;
const SLOT_AVAILABLE_WIDTH = 2;
const SLOT_AVAILABLE_HEIGHT = 3;
const SLOT_TAGS = 4;
const SLOT_NODE_LOW = 5;
const SLOT_NODE_HIGH = 6;
const TAG_KNOWN_WIDTH_PRESENT = 1;
const TAG_KNOWN_HEIGHT_PRESENT = 1 << 1;
const TAG_AVAILABLE_WIDTH_SHIFT = 2;
const TAG_AVAILABLE_HEIGHT_SHIFT = 4;
const TAG_KIND_MASK = 3;

// One record serves every compute. The callback decodes it completely before it invokes the user
// function, so a measure callback that lays out another tree cannot disturb an outer request.
const constraintRecord = new Float64Array(new ArrayBuffer(CONSTRAINT_SLOTS * 8));

interface MeasureConstraints {
  readonly knownDimensions: Size<number | undefined>;
  readonly availableSpace: Size<AvailableSpace>;
  readonly node: bigint;
}

function availableSpaceConstraint(value: number, kind: number): AvailableSpace {
  if (kind === AvailableSpaceKind.MinContent) return { kind: AvailableSpaceKind.MinContent };
  if (kind === AvailableSpaceKind.MaxContent) return { kind: AvailableSpaceKind.MaxContent };
  return { kind: AvailableSpaceKind.Definite, value };
}

function decodeConstraints(slots: Float64Array): MeasureConstraints {
  const tags = slots[SLOT_TAGS];
  return {
    knownDimensions: {
      width: (tags & TAG_KNOWN_WIDTH_PRESENT) === 0 ? undefined : slots[SLOT_KNOWN_WIDTH],
      height: (tags & TAG_KNOWN_HEIGHT_PRESENT) === 0 ? undefined : slots[SLOT_KNOWN_HEIGHT],
    },
    availableSpace: {
      width: availableSpaceConstraint(
        slots[SLOT_AVAILABLE_WIDTH],
        (tags >>> TAG_AVAILABLE_WIDTH_SHIFT) & TAG_KIND_MASK,
      ),
      height: availableSpaceConstraint(
        slots[SLOT_AVAILABLE_HEIGHT],
        (tags >>> TAG_AVAILABLE_HEIGHT_SHIFT) & TAG_KIND_MASK,
      ),
    },
    node: (BigInt(slots[SLOT_NODE_HIGH]) << 32n) | BigInt(slots[SLOT_NODE_LOW]),
  };
}

const DEFAULT_STYLE_INPUT: StyleInput = {};

// The two private writers are synchronous and cannot invoke JavaScript, so one module-local
// scratch buffer is decoded before another public getter can reuse it. The buffer is built over
// an explicit ArrayBuffer because JavaScriptCore materializes the backing buffer of a
// length-constructed typed array lazily, and Bun loses the first pointer write into any such
// buffer; an eagerly allocated buffer gives every runtime the same stable backing store.
const layoutCodecBuffer = new Float64Array(new ArrayBuffer(layoutCodecByteLength));

function checkedChildIndex(index: number): number {
  if (typeof index !== "number") throw new TypeError("Child index must be a number");
  return index;
}

/** Owns one independent node tree, its contexts, styles, and stored layouts. */
export class TaffyTree<TContext = unknown> {
  readonly #inner: BindingTaffyTree;
  readonly #contexts = new Map<NodeId, TContext>();
  readonly #measures = new Map<NodeId, MeasureFunction<TContext>>();

  /** Creates an independent Taffy tree. */
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
    return this.#inner.rawGetChildCount(toRawNodeId(parent));
  }

  /** Returns the current parent or null for a root node. */
  getParent(node: NodeId): NodeId | null {
    const rawParent = this.#inner.rawGetParent(toRawNodeId(node));
    return rawParent as NodeId | null;
  }

  /** Returns a detached readonly snapshot of the ordered children. */
  getChildren(parent: NodeId): readonly NodeId[] {
    return this.#inner.rawGetChildren(toRawNodeId(parent)) as NodeId[];
  }

  /** Returns the child at the requested parent index. */
  getChildAtIndex(parent: NodeId, index: number): NodeId {
    const rawChild = this.#inner.rawGetChildAtIndex(toRawNodeId(parent), checkedChildIndex(index));
    return rawChild as NodeId;
  }

  /** Appends an existing node to the parent child list. */
  addChild(parent: NodeId, child: NodeId): void {
    const rawParent = toRawNodeId(parent);
    const rawChild = toRawNodeId(child);
    this.#inner.rawAddChild(rawParent, rawChild);
  }

  /** Inserts an existing child at the requested parent index. */
  insertChildAtIndex(parent: NodeId, index: number, child: NodeId): void {
    const rawParent = toRawNodeId(parent);
    const rawChild = toRawNodeId(child);
    this.#inner.rawInsertChildAtIndex(rawParent, checkedChildIndex(index), rawChild);
  }

  /** Replaces the complete ordered child list for one parent. */
  setChildren(parent: NodeId, children: readonly NodeId[]): void {
    const rawParent = toRawNodeId(parent);
    if (!Array.isArray(children)) throw new TypeError("children must be an array");
    const rawChildren = Array.from(children, (child) => toRawNodeId(child));
    this.#inner.rawSetChildren(rawParent, rawChildren);
  }

  /** Detaches the selected child from its current parent. */
  removeChild(parent: NodeId, child: NodeId): void {
    const rawParent = toRawNodeId(parent);
    const rawChild = toRawNodeId(child);
    this.#inner.rawRemoveChild(rawParent, rawChild);
  }

  /** Detaches and returns the child at the requested index. */
  removeChildAtIndex(parent: NodeId, index: number): NodeId {
    const rawChild = this.#inner.rawRemoveChildAtIndex(
      toRawNodeId(parent),
      checkedChildIndex(index),
    );
    return rawChild as NodeId;
  }

  /** Detaches children in the supplied half-open index range. */
  removeChildrenRange(parent: NodeId, range: ChildRangeInput): void {
    this.#inner.rawRemoveChildrenRange(toRawNodeId(parent), range);
  }

  /** Replaces and returns the child at the requested index. */
  replaceChildAtIndex(parent: NodeId, index: number, newChild: NodeId): NodeId {
    const rawParent = toRawNodeId(parent);
    const rawNewChild = toRawNodeId(newChild);
    const rawOldChild = this.#inner.rawReplaceChildAtIndex(
      rawParent,
      checkedChildIndex(index),
      rawNewChild,
    );
    return rawOldChild as NodeId;
  }

  /** Creates a leaf node, using Taffy's defaults when style is omitted. */
  newLeaf(style: StyleInput = DEFAULT_STYLE_INPUT): NodeId {
    return withEncodedStyle(style, (encoded) => this.#inner.rawNewLeaf(encoded) as NodeId);
  }

  /** Creates a leaf node with JavaScript context and an optional style. */
  newLeafWithContext(
    context: TContext | undefined,
    style: StyleInput = DEFAULT_STYLE_INPUT,
  ): NodeId {
    return withEncodedStyle(style, (encoded) => {
      const node = this.#inner.rawNewLeafWithContext(encoded, context !== undefined) as NodeId;
      if (context !== undefined) this.#contexts.set(node, context);
      return node;
    });
  }

  /** Creates a parent from ordered children and an optional style. */
  newWithChildren(children: readonly NodeId[], style: StyleInput = DEFAULT_STYLE_INPUT): NodeId {
    if (!Array.isArray(children)) throw new TypeError("children must be an array");
    const rawChildren = Array.from(children, (child) => toRawNodeId(child));
    return withEncodedStyle(
      style,
      (encoded) => this.#inner.rawNewWithChildren(encoded, rawChildren) as NodeId,
    );
  }

  /** Removes one node and releases its context and measure function. The NodeId must not be used again. */
  remove(node: NodeId): void {
    const raw = toRawNodeId(node);
    this.#inner.rawRemove(raw);
    this.#contexts.delete(node);
    this.#measures.delete(node);
  }

  /** Returns the JavaScript context currently associated with one node. */
  getNodeContext(node: NodeId): TContext | undefined {
    toRawNodeId(node);
    return this.#contexts.get(node);
  }

  /** Replaces or clears the JavaScript context for one node. */
  setNodeContext(node: NodeId, context: TContext | undefined): void {
    const raw = toRawNodeId(node);
    this.#inner.rawSetNodeContext(raw, context !== undefined);
    if (context === undefined) this.#contexts.delete(node);
    else this.#contexts.set(node, context);
  }

  /** Sets or clears this node's synchronous measure function; every call marks it dirty, including when the function identity is unchanged. */
  setMeasure(node: NodeId, measure: MeasureFunction<TContext> | undefined): void {
    const raw = toRawNodeId(node);
    if (measure !== undefined && typeof measure !== "function") {
      throw new TypeError("measure must be a function or undefined");
    }
    this.#inner.rawSetMeasure(raw, measure !== undefined);
    if (measure === undefined) this.#measures.delete(node);
    else this.#measures.set(node, measure);
  }

  /** Replaces a node style and marks affected layout state dirty. */
  setStyle(node: NodeId, style: StyleInput): void {
    const raw = toRawNodeId(node);
    withEncodedStyle(style, (encoded) => this.#inner.rawSetStyle(raw, encoded));
  }

  /** Updates supplied style fields and geometry components, preserving omitted values. */
  updateStyle(node: NodeId, update: StyleUpdate): void {
    const raw = toRawNodeId(node);
    withEncodedStyle(update, (encoded) => this.#inner.rawUpdateStyle(raw, encoded));
  }

  /** Returns a detached readable snapshot of the node style. */
  getStyle(node: NodeId): Style {
    return this.#inner.rawGetStyle(toRawNodeId(node)) as Style;
  }

  /** Returns the most recently stored layout selected by the tree's current rounding mode. */
  getLayout(node: NodeId): Layout {
    this.#inner.rawWriteLayout(toRawNodeId(node), layoutCodecBuffer);
    return decodeLayout(layoutCodecBuffer);
  }

  /** Returns the most recently stored unrounded layout snapshot. */
  getUnroundedLayout(node: NodeId): Layout {
    this.#inner.rawWriteUnroundedLayout(toRawNodeId(node), layoutCodecBuffer);
    return decodeLayout(layoutCodecBuffer);
  }

  /** Returns detailed Grid tracks and item placement when available. */
  getDetailedLayoutInfo(node: NodeId): DetailedLayoutInfo {
    return this.#inner.rawGetDetailedLayoutInfo(toRawNodeId(node)) as DetailedLayoutInfo;
  }

  /** Explicitly marks a node for layout recomputation. */
  markDirty(node: NodeId): void {
    this.#inner.rawMarkDirty(toRawNodeId(node));
  }

  /** Reports whether a node currently needs layout recomputation. */
  isDirty(node: NodeId): boolean {
    return this.#inner.rawIsDirty(toRawNodeId(node));
  }

  /** Removes every node, context value, and per-node measure function from this tree. */
  clear(): void {
    this.#inner.rawClear();
    this.#contexts.clear();
    this.#measures.clear();
  }

  /** Computes and stores layout synchronously with configured per-node measures and an optional global fallback. */
  computeLayout(options: ComputeLayoutOptions<TContext>): void {
    const root = toRawNodeId(options.root);
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
      (getStyle) => {
        const constraints = decodeConstraints(constraintRecord);
        const node = constraints.node as NodeId;
        const measure = this.#measures.get(node) ?? fallback;
        if (measure === undefined) {
          throw new Error("Native measure marker has no JavaScript measure function");
        }
        return measure({
          knownDimensions: constraints.knownDimensions,
          availableSpace: constraints.availableSpace,
          node,
          context: this.#contexts.get(node),
          getStyle: getStyle as () => Style,
        });
      },
      constraintRecord,
      fallback !== undefined,
    );
  }
}
