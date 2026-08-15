import { AlignContent, AlignItems, AvailableSpace, BoxSizing, Dimension, Direction, Display, FlexDirection, FlexWrap, Overflow, Position, TaffyTree } from "@taffyjs/node";
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
let BoxSizing$1 = /* @__PURE__ */ function(BoxSizing) {
	BoxSizing[BoxSizing["BorderBox"] = 0] = "BorderBox";
	BoxSizing[BoxSizing["ContentBox"] = 1] = "ContentBox";
	return BoxSizing;
}({});
let Dimension$1 = /* @__PURE__ */ function(Dimension) {
	Dimension[Dimension["Width"] = 0] = "Width";
	Dimension[Dimension["Height"] = 1] = "Height";
	return Dimension;
}({});
let Direction$1 = /* @__PURE__ */ function(Direction) {
	Direction[Direction["Inherit"] = 0] = "Inherit";
	Direction[Direction["LTR"] = 1] = "LTR";
	Direction[Direction["RTL"] = 2] = "RTL";
	return Direction;
}({});
let Display$1 = /* @__PURE__ */ function(Display) {
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
let FlexDirection$1 = /* @__PURE__ */ function(FlexDirection) {
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
let Overflow$1 = /* @__PURE__ */ function(Overflow) {
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
const legacyConstants = Object.freeze({
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
});
//#endregion
//#region src/values.ts
const percentPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?%$/i;
function float32(value) {
	if (!Number.isFinite(value)) return value;
	if (value === 0) return 0;
	return Math.fround(value);
}
function finiteFloat32(value) {
	const normalized = float32(value);
	return Number.isFinite(normalized) ? normalized : void 0;
}
function undefinedValue() {
	return {
		unit: 0,
		value: NaN
	};
}
function autoValue() {
	return {
		unit: 3,
		value: NaN
	};
}
function pointValue(value) {
	return {
		unit: 1,
		value
	};
}
function percentValue(value) {
	return {
		unit: 2,
		value
	};
}
function cloneValue(value) {
	return {
		unit: value.unit,
		value: value.value
	};
}
function sameValue(left, right) {
	return left.unit === right.unit && Object.is(left.value, right.value);
}
function publicValue(value) {
	return {
		value: value.value,
		unit: value.unit
	};
}
function normalizeLength(value, name, allowAuto) {
	if (value === void 0) return undefinedValue();
	if (typeof value === "number") {
		if (!Number.isFinite(value)) return undefinedValue();
		const normalized = finiteFloat32(value);
		return normalized === void 0 ? undefinedValue() : pointValue(normalized);
	}
	if (typeof value !== "string") throw new TypeError(`${name} must be a number, percentage,${allowAuto ? " auto," : ""} or undefined`);
	if (allowAuto && value === "auto") return autoValue();
	if (!percentPattern.test(value)) throw new TypeError(`${name} must be a number, percentage,${allowAuto ? " auto," : ""} or undefined`);
	const numeric = Number(value.slice(0, -1));
	if (!Number.isFinite(numeric)) throw new TypeError(`${name} percentage must be finite`);
	const normalized = finiteFloat32(numeric);
	return normalized === void 0 ? undefinedValue() : percentValue(normalized);
}
function normalizePercent(value, name) {
	if (value === void 0) return undefinedValue();
	if (typeof value !== "number") throw new TypeError(`${name} must be a number or undefined`);
	if (!Number.isFinite(value)) return undefinedValue();
	const normalized = finiteFloat32(value);
	return normalized === void 0 ? undefinedValue() : percentValue(normalized);
}
function normalizePoint(value, name) {
	if (value === void 0) return void 0;
	if (typeof value !== "number") throw new TypeError(`${name} must be a number or undefined`);
	if (!Number.isFinite(value)) return void 0;
	return finiteFloat32(value);
}
function normalizeFlexNumber(value, name) {
	if (value === void 0) return void 0;
	if (typeof value !== "number") throw new TypeError(`${name} must be a number or undefined`);
	if (Number.isNaN(value)) return void 0;
	return float32(value);
}
function normalizeAspectRatio(value) {
	if (value === void 0) return void 0;
	if (typeof value !== "number") throw new TypeError("aspectRatio must be a number or undefined");
	if (!Number.isFinite(value) || value === 0) return void 0;
	const normalized = finiteFloat32(value);
	return normalized === void 0 || normalized === 0 ? void 0 : normalized;
}
function toDimension(value) {
	switch (value.unit) {
		case 1: return Dimension.Length(value.value);
		case 2: return Dimension.Percent(value.value);
		case 3:
		case 0: return Dimension.Auto;
	}
}
function toLengthPercentage(value) {
	switch (value.unit) {
		case 1: return Dimension.Length(value.value);
		case 2: return Dimension.Percent(value.value);
		case 3:
		case 0: return 0;
	}
}
function toLengthPercentageAuto(value) {
	return value.unit === 0 ? 0 : toDimension(value);
}
//#endregion
//#region src/declarations.ts
function edgeValues(create) {
	return [
		create(),
		create(),
		create(),
		create(),
		create(),
		create(),
		create(),
		create(),
		create()
	];
}
function gutterValues(create) {
	return [
		create(),
		create(),
		create()
	];
}
function createDeclarations(useWebDefaults) {
	return {
		alignContent: useWebDefaults ? 4 : 1,
		alignItems: 4,
		alignSelf: 0,
		aspectRatio: void 0,
		border: edgeValues(() => void 0),
		direction: 0,
		display: 0,
		flex: void 0,
		flexBasis: autoValue(),
		flexDirection: useWebDefaults ? 2 : 0,
		flexGrow: void 0,
		flexShrink: void 0,
		flexWrap: 0,
		height: autoValue(),
		justifyContent: 0,
		gap: gutterValues(undefinedValue),
		margin: edgeValues(undefinedValue),
		maxHeight: undefinedValue(),
		maxWidth: undefinedValue(),
		minHeight: undefinedValue(),
		minWidth: undefinedValue(),
		overflow: 0,
		padding: edgeValues(undefinedValue),
		position: edgeValues(undefinedValue),
		positionType: 1,
		boxSizing: 0,
		width: autoValue()
	};
}
function cloneDeclarations(value) {
	return {
		...value,
		border: [...value.border],
		flexBasis: cloneValue(value.flexBasis),
		height: cloneValue(value.height),
		gap: value.gap.map(cloneValue),
		margin: value.margin.map(cloneValue),
		maxHeight: cloneValue(value.maxHeight),
		maxWidth: cloneValue(value.maxWidth),
		minHeight: cloneValue(value.minHeight),
		minWidth: cloneValue(value.minWidth),
		padding: value.padding.map(cloneValue),
		position: value.position.map(cloneValue),
		width: cloneValue(value.width)
	};
}
function sameNumber(left, right) {
	return Object.is(left, right);
}
function sameArray(left, right, same) {
	return left.every((value, index) => same(value, right[index]));
}
function sameDeclarations(left, right) {
	return left.alignContent === right.alignContent && left.alignItems === right.alignItems && left.alignSelf === right.alignSelf && sameNumber(left.aspectRatio, right.aspectRatio) && sameArray(left.border, right.border, sameNumber) && left.direction === right.direction && left.display === right.display && sameNumber(left.flex, right.flex) && sameValue(left.flexBasis, right.flexBasis) && left.flexDirection === right.flexDirection && sameNumber(left.flexGrow, right.flexGrow) && sameNumber(left.flexShrink, right.flexShrink) && left.flexWrap === right.flexWrap && sameValue(left.height, right.height) && left.justifyContent === right.justifyContent && sameArray(left.gap, right.gap, sameValue) && sameArray(left.margin, right.margin, sameValue) && sameValue(left.maxHeight, right.maxHeight) && sameValue(left.maxWidth, right.maxWidth) && sameValue(left.minHeight, right.minHeight) && sameValue(left.minWidth, right.minWidth) && left.overflow === right.overflow && sameArray(left.padding, right.padding, sameValue) && sameArray(left.position, right.position, sameValue) && left.positionType === right.positionType && left.boxSizing === right.boxSizing && sameValue(left.width, right.width);
}
function edgeCandidates(edge, direction) {
	switch (edge) {
		case 0: return [
			direction === 1 ? 4 : 5,
			0,
			6,
			8
		];
		case 2: return [
			direction === 1 ? 5 : 4,
			2,
			6,
			8
		];
		case 1: return [
			1,
			7,
			8
		];
		case 3: return [
			3,
			7,
			8
		];
		default: throw new TypeError("A physical edge is required");
	}
}
function resolveEdge(values, edge, direction, isDefined, fallback) {
	for (const candidate of edgeCandidates(edge, direction)) {
		const value = values[candidate];
		if (isDefined(value)) return value;
	}
	return fallback();
}
function resolveGutter(values, gutter, isDefined, fallback) {
	const direct = values[gutter];
	if (isDefined(direct)) return direct;
	const all = values[2];
	return isDefined(all) ? all : fallback();
}
//#endregion
//#region src/translate.ts
function alignItems(value) {
	switch (value) {
		case 1: return AlignItems.FlexStart;
		case 2: return AlignItems.Center;
		case 3: return AlignItems.FlexEnd;
		case 4: return AlignItems.Stretch;
		case 5: return AlignItems.Baseline;
		default: throw new TypeError("Unsupported item alignment");
	}
}
function alignContent(value) {
	switch (value) {
		case 1: return AlignContent.FlexStart;
		case 2: return AlignContent.Center;
		case 3: return AlignContent.FlexEnd;
		case 4: return AlignContent.Stretch;
		case 6: return AlignContent.SpaceBetween;
		case 7: return AlignContent.SpaceAround;
		case 8: return AlignContent.SpaceEvenly;
		default: throw new TypeError("Unsupported content alignment");
	}
}
function justifyContent(value) {
	switch (value) {
		case 0: return AlignContent.FlexStart;
		case 1: return AlignContent.Center;
		case 2: return AlignContent.FlexEnd;
		case 3: return AlignContent.SpaceBetween;
		case 4: return AlignContent.SpaceAround;
		case 5: return AlignContent.SpaceEvenly;
	}
}
function direction(value) {
	return value === 2 ? Direction.Rtl : Direction.Ltr;
}
function flexDirection(value) {
	switch (value) {
		case 0: return FlexDirection.Column;
		case 1: return FlexDirection.ColumnReverse;
		case 2: return FlexDirection.Row;
		case 3: return FlexDirection.RowReverse;
	}
}
function flexWrap(value) {
	switch (value) {
		case 0: return FlexWrap.NoWrap;
		case 1: return FlexWrap.Wrap;
		case 2: return FlexWrap.WrapReverse;
	}
}
function physicalValue(values, edge, resolvedDirection) {
	return resolveEdge(values, edge, resolvedDirection, (value) => value.unit !== 0, undefinedValue);
}
function physicalNumber(values, edge, resolvedDirection) {
	return resolveEdge(values, edge, resolvedDirection, (value) => value !== void 0, () => 0) ?? 0;
}
function rect(read) {
	return {
		left: read(0),
		top: read(1),
		right: read(2),
		bottom: read(3)
	};
}
function effectiveFlexBasis(declarations, config) {
	if (declarations.flexBasis.unit === 3 && declarations.flex !== void 0 && declarations.flex > 0 && !config.useWebDefaults) return Dimension.Length(0);
	return toDimension(declarations.flexBasis);
}
function effectiveFlexGrow(declarations) {
	if (declarations.flexGrow !== void 0) return declarations.flexGrow;
	return declarations.flex !== void 0 && declarations.flex > 0 ? declarations.flex : 0;
}
function effectiveFlexShrink(declarations, config) {
	if (declarations.flexShrink !== void 0) return declarations.flexShrink;
	if (!config.useWebDefaults && declarations.flex !== void 0 && declarations.flex < 0) return -declarations.flex;
	return config.useWebDefaults ? 1 : 0;
}
function translateStyle(declarations, config, resolvedDirection) {
	const margin = rect((edge) => toLengthPercentageAuto(physicalValue(declarations.margin, edge, resolvedDirection)));
	const padding = rect((edge) => toLengthPercentage(physicalValue(declarations.padding, edge, resolvedDirection)));
	const position = rect((edge) => toDimension(physicalValue(declarations.position, edge, resolvedDirection)));
	const border = rect((edge) => physicalNumber(declarations.border, edge, resolvedDirection));
	const columnGap = resolveGutter(declarations.gap, 0, (value) => value.unit !== 0, undefinedValue);
	const rowGap = resolveGutter(declarations.gap, 1, (value) => value.unit !== 0, undefinedValue);
	return {
		display: declarations.display === 1 ? Display.None : Display.Flex,
		boxSizing: declarations.boxSizing === 1 ? BoxSizing.ContentBox : BoxSizing.BorderBox,
		direction: direction(resolvedDirection),
		overflow: {
			x: declarations.overflow === 1 ? Overflow.Hidden : declarations.overflow === 2 ? Overflow.Scroll : Overflow.Visible,
			y: declarations.overflow === 1 ? Overflow.Hidden : declarations.overflow === 2 ? Overflow.Scroll : Overflow.Visible
		},
		position: declarations.positionType === 2 ? Position.Absolute : Position.Relative,
		inset: position,
		size: {
			width: toDimension(declarations.width),
			height: toDimension(declarations.height)
		},
		minSize: {
			width: toDimension(declarations.minWidth),
			height: toDimension(declarations.minHeight)
		},
		maxSize: {
			width: toDimension(declarations.maxWidth),
			height: toDimension(declarations.maxHeight)
		},
		aspectRatio: declarations.aspectRatio ?? null,
		margin,
		padding,
		border,
		alignItems: alignItems(declarations.alignItems),
		alignSelf: declarations.alignSelf === 0 ? null : alignItems(declarations.alignSelf),
		alignContent: alignContent(declarations.alignContent),
		justifyContent: justifyContent(declarations.justifyContent),
		gap: {
			width: toLengthPercentage(columnGap),
			height: toLengthPercentage(rowGap)
		},
		flexDirection: flexDirection(declarations.flexDirection),
		flexWrap: flexWrap(declarations.flexWrap),
		flexBasis: effectiveFlexBasis(declarations, config),
		flexGrow: effectiveFlexGrow(declarations),
		flexShrink: effectiveFlexShrink(declarations, config)
	};
}
function declarationDirection(declarations, ownerDirection) {
	return declarations.direction === 0 ? ownerDirection : declarations.direction;
}
//#endregion
//#region src/facade.ts
const initialLayout = () => ({
	left: 0,
	right: 0,
	top: 0,
	bottom: 0,
	width: NaN,
	height: NaN
});
var ConfigState = class {
	useWebDefaults = false;
	pointScaleFactor = 1;
	errata = 0;
	webFlexBasis = false;
	revision = 0;
};
var FacadeRuntime = class {
	tree = new TaffyTree();
	nodes = /* @__PURE__ */ new Map();
	defaultConfig = new ConfigState();
	constructor() {
		this.tree.disableRounding();
	}
};
const configRecords = /* @__PURE__ */ new WeakMap();
function requireBoolean(value, name) {
	if (typeof value !== "boolean") throw new TypeError(`${name} must be a boolean`);
	return value;
}
function requireEnum(value, name, allowed) {
	if (typeof value !== "number" || !allowed.includes(value)) throw new TypeError(`${name} is unsupported`);
	return value;
}
var YogaConfig = class {
	constructor(runtime, state) {
		configRecords.set(this, {
			runtime,
			state,
			alive: true
		});
	}
	free() {
		freeConfig(requireConfig(void 0, this));
	}
	isExperimentalFeatureEnabled(feature) {
		const record = requireConfig(void 0, this);
		requireEnum(feature, "experimental feature", [0]);
		return record.state.webFlexBasis;
	}
	setExperimentalFeatureEnabled(feature, enabled) {
		const record = requireConfig(void 0, this);
		requireEnum(feature, "experimental feature", [0]);
		const next = requireBoolean(enabled, "enabled");
		if (record.state.webFlexBasis === next) return;
		record.state.webFlexBasis = next;
		record.state.revision += 1;
	}
	setPointScaleFactor(factor) {
		const record = requireConfig(void 0, this);
		if (typeof factor !== "number" || Number.isNaN(factor) || factor < 0) throw new TypeError("pointScaleFactor must be a non-negative number");
		const next = Number.isFinite(factor) ? Math.fround(factor) : factor;
		if (Object.is(record.state.pointScaleFactor, next)) return;
		record.state.pointScaleFactor = next;
		record.state.revision += 1;
	}
	getErrata() {
		return requireConfig(void 0, this).state.errata;
	}
	setErrata(errata) {
		const record = requireConfig(void 0, this);
		requireEnum(errata, "errata", [0]);
		record.state.errata = 0;
	}
	useWebDefaults() {
		return requireConfig(void 0, this).state.useWebDefaults;
	}
	setUseWebDefaults(useWebDefaults) {
		const record = requireConfig(void 0, this);
		const next = requireBoolean(useWebDefaults, "useWebDefaults");
		if (record.state.useWebDefaults === next) return;
		record.state.useWebDefaults = next;
		record.state.revision += 1;
	}
};
function requireConfig(runtime, value) {
	if (!(value instanceof YogaConfig)) throw new TypeError("Expected a Yoga Config");
	const record = configRecords.get(value);
	if (record === void 0) throw new Error("Yoga Config state is unavailable");
	if (runtime !== void 0 && record.runtime !== runtime) throw new TypeError("Config belongs to another Yoga facade");
	if (!record.alive) throw new Error("Config has been freed");
	return record;
}
function freeConfig(record) {
	record.alive = false;
}
function requireCalculationDimension(value, name) {
	if (value === void 0 || value === "auto" || Number.isNaN(value)) return AvailableSpace.MaxContent;
	if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${name} must be a finite number, auto, or undefined`);
	return value;
}
const nodeRecords = /* @__PURE__ */ new WeakMap();
function requireNode(runtime, value) {
	if (!(value instanceof YogaNode)) throw new TypeError("Expected a Yoga Node");
	const record = nodeRecords.get(value);
	if (record === void 0) throw new Error("Yoga Node state is unavailable");
	if (runtime !== void 0 && record.runtime !== runtime) throw new TypeError("Node belongs to another Yoga facade");
	if (!record.alive) throw new Error("Node has been freed");
	return record;
}
function effectiveDirection(record, declarations = record.declarations) {
	return declarationDirection(declarations, record.ownerDirection);
}
function applyDeclarations(record, declarations) {
	if (sameDeclarations(record.declarations, declarations)) return;
	const direction = effectiveDirection(record, declarations);
	const style = translateStyle(declarations, record.config, direction);
	record.runtime.tree.setStyle(record.nodeId, style);
	record.declarations = declarations;
	record.appliedDirection = direction;
	record.appliedConfigRevision = record.config.revision;
}
function mutateDeclarations(node, mutate) {
	const record = requireNode(void 0, node);
	const next = cloneDeclarations(record.declarations);
	mutate(next);
	applyDeclarations(record, next);
}
function syncStyle(record) {
	const direction = effectiveDirection(record);
	if (record.appliedConfigRevision === record.config.revision && record.appliedDirection === direction) return;
	record.runtime.tree.setStyle(record.nodeId, translateStyle(record.declarations, record.config, direction));
	record.appliedDirection = direction;
	record.appliedConfigRevision = record.config.revision;
}
const physicalEdges = [
	0,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8
];
function requireEdge(edge) {
	return requireEnum(edge, "edge", physicalEdges);
}
function requireGutter(gutter) {
	return requireEnum(gutter, "gutter", [
		0,
		1,
		2
	]);
}
var YogaNode = class {
	constructor(runtime, config) {
		const declarations = createDeclarations(config.useWebDefaults);
		const ownerDirection = 1;
		const appliedDirection = declarationDirection(declarations, ownerDirection);
		const nodeId = runtime.tree.newLeaf(translateStyle(declarations, config, appliedDirection));
		nodeRecords.set(this, {
			runtime,
			config,
			nodeId,
			alive: true,
			declarations,
			ownerDirection,
			appliedDirection,
			appliedConfigRevision: config.revision,
			layout: initialLayout()
		});
		runtime.nodes.set(nodeId, this);
	}
	free() {
		freeNode(requireNode(void 0, this));
	}
	copyStyle(node) {
		const record = requireNode(void 0, this);
		applyDeclarations(record, cloneDeclarations(requireNode(record.runtime, node).declarations));
	}
	getAlignContent() {
		return requireNode(void 0, this).declarations.alignContent;
	}
	getAlignItems() {
		return requireNode(void 0, this).declarations.alignItems;
	}
	getAlignSelf() {
		return requireNode(void 0, this).declarations.alignSelf;
	}
	getAspectRatio() {
		return requireNode(void 0, this).declarations.aspectRatio ?? NaN;
	}
	getBorder(edge) {
		return requireNode(void 0, this).declarations.border[requireEdge(edge)] ?? NaN;
	}
	getDirection() {
		return requireNode(void 0, this).declarations.direction;
	}
	getDisplay() {
		return requireNode(void 0, this).declarations.display;
	}
	getFlexBasis() {
		return publicValue(requireNode(void 0, this).declarations.flexBasis);
	}
	getFlexDirection() {
		return requireNode(void 0, this).declarations.flexDirection;
	}
	getFlexGrow() {
		return requireNode(void 0, this).declarations.flexGrow ?? 0;
	}
	getFlexShrink() {
		const record = requireNode(void 0, this);
		return record.declarations.flexShrink ?? (record.config.useWebDefaults ? 1 : 0);
	}
	getFlexWrap() {
		return requireNode(void 0, this).declarations.flexWrap;
	}
	getHeight() {
		return publicValue(requireNode(void 0, this).declarations.height);
	}
	getJustifyContent() {
		return requireNode(void 0, this).declarations.justifyContent;
	}
	getGap(gutter) {
		return requireNode(void 0, this).declarations.gap[requireGutter(gutter)].value;
	}
	getMargin(edge) {
		return publicValue(requireNode(void 0, this).declarations.margin[requireEdge(edge)]);
	}
	getMaxHeight() {
		return publicValue(requireNode(void 0, this).declarations.maxHeight);
	}
	getMaxWidth() {
		return publicValue(requireNode(void 0, this).declarations.maxWidth);
	}
	getMinHeight() {
		return publicValue(requireNode(void 0, this).declarations.minHeight);
	}
	getMinWidth() {
		return publicValue(requireNode(void 0, this).declarations.minWidth);
	}
	getOverflow() {
		return requireNode(void 0, this).declarations.overflow;
	}
	getPadding(edge) {
		return publicValue(requireNode(void 0, this).declarations.padding[requireEdge(edge)]);
	}
	getPosition(edge) {
		return publicValue(requireNode(void 0, this).declarations.position[requireEdge(edge)]);
	}
	getPositionType() {
		return requireNode(void 0, this).declarations.positionType;
	}
	getBoxSizing() {
		return requireNode(void 0, this).declarations.boxSizing;
	}
	getWidth() {
		return publicValue(requireNode(void 0, this).declarations.width);
	}
	setAlignContent(alignContent) {
		const value = requireEnum(alignContent, "alignContent", [
			1,
			2,
			3,
			4,
			6,
			7,
			8
		]);
		mutateDeclarations(this, (declarations) => {
			declarations.alignContent = value;
		});
	}
	setAlignItems(alignItems) {
		const value = requireEnum(alignItems, "alignItems", [
			1,
			2,
			3,
			4,
			5
		]);
		mutateDeclarations(this, (declarations) => {
			declarations.alignItems = value;
		});
	}
	setAlignSelf(alignSelf) {
		const value = requireEnum(alignSelf, "alignSelf", [
			0,
			1,
			2,
			3,
			4,
			5
		]);
		mutateDeclarations(this, (declarations) => {
			declarations.alignSelf = value;
		});
	}
	setAspectRatio(aspectRatio) {
		const value = normalizeAspectRatio(aspectRatio);
		mutateDeclarations(this, (declarations) => {
			declarations.aspectRatio = value;
		});
	}
	setBorder(edge, borderWidth) {
		const index = requireEdge(edge);
		const value = normalizePoint(borderWidth, "borderWidth");
		mutateDeclarations(this, (declarations) => {
			declarations.border[index] = value;
		});
	}
	setDirection(direction) {
		const value = requireEnum(direction, "direction", [
			0,
			1,
			2
		]);
		mutateDeclarations(this, (declarations) => {
			declarations.direction = value;
		});
	}
	setDisplay(display) {
		const value = requireEnum(display, "display", [0, 1]);
		mutateDeclarations(this, (declarations) => {
			declarations.display = value;
		});
	}
	setFlex(flex) {
		const value = normalizeFlexNumber(flex, "flex");
		mutateDeclarations(this, (declarations) => {
			declarations.flex = value;
		});
	}
	setFlexBasis(flexBasis) {
		const value = normalizeLength(flexBasis, "flexBasis", true);
		mutateDeclarations(this, (declarations) => {
			declarations.flexBasis = value;
		});
	}
	setFlexBasisPercent(flexBasis) {
		const value = normalizePercent(flexBasis, "flexBasis");
		mutateDeclarations(this, (declarations) => {
			declarations.flexBasis = value;
		});
	}
	setFlexBasisAuto() {
		mutateDeclarations(this, (declarations) => {
			declarations.flexBasis = autoValue();
		});
	}
	setFlexDirection(flexDirection) {
		const value = requireEnum(flexDirection, "flexDirection", [
			0,
			1,
			2,
			3
		]);
		mutateDeclarations(this, (declarations) => {
			declarations.flexDirection = value;
		});
	}
	setFlexGrow(flexGrow) {
		const value = normalizeFlexNumber(flexGrow, "flexGrow");
		mutateDeclarations(this, (declarations) => {
			declarations.flexGrow = value;
		});
	}
	setFlexShrink(flexShrink) {
		const value = normalizeFlexNumber(flexShrink, "flexShrink");
		mutateDeclarations(this, (declarations) => {
			declarations.flexShrink = value;
		});
	}
	setFlexWrap(flexWrap) {
		const value = requireEnum(flexWrap, "flexWrap", [
			0,
			1,
			2
		]);
		mutateDeclarations(this, (declarations) => {
			declarations.flexWrap = value;
		});
	}
	setHeight(height) {
		const value = normalizeLength(height, "height", true);
		mutateDeclarations(this, (declarations) => {
			declarations.height = value;
		});
	}
	setHeightAuto() {
		mutateDeclarations(this, (declarations) => {
			declarations.height = autoValue();
		});
	}
	setHeightPercent(height) {
		const value = normalizePercent(height, "height");
		mutateDeclarations(this, (declarations) => {
			declarations.height = value;
		});
	}
	setJustifyContent(justifyContent) {
		const value = requireEnum(justifyContent, "justifyContent", [
			0,
			1,
			2,
			3,
			4,
			5
		]);
		mutateDeclarations(this, (declarations) => {
			declarations.justifyContent = value;
		});
	}
	setGap(gutter, gapLength) {
		const index = requireGutter(gutter);
		const value = normalizeLength(gapLength, "gapLength", false);
		mutateDeclarations(this, (declarations) => {
			declarations.gap[index] = value;
		});
	}
	setGapPercent(gutter, gapLength) {
		const index = requireGutter(gutter);
		const value = normalizePercent(gapLength, "gapLength");
		mutateDeclarations(this, (declarations) => {
			declarations.gap[index] = value;
		});
	}
	setMargin(edge, margin) {
		const index = requireEdge(edge);
		const value = normalizeLength(margin, "margin", true);
		mutateDeclarations(this, (declarations) => {
			declarations.margin[index] = value;
		});
	}
	setMarginAuto(edge) {
		const index = requireEdge(edge);
		mutateDeclarations(this, (declarations) => {
			declarations.margin[index] = autoValue();
		});
	}
	setMarginPercent(edge, margin) {
		const index = requireEdge(edge);
		const value = normalizePercent(margin, "margin");
		mutateDeclarations(this, (declarations) => {
			declarations.margin[index] = value;
		});
	}
	setMaxHeight(maxHeight) {
		const value = normalizeLength(maxHeight, "maxHeight", false);
		mutateDeclarations(this, (declarations) => {
			declarations.maxHeight = value;
		});
	}
	setMaxHeightPercent(maxHeight) {
		const value = normalizePercent(maxHeight, "maxHeight");
		mutateDeclarations(this, (declarations) => {
			declarations.maxHeight = value;
		});
	}
	setMaxWidth(maxWidth) {
		const value = normalizeLength(maxWidth, "maxWidth", false);
		mutateDeclarations(this, (declarations) => {
			declarations.maxWidth = value;
		});
	}
	setMaxWidthPercent(maxWidth) {
		const value = normalizePercent(maxWidth, "maxWidth");
		mutateDeclarations(this, (declarations) => {
			declarations.maxWidth = value;
		});
	}
	setMinHeight(minHeight) {
		const value = normalizeLength(minHeight, "minHeight", false);
		mutateDeclarations(this, (declarations) => {
			declarations.minHeight = value;
		});
	}
	setMinHeightPercent(minHeight) {
		const value = normalizePercent(minHeight, "minHeight");
		mutateDeclarations(this, (declarations) => {
			declarations.minHeight = value;
		});
	}
	setMinWidth(minWidth) {
		const value = normalizeLength(minWidth, "minWidth", false);
		mutateDeclarations(this, (declarations) => {
			declarations.minWidth = value;
		});
	}
	setMinWidthPercent(minWidth) {
		const value = normalizePercent(minWidth, "minWidth");
		mutateDeclarations(this, (declarations) => {
			declarations.minWidth = value;
		});
	}
	setOverflow(overflow) {
		const value = requireEnum(overflow, "overflow", [
			0,
			1,
			2
		]);
		mutateDeclarations(this, (declarations) => {
			declarations.overflow = value;
		});
	}
	setPadding(edge, padding) {
		const index = requireEdge(edge);
		const value = normalizeLength(padding, "padding", false);
		mutateDeclarations(this, (declarations) => {
			declarations.padding[index] = value;
		});
	}
	setPaddingPercent(edge, padding) {
		const index = requireEdge(edge);
		const value = normalizePercent(padding, "padding");
		mutateDeclarations(this, (declarations) => {
			declarations.padding[index] = value;
		});
	}
	setPosition(edge, position) {
		const index = requireEdge(edge);
		const value = normalizeLength(position, "position", false);
		mutateDeclarations(this, (declarations) => {
			declarations.position[index] = value;
		});
	}
	setPositionPercent(edge, position) {
		const index = requireEdge(edge);
		const value = normalizePercent(position, "position");
		mutateDeclarations(this, (declarations) => {
			declarations.position[index] = value;
		});
	}
	setPositionType(positionType) {
		const value = requireEnum(positionType, "positionType", [1, 2]);
		mutateDeclarations(this, (declarations) => {
			declarations.positionType = value;
		});
	}
	setPositionAuto(edge) {
		const index = requireEdge(edge);
		mutateDeclarations(this, (declarations) => {
			declarations.position[index] = autoValue();
		});
	}
	setBoxSizing(boxSizing) {
		const value = requireEnum(boxSizing, "boxSizing", [0, 1]);
		mutateDeclarations(this, (declarations) => {
			declarations.boxSizing = value;
		});
	}
	setWidth(width) {
		const value = normalizeLength(width, "width", true);
		mutateDeclarations(this, (declarations) => {
			declarations.width = value;
		});
	}
	setWidthAuto() {
		mutateDeclarations(this, (declarations) => {
			declarations.width = autoValue();
		});
	}
	setWidthPercent(width) {
		const value = normalizePercent(width, "width");
		mutateDeclarations(this, (declarations) => {
			declarations.width = value;
		});
	}
	calculateLayout(width, height, direction = 1) {
		const record = requireNode(void 0, this);
		record.ownerDirection = requireEnum(direction, "calculateLayout direction", [1, 2]);
		syncStyle(record);
		record.runtime.tree.computeLayout({
			root: record.nodeId,
			availableSpace: {
				width: requireCalculationDimension(width, "width"),
				height: requireCalculationDimension(height, "height")
			}
		});
		const layout = record.runtime.tree.getUnroundedLayout(record.nodeId);
		record.layout = {
			left: layout.location.x,
			right: 0,
			top: layout.location.y,
			bottom: 0,
			width: layout.size.width,
			height: layout.size.height
		};
	}
	getComputedLeft() {
		return requireNode(void 0, this).layout.left;
	}
	getComputedRight() {
		return requireNode(void 0, this).layout.right;
	}
	getComputedTop() {
		return requireNode(void 0, this).layout.top;
	}
	getComputedBottom() {
		return requireNode(void 0, this).layout.bottom;
	}
	getComputedWidth() {
		return requireNode(void 0, this).layout.width;
	}
	getComputedHeight() {
		return requireNode(void 0, this).layout.height;
	}
	getComputedLayout() {
		return { ...requireNode(void 0, this).layout };
	}
};
function freeNode(record) {
	record.runtime.tree.remove(record.nodeId);
	record.runtime.nodes.delete(record.nodeId);
	record.alive = false;
}
function createFactories(runtime) {
	return {
		Config: Object.freeze({
			create: () => new YogaConfig(runtime, new ConfigState()),
			destroy: (config) => freeConfig(requireConfig(runtime, config))
		}),
		Node: Object.freeze({
			create: (config) => new YogaNode(runtime, config === void 0 ? runtime.defaultConfig : requireConfig(runtime, config).state),
			createDefault: () => new YogaNode(runtime, runtime.defaultConfig),
			createWithConfig: (config) => new YogaNode(runtime, requireConfig(runtime, config).state),
			destroy: (node) => freeNode(requireNode(runtime, node))
		})
	};
}
function createYoga() {
	const runtime = new FacadeRuntime();
	return Object.freeze({
		...createFactories(runtime),
		...legacyConstants
	});
}
//#endregion
export { PositionType as _, Direction$1 as a, Errata as c, Gutter as d, Justify as f, Overflow$1 as g, NodeType as h, Dimension$1 as i, ExperimentalFeature as l, MeasureMode as m, Align as n, Display$1 as o, LogLevel as p, BoxSizing$1 as r, Edge as s, createYoga as t, FlexDirection$1 as u, Unit as v, Wrap as y };
