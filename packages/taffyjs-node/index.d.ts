import "#native";
//#region src/numeric-families.d.ts
/** Numeric constants shared by public JavaScript values and the native conversion layer. */
type EnumValue<Family extends Readonly<Record<string, number>>> = Family[keyof Family];
/** Lists the supported display choices as stable numeric constants. */
declare const Display: Readonly<{
  /** Selects the Block choice from the Display numeric family. */
  readonly Block: 0;
  /** Selects the FlowRoot choice from the Display numeric family. */
  readonly FlowRoot: 1;
  /** Selects the Flex choice from the Display numeric family. */
  readonly Flex: 2;
  /** Selects the Grid choice from the Display numeric family. */
  readonly Grid: 3;
  /** Selects the None choice from the Display numeric family. */
  readonly None: 4;
}>;
type Display = EnumValue<typeof Display>;
/** Lists the supported box sizing choices as stable numeric constants. */
declare const BoxSizing: Readonly<{
  /** Selects the BorderBox choice from the BoxSizing numeric family. */
  readonly BorderBox: 0;
  /** Selects the ContentBox choice from the BoxSizing numeric family. */
  readonly ContentBox: 1;
}>;
type BoxSizing = EnumValue<typeof BoxSizing>;
/** Lists the supported direction choices as stable numeric constants. */
declare const Direction: Readonly<{
  /** Selects the Ltr choice from the Direction numeric family. */
  readonly Ltr: 0;
  /** Selects the Rtl choice from the Direction numeric family. */
  readonly Rtl: 1;
}>;
type Direction = EnumValue<typeof Direction>;
/** Lists the supported overflow choices as stable numeric constants. */
declare const Overflow: Readonly<{
  /** Selects the Visible choice from the Overflow numeric family. */
  readonly Visible: 0;
  /** Selects the Clip choice from the Overflow numeric family. */
  readonly Clip: 1;
  /** Selects the Hidden choice from the Overflow numeric family. */
  readonly Hidden: 2;
  /** Selects the Scroll choice from the Overflow numeric family. */
  readonly Scroll: 3;
}>;
type Overflow = EnumValue<typeof Overflow>;
/** Lists the supported float choices as stable numeric constants. */
declare const Float: Readonly<{
  /** Selects the Left choice from the Float numeric family. */
  readonly Left: 0;
  /** Selects the Right choice from the Float numeric family. */
  readonly Right: 1;
  /** Selects the None choice from the Float numeric family. */
  readonly None: 2;
}>;
type Float = EnumValue<typeof Float>;
/** Lists the supported clear choices as stable numeric constants. */
declare const Clear: Readonly<{
  /** Selects the Left choice from the Clear numeric family. */
  readonly Left: 0;
  /** Selects the Right choice from the Clear numeric family. */
  readonly Right: 1;
  /** Selects the Both choice from the Clear numeric family. */
  readonly Both: 2;
  /** Selects the None choice from the Clear numeric family. */
  readonly None: 3;
}>;
type Clear = EnumValue<typeof Clear>;
/** Lists the supported position choices as stable numeric constants. */
declare const Position: Readonly<{
  /** Selects the Relative choice from the Position numeric family. */
  readonly Relative: 0;
  /** Selects the Absolute choice from the Position numeric family. */
  readonly Absolute: 1;
}>;
type Position = EnumValue<typeof Position>;
/** Lists the supported text align choices as stable numeric constants. */
declare const TextAlign: Readonly<{
  /** Selects the Auto choice from the TextAlign numeric family. */
  readonly Auto: 0;
  /** Selects the LegacyLeft choice from the TextAlign numeric family. */
  readonly LegacyLeft: 1;
  /** Selects the LegacyRight choice from the TextAlign numeric family. */
  readonly LegacyRight: 2;
  /** Selects the LegacyCenter choice from the TextAlign numeric family. */
  readonly LegacyCenter: 3;
}>;
type TextAlign = EnumValue<typeof TextAlign>;
/** Lists the supported flex direction choices as stable numeric constants. */
declare const FlexDirection: Readonly<{
  /** Selects the Row choice from the FlexDirection numeric family. */
  readonly Row: 0;
  /** Selects the Column choice from the FlexDirection numeric family. */
  readonly Column: 1;
  /** Selects the RowReverse choice from the FlexDirection numeric family. */
  readonly RowReverse: 2;
  /** Selects the ColumnReverse choice from the FlexDirection numeric family. */
  readonly ColumnReverse: 3;
}>;
type FlexDirection = EnumValue<typeof FlexDirection>;
/** Lists the supported flex wrap choices as stable numeric constants. */
declare const FlexWrap: Readonly<{
  /** Selects the NoWrap choice from the FlexWrap numeric family. */
  readonly NoWrap: 0;
  /** Selects the Wrap choice from the FlexWrap numeric family. */
  readonly Wrap: 1;
  /** Selects the WrapReverse choice from the FlexWrap numeric family. */
  readonly WrapReverse: 2;
}>;
type FlexWrap = EnumValue<typeof FlexWrap>;
/** Lists the supported grid auto flow choices as stable numeric constants. */
declare const GridAutoFlow: Readonly<{
  /** Selects the Row choice from the GridAutoFlow numeric family. */
  readonly Row: 0;
  /** Selects the Column choice from the GridAutoFlow numeric family. */
  readonly Column: 1;
  /** Selects the RowDense choice from the GridAutoFlow numeric family. */
  readonly RowDense: 2;
  /** Selects the ColumnDense choice from the GridAutoFlow numeric family. */
  readonly ColumnDense: 3;
}>;
type GridAutoFlow = EnumValue<typeof GridAutoFlow>;
/** Lists the supported align items choices as stable numeric constants. */
declare const AlignItems: Readonly<{
  /** Selects the Start choice from the AlignItems numeric family. */
  readonly Start: 0;
  /** Selects the End choice from the AlignItems numeric family. */
  readonly End: 1;
  /** Selects the FlexStart choice from the AlignItems numeric family. */
  readonly FlexStart: 2;
  /** Selects the FlexEnd choice from the AlignItems numeric family. */
  readonly FlexEnd: 3;
  /** Selects the SelfStart choice from the AlignItems numeric family. */
  readonly SelfStart: 4;
  /** Selects the SelfEnd choice from the AlignItems numeric family. */
  readonly SelfEnd: 5;
  /** Selects the Center choice from the AlignItems numeric family. */
  readonly Center: 6;
  /** Selects the Baseline choice from the AlignItems numeric family. */
  readonly Baseline: 7;
  /** Selects the Stretch choice from the AlignItems numeric family. */
  readonly Stretch: 8;
  /** Selects the SafeStart choice from the AlignItems numeric family. */
  readonly SafeStart: 9;
  /** Selects the SafeEnd choice from the AlignItems numeric family. */
  readonly SafeEnd: 10;
  /** Selects the SafeFlexStart choice from the AlignItems numeric family. */
  readonly SafeFlexStart: 11;
  /** Selects the SafeFlexEnd choice from the AlignItems numeric family. */
  readonly SafeFlexEnd: 12;
  /** Selects the SafeSelfStart choice from the AlignItems numeric family. */
  readonly SafeSelfStart: 13;
  /** Selects the SafeSelfEnd choice from the AlignItems numeric family. */
  readonly SafeSelfEnd: 14;
  /** Selects the SafeCenter choice from the AlignItems numeric family. */
  readonly SafeCenter: 15;
}>;
type AlignItems = EnumValue<typeof AlignItems>;
/** Lists the supported align content choices as stable numeric constants. */
declare const AlignContent: Readonly<{
  /** Selects the Start choice from the AlignContent numeric family. */
  readonly Start: 0;
  /** Selects the End choice from the AlignContent numeric family. */
  readonly End: 1;
  /** Selects the FlexStart choice from the AlignContent numeric family. */
  readonly FlexStart: 2;
  /** Selects the FlexEnd choice from the AlignContent numeric family. */
  readonly FlexEnd: 3;
  /** Selects the Center choice from the AlignContent numeric family. */
  readonly Center: 4;
  /** Selects the Stretch choice from the AlignContent numeric family. */
  readonly Stretch: 5;
  /** Selects the SpaceBetween choice from the AlignContent numeric family. */
  readonly SpaceBetween: 6;
  /** Selects the SpaceEvenly choice from the AlignContent numeric family. */
  readonly SpaceEvenly: 7;
  /** Selects the SpaceAround choice from the AlignContent numeric family. */
  readonly SpaceAround: 8;
  /** Selects the SafeStart choice from the AlignContent numeric family. */
  readonly SafeStart: 9;
  /** Selects the SafeEnd choice from the AlignContent numeric family. */
  readonly SafeEnd: 10;
  /** Selects the SafeFlexStart choice from the AlignContent numeric family. */
  readonly SafeFlexStart: 11;
  /** Selects the SafeFlexEnd choice from the AlignContent numeric family. */
  readonly SafeFlexEnd: 12;
  /** Selects the SafeCenter choice from the AlignContent numeric family. */
  readonly SafeCenter: 13;
}>;
type AlignContent = EnumValue<typeof AlignContent>;
/** Lists the supported length unit choices as stable numeric constants. */
declare const LengthUnit: Readonly<{
  /** Selects the Length choice from the LengthUnit numeric family. */
  readonly Length: 0;
  /** Selects the Percent choice from the LengthUnit numeric family. */
  readonly Percent: 1;
  /** Selects the Auto choice from the LengthUnit numeric family. */
  readonly Auto: 2;
}>;
type LengthUnit = EnumValue<typeof LengthUnit>;
/** Lists the supported available space kind choices as stable numeric constants. */
declare const AvailableSpaceKind: Readonly<{
  /** Selects the Definite choice from the AvailableSpaceKind numeric family. */
  readonly Definite: 0;
  /** Selects the MinContent choice from the AvailableSpaceKind numeric family. */
  readonly MinContent: 1;
  /** Selects the MaxContent choice from the AvailableSpaceKind numeric family. */
  readonly MaxContent: 2;
}>;
type AvailableSpaceKind = EnumValue<typeof AvailableSpaceKind>;
/** Lists the supported grid placement kind choices as stable numeric constants. */
declare const GridPlacementKind: Readonly<{
  /** Selects the Auto choice from the GridPlacementKind numeric family. */
  readonly Auto: 0;
  /** Selects the Line choice from the GridPlacementKind numeric family. */
  readonly Line: 1;
  /** Selects the NamedLine choice from the GridPlacementKind numeric family. */
  readonly NamedLine: 2;
  /** Selects the Span choice from the GridPlacementKind numeric family. */
  readonly Span: 3;
  /** Selects the NamedSpan choice from the GridPlacementKind numeric family. */
  readonly NamedSpan: 4;
}>;
type GridPlacementKind = EnumValue<typeof GridPlacementKind>;
/** Lists the supported track sizing kind choices as stable numeric constants. */
declare const TrackSizingKind: Readonly<{
  /** Selects the Length choice from the TrackSizingKind numeric family. */
  readonly Length: 0;
  /** Selects the Percent choice from the TrackSizingKind numeric family. */
  readonly Percent: 1;
  /** Selects the Auto choice from the TrackSizingKind numeric family. */
  readonly Auto: 2;
  /** Selects the MinContent choice from the TrackSizingKind numeric family. */
  readonly MinContent: 3;
  /** Selects the MaxContent choice from the TrackSizingKind numeric family. */
  readonly MaxContent: 4;
  /** Selects the FitContent choice from the TrackSizingKind numeric family. */
  readonly FitContent: 5;
  /** Selects the Fr choice from the TrackSizingKind numeric family. */
  readonly Fr: 6;
}>;
type TrackSizingKind = EnumValue<typeof TrackSizingKind>;
/** Lists the supported repetition count kind choices as stable numeric constants. */
declare const RepetitionCountKind: Readonly<{
  /** Selects the Count choice from the RepetitionCountKind numeric family. */
  readonly Count: 0;
  /** Selects the AutoFill choice from the RepetitionCountKind numeric family. */
  readonly AutoFill: 1;
  /** Selects the AutoFit choice from the RepetitionCountKind numeric family. */
  readonly AutoFit: 2;
}>;
type RepetitionCountKind = EnumValue<typeof RepetitionCountKind>;
/** Lists the supported grid template component kind choices as stable numeric constants. */
declare const GridTemplateComponentKind: Readonly<{
  /** Selects the Single choice from the GridTemplateComponentKind numeric family. */
  readonly Single: 0;
  /** Selects the Repeat choice from the GridTemplateComponentKind numeric family. */
  readonly Repeat: 1;
}>;
type GridTemplateComponentKind = EnumValue<typeof GridTemplateComponentKind>;
/** Lists the supported detailed layout info kind choices as stable numeric constants. */
declare const DetailedLayoutInfoKind: Readonly<{
  /** Selects the None choice from the DetailedLayoutInfoKind numeric family. */
  readonly None: 0;
  /** Selects the Grid choice from the DetailedLayoutInfoKind numeric family. */
  readonly Grid: 1;
}>;
type DetailedLayoutInfoKind = EnumValue<typeof DetailedLayoutInfoKind>;
//#endregion
//#region src/node-id.d.ts
declare const phantomMarker: unique symbol;
/** Identifies a node in one TaffyTree without exposing its native identity. */
type NodeId = bigint & {
  readonly [phantomMarker]: never;
};
//#endregion
//#region src/public-types.d.ts
/** Supplies writable point data at the public API boundary. */
interface PointInput<T> {
  /** Supplies the x value used by PointInput. */ x: T;
  /** Supplies the y value used by PointInput. */ y: T;
}
/** Supplies writable partial point data at the public API boundary. */
interface PartialPointInput<T> {
  /** Supplies the x value used by PartialPointInput. */ x?: T | undefined;
  /** Supplies the y value used by PartialPointInput. */ y?: T | undefined;
}
/** Represents the public point value used by TaffyJS. */
interface Point<T> {
  /** Stores the x component of this Point value. */ readonly x: T;
  /** Stores the y component of this Point value. */ readonly y: T;
}
/** Supplies writable size data at the public API boundary. */
interface SizeInput<T> {
  /** Supplies the width value used by SizeInput. */ width: T;
  /** Supplies the height value used by SizeInput. */ height: T;
}
/** Supplies writable partial size data at the public API boundary. */
interface PartialSizeInput<T> {
  /** Supplies the width value used by PartialSizeInput. */ width?: T | undefined;
  /** Supplies the height value used by PartialSizeInput. */ height?: T | undefined;
}
/** Represents the public size value used by TaffyJS. */
interface Size<T> {
  /** Stores the width component of this Size value. */ readonly width: T;
  /** Stores the height component of this Size value. */ readonly height: T;
}
/** Supplies writable rect data at the public API boundary. */
interface RectInput<T> {
  /** Supplies the left value used by RectInput. */ left: T;
  /** Supplies the right value used by RectInput. */ right: T;
  /** Supplies the top value used by RectInput. */ top: T;
  /** Supplies the bottom value used by RectInput. */ bottom: T;
}
/** Supplies writable partial rect data at the public API boundary. */
interface PartialRectInput<T> {
  /** Supplies the left value used by PartialRectInput. */ left?: T | undefined;
  /** Supplies the right value used by PartialRectInput. */ right?: T | undefined;
  /** Supplies the top value used by PartialRectInput. */ top?: T | undefined;
  /** Supplies the bottom value used by PartialRectInput. */ bottom?: T | undefined;
}
/** Represents the public rect value used by TaffyJS. */
interface Rect<T> {
  /** Stores the left component of this Rect value. */ readonly left: T;
  /** Stores the right component of this Rect value. */ readonly right: T;
  /** Stores the top component of this Rect value. */ readonly top: T;
  /** Stores the bottom component of this Rect value. */ readonly bottom: T;
}
/** Supplies writable line data at the public API boundary. */
interface LineInput<T> {
  /** Supplies the start value used by LineInput. */ start: T;
  /** Supplies the end value used by LineInput. */ end: T;
}
/** Supplies writable partial line data at the public API boundary. */
interface PartialLineInput<T> {
  /** Supplies the start value used by PartialLineInput. */ start?: T | undefined;
  /** Supplies the end value used by PartialLineInput. */ end?: T | undefined;
}
/** Represents the public line value used by TaffyJS. */
interface Line<T> {
  /** Stores the start component of this Line value. */ readonly start: T;
  /** Stores the end component of this Line value. */ readonly end: T;
}
/** Supplies writable length data at the public API boundary. */
type LengthInput = {
  /** Supplies the unit value used by LengthInput. */ unit: typeof LengthUnit.Length;
  /** Carries the payload for this LengthInput tagged variant. */ value: number;
};
/** Supplies writable percent data at the public API boundary. */
type PercentInput = {
  /** Supplies the unit value used by PercentInput. */ unit: typeof LengthUnit.Percent;
  /** Carries the payload for this PercentInput tagged variant. */ value: number;
};
/** Supplies writable auto data at the public API boundary. */
type AutoInput = {
  /** Supplies the unit value used by AutoInput. */ unit: typeof LengthUnit.Auto;
};
/** Supplies writable length percentage data at the public API boundary. */
type LengthPercentageInput = LengthInput | PercentInput;
/** Supplies writable length percentage auto data at the public API boundary. */
type LengthPercentageAutoInput = LengthInput | PercentInput | AutoInput;
/** Supplies writable dimension data at the public API boundary. */
type DimensionInput = LengthPercentageAutoInput;
/** Represents the public length percentage value used by TaffyJS. */
type LengthPercentage = Readonly<LengthInput> | Readonly<PercentInput>;
/** Represents the public length percentage auto value used by TaffyJS. */
type LengthPercentageAuto = Readonly<LengthInput> | Readonly<PercentInput> | Readonly<AutoInput>;
/** Represents the public dimension value used by TaffyJS. */
type Dimension$1 = LengthPercentageAuto;
/** Supplies writable available space data at the public API boundary. */
type AvailableSpaceInput = {
  /** Identifies which AvailableSpaceInput tagged variant this value contains. */ kind: typeof AvailableSpaceKind.Definite;
  /** Carries the payload for this AvailableSpaceInput tagged variant. */ value: number;
} | {
  /** Identifies which AvailableSpaceInput tagged variant this value contains. */ kind: typeof AvailableSpaceKind.MinContent;
} | {
  /** Identifies which AvailableSpaceInput tagged variant this value contains. */ kind: typeof AvailableSpaceKind.MaxContent;
};
/** Represents the public available space value used by TaffyJS. */
type AvailableSpace$1 = Readonly<{
  /** Identifies which AvailableSpace tagged variant this value contains. */ kind: typeof AvailableSpaceKind.Definite;
  /** Carries the payload for this AvailableSpace tagged variant. */ value: number;
}> | Readonly<{
  /** Identifies which AvailableSpace tagged variant this value contains. */ kind: typeof AvailableSpaceKind.MinContent;
}> | Readonly<{
  /** Identifies which AvailableSpace tagged variant this value contains. */ kind: typeof AvailableSpaceKind.MaxContent;
}>;
/** Supplies writable grid placement data at the public API boundary. */
type GridPlacementInput = {
  /** Identifies which GridPlacementInput tagged variant this value contains. */ kind: typeof GridPlacementKind.Auto;
} | {
  /** Identifies which GridPlacementInput tagged variant this value contains. */ kind: typeof GridPlacementKind.Line;
  /** Supplies the index value used by GridPlacementInput. */ index: number;
} | {
  /** Identifies which GridPlacementInput tagged variant this value contains. */ kind: typeof GridPlacementKind.NamedLine;
  /** Supplies the name value used by GridPlacementInput. */ name: string;
  /** Supplies the index value used by GridPlacementInput. */ index: number;
} | {
  /** Identifies which GridPlacementInput tagged variant this value contains. */ kind: typeof GridPlacementKind.Span;
  /** Supplies the span value used by GridPlacementInput. */ span: number;
} | {
  /** Identifies which GridPlacementInput tagged variant this value contains. */ kind: typeof GridPlacementKind.NamedSpan;
  /** Supplies the name value used by GridPlacementInput. */ name: string;
  /** Supplies the span value used by GridPlacementInput. */ span: number;
};
/** Represents the public grid placement value used by TaffyJS. */
type GridPlacement$1 = Readonly<{
  /** Identifies which GridPlacement tagged variant this value contains. */ kind: typeof GridPlacementKind.Auto;
}> | Readonly<{
  /** Identifies which GridPlacement tagged variant this value contains. */ kind: typeof GridPlacementKind.Line;
  /** Reports the index component of this GridPlacement value. */ index: number;
}> | Readonly<{
  /** Identifies which GridPlacement tagged variant this value contains. */ kind: typeof GridPlacementKind.NamedLine;
  /** Reports the name component of this GridPlacement value. */ name: string;
  /** Reports the index component of this GridPlacement value. */ index: number;
}> | Readonly<{
  /** Identifies which GridPlacement tagged variant this value contains. */ kind: typeof GridPlacementKind.Span;
  /** Reports the span component of this GridPlacement value. */ span: number;
}> | Readonly<{
  /** Identifies which GridPlacement tagged variant this value contains. */ kind: typeof GridPlacementKind.NamedSpan;
  /** Reports the name component of this GridPlacement value. */ name: string;
  /** Reports the span component of this GridPlacement value. */ span: number;
}>;
/** Supplies writable min track sizing function data at the public API boundary. */
type MinTrackSizingFunctionInput = {
  /** Identifies which MinTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.Length;
  /** Carries the payload for this MinTrackSizingFunctionInput tagged variant. */ value: number;
} | {
  /** Identifies which MinTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.Percent;
  /** Carries the payload for this MinTrackSizingFunctionInput tagged variant. */ value: number;
} | {
  /** Identifies which MinTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.Auto;
} | {
  /** Identifies which MinTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.MinContent;
} | {
  /** Identifies which MinTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.MaxContent;
};
/** Represents the public min track sizing function value used by TaffyJS. */
type MinTrackSizingFunction = Readonly<{
  /** Identifies which MinTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.Length;
  /** Carries the payload for this MinTrackSizingFunction tagged variant. */ value: number;
}> | Readonly<{
  /** Identifies which MinTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.Percent;
  /** Carries the payload for this MinTrackSizingFunction tagged variant. */ value: number;
}> | Readonly<{
  /** Identifies which MinTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.Auto;
}> | Readonly<{
  /** Identifies which MinTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.MinContent;
}> | Readonly<{
  /** Identifies which MinTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.MaxContent;
}>;
/** Supplies writable max track sizing function data at the public API boundary. */
type MaxTrackSizingFunctionInput = MinTrackSizingFunctionInput | {
  /** Identifies which MaxTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.FitContent;
  /** Carries the payload for this MaxTrackSizingFunctionInput tagged variant. */ value: LengthPercentageInput;
} | {
  /** Identifies which MaxTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.Fr;
  /** Carries the payload for this MaxTrackSizingFunctionInput tagged variant. */ value: number;
};
/** Represents the public max track sizing function value used by TaffyJS. */
type MaxTrackSizingFunction = MinTrackSizingFunction | Readonly<{
  /** Identifies which MaxTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.FitContent;
  /** Carries the payload for this MaxTrackSizingFunction tagged variant. */ value: LengthPercentage;
}> | Readonly<{
  /** Identifies which MaxTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.Fr;
  /** Carries the payload for this MaxTrackSizingFunction tagged variant. */ value: number;
}>;
/** Supplies writable track sizing function data at the public API boundary. */
interface TrackSizingFunctionInput {
  /** Supplies the min value used by TrackSizingFunctionInput. */ min: MinTrackSizingFunctionInput;
  /** Supplies the max value used by TrackSizingFunctionInput. */ max: MaxTrackSizingFunctionInput;
}
/** Represents the public track sizing function value used by TaffyJS. */
interface TrackSizingFunction$1 {
  /** Reports the min component of this TrackSizingFunction value. */ readonly min: MinTrackSizingFunction;
  /** Reports the max component of this TrackSizingFunction value. */ readonly max: MaxTrackSizingFunction;
}
/** Supplies writable repetition count data at the public API boundary. */
type RepetitionCountInput = {
  /** Identifies which RepetitionCountInput tagged variant this value contains. */ kind: typeof RepetitionCountKind.Count;
  /** Carries the payload for this RepetitionCountInput tagged variant. */ value: number;
} | {
  /** Identifies which RepetitionCountInput tagged variant this value contains. */ kind: typeof RepetitionCountKind.AutoFill;
} | {
  /** Identifies which RepetitionCountInput tagged variant this value contains. */ kind: typeof RepetitionCountKind.AutoFit;
};
/** Represents the public repetition count value used by TaffyJS. */
type RepetitionCount$1 = Readonly<{
  /** Identifies which RepetitionCount tagged variant this value contains. */ kind: typeof RepetitionCountKind.Count;
  /** Carries the payload for this RepetitionCount tagged variant. */ value: number;
}> | Readonly<{
  /** Identifies which RepetitionCount tagged variant this value contains. */ kind: typeof RepetitionCountKind.AutoFill;
}> | Readonly<{
  /** Identifies which RepetitionCount tagged variant this value contains. */ kind: typeof RepetitionCountKind.AutoFit;
}>;
/** Supplies writable grid template repetition data at the public API boundary. */
interface GridTemplateRepetitionInput {
  /** Supplies the count value used by GridTemplateRepetitionInput. */ count: RepetitionCountInput;
  /** Supplies the tracks value used by GridTemplateRepetitionInput. */ tracks: TrackSizingFunctionInput[];
  /** Supplies the line names value used by GridTemplateRepetitionInput. */ lineNames: string[][];
}
/** Represents the public grid template repetition value used by TaffyJS. */
interface GridTemplateRepetition {
  /** Stores the count component of this GridTemplateRepetition value. */ readonly count: RepetitionCount$1;
  /** Stores the tracks component of this GridTemplateRepetition value. */ readonly tracks: readonly TrackSizingFunction$1[];
  /** Stores the line names component of this GridTemplateRepetition value. */ readonly lineNames: readonly (readonly string[])[];
}
/** Supplies writable grid template component data at the public API boundary. */
type GridTemplateComponentInput = {
  /** Identifies which GridTemplateComponentInput tagged variant this value contains. */ kind: typeof GridTemplateComponentKind.Single;
  /** Carries the payload for this GridTemplateComponentInput tagged variant. */ value: TrackSizingFunctionInput;
} | {
  /** Identifies which GridTemplateComponentInput tagged variant this value contains. */ kind: typeof GridTemplateComponentKind.Repeat;
  /** Carries the payload for this GridTemplateComponentInput tagged variant. */ value: GridTemplateRepetitionInput;
};
/** Represents the public grid template component value used by TaffyJS. */
type GridTemplateComponent$1 = Readonly<{
  /** Identifies which GridTemplateComponent tagged variant this value contains. */ kind: typeof GridTemplateComponentKind.Single;
  /** Carries the payload for this GridTemplateComponent tagged variant. */ value: TrackSizingFunction$1;
}> | Readonly<{
  /** Identifies which GridTemplateComponent tagged variant this value contains. */ kind: typeof GridTemplateComponentKind.Repeat;
  /** Carries the payload for this GridTemplateComponent tagged variant. */ value: GridTemplateRepetition;
}>;
/** Supplies writable grid template areas data at the public API boundary. */
interface GridTemplateAreasInput {
  /** Supplies the areas value used by GridTemplateAreasInput. */ areas: GridTemplateAreaInput[];
  /** Supplies the row count value used by GridTemplateAreasInput. */ rowCount: number;
  /** Supplies the column count value used by GridTemplateAreasInput. */ columnCount: number;
}
/** Represents the public grid template areas value used by TaffyJS. */
interface GridTemplateAreas {
  /** Stores the areas component of this GridTemplateAreas value. */ readonly areas: readonly GridTemplateArea[];
  /** Stores the row count component of this GridTemplateAreas value. */ readonly rowCount: number;
  /** Stores the column count component of this GridTemplateAreas value. */ readonly columnCount: number;
}
/** Supplies writable grid template area data at the public API boundary. */
interface GridTemplateAreaInput {
  /** Supplies the name value used by GridTemplateAreaInput. */ name: string;
  /** Supplies the row start value used by GridTemplateAreaInput. */ rowStart: number;
  /** Supplies the row end value used by GridTemplateAreaInput. */ rowEnd: number;
  /** Supplies the column start value used by GridTemplateAreaInput. */ columnStart: number;
  /** Supplies the column end value used by GridTemplateAreaInput. */ columnEnd: number;
}
/** Represents the public grid template area value used by TaffyJS. */
interface GridTemplateArea {
  /** Stores the name component of this GridTemplateArea value. */ readonly name: string;
  /** Stores the row start component of this GridTemplateArea value. */ readonly rowStart: number;
  /** Stores the row end component of this GridTemplateArea value. */ readonly rowEnd: number;
  /** Stores the column start component of this GridTemplateArea value. */ readonly columnStart: number;
  /** Stores the column end component of this GridTemplateArea value. */ readonly columnEnd: number;
}
/** Supplies partial writable style data, using Taffy defaults for omitted fields. */
interface StyleInput {
  /** Sets the node's display style; omission uses Taffy's default. */ display?: Display | undefined;
  /** Sets the node's item is table style; omission uses Taffy's default. */ itemIsTable?: boolean | undefined;
  /** Sets the node's item is replaced style; omission uses Taffy's default. */ itemIsReplaced?: boolean | undefined;
  /** Sets the node's box sizing style; omission uses Taffy's default. */ boxSizing?: BoxSizing | undefined;
  /** Sets the node's direction style; omission uses Taffy's default. */ direction?: Direction | undefined;
  /** Sets the node's overflow style; omission uses Taffy's default. */ overflow?: PartialPointInput<Overflow> | undefined;
  /** Sets the node's scrollbar width style; omission uses Taffy's default. */ scrollbarWidth?: number | undefined;
  /** Sets the node's float style; omission uses Taffy's default. */ float?: Float | undefined;
  /** Sets which preceding floats this node must clear. */ clear?: Clear | undefined;
  /** Sets the node's position style; omission uses Taffy's default. */ position?: Position | undefined;
  /** Sets the node's inset style; omission uses Taffy's default. */ inset?: LengthPercentageAutoInput | PartialRectInput<LengthPercentageAutoInput> | undefined;
  /** Sets the node's size style; omission uses Taffy's default. */ size?: DimensionInput | PartialSizeInput<DimensionInput> | undefined;
  /** Sets the node's min size style; omission uses Taffy's default. */ minSize?: DimensionInput | PartialSizeInput<DimensionInput> | undefined;
  /** Sets the node's max size style; omission uses Taffy's default. */ maxSize?: DimensionInput | PartialSizeInput<DimensionInput> | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ aspectRatio?: number | null | undefined;
  /** Sets the node's margin style; omission uses Taffy's default. */ margin?: LengthPercentageAutoInput | PartialRectInput<LengthPercentageAutoInput> | undefined;
  /** Sets the node's padding style; omission uses Taffy's default. */ padding?: LengthPercentageInput | PartialRectInput<LengthPercentageInput> | undefined;
  /** Sets the node's border style; omission uses Taffy's default. */ border?: LengthPercentageInput | PartialRectInput<LengthPercentageInput> | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ alignItems?: AlignItems | null | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ alignSelf?: AlignItems | null | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ justifyItems?: AlignItems | null | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ justifySelf?: AlignItems | null | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ alignContent?: AlignContent | null | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ justifyContent?: AlignContent | null | undefined;
  /** Sets the node's gap style; omission uses Taffy's default. */ gap?: LengthPercentageInput | PartialSizeInput<LengthPercentageInput> | undefined;
  /** Sets the node's text align style; omission uses Taffy's default. */ textAlign?: TextAlign | undefined;
  /** Sets the node's flex direction style; omission uses Taffy's default. */ flexDirection?: FlexDirection | undefined;
  /** Sets the node's flex wrap style; omission uses Taffy's default. */ flexWrap?: FlexWrap | undefined;
  /** Sets the node's flex basis style; omission uses Taffy's default. */ flexBasis?: DimensionInput | undefined;
  /** Sets the node's flex grow style; omission uses Taffy's default. */ flexGrow?: number | undefined;
  /** Sets the node's flex shrink style; omission uses Taffy's default. */ flexShrink?: number | undefined;
  /** Sets the node's grid template rows style; omission uses Taffy's default. */ gridTemplateRows?: GridTemplateComponentInput[] | undefined;
  /** Sets the node's grid template columns style; omission uses Taffy's default. */ gridTemplateColumns?: GridTemplateComponentInput[] | undefined;
  /** Sets the node's grid auto rows style; omission uses Taffy's default. */ gridAutoRows?: TrackSizingFunctionInput[] | undefined;
  /** Sets the node's grid auto columns style; omission uses Taffy's default. */ gridAutoColumns?: TrackSizingFunctionInput[] | undefined;
  /** Sets the node's grid auto flow style; omission uses Taffy's default. */ gridAutoFlow?: GridAutoFlow | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ gridTemplateAreas?: GridTemplateAreasInput | null | undefined;
  /** Sets the node's grid template column names style; omission uses Taffy's default. */ gridTemplateColumnNames?: string[][] | undefined;
  /** Sets the node's grid template row names style; omission uses Taffy's default. */ gridTemplateRowNames?: string[][] | undefined;
  /** Sets the node's grid row style; omission uses Taffy's default. */ gridRow?: PartialLineInput<GridPlacementInput> | undefined;
  /** Sets the node's grid column style; omission uses Taffy's default. */ gridColumn?: PartialLineInput<GridPlacementInput> | undefined;
}
/** Returns a complete detached readonly snapshot of a node's stored style. */
interface Style {
  /** Reports the node's stored display style value. */ readonly display: Display;
  /** Reports the node's stored item is table style value. */ readonly itemIsTable: boolean;
  /** Reports the node's stored item is replaced style value. */ readonly itemIsReplaced: boolean;
  /** Reports the node's stored box sizing style value. */ readonly boxSizing: BoxSizing;
  /** Reports the node's stored direction style value. */ readonly direction: Direction;
  /** Reports the node's stored overflow style value. */ readonly overflow: Point<Overflow>;
  /** Reports the node's stored scrollbar width style value. */ readonly scrollbarWidth: number;
  /** Reports the node's stored float style value. */ readonly float: Float;
  /** Reports which preceding floats this node must clear. */ readonly clear: Clear;
  /** Reports the node's stored position style value. */ readonly position: Position;
  /** Reports the node's stored inset style value. */ readonly inset: Rect<LengthPercentageAuto>;
  /** Reports the node's stored size style value. */ readonly size: Size<Dimension$1>;
  /** Reports the node's stored min size style value. */ readonly minSize: Size<Dimension$1>;
  /** Reports the node's stored max size style value. */ readonly maxSize: Size<Dimension$1>;
  /** Reports the node's stored aspect ratio style value. */ readonly aspectRatio: number | null;
  /** Reports the node's stored margin style value. */ readonly margin: Rect<LengthPercentageAuto>;
  /** Reports the node's stored padding style value. */ readonly padding: Rect<LengthPercentage>;
  /** Reports the node's stored border style value. */ readonly border: Rect<LengthPercentage>;
  /** Reports the node's stored align items style value. */ readonly alignItems: AlignItems | null;
  /** Reports the node's stored align self style value. */ readonly alignSelf: AlignItems | null;
  /** Reports the node's stored justify items style value. */ readonly justifyItems: AlignItems | null;
  /** Reports the node's stored justify self style value. */ readonly justifySelf: AlignItems | null;
  /** Reports the node's stored align content style value. */ readonly alignContent: AlignContent | null;
  /** Reports the node's stored justify content style value. */ readonly justifyContent: AlignContent | null;
  /** Reports the node's stored gap style value. */ readonly gap: Size<LengthPercentage>;
  /** Reports the node's stored text align style value. */ readonly textAlign: TextAlign;
  /** Reports the node's stored flex direction style value. */ readonly flexDirection: FlexDirection;
  /** Reports the node's stored flex wrap style value. */ readonly flexWrap: FlexWrap;
  /** Reports the node's stored flex basis style value. */ readonly flexBasis: Dimension$1;
  /** Reports the node's stored flex grow style value. */ readonly flexGrow: number;
  /** Reports the node's stored flex shrink style value. */ readonly flexShrink: number;
  /** Reports the node's stored grid template rows style value. */ readonly gridTemplateRows: readonly GridTemplateComponent$1[];
  /** Reports the node's stored grid template columns style value. */ readonly gridTemplateColumns: readonly GridTemplateComponent$1[];
  /** Reports the node's stored grid auto rows style value. */ readonly gridAutoRows: readonly TrackSizingFunction$1[];
  /** Reports the node's stored grid auto columns style value. */ readonly gridAutoColumns: readonly TrackSizingFunction$1[];
  /** Reports the node's stored grid auto flow style value. */ readonly gridAutoFlow: GridAutoFlow;
  /** Reports the node's stored grid template areas style value. */ readonly gridTemplateAreas: GridTemplateAreas | null;
  /** Reports the node's stored grid template column names style value. */ readonly gridTemplateColumnNames: readonly (readonly string[])[];
  /** Reports the node's stored grid template row names style value. */ readonly gridTemplateRowNames: readonly (readonly string[])[];
  /** Reports the node's stored grid row style value. */ readonly gridRow: Line<GridPlacement$1>;
  /** Reports the node's stored grid column style value. */ readonly gridColumn: Line<GridPlacement$1>;
}
/** Returns a detached readonly snapshot of a node's most recently stored layout. */
interface Layout {
  /** Reports this node's stable traversal order in the stored layout. */ readonly order: number;
  /** Reports this node's position relative to its parent. */ readonly location: Point<number>;
  /** Reports this node's outer width and height. */ readonly size: Size<number>;
  /** Reports the width and height of this node's content. */ readonly contentSize: Size<number>;
  /** Reports the width and height reserved for scrollbars. */ readonly scrollbarSize: Size<number>;
  /** Reports this node's resolved border widths. */ readonly border: Rect<number>;
  /** Reports this node's resolved padding widths. */ readonly padding: Rect<number>;
  /** Reports this node's resolved margins. */ readonly margin: Rect<number>;
}
/** Reports detached readonly detailed layout info from a completed Grid layout. */
type DetailedLayoutInfo = Readonly<{
  /** Identifies which DetailedLayoutInfo tagged variant this value contains. */ kind: typeof DetailedLayoutInfoKind.None;
}> | Readonly<{
  /** Identifies which DetailedLayoutInfo tagged variant this value contains. */ kind: typeof DetailedLayoutInfoKind.Grid;
  /** Carries the payload for this DetailedLayoutInfo tagged variant. */ value: DetailedGridInfo;
}>;
/** Reports detached readonly detailed grid info from a completed Grid layout. */
interface DetailedGridInfo {
  /** Reports the rows value stored in DetailedGridInfo. */ readonly rows: DetailedGridTracksInfo;
  /** Reports the columns value stored in DetailedGridInfo. */ readonly columns: DetailedGridTracksInfo;
  /** Reports the items value stored in DetailedGridInfo. */ readonly items: readonly DetailedGridItemInfo[];
}
/** Reports detached readonly detailed grid tracks info from a completed Grid layout. */
interface DetailedGridTracksInfo {
  /** Reports the negative implicit tracks value stored in DetailedGridTracksInfo. */ readonly negativeImplicitTracks: number;
  /** Reports the explicit tracks value stored in DetailedGridTracksInfo. */ readonly explicitTracks: number;
  /** Reports the positive implicit tracks value stored in DetailedGridTracksInfo. */ readonly positiveImplicitTracks: number;
  /** Reports the gutters value stored in DetailedGridTracksInfo. */ readonly gutters: readonly number[];
  /** Reports the sizes value stored in DetailedGridTracksInfo. */ readonly sizes: readonly number[];
}
/** Reports detached readonly detailed grid item info from a completed Grid layout. */
interface DetailedGridItemInfo {
  /** Reports the row start value stored in DetailedGridItemInfo. */ readonly rowStart: number;
  /** Reports the row end value stored in DetailedGridItemInfo. */ readonly rowEnd: number;
  /** Reports the column start value stored in DetailedGridItemInfo. */ readonly columnStart: number;
  /** Reports the column end value stored in DetailedGridItemInfo. */ readonly columnEnd: number;
}
/** Supplies dimensions, available space, identity, context, and style to measurement. */
type MeasureArgs<TContext> = Readonly<{
  /** Supplies the known dimensions value used by MeasureArgs. */ knownDimensions: Size<number | undefined>;
  /** Supplies the available space value used by MeasureArgs. */ availableSpace: Size<AvailableSpace$1>;
  /** Supplies the node value used by MeasureArgs. */ node: NodeId;
  /** Supplies the context value used by MeasureArgs. */ context: TContext | undefined;
  /** Supplies the style value used by MeasureArgs. */ style: Style;
}>;
/** Measures synchronously when Taffy requests it; invocation count and order are unspecified, and changed external data requires explicit dirtying. */
type MeasureFunction<TContext> = (args: MeasureArgs<TContext>) => SizeInput<number>;
/** Supplies a half-open child index range to removeChildrenRange. */
interface ChildRangeInput {
  /** Supplies the start value used by ChildRangeInput. */ start: number;
  /** Supplies the end value used by ChildRangeInput. */ end: number;
}
/** Supplies a root, available space, and synchronous measurement callback. */
interface ComputeLayoutWithMeasureOptions<TContext> {
  /** Supplies the root value used by ComputeLayoutWithMeasureOptions. */ root: NodeId;
  /** Supplies the available space value used by ComputeLayoutWithMeasureOptions. */ availableSpace: SizeInput<AvailableSpaceInput>;
  /** Supplies the measure value used by ComputeLayoutWithMeasureOptions. */ measure: MeasureFunction<TContext>;
}
/** Supplies a root and available space for ordinary layout computation. */
interface ComputeLayoutOptions {
  /** Supplies the root value used by ComputeLayoutOptions. */ root: NodeId;
  /** Supplies the available space value used by ComputeLayoutOptions. */ availableSpace: SizeInput<AvailableSpaceInput>;
}
//#endregion
//#region src/available-space.d.ts
type AvailableSpace = AvailableSpace$1;
/** Provides constructors and shared values for readable available-space inputs. */
declare const AvailableSpace: Readonly<{
  Definite(value: number): Extract<AvailableSpaceInput, {
    kind: typeof AvailableSpaceKind.Definite;
  }>;
  MinContent: Readonly<{
    readonly kind: 1;
  }>;
  MaxContent: Readonly<{
    readonly kind: 2;
  }>;
}>;
//#endregion
//#region src/grid.d.ts
type GridPlacement = GridPlacement$1;
type GridTemplateComponent = GridTemplateComponent$1;
type RepetitionCount = RepetitionCount$1;
type TrackSizingFunction = TrackSizingFunction$1;
/** Provides constructors and a shared Auto value for Grid placement inputs. */
declare const GridPlacement: Readonly<{
  Auto: Readonly<{
    readonly kind: 0;
  }>;
  Line(index: number): Extract<GridPlacementInput, {
    kind: typeof GridPlacementKind.Line;
  }>;
  NamedLine(name: string, index: number): Extract<GridPlacementInput, {
    kind: typeof GridPlacementKind.NamedLine;
  }>;
  Span(span: number): Extract<GridPlacementInput, {
    kind: typeof GridPlacementKind.Span;
  }>;
  NamedSpan(name: string, span: number): Extract<GridPlacementInput, {
    kind: typeof GridPlacementKind.NamedSpan;
  }>;
}>;
/** Provides constructors and shared values for Grid track sizing inputs. */
declare const TrackSizingFunction: Readonly<{
  Length(value: number): TrackSizingFunctionInput;
  Percent(value: number): TrackSizingFunctionInput;
  Auto: Readonly<{
    min: Readonly<{
      kind: 2;
    }>;
    max: Readonly<{
      kind: 2;
    }>;
  }>;
  MinContent: Readonly<{
    min: Readonly<{
      kind: 3;
    }>;
    max: Readonly<{
      kind: 3;
    }>;
  }>;
  MaxContent: Readonly<{
    min: Readonly<{
      kind: 4;
    }>;
    max: Readonly<{
      kind: 4;
    }>;
  }>;
  FitContent(value: LengthPercentageInput): TrackSizingFunctionInput;
  Fr(value: number): TrackSizingFunctionInput;
  MinMax(min: MinTrackSizingFunctionInput, max: MaxTrackSizingFunctionInput): TrackSizingFunctionInput;
}>;
/** Provides constructors and shared values for Grid repetition counts. */
declare const RepetitionCount: Readonly<{
  Count(value: number): Extract<RepetitionCountInput, {
    kind: typeof RepetitionCountKind.Count;
  }>;
  AutoFill: Readonly<{
    readonly kind: 1;
  }>;
  AutoFit: Readonly<{
    readonly kind: 2;
  }>;
}>;
/** Provides constructors for Grid template components. */
declare const GridTemplateComponent: Readonly<{
  Single(value: TrackSizingFunctionInput): Extract<GridTemplateComponentInput, {
    kind: typeof GridTemplateComponentKind.Single;
  }>;
  Repeat(count: RepetitionCountInput, tracks: TrackSizingFunctionInput[], lineNames?: string[][]): Extract<GridTemplateComponentInput, {
    kind: typeof GridTemplateComponentKind.Repeat;
  }>;
}>;
//#endregion
//#region src/length.d.ts
type Dimension = Dimension$1;
/** Provides constructors and a shared Auto value for readable dimension inputs. */
declare const Dimension: Readonly<{
  Length(value: number): LengthInput;
  Percent(value: number): PercentInput;
  Auto: Readonly<{
    readonly unit: 2;
  }>;
}>;
//#endregion
//#region src/tree.d.ts
/** Describes the public operations of one independent Taffy tree. */
interface TaffyTree<TContext = unknown> {
  /** Enables pixel rounding for subsequently computed public layouts. */ enableRounding(): void;
  /** Disables pixel rounding while retaining unrounded layout values. */ disableRounding(): void;
  /** Creates a leaf node from the supplied public style input. */ newLeaf(style: StyleInput): NodeId;
  /** Creates a leaf node and associates optional JavaScript context. */ newLeafWithContext(style: StyleInput, context: TContext | undefined): NodeId;
  /** Creates a parent node with the supplied ordered children. */ newWithChildren(style: StyleInput, children: readonly NodeId[]): NodeId;
  /** Removes every node and context value from this tree. */ clear(): void;
  /** Removes one node and invalidates its public NodeId. */ remove(node: NodeId): void;
  /** Replaces or clears the JavaScript context for one node. */ setNodeContext(node: NodeId, context: TContext | undefined): void;
  /** Returns the JavaScript context currently associated with one node. */ getNodeContext(node: NodeId): TContext | undefined;
  /** Appends an existing node to the parent child list. */ addChild(parent: NodeId, child: NodeId): void;
  /** Inserts an existing child at the requested parent index. */ insertChildAtIndex(parent: NodeId, index: number, child: NodeId): void;
  /** Replaces the complete ordered child list for one parent. */ setChildren(parent: NodeId, children: readonly NodeId[]): void;
  /** Detaches the selected child from its current parent. */ removeChild(parent: NodeId, child: NodeId): void;
  /** Detaches and returns the child at the requested index. */ removeChildAtIndex(parent: NodeId, index: number): NodeId;
  /** Detaches children in the supplied half-open index range. */ removeChildrenRange(parent: NodeId, range: ChildRangeInput): void;
  /** Replaces and returns the child at the requested index. */ replaceChildAtIndex(parent: NodeId, index: number, newChild: NodeId): NodeId;
  /** Returns the child at the requested parent index. */ getChildAtIndex(parent: NodeId, index: number): NodeId;
  /** Returns the current number of children for one parent. */ getChildCount(parent: NodeId): number;
  /** Returns the number of live nodes owned by this tree. */ getNodeCount(): number;
  /** Returns the current parent or null for a root node. */ getParent(node: NodeId): NodeId | null;
  /** Returns a detached readonly snapshot of the ordered children. */ getChildren(parent: NodeId): readonly NodeId[];
  /** Replaces a node style and marks affected layout state dirty. */ setStyle(node: NodeId, style: StyleInput): void;
  /** Returns a detached readable snapshot of the node style. */ getStyle(node: NodeId): Style;
  /** Returns the most recently stored rounded layout snapshot. */ getLayout(node: NodeId): Layout;
  /** Returns the most recently stored unrounded layout snapshot. */ getUnroundedLayout(node: NodeId): Layout;
  /** Returns detailed Grid tracks and item placement when available. */ getDetailedLayoutInfo(node: NodeId): DetailedLayoutInfo;
  /** Explicitly marks a node for layout recomputation. */ markDirty(node: NodeId): void;
  /** Reports whether a node currently needs layout recomputation. */ isDirty(node: NodeId): boolean;
  /** Computes and stores layout for a tree root synchronously. */ computeLayout(options: ComputeLayoutOptions): void;
  /** Computes synchronously with Taffy-controlled measurement caching; changed external data or a different callback requires explicit dirtying. */ computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void;
}
interface TaffyTreeConstructor {
  readonly prototype: TaffyTree<any>;
  new <TContext = unknown>(): TaffyTree<TContext>;
}
/** Creates an independent Taffy tree with its own NodeId namespace. */
declare const TaffyTree: TaffyTreeConstructor;
//#endregion
export { AlignContent, AlignItems, type AutoInput, AvailableSpace, type AvailableSpaceInput, AvailableSpaceKind, BoxSizing, type ChildRangeInput, Clear, type ComputeLayoutOptions, type ComputeLayoutWithMeasureOptions, type DetailedGridInfo, type DetailedGridItemInfo, type DetailedGridTracksInfo, type DetailedLayoutInfo, DetailedLayoutInfoKind, Dimension, type DimensionInput, Direction, Display, type EnumValue, FlexDirection, FlexWrap, Float, GridAutoFlow, GridPlacement, type GridPlacementInput, GridPlacementKind, type GridTemplateArea, type GridTemplateAreaInput, type GridTemplateAreas, type GridTemplateAreasInput, GridTemplateComponent, type GridTemplateComponentInput, GridTemplateComponentKind, type GridTemplateRepetition, type GridTemplateRepetitionInput, type Layout, type LengthInput, type LengthPercentage, type LengthPercentageAuto, type LengthPercentageAutoInput, type LengthPercentageInput, LengthUnit, type Line, type LineInput, type MaxTrackSizingFunction, type MaxTrackSizingFunctionInput, type MeasureArgs, type MeasureFunction, type MinTrackSizingFunction, type MinTrackSizingFunctionInput, type NodeId, Overflow, type PartialLineInput, type PartialPointInput, type PartialRectInput, type PartialSizeInput, type PercentInput, type Point, type PointInput, Position, type Rect, type RectInput, RepetitionCount, type RepetitionCountInput, RepetitionCountKind, type Size, type SizeInput, type Style, type StyleInput, TaffyTree, TextAlign, TrackSizingFunction, type TrackSizingFunctionInput, TrackSizingKind };