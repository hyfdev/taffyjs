import { NativeTaffyTree } from "#native";
import { NodeIdRegistry, type NodeId, type RandomSource } from "./node-id.js";

type PrivateTreeOptions = Readonly<{
  randomSource?: RandomSource;
  nextSerial?: bigint;
}>;

const secureRandom: RandomSource = (bytes) => globalThis.crypto.getRandomValues(bytes);

export class TaffyTree<_TContext = unknown> {
  readonly #inner: NativeTaffyTree;
  readonly #nodes: NodeIdRegistry;

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
}

export type { NodeId };
