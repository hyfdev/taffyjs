import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type CodedError = Error & { code?: string };
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
  clear(): void;
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  getDetailedLayoutInfo(node: bigint): Detail;
  newLeaf(style: object): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  setStyle(node: bigint, style: object): void;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "getDetailedLayoutInfo"),
    "function",
    "getDetailedLayoutInfo is public",
  );
  return value as unknown as TreeConstructor;
}

function minContentSpace() {
  return { width: api.AvailableSpace.MinContent, height: api.AvailableSpace.MinContent };
}

function compute(tree: Tree, root: bigint) {
  tree.computeLayout({ root, availableSpace: minContentSpace() });
}

function singleLengthTrack(value: number) {
  return api.GridTemplateComponent.Single(api.TrackSizingFunction.Length(value));
}

function explicitGrid(tree: Tree) {
  const first = tree.newLeaf({
    gridRow: { start: api.GridPlacement.Line(1), end: api.GridPlacement.Line(2) },
    gridColumn: { start: api.GridPlacement.Line(1), end: api.GridPlacement.Line(2) },
  });
  const second = tree.newLeaf({
    gridRow: { start: api.GridPlacement.Line(2), end: api.GridPlacement.Line(3) },
    gridColumn: { start: api.GridPlacement.Line(2), end: api.GridPlacement.Line(3) },
  });
  const root = tree.newWithChildren(
    {
      display: api.Display.Grid,
      gridTemplateRows: [singleLengthTrack(12.25), singleLengthTrack(8.5)],
      gridTemplateColumns: [singleLengthTrack(7.75), singleLengthTrack(3.25)],
    },
    [first, second],
  );
  return { first, second, root };
}

function gridValue(value: Detail): GridInfo {
  assert.equal(value.kind, api.DetailedLayoutInfoKind.Grid);
  assert.equal("value" in value, true);
  return (value as { kind: number; value: GridInfo }).value;
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

test("new-none", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf({});
  assert.deepEqual(tree.getDetailedLayoutInfo(node), {
    kind: api.DetailedLayoutInfoKind.None,
  });
});

test("empty-grid", () => {
  const tree = new (TaffyTree())();
  const hidden = tree.newLeaf({ display: api.Display.None });
  const grid = tree.newWithChildren({ display: api.Display.Grid }, [hidden]);
  compute(tree, grid);

  const value = gridValue(tree.getDetailedLayoutInfo(grid));
  assert.deepEqual(value.items, []);
  assert.equal(value.rows.explicitTracks, 0);
  assert.equal(value.columns.explicitTracks, 0);
});

test("grid-payload", () => {
  const tree = new (TaffyTree())();
  const { root } = explicitGrid(tree);
  compute(tree, root);
  const grid = gridValue(tree.getDetailedLayoutInfo(root));

  assert.deepEqual(grid.rows, {
    negativeImplicitTracks: 0,
    explicitTracks: 2,
    positiveImplicitTracks: 0,
    gutters: [0, 0, 0],
    sizes: [Math.fround(12.25), Math.fround(8.5)],
  });
  assert.deepEqual(grid.columns, {
    negativeImplicitTracks: 0,
    explicitTracks: 2,
    positiveImplicitTracks: 0,
    gutters: [0, 0, 0],
    sizes: [Math.fround(7.75), Math.fround(3.25)],
  });
  assert.deepEqual(grid.items, [
    { rowStart: 1, rowEnd: 2, columnStart: 1, columnEnd: 2 },
    { rowStart: 2, rowEnd: 3, columnStart: 2, columnEnd: 3 },
  ]);
});

test("deep-detached", () => {
  const tree = new (TaffyTree())();
  const { root } = explicitGrid(tree);
  compute(tree, root);
  const first = gridValue(tree.getDetailedLayoutInfo(root));
  const second = gridValue(tree.getDetailedLayoutInfo(root));

  assert.notEqual(first, second);
  assert.notEqual(first.rows, second.rows);
  assert.notEqual(first.rows.sizes, second.rows.sizes);
  assert.notEqual(first.items, second.items);
  assert.notEqual(first.items[0], second.items[0]);
  first.rows.sizes[0] = 99;
  first.items[0].rowStart = 99;
  assert.deepEqual(tree.getDetailedLayoutInfo(root), {
    kind: api.DetailedLayoutInfoKind.Grid,
    value: second,
  });
});

test("invalid-id", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const foreign = new Tree().newLeaf({});

  assert.equal(captureError(() => tree.getDetailedLayoutInfo(1 as never)).constructor, TypeError);
  assert.equal(
    captureError(() => tree.getDetailedLayoutInfo(0n)).code,
    "ERR_TAFFY_INVALID_NODE_ID",
  );
  assert.equal(
    captureError(() => tree.getDetailedLayoutInfo(foreign)).code,
    "ERR_TAFFY_FOREIGN_NODE_ID",
  );

  const stale = tree.newLeaf({});
  tree.clear();
  assert.equal(
    captureError(() => tree.getDetailedLayoutInfo(stale)).code,
    "ERR_TAFFY_STALE_NODE_ID",
  );
});

test("stale-upstream", () => {
  const tree = new (TaffyTree())();
  const { root } = explicitGrid(tree);
  compute(tree, root);
  const grid = tree.getDetailedLayoutInfo(root);

  tree.setStyle(root, { display: api.Display.Flex });
  compute(tree, root);
  assert.deepEqual(tree.getDetailedLayoutInfo(root), grid);
});
