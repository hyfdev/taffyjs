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

type PrivateMeasureOptions<TContext> = {
  root: NodeId;
  availableSpace: unknown;
  measure: (args: {
    knownDimensions: unknown;
    availableSpace: unknown;
    node: NodeId;
    context: TContext | undefined;
    style: object;
  }) => unknown;
};

const secureRandom: RandomSource = (bytes) => globalThis.crypto.getRandomValues(bytes);

export class TaffyTree<_TContext = unknown> {
  readonly #inner: NativeTree;
  readonly #nodes: NodeIdRegistry;
  readonly #contexts = new Map<NodeId, _TContext>();

  constructor(...args: PrivateConstructorArgs) {
    const options = args.length === 2 && args[0] === privateConstructor ? args[1] : {};
    this.#nodes = new NodeIdRegistry(options.randomSource ?? secureRandom, options.nextSerial);
    this.#inner = new NativeTaffyTree();
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

  newLeaf(style: unknown): NodeId {
    return this.#newLeaf(style);
  }

  newWithChildren(style: unknown, children: readonly NodeId[]): NodeId {
    return this.#newWithChildren(style, children);
  }

  setStyle(node: NodeId, style: unknown): void {
    const raw = this.#nodes.resolve(node);
    this.#inner.rawSetStyle(raw, style, "setStyle");
  }

  getStyle(node: NodeId): object {
    return this.#getStyle(node);
  }

  clear(): void {
    this.#clear();
  }

  [testAccess]() {
    return {
      newLeaf: (style: unknown) => this.#newLeaf(style),
      newWithChildren: (style: unknown, children: readonly NodeId[]) =>
        this.#newWithChildren(style, children),
      clear: () => this.#clear(),
      getChildCount: (parent: NodeId) => this.#getChildCount(parent),
      getParent: (node: NodeId) => this.#getParent(node),
      getChildren: (parent: NodeId) => this.#getChildren(parent),
      getChildAtIndex: (parent: NodeId, index: number) => this.#getChildAtIndex(parent, index),
      addChild: (parent: NodeId, child: NodeId) => this.#addChild(parent, child),
      getNodeCount: () => this.#getNodeCount(),
      getStyle: (node: NodeId) => this.#getStyle(node),
      computeLayoutWithMeasure: (options: PrivateMeasureOptions<_TContext>) =>
        this.#computeLayoutWithMeasure(options),
    };
  }

  #newLeaf(style: unknown): NodeId {
    const serial = this.#nodes.reserveSerial();
    const raw = this.#inner.rawNewLeaf(style, "newLeaf");
    return this.#nodes.register(raw, serial);
  }

  #newWithChildren(style: unknown, children: readonly NodeId[]): NodeId {
    if (!Array.isArray(children)) throw new TypeError("children must be an array");
    const rawChildren = Array.from(children, (child) => this.#nodes.resolve(child));
    const serial = this.#nodes.reserveSerial();
    const raw = this.#inner.rawNewWithChildren(style, rawChildren, "newWithChildren");
    return this.#nodes.register(raw, serial);
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

  #computeLayoutWithMeasure(options: PrivateMeasureOptions<_TContext>): void {
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
}

export function createTaffyTreeForTesting(options: PrivateTreeOptions = {}) {
  return new TaffyTree(privateConstructor, options)[testAccess]();
}

export type { NodeId };
