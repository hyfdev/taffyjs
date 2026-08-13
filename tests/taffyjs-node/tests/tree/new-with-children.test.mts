import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };
type Tree = {
  clear(): void;
  getChildren(parent: bigint): readonly bigint[];
  getNodeCount(): number;
  getParent(node: bigint): bigint | null;
  getStyle(node: bigint): Record<string, unknown>;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "newWithChildren"),
    "function",
    "newWithChildren is public",
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

function topology(tree: Tree, nodes: readonly bigint[]) {
  return {
    count: tree.getNodeCount(),
    nodes: nodes.map((node) => ({
      node,
      parent: tree.getParent(node),
      children: [...tree.getChildren(node)],
    })),
  };
}

test("empty", () => {
  const tree = new (TaffyTree())();
  const root = tree.newWithChildren({ flexGrow: 2 }, []);

  assert.equal(tree.getNodeCount(), 1);
  assert.equal(tree.getStyle(root).flexGrow, 2);
  assert.equal(tree.getParent(root), null);
  assert.deepEqual(tree.getChildren(root), []);
});

test("ordered-children", () => {
  const tree = new (TaffyTree())();
  const children = [tree.newLeaf({}), tree.newLeaf({}), tree.newLeaf({})];
  const parent = tree.newWithChildren({}, children);

  assert.equal(tree.getNodeCount(), 4);
  assert.deepEqual(tree.getChildren(parent), children);
  for (const child of children) assert.equal(tree.getParent(child), parent);
});

test("duplicate", () => {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({ flexGrow: 1 });

  const error = captureError(() => tree.newWithChildren({}, [child, child]));
  assert.equal(error.code, "ERR_TAFFY_INVALID_TOPOLOGY");
  assert.equal(tree.getNodeCount(), 1);
  assert.equal(tree.getStyle(child).flexGrow, 1);

  const parent = tree.newWithChildren({}, [child]);
  assert.equal(tree.getNodeCount(), 2);
  assert.equal(tree.getStyle(parent).display, api.Display.Flex);
});

test("attached", () => {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({});
  const firstParent = tree.newWithChildren({}, [child]);

  const error = captureError(() => tree.newWithChildren({}, [child]));
  assert.equal(error.code, "ERR_TAFFY_INVALID_TOPOLOGY");
  assert.equal(tree.getNodeCount(), 2);
  assert.equal(tree.getParent(child), firstParent);
  assert.deepEqual(tree.getChildren(firstParent), [child]);
});

test("invalid-id", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const foreign = new Tree().newLeaf({});

  assert.equal(
    captureError(() => tree.newWithChildren({}, [foreign])).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );
  assert.equal(tree.getNodeCount(), 0);

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(
    captureError(() => tree.newWithChildren({}, [stale])).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
  assert.equal(tree.getNodeCount(), 0);
});

test("failure-atomic", () => {
  const tree = new (TaffyTree())();
  const first = tree.newLeaf({});
  const second = tree.newLeaf({});
  const before = topology(tree, [first, second]);

  assert.throws(() => tree.newWithChildren({ display: 999 }, [first, second]), RangeError);
  assert.deepEqual(topology(tree, [first, second]), before);

  assert.equal(
    captureError(() => tree.newWithChildren({}, [first, first])).code,
    "ERR_TAFFY_INVALID_TOPOLOGY",
  );
  assert.deepEqual(topology(tree, [first, second]), before);

  assert.throws(() => tree.newWithChildren({}, {} as unknown as readonly bigint[]), TypeError);
  assert.deepEqual(topology(tree, [first, second]), before);
});
