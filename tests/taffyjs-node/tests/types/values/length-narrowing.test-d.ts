import {
  LengthUnit,
  type AutoInput,
  type Dimension,
  type DimensionInput,
  type LengthInput,
  type PercentInput,
} from "@taffyjs/node";

const length: LengthInput = { unit: LengthUnit.Length, value: 1 };
const percent: PercentInput = { unit: LengthUnit.Percent, value: 50 };
const auto: AutoInput = { unit: LengthUnit.Auto };
const inputs: DimensionInput[] = [length, percent, auto];
length.value = 2;
percent.value = 25;

function read(value: DimensionInput): number | undefined {
  switch (value.unit) {
    case LengthUnit.Length:
    case LengthUnit.Percent:
      return value.value;
    case LengthUnit.Auto:
      // @ts-expect-error Auto has no value payload.
      return value.value;
  }
}

declare const output: Dimension;
if (output.unit !== LengthUnit.Auto) {
  const value: number = output.value;
  // @ts-expect-error Output payload is readonly.
  output.value = value;
}

void [inputs, read];
