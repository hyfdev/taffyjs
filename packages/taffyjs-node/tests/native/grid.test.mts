import assert from "node:assert/strict";
import * as native from "../../native.js";
import * as publicApi from "../../src/index.ts";
import { test } from "vite-plus/test";

type RawStyle = Record<string, unknown>;
type Placement = { kind: number; name?: string; index?: number; span?: number };
type TrackPart = { kind: number; value?: unknown };
type Track = { min: TrackPart; max: TrackPart };
type Count = { kind: number; value?: number };
type Component = { kind: number; value: unknown };
type NativeTaffyTree = {
  rawGetStyle(node: bigint, publicMethod: string): RawStyle;
  rawNewLeaf(style: RawStyle, publicMethod: string): bigint;
  rawNodeCount(publicMethod: string): number;
};
type NativeTaffyTreeConstructor = new () => NativeTaffyTree;
type GridHelpers = {
  GridPlacement: Readonly<{
    Auto: Readonly<Placement>;
    Line(index: number): Placement;
    NamedLine(name: string, index: number): Placement;
    Span(span: number): Placement;
    NamedSpan(name: string, span: number): Placement;
  }>;
  TrackSizingFunction: Readonly<{
    Length(value: number): Track;
    Percent(value: number): Track;
    Auto: Readonly<Track>;
    MinContent: Readonly<Track>;
    MaxContent: Readonly<Track>;
    FitContent(value: unknown): Track;
    Fr(value: number): Track;
    MinMax(min: TrackPart, max: TrackPart): Track;
  }>;
  RepetitionCount: Readonly<{
    Count(value: number): Count;
    AutoFill: Readonly<Count>;
    AutoFit: Readonly<Count>;
  }>;
  GridTemplateComponent: Readonly<{
    Single(value: Track): Component;
    Repeat(count: Count, tracks: Track[], lineNames?: string[][]): Component;
  }>;
};

const NativeTaffyTree = Reflect.get(native, "NativeTaffyTree") as NativeTaffyTreeConstructor;

function createOwner(): NativeTaffyTree {
  const owner = new NativeTaffyTree();
  for (const method of ["rawGetStyle", "rawNewLeaf", "rawNodeCount"] as const) {
    assert.equal(typeof owner[method], "function", `${method} is available`);
  }
  return owner;
}

function helpers(): GridHelpers {
  const names = [
    "GridPlacement",
    "TrackSizingFunction",
    "RepetitionCount",
    "GridTemplateComponent",
  ] as const;
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const value = Reflect.get(publicApi, name);
    assert.equal(typeof value, "object", `${name} is exported`);
    assert.notEqual(value, null, `${name} is exported`);
    result[name] = value;
  }
  return result as GridHelpers;
}

function storedStyle(style: RawStyle): RawStyle {
  const owner = createOwner();
  const node = owner.rawNewLeaf(style, "newLeaf");
  return owner.rawGetStyle(node, "getStyle");
}

function rejectsWithoutNode(style: RawStyle, error: typeof TypeError | typeof RangeError): void {
  const owner = createOwner();
  assert.throws(() => owner.rawNewLeaf(style, "newLeaf"), error);
  assert.equal(owner.rawNodeCount("getNodeCount"), 0);
}

function repeat(count: Count, tracks: Track[], lineNames = [["start"], ["end"]]): Component {
  return { kind: 1, value: { count, tracks, lineNames } };
}

