import { createRequire } from "node:module";
import { NodeIdRegistry, type NodeId, type RandomSource } from "./node-id.js";

type NativeModule = typeof import("#native");
type NativeTree = InstanceType<NativeModule["NativeTaffyTree"]>;

const { NativeTaffyTree } = createRequire(import.meta.url)("#native") as NativeModule;

type PrivateTreeOptions = Readonly<{
  randomSource?: RandomSource;
  nextSerial?: bigint;
}>;

const privateConstructor = Symbol();
const testAccess = Symbol();
type PrivateConstructorArgs = [] | [key: typeof privateConstructor, options: PrivateTreeOptions];

type RawMeasureArgs = {
  knownDimensions: unknown;
  availableSpace: unknown;
  node: bigint;
  style: object;
};

export interface ComputeLayoutWithMeasureOptions<TContext> {
  root: NodeId;
  availableSpace: unknown;
  measure: (args: {
    knownDimensions: unknown;
    availableSpace: unknown;
    node: NodeId;
    context: TContext | undefined;
    style: object;
  }) => unknown;
}

export interface ChildRangeInput {
  start: number;
  end: number;
}

export interface ComputeLayoutOptions {
  root: NodeId;
  availableSpace: unknown;
}

const secureRandom: RandomSource = (bytes) => globalThis.crypto.getRandomValues(bytes);

export class TaffyTree<TContext = unknown> {
  readonly #inner: NativeTree;
  readonly #nodes: NodeIdRegistry;
  readonly #contexts = new Map<NodeId, TContext>();

  constructor(...args: PrivateConstructorArgs) {
    const options = args.length === 2 && args[0] === privateConstructor ? args[1] : {};
    this.#nodes = new NodeIdRegistry(options.randomSource ?? secureRandom, options.nextSerial);
    this.#inner = new NativeTaffyTree();
  }

  enableRounding(): void {
    this.#inner.rawEnableRounding("enableRounding");
  }

  disableRounding(): void {
    this.#inner.rawDisableRounding("disableRounding");
  }

  getNodeCount(): number {
    return this.#getNodeCount();
  }

  getChildCount(parent: NodeId): number {
    return this.#getChildCount(parent);
  }

  getParent(node: NodeId): NodeId | null {
    return this.#getParent(node);
  }

  getChildren(parent: NodeId): readonly NodeId[] {
    return this.#getChildren(parent);
  }

  getChildAtIndex(parent: NodeId, index: number): NodeId {
    return this.#getChildAtIndex(parent, index);
  }

  addChild(parent: NodeId, child: NodeId): void {
    this.#addChild(parent, child);
  }

  insertChildAtIndex(parent: NodeId, index: number, child: NodeId): void {
    this.#insertChildAtIndex(parent, index, child);
  }

  setChildren(parent: NodeId, children: readonly NodeId[]): void {
    this.#setChildren(parent, children);
  }

  removeChild(parent: NodeId, child: NodeId): void {
    this.#removeChild(parent, child);
  }

  removeChildAtIndex(parent: NodeId, index: number): NodeId {
    return this.#removeChildAtIndex(parent, index);
  }

  removeChildrenRange(parent: NodeId, range: ChildRangeInput): void {
    this.#removeChildrenRange(parent, range);
  }

  replaceChildAtIndex(parent: NodeId, index: number, newChild: NodeId): NodeId {
    return this.#replaceChildAtIndex(parent, index, newChild);
  }

  newLeaf(style: unknown): NodeId {
    return this.#newLeaf(style);
  }

  newLeafWithContext(style: unknown, context: TContext | undefined): NodeId {
    return this.#newLeafWithContext(style, context);
  }

  newWithChildren(style: unknown, children: readonly NodeId[]): NodeId {
    return this.#newWithChildren(style, children);
  }

  remove(node: NodeId): void {
    this.#remove(node);
  }

  getNodeContext(node: NodeId): TContext | undefined {
    return this.#getNodeContext(node);
  }

  setNodeContext(node: NodeId, context: TContext | undefined): void {
    this.#setNodeContext(node, context);
  }

  setStyle(node: NodeId, style: unknown): void {
    const raw = this.#nodes.resolve(node);
    this.#inner.rawSetStyle(raw, style, "setStyle");
  }

  getStyle(node: NodeId): object {
    return this.#getStyle(node);
  }

  getLayout(node: NodeId): object {
    return this.#getLayout(node);
  }

  getUnroundedLayout(node: NodeId): object {
    return this.#getUnroundedLayout(node);
  }

  getDetailedLayoutInfo(node: NodeId): object {
    return this.#getDetailedLayoutInfo(node);
  }

  markDirty(node: NodeId): void {
    this.#markDirty(node);
  }

