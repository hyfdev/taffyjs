import assert from "node:assert/strict";
import { TaffyTree } from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };

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
  const tree = new TaffyTree();
  const children = [tree.newLeaf(), tree.newLeaf(), tree.newLeaf()];
  const parent = tree.newWithChildren(children);

  for (let index = 0; index < children.length; index += 1) {
    assert.equal(tree.getChildAtIndex(parent, index), children[index]);
  }
});

test("bounds", () => {
  const tree = new TaffyTree();
  const empty = tree.newLeaf();
  const child = tree.newLeaf();
  const parent = tree.newWithChildren([child]);

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
  const tree = new TaffyTree();
  const parent = tree.newLeaf();

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
