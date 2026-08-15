import { AlignItems, AvailableSpace, Direction, Display, FlexDirection, TaffyTree } from "@taffyjs/node";
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
//#region src/facade.ts
const initialLayout = () => ({
	left: 0,
	right: 0,
	top: 0,
	bottom: 0,
	width: NaN,
	height: NaN
});
var FacadeRuntime = class {
	tree = new TaffyTree();
	nodes = /* @__PURE__ */ new Map();
	defaultConfig = new ConfigState();
	constructor() {
		this.tree.disableRounding();
	}
};
var ConfigState = class {};
const configRecords = /* @__PURE__ */ new WeakMap();
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
function requireDimension(value, name) {
	if (value === void 0 || Number.isNaN(value)) return void 0;
	if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${name} must be a finite number or undefined`);
	return value;
}
function requireCalculationDimension(value, name) {
	if (value === void 0 || value === "auto" || Number.isNaN(value)) return AvailableSpace.MaxContent;
	if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`${name} must be a finite number, auto, or undefined`);
	return value;
}
const nodeRecords = /* @__PURE__ */ new WeakMap();
function styleFor(width, height, direction = Direction.Ltr) {
	return {
		display: Display.Flex,
		direction,
		flexDirection: FlexDirection.Column,
		alignItems: AlignItems.FlexStart,
		size: {
			width,
			height
		}
	};
}
var YogaNode = class {
	constructor(runtime, config) {
		const nodeId = runtime.tree.newLeaf(styleFor(void 0, void 0));
		nodeRecords.set(this, {
			runtime,
			config,
			nodeId,
			alive: true,
			width: void 0,
			height: void 0,
			layout: initialLayout()
		});
		runtime.nodes.set(nodeId, this);
	}
	free() {
		freeNode(requireNode(void 0, this));
	}
	setWidth(value) {
		const record = requireNode(void 0, this);
		const width = requireDimension(value, "width");
		record.runtime.tree.setStyle(record.nodeId, styleFor(width, record.height));
		record.width = width;
	}
	setHeight(value) {
		const record = requireNode(void 0, this);
		const height = requireDimension(value, "height");
		record.runtime.tree.setStyle(record.nodeId, styleFor(record.width, height));
		record.height = height;
	}
	calculateLayout(width, height, direction = 1) {
		const record = requireNode(void 0, this);
		if (direction !== 1 && direction !== 2) throw new TypeError("calculateLayout direction must be LTR or RTL");
		const resolvedDirection = direction === 2 ? Direction.Rtl : Direction.Ltr;
		record.runtime.tree.setStyle(record.nodeId, styleFor(record.width, record.height, resolvedDirection));
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
function requireNode(runtime, value) {
	if (!(value instanceof YogaNode)) throw new TypeError("Expected a Yoga Node");
	const record = nodeRecords.get(value);
	if (record === void 0) throw new Error("Yoga Node state is unavailable");
	if (runtime !== void 0 && record.runtime !== runtime) throw new TypeError("Node belongs to another Yoga facade");
	if (!record.alive) throw new Error("Node has been freed");
	return record;
}
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
export { PositionType as _, Direction$1 as a, Errata as c, Gutter as d, Justify as f, Overflow as g, NodeType as h, Dimension as i, ExperimentalFeature as l, MeasureMode as m, Align as n, Display$1 as o, LogLevel as p, BoxSizing as r, Edge as s, createYoga as t, FlexDirection$1 as u, Unit as v, Wrap as y };
