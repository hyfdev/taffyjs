declare const phantomMarker: unique symbol;

export type NodeId = bigint & { readonly [phantomMarker]: never };

const U64_BITS = 64n;
const TOKEN_SHIFT = 128n;
const U64_MAX = (1n << U64_BITS) - 1n;
const NODE_ID_LIMIT = 1n << 256n;

export type RandomSource = (bytes: Uint8Array) => Uint8Array;

function codedError(code: string, message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code });
}

function randomToken(randomSource: RandomSource): bigint {
  const bytes = new Uint8Array(16);
  randomSource(bytes);
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
  #nextSerial: bigint;
  readonly #serialByRaw = new Map<bigint, bigint>();
  readonly #rawByPublic = new Map<NodeId, bigint>();

  constructor(randomSource: RandomSource, nextSerial = 1n) {
    this.#token = randomToken(randomSource);
    this.#nextSerial = nextSerial;
  }

  reserveSerial(): bigint {
    const serial = this.#nextSerial;
    if (serial < 1n || serial > U64_MAX) {
      throw new RangeError("The per-tree NodeId creation serial is exhausted");
    }
    this.#nextSerial = serial + 1n;
    return serial;
  }

  register(raw: bigint, serial: bigint): NodeId {
    if (raw < 0n || raw > U64_MAX || this.#serialByRaw.has(raw)) {
      throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
    }
    const node = ((this.#token << TOKEN_SHIFT) | (serial << U64_BITS) | raw) as NodeId;
    if (this.#rawByPublic.has(node)) {
      throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
    }
    this.#serialByRaw.set(raw, serial);
    this.#rawByPublic.set(node, raw);
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
    const node = value as NodeId;
    const raw = this.#rawByPublic.get(node);
    if (raw === undefined) {
      throw codedError("ERR_TAFFY_STALE_NODE_ID", "The NodeId no longer names a current node");
    }
    const serial = (value >> U64_BITS) & U64_MAX;
    if (this.#serialByRaw.get(raw) !== serial) {
      throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
    }
    return raw;
  }

  fromRaw(raw: bigint): NodeId {
    const serial = this.#serialByRaw.get(raw);
    if (serial === undefined) {
      throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
    }
    const node = ((this.#token << TOKEN_SHIFT) | (serial << U64_BITS) | raw) as NodeId;
    if (this.#rawByPublic.get(node) !== raw) {
      throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
    }
    return node;
  }

  clear(): void {
    this.#serialByRaw.clear();
    this.#rawByPublic.clear();
  }
}
