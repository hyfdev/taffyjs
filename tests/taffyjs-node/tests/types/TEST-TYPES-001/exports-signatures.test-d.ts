import * as api from "@taffyjs/node";
import type {
  AlignContent,
  AlignItems,
  AutoInput,
  AvailableSpace,
  AvailableSpaceKind,
  AvailableSpaceInput,
  BoxSizing,
  ChildRangeInput,
  Clear,
  ComputeLayoutOptions,
  ComputeLayoutWithMeasureOptions,
  DetailedGridInfo,
  DetailedGridItemInfo,
  DetailedGridTracksInfo,
  DetailedLayoutInfo,
  DetailedLayoutInfoKind,
  Dimension,
  DimensionInput,
  Direction,
  Display,
  EnumValue,
  FlexDirection,
  FlexWrap,
  Float,
  GridAutoFlow,
  GridPlacement,
  GridPlacementInput,
  GridPlacementKind,
  GridTemplateArea,
  GridTemplateAreaInput,
  GridTemplateAreas,
  GridTemplateAreasInput,
  GridTemplateComponent,
  GridTemplateComponentInput,
  GridTemplateComponentKind,
  GridTemplateRepetition,
  GridTemplateRepetitionInput,
  LengthPercentage,
  LengthPercentageAuto,
  LengthPercentageAutoInput,
  Layout,
  LengthInput,
  LengthPercentageInput,
  LengthUnit,
  Line,
  LineInput,
  MaxTrackSizingFunction,
  MaxTrackSizingFunctionInput,
  MeasureArgs,
  MeasureFunction,
  MinTrackSizingFunction,
  MinTrackSizingFunctionInput,
  NodeId,
  Overflow,
  PartialLineInput,
  PartialPointInput,
  PartialRectInput,
  PartialSizeInput,
  PercentInput,
  Point,
  PointInput,
  Position,
  Rect,
  RectInput,
  RepetitionCount,
  RepetitionCountInput,
  RepetitionCountKind,
  Size,
  SizeInput,
  Style,
  StyleInput,
  TextAlign,
  TrackSizingFunction,
  TrackSizingFunctionInput,
  TrackSizingKind,
} from "@taffyjs/node";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? true
    : false;
type Assert<Value extends true> = Value;
type Context = { readonly label: string };
type PublicTypeInventory = [
  EnumValue<typeof api.Display>,
  Display,
  BoxSizing,
  Direction,
  Overflow,
  Float,
  Clear,
  Position,
  TextAlign,
  FlexDirection,
  FlexWrap,
  GridAutoFlow,
  AlignItems,
  AlignContent,
  LengthUnit,
  AvailableSpaceKind,
  GridPlacementKind,
  TrackSizingKind,
  RepetitionCountKind,
  GridTemplateComponentKind,
  DetailedLayoutInfoKind,
  NodeId,
  PointInput<number>,
  PartialPointInput<number>,
  Point<number>,
  SizeInput<number>,
  PartialSizeInput<number>,
  Size<number>,
  RectInput<number>,
  PartialRectInput<number>,
  Rect<number>,
  LineInput<number>,
  PartialLineInput<number>,
  Line<number>,
  LengthInput,
  PercentInput,
  AutoInput,
  LengthPercentageInput,
  LengthPercentageAutoInput,
  DimensionInput,
  LengthPercentage,
  LengthPercentageAuto,
  Dimension,
  AvailableSpaceInput,
  AvailableSpace,
  GridPlacementInput,
  GridPlacement,
  MinTrackSizingFunctionInput,
  MinTrackSizingFunction,
  MaxTrackSizingFunctionInput,
  MaxTrackSizingFunction,
  TrackSizingFunctionInput,
  TrackSizingFunction,
  RepetitionCountInput,
  RepetitionCount,
  GridTemplateRepetitionInput,
  GridTemplateRepetition,
  GridTemplateComponentInput,
  GridTemplateComponent,
  GridTemplateAreasInput,
  GridTemplateAreas,
  GridTemplateAreaInput,
  GridTemplateArea,
  StyleInput,
  Style,
  Layout,
  DetailedLayoutInfo,
  DetailedGridInfo,
  DetailedGridTracksInfo,
  DetailedGridItemInfo,
  MeasureArgs<Context>,
  MeasureFunction<Context>,
  ChildRangeInput,
  ComputeLayoutWithMeasureOptions<Context>,
  ComputeLayoutOptions,
];
type RuntimeExportName =
  | "AlignContent"
  | "AlignItems"
  | "AvailableSpace"
  | "AvailableSpaceKind"
  | "BoxSizing"
  | "Clear"
  | "DetailedLayoutInfoKind"
  | "Dimension"
  | "Direction"
  | "Display"
  | "FlexDirection"
  | "FlexWrap"
  | "Float"
  | "GridAutoFlow"
  | "GridPlacement"
  | "GridPlacementKind"
  | "GridTemplateComponent"
  | "GridTemplateComponentKind"
  | "LengthUnit"
  | "Overflow"
  | "Position"
  | "RepetitionCount"
  | "RepetitionCountKind"
  | "TaffyTree"
  | "TextAlign"
  | "TrackSizingFunction"
  | "TrackSizingKind";

