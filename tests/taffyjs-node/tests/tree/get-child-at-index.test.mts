import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };
type Tree = {
  clear(): void;
  getChildAtIndex(parent: bigint, index: number): bigint;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "getChildAtIndex"),
    "function",
    "getChildAtIndex is public",
  );
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

test("positions", () => {
  const tree = new (TaffyTree())();
  const children = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, children);

  for (let index = 0; index < children.length; index += 1) {
    assert.equal(tree.getChildAtIndex(parent, index), children[index]);
  }
});

test("bounds", () => {
  const tree = new (TaffyTree())();
  const empty = tree.newLeaf({});
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);

  for (const [target, index] of [
    [empty, 0],
    [parent, 1],
    [parent, Number.MAX_SAFE_INTEGER],
  ] as const) {
    const error = captureError(() => tree.getChildAtIndex(target, index));
    assert.equal(error.constructor, RangeError);
    assert.equal(error.code, "ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS");
  }
});

test("integer", () => {
  const tree = new (TaffyTree())();
  const parent = tree.newLeaf({});

  for (const index of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53]) {
    const error = captureError(() => tree.getChildAtIndex(parent, index));
    assert.equal(error.constructor, RangeError);
    assert.equal(error.code, undefined);
  }
  assert.equal(
    captureError(() => tree.getChildAtIndex(parent, "0" as unknown as number)).constructor,
    TypeError,
  );
});

test("invalid-parent", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.getChildAtIndex(1 as never, 0)).constructor, TypeError);
  assert.equal(captureError(() => tree.getChildAtIndex(0n, 0)).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(
    captureError(() => tree.getChildAtIndex(foreign, 0)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.getChildAtIndex(stale, 0)).code, "ERR_TAFFY_STALE_NODE_ID");
});
