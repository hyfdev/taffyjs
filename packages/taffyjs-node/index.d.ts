declare const phantomMarker: unique symbol;

/** Describes the public EnumValue contract used to create or inspect Taffy layout data. */
export type EnumValue<Family extends Readonly<Record<string, number>>> = Family[keyof Family];

/** Describes the public Display contract used to create or inspect Taffy layout data. */
export declare const Display: Readonly<{
  /** Describes the Block member carried by this public TaffyJS value. */ readonly Block: 0;
  /** Describes the FlowRoot member carried by this public TaffyJS value. */ readonly FlowRoot: 1;
  /** Describes the Flex member carried by this public TaffyJS value. */ readonly Flex: 2;
  /** Describes the Grid member carried by this public TaffyJS value. */ readonly Grid: 3;
  /** Describes the None member carried by this public TaffyJS value. */ readonly None: 4;
}>;

/** Describes the public Display contract used to create or inspect Taffy layout data. */
export type Display = EnumValue<typeof Display>;

/** Describes the public BoxSizing contract used to create or inspect Taffy layout data. */
export declare const BoxSizing: Readonly<{
  /** Describes the BorderBox member carried by this public TaffyJS value. */ readonly BorderBox: 0;
  /** Describes the ContentBox member carried by this public TaffyJS value. */ readonly ContentBox: 1;
}>;

/** Describes the public BoxSizing contract used to create or inspect Taffy layout data. */
export type BoxSizing = EnumValue<typeof BoxSizing>;

/** Describes the public Direction contract used to create or inspect Taffy layout data. */
export declare const Direction: Readonly<{
  /** Describes the Ltr member carried by this public TaffyJS value. */ readonly Ltr: 0;
  /** Describes the Rtl member carried by this public TaffyJS value. */ readonly Rtl: 1;
}>;

/** Describes the public Direction contract used to create or inspect Taffy layout data. */
export type Direction = EnumValue<typeof Direction>;

/** Describes the public Overflow contract used to create or inspect Taffy layout data. */
export declare const Overflow: Readonly<{
  /** Describes the Visible member carried by this public TaffyJS value. */ readonly Visible: 0;
  /** Describes the Clip member carried by this public TaffyJS value. */ readonly Clip: 1;
  /** Describes the Hidden member carried by this public TaffyJS value. */ readonly Hidden: 2;
  /** Describes the Scroll member carried by this public TaffyJS value. */ readonly Scroll: 3;
}>;

/** Describes the public Overflow contract used to create or inspect Taffy layout data. */
export type Overflow = EnumValue<typeof Overflow>;

/** Describes the public Float contract used to create or inspect Taffy layout data. */
export declare const Float: Readonly<{
  /** Describes the Left member carried by this public TaffyJS value. */ readonly Left: 0;
  /** Describes the Right member carried by this public TaffyJS value. */ readonly Right: 1;
  /** Describes the None member carried by this public TaffyJS value. */ readonly None: 2;
}>;

/** Describes the public Float contract used to create or inspect Taffy layout data. */
export type Float = EnumValue<typeof Float>;

/** Describes the public Clear contract used to create or inspect Taffy layout data. */
export declare const Clear: Readonly<{
  /** Describes the Left member carried by this public TaffyJS value. */ readonly Left: 0;
  /** Describes the Right member carried by this public TaffyJS value. */ readonly Right: 1;
  /** Describes the Both member carried by this public TaffyJS value. */ readonly Both: 2;
  /** Describes the None member carried by this public TaffyJS value. */ readonly None: 3;
}>;

/** Describes the public Clear contract used to create or inspect Taffy layout data. */
export type Clear = EnumValue<typeof Clear>;

/** Describes the public Position contract used to create or inspect Taffy layout data. */
export declare const Position: Readonly<{
  /** Describes the Relative member carried by this public TaffyJS value. */ readonly Relative: 0;
  /** Describes the Absolute member carried by this public TaffyJS value. */ readonly Absolute: 1;
}>;

/** Describes the public Position contract used to create or inspect Taffy layout data. */
export type Position = EnumValue<typeof Position>;

/** Describes the public TextAlign contract used to create or inspect Taffy layout data. */
export declare const TextAlign: Readonly<{
  /** Describes the Auto member carried by this public TaffyJS value. */ readonly Auto: 0;
  /** Describes the LegacyLeft member carried by this public TaffyJS value. */ readonly LegacyLeft: 1;
  /** Describes the LegacyRight member carried by this public TaffyJS value. */ readonly LegacyRight: 2;
  /** Describes the LegacyCenter member carried by this public TaffyJS value. */ readonly LegacyCenter: 3;
}>;

/** Describes the public TextAlign contract used to create or inspect Taffy layout data. */
export type TextAlign = EnumValue<typeof TextAlign>;

/** Describes the public FlexDirection contract used to create or inspect Taffy layout data. */
export declare const FlexDirection: Readonly<{
  /** Describes the Row member carried by this public TaffyJS value. */ readonly Row: 0;
  /** Describes the Column member carried by this public TaffyJS value. */ readonly Column: 1;
  /** Describes the RowReverse member carried by this public TaffyJS value. */ readonly RowReverse: 2;
  /** Describes the ColumnReverse member carried by this public TaffyJS value. */ readonly ColumnReverse: 3;
}>;

/** Describes the public FlexDirection contract used to create or inspect Taffy layout data. */
export type FlexDirection = EnumValue<typeof FlexDirection>;

/** Describes the public FlexWrap contract used to create or inspect Taffy layout data. */
export declare const FlexWrap: Readonly<{
  /** Describes the NoWrap member carried by this public TaffyJS value. */ readonly NoWrap: 0;
  /** Describes the Wrap member carried by this public TaffyJS value. */ readonly Wrap: 1;
  /** Describes the WrapReverse member carried by this public TaffyJS value. */ readonly WrapReverse: 2;
}>;

/** Describes the public FlexWrap contract used to create or inspect Taffy layout data. */
export type FlexWrap = EnumValue<typeof FlexWrap>;

/** Describes the public GridAutoFlow contract used to create or inspect Taffy layout data. */
export declare const GridAutoFlow: Readonly<{
  /** Describes the Row member carried by this public TaffyJS value. */ readonly Row: 0;
  /** Describes the Column member carried by this public TaffyJS value. */ readonly Column: 1;
  /** Describes the RowDense member carried by this public TaffyJS value. */ readonly RowDense: 2;
  /** Describes the ColumnDense member carried by this public TaffyJS value. */ readonly ColumnDense: 3;
}>;

/** Describes the public GridAutoFlow contract used to create or inspect Taffy layout data. */
export type GridAutoFlow = EnumValue<typeof GridAutoFlow>;

