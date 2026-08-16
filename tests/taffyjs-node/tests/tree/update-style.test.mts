import assert from "node:assert/strict";
import {
  AvailableSpace,
  Dimension,
  Display,
  GridPlacement,
  GridTemplateComponent,
  Overflow,
  RepetitionCount,
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

test("preserves omitted fields and geometry components", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    display: Display.None,
    flexGrow: 2,
    overflow: { x: Overflow.Hidden, y: Overflow.Scroll },
    size: { width: 10, height: 20 },
    margin: { left: 1, right: 2, top: 3, bottom: 4 },
    gridRow: { start: GridPlacement.Line(2), end: GridPlacement.Span(3) },
  });

  tree.updateStyle(node, {
    display: undefined,
    flexGrow: 3,
    overflow: { y: Overflow.Visible },
    size: { width: 30 },
    margin: { left: 5 },
    gridRow: { end: GridPlacement.Auto },
  });

  const style = tree.getStyle(node);
  assert.equal(style.display, Display.None);
  assert.equal(style.flexGrow, 3);
  assert.deepEqual(style.overflow, { x: Overflow.Hidden, y: Overflow.Visible });
  assert.deepEqual(style.size, { width: Dimension.Length(30), height: Dimension.Length(20) });
  assert.deepEqual(style.margin, {
    left: Dimension.Length(5),
    right: Dimension.Length(2),
    top: Dimension.Length(3),
    bottom: Dimension.Length(4),
  });
  assert.deepEqual(style.gridRow, {
    start: GridPlacement.Line(2),
    end: GridPlacement.Auto,
  });
});

test("replaces complete values and clears nullable fields and arrays", () => {
  const tree = new TaffyTree();
  const track = TrackSizingFunction.Fr(2);
  const node = tree.newLeaf({
    aspectRatio: 2,
    flexBasis: 12,
    gridAutoRows: [track],
  });

  tree.updateStyle(node, {
    aspectRatio: null,
    flexBasis: Dimension.Auto,
    gridAutoRows: [],
  });

  const style = tree.getStyle(node);
  assert.equal(style.aspectRatio, null);
  assert.deepEqual(style.flexBasis, Dimension.Auto);
  assert.deepEqual(style.gridAutoRows, []);
});

test("empty and unchanged updates preserve clean state", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    flexGrow: Number.NaN,
    size: { width: 10, height: 20 },
    gridAutoRows: [TrackSizingFunction.Fr(2)],
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.equal(tree.isDirty(node), false);

  for (const update of [
    {},
    { flexGrow: undefined },
    { size: {} },
    { flexGrow: Number.NaN },
    { size: { width: 10 } },
    { gridAutoRows: [TrackSizingFunction.Fr(2)] },
  ]) {
    tree.updateStyle(node, update);
    assert.equal(tree.isDirty(node), false);
  }

  tree.updateStyle(node, tree.getStyle(node));
  assert.equal(tree.isDirty(node), false);

  tree.updateStyle(node, { scrollbarWidth: -0 });
  assert.equal(tree.isDirty(node), true);
  assert.equal(Object.is(tree.getStyle(node).scrollbarWidth, -0), true);
});

test("validates the merged style before one atomic write", () => {
  const tree = new TaffyTree();
  const track = TrackSizingFunction.Length(10);
  const node = tree.newLeaf({
    flexGrow: 1,
    gridTemplateRows: [GridTemplateComponent.Single(track)],
    gridTemplateRowNames: [["row"]],
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const beforeStyle = tree.getStyle(node);
  const beforeDirty = tree.isDirty(node);

  assert.throws(
    () =>
      tree.updateStyle(node, {
        flexGrow: 2,
        gridTemplateRows: [GridTemplateComponent.Repeat(RepetitionCount.Count(1), [track])],
      }),
    RangeError,
  );
  assert.deepEqual(tree.getStyle(node), beforeStyle);
  assert.equal(tree.isDirty(node), beforeDirty);
});

test("validates node IDs before updating", () => {
  const tree = new TaffyTree();
  const foreign = new TaffyTree().newLeaf({});

  assert.equal(captureError(() => tree.updateStyle(1 as never, {})).constructor, TypeError);
  assert.equal(
    captureError(() => tree.updateStyle(0n as never, {})).code,
    "ERR_TAFFY_INVALID_NODE_ID",
  );
  assert.equal(captureError(() => tree.updateStyle(foreign, {})).code, "ERR_TAFFY_FOREIGN_NODE_ID");

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(captureError(() => tree.updateStyle(stale, {})).code, "ERR_TAFFY_STALE_NODE_ID");
});
