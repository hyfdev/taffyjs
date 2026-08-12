import { createRequire } from "node:module";
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
//#region src/grid.ts
const gridPlacementAuto = Object.freeze({ kind: GridPlacementKind.Auto });
const GridPlacement = Object.freeze({
	Auto: gridPlacementAuto,
	Line(index) {
		return {
			kind: GridPlacementKind.Line,
			index
		};
	},
	NamedLine(name, index) {
		return {
			kind: GridPlacementKind.NamedLine,
			name,
			index
		};
	},
	Span(span) {
		return {
			kind: GridPlacementKind.Span,
			span
		};
	},
	NamedSpan(name, span) {
		return {
			kind: GridPlacementKind.NamedSpan,
			name,
			span
		};
	}
});
function frozenTrack(kind) {
	const part = Object.freeze({ kind });
	return Object.freeze({
		min: part,
		max: part
	});
}
const trackAuto = frozenTrack(TrackSizingKind.Auto);
const trackMinContent = frozenTrack(TrackSizingKind.MinContent);
const trackMaxContent = frozenTrack(TrackSizingKind.MaxContent);
const TrackSizingFunction = Object.freeze({
	Length(value) {
		return {
			min: {
				kind: TrackSizingKind.Length,
				value
			},
			max: {
				kind: TrackSizingKind.Length,
				value
			}
		};
	},
	Percent(value) {
		return {
			min: {
				kind: TrackSizingKind.Percent,
				value
			},
			max: {
				kind: TrackSizingKind.Percent,
				value
			}
		};
	},
	Auto: trackAuto,
	MinContent: trackMinContent,
	MaxContent: trackMaxContent,
	FitContent(value) {
		return {
			min: { kind: TrackSizingKind.Auto },
			max: {
				kind: TrackSizingKind.FitContent,
				value
			}
		};
	},
	Fr(value) {
		return {
			min: { kind: TrackSizingKind.Auto },
			max: {
				kind: TrackSizingKind.Fr,
				value
			}
		};
	},
	MinMax(min, max) {
		return {
			min,
			max
		};
	}
});
const autoFill = Object.freeze({ kind: RepetitionCountKind.AutoFill });
const autoFit = Object.freeze({ kind: RepetitionCountKind.AutoFit });
const RepetitionCount = Object.freeze({
	Count(value) {
		return {
			kind: RepetitionCountKind.Count,
			value
		};
	},
	AutoFill: autoFill,
	AutoFit: autoFit
});
const GridTemplateComponent = Object.freeze({
	Single(value) {
		return {
			kind: GridTemplateComponentKind.Single,
			value
		};
	},
	Repeat(count, tracks, lineNames = []) {
		return {
			kind: GridTemplateComponentKind.Repeat,
			value: {
				count,
				tracks,
				lineNames
			}
		};
	}
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
//#region src/node-id.ts
const U64_BITS = 64n;
const TOKEN_SHIFT = 128n;
const U64_MAX = (1n << U64_BITS) - 1n;
const NODE_ID_LIMIT = 1n << 256n;
function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}
function randomToken(randomSource) {
	const bytes = /* @__PURE__ */ new Uint8Array(16);
	randomSource(bytes);
	let token = 0n;
	for (const byte of bytes) token = token << 8n | BigInt(byte);
	return token;
}
function isEncodedNodeId(value) {
	if (value < 0n || value >= NODE_ID_LIMIT) return false;
	return (value >> U64_BITS & U64_MAX) !== 0n;
}
var NodeIdRegistry = class {
	#token;
	#nextSerial;
	#serialByRaw = /* @__PURE__ */ new Map();
	#rawByPublic = /* @__PURE__ */ new Map();
	constructor(randomSource, nextSerial = 1n) {
		this.#token = randomToken(randomSource);
		this.#nextSerial = nextSerial;
	}
	reserveSerial() {
		const serial = this.#nextSerial;
		if (serial < 1n || serial > U64_MAX) throw new RangeError("The per-tree NodeId creation serial is exhausted");
		return serial;
	}
	register(raw, serial) {
		if (serial !== this.#nextSerial || raw < 0n || raw > U64_MAX || this.#serialByRaw.has(raw)) throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
		const node = this.#token << TOKEN_SHIFT | serial << U64_BITS | raw;
		if (this.#rawByPublic.has(node)) throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
		this.#serialByRaw.set(raw, serial);
		this.#rawByPublic.set(node, raw);
		this.#nextSerial = serial + 1n;
		return node;
	}
	resolve(value) {
		if (typeof value !== "bigint") throw new TypeError("NodeId must be a bigint");
		if (!isEncodedNodeId(value)) throw codedError("ERR_TAFFY_INVALID_NODE_ID", "The bigint is not a valid NodeId");
		if (value >> TOKEN_SHIFT !== this.#token) throw codedError("ERR_TAFFY_FOREIGN_NODE_ID", "The NodeId belongs to another TaffyTree");
		const node = value;
		const raw = this.#rawByPublic.get(node);
		if (raw === void 0) throw codedError("ERR_TAFFY_STALE_NODE_ID", "The NodeId no longer names a current node");
		const serial = value >> U64_BITS & U64_MAX;
		if (this.#serialByRaw.get(raw) !== serial) throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
		return raw;
	}
	fromRaw(raw) {
		const serial = this.#serialByRaw.get(raw);
		if (serial === void 0) throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
		const node = this.#token << TOKEN_SHIFT | serial << U64_BITS | raw;
		if (this.#rawByPublic.get(node) !== raw) throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
		return node;
	}
	clear() {
		this.#serialByRaw.clear();
		this.#rawByPublic.clear();
	}
};
//#endregion
//#region src/tree.ts
const { NativeTaffyTree } = createRequire(import.meta.url)("#native");
const privateConstructor = Symbol();
const testAccess = Symbol();
const secureRandom = (bytes) => globalThis.crypto.getRandomValues(bytes);
var TaffyTree = class {
	#inner;
	#nodes;
	#contexts = /* @__PURE__ */ new Map();
	constructor(...args) {
		const options = args.length === 2 && args[0] === privateConstructor ? args[1] : {};
		this.#nodes = new NodeIdRegistry(options.randomSource ?? secureRandom, options.nextSerial);
		this.#inner = new NativeTaffyTree();
	}
	enableRounding() {
		this.#inner.rawEnableRounding("enableRounding");
	}
	disableRounding() {
		this.#inner.rawDisableRounding("disableRounding");
	}
	getNodeCount() {
		return this.#getNodeCount();
	}
	getChildCount(parent) {
		return this.#getChildCount(parent);
	}
	getParent(node) {
		return this.#getParent(node);
	}
	getChildren(parent) {
		return this.#getChildren(parent);
	}
	getChildAtIndex(parent, index) {
		return this.#getChildAtIndex(parent, index);
	}
	addChild(parent, child) {
		this.#addChild(parent, child);
	}
	insertChildAtIndex(parent, index, child) {
		this.#insertChildAtIndex(parent, index, child);
	}
	setChildren(parent, children) {
		this.#setChildren(parent, children);
	}
	removeChild(parent, child) {
		this.#removeChild(parent, child);
	}
	removeChildAtIndex(parent, index) {
		return this.#removeChildAtIndex(parent, index);
	}
	removeChildrenRange(parent, range) {
		this.#removeChildrenRange(parent, range);
	}
	replaceChildAtIndex(parent, index, newChild) {
		return this.#replaceChildAtIndex(parent, index, newChild);
	}
	newLeaf(style) {
		return this.#newLeaf(style);
	}
	newLeafWithContext(style, context) {
		return this.#newLeafWithContext(style, context);
	}
	newWithChildren(style, children) {
		return this.#newWithChildren(style, children);
	}
	getNodeContext(node) {
		return this.#getNodeContext(node);
	}
	setNodeContext(node, context) {
		this.#setNodeContext(node, context);
	}
	setStyle(node, style) {
		const raw = this.#nodes.resolve(node);
		this.#inner.rawSetStyle(raw, style, "setStyle");
	}
	getStyle(node) {
		return this.#getStyle(node);
	}
	getLayout(node) {
		return this.#getLayout(node);
	}
	getUnroundedLayout(node) {
		return this.#getUnroundedLayout(node);
	}
	getDetailedLayoutInfo(node) {
		return this.#getDetailedLayoutInfo(node);
	}
	markDirty(node) {
		this.#markDirty(node);
	}
	isDirty(node) {
		return this.#isDirty(node);
	}
	clear() {
		this.#clear();
	}
	computeLayout(options) {
		this.#computeLayout(options);
	}
	computeLayoutWithMeasure(options) {
		this.#computeLayoutWithMeasure(options);
	}
	[testAccess]() {
		return {
			enableRounding: () => this.#inner.rawEnableRounding("enableRounding"),
			disableRounding: () => this.#inner.rawDisableRounding("disableRounding"),
			newLeaf: (style) => this.#newLeaf(style),
			newLeafWithContext: (style, context) => this.#newLeafWithContext(style, context),
			newWithChildren: (style, children) => this.#newWithChildren(style, children),
			getNodeContext: (node) => this.#getNodeContext(node),
			setNodeContext: (node, context) => this.#setNodeContext(node, context),
			clear: () => this.#clear(),
			getChildCount: (parent) => this.#getChildCount(parent),
			getParent: (node) => this.#getParent(node),
			getChildren: (parent) => this.#getChildren(parent),
			getChildAtIndex: (parent, index) => this.#getChildAtIndex(parent, index),
			addChild: (parent, child) => this.#addChild(parent, child),
			insertChildAtIndex: (parent, index, child) => this.#insertChildAtIndex(parent, index, child),
			setChildren: (parent, children) => this.#setChildren(parent, children),
			removeChild: (parent, child) => this.#removeChild(parent, child),
			removeChildAtIndex: (parent, index) => this.#removeChildAtIndex(parent, index),
			removeChildrenRange: (parent, range) => this.#removeChildrenRange(parent, range),
			replaceChildAtIndex: (parent, index, newChild) => this.#replaceChildAtIndex(parent, index, newChild),
			getNodeCount: () => this.#getNodeCount(),
			getStyle: (node) => this.#getStyle(node),
			getLayout: (node) => this.#getLayout(node),
			getUnroundedLayout: (node) => this.#getUnroundedLayout(node),
			getDetailedLayoutInfo: (node) => this.#getDetailedLayoutInfo(node),
			markDirty: (node) => this.#markDirty(node),
			isDirty: (node) => this.#isDirty(node),
			computeLayout: (options) => this.#computeLayout(options),
			computeLayoutWithMeasure: (options) => this.#computeLayoutWithMeasure(options)
		};
	}
	#newLeaf(style) {
		const serial = this.#nodes.reserveSerial();
		const raw = this.#inner.rawNewLeaf(style, "newLeaf");
		return this.#nodes.register(raw, serial);
	}
	#newLeafWithContext(style, context) {
		const serial = this.#nodes.reserveSerial();
		const hasContext = context !== void 0;
		const raw = this.#inner.rawNewLeafWithContext(style, hasContext, "newLeafWithContext");
		const node = this.#nodes.register(raw, serial);
		if (context !== void 0) this.#contexts.set(node, context);
		return node;
	}
	#newWithChildren(style, children) {
		if (!Array.isArray(children)) throw new TypeError("children must be an array");
		const rawChildren = Array.from(children, (child) => this.#nodes.resolve(child));
		const serial = this.#nodes.reserveSerial();
		const raw = this.#inner.rawNewWithChildren(style, rawChildren, "newWithChildren");
		return this.#nodes.register(raw, serial);
	}
	#getNodeContext(node) {
		this.#nodes.resolve(node);
		return this.#contexts.get(node);
	}
	#setNodeContext(node, context) {
		const raw = this.#nodes.resolve(node);
		this.#inner.rawSetNodeContext(raw, context !== void 0, "setNodeContext");
		if (context === void 0) this.#contexts.delete(node);
		else this.#contexts.set(node, context);
	}
	#clear() {
		this.#inner.rawClear("clear");
		this.#nodes.clear();
		this.#contexts.clear();
	}
	#getChildCount(parent) {
		const rawParent = this.#nodes.resolve(parent);
		return this.#inner.rawChildCount(rawParent, "getChildCount");
	}
	#getParent(node) {
		const rawNode = this.#nodes.resolve(node);
		const rawParent = this.#inner.rawParent(rawNode, "getParent");
		return rawParent === null ? null : this.#nodes.fromRaw(rawParent);
	}
	#getChildren(parent) {
		const rawParent = this.#nodes.resolve(parent);
		return this.#inner.rawChildren(rawParent, "getChildren").map((child) => this.#nodes.fromRaw(child));
	}
	#getNodeCount() {
		return this.#inner.rawNodeCount("getNodeCount");
	}
	#getStyle(node) {
		const raw = this.#nodes.resolve(node);
		return this.#inner.rawGetStyle(raw, "getStyle");
	}
	#getLayout(node) {
		const raw = this.#nodes.resolve(node);
		return this.#inner.rawGetLayout(raw, "getLayout");
	}
	#getUnroundedLayout(node) {
		const raw = this.#nodes.resolve(node);
		return this.#inner.rawGetUnroundedLayout(raw, "getUnroundedLayout");
	}
	#getDetailedLayoutInfo(node) {
		const raw = this.#nodes.resolve(node);
		return this.#inner.rawGetDetailedLayoutInfo(raw, "getDetailedLayoutInfo");
	}
	#markDirty(node) {
		const raw = this.#nodes.resolve(node);
		this.#inner.rawMarkDirty(raw, "markDirty");
	}
	#isDirty(node) {
		const raw = this.#nodes.resolve(node);
		return this.#inner.rawIsDirty(raw, "isDirty");
	}
	#computeLayout(options) {
		const rawRoot = this.#nodes.resolve(options.root);
		this.#inner.rawComputeLayout(rawRoot, options.availableSpace, "computeLayout");
	}
	#computeLayoutWithMeasure(options) {
		const rawRoot = this.#nodes.resolve(options.root);
		const measure = options.measure;
		this.#inner.rawComputeLayoutWithMeasure(rawRoot, options.availableSpace, (value) => {
			const args = value;
			const node = this.#nodes.fromRaw(args.node);
			return measure({
				knownDimensions: args.knownDimensions,
				availableSpace: args.availableSpace,
				node,
				context: this.#contexts.get(node),
				style: args.style
			});
		}, "computeLayoutWithMeasure");
	}
	#getChildAtIndex(parent, index) {
		const rawParent = this.#nodes.resolve(parent);
		const rawChild = this.#inner.rawChildAtIndex(rawParent, index, "getChildAtIndex");
		return this.#nodes.fromRaw(rawChild);
	}
	#addChild(parent, child) {
		const rawParent = this.#nodes.resolve(parent);
		const rawChild = this.#nodes.resolve(child);
		this.#inner.rawAddChild(rawParent, rawChild, "addChild");
	}
	#insertChildAtIndex(parent, index, child) {
		const rawParent = this.#nodes.resolve(parent);
		const rawChild = this.#nodes.resolve(child);
		this.#inner.rawInsertChildAtIndex(rawParent, index, rawChild, "insertChildAtIndex");
	}
	#setChildren(parent, children) {
		const rawParent = this.#nodes.resolve(parent);
		if (!Array.isArray(children)) throw new TypeError("children must be an array");
		const rawChildren = Array.from(children, (child) => this.#nodes.resolve(child));
		this.#inner.rawSetChildren(rawParent, rawChildren, "setChildren");
	}
	#removeChild(parent, child) {
		const rawParent = this.#nodes.resolve(parent);
		const rawChild = this.#nodes.resolve(child);
		this.#inner.rawRemoveChild(rawParent, rawChild, "removeChild");
	}
	#removeChildAtIndex(parent, index) {
		const rawParent = this.#nodes.resolve(parent);
		const rawChild = this.#inner.rawRemoveChildAtIndex(rawParent, index, "removeChildAtIndex");
		return this.#nodes.fromRaw(rawChild);
	}
	#removeChildrenRange(parent, range) {
		const rawParent = this.#nodes.resolve(parent);
		this.#inner.rawRemoveChildrenRange(rawParent, range, "removeChildrenRange");
	}
	#replaceChildAtIndex(parent, index, newChild) {
		const rawParent = this.#nodes.resolve(parent);
		const rawNewChild = this.#nodes.resolve(newChild);
		const rawOldChild = this.#inner.rawReplaceChildAtIndex(rawParent, index, rawNewChild, "replaceChildAtIndex");
		return this.#nodes.fromRaw(rawOldChild);
	}
};
//#endregion
export { AlignContent, AlignItems, AvailableSpace, AvailableSpaceKind, BoxSizing, Clear, DetailedLayoutInfoKind, Dimension, Direction, Display, FlexDirection, FlexWrap, Float, GridAutoFlow, GridPlacement, GridPlacementKind, GridTemplateComponent, GridTemplateComponentKind, LengthUnit, Overflow, Position, RepetitionCount, RepetitionCountKind, TaffyTree, TextAlign, TrackSizingFunction, TrackSizingKind };
