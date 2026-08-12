declare const phantomMarker: unique symbol;

export type EnumValue<Family extends Readonly<Record<string, number>>> = Family[keyof Family];

export declare const Display: Readonly<{
  readonly Block: 0;
  readonly FlowRoot: 1;
  readonly Flex: 2;
  readonly Grid: 3;
  readonly None: 4;
}>;

export type Display = EnumValue<typeof Display>;

export declare const BoxSizing: Readonly<{ readonly BorderBox: 0; readonly ContentBox: 1 }>;

export type BoxSizing = EnumValue<typeof BoxSizing>;

export declare const Direction: Readonly<{ readonly Ltr: 0; readonly Rtl: 1 }>;

export type Direction = EnumValue<typeof Direction>;

export declare const Overflow: Readonly<{
  readonly Visible: 0;
  readonly Clip: 1;
  readonly Hidden: 2;
  readonly Scroll: 3;
}>;

export type Overflow = EnumValue<typeof Overflow>;

export declare const Float: Readonly<{ readonly Left: 0; readonly Right: 1; readonly None: 2 }>;

export type Float = EnumValue<typeof Float>;

export declare const Clear: Readonly<{
  readonly Left: 0;
  readonly Right: 1;
  readonly Both: 2;
  readonly None: 3;
}>;

export type Clear = EnumValue<typeof Clear>;

export declare const Position: Readonly<{ readonly Relative: 0; readonly Absolute: 1 }>;

export type Position = EnumValue<typeof Position>;

export declare const TextAlign: Readonly<{
  readonly Auto: 0;
  readonly LegacyLeft: 1;
  readonly LegacyRight: 2;
  readonly LegacyCenter: 3;
}>;

export type TextAlign = EnumValue<typeof TextAlign>;

export declare const FlexDirection: Readonly<{
  readonly Row: 0;
  readonly Column: 1;
  readonly RowReverse: 2;
  readonly ColumnReverse: 3;
}>;

export type FlexDirection = EnumValue<typeof FlexDirection>;

export declare const FlexWrap: Readonly<{
  readonly NoWrap: 0;
  readonly Wrap: 1;
  readonly WrapReverse: 2;
}>;

export type FlexWrap = EnumValue<typeof FlexWrap>;

export declare const GridAutoFlow: Readonly<{
  readonly Row: 0;
  readonly Column: 1;
  readonly RowDense: 2;
  readonly ColumnDense: 3;
}>;

export type GridAutoFlow = EnumValue<typeof GridAutoFlow>;

export declare const AlignItems: Readonly<{
  readonly Start: 0;
  readonly End: 1;
  readonly FlexStart: 2;
  readonly FlexEnd: 3;
  readonly SelfStart: 4;
  readonly SelfEnd: 5;
  readonly Center: 6;
  readonly Baseline: 7;
  readonly Stretch: 8;
  readonly SafeStart: 9;
  readonly SafeEnd: 10;
  readonly SafeFlexStart: 11;
  readonly SafeFlexEnd: 12;
  readonly SafeSelfStart: 13;
  readonly SafeSelfEnd: 14;
  readonly SafeCenter: 15;
}>;

export type AlignItems = EnumValue<typeof AlignItems>;

export declare const AlignContent: Readonly<{
  readonly Start: 0;
  readonly End: 1;
  readonly FlexStart: 2;
  readonly FlexEnd: 3;
  readonly Center: 4;
  readonly Stretch: 5;
  readonly SpaceBetween: 6;
  readonly SpaceEvenly: 7;
  readonly SpaceAround: 8;
  readonly SafeStart: 9;
  readonly SafeEnd: 10;
  readonly SafeFlexStart: 11;
  readonly SafeFlexEnd: 12;
  readonly SafeCenter: 13;
}>;

export type AlignContent = EnumValue<typeof AlignContent>;

export declare const LengthUnit: Readonly<{
  readonly Length: 0;
  readonly Percent: 1;
  readonly Auto: 2;
}>;

export type LengthUnit = EnumValue<typeof LengthUnit>;

export declare const AvailableSpaceKind: Readonly<{
  readonly Definite: 0;
  readonly MinContent: 1;
  readonly MaxContent: 2;
}>;

export type AvailableSpaceKind = EnumValue<typeof AvailableSpaceKind>;

export declare const GridPlacementKind: Readonly<{
  readonly Auto: 0;
  readonly Line: 1;
  readonly NamedLine: 2;
  readonly Span: 3;
  readonly NamedSpan: 4;
}>;

