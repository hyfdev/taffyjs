import {
  AvailableSpace,
  AvailableSpaceKind,
  DetailedLayoutInfoKind,
  Dimension,
  Display,
  LengthUnit,
  TrackSizingKind,
  type AvailableSpaceInput,
  type DetailedLayoutInfo,
  type DimensionInput,
  type EnumValue,
  type Layout,
  type Point,
  type PointInput,
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

declare const available: AvailableSpaceInput;
if (available.kind === AvailableSpaceKind.Definite) {
  const value: number = available.value;
  void value;
} else {
  // @ts-expect-error Content-sized variants have no value payload.
  void available.value;
}

declare const dimension: DimensionInput;
if (dimension.unit !== LengthUnit.Auto) {
  const value: number = dimension.value;
  void value;
} else {
  // @ts-expect-error Auto has no value payload.
  void dimension.value;
}

declare const detail: DetailedLayoutInfo;
if (detail.kind === DetailedLayoutInfoKind.Grid) {
  const rows: number = detail.value.rows.explicitTracks;
  // @ts-expect-error Detailed output arrays are readonly.
  detail.value.rows.sizes.push(1);
  void rows;
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

void [block, fractionalTrack, incompletePoint];
void (0 as unknown as DisplayMembers);
