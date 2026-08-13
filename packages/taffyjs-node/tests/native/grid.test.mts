import assert from "node:assert/strict";
import { NativeTaffyTree } from "../../src/binding.ts";
import {
  GridPlacement,
  GridTemplateComponent,
  RepetitionCount,
  TrackSizingFunction,
} from "../../src/index.ts";
import { test } from "vite-plus/test";

type RawStyle = Record<string, unknown>;
type Placement = { kind: number; name?: string; index?: number; span?: number };
type TrackPart = { kind: number; value?: unknown };
type Track = { min: TrackPart; max: TrackPart };
type Count = { kind: 0; value: number } | { kind: 1 } | { kind: 2 };
type Component = { kind: number; value: unknown };
function createOwner() {
  return new NativeTaffyTree();
}

function storedStyle(style: RawStyle): RawStyle {
  const owner = createOwner();
  const node = owner.rawNewLeaf(style);
  return owner.rawGetStyle(node) as unknown as RawStyle;
}

function rejectsWithoutNode(style: RawStyle, error: typeof TypeError | typeof RangeError): void {
  const owner = createOwner();
  assert.throws(() => owner.rawNewLeaf(style), error);
  assert.equal(owner.rawNodeCount(), 0);
}

function repeat(count: Count, tracks: Track[], lineNames = [["start"], ["end"]]): Component {
  return { kind: 1, value: { count, tracks, lineNames } };
}

test("Grid helpers and direct tagged records store the same values", () => {
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

  const length = { kind: 0, value: 10 } as const;
  const semanticLength = { unit: 0, value: 10 } as const;
  const auto = { kind: 2 } as const;
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

test("reachable positive repetitions reject the empty line-name shape that panics Taffy", () => {
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

test("Grid integer fields enforce their exact Rust ranges", () => {
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

test("Grid strings preserve Unicode with Node's ordinary string conversion", () => {
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

test("nested Grid input and output collections are detached copies", () => {
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
  const node = owner.rawNewLeaf({ gridTemplateRows: [component], gridTemplateAreas: areas });
  track.min.value = 99;
  lineNames[0][0] = "changed";
  areas.areas[0].name = "changed";

  const first = owner.rawGetStyle(node);
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
  const second = owner.rawGetStyle(node);
  assert.equal(
    ((second.gridTemplateRows as Component[])[0].value as { lineNames: string[][] })
      .lineNames[0][0],
    "a",
  );
});

test("grid template areas use null for absence and records for values", () => {
  assert.equal(storedStyle({}).gridTemplateAreas, null);
  assert.equal(storedStyle({ gridTemplateAreas: null }).gridTemplateAreas, null);
  const areas = {
    areas: [{ name: "a", rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 1 }],
    rowCount: 1,
    columnCount: 1,
  };
  assert.deepEqual(storedStyle({ gridTemplateAreas: areas }).gridTemplateAreas, areas);
});

test("Grid output reports stored values without helper history", () => {
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

test("tagged Grid records ignore fields from inactive variants", () => {
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

test("representable Grid values pass through without extra CSS validation", () => {
  const track = { min: { kind: 0, value: -10 }, max: { kind: 6, value: -2 } };
  const style = storedStyle({
    gridRow: { start: { kind: 2, name: "", index: 0 }, end: { kind: 3, span: 0 } },
    gridTemplateRows: [repeat({ kind: 0, value: 0 }, [track])],
    gridTemplateAreas: { areas: [], rowCount: 0, columnCount: 0 },
  });
  assert.deepEqual((style.gridRow as { start: unknown }).start, { kind: 2, name: "", index: 0 });
  assert.deepEqual((style.gridRow as { end: unknown }).end, { kind: 3, span: 0 });
});
