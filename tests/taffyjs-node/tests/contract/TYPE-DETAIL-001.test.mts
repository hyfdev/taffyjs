import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";

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
type Tree = {
  computeLayout(options: object): void;
  getDetailedLayoutInfo(node: bigint): Detail;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  setStyle(node: bigint, style: object): void;
};
type TreeConstructor = new () => Tree;

function constants() {
  return {
    Detail: Reflect.get(api, "DetailedLayoutInfoKind") as { None: number; Grid: number },
    Display: Reflect.get(api, "Display") as { Flex: number; Grid: number },
    AvailableSpace: Reflect.get(api, "AvailableSpace") as { MinContent: object },
  };
}

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  return value as TreeConstructor;
}

function compute(tree: Tree, root: bigint) {
  const { AvailableSpace } = constants();
  tree.computeLayout({
    root,
    availableSpace: { width: AvailableSpace.MinContent, height: AvailableSpace.MinContent },
  });
}

function singleLengthTrack(value: number) {
  return {
    kind: 0,
    value: {
      min: { kind: 0, value },
      max: { kind: 0, value },
    },
  };
}

function explicitGrid(tree: Tree) {
  const { Display } = constants();
  const first = tree.newLeaf({
    gridRow: { start: { kind: 1, index: 1 }, end: { kind: 1, index: 2 } },
    gridColumn: { start: { kind: 1, index: 1 }, end: { kind: 1, index: 2 } },
  });
  const second = tree.newLeaf({
    gridRow: { start: { kind: 1, index: 2 }, end: { kind: 1, index: 3 } },
    gridColumn: { start: { kind: 1, index: 2 }, end: { kind: 1, index: 3 } },
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
  const { Detail } = constants();
  assert.equal(value.kind, Detail.Grid);
  assert.equal("value" in value, true);
  return (value as Extract<Detail, { value: GridInfo }>).value;
}

contractTest("TYPE-DETAIL-001/variants", () => {
  const { Detail, Display } = constants();
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  assert.deepEqual(tree.getDetailedLayoutInfo(node), { kind: Detail.None });

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

contractTest("TYPE-DETAIL-001/numeric-widening", () => {
  const tree = new (TaffyTree())();
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

contractTest("TYPE-DETAIL-001/detached", () => {
  const tree = new (TaffyTree())();
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

contractTest("TYPE-DETAIL-001/lifecycle", () => {
  const { Detail, Display } = constants();
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  assert.deepEqual(tree.getDetailedLayoutInfo(node), { kind: Detail.None });

  tree.setStyle(node, { display: Display.Grid });
  compute(tree, node);
  const grid = tree.getDetailedLayoutInfo(node);
  assert.equal(grid.kind, Detail.Grid);

  tree.setStyle(node, { display: Display.Flex });
  compute(tree, node);
  assert.deepEqual(tree.getDetailedLayoutInfo(node), grid);
});