export type GridPlacementKind = EnumValue<typeof GridPlacementKind>;

export declare const TrackSizingKind: Readonly<{
  readonly Length: 0;
  readonly Percent: 1;
  readonly Auto: 2;
  readonly MinContent: 3;
  readonly MaxContent: 4;
  readonly FitContent: 5;
  readonly Fr: 6;
}>;

export type TrackSizingKind = EnumValue<typeof TrackSizingKind>;

export declare const RepetitionCountKind: Readonly<{
  readonly Count: 0;
  readonly AutoFill: 1;
  readonly AutoFit: 2;
}>;

export type RepetitionCountKind = EnumValue<typeof RepetitionCountKind>;

export declare const GridTemplateComponentKind: Readonly<{
  readonly Single: 0;
  readonly Repeat: 1;
}>;

export type GridTemplateComponentKind = EnumValue<typeof GridTemplateComponentKind>;

export declare const DetailedLayoutInfoKind: Readonly<{ readonly None: 0; readonly Grid: 1 }>;

export type DetailedLayoutInfoKind = EnumValue<typeof DetailedLayoutInfoKind>;

export type NodeId = bigint & { readonly [phantomMarker]: never };

export interface PointInput<T> {
  x: T;
  y: T;
}

export interface PartialPointInput<T> {
  x?: T | undefined;
  y?: T | undefined;
}

export interface Point<T> {
  readonly x: T;
  readonly y: T;
}

export interface SizeInput<T> {
  width: T;
  height: T;
}

export interface PartialSizeInput<T> {
  width?: T | undefined;
  height?: T | undefined;
}

export interface Size<T> {
  readonly width: T;
  readonly height: T;
}

export interface RectInput<T> {
  left: T;
  right: T;
  top: T;
  bottom: T;
}

export interface PartialRectInput<T> {
  left?: T | undefined;
  right?: T | undefined;
  top?: T | undefined;
  bottom?: T | undefined;
}

export interface Rect<T> {
  readonly left: T;
  readonly right: T;
  readonly top: T;
  readonly bottom: T;
}

export interface LineInput<T> {
  start: T;
  end: T;
}

export interface PartialLineInput<T> {
  start?: T | undefined;
  end?: T | undefined;
}

export interface Line<T> {
  readonly start: T;
  readonly end: T;
}

export type LengthInput = { unit: typeof LengthUnit.Length; value: number };

export type PercentInput = { unit: typeof LengthUnit.Percent; value: number };

export type AutoInput = { unit: typeof LengthUnit.Auto };

export type LengthPercentageInput = LengthInput | PercentInput;

export type LengthPercentageAutoInput = LengthInput | PercentInput | AutoInput;

export type DimensionInput = LengthPercentageAutoInput;

export type LengthPercentage = Readonly<LengthInput> | Readonly<PercentInput>;

export type LengthPercentageAuto =
  | Readonly<LengthInput>
  | Readonly<PercentInput>
  | Readonly<AutoInput>;

export type Dimension = LengthPercentageAuto;

export declare const Dimension: Readonly<{
  readonly Length: (value: number) => LengthInput;
  readonly Percent: (value: number) => PercentInput;
  readonly Auto: Readonly<AutoInput>;
}>;

export type AvailableSpaceInput =
  | { kind: typeof AvailableSpaceKind.Definite; value: number }
  | { kind: typeof AvailableSpaceKind.MinContent }
  | { kind: typeof AvailableSpaceKind.MaxContent };

export type AvailableSpace =
  | Readonly<{ kind: typeof AvailableSpaceKind.Definite; value: number }>
  | Readonly<{ kind: typeof AvailableSpaceKind.MinContent }>
  | Readonly<{ kind: typeof AvailableSpaceKind.MaxContent }>;

export declare const AvailableSpace: Readonly<{
  readonly Definite: (value: number) => { kind: typeof AvailableSpaceKind.Definite; value: number };
  readonly MinContent: Readonly<{ kind: typeof AvailableSpaceKind.MinContent }>;
  readonly MaxContent: Readonly<{ kind: typeof AvailableSpaceKind.MaxContent }>;
}>;

export type GridPlacementInput =
  | { kind: typeof GridPlacementKind.Auto }
  | { kind: typeof GridPlacementKind.Line; index: number }
  | { kind: typeof GridPlacementKind.NamedLine; name: string; index: number }
  | { kind: typeof GridPlacementKind.Span; span: number }
  | { kind: typeof GridPlacementKind.NamedSpan; name: string; span: number };

