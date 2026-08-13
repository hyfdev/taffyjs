import { createRequire } from "node:module";
import "#native";
//#region src/numeric-families.ts
/** Lists the supported display choices as stable numeric constants. */
const Display = Object.freeze({
	/** Selects the Block choice from the Display numeric family. */
	Block: 0,
	/** Selects the FlowRoot choice from the Display numeric family. */
	FlowRoot: 1,
	/** Selects the Flex choice from the Display numeric family. */
	Flex: 2,
	/** Selects the Grid choice from the Display numeric family. */
	Grid: 3,
	/** Selects the None choice from the Display numeric family. */
	None: 4
});
/** Lists the supported box sizing choices as stable numeric constants. */
const BoxSizing = Object.freeze({
	/** Selects the BorderBox choice from the BoxSizing numeric family. */
	BorderBox: 0,
	/** Selects the ContentBox choice from the BoxSizing numeric family. */
	ContentBox: 1
});
/** Lists the supported direction choices as stable numeric constants. */
const Direction = Object.freeze({
	/** Selects the Ltr choice from the Direction numeric family. */
	Ltr: 0,
	/** Selects the Rtl choice from the Direction numeric family. */
	Rtl: 1
});
/** Lists the supported overflow choices as stable numeric constants. */
const Overflow = Object.freeze({
	/** Selects the Visible choice from the Overflow numeric family. */
	Visible: 0,
	/** Selects the Clip choice from the Overflow numeric family. */
	Clip: 1,
	/** Selects the Hidden choice from the Overflow numeric family. */
	Hidden: 2,
	/** Selects the Scroll choice from the Overflow numeric family. */
	Scroll: 3
});
/** Lists the supported float choices as stable numeric constants. */
const Float = Object.freeze({
	/** Selects the Left choice from the Float numeric family. */
	Left: 0,
	/** Selects the Right choice from the Float numeric family. */
	Right: 1,
	/** Selects the None choice from the Float numeric family. */
	None: 2
});
/** Lists the supported clear choices as stable numeric constants. */
const Clear = Object.freeze({
	/** Selects the Left choice from the Clear numeric family. */
	Left: 0,
	/** Selects the Right choice from the Clear numeric family. */
	Right: 1,
	/** Selects the Both choice from the Clear numeric family. */
	Both: 2,
	/** Selects the None choice from the Clear numeric family. */
	None: 3
});
/** Lists the supported position choices as stable numeric constants. */
const Position = Object.freeze({
	/** Selects the Relative choice from the Position numeric family. */
	Relative: 0,
	/** Selects the Absolute choice from the Position numeric family. */
	Absolute: 1
});
/** Lists the supported text align choices as stable numeric constants. */
const TextAlign = Object.freeze({
	/** Selects the Auto choice from the TextAlign numeric family. */
	Auto: 0,
	/** Selects the LegacyLeft choice from the TextAlign numeric family. */
	LegacyLeft: 1,
	/** Selects the LegacyRight choice from the TextAlign numeric family. */
	LegacyRight: 2,
	/** Selects the LegacyCenter choice from the TextAlign numeric family. */
	LegacyCenter: 3
});
/** Lists the supported flex direction choices as stable numeric constants. */
const FlexDirection = Object.freeze({
	/** Selects the Row choice from the FlexDirection numeric family. */
	Row: 0,
	/** Selects the Column choice from the FlexDirection numeric family. */
	Column: 1,
	/** Selects the RowReverse choice from the FlexDirection numeric family. */
	RowReverse: 2,
	/** Selects the ColumnReverse choice from the FlexDirection numeric family. */
	ColumnReverse: 3
});
/** Lists the supported flex wrap choices as stable numeric constants. */
const FlexWrap = Object.freeze({
	/** Selects the NoWrap choice from the FlexWrap numeric family. */
	NoWrap: 0,
	/** Selects the Wrap choice from the FlexWrap numeric family. */
	Wrap: 1,
	/** Selects the WrapReverse choice from the FlexWrap numeric family. */
	WrapReverse: 2
});
/** Lists the supported grid auto flow choices as stable numeric constants. */
const GridAutoFlow = Object.freeze({
	/** Selects the Row choice from the GridAutoFlow numeric family. */
	Row: 0,
	/** Selects the Column choice from the GridAutoFlow numeric family. */
	Column: 1,
	/** Selects the RowDense choice from the GridAutoFlow numeric family. */
	RowDense: 2,
	/** Selects the ColumnDense choice from the GridAutoFlow numeric family. */
	ColumnDense: 3
});
/** Lists the supported align items choices as stable numeric constants. */
const AlignItems = Object.freeze({
	/** Selects the Start choice from the AlignItems numeric family. */
	Start: 0,
	/** Selects the End choice from the AlignItems numeric family. */
	End: 1,
	/** Selects the FlexStart choice from the AlignItems numeric family. */
	FlexStart: 2,
	/** Selects the FlexEnd choice from the AlignItems numeric family. */
	FlexEnd: 3,
	/** Selects the SelfStart choice from the AlignItems numeric family. */
	SelfStart: 4,
	/** Selects the SelfEnd choice from the AlignItems numeric family. */
	SelfEnd: 5,
	/** Selects the Center choice from the AlignItems numeric family. */
	Center: 6,
	/** Selects the Baseline choice from the AlignItems numeric family. */
	Baseline: 7,
	/** Selects the Stretch choice from the AlignItems numeric family. */
	Stretch: 8,
	/** Selects the SafeStart choice from the AlignItems numeric family. */
	SafeStart: 9,
	/** Selects the SafeEnd choice from the AlignItems numeric family. */
	SafeEnd: 10,
	/** Selects the SafeFlexStart choice from the AlignItems numeric family. */
	SafeFlexStart: 11,
	/** Selects the SafeFlexEnd choice from the AlignItems numeric family. */
	SafeFlexEnd: 12,
	/** Selects the SafeSelfStart choice from the AlignItems numeric family. */
	SafeSelfStart: 13,
	/** Selects the SafeSelfEnd choice from the AlignItems numeric family. */
	SafeSelfEnd: 14,
	/** Selects the SafeCenter choice from the AlignItems numeric family. */
	SafeCenter: 15
});
/** Lists the supported align content choices as stable numeric constants. */
const AlignContent = Object.freeze({
	/** Selects the Start choice from the AlignContent numeric family. */
	Start: 0,
	/** Selects the End choice from the AlignContent numeric family. */
	End: 1,
	/** Selects the FlexStart choice from the AlignContent numeric family. */
	FlexStart: 2,
	/** Selects the FlexEnd choice from the AlignContent numeric family. */
	FlexEnd: 3,
	/** Selects the Center choice from the AlignContent numeric family. */
	Center: 4,
	/** Selects the Stretch choice from the AlignContent numeric family. */
	Stretch: 5,
	/** Selects the SpaceBetween choice from the AlignContent numeric family. */
	SpaceBetween: 6,
	/** Selects the SpaceEvenly choice from the AlignContent numeric family. */
	SpaceEvenly: 7,
	/** Selects the SpaceAround choice from the AlignContent numeric family. */
	SpaceAround: 8,
	/** Selects the SafeStart choice from the AlignContent numeric family. */
	SafeStart: 9,
	/** Selects the SafeEnd choice from the AlignContent numeric family. */
	SafeEnd: 10,
	/** Selects the SafeFlexStart choice from the AlignContent numeric family. */
	SafeFlexStart: 11,
	/** Selects the SafeFlexEnd choice from the AlignContent numeric family. */
	SafeFlexEnd: 12,
	/** Selects the SafeCenter choice from the AlignContent numeric family. */
	SafeCenter: 13
});
/** Lists the supported length unit choices as stable numeric constants. */
const LengthUnit = Object.freeze({
	/** Selects the Length choice from the LengthUnit numeric family. */
	Length: 0,
	/** Selects the Percent choice from the LengthUnit numeric family. */
	Percent: 1,
	/** Selects the Auto choice from the LengthUnit numeric family. */
	Auto: 2
});
/** Lists the supported available space kind choices as stable numeric constants. */
const AvailableSpaceKind = Object.freeze({
	/** Selects the Definite choice from the AvailableSpaceKind numeric family. */
	Definite: 0,
	/** Selects the MinContent choice from the AvailableSpaceKind numeric family. */
	MinContent: 1,
	/** Selects the MaxContent choice from the AvailableSpaceKind numeric family. */
	MaxContent: 2
});
/** Lists the supported grid placement kind choices as stable numeric constants. */
const GridPlacementKind = Object.freeze({
	/** Selects the Auto choice from the GridPlacementKind numeric family. */
	Auto: 0,
	/** Selects the Line choice from the GridPlacementKind numeric family. */
	Line: 1,
	/** Selects the NamedLine choice from the GridPlacementKind numeric family. */
	NamedLine: 2,
	/** Selects the Span choice from the GridPlacementKind numeric family. */
	Span: 3,
	/** Selects the NamedSpan choice from the GridPlacementKind numeric family. */
	NamedSpan: 4
});
/** Lists the supported track sizing kind choices as stable numeric constants. */
const TrackSizingKind = Object.freeze({
	/** Selects the Length choice from the TrackSizingKind numeric family. */
	Length: 0,
	/** Selects the Percent choice from the TrackSizingKind numeric family. */
	Percent: 1,
	/** Selects the Auto choice from the TrackSizingKind numeric family. */
	Auto: 2,
	/** Selects the MinContent choice from the TrackSizingKind numeric family. */
	MinContent: 3,
	/** Selects the MaxContent choice from the TrackSizingKind numeric family. */
	MaxContent: 4,
	/** Selects the FitContent choice from the TrackSizingKind numeric family. */
	FitContent: 5,
	/** Selects the Fr choice from the TrackSizingKind numeric family. */
	Fr: 6
});
/** Lists the supported repetition count kind choices as stable numeric constants. */
const RepetitionCountKind = Object.freeze({
	/** Selects the Count choice from the RepetitionCountKind numeric family. */
	Count: 0,
	/** Selects the AutoFill choice from the RepetitionCountKind numeric family. */
	AutoFill: 1,
	/** Selects the AutoFit choice from the RepetitionCountKind numeric family. */
	AutoFit: 2
});
/** Lists the supported grid template component kind choices as stable numeric constants. */
const GridTemplateComponentKind = Object.freeze({
	/** Selects the Single choice from the GridTemplateComponentKind numeric family. */
	Single: 0,
	/** Selects the Repeat choice from the GridTemplateComponentKind numeric family. */
	Repeat: 1
});
/** Lists the supported detailed layout info kind choices as stable numeric constants. */
const DetailedLayoutInfoKind = Object.freeze({
	/** Selects the None choice from the DetailedLayoutInfoKind numeric family. */
	None: 0,
	/** Selects the Grid choice from the DetailedLayoutInfoKind numeric family. */
	Grid: 1
});
//#endregion
//#region src/available-space.ts
const minContent = Object.freeze({ kind: AvailableSpaceKind.MinContent });
const maxContent = Object.freeze({ kind: AvailableSpaceKind.MaxContent });
/** Provides constructors and shared values for readable available-space inputs. */
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
/** Provides constructors and a shared Auto value for Grid placement inputs. */
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
/** Provides constructors and shared values for Grid track sizing inputs. */
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
/** Provides constructors and shared values for Grid repetition counts. */
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
/** Provides constructors for Grid template components. */
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
/** Provides constructors and a shared Auto value for readable dimension inputs. */
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
	unregister(node, raw) {
		const serial = node >> U64_BITS & U64_MAX;
		if (this.#rawByPublic.get(node) !== raw || this.#serialByRaw.get(raw) !== serial) throw codedError("ERR_TAFFY_INTERNAL", "The native and public node registries diverged");
		this.#rawByPublic.delete(node);
		this.#serialByRaw.delete(raw);
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
const secureRandom = (bytes) => globalThis.crypto.getRandomValues(bytes);
/** Creates an independent Taffy tree with its own NodeId namespace. */
const TaffyTree = class TaffyTree {
	#inner;
	#nodes;
	#contexts = /* @__PURE__ */ new Map();
	constructor(...args) {
		const options = args.length === 2 && args[0] === privateConstructor ? args[1] : {};
		this.#nodes = new NodeIdRegistry(options.randomSource ?? secureRandom, options.nextSerial);
		this.#inner = new NativeTaffyTree();
	}
	/** Enables pixel rounding for subsequently computed public layouts. */
	enableRounding() {
		this.#inner.rawEnableRounding("enableRounding");
	}
	/** Disables pixel rounding while retaining unrounded layout values. */
	disableRounding() {
		this.#inner.rawDisableRounding("disableRounding");
	}
	/** Returns the number of live nodes owned by this tree. */
	getNodeCount() {
		return this.#getNodeCount();
	}
	/** Returns the current number of children for one parent. */
	getChildCount(parent) {
		return this.#getChildCount(parent);
	}
	/** Returns the current parent or null for a root node. */
	getParent(node) {
		return this.#getParent(node);
	}
	/** Returns a detached readonly snapshot of the ordered children. */
	getChildren(parent) {
		return this.#getChildren(parent);
	}
	/** Returns the child at the requested parent index. */
	getChildAtIndex(parent, index) {
		return this.#getChildAtIndex(parent, index);
	}
	/** Appends an existing node to the parent child list. */
	addChild(parent, child) {
		this.#addChild(parent, child);
	}
	/** Inserts an existing child at the requested parent index. */
	insertChildAtIndex(parent, index, child) {
		this.#insertChildAtIndex(parent, index, child);
	}
	/** Replaces the complete ordered child list for one parent. */
	setChildren(parent, children) {
		this.#setChildren(parent, children);
	}
	/** Detaches the selected child from its current parent. */
	removeChild(parent, child) {
		this.#removeChild(parent, child);
	}
	/** Detaches and returns the child at the requested index. */
	removeChildAtIndex(parent, index) {
		return this.#removeChildAtIndex(parent, index);
	}
	/** Detaches children in the supplied half-open index range. */
	removeChildrenRange(parent, range) {
		this.#removeChildrenRange(parent, range);
	}
	/** Replaces and returns the child at the requested index. */
	replaceChildAtIndex(parent, index, newChild) {
		return this.#replaceChildAtIndex(parent, index, newChild);
	}
	/** Creates a leaf node from the supplied public style input. */
	newLeaf(style) {
		return this.#newLeaf(style);
	}
	/** Creates a leaf node and associates optional JavaScript context. */
	newLeafWithContext(style, context) {
		return this.#newLeafWithContext(style, context);
	}
	/** Creates a parent node with the supplied ordered children. */
	newWithChildren(style, children) {
		return this.#newWithChildren(style, children);
	}
	/** Removes one node and invalidates its public NodeId. */
	remove(node) {
		this.#remove(node);
	}
	/** Returns the JavaScript context currently associated with one node. */
	getNodeContext(node) {
		return this.#getNodeContext(node);
	}
	/** Replaces or clears the JavaScript context for one node. */
	setNodeContext(node, context) {
		this.#setNodeContext(node, context);
	}
	/** Replaces a node style and marks affected layout state dirty. */
	setStyle(node, style) {
		const raw = this.#nodes.resolve(node);
		this.#inner.rawSetStyle(raw, style, "setStyle");
	}
	/** Returns a detached readable snapshot of the node style. */
	getStyle(node) {
		return this.#getStyle(node);
	}
	/** Returns the most recently stored rounded layout snapshot. */
	getLayout(node) {
		return this.#getLayout(node);
	}
	/** Returns the most recently stored unrounded layout snapshot. */
	getUnroundedLayout(node) {
		return this.#getUnroundedLayout(node);
	}
	/** Returns detailed Grid tracks and item placement when available. */
	getDetailedLayoutInfo(node) {
		return this.#getDetailedLayoutInfo(node);
	}
	/** Explicitly marks a node for layout recomputation. */
	markDirty(node) {
		this.#markDirty(node);
	}
	/** Reports whether a node currently needs layout recomputation. */
	isDirty(node) {
		return this.#isDirty(node);
	}
	/** Removes every node and context value from this tree. */
	clear() {
		this.#clear();
	}
	/** Computes and stores layout for a tree root synchronously. */
	computeLayout(options) {
		this.#computeLayout(options);
	}
	/** Computes synchronously with a per-call measurement callback. */
	computeLayoutWithMeasure(options) {
		this.#computeLayoutWithMeasure(options);
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
	#remove(node) {
		const raw = this.#nodes.resolve(node);
		this.#inner.rawRemove(raw, "remove");
		this.#nodes.unregister(node, raw);
		this.#contexts.delete(node);
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
