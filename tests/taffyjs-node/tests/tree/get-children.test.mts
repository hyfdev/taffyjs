import assert from "node:assert/strict";
import { type NodeId, TaffyTree } from "@taffyjs/node";
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

test("empty", () => {
  const tree = new TaffyTree();
  const leaf = tree.newLeaf({});
  const parent = tree.newWithChildren({}, []);

  assert.deepEqual(tree.getChildren(leaf), []);
  assert.deepEqual(tree.getChildren(parent), []);
});

test("ordered", () => {
  const tree = new TaffyTree();
  const [first, second, third] = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, [third, first, second]);
  assert.deepEqual(tree.getChildren(parent), [third, first, second]);

  const otherParent = tree.newLeaf({});
  tree.setChildren(otherParent, [first, third]);
  assert.deepEqual(tree.getChildren(parent), [second]);
  assert.deepEqual(tree.getChildren(otherParent), [first, third]);

  tree.removeChild(otherParent, first);
  assert.deepEqual(tree.getChildren(otherParent), [third]);
});

test("stable-ids", () => {
  const tree = new TaffyTree();
  const children = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, children);
  const read = tree.getChildren(parent);

  for (let index = 0; index < children.length; index += 1) {
    assert.equal(read[index], children[index]);
  }
  assert.equal(new Map(children.map((node, index) => [node, index])).get(read[1]), 1);
});

test("detached-array", () => {
  const tree = new TaffyTree();
  const children = [tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, children);
  const firstRead = tree.getChildren(parent) as NodeId[];

  firstRead.reverse();
  firstRead.push(tree.newLeaf({}));
  assert.deepEqual(tree.getChildren(parent), children);
  assert.notEqual(tree.getChildren(parent), tree.getChildren(parent));
});

test("invalid-parent", () => {
  const tree = new TaffyTree();
  const foreign = new TaffyTree().newLeaf({});

  assert.equal(captureError(() => tree.getChildren(1 as never)).constructor, TypeError);
  assert.equal(captureError(() => tree.getChildren(0n as never)).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(captureError(() => tree.getChildren(foreign)).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.getChildren(stale)).code, "ERR_TAFFY_STALE_NODE_ID");
});
