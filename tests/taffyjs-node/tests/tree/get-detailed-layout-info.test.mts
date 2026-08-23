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
  positions: Array<{ start: number; end: number }>;
  lineNames: string[][];
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

function minContentSpace() {
  return { width: AvailableSpace.MinContent, height: AvailableSpace.MinContent };
}

function compute(tree: TaffyTree, root: NodeId) {
  tree.computeLayout({ root, availableSpace: minContentSpace() });
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
  const root = tree.newWithChildren([first, second], {
    display: Display.Grid,
    gridTemplateRows: [singleLengthTrack(12.25), singleLengthTrack(8.5)],
    gridTemplateColumns: [singleLengthTrack(7.75), singleLengthTrack(3.25)],
    gridTemplateRowNames: [["row-start"], [], ["row-end"]],
    gridTemplateColumnNames: [["column-start"], ["middle"], ["column-end"]],
  });
  return { first, second, root };
}

function gridValue(value: Detail): GridInfo {
  assert.equal(value.kind, DetailedLayoutInfoKind.Grid);
  assert.equal("value" in value, true);
  return (value as { kind: number; value: GridInfo }).value;
}

test("new-none", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf();
  assert.deepEqual(tree.getDetailedLayoutInfo(node), {
    kind: DetailedLayoutInfoKind.None,
  });
});

test("empty-grid", () => {
  const tree = new TaffyTree();
  const hidden = tree.newLeaf({ display: Display.None });
  const grid = tree.newWithChildren([hidden], { display: Display.Grid });
  compute(tree, grid);

  const value = gridValue(tree.getDetailedLayoutInfo(grid));
  assert.deepEqual(value.items, []);
  assert.equal(value.rows.explicitTracks, 0);
  assert.equal(value.columns.explicitTracks, 0);
});

test("grid-payload", () => {
  const tree = new TaffyTree();
  const { root } = explicitGrid(tree);
  compute(tree, root);
  const output = tree.getDetailedLayoutInfo(root);
  assert.deepEqual(Object.keys(output), ["kind", "value"]);
  assert.equal(Object.isFrozen(output), false);
  const grid = gridValue(output);
  assert.deepEqual(Object.keys(grid), ["rows", "columns", "items"]);
  assert.equal(Object.isFrozen(grid), false);

  assert.deepEqual(grid.rows, {
    negativeImplicitTracks: 0,
    explicitTracks: 2,
    positiveImplicitTracks: 0,
    positions: [
      { start: 0, end: Math.fround(12.25) },
      { start: Math.fround(12.25), end: Math.fround(20.75) },
    ],
    lineNames: [["row-start"], [], ["row-end"]],
  });
  assert.deepEqual(grid.columns, {
    negativeImplicitTracks: 0,
    explicitTracks: 2,
    positiveImplicitTracks: 0,
    positions: [
      { start: 0, end: Math.fround(7.75) },
      { start: Math.fround(7.75), end: 11 },
    ],
    lineNames: [["column-start"], ["middle"], ["column-end"]],
  });
  assert.deepEqual(grid.items, [
    { rowStart: 1, rowEnd: 2, columnStart: 1, columnEnd: 2 },
    { rowStart: 2, rowEnd: 3, columnStart: 2, columnEnd: 3 },
  ]);
});

test("deep-detached", () => {
  const tree = new TaffyTree();
  const { root } = explicitGrid(tree);
  compute(tree, root);
  const first = gridValue(tree.getDetailedLayoutInfo(root));
  const second = gridValue(tree.getDetailedLayoutInfo(root));

  assert.notEqual(first, second);
  assert.notEqual(first.rows, second.rows);
  assert.notEqual(first.rows.positions, second.rows.positions);
  assert.notEqual(first.rows.positions[0], second.rows.positions[0]);
  assert.notEqual(first.rows.lineNames, second.rows.lineNames);
  assert.notEqual(first.rows.lineNames[0], second.rows.lineNames[0]);
  assert.notEqual(first.items, second.items);
  assert.notEqual(first.items[0], second.items[0]);
  first.rows.positions[0].start = 99;
  first.rows.lineNames[0][0] = "changed";
  first.items[0].rowStart = 99;
  assert.deepEqual(tree.getDetailedLayoutInfo(root), {
    kind: DetailedLayoutInfoKind.Grid,
    value: second,
  });
});

test("stale-upstream", () => {
  const tree = new TaffyTree();
  const { root } = explicitGrid(tree);
  compute(tree, root);
  const grid = tree.getDetailedLayoutInfo(root);

  tree.setStyle(root, { display: Display.Flex });
  compute(tree, root);
  assert.deepEqual(tree.getDetailedLayoutInfo(root), grid);
});