/** Describes the public AlignItems contract used to create or inspect Taffy layout data. */
export declare const AlignItems: Readonly<{
  /** Describes the Start member carried by this public TaffyJS value. */ readonly Start: 0;
  /** Describes the End member carried by this public TaffyJS value. */ readonly End: 1;
  /** Describes the FlexStart member carried by this public TaffyJS value. */ readonly FlexStart: 2;
  /** Describes the FlexEnd member carried by this public TaffyJS value. */ readonly FlexEnd: 3;
  /** Describes the SelfStart member carried by this public TaffyJS value. */ readonly SelfStart: 4;
  /** Describes the SelfEnd member carried by this public TaffyJS value. */ readonly SelfEnd: 5;
  /** Describes the Center member carried by this public TaffyJS value. */ readonly Center: 6;
  /** Describes the Baseline member carried by this public TaffyJS value. */ readonly Baseline: 7;
  /** Describes the Stretch member carried by this public TaffyJS value. */ readonly Stretch: 8;
  /** Describes the SafeStart member carried by this public TaffyJS value. */ readonly SafeStart: 9;
  /** Describes the SafeEnd member carried by this public TaffyJS value. */ readonly SafeEnd: 10;
  /** Describes the SafeFlexStart member carried by this public TaffyJS value. */ readonly SafeFlexStart: 11;
  /** Describes the SafeFlexEnd member carried by this public TaffyJS value. */ readonly SafeFlexEnd: 12;
  /** Describes the SafeSelfStart member carried by this public TaffyJS value. */ readonly SafeSelfStart: 13;
  /** Describes the SafeSelfEnd member carried by this public TaffyJS value. */ readonly SafeSelfEnd: 14;
  /** Describes the SafeCenter member carried by this public TaffyJS value. */ readonly SafeCenter: 15;
}>;

/** Describes the public AlignItems contract used to create or inspect Taffy layout data. */
export type AlignItems = EnumValue<typeof AlignItems>;

/** Describes the public AlignContent contract used to create or inspect Taffy layout data. */
export declare const AlignContent: Readonly<{
  /** Describes the Start member carried by this public TaffyJS value. */ readonly Start: 0;
  /** Describes the End member carried by this public TaffyJS value. */ readonly End: 1;
  /** Describes the FlexStart member carried by this public TaffyJS value. */ readonly FlexStart: 2;
  /** Describes the FlexEnd member carried by this public TaffyJS value. */ readonly FlexEnd: 3;
  /** Describes the Center member carried by this public TaffyJS value. */ readonly Center: 4;
  /** Describes the Stretch member carried by this public TaffyJS value. */ readonly Stretch: 5;
  /** Describes the SpaceBetween member carried by this public TaffyJS value. */ readonly SpaceBetween: 6;
  /** Describes the SpaceEvenly member carried by this public TaffyJS value. */ readonly SpaceEvenly: 7;
  /** Describes the SpaceAround member carried by this public TaffyJS value. */ readonly SpaceAround: 8;
  /** Describes the SafeStart member carried by this public TaffyJS value. */ readonly SafeStart: 9;
  /** Describes the SafeEnd member carried by this public TaffyJS value. */ readonly SafeEnd: 10;
  /** Describes the SafeFlexStart member carried by this public TaffyJS value. */ readonly SafeFlexStart: 11;
  /** Describes the SafeFlexEnd member carried by this public TaffyJS value. */ readonly SafeFlexEnd: 12;
  /** Describes the SafeCenter member carried by this public TaffyJS value. */ readonly SafeCenter: 13;
}>;

/** Describes the public AlignContent contract used to create or inspect Taffy layout data. */
export type AlignContent = EnumValue<typeof AlignContent>;

/** Describes the public LengthUnit contract used to create or inspect Taffy layout data. */
export declare const LengthUnit: Readonly<{
  /** Describes the Length member carried by this public TaffyJS value. */ readonly Length: 0;
  /** Describes the Percent member carried by this public TaffyJS value. */ readonly Percent: 1;
  /** Describes the Auto member carried by this public TaffyJS value. */ readonly Auto: 2;
}>;

/** Describes the public LengthUnit contract used to create or inspect Taffy layout data. */
export type LengthUnit = EnumValue<typeof LengthUnit>;

/** Describes the public AvailableSpaceKind contract used to create or inspect Taffy layout data. */
export declare const AvailableSpaceKind: Readonly<{
  /** Describes the Definite member carried by this public TaffyJS value. */ readonly Definite: 0;
  /** Describes the MinContent member carried by this public TaffyJS value. */ readonly MinContent: 1;
  /** Describes the MaxContent member carried by this public TaffyJS value. */ readonly MaxContent: 2;
}>;

/** Describes the public AvailableSpaceKind contract used to create or inspect Taffy layout data. */
export type AvailableSpaceKind = EnumValue<typeof AvailableSpaceKind>;

/** Describes the public GridPlacementKind contract used to create or inspect Taffy layout data. */
export declare const GridPlacementKind: Readonly<{
  /** Describes the Auto member carried by this public TaffyJS value. */ readonly Auto: 0;
  /** Describes the Line member carried by this public TaffyJS value. */ readonly Line: 1;
  /** Describes the NamedLine member carried by this public TaffyJS value. */ readonly NamedLine: 2;
  /** Describes the Span member carried by this public TaffyJS value. */ readonly Span: 3;
  /** Describes the NamedSpan member carried by this public TaffyJS value. */ readonly NamedSpan: 4;
}>;

/** Describes the public GridPlacementKind contract used to create or inspect Taffy layout data. */
export type GridPlacementKind = EnumValue<typeof GridPlacementKind>;

/** Describes the public TrackSizingKind contract used to create or inspect Taffy layout data. */
export declare const TrackSizingKind: Readonly<{
  /** Describes the Length member carried by this public TaffyJS value. */ readonly Length: 0;
  /** Describes the Percent member carried by this public TaffyJS value. */ readonly Percent: 1;
  /** Describes the Auto member carried by this public TaffyJS value. */ readonly Auto: 2;
  /** Describes the MinContent member carried by this public TaffyJS value. */ readonly MinContent: 3;
  /** Describes the MaxContent member carried by this public TaffyJS value. */ readonly MaxContent: 4;
  /** Describes the FitContent member carried by this public TaffyJS value. */ readonly FitContent: 5;
  /** Describes the Fr member carried by this public TaffyJS value. */ readonly Fr: 6;
}>;

/** Describes the public TrackSizingKind contract used to create or inspect Taffy layout data. */
export type TrackSizingKind = EnumValue<typeof TrackSizingKind>;

/** Describes the public RepetitionCountKind contract used to create or inspect Taffy layout data. */
export declare const RepetitionCountKind: Readonly<{
  /** Describes the Count member carried by this public TaffyJS value. */ readonly Count: 0;
  /** Describes the AutoFill member carried by this public TaffyJS value. */ readonly AutoFill: 1;
  /** Describes the AutoFit member carried by this public TaffyJS value. */ readonly AutoFit: 2;
}>;