test("helper-conversion", () => {
  const { GridPlacement, TrackSizingFunction, RepetitionCount, GridTemplateComponent } = helpers();
  const placements: Array<[Placement, Placement]> = [
    [GridPlacement.Auto, { kind: 0 }],
    [GridPlacement.Line(-2), { kind: 1, index: -2 }],
    [GridPlacement.NamedLine("main", 3), { kind: 2, name: "main", index: 3 }],
    [GridPlacement.Span(4), { kind: 3, span: 4 }],
    [GridPlacement.NamedSpan("main", 5), { kind: 4, name: "main", span: 5 }],
  ];
  for (const [helper, direct] of placements) {
    const fromHelper = storedStyle({ gridRow: { start: helper } }).gridRow;
    const fromDirect = storedStyle({ gridRow: { start: direct } }).gridRow;
    assert.deepEqual(fromHelper, fromDirect);
  }

  const length = { kind: 0, value: 10 };
  const semanticLength = { unit: 0, value: 10 };
  const auto = { kind: 2 };
  const tracks: Array<[Track, Track]> = [
    [TrackSizingFunction.Length(10), { min: length, max: length }],
    [TrackSizingFunction.Percent(25), { min: { kind: 1, value: 25 }, max: { kind: 1, value: 25 } }],
    [TrackSizingFunction.Auto, { min: auto, max: auto }],
    [TrackSizingFunction.MinContent, { min: { kind: 3 }, max: { kind: 3 } }],
    [TrackSizingFunction.MaxContent, { min: { kind: 4 }, max: { kind: 4 } }],
    [
      TrackSizingFunction.FitContent(semanticLength),
      { min: auto, max: { kind: 5, value: semanticLength } },
    ],
    [TrackSizingFunction.Fr(2), { min: auto, max: { kind: 6, value: 2 } }],
    [
      TrackSizingFunction.MinMax(length, { kind: 6, value: 2 }),
      { min: length, max: { kind: 6, value: 2 } },
    ],
  ];
  for (const [helper, direct] of tracks) {
    assert.deepEqual(
      storedStyle({ gridAutoRows: [helper] }).gridAutoRows,
      storedStyle({ gridAutoRows: [direct] }).gridAutoRows,
    );
  }

  const largePercent = 1e39;
  const expectedPercent = Math.fround(largePercent / 100) * 100;
  const percentTrack = (
    storedStyle({
      gridAutoRows: [
        {
          min: { kind: 1, value: largePercent },
          max: { kind: 1, value: largePercent },
        },
      ],
    }).gridAutoRows as Track[]
  )[0];
  assert.equal(percentTrack.min.value, expectedPercent);
  assert.equal(percentTrack.max.value, expectedPercent);
  assert.equal(Number.isFinite(percentTrack.min.value), true);

  const fitContentTrack = (
    storedStyle({
      gridAutoRows: [
        {
          min: auto,
          max: { kind: 5, value: { unit: 1, value: largePercent } },
        },
      ],
    }).gridAutoRows as Track[]
  )[0];
  assert.equal((fitContentTrack.max.value as { value: number }).value, expectedPercent);

  for (const [helper, direct] of [
    [RepetitionCount.Count(2), { kind: 0, value: 2 }],
    [RepetitionCount.AutoFill, { kind: 1 }],
    [RepetitionCount.AutoFit, { kind: 2 }],
  ] as Array<[Count, Count]>) {
    const helperComponent = GridTemplateComponent.Repeat(
      helper,
      [TrackSizingFunction.Length(10)],
      [["a"], ["b"]],
    );
    const directComponent = repeat(direct, [{ min: length, max: length }], [["a"], ["b"]]);
    assert.deepEqual(
      storedStyle({ gridTemplateRows: [helperComponent] }).gridTemplateRows,
      storedStyle({ gridTemplateRows: [directComponent] }).gridTemplateRows,
    );
  }

  const single = GridTemplateComponent.Single(TrackSizingFunction.Length(10));
  assert.deepEqual(
    storedStyle({ gridTemplateRows: [single] }).gridTemplateRows,
    storedStyle({ gridTemplateRows: [{ kind: 0, value: { min: length, max: length } }] })
      .gridTemplateRows,
  );
});

test("panic-guard", () => {
  const track = { min: { kind: 0, value: 10 }, max: { kind: 0, value: 10 } };
  const safeRepeat = repeat({ kind: 0, value: 1 }, [track], []);
  storedStyle({ gridTemplateRows: [safeRepeat] });
  storedStyle({ gridTemplateColumns: [safeRepeat] });

  for (const count of [{ kind: 0, value: 1 }, { kind: 1 }, { kind: 2 }] as Count[]) {
    const unsafeRepeat = repeat(count, [track], []);
    rejectsWithoutNode(
      { gridTemplateRows: [unsafeRepeat], gridTemplateRowNames: [[]] },
      RangeError,
    );
    rejectsWithoutNode(
      { gridTemplateColumns: [unsafeRepeat], gridTemplateColumnNames: [[]] },
      RangeError,
    );
  }

  const zeroRepeat = repeat({ kind: 0, value: 0 }, [track], []);
  storedStyle({ gridTemplateRows: [zeroRepeat], gridTemplateRowNames: [[]] });
  storedStyle({ gridTemplateColumns: [zeroRepeat], gridTemplateColumnNames: [[]] });
});

test("integers", () => {
  for (const index of [-32768, 32767]) {
    assert.deepEqual(
      (storedStyle({ gridRow: { start: { kind: 1, index } } }).gridRow as { start: unknown }).start,
      { kind: 1, index },
    );
  }
  for (const span of [0, 65535]) {
    assert.deepEqual(
      (storedStyle({ gridRow: { start: { kind: 3, span } } }).gridRow as { start: unknown }).start,
      { kind: 3, span },
    );
  }
  const track = { min: { kind: 0, value: 10 }, max: { kind: 0, value: 10 } };
  for (const value of [0, 65535]) {
    const component = repeat({ kind: 0, value }, [track]);
    const output = storedStyle({ gridTemplateRows: [component] }).gridTemplateRows as Component[];
    assert.deepEqual((output[0].value as { count: unknown }).count, { kind: 0, value });
    const areas = {
      areas: [{ name: "a", rowStart: value, rowEnd: value, columnStart: value, columnEnd: value }],
      rowCount: value,
      columnCount: value,
    };
    assert.deepEqual(storedStyle({ gridTemplateAreas: areas }).gridTemplateAreas, areas);
  }
  for (const value of [-32769, 32768, -1, 65536, 0.5, NaN, Infinity]) {
    if (value < -32768 || value > 32767 || !Number.isInteger(value)) {
      rejectsWithoutNode({ gridRow: { start: { kind: 1, index: value } } }, RangeError);
    }
    if (value < 0 || value > 65535 || !Number.isInteger(value)) {
      rejectsWithoutNode({ gridRow: { start: { kind: 3, span: value } } }, RangeError);
    }
  }
});

