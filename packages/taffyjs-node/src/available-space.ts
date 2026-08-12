import { AvailableSpaceKind } from "./generated/numeric-families.js";

const minContent = Object.freeze({ kind: AvailableSpaceKind.MinContent } as const);
const maxContent = Object.freeze({ kind: AvailableSpaceKind.MaxContent } as const);

export const AvailableSpace = Object.freeze({
  Definite(value: number) {
    return { kind: AvailableSpaceKind.Definite, value };
  },
  MinContent: minContent,
  MaxContent: maxContent,
});
