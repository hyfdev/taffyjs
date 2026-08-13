import { AvailableSpaceKind, type AvailableSpaceInput } from "@taffyjs/node";

function read(value: AvailableSpaceInput): number | undefined {
  switch (value.kind) {
    case AvailableSpaceKind.Definite:
      return value.value;
    case AvailableSpaceKind.MinContent:
    case AvailableSpaceKind.MaxContent:
      // @ts-expect-error Content-sized variants have no value payload.
      return value.value;
  }
}

void read;
