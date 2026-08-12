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