/** Describes the public RepetitionCountKind contract used to create or inspect Taffy layout data. */
export type RepetitionCountKind = EnumValue<typeof RepetitionCountKind>;

/** Describes the public GridTemplateComponentKind contract used to create or inspect Taffy layout data. */
export declare const GridTemplateComponentKind: Readonly<{
  /** Describes the Single member carried by this public TaffyJS value. */ readonly Single: 0;
  /** Describes the Repeat member carried by this public TaffyJS value. */ readonly Repeat: 1;
}>;

/** Describes the public GridTemplateComponentKind contract used to create or inspect Taffy layout data. */
export type GridTemplateComponentKind = EnumValue<typeof GridTemplateComponentKind>;

/** Describes the public DetailedLayoutInfoKind contract used to create or inspect Taffy layout data. */
export declare const DetailedLayoutInfoKind: Readonly<{
  /** Describes the None member carried by this public TaffyJS value. */ readonly None: 0;
  /** Describes the Grid member carried by this public TaffyJS value. */ readonly Grid: 1;
}>;

/** Describes the public DetailedLayoutInfoKind contract used to create or inspect Taffy layout data. */
export type DetailedLayoutInfoKind = EnumValue<typeof DetailedLayoutInfoKind>;

/** Describes the public NodeId contract used to create or inspect Taffy layout data. */
export type NodeId = bigint & {
  /** Describes the [ member carried by this public TaffyJS value. */ readonly [phantomMarker]: never;
};

/** Describes the public PointInput contract used to create or inspect Taffy layout data. */
export interface PointInput<T> {
  /** Describes the x member carried by this public TaffyJS value. */ x: T;
  /** Describes the y member carried by this public TaffyJS value. */ y: T;
}

/** Describes the public PartialPointInput contract used to create or inspect Taffy layout data. */
export interface PartialPointInput<T> {
  /** Describes the x member carried by this public TaffyJS value. */ x?: T | undefined;
  /** Describes the y member carried by this public TaffyJS value. */ y?: T | undefined;
}

/** Describes the public Point contract used to create or inspect Taffy layout data. */
export interface Point<T> {
  /** Describes the x member carried by this public TaffyJS value. */ readonly x: T;
  /** Describes the y member carried by this public TaffyJS value. */ readonly y: T;
}

/** Describes the public SizeInput contract used to create or inspect Taffy layout data. */
export interface SizeInput<T> {
  /** Describes the width member carried by this public TaffyJS value. */ width: T;
  /** Describes the height member carried by this public TaffyJS value. */ height: T;
}

/** Describes the public PartialSizeInput contract used to create or inspect Taffy layout data. */
export interface PartialSizeInput<T> {
  /** Describes the width member carried by this public TaffyJS value. */ width?: T | undefined;
  /** Describes the height member carried by this public TaffyJS value. */ height?: T | undefined;
}

/** Describes the public Size contract used to create or inspect Taffy layout data. */
export interface Size<T> {
  /** Describes the width member carried by this public TaffyJS value. */ readonly width: T;
  /** Describes the height member carried by this public TaffyJS value. */ readonly height: T;
}

/** Describes the public RectInput contract used to create or inspect Taffy layout data. */
export interface RectInput<T> {
  /** Describes the left member carried by this public TaffyJS value. */ left: T;
  /** Describes the right member carried by this public TaffyJS value. */ right: T;
  /** Describes the top member carried by this public TaffyJS value. */ top: T;
  /** Describes the bottom member carried by this public TaffyJS value. */ bottom: T;
}

/** Describes the public PartialRectInput contract used to create or inspect Taffy layout data. */
export interface PartialRectInput<T> {
  /** Describes the left member carried by this public TaffyJS value. */ left?: T | undefined;
  /** Describes the right member carried by this public TaffyJS value. */ right?: T | undefined;
  /** Describes the top member carried by this public TaffyJS value. */ top?: T | undefined;
  /** Describes the bottom member carried by this public TaffyJS value. */ bottom?: T | undefined;
}

/** Describes the public Rect contract used to create or inspect Taffy layout data. */
export interface Rect<T> {
  /** Describes the left member carried by this public TaffyJS value. */ readonly left: T;
  /** Describes the right member carried by this public TaffyJS value. */ readonly right: T;
  /** Describes the top member carried by this public TaffyJS value. */ readonly top: T;
  /** Describes the bottom member carried by this public TaffyJS value. */ readonly bottom: T;
}

/** Describes the public LineInput contract used to create or inspect Taffy layout data. */
export interface LineInput<T> {
  /** Describes the start member carried by this public TaffyJS value. */ start: T;
  /** Describes the end member carried by this public TaffyJS value. */ end: T;
}

/** Describes the public PartialLineInput contract used to create or inspect Taffy layout data. */
export interface PartialLineInput<T> {
  /** Describes the start member carried by this public TaffyJS value. */ start?: T | undefined;
  /** Describes the end member carried by this public TaffyJS value. */ end?: T | undefined;
}

/** Describes the public Line contract used to create or inspect Taffy layout data. */
export interface Line<T> {
  /** Describes the start member carried by this public TaffyJS value. */ readonly start: T;
  /** Describes the end member carried by this public TaffyJS value. */ readonly end: T;
}

/** Describes the public LengthInput contract used to create or inspect Taffy layout data. */
export type LengthInput = {
  /** Describes the unit member carried by this public TaffyJS value. */ unit: typeof LengthUnit.Length;
  /** Describes the value member carried by this public TaffyJS value. */ value: number;
};

/** Describes the public PercentInput contract used to create or inspect Taffy layout data. */
export type PercentInput = {
  /** Describes the unit member carried by this public TaffyJS value. */ unit: typeof LengthUnit.Percent;
  /** Describes the value member carried by this public TaffyJS value. */ value: number;
};

/** Describes the public AutoInput contract used to create or inspect Taffy layout data. */
export type AutoInput = {
  /** Describes the unit member carried by this public TaffyJS value. */ unit: typeof LengthUnit.Auto;
};

/** Describes the public LengthPercentageInput contract used to create or inspect Taffy layout data. */
export type LengthPercentageInput = LengthInput | PercentInput;

/** Describes the public LengthPercentageAutoInput contract used to create or inspect Taffy layout data. */
export type LengthPercentageAutoInput = LengthInput | PercentInput | AutoInput;

/** Describes the public DimensionInput contract used to create or inspect Taffy layout data. */
export type DimensionInput = LengthPercentageAutoInput;

/** Describes the public LengthPercentage contract used to create or inspect Taffy layout data. */
export type LengthPercentage = Readonly<LengthInput> | Readonly<PercentInput>;

