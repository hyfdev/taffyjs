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

  newLeaf(style: unknown): NodeId {
    return this.#newLeaf(style);
  }

  [testAccess]() {
    return {
      newLeaf: (style: unknown) => this.#newLeaf(style),
      clear: () => this.#clear(),
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

  #clear(): void {
    this.#inner.rawClear("clear");
    this.#nodes.clear();
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
}

export function createTaffyTreeForTesting(options: PrivateTreeOptions = {}) {
  return new TaffyTree(privateConstructor, options)[testAccess]();
}

export type { NodeId };
