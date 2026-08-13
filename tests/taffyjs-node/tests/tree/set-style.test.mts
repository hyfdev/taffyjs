import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };
type Tree = {
  clear(): void;
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  getStyle(node: bigint): Record<string, unknown>;
  isDirty(node: bigint): boolean;
  newLeaf(style: object): bigint;
  setStyle(node: bigint, style: object): void;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(typeof Reflect.get(value.prototype, "setStyle"), "function", "setStyle is public");
  return value as unknown as TreeConstructor;
}

function maxContentSpace() {
  return { width: api.AvailableSpace.MaxContent, height: api.AvailableSpace.MaxContent };
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

test("complete-replace", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({ display: api.Display.None, flexGrow: 3 });

  tree.setStyle(node, {});
  const style = tree.getStyle(node);
  assert.equal(style.display, api.Display.Flex);
  assert.equal(style.flexGrow, 0);
});

test("undefined-null", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});

  tree.setStyle(node, {
    alignItems: undefined,
    aspectRatio: null,
    gridTemplateAreas: null,
    overflow: { x: undefined, y: api.Overflow.Hidden },
  });
  const style = tree.getStyle(node);
  assert.equal(style.alignItems, null);
  assert.equal(style.aspectRatio, null);
  assert.equal(style.gridTemplateAreas, null);
  assert.deepEqual(style.overflow, { x: api.Overflow.Visible, y: api.Overflow.Hidden });
});

test("unknown-calc", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({ flexGrow: 2 });

  for (const style of [
    { unknownField: true },
    { calc: true },
    { flexBasis: { calc: "1px + 2%" } },
  ]) {
    assert.throws(() => tree.setStyle(node, style), TypeError);
  }
});

test("conversion-families", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  const track = api.TrackSizingFunction.Fr(2);

  tree.setStyle(node, {
    display: api.Display.Grid,
    overflow: { x: api.Overflow.Scroll, y: api.Overflow.Hidden },
    size: { width: api.Dimension.Percent(25) },
    gridRow: { start: api.GridPlacement.Line(2) },
    gridAutoRows: [track],
    gridTemplateRows: [api.GridTemplateComponent.Single(track)],
  });
  const style = tree.getStyle(node);
  assert.equal(style.display, api.Display.Grid);
  assert.deepEqual(style.overflow, { x: api.Overflow.Scroll, y: api.Overflow.Hidden });
  assert.deepEqual((style.size as { width: unknown }).width, api.Dimension.Percent(25));
  assert.deepEqual((style.gridRow as { start: unknown }).start, api.GridPlacement.Line(2));
  assert.deepEqual(style.gridAutoRows, [track]);
  assert.deepEqual(style.gridTemplateRows, [api.GridTemplateComponent.Single(track)]);
});

test("dirty", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.equal(tree.isDirty(node), false);

  tree.setStyle(node, { flexGrow: 2 });
  assert.equal(tree.isDirty(node), true);
});

test("failure-atomic", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({ flexGrow: 2 });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const beforeStyle = tree.getStyle(node);
  const beforeDirty = tree.isDirty(node);

  assert.throws(() => tree.setStyle(node, { flexGrow: 9, display: 999 }), RangeError);
  assert.deepEqual(tree.getStyle(node), beforeStyle);
  assert.equal(tree.isDirty(node), beforeDirty);
});

test("invalid-id", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.setStyle(1 as never, {})).constructor, TypeError);
  assert.equal(captureError(() => tree.setStyle(0n, {})).code, "ERR_TAFFY_INVALID_NODE_ID");
  assert.equal(captureError(() => tree.setStyle(foreign, {})).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.setStyle(stale, {})).code, "ERR_TAFFY_STALE_NODE_ID");
});
