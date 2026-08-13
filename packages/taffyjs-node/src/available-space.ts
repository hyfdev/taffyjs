import { AvailableSpaceKind } from "./numeric-families.js";
import type { AvailableSpace as AvailableSpaceValue, AvailableSpaceInput } from "./public-types.js";

export type AvailableSpace = AvailableSpaceValue;

const minContent = Object.freeze({ kind: AvailableSpaceKind.MinContent } as const);
const maxContent = Object.freeze({ kind: AvailableSpaceKind.MaxContent } as const);

/** Provides constructors and shared values for readable available-space inputs. */
export const AvailableSpace = Object.freeze({
  Definite(
    value: number,
  ): Extract<AvailableSpaceInput, { kind: typeof AvailableSpaceKind.Definite }> {
    return { kind: AvailableSpaceKind.Definite, value };
  },
  MinContent: minContent,
  MaxContent: maxContent,
});