test("strings", () => {
  const text = "列-😀-é";
  const style = storedStyle({
    gridRow: { start: { kind: 2, name: text, index: 1 } },
    gridTemplateRowNames: [[text]],
    gridTemplateAreas: {
      areas: [{ name: text, rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 1 }],
      rowCount: 1,
      columnCount: 1,
    },
  });
  assert.equal((style.gridRow as { start: { name: string } }).start.name, text);
  assert.deepEqual(style.gridTemplateRowNames, [[text]]);
  assert.equal((style.gridTemplateAreas as { areas: Array<{ name: string }> }).areas[0].name, text);

  const replacement = storedStyle({ gridRow: { start: { kind: 2, name: "\ud800", index: 1 } } });
  assert.equal((replacement.gridRow as { start: { name: string } }).start.name, "\ufffd");
});

test("ownership", () => {
  const track = { min: { kind: 0, value: 10 }, max: { kind: 0, value: 10 } };
  const tracks = [track];
  const lineNames = [["a"], ["b"]];
  const component = repeat({ kind: 0, value: 2 }, tracks, lineNames);
  const areas = {
    areas: [{ name: "a", rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 1 }],
    rowCount: 1,
    columnCount: 1,
  };
  const owner = createOwner();
  const node = owner.rawNewLeaf(
    { gridTemplateRows: [component], gridTemplateAreas: areas },
    "newLeaf",
  );
  track.min.value = 99;
  lineNames[0][0] = "changed";
  areas.areas[0].name = "changed";

  const first = owner.rawGetStyle(node, "getStyle");
  assert.equal(
    ((first.gridTemplateRows as Component[])[0].value as { tracks: Track[] }).tracks[0].min.value,
    10,
  );
  assert.equal(
    ((first.gridTemplateRows as Component[])[0].value as { lineNames: string[][] }).lineNames[0][0],
    "a",
  );
  assert.equal((first.gridTemplateAreas as { areas: Array<{ name: string }> }).areas[0].name, "a");

  ((first.gridTemplateRows as Component[])[0].value as { lineNames: string[][] }).lineNames[0][0] =
    "output";
  const second = owner.rawGetStyle(node, "getStyle");
  assert.equal(
    ((second.gridTemplateRows as Component[])[0].value as { lineNames: string[][] })
      .lineNames[0][0],
    "a",
  );
});

test("areas-null", () => {
  assert.equal(storedStyle({}).gridTemplateAreas, null);
  assert.equal(storedStyle({ gridTemplateAreas: null }).gridTemplateAreas, null);
  const areas = {
    areas: [{ name: "a", rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 1 }],
    rowCount: 1,
    columnCount: 1,
  };
  assert.deepEqual(storedStyle({ gridTemplateAreas: areas }).gridTemplateAreas, areas);
});

test("canonical", () => {
  const { GridPlacement, TrackSizingFunction } = helpers();
  const placement = GridPlacement.NamedLine("a", 2);
  const track = TrackSizingFunction.Fr(3);
  const output = storedStyle({ gridRow: { start: placement }, gridAutoRows: [track] });
  assert.deepEqual((output.gridRow as { start: unknown }).start, { kind: 2, name: "a", index: 2 });
  assert.deepEqual((output.gridAutoRows as Track[])[0], {
    min: { kind: 2 },
    max: { kind: 6, value: 3 },
  });
  assert.notEqual((output.gridRow as { start: unknown }).start, placement);
  assert.notEqual((output.gridAutoRows as Track[])[0], track);
});

test("extra-fields", () => {
  const style = storedStyle({
    gridRow: { start: { kind: 0, index: 99, ignored: true } },
    gridAutoRows: [{ min: { kind: 2, value: 99 }, max: { kind: 6, value: 2, ignored: true } }],
    gridTemplateRows: [{ kind: 0, value: { min: { kind: 2 }, max: { kind: 2 } }, ignored: true }],
  });
  assert.deepEqual((style.gridRow as { start: unknown }).start, { kind: 0 });
  assert.deepEqual((style.gridAutoRows as Track[])[0], {
    min: { kind: 2 },
    max: { kind: 6, value: 2 },
  });
  assert.deepEqual((style.gridTemplateRows as Component[])[0], {
    kind: 0,
    value: { min: { kind: 2 }, max: { kind: 2 } },
  });
});

test("no-css-validation", () => {
  const track = { min: { kind: 0, value: -10 }, max: { kind: 6, value: -2 } };
  const style = storedStyle({
    gridRow: { start: { kind: 2, name: "", index: 0 }, end: { kind: 3, span: 0 } },
    gridTemplateRows: [repeat({ kind: 0, value: 0 }, [track])],
    gridTemplateAreas: { areas: [], rowCount: 0, columnCount: 0 },
  });
  assert.deepEqual((style.gridRow as { start: unknown }).start, { kind: 2, name: "", index: 0 });
  assert.deepEqual((style.gridRow as { end: unknown }).end, { kind: 3, span: 0 });
});
