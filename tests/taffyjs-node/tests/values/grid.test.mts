import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type Placement = { kind: number; name?: string; index?: number; span?: number };
type TrackPart = { kind: number; value?: unknown };
type Track = { min: TrackPart; max: TrackPart };
type Count = { kind: number; value?: number };
type Component = { kind: number; value: unknown };

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

function helpers(): GridHelpers {
  const names = [
    "GridPlacement",
    "TrackSizingFunction",
    "RepetitionCount",
    "GridTemplateComponent",
  ] as const;
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const value = Reflect.get(api, name);
    assert.equal(typeof value, "object", `${name} is exported`);
    assert.notEqual(value, null, `${name} is exported`);
    result[name] = value;
  }
  return result as GridHelpers;
}

test("families", () => {
  const { GridPlacement, TrackSizingFunction, RepetitionCount, GridTemplateComponent } = helpers();
  assert.deepEqual(GridPlacement.Auto, { kind: 0 });
  assert.deepEqual(GridPlacement.Line(-2), { kind: 1, index: -2 });
  assert.deepEqual(GridPlacement.NamedLine("main", 3), { kind: 2, name: "main", index: 3 });
  assert.deepEqual(GridPlacement.Span(4), { kind: 3, span: 4 });
  assert.deepEqual(GridPlacement.NamedSpan("main", 5), { kind: 4, name: "main", span: 5 });

  assert.deepEqual(TrackSizingFunction.Length(10), {
    min: { kind: 0, value: 10 },
    max: { kind: 0, value: 10 },
  });
  assert.deepEqual(TrackSizingFunction.Percent(25), {
    min: { kind: 1, value: 25 },
    max: { kind: 1, value: 25 },
  });
  assert.deepEqual(RepetitionCount.Count(2), { kind: 0, value: 2 });
  assert.deepEqual(RepetitionCount.AutoFill, { kind: 1 });
  assert.deepEqual(RepetitionCount.AutoFit, { kind: 2 });

  const track = TrackSizingFunction.Auto;
  const count = RepetitionCount.Count(2);
  assert.deepEqual(GridTemplateComponent.Single(track), { kind: 0, value: track });
  assert.deepEqual(GridTemplateComponent.Repeat(count, [track]), {
    kind: 1,
    value: { count, tracks: [track], lineNames: [] },
  });
});

test("minmax", () => {
  const { TrackSizingFunction } = helpers();
  const length = { kind: 0, value: 10 };
  const percent = { kind: 1, value: 25 };
  const auto = { kind: 2 };
  const minContent = { kind: 3 };
  const maxContent = { kind: 4 };
  assert.deepEqual(TrackSizingFunction.Auto, { min: auto, max: auto });
  assert.deepEqual(TrackSizingFunction.MinContent, { min: minContent, max: minContent });
  assert.deepEqual(TrackSizingFunction.MaxContent, { min: maxContent, max: maxContent });
  assert.deepEqual(TrackSizingFunction.FitContent(length), {
    min: auto,
    max: { kind: 5, value: length },
  });
  assert.deepEqual(TrackSizingFunction.Fr(2), { min: auto, max: { kind: 6, value: 2 } });
  assert.deepEqual(TrackSizingFunction.MinMax(percent, maxContent), {
    min: percent,
    max: maxContent,
  });
});

test("repeat-lines", () => {
  const { TrackSizingFunction, RepetitionCount, GridTemplateComponent } = helpers();
  const count = RepetitionCount.Count(2);
  const tracks = [TrackSizingFunction.Length(10), TrackSizingFunction.Fr(1)];
  const lineNames = [["start"], ["middle"], ["end"]];
  assert.deepEqual(GridTemplateComponent.Repeat(count, tracks, lineNames), {
    kind: 1,
    value: { count, tracks, lineNames },
  });
  assert.deepEqual(GridTemplateComponent.Repeat(RepetitionCount.AutoFill, tracks), {
    kind: 1,
    value: { count: RepetitionCount.AutoFill, tracks, lineNames: [] },
  });
});

test("helper-materialization", () => {
  const { GridPlacement, TrackSizingFunction, RepetitionCount, GridTemplateComponent } = helpers();
  for (const value of [
    GridPlacement,
    TrackSizingFunction,
    RepetitionCount,
    GridTemplateComponent,
  ]) {
    assert.equal(Object.isFrozen(value), true);
  }
  for (const value of [
    GridPlacement.Auto,
    TrackSizingFunction.Auto,
    TrackSizingFunction.MinContent,
    TrackSizingFunction.MaxContent,
    RepetitionCount.AutoFill,
    RepetitionCount.AutoFit,
  ]) {
    assert.equal(Object.isFrozen(value), true);
  }

  const line1 = GridPlacement.Line(1);
  const line2 = GridPlacement.Line(1);
  assert.notEqual(line1, line2);
  assert.equal(Object.isFrozen(line1), false);

  const min = { kind: 0, value: 1 };
  const max = { kind: 6, value: 2 };
  const minmax = TrackSizingFunction.MinMax(min, max);
  assert.equal(minmax.min, min);
  assert.equal(minmax.max, max);
  assert.equal(Object.isFrozen(minmax), false);

  const count = RepetitionCount.Count(2);
  const tracks = [TrackSizingFunction.Auto];
  const lineNames = [["a"], ["b"]];
  const repeat = GridTemplateComponent.Repeat(count, tracks, lineNames) as {
    value: { count: Count; tracks: Track[]; lineNames: string[][] };
  };
  assert.equal(repeat.value.count, count);
  assert.equal(repeat.value.tracks, tracks);
  assert.equal(repeat.value.lineNames, lineNames);
  assert.equal(Object.isFrozen(repeat), false);
  assert.equal(Object.isFrozen(repeat.value), false);

  const firstDefault = GridTemplateComponent.Repeat(count, tracks) as {
    value: { lineNames: string[][] };
  };
  const secondDefault = GridTemplateComponent.Repeat(count, tracks) as {
    value: { lineNames: string[][] };
  };
  assert.notEqual(firstDefault, secondDefault);
  assert.notEqual(firstDefault.value, secondDefault.value);
  assert.notEqual(firstDefault.value.lineNames, secondDefault.value.lineNames);
});
