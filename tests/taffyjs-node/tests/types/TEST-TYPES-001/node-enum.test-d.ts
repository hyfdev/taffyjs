import {
  AlignContent,
  AlignItems,
  AvailableSpaceKind,
  BoxSizing,
  Clear,
  DetailedLayoutInfoKind,
  Direction,
  Display,
  FlexDirection,
  FlexWrap,
  Float,
  GridAutoFlow,
  GridPlacementKind,
  GridTemplateComponentKind,
  LengthUnit,
  Overflow,
  Position,
  RepetitionCountKind,
  TextAlign,
  TrackSizingKind,
  type AvailableSpaceInput,
  type DetailedLayoutInfo,
  type DimensionInput,
  type Display as DisplayValue,
  type EnumValue,
  type GridPlacementInput,
  type NodeId,
} from "@taffyjs/node";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? true
    : false;
type Assert<Value extends true> = Value;
type DisplayMatchesMembers = Assert<Equal<EnumValue<typeof Display>, DisplayValue>>;

const literalMembers: readonly number[] = [
  Display.Block,
  BoxSizing.BorderBox,
  Direction.Ltr,
  Overflow.Visible,
  Float.Left,
  Clear.Left,
  Position.Relative,
  TextAlign.Auto,
  FlexDirection.Row,
  FlexWrap.NoWrap,
  GridAutoFlow.Row,
  AlignItems.Start,
  AlignContent.Start,
  LengthUnit.Length,
  AvailableSpaceKind.Definite,
  GridPlacementKind.Auto,
  TrackSizingKind.Length,
  RepetitionCountKind.Count,
  GridTemplateComponentKind.Single,
  DetailedLayoutInfoKind.None,
];
const blockLiteral: 0 = Display.Block;
const noneLiteral: 4 = Display.None;
const display: DisplayValue = Display.Grid;

declare const node: NodeId;
const primitive: bigint = node;
const nodeMap = new Map<NodeId, string>([[node, "node"]]);
// @ts-expect-error Plain bigint values cannot be forged into NodeId.
const forged: NodeId = 1n;
// @ts-expect-error bigint arithmetic removes the NodeId marker.
const changed: NodeId = node + 1n;
// @ts-expect-error Display accepts only its five literal members.
const invalidDisplay: DisplayValue = 5;

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

declare const placement: GridPlacementInput;
if (placement.kind === GridPlacementKind.NamedLine) {
  const name: string = placement.name;
  const index: number = placement.index;
  void [name, index];
}

declare const detail: DetailedLayoutInfo;
if (detail.kind === DetailedLayoutInfoKind.Grid) {
  const rows: number = detail.value.rows.explicitTracks;
  void rows;
} else {
  // @ts-expect-error None has no Grid payload.
  void detail.value;
}

void [
  literalMembers,
  blockLiteral,
  noneLiteral,
  display,
  primitive,
  nodeMap,
  forged,
  changed,
  invalidDisplay,
];
void (0 as unknown as DisplayMatchesMembers);