type DeclaredRuntimeExportName = Exclude<keyof typeof api, "phantomMarker">;
type RuntimeExportsAreExact = Assert<Equal<DeclaredRuntimeExportName, RuntimeExportName>>;

type ExpectedRuntimeValues = {
  AlignContent: Readonly<{
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
  AlignItems: Readonly<{
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
  AvailableSpace: Readonly<{
    readonly Definite: (value: number) => { kind: 0; value: number };
    readonly MinContent: Readonly<{ kind: 1 }>;
    readonly MaxContent: Readonly<{ kind: 2 }>;
  }>;
  AvailableSpaceKind: Readonly<{
    readonly Definite: 0;
    readonly MinContent: 1;
    readonly MaxContent: 2;
  }>;
  BoxSizing: Readonly<{ readonly BorderBox: 0; readonly ContentBox: 1 }>;
  Clear: Readonly<{ readonly Left: 0; readonly Right: 1; readonly Both: 2; readonly None: 3 }>;
  DetailedLayoutInfoKind: Readonly<{ readonly None: 0; readonly Grid: 1 }>;
  Dimension: Readonly<{
    readonly Length: (value: number) => { unit: 0; value: number };
    readonly Percent: (value: number) => { unit: 1; value: number };
    readonly Auto: Readonly<{ unit: 2 }>;
  }>;
  Direction: Readonly<{ readonly Ltr: 0; readonly Rtl: 1 }>;
  Display: Readonly<{
    readonly Block: 0;
    readonly FlowRoot: 1;
    readonly Flex: 2;
    readonly Grid: 3;
    readonly None: 4;
  }>;
  FlexDirection: Readonly<{
    readonly Row: 0;
    readonly Column: 1;
    readonly RowReverse: 2;
    readonly ColumnReverse: 3;
  }>;
  FlexWrap: Readonly<{ readonly NoWrap: 0; readonly Wrap: 1; readonly WrapReverse: 2 }>;
  Float: Readonly<{ readonly Left: 0; readonly Right: 1; readonly None: 2 }>;
  GridAutoFlow: Readonly<{
    readonly Row: 0;
    readonly Column: 1;
    readonly RowDense: 2;
    readonly ColumnDense: 3;
  }>;
  GridPlacement: Readonly<{
    readonly Auto: Readonly<{ kind: 0 }>;
    readonly Line: (index: number) => { kind: 1; index: number };
    readonly NamedLine: (name: string, index: number) => { kind: 2; name: string; index: number };
    readonly Span: (span: number) => { kind: 3; span: number };
    readonly NamedSpan: (name: string, span: number) => { kind: 4; name: string; span: number };
  }>;
  GridPlacementKind: Readonly<{
    readonly Auto: 0;
    readonly Line: 1;
    readonly NamedLine: 2;
    readonly Span: 3;
    readonly NamedSpan: 4;
  }>;
  GridTemplateComponent: Readonly<{
    readonly Single: (value: TrackSizingFunctionInput) => {
      kind: 0;
      value: TrackSizingFunctionInput;
    };
    readonly Repeat: (
      count: RepetitionCountInput,
      tracks: TrackSizingFunctionInput[],
      lineNames?: string[][],
    ) => { kind: 1; value: GridTemplateRepetitionInput };
  }>;
  GridTemplateComponentKind: Readonly<{ readonly Single: 0; readonly Repeat: 1 }>;
  LengthUnit: Readonly<{ readonly Length: 0; readonly Percent: 1; readonly Auto: 2 }>;
  Overflow: Readonly<{
    readonly Visible: 0;
    readonly Clip: 1;
    readonly Hidden: 2;
    readonly Scroll: 3;
  }>;
  Position: Readonly<{ readonly Relative: 0; readonly Absolute: 1 }>;
  RepetitionCount: Readonly<{
    readonly Count: (value: number) => { kind: 0; value: number };
    readonly AutoFill: Readonly<{ kind: 1 }>;
    readonly AutoFit: Readonly<{ kind: 2 }>;
  }>;
  RepetitionCountKind: Readonly<{
    readonly Count: 0;
    readonly AutoFill: 1;
    readonly AutoFit: 2;
  }>;
  TextAlign: Readonly<{
    readonly Auto: 0;
    readonly LegacyLeft: 1;
    readonly LegacyRight: 2;
    readonly LegacyCenter: 3;
  }>;
  TrackSizingFunction: Readonly<{
    readonly Length: (value: number) => TrackSizingFunctionInput;
    readonly Percent: (value: number) => TrackSizingFunctionInput;
    readonly Auto: Readonly<{
      readonly min: Readonly<{ kind: 2 }>;
      readonly max: Readonly<{ kind: 2 }>;
    }>;
    readonly MinContent: Readonly<{
      readonly min: Readonly<{ kind: 3 }>;
      readonly max: Readonly<{ kind: 3 }>;
    }>;
    readonly MaxContent: Readonly<{
      readonly min: Readonly<{ kind: 4 }>;
      readonly max: Readonly<{ kind: 4 }>;
    }>;
    readonly FitContent: (value: LengthPercentageInput) => TrackSizingFunctionInput;
    readonly Fr: (value: number) => TrackSizingFunctionInput;
    readonly MinMax: (
      min: MinTrackSizingFunctionInput,
      max: MaxTrackSizingFunctionInput,
    ) => TrackSizingFunctionInput;
  }>;
  TrackSizingKind: Readonly<{
    readonly Length: 0;
    readonly Percent: 1;
    readonly Auto: 2;
    readonly MinContent: 3;
    readonly MaxContent: 4;
    readonly FitContent: 5;
    readonly Fr: 6;
  }>;
};
type ActualRuntimeValues = Pick<typeof api, Exclude<RuntimeExportName, "TaffyTree">>;
type RuntimeValueSignaturesAreExact = [
  Assert<Equal<ActualRuntimeValues["AlignContent"], ExpectedRuntimeValues["AlignContent"]>>,
  Assert<Equal<ActualRuntimeValues["AlignItems"], ExpectedRuntimeValues["AlignItems"]>>,
  Assert<Equal<ActualRuntimeValues["AvailableSpace"], ExpectedRuntimeValues["AvailableSpace"]>>,
  Assert<
    Equal<ActualRuntimeValues["AvailableSpaceKind"], ExpectedRuntimeValues["AvailableSpaceKind"]>
  >,
  Assert<Equal<ActualRuntimeValues["BoxSizing"], ExpectedRuntimeValues["BoxSizing"]>>,
  Assert<Equal<ActualRuntimeValues["Clear"], ExpectedRuntimeValues["Clear"]>>,
  Assert<
    Equal<
      ActualRuntimeValues["DetailedLayoutInfoKind"],
      ExpectedRuntimeValues["DetailedLayoutInfoKind"]
    >
  >,
  Assert<Equal<ActualRuntimeValues["Dimension"], ExpectedRuntimeValues["Dimension"]>>,
  Assert<Equal<ActualRuntimeValues["Direction"], ExpectedRuntimeValues["Direction"]>>,
  Assert<Equal<ActualRuntimeValues["Display"], ExpectedRuntimeValues["Display"]>>,
  Assert<Equal<ActualRuntimeValues["FlexDirection"], ExpectedRuntimeValues["FlexDirection"]>>,
  Assert<Equal<ActualRuntimeValues["FlexWrap"], ExpectedRuntimeValues["FlexWrap"]>>,
  Assert<Equal<ActualRuntimeValues["Float"], ExpectedRuntimeValues["Float"]>>,
  Assert<Equal<ActualRuntimeValues["GridAutoFlow"], ExpectedRuntimeValues["GridAutoFlow"]>>,
  Assert<Equal<ActualRuntimeValues["GridPlacement"], ExpectedRuntimeValues["GridPlacement"]>>,
  Assert<
    Equal<ActualRuntimeValues["GridPlacementKind"], ExpectedRuntimeValues["GridPlacementKind"]>
  >,
  Assert<
    Equal<
      ActualRuntimeValues["GridTemplateComponent"],
      ExpectedRuntimeValues["GridTemplateComponent"]
    >
  >,
  Assert<
    Equal<
      ActualRuntimeValues["GridTemplateComponentKind"],
      ExpectedRuntimeValues["GridTemplateComponentKind"]
    >
  >,
  Assert<Equal<ActualRuntimeValues["LengthUnit"], ExpectedRuntimeValues["LengthUnit"]>>,
  Assert<Equal<ActualRuntimeValues["Overflow"], ExpectedRuntimeValues["Overflow"]>>,
  Assert<Equal<ActualRuntimeValues["Position"], ExpectedRuntimeValues["Position"]>>,
  Assert<Equal<ActualRuntimeValues["RepetitionCount"], ExpectedRuntimeValues["RepetitionCount"]>>,
  Assert<
    Equal<ActualRuntimeValues["RepetitionCountKind"], ExpectedRuntimeValues["RepetitionCountKind"]>
  >,
  Assert<Equal<ActualRuntimeValues["TextAlign"], ExpectedRuntimeValues["TextAlign"]>>,
  Assert<
    Equal<ActualRuntimeValues["TrackSizingFunction"], ExpectedRuntimeValues["TrackSizingFunction"]>
  >,
  Assert<Equal<ActualRuntimeValues["TrackSizingKind"], ExpectedRuntimeValues["TrackSizingKind"]>>,
];

type ExpectedTree<TContext> = {
  enableRounding(): void;
  disableRounding(): void;
  newLeaf(style: StyleInput): NodeId;
  newLeafWithContext(style: StyleInput, context: TContext | undefined): NodeId;
  newWithChildren(style: StyleInput, children: readonly NodeId[]): NodeId;
  clear(): void;
  remove(node: NodeId): void;
  setNodeContext(node: NodeId, context: TContext | undefined): void;
  getNodeContext(node: NodeId): TContext | undefined;
  addChild(parent: NodeId, child: NodeId): void;
  insertChildAtIndex(parent: NodeId, index: number, child: NodeId): void;
  setChildren(parent: NodeId, children: readonly NodeId[]): void;
  removeChild(parent: NodeId, child: NodeId): void;
  removeChildAtIndex(parent: NodeId, index: number): NodeId;
  removeChildrenRange(parent: NodeId, range: ChildRangeInput): void;
  replaceChildAtIndex(parent: NodeId, index: number, newChild: NodeId): NodeId;
  getChildAtIndex(parent: NodeId, index: number): NodeId;
  getChildCount(parent: NodeId): number;
  getNodeCount(): number;
  getParent(node: NodeId): NodeId | null;
  getChildren(parent: NodeId): readonly NodeId[];
  setStyle(node: NodeId, style: StyleInput): void;
  getStyle(node: NodeId): Style;
  getLayout(node: NodeId): Layout;
  getUnroundedLayout(node: NodeId): Layout;
  getDetailedLayoutInfo(node: NodeId): DetailedLayoutInfo;
  markDirty(node: NodeId): void;
  isDirty(node: NodeId): boolean;
  computeLayout(options: ComputeLayoutOptions): void;
  computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void;
};

declare const actualTree: api.TaffyTree<Context>;
declare const expectedTree: ExpectedTree<Context>;
const expectedFromActual: ExpectedTree<Context> = actualTree;
const actualFromExpected: api.TaffyTree<Context> = expectedTree;
const constructorSignature: new <TContext = unknown>() => api.TaffyTree<TContext> = api.TaffyTree;

const measure: MeasureFunction<Context> = () => ({ width: 1, height: 2 });
const space: AvailableSpaceInput = api.AvailableSpace.MaxContent;

void [expectedFromActual, actualFromExpected, constructorSignature, measure, space];
void (0 as unknown as PublicTypeInventory);
void (0 as unknown as RuntimeExportsAreExact);
void (0 as unknown as RuntimeValueSignaturesAreExact);