/** Describes the public LengthPercentageAuto contract used to create or inspect Taffy layout data. */
export type LengthPercentageAuto =
  | Readonly<LengthInput>
  | Readonly<PercentInput>
  | Readonly<AutoInput>;

/** Describes the public Dimension contract used to create or inspect Taffy layout data. */
export type Dimension = LengthPercentageAuto;

/** Describes the public Dimension contract used to create or inspect Taffy layout data. */
export declare const Dimension: Readonly<{
  /** Describes the Length member carried by this public TaffyJS value. */ readonly Length: (
    value: number,
  ) => LengthInput;
  /** Describes the Percent member carried by this public TaffyJS value. */ readonly Percent: (
    value: number,
  ) => PercentInput;
  /** Describes the Auto member carried by this public TaffyJS value. */ readonly Auto: Readonly<AutoInput>;
}>;

/** Describes the public AvailableSpaceInput contract used to create or inspect Taffy layout data. */
export type AvailableSpaceInput =
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof AvailableSpaceKind.Definite;
      /** Describes the value member carried by this public TaffyJS value. */ value: number;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof AvailableSpaceKind.MinContent;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof AvailableSpaceKind.MaxContent;
    };

/** Describes the public AvailableSpace contract used to create or inspect Taffy layout data. */
export type AvailableSpace =
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof AvailableSpaceKind.Definite;
      /** Describes the value member carried by this public TaffyJS value. */ value: number;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof AvailableSpaceKind.MinContent;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof AvailableSpaceKind.MaxContent;
    }>;

/** Describes the public AvailableSpace contract used to create or inspect Taffy layout data. */
export declare const AvailableSpace: Readonly<{
  /** Describes the Definite member carried by this public TaffyJS value. */ readonly Definite: (
    value: number,
  ) => {
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof AvailableSpaceKind.Definite;
    /** Describes the value member carried by this public TaffyJS value. */ value: number;
  };
  /** Describes the MinContent member carried by this public TaffyJS value. */ readonly MinContent: Readonly<{
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof AvailableSpaceKind.MinContent;
  }>;
  /** Describes the MaxContent member carried by this public TaffyJS value. */ readonly MaxContent: Readonly<{
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof AvailableSpaceKind.MaxContent;
  }>;
}>;

/** Describes the public GridPlacementInput contract used to create or inspect Taffy layout data. */
export type GridPlacementInput =
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.Auto;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.Line;
      /** Describes the index member carried by this public TaffyJS value. */ index: number;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.NamedLine;
      /** Describes the name member carried by this public TaffyJS value. */ name: string;
      /** Describes the index member carried by this public TaffyJS value. */ index: number;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.Span;
      /** Describes the span member carried by this public TaffyJS value. */ span: number;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.NamedSpan;
      /** Describes the name member carried by this public TaffyJS value. */ name: string;
      /** Describes the span member carried by this public TaffyJS value. */ span: number;
    };

/** Describes the public GridPlacement contract used to create or inspect Taffy layout data. */
export type GridPlacement =
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.Auto;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.Line;
      /** Describes the index member carried by this public TaffyJS value. */ index: number;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.NamedLine;
      /** Describes the name member carried by this public TaffyJS value. */ name: string;
      /** Describes the index member carried by this public TaffyJS value. */ index: number;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.Span;
      /** Describes the span member carried by this public TaffyJS value. */ span: number;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.NamedSpan;
      /** Describes the name member carried by this public TaffyJS value. */ name: string;
      /** Describes the span member carried by this public TaffyJS value. */ span: number;
    }>;

/** Describes the public MinTrackSizingFunctionInput contract used to create or inspect Taffy layout data. */
export type MinTrackSizingFunctionInput =
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.Length;
      /** Describes the value member carried by this public TaffyJS value. */ value: number;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.Percent;
      /** Describes the value member carried by this public TaffyJS value. */ value: number;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.Auto;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.MinContent;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.MaxContent;
    };

/** Describes the public MinTrackSizingFunction contract used to create or inspect Taffy layout data. */
export type MinTrackSizingFunction =
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.Length;
      /** Describes the value member carried by this public TaffyJS value. */ value: number;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.Percent;
      /** Describes the value member carried by this public TaffyJS value. */ value: number;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.Auto;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.MinContent;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.MaxContent;
    }>;

/** Describes the public MaxTrackSizingFunctionInput contract used to create or inspect Taffy layout data. */
export type MaxTrackSizingFunctionInput =
  | MinTrackSizingFunctionInput
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.FitContent;
      /** Describes the value member carried by this public TaffyJS value. */ value: LengthPercentageInput;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.Fr;
      /** Describes the value member carried by this public TaffyJS value. */ value: number;
    };

/** Describes the public MaxTrackSizingFunction contract used to create or inspect Taffy layout data. */
export type MaxTrackSizingFunction =
  | MinTrackSizingFunction
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.FitContent;
      /** Describes the value member carried by this public TaffyJS value. */ value: LengthPercentage;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.Fr;
      /** Describes the value member carried by this public TaffyJS value. */ value: number;
    }>;

/** Describes the public TrackSizingFunctionInput contract used to create or inspect Taffy layout data. */
export interface TrackSizingFunctionInput {
  /** Describes the min member carried by this public TaffyJS value. */ min: MinTrackSizingFunctionInput;
  /** Describes the max member carried by this public TaffyJS value. */ max: MaxTrackSizingFunctionInput;
}

/** Describes the public TrackSizingFunction contract used to create or inspect Taffy layout data. */
export interface TrackSizingFunction {
  /** Describes the min member carried by this public TaffyJS value. */ readonly min: MinTrackSizingFunction;
  /** Describes the max member carried by this public TaffyJS value. */ readonly max: MaxTrackSizingFunction;
}

/** Describes the public RepetitionCountInput contract used to create or inspect Taffy layout data. */
export type RepetitionCountInput =
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof RepetitionCountKind.Count;
      /** Describes the value member carried by this public TaffyJS value. */ value: number;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof RepetitionCountKind.AutoFill;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof RepetitionCountKind.AutoFit;
    };

/** Describes the public RepetitionCount contract used to create or inspect Taffy layout data. */
export type RepetitionCount =
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof RepetitionCountKind.Count;
      /** Describes the value member carried by this public TaffyJS value. */ value: number;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof RepetitionCountKind.AutoFill;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof RepetitionCountKind.AutoFit;
    }>;

/** Describes the public GridTemplateRepetitionInput contract used to create or inspect Taffy layout data. */
export interface GridTemplateRepetitionInput {
  /** Describes the count member carried by this public TaffyJS value. */ count: RepetitionCountInput;
  /** Describes the tracks member carried by this public TaffyJS value. */ tracks: TrackSizingFunctionInput[];
  /** Describes the lineNames member carried by this public TaffyJS value. */ lineNames: string[][];
}

