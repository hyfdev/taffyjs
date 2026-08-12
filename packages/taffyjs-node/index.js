import "#native";
//#region src/generated/numeric-families.ts
const Display = Object.freeze({
	Block: 0,
	FlowRoot: 1,
	Flex: 2,
	Grid: 3,
	None: 4
});
const BoxSizing = Object.freeze({
	BorderBox: 0,
	ContentBox: 1
});
const Direction = Object.freeze({
	Ltr: 0,
	Rtl: 1
});
const Overflow = Object.freeze({
	Visible: 0,
	Clip: 1,
	Hidden: 2,
	Scroll: 3
});
const Float = Object.freeze({
	Left: 0,
	Right: 1,
	None: 2
});
const Clear = Object.freeze({
	Left: 0,
	Right: 1,
	Both: 2,
	None: 3
});
const Position = Object.freeze({
	Relative: 0,
	Absolute: 1
});
const TextAlign = Object.freeze({
	Auto: 0,
	LegacyLeft: 1,
	LegacyRight: 2,
	LegacyCenter: 3
});
const FlexDirection = Object.freeze({
	Row: 0,
	Column: 1,
	RowReverse: 2,
	ColumnReverse: 3
});
const FlexWrap = Object.freeze({
	NoWrap: 0,
	Wrap: 1,
	WrapReverse: 2
});
const GridAutoFlow = Object.freeze({
	Row: 0,
	Column: 1,
	RowDense: 2,
	ColumnDense: 3
});
const AlignItems = Object.freeze({
	Start: 0,
	End: 1,
	FlexStart: 2,
	FlexEnd: 3,
	SelfStart: 4,
	SelfEnd: 5,
	Center: 6,
	Baseline: 7,
	Stretch: 8,
	SafeStart: 9,
	SafeEnd: 10,
	SafeFlexStart: 11,
	SafeFlexEnd: 12,
	SafeSelfStart: 13,
	SafeSelfEnd: 14,
	SafeCenter: 15
});
const AlignContent = Object.freeze({
	Start: 0,
	End: 1,
	FlexStart: 2,
	FlexEnd: 3,
	Center: 4,
	Stretch: 5,
	SpaceBetween: 6,
	SpaceEvenly: 7,
	SpaceAround: 8,
	SafeStart: 9,
	SafeEnd: 10,
	SafeFlexStart: 11,
	SafeFlexEnd: 12,
	SafeCenter: 13
});
const LengthUnit = Object.freeze({
	Length: 0,
	Percent: 1,
	Auto: 2
});
const AvailableSpaceKind = Object.freeze({
	Definite: 0,
	MinContent: 1,
	MaxContent: 2
});
const GridPlacementKind = Object.freeze({
	Auto: 0,
	Line: 1,
	NamedLine: 2,
	Span: 3,
	NamedSpan: 4
});
const TrackSizingKind = Object.freeze({
	Length: 0,
	Percent: 1,
	Auto: 2,
	MinContent: 3,
	MaxContent: 4,
	FitContent: 5,
	Fr: 6
});
const RepetitionCountKind = Object.freeze({
	Count: 0,
	AutoFill: 1,
	AutoFit: 2
});
const GridTemplateComponentKind = Object.freeze({
	Single: 0,
	Repeat: 1
});
const DetailedLayoutInfoKind = Object.freeze({
	None: 0,
	Grid: 1
});
//#endregion
//#region src/available-space.ts
const minContent = Object.freeze({ kind: AvailableSpaceKind.MinContent });
const maxContent = Object.freeze({ kind: AvailableSpaceKind.MaxContent });
const AvailableSpace = Object.freeze({
	Definite(value) {
		return {
			kind: AvailableSpaceKind.Definite,
			value
		};
	},
	MinContent: minContent,
	MaxContent: maxContent
});
//#endregion
//#region src/length.ts
const auto = Object.freeze({ unit: LengthUnit.Auto });
const Dimension = Object.freeze({
	Length(value) {
		return {
			unit: LengthUnit.Length,
			value
		};
	},
	Percent(value) {
		return {
			unit: LengthUnit.Percent,
			value
		};
	},
	Auto: auto
});
//#endregion
export { AlignContent, AlignItems, AvailableSpace, AvailableSpaceKind, BoxSizing, Clear, DetailedLayoutInfoKind, Dimension, Direction, Display, FlexDirection, FlexWrap, Float, GridAutoFlow, GridPlacementKind, GridTemplateComponentKind, LengthUnit, Overflow, Position, RepetitionCountKind, TextAlign, TrackSizingKind };
