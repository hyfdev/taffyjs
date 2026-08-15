import {
  GridPlacementKind,
  GridTemplateComponentKind,
  RepetitionCountKind,
  TrackSizingKind,
} from "./numeric-families.js";
import type {
  GridPlacement as GridPlacementValue,
  GridPlacementInput,
  GridTemplateComponent as GridTemplateComponentValue,
  GridTemplateComponentInput,
  RepetitionCount as RepetitionCountValue,
  MaxTrackSizingFunctionInput,
  MinTrackSizingFunctionInput,
  RepetitionCountInput,
  TrackSizingFunction as TrackSizingFunctionValue,
  TrackSizingFunctionInput,
} from "./public-types.js";
import type { LengthPercentageInput } from "./tagged-values.js";

export type GridPlacement = GridPlacementValue;
export type GridTemplateComponent = GridTemplateComponentValue;
export type RepetitionCount = RepetitionCountValue;
export type TrackSizingFunction = TrackSizingFunctionValue;

const gridPlacementAuto = Object.freeze({ kind: GridPlacementKind.Auto } as const);

/** Provides constructors and a shared Auto value for Grid placement inputs. */
export const GridPlacement = Object.freeze({
  Auto: gridPlacementAuto,
  Line(index: number): Extract<GridPlacementInput, { kind: typeof GridPlacementKind.Line }> {
    return { kind: GridPlacementKind.Line, index };
  },
  NamedLine(
    name: string,
    index: number,
  ): Extract<GridPlacementInput, { kind: typeof GridPlacementKind.NamedLine }> {
    return { kind: GridPlacementKind.NamedLine, name, index };
  },
  Span(span: number): Extract<GridPlacementInput, { kind: typeof GridPlacementKind.Span }> {
    return { kind: GridPlacementKind.Span, span };
  },
  NamedSpan(
    name: string,
    span: number,
  ): Extract<GridPlacementInput, { kind: typeof GridPlacementKind.NamedSpan }> {
    return { kind: GridPlacementKind.NamedSpan, name, span };
  },
});

function frozenTrack<const TKind extends number>(kind: TKind) {
  const part = Object.freeze({ kind });
  return Object.freeze({ min: part, max: part });
}

const trackAuto = frozenTrack(TrackSizingKind.Auto);
const trackMinContent = frozenTrack(TrackSizingKind.MinContent);
const trackMaxContent = frozenTrack(TrackSizingKind.MaxContent);

/** Provides constructors and shared values for Grid track sizing inputs. */
export const TrackSizingFunction = Object.freeze({
  Length(value: number): TrackSizingFunctionInput {
    return {
      min: { kind: TrackSizingKind.Length, value },
      max: { kind: TrackSizingKind.Length, value },
    };
  },
  Percent(value: number): TrackSizingFunctionInput {
    return {
      min: { kind: TrackSizingKind.Percent, value },
      max: { kind: TrackSizingKind.Percent, value },
    };
  },
  Auto: trackAuto,
  MinContent: trackMinContent,
  MaxContent: trackMaxContent,
  FitContent(value: LengthPercentageInput): TrackSizingFunctionInput {
    return {
      min: { kind: TrackSizingKind.Auto },
      max: { kind: TrackSizingKind.FitContent, value },
    };
  },
  Fr(value: number): TrackSizingFunctionInput {
    return {
      min: { kind: TrackSizingKind.Auto },
      max: { kind: TrackSizingKind.Fr, value },
    };
  },
  MinMax(
    min: MinTrackSizingFunctionInput,
    max: MaxTrackSizingFunctionInput,
  ): TrackSizingFunctionInput {
    return { min, max };
  },
});

const autoFill = Object.freeze({ kind: RepetitionCountKind.AutoFill } as const);
const autoFit = Object.freeze({ kind: RepetitionCountKind.AutoFit } as const);

/** Provides constructors and shared values for Grid repetition counts. */
export const RepetitionCount = Object.freeze({
  Count(value: number): Extract<RepetitionCountInput, { kind: typeof RepetitionCountKind.Count }> {
    return { kind: RepetitionCountKind.Count, value };
  },
  AutoFill: autoFill,
  AutoFit: autoFit,
});

/** Provides constructors for Grid template components. */
export const GridTemplateComponent = Object.freeze({
  Single(
    value: TrackSizingFunctionInput,
  ): Extract<GridTemplateComponentInput, { kind: typeof GridTemplateComponentKind.Single }> {
    return { kind: GridTemplateComponentKind.Single, value };
  },
  Repeat(
    count: RepetitionCountInput,
    tracks: readonly TrackSizingFunctionInput[],
    lineNames: readonly (readonly string[])[] = [],
  ): Extract<GridTemplateComponentInput, { kind: typeof GridTemplateComponentKind.Repeat }> {
    return {
      kind: GridTemplateComponentKind.Repeat,
      value: { count, tracks, lineNames },
    };
  },
});