/** Describes the public GridTemplateRepetition contract used to create or inspect Taffy layout data. */
export interface GridTemplateRepetition {
  /** Describes the count member carried by this public TaffyJS value. */ readonly count: RepetitionCount;
  /** Describes the tracks member carried by this public TaffyJS value. */ readonly tracks: readonly TrackSizingFunction[];
  /** Describes the lineNames member carried by this public TaffyJS value. */ readonly lineNames: readonly (readonly string[])[];
}

/** Describes the public GridTemplateComponentInput contract used to create or inspect Taffy layout data. */
export type GridTemplateComponentInput =
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridTemplateComponentKind.Single;
      /** Describes the value member carried by this public TaffyJS value. */ value: TrackSizingFunctionInput;
    }
  | {
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridTemplateComponentKind.Repeat;
      /** Describes the value member carried by this public TaffyJS value. */ value: GridTemplateRepetitionInput;
    };

/** Describes the public GridTemplateComponent contract used to create or inspect Taffy layout data. */
export type GridTemplateComponent =
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridTemplateComponentKind.Single;
      /** Describes the value member carried by this public TaffyJS value. */ value: TrackSizingFunction;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridTemplateComponentKind.Repeat;
      /** Describes the value member carried by this public TaffyJS value. */ value: GridTemplateRepetition;
    }>;

/** Describes the public GridTemplateAreasInput contract used to create or inspect Taffy layout data. */
export interface GridTemplateAreasInput {
  /** Describes the areas member carried by this public TaffyJS value. */ areas: GridTemplateAreaInput[];
  /** Describes the rowCount member carried by this public TaffyJS value. */ rowCount: number;
  /** Describes the columnCount member carried by this public TaffyJS value. */ columnCount: number;
}

/** Describes the public GridTemplateAreas contract used to create or inspect Taffy layout data. */
export interface GridTemplateAreas {
  /** Describes the areas member carried by this public TaffyJS value. */ readonly areas: readonly GridTemplateArea[];
  /** Describes the rowCount member carried by this public TaffyJS value. */ readonly rowCount: number;
  /** Describes the columnCount member carried by this public TaffyJS value. */ readonly columnCount: number;
}

/** Describes the public GridTemplateAreaInput contract used to create or inspect Taffy layout data. */
export interface GridTemplateAreaInput {
  /** Describes the name member carried by this public TaffyJS value. */ name: string;
  /** Describes the rowStart member carried by this public TaffyJS value. */ rowStart: number;
  /** Describes the rowEnd member carried by this public TaffyJS value. */ rowEnd: number;
  /** Describes the columnStart member carried by this public TaffyJS value. */ columnStart: number;
  /** Describes the columnEnd member carried by this public TaffyJS value. */ columnEnd: number;
}

/** Describes the public GridTemplateArea contract used to create or inspect Taffy layout data. */
export interface GridTemplateArea {
  /** Describes the name member carried by this public TaffyJS value. */ readonly name: string;
  /** Describes the rowStart member carried by this public TaffyJS value. */ readonly rowStart: number;
  /** Describes the rowEnd member carried by this public TaffyJS value. */ readonly rowEnd: number;
  /** Describes the columnStart member carried by this public TaffyJS value. */ readonly columnStart: number;
  /** Describes the columnEnd member carried by this public TaffyJS value. */ readonly columnEnd: number;
}

/** Describes the public GridPlacement contract used to create or inspect Taffy layout data. */
export declare const GridPlacement: Readonly<{
  /** Describes the Auto member carried by this public TaffyJS value. */ readonly Auto: Readonly<{
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.Auto;
  }>;
  /** Describes the Line member carried by this public TaffyJS value. */ readonly Line: (
    index: number,
  ) => {
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.Line;
    /** Describes the index member carried by this public TaffyJS value. */ index: number;
  };
  /** Describes the NamedLine member carried by this public TaffyJS value. */ readonly NamedLine: (
    name: string,
    index: number,
  ) => {
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.NamedLine;
    /** Describes the name member carried by this public TaffyJS value. */ name: string;
    /** Describes the index member carried by this public TaffyJS value. */ index: number;
  };
  /** Describes the Span member carried by this public TaffyJS value. */ readonly Span: (
    span: number,
  ) => {
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.Span;
    /** Describes the span member carried by this public TaffyJS value. */ span: number;
  };
  /** Describes the NamedSpan member carried by this public TaffyJS value. */ readonly NamedSpan: (
    name: string,
    span: number,
  ) => {
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridPlacementKind.NamedSpan;
    /** Describes the name member carried by this public TaffyJS value. */ name: string;
    /** Describes the span member carried by this public TaffyJS value. */ span: number;
  };
}>;

/** Describes the public TrackSizingFunction contract used to create or inspect Taffy layout data. */
export declare const TrackSizingFunction: Readonly<{
  /** Describes the Length member carried by this public TaffyJS value. */ readonly Length: (
    value: number,
  ) => TrackSizingFunctionInput;
  /** Describes the Percent member carried by this public TaffyJS value. */ readonly Percent: (
    value: number,
  ) => TrackSizingFunctionInput;
  /** Describes the Auto member carried by this public TaffyJS value. */ readonly Auto: Readonly<{
    /** Describes the min member carried by this public TaffyJS value. */ readonly min: Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.Auto;
    }>;
    /** Describes the max member carried by this public TaffyJS value. */ readonly max: Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.Auto;
    }>;
  }>;
  /** Describes the MinContent member carried by this public TaffyJS value. */ readonly MinContent: Readonly<{
    /** Describes the min member carried by this public TaffyJS value. */ readonly min: Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.MinContent;
    }>;
    /** Describes the max member carried by this public TaffyJS value. */ readonly max: Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.MinContent;
    }>;
  }>;
  /** Describes the MaxContent member carried by this public TaffyJS value. */ readonly MaxContent: Readonly<{
    /** Describes the min member carried by this public TaffyJS value. */ readonly min: Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.MaxContent;
    }>;
    /** Describes the max member carried by this public TaffyJS value. */ readonly max: Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof TrackSizingKind.MaxContent;
    }>;
  }>;
  /** Describes the FitContent member carried by this public TaffyJS value. */ readonly FitContent: (
    value: LengthPercentageInput,
  ) => TrackSizingFunctionInput;
  /** Describes the Fr member carried by this public TaffyJS value. */ readonly Fr: (
    value: number,
  ) => TrackSizingFunctionInput;
  /** Describes the MinMax member carried by this public TaffyJS value. */ readonly MinMax: (
    min: MinTrackSizingFunctionInput,
    max: MaxTrackSizingFunctionInput,
  ) => TrackSizingFunctionInput;
}>;

