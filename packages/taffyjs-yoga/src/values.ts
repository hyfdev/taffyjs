import {
  Dimension as TaffyDimension,
  type DimensionInput,
  type LengthPercentageAutoInput,
  type LengthPercentageInput,
} from "@taffyjs/node";
import { Unit } from "./enums.js";
import type { Value } from "./types.js";

export interface YogaValue {
  readonly unit: Unit;
  readonly value: number;
}

const percentPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?%$/i;

function float32(value: number): number {
  if (!Number.isFinite(value)) return value;
  if (value === 0) return 0;
  return Math.fround(value);
}

function finiteFloat32(value: number): number | undefined {
  const normalized = float32(value);
  return Number.isFinite(normalized) ? normalized : undefined;
}

export function undefinedValue(): YogaValue {
  return { unit: Unit.Undefined, value: Number.NaN };
}

export function autoValue(): YogaValue {
  return { unit: Unit.Auto, value: Number.NaN };
}

function pointValue(value: number): YogaValue {
  return { unit: Unit.Point, value };
}

function percentValue(value: number): YogaValue {
  return { unit: Unit.Percent, value };
}

export function cloneValue(value: YogaValue): YogaValue {
  return { unit: value.unit, value: value.value };
}

export function sameValue(left: YogaValue, right: YogaValue): boolean {
  return left.unit === right.unit && Object.is(left.value, right.value);
}

export function publicValue(value: YogaValue): Value {
  return { value: value.value, unit: value.unit };
}

export function resolvePercentage(basis: number, percentage: number): number {
  return Math.fround(Math.fround(basis * percentage) * Math.fround(0.01));
}

export function normalizeLength(
  value: number | string | undefined,
  name: string,
  allowAuto: boolean,
): YogaValue {
  if (value === undefined) return undefinedValue();
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return undefinedValue();
    const normalized = finiteFloat32(value);
    return normalized === undefined ? undefinedValue() : pointValue(normalized);
  }
  if (typeof value !== "string") {
    throw new TypeError(
      `${name} must be a number, percentage,${allowAuto ? " auto," : ""} or undefined`,
    );
  }
  if (allowAuto && value === "auto") return autoValue();
  if (!percentPattern.test(value)) {
    throw new TypeError(
      `${name} must be a number, percentage,${allowAuto ? " auto," : ""} or undefined`,
    );
  }
  const numeric = Number(value.slice(0, -1));
  if (!Number.isFinite(numeric)) {
    throw new TypeError(`${name} percentage must be finite`);
  }
  const normalized = finiteFloat32(numeric);
  return normalized === undefined ? undefinedValue() : percentValue(normalized);
}

export function normalizePercent(value: number | undefined, name: string): YogaValue {
  if (value === undefined) return undefinedValue();
  if (typeof value !== "number") throw new TypeError(`${name} must be a number or undefined`);
  if (!Number.isFinite(value)) return undefinedValue();
  const normalized = finiteFloat32(value);
  return normalized === undefined ? undefinedValue() : percentValue(normalized);
}

export function normalizePoint(value: number | undefined, name: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number") throw new TypeError(`${name} must be a number or undefined`);
  if (!Number.isFinite(value)) return undefined;
  return finiteFloat32(value);
}

export function normalizeFlexNumber(value: number | undefined, name: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number") throw new TypeError(`${name} must be a number or undefined`);
  if (Number.isNaN(value)) return undefined;
  return float32(value);
}

export function normalizeAspectRatio(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number") throw new TypeError("aspectRatio must be a number or undefined");
  if (!Number.isFinite(value) || value === 0) return undefined;
  const normalized = finiteFloat32(value);
  return normalized === undefined || normalized === 0 ? undefined : normalized;
}

export function toDimension(value: YogaValue): DimensionInput {
  switch (value.unit) {
    case Unit.Point:
      return TaffyDimension.Length(value.value);
    case Unit.Percent:
      return TaffyDimension.Percent(value.value);
    case Unit.Auto:
    case Unit.Undefined:
      return TaffyDimension.Auto;
  }
}

export function toMinDimension(value: YogaValue): DimensionInput {
  return value.unit === Unit.Undefined ? TaffyDimension.Length(0) : toDimension(value);
}

export function toLengthPercentage(value: YogaValue): LengthPercentageInput {
  switch (value.unit) {
    case Unit.Point:
      return TaffyDimension.Length(value.value);
    case Unit.Percent:
      return TaffyDimension.Percent(value.value);
    case Unit.Auto:
    case Unit.Undefined:
      return 0;
  }
}

export function toLengthPercentageAuto(value: YogaValue): LengthPercentageAutoInput {
  return value.unit === Unit.Undefined ? 0 : toDimension(value);
}
