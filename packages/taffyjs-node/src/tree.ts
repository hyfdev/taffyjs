import { NativeTaffyTree } from "#native";
import { NodeIdRegistry, type NodeId, type RandomSource } from "./node-id.js";

type PrivateTreeOptions = Readonly<{
  randomSource?: RandomSource;
  nextSerial?: bigint;
}>;

type RawMeasureArgs = {
  knownDimensions: unknown;
  availableSpace: unknown;
  node: bigint;
  style: object;
};

const secureRandom: RandomSource = (bytes) => globalThis.crypto.getRandomValues(bytes);

export class TaffyTree<_TContext = unknown> {
  readonly #inner: NativeTaffyTree;
  readonly #nodes: NodeIdRegistry;
  readonly #contexts = new Map<NodeId, _TContext>();

  constructor(options: PrivateTreeOptions = {}) {
    this.#nodes = new NodeIdRegistry(options.randomSource ?? secureRandom, options.nextSerial);
    this.#inner = new NativeTaffyTree();
  }

  newLeaf(style: unknown): NodeId {
    const serial = this.#nodes.reserveSerial();
    const raw = this.#inner.rawNewLeaf(style, "newLeaf");
    return this.#nodes.register(raw, serial);
  }

  clear(): void {
    this.#inner.rawClear("clear");
    this.#nodes.clear();
  }

  getNodeCount(): number {
    return this.#inner.rawNodeCount("getNodeCount");
  }

  getStyle(node: NodeId): object {
    const raw = this.#nodes.resolve(node);
    return this.#inner.rawGetStyle(raw, "getStyle");
  }

  computeLayoutWithMeasure(options: {
    root: NodeId;
    availableSpace: unknown;
    measure: (args: {
      knownDimensions: unknown;
      availableSpace: unknown;
      node: NodeId;
      context: _TContext | undefined;
      style: object;
    }) => unknown;
  }): void {
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

export type { NodeId };
