import { LengthUnit } from "./numeric-families.js";
import type { Dimension as DimensionValue, LengthInput, PercentInput } from "./public-types.js";

export type Dimension = DimensionValue;

const auto = Object.freeze({ unit: LengthUnit.Auto } as const);

/** Provides constructors and a shared Auto value for readable dimension inputs. */
export const Dimension = Object.freeze({
  Length(value: number): LengthInput {
    return { unit: LengthUnit.Length, value };
  },
  Percent(value: number): PercentInput {
    return { unit: LengthUnit.Percent, value };
  },
  Auto: auto,
});