/** Describes the public RepetitionCount contract used to create or inspect Taffy layout data. */
export declare const RepetitionCount: Readonly<{
  /** Describes the Count member carried by this public TaffyJS value. */ readonly Count: (
    value: number,
  ) => {
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof RepetitionCountKind.Count;
    /** Describes the value member carried by this public TaffyJS value. */ value: number;
  };
  /** Describes the AutoFill member carried by this public TaffyJS value. */ readonly AutoFill: Readonly<{
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof RepetitionCountKind.AutoFill;
  }>;
  /** Describes the AutoFit member carried by this public TaffyJS value. */ readonly AutoFit: Readonly<{
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof RepetitionCountKind.AutoFit;
  }>;
}>;

/** Describes the public GridTemplateComponent contract used to create or inspect Taffy layout data. */
export declare const GridTemplateComponent: Readonly<{
  /** Describes the Single member carried by this public TaffyJS value. */ readonly Single: (
    value: TrackSizingFunctionInput,
  ) => {
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridTemplateComponentKind.Single;
    /** Describes the value member carried by this public TaffyJS value. */ value: TrackSizingFunctionInput;
  };
  /** Describes the Repeat member carried by this public TaffyJS value. */ readonly Repeat: (
    count: RepetitionCountInput,
    tracks: TrackSizingFunctionInput[],
    lineNames?: string[][],
  ) => {
    /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof GridTemplateComponentKind.Repeat;
    /** Describes the value member carried by this public TaffyJS value. */ value: GridTemplateRepetitionInput;
  };
}>;

/** Describes the public StyleInput contract used to create or inspect Taffy layout data. */
export interface StyleInput {
  /** Describes the display member carried by this public TaffyJS value. */ display?:
    | Display
    | undefined;
  /** Describes the itemIsTable member carried by this public TaffyJS value. */ itemIsTable?:
    | boolean
    | undefined;
  /** Describes the itemIsReplaced member carried by this public TaffyJS value. */ itemIsReplaced?:
    | boolean
    | undefined;
  /** Describes the boxSizing member carried by this public TaffyJS value. */ boxSizing?:
    | BoxSizing
    | undefined;
  /** Describes the direction member carried by this public TaffyJS value. */ direction?:
    | Direction
    | undefined;
  /** Describes the overflow member carried by this public TaffyJS value. */ overflow?:
    | PartialPointInput<Overflow>
    | undefined;
  /** Describes the scrollbarWidth member carried by this public TaffyJS value. */ scrollbarWidth?:
    | number
    | undefined;
  /** Describes the float member carried by this public TaffyJS value. */ float?: Float | undefined;
  /** Removes every node and context value from this tree. */ clear?: Clear | undefined;
  /** Describes the position member carried by this public TaffyJS value. */ position?:
    | Position
    | undefined;
  /** Describes the inset member carried by this public TaffyJS value. */ inset?:
    | LengthPercentageAutoInput
    | PartialRectInput<LengthPercentageAutoInput>
    | undefined;
  /** Describes the size member carried by this public TaffyJS value. */ size?:
    | DimensionInput
    | PartialSizeInput<DimensionInput>
    | undefined;
  /** Describes the minSize member carried by this public TaffyJS value. */ minSize?:
    | DimensionInput
    | PartialSizeInput<DimensionInput>
    | undefined;
  /** Describes the maxSize member carried by this public TaffyJS value. */ maxSize?:
    | DimensionInput
    | PartialSizeInput<DimensionInput>
    | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ aspectRatio?:
    | number
    | null
    | undefined;
  /** Describes the margin member carried by this public TaffyJS value. */ margin?:
    | LengthPercentageAutoInput
    | PartialRectInput<LengthPercentageAutoInput>
    | undefined;
  /** Describes the padding member carried by this public TaffyJS value. */ padding?:
    | LengthPercentageInput
    | PartialRectInput<LengthPercentageInput>
    | undefined;
  /** Describes the border member carried by this public TaffyJS value. */ border?:
    | LengthPercentageInput
    | PartialRectInput<LengthPercentageInput>
    | undefined;
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
  /** Describes the gap member carried by this public TaffyJS value. */ gap?:
    | LengthPercentageInput
    | PartialSizeInput<LengthPercentageInput>
    | undefined;
  /** Describes the textAlign member carried by this public TaffyJS value. */ textAlign?:
    | TextAlign
    | undefined;
  /** Describes the flexDirection member carried by this public TaffyJS value. */ flexDirection?:
    | FlexDirection
    | undefined;
  /** Describes the flexWrap member carried by this public TaffyJS value. */ flexWrap?:
    | FlexWrap
    | undefined;
  /** Describes the flexBasis member carried by this public TaffyJS value. */ flexBasis?:
    | DimensionInput
    | undefined;
  /** Describes the flexGrow member carried by this public TaffyJS value. */ flexGrow?:
    | number
    | undefined;
  /** Describes the flexShrink member carried by this public TaffyJS value. */ flexShrink?:
    | number
    | undefined;
  /** Describes the gridTemplateRows member carried by this public TaffyJS value. */ gridTemplateRows?:
    | GridTemplateComponentInput[]
    | undefined;
  /** Describes the gridTemplateColumns member carried by this public TaffyJS value. */ gridTemplateColumns?:
    | GridTemplateComponentInput[]
    | undefined;
  /** Describes the gridAutoRows member carried by this public TaffyJS value. */ gridAutoRows?:
    | TrackSizingFunctionInput[]
    | undefined;
  /** Describes the gridAutoColumns member carried by this public TaffyJS value. */ gridAutoColumns?:
    | TrackSizingFunctionInput[]
    | undefined;
  /** Describes the gridAutoFlow member carried by this public TaffyJS value. */ gridAutoFlow?:
    | GridAutoFlow
    | undefined;
  /** Omission or undefined uses the Taffy default; null stores Taffy None. */ gridTemplateAreas?:
    | GridTemplateAreasInput
    | null
    | undefined;
  /** Describes the gridTemplateColumnNames member carried by this public TaffyJS value. */ gridTemplateColumnNames?:
    | string[][]
    | undefined;
  /** Describes the gridTemplateRowNames member carried by this public TaffyJS value. */ gridTemplateRowNames?:
    | string[][]
    | undefined;
  /** Describes the gridRow member carried by this public TaffyJS value. */ gridRow?:
    | PartialLineInput<GridPlacementInput>
    | undefined;
  /** Describes the gridColumn member carried by this public TaffyJS value. */ gridColumn?:
    | PartialLineInput<GridPlacementInput>
    | undefined;
}

