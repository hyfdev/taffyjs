import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };
type Tree = {
  addChild(parent: bigint, child: bigint): void;
  clear(): void;
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  getUnroundedLayout(node: bigint): { location: { x: number; y: number } };
  insertChildAtIndex(parent: bigint, index: number, child: bigint): void;
  isDirty(node: bigint): boolean;
  markDirty(node: bigint): void;
  newLeaf(style: object): bigint;
  newLeafWithContext(style: object, context: unknown): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  remove(node: bigint): void;
  removeChild(parent: bigint, child: bigint): void;
  removeChildAtIndex(parent: bigint, index: number): bigint;
  removeChildrenRange(parent: bigint, range: { start: number; end: number }): void;
  replaceChildAtIndex(parent: bigint, index: number, newChild: bigint): bigint;
  setChildren(parent: bigint, children: readonly bigint[]): void;
  setNodeContext(node: bigint, context: unknown): void;
  setStyle(node: bigint, style: object): void;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(typeof Reflect.get(value.prototype, "isDirty"), "function", "isDirty is public");
  return value as unknown as TreeConstructor;
}

function availableSpace() {
  return { width: api.AvailableSpace.MaxContent, height: api.AvailableSpace.MaxContent };
}

function compute(tree: Tree, root: bigint) {
  tree.computeLayout({ root, availableSpace: availableSpace() });
}

function settledTree() {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({});
  const parent = tree.newWithChildren({}, [child]);
  const root = tree.newWithChildren({}, [parent]);
  compute(tree, root);
  for (const node of [child, parent, root]) assert.equal(tree.isDirty(node), false);
  return { tree, child, parent, root };
}

function assertParentDirty(tree: Tree, child: bigint, parent: bigint, root: bigint) {
  assert.equal(tree.isDirty(child), false, "unchanged child stays clean");
  assert.equal(tree.isDirty(parent), true, "changed parent is dirty");
  assert.equal(tree.isDirty(root), true, "ancestor is dirty");
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

test("lifecycle", () => {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({});
  const root = tree.newWithChildren({}, [child]);
  assert.equal(tree.isDirty(child), true);
  assert.equal(tree.isDirty(root), true);
  assert.equal(typeof tree.isDirty(root), "boolean");

  compute(tree, root);
  assert.equal(tree.isDirty(child), false);
  assert.equal(tree.isDirty(root), false);
});

test("style", () => {
  const { tree, child, parent, root } = settledTree();
  tree.setStyle(parent, { display: api.Display.Block });
  assertParentDirty(tree, child, parent, root);

  compute(tree, root);
  for (const node of [child, parent, root]) assert.equal(tree.isDirty(node), false);
});

test("context", () => {
  const tree = new (TaffyTree())();
  const context = { version: 1 };
  const child = tree.newLeafWithContext({}, context);
  const root = tree.newWithChildren({}, [child]);
  compute(tree, root);
  assert.equal(tree.isDirty(child), false);
  assert.equal(tree.isDirty(root), false);

  tree.setNodeContext(child, context);
  assert.equal(tree.isDirty(child), true);
  assert.equal(tree.isDirty(root), true);
});

test("topology", () => {
  {
    const { tree, child, parent, root } = settledTree();
    tree.addChild(parent, tree.newLeaf({}));
    assertParentDirty(tree, child, parent, root);
  }
  {
    const { tree, child, parent, root } = settledTree();
    tree.insertChildAtIndex(parent, 0, tree.newLeaf({}));
    assertParentDirty(tree, child, parent, root);
  }
  {
    const { tree, child, parent, root } = settledTree();
    tree.setChildren(parent, [child, tree.newLeaf({})]);
    assertParentDirty(tree, child, parent, root);
  }
  {
    const { tree, child, parent, root } = settledTree();
    tree.removeChild(parent, child);
    assertParentDirty(tree, child, parent, root);
  }
  {
    const { tree, child, parent, root } = settledTree();
    assert.equal(tree.removeChildAtIndex(parent, 0), child);
    assertParentDirty(tree, child, parent, root);
  }
  {
    const { tree, child, parent, root } = settledTree();
    tree.removeChildrenRange(parent, { start: 0, end: 1 });
    assertParentDirty(tree, child, parent, root);
  }
  {
    const { tree, child, parent, root } = settledTree();
    assert.equal(tree.replaceChildAtIndex(parent, 0, tree.newLeaf({})), child);
    assertParentDirty(tree, child, parent, root);
  }
  {
    const { tree, child, parent, root } = settledTree();
    tree.remove(child);
    assert.equal(tree.isDirty(parent), false, "pinned Taffy remove does not dirty the parent");
    assert.equal(tree.isDirty(root), false, "pinned Taffy remove does not dirty ancestors");
  }
});

test("explicit", () => {
  const { tree, child, parent, root } = settledTree();
  tree.markDirty(child);
  assert.equal(tree.isDirty(child), true);
  assert.equal(tree.isDirty(parent), true);
  assert.equal(tree.isDirty(root), true);
});

test("child-nuance", () => {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({
    size: { width: api.Dimension.Length(10), height: api.Dimension.Length(10) },
  });
  const rootStyle = {
    display: api.Display.Flex,
    size: { width: api.Dimension.Length(100), height: api.Dimension.Length(20) },
  };
  const root = tree.newWithChildren({ ...rootStyle, justifyContent: api.AlignContent.Start }, [
    child,
  ]);
  compute(tree, root);
  const before = tree.getUnroundedLayout(child).location.x;

  tree.setStyle(root, { ...rootStyle, justifyContent: api.AlignContent.Center });
  assert.equal(tree.isDirty(root), true);
  assert.equal(tree.isDirty(child), false, "a parent change does not clear the child cache");
  assert.equal(tree.getUnroundedLayout(child).location.x, before);

  compute(tree, root);
  assert.notEqual(tree.getUnroundedLayout(child).location.x, before);
  assert.equal(tree.isDirty(child), false);
});

test("invalid-id", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.isDirty(1 as never)).constructor, TypeError);
  assert.equal(captureError(() => tree.isDirty(0n)).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(captureError(() => tree.isDirty(foreign)).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.isDirty(stale)).code, "ERR_TAFFY_STALE_NODE_ID");
});
