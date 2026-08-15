declare const phantomMarker: unique symbol;

/** Identifies a node in one TaffyTree without exposing its native identity. */
export type NodeId = bigint & { readonly [phantomMarker]: never };

const U64_BITS = 64n;
const TOKEN_SHIFT = 128n;
const U64_MAX = (1n << U64_BITS) - 1n;
const NODE_ID_LIMIT = 1n << 256n;

function codedError(code: string, message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code });
}

function randomToken(): bigint {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  let token = 0n;
  for (const byte of bytes) token = (token << 8n) | BigInt(byte);
  return token;
}

function isEncodedNodeId(value: bigint): boolean {
  if (value < 0n || value >= NODE_ID_LIMIT) return false;
  return ((value >> U64_BITS) & U64_MAX) !== 0n;
}

export class NodeIdRegistry {
  readonly #token: bigint;
  #nextSerial = 1n;
  readonly #serialByRaw = new Map<bigint, bigint>();

  constructor() {
    this.#token = randomToken();
  }

  reserveSerial(): bigint {
    const serial = this.#nextSerial;
    if (serial < 1n || serial > U64_MAX) {
      throw new RangeError("The per-tree NodeId creation serial is exhausted");
    }
    return serial;
  }

  register(raw: bigint, serial: bigint): NodeId {
    if (serial !== this.#nextSerial || raw < 0n || raw > U64_MAX || this.#serialByRaw.has(raw)) {
      throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
    }
    const node = ((this.#token << TOKEN_SHIFT) | (serial << U64_BITS) | raw) as NodeId;
    this.#serialByRaw.set(raw, serial);
    this.#nextSerial = serial + 1n;
    return node;
  }

  resolve(value: unknown): bigint {
    if (typeof value !== "bigint") throw new TypeError("NodeId must be a bigint");
    if (!isEncodedNodeId(value)) {
      throw codedError("ERR_TAFFY_INVALID_NODE_ID", "The bigint is not a valid NodeId");
    }
    if (value >> TOKEN_SHIFT !== this.#token) {
      throw codedError("ERR_TAFFY_FOREIGN_NODE_ID", "The NodeId belongs to another TaffyTree");
    }
    const serial = (value >> U64_BITS) & U64_MAX;
    const raw = value & U64_MAX;
    if (this.#serialByRaw.get(raw) !== serial) {
      throw codedError("ERR_TAFFY_STALE_NODE_ID", "The NodeId no longer names a current node");
    }
    return raw;
  }

  fromRaw(raw: bigint): NodeId {
    const serial = this.#serialByRaw.get(raw);
    if (serial === undefined) {
      throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
    }
    return ((this.#token << TOKEN_SHIFT) | (serial << U64_BITS) | raw) as NodeId;
  }

  unregister(node: NodeId, raw: bigint): void {
    const serial = (node >> U64_BITS) & U64_MAX;
    if ((node & U64_MAX) !== raw || this.#serialByRaw.get(raw) !== serial) {
      throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
    }
    this.#serialByRaw.delete(raw);
  }

  clear(): void {
    this.#serialByRaw.clear();
  }
}