export type GridPlacement =
  | Readonly<{ kind: typeof GridPlacementKind.Auto }>
  | Readonly<{ kind: typeof GridPlacementKind.Line; index: number }>
  | Readonly<{ kind: typeof GridPlacementKind.NamedLine; name: string; index: number }>
  | Readonly<{ kind: typeof GridPlacementKind.Span; span: number }>
  | Readonly<{ kind: typeof GridPlacementKind.NamedSpan; name: string; span: number }>;

export type MinTrackSizingFunctionInput =
  | { kind: typeof TrackSizingKind.Length; value: number }
  | { kind: typeof TrackSizingKind.Percent; value: number }
  | { kind: typeof TrackSizingKind.Auto }
  | { kind: typeof TrackSizingKind.MinContent }
  | { kind: typeof TrackSizingKind.MaxContent };

export type MinTrackSizingFunction =
  | Readonly<{ kind: typeof TrackSizingKind.Length; value: number }>
  | Readonly<{ kind: typeof TrackSizingKind.Percent; value: number }>
  | Readonly<{ kind: typeof TrackSizingKind.Auto }>
  | Readonly<{ kind: typeof TrackSizingKind.MinContent }>
  | Readonly<{ kind: typeof TrackSizingKind.MaxContent }>;

export type MaxTrackSizingFunctionInput =
  | MinTrackSizingFunctionInput
  | { kind: typeof TrackSizingKind.FitContent; value: LengthPercentageInput }
  | { kind: typeof TrackSizingKind.Fr; value: number };

export type MaxTrackSizingFunction =
  | MinTrackSizingFunction
  | Readonly<{ kind: typeof TrackSizingKind.FitContent; value: LengthPercentage }>
  | Readonly<{ kind: typeof TrackSizingKind.Fr; value: number }>;

export interface TrackSizingFunctionInput {
  min: MinTrackSizingFunctionInput;
  max: MaxTrackSizingFunctionInput;
}

export interface TrackSizingFunction {
  readonly min: MinTrackSizingFunction;
  readonly max: MaxTrackSizingFunction;
}

export type RepetitionCountInput =
  | { kind: typeof RepetitionCountKind.Count; value: number }
  | { kind: typeof RepetitionCountKind.AutoFill }
  | { kind: typeof RepetitionCountKind.AutoFit };

export type RepetitionCount =
  | Readonly<{ kind: typeof RepetitionCountKind.Count; value: number }>
  | Readonly<{ kind: typeof RepetitionCountKind.AutoFill }>
  | Readonly<{ kind: typeof RepetitionCountKind.AutoFit }>;

export interface GridTemplateRepetitionInput {
  count: RepetitionCountInput;
  tracks: TrackSizingFunctionInput[];
  lineNames: string[][];
}

export interface GridTemplateRepetition {
  readonly count: RepetitionCount;
  readonly tracks: readonly TrackSizingFunction[];
  readonly lineNames: readonly (readonly string[])[];
}

export type GridTemplateComponentInput =
  | { kind: typeof GridTemplateComponentKind.Single; value: TrackSizingFunctionInput }
  | { kind: typeof GridTemplateComponentKind.Repeat; value: GridTemplateRepetitionInput };

export type GridTemplateComponent =
  | Readonly<{ kind: typeof GridTemplateComponentKind.Single; value: TrackSizingFunction }>
  | Readonly<{ kind: typeof GridTemplateComponentKind.Repeat; value: GridTemplateRepetition }>;

export interface GridTemplateAreasInput {
  areas: GridTemplateAreaInput[];
  rowCount: number;
  columnCount: number;
}

export interface GridTemplateAreas {
  readonly areas: readonly GridTemplateArea[];
  readonly rowCount: number;
  readonly columnCount: number;
}

export interface GridTemplateAreaInput {
  name: string;
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
}

export interface GridTemplateArea {
  readonly name: string;
  readonly rowStart: number;
  readonly rowEnd: number;
  readonly columnStart: number;
  readonly columnEnd: number;
}

export declare const GridPlacement: Readonly<{
  readonly Auto: Readonly<{ kind: typeof GridPlacementKind.Auto }>;
  readonly Line: (index: number) => { kind: typeof GridPlacementKind.Line; index: number };
  readonly NamedLine: (
    name: string,
    index: number,
  ) => { kind: typeof GridPlacementKind.NamedLine; name: string; index: number };
  readonly Span: (span: number) => { kind: typeof GridPlacementKind.Span; span: number };
  readonly NamedSpan: (
    name: string,
    span: number,
  ) => { kind: typeof GridPlacementKind.NamedSpan; name: string; span: number };
}>;

