import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { Worker } from "node:worker_threads";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };
type Tree = {
  clear(): void;
  getChildAtIndex(parent: bigint, index: number): bigint;
  getChildren(parent: bigint): readonly bigint[];
  getParent(node: bigint): bigint | null;
  getStyle(node: bigint): object;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
};
type TreeConstructor = new () => Tree;

const SLOT_MASK = (1n << 32n) - 1n;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  return value as unknown as TreeConstructor;
}

function captureError(body: () => unknown): CodedError {
  try {
    body();
  } catch (error) {
    assert.ok(error instanceof Error);
    return error;
  }
  assert.fail("Expected operation to throw");
}

async function workerRoundTrip(node: bigint) {
  const fixture = new URL("./fixtures/node-id-realm-copy.mjs", import.meta.url);
  const worker = new Worker(fixture);
  try {
    return await new Promise<{
      receivedType: string;
      receivedError: { class: string; code?: string };
      workerNode: bigint;
    }>((resolve, reject) => {
      worker.once("error", reject);
      worker.once("message", resolve);
      worker.postMessage(node);
    });
  } finally {
    await worker.terminate();
  }
}

async function importPhysicalPackageCopy(destination: string) {
  const packageRoot = fileURLToPath(new URL("../../../../packages/taffyjs-node/", import.meta.url));
  await cp(join(packageRoot, "package.json"), join(destination, "package.json"));
  await cp(join(packageRoot, "index.js"), join(destination, "index.js"));
  await cp(join(packageRoot, "native.js"), join(destination, "native.js"));
  for (const name of await readdir(packageRoot)) {
    if (name.endsWith(".node")) await cp(join(packageRoot, name), join(destination, name));
  }
  return import(pathToFileURL(join(destination, "index.js")).href) as Promise<{
    TaffyTree: TreeConstructor;
  }>;
}

test("js-identity", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);

  assert.equal(typeof child, "bigint");
  assert.equal(tree.getChildAtIndex(parent, 0), child);
  assert.equal(tree.getChildren(parent)[0], child);
  assert.equal(tree.getParent(child), parent);
  assert.equal(new Map([[child, "value"]]).get(tree.getChildAtIndex(parent, 0)), "value");
  assert.equal(new Set([child]).has(tree.getChildren(parent)[0]), true);
  assert.equal([child].includes(tree.getChildAtIndex(parent, 0)), true);
});

test("malformed", () => {
  const Tree = TaffyTree();
  const tree = new Tree();

  assert.equal(captureError(() => tree.getStyle(1 as never)).constructor, TypeError);
  for (const value of [-1n, 0n, 1n, 1n << 256n]) {
    const error = captureError(() => tree.getStyle(value));
    assert.equal(error.constructor, Error);
    assert.equal(error.code, "ERR_TAFFY_INVALID_NODE_ID");
  }
});

test("foreign", () => {
  const Tree = TaffyTree();
  const first = new Tree();
  const second = new Tree();
  const node = first.newLeaf({});

  const error = captureError(() => second.getStyle(node));
  assert.equal(error.constructor, Error);
  assert.equal(error.code, "ERR_TAFFY_FOREIGN_NODE_ID");
  assert.deepEqual(first.getStyle(node), first.getStyle(node));
});

test("stale-clear", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const node = tree.newLeaf({});
  tree.clear();

  const error = captureError(() => tree.getStyle(node));
  assert.equal(error.constructor, Error);
  assert.equal(error.code, "ERR_TAFFY_STALE_NODE_ID");
});

test("slot-reuse", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const first = tree.newLeaf({});
  tree.clear();
  const second = tree.newLeaf({});

  assert.equal(first & SLOT_MASK, second & SLOT_MASK, "fixture reuses the native slot");
  assert.notEqual(first, second);
  assert.throws(() => tree.getStyle(first), { code: "ERR_TAFFY_STALE_NODE_ID" });
  assert.deepEqual(tree.getStyle(second), tree.getStyle(second));
});

test("realm-copy", async () => {
  const Tree = TaffyTree();
  const local = new Tree();
  const localNode = local.newLeaf({});
  const workerResult = await workerRoundTrip(localNode);

  assert.equal(workerResult.receivedType, "bigint");
  assert.deepEqual(workerResult.receivedError, {
    class: "Error",
    code: "ERR_TAFFY_FOREIGN_NODE_ID",
  });
  assert.throws(() => local.getStyle(workerResult.workerNode), {
    code: "ERR_TAFFY_FOREIGN_NODE_ID",
  });

  const packageRoot = fileURLToPath(new URL("../../../../packages/taffyjs-node/", import.meta.url));
  const temporaryRoot = await mkdtemp(join(packageRoot, "node_modules/.cache/nodeid-copies-"));
  try {
    const firstRoot = join(temporaryRoot, "first");
    const secondRoot = join(temporaryRoot, "second");
    await Promise.all([mkdir(firstRoot), mkdir(secondRoot)]);
    const [firstCopy, secondCopy] = await Promise.all([
      importPhysicalPackageCopy(firstRoot),
      importPhysicalPackageCopy(secondRoot),
    ]);
    const firstTree = new firstCopy.TaffyTree();
    const secondTree = new secondCopy.TaffyTree();
    const firstNode = firstTree.newLeaf({});
    assert.throws(() => secondTree.getStyle(firstNode), {
      code: "ERR_TAFFY_FOREIGN_NODE_ID",
    });
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