  isDirty(node: NodeId): boolean {
    return this.#isDirty(node);
  }

  clear(): void {
    this.#clear();
  }

  computeLayout(options: ComputeLayoutOptions): void {
    this.#computeLayout(options);
  }

  computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void {
    this.#computeLayoutWithMeasure(options);
  }

  [testAccess]() {
    return {
      enableRounding: () => this.#inner.rawEnableRounding("enableRounding"),
      disableRounding: () => this.#inner.rawDisableRounding("disableRounding"),
      newLeaf: (style: unknown) => this.#newLeaf(style),
      newLeafWithContext: (style: unknown, context: TContext | undefined) =>
        this.#newLeafWithContext(style, context),
      newWithChildren: (style: unknown, children: readonly NodeId[]) =>
        this.#newWithChildren(style, children),
      remove: (node: NodeId) => this.#remove(node),
      getNodeContext: (node: NodeId) => this.#getNodeContext(node),
      setNodeContext: (node: NodeId, context: TContext | undefined) =>
        this.#setNodeContext(node, context),
      clear: () => this.#clear(),
      getChildCount: (parent: NodeId) => this.#getChildCount(parent),
      getParent: (node: NodeId) => this.#getParent(node),
      getChildren: (parent: NodeId) => this.#getChildren(parent),
      getChildAtIndex: (parent: NodeId, index: number) => this.#getChildAtIndex(parent, index),
      addChild: (parent: NodeId, child: NodeId) => this.#addChild(parent, child),
      insertChildAtIndex: (parent: NodeId, index: number, child: NodeId) =>
        this.#insertChildAtIndex(parent, index, child),
      setChildren: (parent: NodeId, children: readonly NodeId[]) =>
        this.#setChildren(parent, children),
      removeChild: (parent: NodeId, child: NodeId) => this.#removeChild(parent, child),
      removeChildAtIndex: (parent: NodeId, index: number) =>
        this.#removeChildAtIndex(parent, index),
      removeChildrenRange: (parent: NodeId, range: ChildRangeInput) =>
        this.#removeChildrenRange(parent, range),
      replaceChildAtIndex: (parent: NodeId, index: number, newChild: NodeId) =>
        this.#replaceChildAtIndex(parent, index, newChild),
      getNodeCount: () => this.#getNodeCount(),
      getStyle: (node: NodeId) => this.#getStyle(node),
      getLayout: (node: NodeId) => this.#getLayout(node),
      getUnroundedLayout: (node: NodeId) => this.#getUnroundedLayout(node),
      getDetailedLayoutInfo: (node: NodeId) => this.#getDetailedLayoutInfo(node),
      markDirty: (node: NodeId) => this.#markDirty(node),
      isDirty: (node: NodeId) => this.#isDirty(node),
      computeLayout: (options: ComputeLayoutOptions) => this.#computeLayout(options),
      computeLayoutWithMeasure: (options: ComputeLayoutWithMeasureOptions<TContext>) =>
        this.#computeLayoutWithMeasure(options),
    };
  }

  #newLeaf(style: unknown): NodeId {
    const serial = this.#nodes.reserveSerial();
    const raw = this.#inner.rawNewLeaf(style, "newLeaf");
    return this.#nodes.register(raw, serial);
  }

  #newLeafWithContext(style: unknown, context: TContext | undefined): NodeId {
    const serial = this.#nodes.reserveSerial();
    const hasContext = context !== undefined;
    const raw = this.#inner.rawNewLeafWithContext(style, hasContext, "newLeafWithContext");
    const node = this.#nodes.register(raw, serial);
    if (context !== undefined) this.#contexts.set(node, context);
    return node;
  }

  #newWithChildren(style: unknown, children: readonly NodeId[]): NodeId {
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

  #getStyle(node: NodeId): object {
    const raw = this.#nodes.resolve(node);
    return this.#inner.rawGetStyle(raw, "getStyle");
  }

  #getLayout(node: NodeId): object {
    const raw = this.#nodes.resolve(node);
    return this.#inner.rawGetLayout(raw, "getLayout");
  }

  #getUnroundedLayout(node: NodeId): object {
    const raw = this.#nodes.resolve(node);
    return this.#inner.rawGetUnroundedLayout(raw, "getUnroundedLayout");
  }

  #getDetailedLayoutInfo(node: NodeId): object {
    const raw = this.#nodes.resolve(node);
    return this.#inner.rawGetDetailedLayoutInfo(raw, "getDetailedLayoutInfo");
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
}

export function createTaffyTreeForTesting(options: PrivateTreeOptions = {}) {
  return new TaffyTree(privateConstructor, options)[testAccess]();
}

export type { NodeId };