export declare const TrackSizingFunction: Readonly<{
  readonly Length: (value: number) => TrackSizingFunctionInput;
  readonly Percent: (value: number) => TrackSizingFunctionInput;
  readonly Auto: Readonly<{
    readonly min: Readonly<{ kind: typeof TrackSizingKind.Auto }>;
    readonly max: Readonly<{ kind: typeof TrackSizingKind.Auto }>;
  }>;
  readonly MinContent: Readonly<{
    readonly min: Readonly<{ kind: typeof TrackSizingKind.MinContent }>;
    readonly max: Readonly<{ kind: typeof TrackSizingKind.MinContent }>;
  }>;
  readonly MaxContent: Readonly<{
    readonly min: Readonly<{ kind: typeof TrackSizingKind.MaxContent }>;
    readonly max: Readonly<{ kind: typeof TrackSizingKind.MaxContent }>;
  }>;
  readonly FitContent: (value: LengthPercentageInput) => TrackSizingFunctionInput;
  readonly Fr: (value: number) => TrackSizingFunctionInput;
  readonly MinMax: (
    min: MinTrackSizingFunctionInput,
    max: MaxTrackSizingFunctionInput,
  ) => TrackSizingFunctionInput;
}>;

export declare const RepetitionCount: Readonly<{
  readonly Count: (value: number) => { kind: typeof RepetitionCountKind.Count; value: number };
  readonly AutoFill: Readonly<{ kind: typeof RepetitionCountKind.AutoFill }>;
  readonly AutoFit: Readonly<{ kind: typeof RepetitionCountKind.AutoFit }>;
}>;

export declare const GridTemplateComponent: Readonly<{
  readonly Single: (value: TrackSizingFunctionInput) => {
    kind: typeof GridTemplateComponentKind.Single;
    value: TrackSizingFunctionInput;
  };
  readonly Repeat: (
    count: RepetitionCountInput,
    tracks: TrackSizingFunctionInput[],
    lineNames?: string[][],
  ) => { kind: typeof GridTemplateComponentKind.Repeat; value: GridTemplateRepetitionInput };
}>;

export interface StyleInput {
  display?: Display | undefined;
  itemIsTable?: boolean | undefined;
  itemIsReplaced?: boolean | undefined;
  boxSizing?: BoxSizing | undefined;
  direction?: Direction | undefined;
  overflow?: PartialPointInput<Overflow> | undefined;
  scrollbarWidth?: number | undefined;
  float?: Float | undefined;
  clear?: Clear | undefined;
  position?: Position | undefined;
  inset?: LengthPercentageAutoInput | PartialRectInput<LengthPercentageAutoInput> | undefined;
  size?: DimensionInput | PartialSizeInput<DimensionInput> | undefined;
  minSize?: DimensionInput | PartialSizeInput<DimensionInput> | undefined;
  maxSize?: DimensionInput | PartialSizeInput<DimensionInput> | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ aspectRatio?:
    | number
    | null
    | undefined;
  margin?: LengthPercentageAutoInput | PartialRectInput<LengthPercentageAutoInput> | undefined;
  padding?: LengthPercentageInput | PartialRectInput<LengthPercentageInput> | undefined;
  border?: LengthPercentageInput | PartialRectInput<LengthPercentageInput> | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ alignItems?:
    | AlignItems
    | null
    | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ alignSelf?:
    | AlignItems
    | null
    | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ justifyItems?:
    | AlignItems
    | null
    | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ justifySelf?:
    | AlignItems
    | null
    | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ alignContent?:
    | AlignContent
    | null
    | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ justifyContent?:
    | AlignContent
    | null
    | undefined;
  gap?: LengthPercentageInput | PartialSizeInput<LengthPercentageInput> | undefined;
  textAlign?: TextAlign | undefined;
  flexDirection?: FlexDirection | undefined;
  flexWrap?: FlexWrap | undefined;
  flexBasis?: DimensionInput | undefined;
  flexGrow?: number | undefined;
  flexShrink?: number | undefined;
  gridTemplateRows?: GridTemplateComponentInput[] | undefined;
  gridTemplateColumns?: GridTemplateComponentInput[] | undefined;
  gridAutoRows?: TrackSizingFunctionInput[] | undefined;
  gridAutoColumns?: TrackSizingFunctionInput[] | undefined;
  gridAutoFlow?: GridAutoFlow | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ gridTemplateAreas?:
    | GridTemplateAreasInput
    | null
    | undefined;
  gridTemplateColumnNames?: string[][] | undefined;
  gridTemplateRowNames?: string[][] | undefined;
  gridRow?: PartialLineInput<GridPlacementInput> | undefined;
  gridColumn?: PartialLineInput<GridPlacementInput> | undefined;
}