/** Describes the public Style contract used to create or inspect Taffy layout data. */
export interface Style {
  /** Describes the display member carried by this public TaffyJS value. */ readonly display: Display;
  /** Describes the itemIsTable member carried by this public TaffyJS value. */ readonly itemIsTable: boolean;
  /** Describes the itemIsReplaced member carried by this public TaffyJS value. */ readonly itemIsReplaced: boolean;
  /** Describes the boxSizing member carried by this public TaffyJS value. */ readonly boxSizing: BoxSizing;
  /** Describes the direction member carried by this public TaffyJS value. */ readonly direction: Direction;
  /** Describes the overflow member carried by this public TaffyJS value. */ readonly overflow: Point<Overflow>;
  /** Describes the scrollbarWidth member carried by this public TaffyJS value. */ readonly scrollbarWidth: number;
  /** Describes the float member carried by this public TaffyJS value. */ readonly float: Float;
  /** Removes every node and context value from this tree. */ readonly clear: Clear;
  /** Describes the position member carried by this public TaffyJS value. */ readonly position: Position;
  /** Describes the inset member carried by this public TaffyJS value. */ readonly inset: Rect<LengthPercentageAuto>;
  /** Describes the size member carried by this public TaffyJS value. */ readonly size: Size<Dimension>;
  /** Describes the minSize member carried by this public TaffyJS value. */ readonly minSize: Size<Dimension>;
  /** Describes the maxSize member carried by this public TaffyJS value. */ readonly maxSize: Size<Dimension>;
  /** Describes the aspectRatio member carried by this public TaffyJS value. */ readonly aspectRatio:
    | number
    | null;
  /** Describes the margin member carried by this public TaffyJS value. */ readonly margin: Rect<LengthPercentageAuto>;
  /** Describes the padding member carried by this public TaffyJS value. */ readonly padding: Rect<LengthPercentage>;
  /** Describes the border member carried by this public TaffyJS value. */ readonly border: Rect<LengthPercentage>;
  /** Describes the alignItems member carried by this public TaffyJS value. */ readonly alignItems: AlignItems | null;
  /** Describes the alignSelf member carried by this public TaffyJS value. */ readonly alignSelf: AlignItems | null;
  /** Describes the justifyItems member carried by this public TaffyJS value. */ readonly justifyItems: AlignItems | null;
  /** Describes the justifySelf member carried by this public TaffyJS value. */ readonly justifySelf: AlignItems | null;
  /** Describes the alignContent member carried by this public TaffyJS value. */ readonly alignContent: AlignContent | null;
  /** Describes the justifyContent member carried by this public TaffyJS value. */ readonly justifyContent: AlignContent | null;
  /** Describes the gap member carried by this public TaffyJS value. */ readonly gap: Size<LengthPercentage>;
  /** Describes the textAlign member carried by this public TaffyJS value. */ readonly textAlign: TextAlign;
  /** Describes the flexDirection member carried by this public TaffyJS value. */ readonly flexDirection: FlexDirection;
  /** Describes the flexWrap member carried by this public TaffyJS value. */ readonly flexWrap: FlexWrap;
  /** Describes the flexBasis member carried by this public TaffyJS value. */ readonly flexBasis: Dimension;
  /** Describes the flexGrow member carried by this public TaffyJS value. */ readonly flexGrow: number;
  /** Describes the flexShrink member carried by this public TaffyJS value. */ readonly flexShrink: number;
  /** Describes the gridTemplateRows member carried by this public TaffyJS value. */ readonly gridTemplateRows: readonly GridTemplateComponent[];
  /** Describes the gridTemplateColumns member carried by this public TaffyJS value. */ readonly gridTemplateColumns: readonly GridTemplateComponent[];
  /** Describes the gridAutoRows member carried by this public TaffyJS value. */ readonly gridAutoRows: readonly TrackSizingFunction[];
  /** Describes the gridAutoColumns member carried by this public TaffyJS value. */ readonly gridAutoColumns: readonly TrackSizingFunction[];
  /** Describes the gridAutoFlow member carried by this public TaffyJS value. */ readonly gridAutoFlow: GridAutoFlow;
  /** Describes the gridTemplateAreas member carried by this public TaffyJS value. */ readonly gridTemplateAreas: GridTemplateAreas | null;
  /** Describes the gridTemplateColumnNames member carried by this public TaffyJS value. */ readonly gridTemplateColumnNames: readonly (readonly string[])[];
  /** Describes the gridTemplateRowNames member carried by this public TaffyJS value. */ readonly gridTemplateRowNames: readonly (readonly string[])[];
  /** Describes the gridRow member carried by this public TaffyJS value. */ readonly gridRow: Line<GridPlacement>;
  /** Describes the gridColumn member carried by this public TaffyJS value. */ readonly gridColumn: Line<GridPlacement>;
}

/** Describes the public Layout contract used to create or inspect Taffy layout data. */
export interface Layout {
  /** Describes the order member carried by this public TaffyJS value. */ readonly order: number;
  /** Describes the location member carried by this public TaffyJS value. */ readonly location: Point<number>;
  /** Describes the size member carried by this public TaffyJS value. */ readonly size: Size<number>;
  /** Describes the contentSize member carried by this public TaffyJS value. */ readonly contentSize: Size<number>;
  /** Describes the scrollbarSize member carried by this public TaffyJS value. */ readonly scrollbarSize: Size<number>;
  /** Describes the border member carried by this public TaffyJS value. */ readonly border: Rect<number>;
  /** Describes the padding member carried by this public TaffyJS value. */ readonly padding: Rect<number>;
  /** Describes the margin member carried by this public TaffyJS value. */ readonly margin: Rect<number>;
}

/** Describes the public DetailedLayoutInfo contract used to create or inspect Taffy layout data. */
export type DetailedLayoutInfo =
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof DetailedLayoutInfoKind.None;
    }>
  | Readonly<{
      /** Describes the kind member carried by this public TaffyJS value. */ kind: typeof DetailedLayoutInfoKind.Grid;
      /** Describes the value member carried by this public TaffyJS value. */ value: DetailedGridInfo;
    }>;

/** Describes the public DetailedGridInfo contract used to create or inspect Taffy layout data. */
export interface DetailedGridInfo {
  /** Describes the rows member carried by this public TaffyJS value. */ readonly rows: DetailedGridTracksInfo;
  /** Describes the columns member carried by this public TaffyJS value. */ readonly columns: DetailedGridTracksInfo;
  /** Describes the items member carried by this public TaffyJS value. */ readonly items: readonly DetailedGridItemInfo[];
}

/** Describes the public DetailedGridTracksInfo contract used to create or inspect Taffy layout data. */
export interface DetailedGridTracksInfo {
  /** Describes the negativeImplicitTracks member carried by this public TaffyJS value. */ readonly negativeImplicitTracks: number;
  /** Describes the explicitTracks member carried by this public TaffyJS value. */ readonly explicitTracks: number;
  /** Describes the positiveImplicitTracks member carried by this public TaffyJS value. */ readonly positiveImplicitTracks: number;
  /** Describes the gutters member carried by this public TaffyJS value. */ readonly gutters: readonly number[];
  /** Describes the sizes member carried by this public TaffyJS value. */ readonly sizes: readonly number[];
}

