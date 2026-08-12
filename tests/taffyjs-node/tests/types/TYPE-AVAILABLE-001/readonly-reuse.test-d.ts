import {
  AvailableSpace,
  AvailableSpaceKind,
  type AvailableSpace as AvailableSpaceValue,
  type AvailableSpaceInput,
} from "@taffyjs/node";

declare const output: AvailableSpaceValue;
const reused: AvailableSpaceInput = output;

if (output.kind === AvailableSpaceKind.Definite) {
  const value: number = output.value;
  // @ts-expect-error Output payload is readonly.
  output.value = value;
}

const input = AvailableSpace.Definite(10);
input.value = 20;
void reused;
