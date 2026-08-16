import assert from "node:assert/strict";
import {
  AvailableSpace,
  Dimension,
  Display,
  GridPlacement,
  GridTemplateComponent,
  Overflow,
  TaffyTree,
  TrackSizingFunction,
} from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };

function maxContentSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
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
  const tree = new TaffyTree();
  const node = tree.newLeaf({ display: Display.None, flexGrow: 3 });

  tree.setStyle(node, {});
  const style = tree.getStyle(node);
  assert.equal(style.display, Display.Flex);
  assert.equal(style.flexGrow, 0);
});

test("undefined-null", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({});

  tree.setStyle(node, {
    alignItems: undefined,
    aspectRatio: null,
    gridTemplateAreas: null,
    overflow: { x: undefined, y: Overflow.Hidden },
  });
  const style = tree.getStyle(node);
  assert.equal(style.alignItems, null);
  assert.equal(style.aspectRatio, null);
  assert.equal(style.gridTemplateAreas, null);
  assert.deepEqual(style.overflow, { x: Overflow.Visible, y: Overflow.Hidden });
});

test("unknown-calc", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({ flexGrow: 2 });

  for (const style of [
    { unknownField: true },
    { calc: true },
    { flexBasis: { calc: "1px + 2%" } },
  ]) {
    assert.throws(() => tree.setStyle(node, style as never), TypeError);
  }
});

test("conversion-families", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({});
  const track = TrackSizingFunction.Fr(2);

  tree.setStyle(node, {
    display: Display.Grid,
    overflow: { x: Overflow.Scroll, y: Overflow.Hidden },
    size: { width: Dimension.Percent(25) },
    gridRow: { start: GridPlacement.Line(2) },
    gridAutoRows: [track],
    gridTemplateRows: [GridTemplateComponent.Single(track)],
  });
  const style = tree.getStyle(node);
  assert.equal(style.display, Display.Grid);
  assert.deepEqual(style.overflow, { x: Overflow.Scroll, y: Overflow.Hidden });
  assert.deepEqual((style.size as { width: unknown }).width, Dimension.Percent(25));
  assert.deepEqual((style.gridRow as { start: unknown }).start, GridPlacement.Line(2));
  assert.deepEqual(style.gridAutoRows, [track]);
  assert.deepEqual(style.gridTemplateRows, [GridTemplateComponent.Single(track)]);
});

test("dirty", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({});
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.equal(tree.isDirty(node), false);

  tree.setStyle(node, { flexGrow: 2 });
  assert.equal(tree.isDirty(node), true);
});

test("failure-atomic", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({ flexGrow: 2 });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const beforeStyle = tree.getStyle(node);
  const beforeDirty = tree.isDirty(node);

  assert.throws(() => tree.setStyle(node, { flexGrow: 9, display: 999 } as never), RangeError);
  assert.deepEqual(tree.getStyle(node), beforeStyle);
  assert.equal(tree.isDirty(node), beforeDirty);
});

test("invalid-id", () => {
  const tree = new TaffyTree();
  const foreign = new TaffyTree().newLeaf({});

  assert.equal(captureError(() => tree.setStyle(1 as never, {})).constructor, TypeError);
  assert.equal(
    captureError(() => tree.setStyle(0n as never, {})).code,
    "ERR_TAFFY_INVALID_NODE_ID",
  );
  assert.equal(captureError(() => tree.setStyle(foreign, {})).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.setStyle(stale, {})).code, "ERR_TAFFY_STALE_NODE_ID");
});