export interface Style {
  readonly display: Display;
  readonly itemIsTable: boolean;
  readonly itemIsReplaced: boolean;
  readonly boxSizing: BoxSizing;
  readonly direction: Direction;
  readonly overflow: Point<Overflow>;
  readonly scrollbarWidth: number;
  readonly float: Float;
  readonly clear: Clear;
  readonly position: Position;
  readonly inset: Rect<LengthPercentageAuto>;
  readonly size: Size<Dimension>;
  readonly minSize: Size<Dimension>;
  readonly maxSize: Size<Dimension>;
  readonly aspectRatio: number | null;
  readonly margin: Rect<LengthPercentageAuto>;
  readonly padding: Rect<LengthPercentage>;
  readonly border: Rect<LengthPercentage>;
  readonly alignItems: AlignItems | null;
  readonly alignSelf: AlignItems | null;
  readonly justifyItems: AlignItems | null;
  readonly justifySelf: AlignItems | null;
  readonly alignContent: AlignContent | null;
  readonly justifyContent: AlignContent | null;
  readonly gap: Size<LengthPercentage>;
  readonly textAlign: TextAlign;
  readonly flexDirection: FlexDirection;
  readonly flexWrap: FlexWrap;
  readonly flexBasis: Dimension;
  readonly flexGrow: number;
  readonly flexShrink: number;
  readonly gridTemplateRows: readonly GridTemplateComponent[];
  readonly gridTemplateColumns: readonly GridTemplateComponent[];
  readonly gridAutoRows: readonly TrackSizingFunction[];
  readonly gridAutoColumns: readonly TrackSizingFunction[];
  readonly gridAutoFlow: GridAutoFlow;
  readonly gridTemplateAreas: GridTemplateAreas | null;
  readonly gridTemplateColumnNames: readonly (readonly string[])[];
  readonly gridTemplateRowNames: readonly (readonly string[])[];
  readonly gridRow: Line<GridPlacement>;
  readonly gridColumn: Line<GridPlacement>;
}

export interface Layout {
  readonly order: number;
  readonly location: Point<number>;
  readonly size: Size<number>;
  readonly contentSize: Size<number>;
  readonly scrollbarSize: Size<number>;
  readonly border: Rect<number>;
  readonly padding: Rect<number>;
  readonly margin: Rect<number>;
}

export type DetailedLayoutInfo =
  | Readonly<{ kind: typeof DetailedLayoutInfoKind.None }>
  | Readonly<{ kind: typeof DetailedLayoutInfoKind.Grid; value: DetailedGridInfo }>;

export interface DetailedGridInfo {
  readonly rows: DetailedGridTracksInfo;
  readonly columns: DetailedGridTracksInfo;
  readonly items: readonly DetailedGridItemInfo[];
}

export interface DetailedGridTracksInfo {
  readonly negativeImplicitTracks: number;
  readonly explicitTracks: number;
  readonly positiveImplicitTracks: number;
  readonly gutters: readonly number[];
  readonly sizes: readonly number[];
}

export interface DetailedGridItemInfo {
  readonly rowStart: number;
  readonly rowEnd: number;
  readonly columnStart: number;
  readonly columnEnd: number;
}

export type MeasureArgs<TContext> = Readonly<{
  knownDimensions: Size<number | undefined>;
  availableSpace: Size<AvailableSpace>;
  node: NodeId;
  context: TContext | undefined;
  style: Style;
}>;

export type MeasureFunction<TContext> = (args: MeasureArgs<TContext>) => SizeInput<number>;

export declare class TaffyTree<TContext = unknown> {
  constructor();
  newLeaf(style: StyleInput): NodeId;
  newWithChildren(style: StyleInput, children: readonly NodeId[]): NodeId;
  clear(): void;
  getChildCount(parent: NodeId): number;
  getNodeCount(): number;
  getParent(node: NodeId): NodeId | null;
  getChildren(parent: NodeId): readonly NodeId[];
  setStyle(node: NodeId, style: StyleInput): void;
  getStyle(node: NodeId): Style;
}
