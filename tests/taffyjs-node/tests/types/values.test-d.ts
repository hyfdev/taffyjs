import {
  AvailableSpace,
  AvailableSpaceKind,
  DetailedLayoutInfoKind,
  Dimension,
  Display,
  LengthUnit,
  TrackSizingFunction,
  TrackSizingKind,
  type AvailableSpace as AvailableSpaceValue,
  type AvailableSpaceInput,
  type DetailedLayoutInfo,
  type Dimension as DimensionValue,
  type DimensionInput,
  type EnumValue,
  type GridPlacementInput,
  type Layout,
  type LengthPercentage,
  type LengthPercentageAuto,
  type LengthPercentageAutoInput,
  type LengthPercentageInput,
  type Point,
  type PointInput,
  type TrackSizingFunctionInput,
} from "@taffyjs/node";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? true
    : false;
type Expect<Value extends true> = Value;
type DisplayMembers = Expect<Equal<EnumValue<typeof Display>, 0 | 1 | 2 | 3 | 4>>;

const block: 0 = Display.Block;
const fractionalTrack: 6 = TrackSizingKind.Fr;
const mutableSpace = AvailableSpace.Definite(10);
const mutableLength = Dimension.Length(10);
mutableSpace.value = 20;
mutableLength.value = 20;
const shorthandLengthPercentage: LengthPercentageInput = 10;
const shorthandLengthPercentageAuto: LengthPercentageAutoInput = 10;
const shorthandDimension: DimensionInput = 10;
const shorthandAvailableSpace: AvailableSpaceInput = 10;
const shorthandFitContent = TrackSizingFunction.FitContent(10);

// @ts-expect-error LengthPercentage output is always a complete tagged value.
const numericLengthPercentageOutput: LengthPercentage = 10;
// @ts-expect-error LengthPercentageAuto output is always a complete tagged value.
const numericLengthPercentageAutoOutput: LengthPercentageAuto = 10;
// @ts-expect-error Dimension output is always a complete tagged value.
const numericDimensionOutput: DimensionValue = 10;
// @ts-expect-error AvailableSpace output is always a complete tagged value.
const numericAvailableSpaceOutput: AvailableSpaceValue = 10;
// @ts-expect-error The outer track sizing value remains a tagged object.
const numericTrackSizing: TrackSizingFunctionInput = 10;
// @ts-expect-error Grid placement does not gain a numeric shorthand.
const numericGridPlacement: GridPlacementInput = 10;

declare const available: AvailableSpaceInput;
if (typeof available !== "number") {
  if (available.kind === AvailableSpaceKind.Definite) {
    const value: number = available.value;
    void value;
  } else {
    // @ts-expect-error Content-sized variants have no value payload.
    void available.value;
  }
}

declare const dimension: DimensionInput;
if (typeof dimension !== "number") {
  switch (dimension.unit) {
    case LengthUnit.Length:
    case LengthUnit.Percent:
    case LengthUnit.FitContentLength:
    case LengthUnit.FitContentPercent: {
      const value: number = dimension.value;
      void value;
      break;
    }
    default:
      // @ts-expect-error Fieldless Dimension variants have no value payload.
      void dimension.value;
  }
}

declare const detail: DetailedLayoutInfo;
if (detail.kind === DetailedLayoutInfoKind.Grid) {
  const rows: number = detail.value.rows.explicitTracks;
  const emptyAxisLine: number | null = detail.value.rows.emptyAxisLine;
  // @ts-expect-error Detailed output arrays are readonly.
  detail.value.rows.positions.push({ start: 0, end: 1 });
  void rows;
  void emptyAxisLine;
} else {
  // @ts-expect-error None has no Grid payload.
  void detail.value;
}

declare const layout: Layout;
declare const point: Point<number>;
const pointInput: PointInput<number> = { x: 1, y: 2 };
pointInput.x = 3;
// @ts-expect-error Layout fields are readonly.
layout.order = 1;
// @ts-expect-error Nested Layout fields are readonly.
layout.margin.left = 1;
// @ts-expect-error Geometry output is readonly.
point.x = 1;
// @ts-expect-error Complete Point input requires y.
const incompletePoint: PointInput<number> = { x: 1 };

void [
  block,
  fractionalTrack,
  incompletePoint,
  shorthandLengthPercentage,
  shorthandLengthPercentageAuto,
  shorthandDimension,
  shorthandAvailableSpace,
  shorthandFitContent,
  numericLengthPercentageOutput,
  numericLengthPercentageAutoOutput,
  numericDimensionOutput,
  numericAvailableSpaceOutput,
  numericTrackSizing,
  numericGridPlacement,
];
void (0 as unknown as DisplayMembers);
