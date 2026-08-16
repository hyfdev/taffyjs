//#region src/enums.ts
let Align = /* @__PURE__ */ function(Align) {
	Align[Align["Auto"] = 0] = "Auto";
	Align[Align["FlexStart"] = 1] = "FlexStart";
	Align[Align["Center"] = 2] = "Center";
	Align[Align["FlexEnd"] = 3] = "FlexEnd";
	Align[Align["Stretch"] = 4] = "Stretch";
	Align[Align["Baseline"] = 5] = "Baseline";
	Align[Align["SpaceBetween"] = 6] = "SpaceBetween";
	Align[Align["SpaceAround"] = 7] = "SpaceAround";
	Align[Align["SpaceEvenly"] = 8] = "SpaceEvenly";
	return Align;
}({});
let BoxSizing = /* @__PURE__ */ function(BoxSizing) {
	BoxSizing[BoxSizing["BorderBox"] = 0] = "BorderBox";
	BoxSizing[BoxSizing["ContentBox"] = 1] = "ContentBox";
	return BoxSizing;
}({});
let Dimension = /* @__PURE__ */ function(Dimension) {
	Dimension[Dimension["Width"] = 0] = "Width";
	Dimension[Dimension["Height"] = 1] = "Height";
	return Dimension;
}({});
let Direction = /* @__PURE__ */ function(Direction) {
	Direction[Direction["Inherit"] = 0] = "Inherit";
	Direction[Direction["LTR"] = 1] = "LTR";
	Direction[Direction["RTL"] = 2] = "RTL";
	return Direction;
}({});
let Display = /* @__PURE__ */ function(Display) {
	Display[Display["Flex"] = 0] = "Flex";
	Display[Display["None"] = 1] = "None";
	return Display;
}({});
let Edge = /* @__PURE__ */ function(Edge) {
	Edge[Edge["Left"] = 0] = "Left";
	Edge[Edge["Top"] = 1] = "Top";
	Edge[Edge["Right"] = 2] = "Right";
	Edge[Edge["Bottom"] = 3] = "Bottom";
	Edge[Edge["Start"] = 4] = "Start";
	Edge[Edge["End"] = 5] = "End";
	Edge[Edge["Horizontal"] = 6] = "Horizontal";
	Edge[Edge["Vertical"] = 7] = "Vertical";
	Edge[Edge["All"] = 8] = "All";
	return Edge;
}({});
let Errata = /* @__PURE__ */ function(Errata) {
	Errata[Errata["None"] = 0] = "None";
	return Errata;
}({});
let ExperimentalFeature = /* @__PURE__ */ function(ExperimentalFeature) {
	ExperimentalFeature[ExperimentalFeature["WebFlexBasis"] = 0] = "WebFlexBasis";
	return ExperimentalFeature;
}({});
let FlexDirection = /* @__PURE__ */ function(FlexDirection) {
	FlexDirection[FlexDirection["Column"] = 0] = "Column";
	FlexDirection[FlexDirection["ColumnReverse"] = 1] = "ColumnReverse";
	FlexDirection[FlexDirection["Row"] = 2] = "Row";
	FlexDirection[FlexDirection["RowReverse"] = 3] = "RowReverse";
	return FlexDirection;
}({});
let Gutter = /* @__PURE__ */ function(Gutter) {
	Gutter[Gutter["Column"] = 0] = "Column";
	Gutter[Gutter["Row"] = 1] = "Row";
	Gutter[Gutter["All"] = 2] = "All";
	return Gutter;
}({});
let Justify = /* @__PURE__ */ function(Justify) {
	Justify[Justify["FlexStart"] = 0] = "FlexStart";
	Justify[Justify["Center"] = 1] = "Center";
	Justify[Justify["FlexEnd"] = 2] = "FlexEnd";
	Justify[Justify["SpaceBetween"] = 3] = "SpaceBetween";
	Justify[Justify["SpaceAround"] = 4] = "SpaceAround";
	Justify[Justify["SpaceEvenly"] = 5] = "SpaceEvenly";
	return Justify;
}({});
let LogLevel = /* @__PURE__ */ function(LogLevel) {
	LogLevel[LogLevel["Error"] = 0] = "Error";
	LogLevel[LogLevel["Warn"] = 1] = "Warn";
	LogLevel[LogLevel["Info"] = 2] = "Info";
	LogLevel[LogLevel["Debug"] = 3] = "Debug";
	LogLevel[LogLevel["Verbose"] = 4] = "Verbose";
	LogLevel[LogLevel["Fatal"] = 5] = "Fatal";
	return LogLevel;
}({});
let MeasureMode = /* @__PURE__ */ function(MeasureMode) {
	MeasureMode[MeasureMode["Undefined"] = 0] = "Undefined";
	MeasureMode[MeasureMode["Exactly"] = 1] = "Exactly";
	MeasureMode[MeasureMode["AtMost"] = 2] = "AtMost";
	return MeasureMode;
}({});
let NodeType = /* @__PURE__ */ function(NodeType) {
	NodeType[NodeType["Default"] = 0] = "Default";
	NodeType[NodeType["Text"] = 1] = "Text";
	return NodeType;
}({});
let Overflow = /* @__PURE__ */ function(Overflow) {
	Overflow[Overflow["Visible"] = 0] = "Visible";
	Overflow[Overflow["Hidden"] = 1] = "Hidden";
	Overflow[Overflow["Scroll"] = 2] = "Scroll";
	return Overflow;
}({});
let PositionType = /* @__PURE__ */ function(PositionType) {
	PositionType[PositionType["Relative"] = 1] = "Relative";
	PositionType[PositionType["Absolute"] = 2] = "Absolute";
	return PositionType;
}({});
let Unit = /* @__PURE__ */ function(Unit) {
	Unit[Unit["Undefined"] = 0] = "Undefined";
	Unit[Unit["Point"] = 1] = "Point";
	Unit[Unit["Percent"] = 2] = "Percent";
	Unit[Unit["Auto"] = 3] = "Auto";
	return Unit;
}({});
let Wrap = /* @__PURE__ */ function(Wrap) {
	Wrap[Wrap["NoWrap"] = 0] = "NoWrap";
	Wrap[Wrap["Wrap"] = 1] = "Wrap";
	Wrap[Wrap["WrapReverse"] = 2] = "WrapReverse";
	return Wrap;
}({});
const legacyConstants = {
	ALIGN_AUTO: 0,
	ALIGN_FLEX_START: 1,
	ALIGN_CENTER: 2,
	ALIGN_FLEX_END: 3,
	ALIGN_STRETCH: 4,
	ALIGN_BASELINE: 5,
	ALIGN_SPACE_BETWEEN: 6,
	ALIGN_SPACE_AROUND: 7,
	ALIGN_SPACE_EVENLY: 8,
	BOX_SIZING_BORDER_BOX: 0,
	BOX_SIZING_CONTENT_BOX: 1,
	DIMENSION_WIDTH: 0,
	DIMENSION_HEIGHT: 1,
	DIRECTION_INHERIT: 0,
	DIRECTION_LTR: 1,
	DIRECTION_RTL: 2,
	DISPLAY_FLEX: 0,
	DISPLAY_NONE: 1,
	EDGE_LEFT: 0,
	EDGE_TOP: 1,
	EDGE_RIGHT: 2,
	EDGE_BOTTOM: 3,
	EDGE_START: 4,
	EDGE_END: 5,
	EDGE_HORIZONTAL: 6,
	EDGE_VERTICAL: 7,
	EDGE_ALL: 8,
	ERRATA_NONE: 0,
	EXPERIMENTAL_FEATURE_WEB_FLEX_BASIS: 0,
	FLEX_DIRECTION_COLUMN: 0,
	FLEX_DIRECTION_COLUMN_REVERSE: 1,
	FLEX_DIRECTION_ROW: 2,
	FLEX_DIRECTION_ROW_REVERSE: 3,
	GUTTER_COLUMN: 0,
	GUTTER_ROW: 1,
	GUTTER_ALL: 2,
	JUSTIFY_FLEX_START: 0,
	JUSTIFY_CENTER: 1,
	JUSTIFY_FLEX_END: 2,
	JUSTIFY_SPACE_BETWEEN: 3,
	JUSTIFY_SPACE_AROUND: 4,
	JUSTIFY_SPACE_EVENLY: 5,
	LOG_LEVEL_ERROR: 0,
	LOG_LEVEL_WARN: 1,
	LOG_LEVEL_INFO: 2,
	LOG_LEVEL_DEBUG: 3,
	LOG_LEVEL_VERBOSE: 4,
	LOG_LEVEL_FATAL: 5,
	MEASURE_MODE_UNDEFINED: 0,
	MEASURE_MODE_EXACTLY: 1,
	MEASURE_MODE_AT_MOST: 2,
	NODE_TYPE_DEFAULT: 0,
	NODE_TYPE_TEXT: 1,
	OVERFLOW_VISIBLE: 0,
	OVERFLOW_HIDDEN: 1,
	OVERFLOW_SCROLL: 2,
	POSITION_TYPE_RELATIVE: 1,
	POSITION_TYPE_ABSOLUTE: 2,
	UNIT_UNDEFINED: 0,
	UNIT_POINT: 1,
	UNIT_PERCENT: 2,
	UNIT_AUTO: 3,
	WRAP_NO_WRAP: 0,
	WRAP_WRAP: 1,
	WRAP_WRAP_REVERSE: 2
};
//#endregion
export { Unit as _, Display as a, ExperimentalFeature as c, Justify as d, LogLevel as f, PositionType as g, Overflow as h, Direction as i, FlexDirection as l, NodeType as m, BoxSizing as n, Edge as o, MeasureMode as p, Dimension as r, Errata as s, Align as t, Gutter as u, Wrap as v, legacyConstants as y };
