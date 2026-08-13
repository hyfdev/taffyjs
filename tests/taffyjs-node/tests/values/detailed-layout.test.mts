import assert from "node:assert/strict";
import {
  AvailableSpace,
  DetailedLayoutInfoKind,
  Display,
  GridPlacement,
  GridTemplateComponent,
  type NodeId,
  TaffyTree,
  TrackSizingFunction,
} from "@taffyjs/node";
import { test } from "vite-plus/test";

type Tracks = {
  negativeImplicitTracks: number;
  explicitTracks: number;
  positiveImplicitTracks: number;
  gutters: number[];
  sizes: number[];
};
type GridInfo = {
  rows: Tracks;
  columns: Tracks;
  items: Array<{
    rowStart: number;
    rowEnd: number;
    columnStart: number;
    columnEnd: number;
  }>;
};
type Detail = { kind: number } | { kind: number; value: GridInfo };

function compute(tree: TaffyTree, root: NodeId) {
  tree.computeLayout({
    root,
    availableSpace: { width: AvailableSpace.MinContent, height: AvailableSpace.MinContent },
  });
}

function singleLengthTrack(value: number) {
  return GridTemplateComponent.Single(TrackSizingFunction.Length(value));
}

function explicitGrid(tree: TaffyTree) {
  const first = tree.newLeaf({
    gridRow: { start: GridPlacement.Line(1), end: GridPlacement.Line(2) },
    gridColumn: { start: GridPlacement.Line(1), end: GridPlacement.Line(2) },
  });
  const second = tree.newLeaf({
    gridRow: { start: GridPlacement.Line(2), end: GridPlacement.Line(3) },
    gridColumn: { start: GridPlacement.Line(2), end: GridPlacement.Line(3) },
  });
  return tree.newWithChildren(
    {
      display: Display.Grid,
      gridTemplateRows: [singleLengthTrack(12.25), singleLengthTrack(8.5)],
      gridTemplateColumns: [singleLengthTrack(7.75), singleLengthTrack(3.25)],
    },
    [first, second],
  );
}

function gridValue(value: Detail): GridInfo {
  assert.equal(value.kind, DetailedLayoutInfoKind.Grid);
  assert.equal("value" in value, true);
  return (value as Extract<Detail, { value: GridInfo }>).value;
}

test("variants", () => {
  const tree = new TaffyTree();
  const hidden = tree.newLeaf({ display: Display.None });
  const node = tree.newWithChildren({}, [hidden]);
  assert.deepEqual(tree.getDetailedLayoutInfo(node), { kind: DetailedLayoutInfoKind.None });

  tree.setStyle(node, { display: Display.Grid });
  compute(tree, node);
  const output = tree.getDetailedLayoutInfo(node);
  assert.deepEqual(Object.keys(output), ["kind", "value"]);
  const grid = gridValue(output);
  assert.deepEqual(Object.keys(grid), ["rows", "columns", "items"]);
  for (const tracks of [grid.rows, grid.columns]) {
    assert.deepEqual(Object.keys(tracks), [
      "negativeImplicitTracks",
      "explicitTracks",
      "positiveImplicitTracks",
      "gutters",
      "sizes",
    ]);
  }
});

test("numeric-widening", () => {
  const tree = new TaffyTree();
  const root = explicitGrid(tree);
  compute(tree, root);
  const grid = gridValue(tree.getDetailedLayoutInfo(root));

  assert.equal(grid.rows.explicitTracks, 2);
  assert.equal(grid.columns.explicitTracks, 2);
  assert.deepEqual(grid.rows.sizes, [Math.fround(12.25), Math.fround(8.5)]);
  assert.deepEqual(grid.columns.sizes, [Math.fround(7.75), Math.fround(3.25)]);
  assert.deepEqual(grid.items, [
    { rowStart: 1, rowEnd: 2, columnStart: 1, columnEnd: 2 },
    { rowStart: 2, rowEnd: 3, columnStart: 2, columnEnd: 3 },
  ]);
  for (const item of grid.items) {
    for (const value of Object.values(item)) assert.equal(Number.isSafeInteger(value), true);
  }
});

test("detached", () => {
  const tree = new TaffyTree();
  const root = explicitGrid(tree);
  compute(tree, root);
  const first = gridValue(tree.getDetailedLayoutInfo(root));
  const second = gridValue(tree.getDetailedLayoutInfo(root));

  assert.notEqual(first, second);
  assert.notEqual(first.rows, second.rows);
  assert.notEqual(first.rows.sizes, second.rows.sizes);
  assert.notEqual(first.items, second.items);
  assert.notEqual(first.items[0], second.items[0]);
  assert.equal(Object.isFrozen(first), false);
  first.rows.sizes[0] = 99;
  first.items[0].rowStart = 99;
  assert.equal(second.rows.sizes[0], Math.fround(12.25));
  assert.equal(second.items[0].rowStart, 1);
});

test("lifecycle", () => {
  const tree = new TaffyTree();
  const hidden = tree.newLeaf({ display: Display.None });
  const node = tree.newWithChildren({}, [hidden]);
  assert.deepEqual(tree.getDetailedLayoutInfo(node), { kind: DetailedLayoutInfoKind.None });

  tree.setStyle(node, { display: Display.Grid });
  compute(tree, node);
  const grid = tree.getDetailedLayoutInfo(node);
  assert.equal(grid.kind, DetailedLayoutInfoKind.Grid);

  tree.setStyle(node, { display: Display.Flex });
  compute(tree, node);
  assert.deepEqual(tree.getDetailedLayoutInfo(node), grid);
});
