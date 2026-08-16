import {
  AvailableSpaceKind,
  type AvailableSpace,
  type MeasureArgs as NativeMeasureArgs,
} from "@taffyjs/node";
import { MeasureMode } from "./enums.js";
import type { MeasureFunction, Size } from "./types.js";

interface YogaMeasureConstraint {
  readonly mode: MeasureMode;
  readonly value: number;
}

function mapConstraint(
  knownDimension: number | undefined,
  availableSpace: AvailableSpace,
  forceExactly: boolean,
): YogaMeasureConstraint {
  if (knownDimension !== undefined || forceExactly) {
    return {
      mode: MeasureMode.Exactly,
      value:
        availableSpace.kind === AvailableSpaceKind.Definite
          ? Math.max(0, availableSpace.value)
          : Math.max(0, knownDimension ?? 0),
    };
  }

  switch (availableSpace.kind) {
    case AvailableSpaceKind.Definite:
      return { mode: MeasureMode.AtMost, value: Math.max(0, availableSpace.value) };
    case AvailableSpaceKind.MinContent:
      return { mode: MeasureMode.AtMost, value: 0 };
    case AvailableSpaceKind.MaxContent:
      return { mode: MeasureMode.Undefined, value: Number.NaN };
  }
}

function normalizeDimension(value: unknown): number {
  const number = Number(value);
  return Number.isNaN(number) || number < 0 ? 0 : number;
}

export function invokeYogaMeasure(
  args: NativeMeasureArgs<unknown>,
  measure: MeasureFunction,
  forceExactly: Readonly<{ width: boolean; height: boolean }>,
): Size {
  const width = mapConstraint(
    args.knownDimensions.width,
    args.availableSpace.width,
    forceExactly.width,
  );
  const height = mapConstraint(
    args.knownDimensions.height,
    args.availableSpace.height,
    forceExactly.height,
  );
  const result = measure(width.value, width.mode, height.value, height.mode);
  const { width: measuredWidth = Number.NaN, height: measuredHeight = Number.NaN } =
    result as unknown as {
      readonly width?: unknown;
      readonly height?: unknown;
    };
  return {
    width: normalizeDimension(measuredWidth),
    height: normalizeDimension(measuredHeight),
  };
}
