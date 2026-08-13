import assert from "node:assert/strict";
import {
  Dimension,
  GridPlacement,
  GridTemplateComponent,
  RepetitionCount,
  TrackSizingFunction,
} from "@taffyjs/node";
import { test } from "vite-plus/test";

test("families", () => {
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
  const length = Dimension.Length(10);
  const percent = TrackSizingFunction.Percent(25).min;
  const auto = { kind: 2 };
  const minContent = { kind: 3 };
  const maxContent = TrackSizingFunction.MaxContent.max;
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

  const min = TrackSizingFunction.Length(1).min;
  const max = TrackSizingFunction.Fr(2).max;
  const minmax = TrackSizingFunction.MinMax(min, max);
  assert.equal(minmax.min, min);
  assert.equal(minmax.max, max);
  assert.equal(Object.isFrozen(minmax), false);

  const count = RepetitionCount.Count(2);
  const tracks = [TrackSizingFunction.Auto];
  const lineNames = [["a"], ["b"]];
  const repeat = GridTemplateComponent.Repeat(count, tracks, lineNames);
  assert.equal(repeat.value.count, count);
  assert.equal(repeat.value.tracks, tracks);
  assert.equal(repeat.value.lineNames, lineNames);
  assert.equal(Object.isFrozen(repeat), false);
  assert.equal(Object.isFrozen(repeat.value), false);

  const firstDefault = GridTemplateComponent.Repeat(count, tracks);
  const secondDefault = GridTemplateComponent.Repeat(count, tracks);
  assert.notEqual(firstDefault, secondDefault);
  assert.notEqual(firstDefault.value, secondDefault.value);
  assert.notEqual(firstDefault.value.lineNames, secondDefault.value.lineNames);
});