/** Describes the public DetailedGridItemInfo contract used to create or inspect Taffy layout data. */
export interface DetailedGridItemInfo {
  /** Describes the rowStart member carried by this public TaffyJS value. */ readonly rowStart: number;
  /** Describes the rowEnd member carried by this public TaffyJS value. */ readonly rowEnd: number;
  /** Describes the columnStart member carried by this public TaffyJS value. */ readonly columnStart: number;
  /** Describes the columnEnd member carried by this public TaffyJS value. */ readonly columnEnd: number;
}

/** Describes the public MeasureArgs contract used to create or inspect Taffy layout data. */
export type MeasureArgs<TContext> = Readonly<{
  /** Describes the knownDimensions member carried by this public TaffyJS value. */ knownDimensions: Size<
    number | undefined
  >;
  /** Describes the availableSpace member carried by this public TaffyJS value. */ availableSpace: Size<AvailableSpace>;
  /** Describes the node member carried by this public TaffyJS value. */ node: NodeId;
  /** Describes the context member carried by this public TaffyJS value. */ context:
    | TContext
    | undefined;
  /** Describes the style member carried by this public TaffyJS value. */ style: Style;
}>;

/** Describes the public MeasureFunction contract used to create or inspect Taffy layout data. */
export type MeasureFunction<TContext> = (args: MeasureArgs<TContext>) => SizeInput<number>;

/** Describes the public ChildRangeInput contract used to create or inspect Taffy layout data. */
export interface ChildRangeInput {
  /** Describes the start member carried by this public TaffyJS value. */ start: number;
  /** Describes the end member carried by this public TaffyJS value. */ end: number;
}

/** Describes the public ComputeLayoutWithMeasureOptions contract used to create or inspect Taffy layout data. */
export interface ComputeLayoutWithMeasureOptions<TContext> {
  /** Describes the root member carried by this public TaffyJS value. */ root: NodeId;
  /** Describes the availableSpace member carried by this public TaffyJS value. */ availableSpace: SizeInput<AvailableSpaceInput>;
  /** Describes the measure member carried by this public TaffyJS value. */ measure: MeasureFunction<TContext>;
}

/** Describes the public ComputeLayoutOptions contract used to create or inspect Taffy layout data. */
export interface ComputeLayoutOptions {
  /** Describes the root member carried by this public TaffyJS value. */ root: NodeId;
  /** Describes the availableSpace member carried by this public TaffyJS value. */ availableSpace: SizeInput<AvailableSpaceInput>;
}

/** Describes the public TaffyTree contract used to create or inspect Taffy layout data. */
export declare class TaffyTree<TContext = unknown> {
  /** Creates an independent Taffy tree with its own NodeId namespace. */ constructor();
  /** Enables pixel rounding for subsequently computed public layouts. */ enableRounding(): void;
  /** Disables pixel rounding while retaining unrounded layout values. */ disableRounding(): void;
  /** Creates a leaf node from the supplied public style input. */ newLeaf(
    style: StyleInput,
  ): NodeId;
  /** Creates a leaf node and associates optional JavaScript context. */ newLeafWithContext(
    style: StyleInput,
    context: TContext | undefined,
  ): NodeId;
  /** Creates a parent node with the supplied ordered children. */ newWithChildren(
    style: StyleInput,
    children: readonly NodeId[],
  ): NodeId;
  /** Removes every node and context value from this tree. */ clear(): void;
  /** Removes one node and invalidates its public NodeId. */ remove(node: NodeId): void;
  /** Replaces or clears the JavaScript context for one node. */ setNodeContext(
    node: NodeId,
    context: TContext | undefined,
  ): void;
  /** Returns the JavaScript context currently associated with one node. */ getNodeContext(
    node: NodeId,
  ): TContext | undefined;
  /** Appends an existing node to the parent child list. */ addChild(
    parent: NodeId,
    child: NodeId,
  ): void;
  /** Inserts an existing child at the requested parent index. */ insertChildAtIndex(
    parent: NodeId,
    index: number,
    child: NodeId,
  ): void;
  /** Replaces the complete ordered child list for one parent. */ setChildren(
    parent: NodeId,
    children: readonly NodeId[],
  ): void;
  /** Detaches the selected child from its current parent. */ removeChild(
    parent: NodeId,
    child: NodeId,
  ): void;
  /** Detaches and returns the child at the requested index. */ removeChildAtIndex(
    parent: NodeId,
    index: number,
  ): NodeId;
  /** Detaches children in the supplied half-open index range. */ removeChildrenRange(
    parent: NodeId,
    range: ChildRangeInput,
  ): void;
  /** Replaces and returns the child at the requested index. */ replaceChildAtIndex(
    parent: NodeId,
    index: number,
    newChild: NodeId,
  ): NodeId;
  /** Returns the child at the requested parent index. */ getChildAtIndex(
    parent: NodeId,
    index: number,
  ): NodeId;
  /** Returns the current number of children for one parent. */ getChildCount(
    parent: NodeId,
  ): number;
  /** Returns the number of live nodes owned by this tree. */ getNodeCount(): number;
  /** Returns the current parent or null for a root node. */ getParent(node: NodeId): NodeId | null;
  /** Returns a detached readonly snapshot of the ordered children. */ getChildren(
    parent: NodeId,
  ): readonly NodeId[];
  /** Replaces a node style and marks affected layout state dirty. */ setStyle(
    node: NodeId,
    style: StyleInput,
  ): void;
  /** Returns a detached readable snapshot of the node style. */ getStyle(node: NodeId): Style;
  /** Returns the most recently stored rounded layout snapshot. */ getLayout(node: NodeId): Layout;
  /** Returns the most recently stored unrounded layout snapshot. */ getUnroundedLayout(
    node: NodeId,
  ): Layout;
  /** Returns detailed Grid tracks and item placement when available. */ getDetailedLayoutInfo(
    node: NodeId,
  ): DetailedLayoutInfo;
  /** Explicitly marks a node for layout recomputation. */ markDirty(node: NodeId): void;
  /** Reports whether a node currently needs layout recomputation. */ isDirty(
    node: NodeId,
  ): boolean;
  /** Computes and stores layout for a tree root synchronously. */ computeLayout(
    options: ComputeLayoutOptions,
  ): void;
  /** Computes layout synchronously with a JavaScript measure callback. */ computeLayoutWithMeasure(
    options: ComputeLayoutWithMeasureOptions<TContext>,
  ): void;
}
