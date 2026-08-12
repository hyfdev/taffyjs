import { LengthUnit } from "./generated/numeric-families.js";

const auto = Object.freeze({ unit: LengthUnit.Auto } as const);

export const Dimension = Object.freeze({
  Length(value: number) {
    return { unit: LengthUnit.Length, value };
  },
  Percent(value: number) {
    return { unit: LengthUnit.Percent, value };
  },
  Auto: auto,
});
