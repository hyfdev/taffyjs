import {
  GridPlacementKind,
  GridTemplateComponentKind,
  RepetitionCountKind,
  TrackSizingKind,
} from "./generated/numeric-families.js";

const gridPlacementAuto = Object.freeze({ kind: GridPlacementKind.Auto } as const);

export const GridPlacement = Object.freeze({
  Auto: gridPlacementAuto,
  Line(index: number) {
    return { kind: GridPlacementKind.Line, index };
  },
  NamedLine(name: string, index: number) {
    return { kind: GridPlacementKind.NamedLine, name, index };
  },
  Span(span: number) {
    return { kind: GridPlacementKind.Span, span };
  },
  NamedSpan(name: string, span: number) {
    return { kind: GridPlacementKind.NamedSpan, name, span };
  },
});

function frozenTrack(kind: number) {
  const part = Object.freeze({ kind });
  return Object.freeze({ min: part, max: part });
}

const trackAuto = frozenTrack(TrackSizingKind.Auto);
const trackMinContent = frozenTrack(TrackSizingKind.MinContent);
const trackMaxContent = frozenTrack(TrackSizingKind.MaxContent);

export const TrackSizingFunction = Object.freeze({
  Length(value: number) {
    return {
      min: { kind: TrackSizingKind.Length, value },
      max: { kind: TrackSizingKind.Length, value },
    };
  },
  Percent(value: number) {
    return {
      min: { kind: TrackSizingKind.Percent, value },
      max: { kind: TrackSizingKind.Percent, value },
    };
  },
  Auto: trackAuto,
  MinContent: trackMinContent,
  MaxContent: trackMaxContent,
  FitContent(value: unknown) {
    return {
      min: { kind: TrackSizingKind.Auto },
      max: { kind: TrackSizingKind.FitContent, value },
    };
  },
  Fr(value: number) {
    return {
      min: { kind: TrackSizingKind.Auto },
      max: { kind: TrackSizingKind.Fr, value },
    };
  },
  MinMax(min: unknown, max: unknown) {
    return { min, max };
  },
});

const autoFill = Object.freeze({ kind: RepetitionCountKind.AutoFill } as const);
const autoFit = Object.freeze({ kind: RepetitionCountKind.AutoFit } as const);

export const RepetitionCount = Object.freeze({
  Count(value: number) {
    return { kind: RepetitionCountKind.Count, value };
  },
  AutoFill: autoFill,
  AutoFit: autoFit,
});

export const GridTemplateComponent = Object.freeze({
  Single(value: unknown) {
    return { kind: GridTemplateComponentKind.Single, value };
  },
  Repeat(count: unknown, tracks: unknown[], lineNames: string[][] = []) {
    return {
      kind: GridTemplateComponentKind.Repeat,
      value: { count, tracks, lineNames },
    };
  },
});
