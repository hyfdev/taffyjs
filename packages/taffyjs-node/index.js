import { createRequire } from "node:module";
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
/** Lists the supported contain choices as stable numeric constants. */
const Contain = Object.freeze({
	/** Selects the None choice from the Contain numeric family. */
	None: 0,
	/** Selects the Layout choice from the Contain numeric family. */
	Layout: 1,
	/** Selects the Paint choice from the Contain numeric family. */
	Paint: 2,
	/** Selects the Content choice from the Contain numeric family. */
	Content: 3
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
//#region src/tagged-values.ts
const dimensionAuto = Object.freeze({ unit: LengthUnit.Auto });
/** Provides complete tagged forms for dimension inputs, including `Dimension.Length(value)`, the form represented by numeric shorthand. */
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
	Auto: dimensionAuto
});
const availableSpaceMinContent = Object.freeze({ kind: AvailableSpaceKind.MinContent });
const availableSpaceMaxContent = Object.freeze({ kind: AvailableSpaceKind.MaxContent });
/** Provides complete tagged forms for available space inputs, including `AvailableSpace.Definite(value)`, the form represented by numeric shorthand. */
const AvailableSpace = Object.freeze({
	Definite(value) {
		return {
			kind: AvailableSpaceKind.Definite,
			value
		};
	},
	MinContent: availableSpaceMinContent,
	MaxContent: availableSpaceMaxContent
});
//#endregion
//#region binding.js
const require = createRequire(import.meta.url);
new URL(".", import.meta.url).pathname;
const { readFileSync } = require("node:fs");
let nativeBinding = null;
const loadErrors = [];
const isMusl = () => {
	let musl = false;
	if (process.platform === "linux") {
		musl = isMuslFromFilesystem();
		if (musl === null) musl = isMuslFromReport();
		if (musl === null) musl = isMuslFromChildProcess();
	}
	return musl;
};
const isFileMusl = (f) => f.includes("libc.musl-") || f.includes("ld-musl-");
const isMuslFromFilesystem = () => {
	try {
		return readFileSync("/usr/bin/ldd", "utf-8").includes("musl");
	} catch {
		return null;
	}
};
const isMuslFromReport = () => {
	let report = null;
	if (process.report && typeof process.report.getReport === "function") {
		process.report.excludeNetwork = true;
		report = process.report.getReport();
	}
	if (!report) return null;
	if (report.header && report.header.glibcVersionRuntime) return false;
	if (Array.isArray(report.sharedObjects)) {
		if (report.sharedObjects.some(isFileMusl)) return true;
	}
	return false;
};
const isMuslFromChildProcess = () => {
	try {
		return require("node:child_process").execSync("ldd --version", { encoding: "utf8" }).includes("musl");
	} catch (e) {
		return false;
	}
};
function requireNative() {
	if (process.env.NAPI_RS_NATIVE_LIBRARY_PATH) try {
		return require(process.env.NAPI_RS_NATIVE_LIBRARY_PATH);
	} catch (err) {
		loadErrors.push(err);
	}
	else if (process.platform === "android") if (process.arch === "arm64") {
		try {
			return require("./taffyjs.android-arm64.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-android-arm64");
			const bindingPackageVersion = require("@taffyjs/binding-android-arm64/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else if (process.arch === "arm") {
		try {
			return require("./taffyjs.android-arm-eabi.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-android-arm-eabi");
			const bindingPackageVersion = require("@taffyjs/binding-android-arm-eabi/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else loadErrors.push(/* @__PURE__ */ new Error(`Unsupported architecture on Android ${process.arch}`));
	else if (process.platform === "win32") if (process.arch === "x64") if (process.config && process.config.variables && process.config.variables.shlib_suffix === "dll.a" || process.config && process.config.variables && process.config.variables.node_target_type === "shared_library") {
		try {
			return require("./taffyjs.win32-x64-gnu.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-win32-x64-gnu");
			const bindingPackageVersion = require("@taffyjs/binding-win32-x64-gnu/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else {
		try {
			return require("./taffyjs.win32-x64-msvc.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-win32-x64-msvc");
			const bindingPackageVersion = require("@taffyjs/binding-win32-x64-msvc/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	}
	else if (process.arch === "ia32") {
		try {
			return require("./taffyjs.win32-ia32-msvc.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-win32-ia32-msvc");
			const bindingPackageVersion = require("@taffyjs/binding-win32-ia32-msvc/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else if (process.arch === "arm64") {
		try {
			return require("./taffyjs.win32-arm64-msvc.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-win32-arm64-msvc");
			const bindingPackageVersion = require("@taffyjs/binding-win32-arm64-msvc/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else loadErrors.push(/* @__PURE__ */ new Error(`Unsupported architecture on Windows: ${process.arch}`));
	else if (process.platform === "darwin") {
		try {
			return require("./taffyjs.darwin-universal.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-darwin-universal");
			const bindingPackageVersion = require("@taffyjs/binding-darwin-universal/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
		if (process.arch === "x64") {
			try {
				return require("./taffyjs.darwin-x64.node");
			} catch (e) {
				loadErrors.push(e);
			}
			try {
				const binding = require("@taffyjs/binding-darwin-x64");
				const bindingPackageVersion = require("@taffyjs/binding-darwin-x64/package.json").version;
				if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
				return binding;
			} catch (e) {
				loadErrors.push(e);
			}
		} else if (process.arch === "arm64") {
			try {
				return require("./taffyjs.darwin-arm64.node");
			} catch (e) {
				loadErrors.push(e);
			}
			try {
				const binding = require("@taffyjs/binding-darwin-arm64");
				const bindingPackageVersion = require("@taffyjs/binding-darwin-arm64/package.json").version;
				if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
				return binding;
			} catch (e) {
				loadErrors.push(e);
			}
		} else loadErrors.push(/* @__PURE__ */ new Error(`Unsupported architecture on macOS: ${process.arch}`));
	} else if (process.platform === "freebsd") if (process.arch === "x64") {
		try {
			return require("./taffyjs.freebsd-x64.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-freebsd-x64");
			const bindingPackageVersion = require("@taffyjs/binding-freebsd-x64/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else if (process.arch === "arm64") {
		try {
			return require("./taffyjs.freebsd-arm64.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-freebsd-arm64");
			const bindingPackageVersion = require("@taffyjs/binding-freebsd-arm64/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else loadErrors.push(/* @__PURE__ */ new Error(`Unsupported architecture on FreeBSD: ${process.arch}`));
	else if (process.platform === "linux") if (process.arch === "x64") if (isMusl()) {
		try {
			return require("./taffyjs.linux-x64-musl.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-x64-musl");
			const bindingPackageVersion = require("@taffyjs/binding-linux-x64-musl/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else {
		try {
			return require("./taffyjs.linux-x64-gnu.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-x64-gnu");
			const bindingPackageVersion = require("@taffyjs/binding-linux-x64-gnu/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	}
	else if (process.arch === "arm64") if (isMusl()) {
		try {
			return require("./taffyjs.linux-arm64-musl.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-arm64-musl");
			const bindingPackageVersion = require("@taffyjs/binding-linux-arm64-musl/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else {
		try {
			return require("./taffyjs.linux-arm64-gnu.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-arm64-gnu");
			const bindingPackageVersion = require("@taffyjs/binding-linux-arm64-gnu/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	}
	else if (process.arch === "arm") if (isMusl()) {
		try {
			return require("./taffyjs.linux-arm-musleabihf.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-arm-musleabihf");
			const bindingPackageVersion = require("@taffyjs/binding-linux-arm-musleabihf/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else {
		try {
			return require("./taffyjs.linux-arm-gnueabihf.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-arm-gnueabihf");
			const bindingPackageVersion = require("@taffyjs/binding-linux-arm-gnueabihf/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	}
	else if (process.arch === "loong64") if (isMusl()) {
		try {
			return require("./taffyjs.linux-loong64-musl.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-loong64-musl");
			const bindingPackageVersion = require("@taffyjs/binding-linux-loong64-musl/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else {
		try {
			return require("./taffyjs.linux-loong64-gnu.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-loong64-gnu");
			const bindingPackageVersion = require("@taffyjs/binding-linux-loong64-gnu/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	}
	else if (process.arch === "riscv64") if (isMusl()) {
		try {
			return require("./taffyjs.linux-riscv64-musl.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-riscv64-musl");
			const bindingPackageVersion = require("@taffyjs/binding-linux-riscv64-musl/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else {
		try {
			return require("./taffyjs.linux-riscv64-gnu.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-riscv64-gnu");
			const bindingPackageVersion = require("@taffyjs/binding-linux-riscv64-gnu/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	}
	else if (process.arch === "ppc64") {
		try {
			return require("./taffyjs.linux-ppc64-gnu.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-ppc64-gnu");
			const bindingPackageVersion = require("@taffyjs/binding-linux-ppc64-gnu/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else if (process.arch === "s390x") {
		try {
			return require("./taffyjs.linux-s390x-gnu.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-linux-s390x-gnu");
			const bindingPackageVersion = require("@taffyjs/binding-linux-s390x-gnu/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else loadErrors.push(/* @__PURE__ */ new Error(`Unsupported architecture on Linux: ${process.arch}`));
	else if (process.platform === "openharmony") if (process.arch === "arm64") {
		try {
			return require("./taffyjs.openharmony-arm64.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-openharmony-arm64");
			const bindingPackageVersion = require("@taffyjs/binding-openharmony-arm64/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else if (process.arch === "x64") {
		try {
			return require("./taffyjs.openharmony-x64.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-openharmony-x64");
			const bindingPackageVersion = require("@taffyjs/binding-openharmony-x64/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else if (process.arch === "arm") {
		try {
			return require("./taffyjs.openharmony-arm.node");
		} catch (e) {
			loadErrors.push(e);
		}
		try {
			const binding = require("@taffyjs/binding-openharmony-arm");
			const bindingPackageVersion = require("@taffyjs/binding-openharmony-arm/package.json").version;
			if (bindingPackageVersion !== "0.0.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") throw new Error(`Native binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
			return binding;
		} catch (e) {
			loadErrors.push(e);
		}
	} else loadErrors.push(/* @__PURE__ */ new Error(`Unsupported architecture on OpenHarmony: ${process.arch}`));
	else loadErrors.push(/* @__PURE__ */ new Error(`Unsupported OS: ${process.platform}, architecture: ${process.arch}`));
}
function createLoadErrorChain(errors) {
	return errors.reduce((previous, current) => {
		let message;
		try {
			message = current && typeof current.message === "string" ? current.message : String(current);
		} catch {
			message = "Unknown error";
		}
		const error = new Error(message);
		error.cause = previous;
		return error;
	}, null);
}
const __napiWasiFlavors = ["wasm32-wasi"];
const __napiWasiFlavor = process.env.NAPI_RS_WASI_FLAVOR;
const __napiWasiFlavorRequested = typeof __napiWasiFlavor === "string" && __napiWasiFlavor.length > 0;
if (__napiWasiFlavorRequested && __napiWasiFlavors.indexOf(__napiWasiFlavor) === -1) throw new Error("Unsupported WASI flavor \"" + __napiWasiFlavor + "\". Available flavors: " + __napiWasiFlavors.join(", "));
const forceWasiError = process.env.NAPI_RS_FORCE_WASI === "error";
const forceWasi = process.env.NAPI_RS_FORCE_WASI === "true" || forceWasiError || __napiWasiFlavorRequested;
if (!forceWasi) nativeBinding = requireNative();
if (!nativeBinding || forceWasi) {
	let wasiBinding = null;
	let wasiBindingLoaded = false;
	const wasiBindingErrors = [];
	const __napiWasiResolveCandidate = (specifier, isPackage, localArtifacts) => {
		try {
			require.resolve(specifier);
		} catch (resolveError) {
			if (!resolveError || resolveError.code !== "MODULE_NOT_FOUND") throw resolveError;
			if (isPackage) {
				try {
					require.resolve(specifier + "/package.json");
				} catch (packageError) {
					if (packageError && packageError.code === "MODULE_NOT_FOUND") return resolveError;
					throw resolveError;
				}
				throw resolveError;
			}
			return resolveError;
		}
		if (localArtifacts) {
			let artifactError = null;
			for (let i = 0; i < localArtifacts.length; i++) try {
				require.resolve(localArtifacts[i]);
				return null;
			} catch (resolveError) {
				if (!resolveError || resolveError.code !== "MODULE_NOT_FOUND") throw resolveError;
				artifactError = resolveError;
			}
			return artifactError;
		}
		return null;
	};
	if (!wasiBindingLoaded && (!__napiWasiFlavorRequested || __napiWasiFlavor === "wasm32-wasi")) {
		let candidateError = null;
		let candidateFailed = false;
		try {
			candidateError = __napiWasiResolveCandidate("./taffyjs.wasi.cjs", false, ["./taffyjs.wasm32-wasi.debug.wasm", "./taffyjs.wasm32-wasi.wasm"]);
			candidateFailed = candidateError !== null;
			if (!candidateFailed) {
				wasiBinding = require("./taffyjs.wasi.cjs");
				nativeBinding = wasiBinding;
				wasiBindingLoaded = true;
			}
		} catch (err) {
			candidateError = err;
			candidateFailed = true;
		}
		if (candidateFailed) {
			wasiBindingErrors.push(candidateError);
			loadErrors.push(candidateError);
		}
	}
	if (!wasiBindingLoaded && (!__napiWasiFlavorRequested || __napiWasiFlavor === "wasm32-wasi")) {
		let candidateError = null;
		let candidateFailed = false;
		try {
			candidateError = __napiWasiResolveCandidate("@taffyjs/binding-wasm32-wasi", true, void 0);
			candidateFailed = candidateError !== null;
			if (!candidateFailed) {
				if (process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
					const bindingPackageVersion = require("@taffyjs/binding-wasm32-wasi/package.json").version;
					if (bindingPackageVersion !== "0.0.0") throw new Error(`WASI binding package version mismatch, expected 0.0.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
				}
				wasiBinding = require("@taffyjs/binding-wasm32-wasi");
				nativeBinding = wasiBinding;
				wasiBindingLoaded = true;
			}
		} catch (err) {
			candidateError = err;
			candidateFailed = true;
		}
		if (candidateFailed) {
			wasiBindingErrors.push(candidateError);
			loadErrors.push(candidateError);
		}
	}
	if (!wasiBindingLoaded && forceWasi && !forceWasiError && !__napiWasiFlavorRequested) nativeBinding = requireNative();
	if ((forceWasiError || __napiWasiFlavorRequested) && !wasiBindingLoaded) {
		const error = /* @__PURE__ */ new Error(__napiWasiFlavorRequested ? "WASI binding for flavor \"" + __napiWasiFlavor + "\" not found" : "WASI binding not found and NAPI_RS_FORCE_WASI is set to error");
		error.cause = createLoadErrorChain(wasiBindingErrors);
		throw error;
	}
}
if (!nativeBinding) {
	if (loadErrors.length > 0) {
		const error = /* @__PURE__ */ new Error("Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.");
		error.cause = createLoadErrorChain(loadErrors);
		throw error;
	}
	throw new Error(`Failed to load native binding`);
}
const { BindingTaffyTree } = nativeBinding;
//#endregion
//#region src/layout-codec.ts
const ORDER_SLOT = 0;
const LOCATION_X_SLOT = 1;
const LOCATION_Y_SLOT = 2;
const SIZE_WIDTH_SLOT = 3;
const SIZE_HEIGHT_SLOT = 4;
const SCROLLABLE_OVERFLOW_RECT_LEFT_SLOT = 5;
const SCROLLABLE_OVERFLOW_RECT_RIGHT_SLOT = 6;
const SCROLLABLE_OVERFLOW_RECT_TOP_SLOT = 7;
const SCROLLABLE_OVERFLOW_RECT_BOTTOM_SLOT = 8;
const SCROLLBAR_SIZE_WIDTH_SLOT = 9;
const SCROLLBAR_SIZE_HEIGHT_SLOT = 10;
const BORDER_LEFT_SLOT = 11;
const BORDER_RIGHT_SLOT = 12;
const BORDER_TOP_SLOT = 13;
const BORDER_BOTTOM_SLOT = 14;
const PADDING_LEFT_SLOT = 15;
const PADDING_RIGHT_SLOT = 16;
const PADDING_TOP_SLOT = 17;
const PADDING_BOTTOM_SLOT = 18;
const MARGIN_LEFT_SLOT = 19;
const MARGIN_RIGHT_SLOT = 20;
const MARGIN_TOP_SLOT = 21;
const MARGIN_BOTTOM_SLOT = 22;
function decodeLayout(output) {
	return {
		order: output[ORDER_SLOT],
		location: {
			x: output[LOCATION_X_SLOT],
			y: output[LOCATION_Y_SLOT]
		},
		size: {
			width: output[SIZE_WIDTH_SLOT],
			height: output[SIZE_HEIGHT_SLOT]
		},
		scrollableOverflowRect: {
			left: output[SCROLLABLE_OVERFLOW_RECT_LEFT_SLOT],
			right: output[SCROLLABLE_OVERFLOW_RECT_RIGHT_SLOT],
			top: output[SCROLLABLE_OVERFLOW_RECT_TOP_SLOT],
			bottom: output[SCROLLABLE_OVERFLOW_RECT_BOTTOM_SLOT]
		},
		scrollbarSize: {
			width: output[SCROLLBAR_SIZE_WIDTH_SLOT],
			height: output[SCROLLBAR_SIZE_HEIGHT_SLOT]
		},
		border: {
			left: output[BORDER_LEFT_SLOT],
			right: output[BORDER_RIGHT_SLOT],
			top: output[BORDER_TOP_SLOT],
			bottom: output[BORDER_BOTTOM_SLOT]
		},
		padding: {
			left: output[PADDING_LEFT_SLOT],
			right: output[PADDING_RIGHT_SLOT],
			top: output[PADDING_TOP_SLOT],
			bottom: output[PADDING_BOTTOM_SLOT]
		},
		margin: {
			left: output[MARGIN_LEFT_SLOT],
			right: output[MARGIN_RIGHT_SLOT],
			top: output[MARGIN_TOP_SLOT],
			bottom: output[MARGIN_BOTTOM_SLOT]
		}
	};
}
//#endregion
//#region src/node-id.ts
const U64_MAX = (1n << 64n) - 1n;
function toRawNodeId(value) {
	if (typeof value !== "bigint" || value < 0n || value > U64_MAX) throw new TypeError("NodeId must be a non-negative u64 bigint");
	return value;
}
//#endregion
//#region src/style-codec.ts
const COMMON_STYLE_BUFFER_SIZE = 1024;
const INITIAL_OVERSIZED_STYLE_BUFFER_SIZE = 65536;
const STYLE_MAGIC_0 = 84;
const STYLE_MAGIC_1 = 83;
const SCALAR_GEOMETRY = 128;
const POINT_FIELDS = /* @__PURE__ */ new Set(["x", "y"]);
const SIZE_FIELDS = /* @__PURE__ */ new Set(["width", "height"]);
const RECT_FIELDS = /* @__PURE__ */ new Set([
	"left",
	"right",
	"top",
	"bottom"
]);
const LINE_FIELDS = /* @__PURE__ */ new Set(["start", "end"]);
const textEncoder = new TextEncoder();
const sharedStyleBuffer = new Uint8Array(COMMON_STYLE_BUFFER_SIZE);
let sharedStyleEncoder;
let sharedStyleBufferInUse = false;
function typeError(name, expected) {
	return /* @__PURE__ */ new TypeError(`${name} must be ${expected}`);
}
function rangeError(name, expected) {
	return /* @__PURE__ */ new RangeError(`${name} must be ${expected}`);
}
function inputObject(value, name) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw typeError(name, "an object");
	return value;
}
function inputArray(value, name) {
	if (!Array.isArray(value)) throw typeError(name, "an array");
	if (value.length > 4294967295) throw rangeError(name, "no longer than 2^32 - 1");
	return value;
}
function inputNumber(value, name) {
	if (typeof value !== "number") throw typeError(name, "a number");
	return value;
}
function inputString(value, name) {
	if (typeof value !== "string") throw typeError(name, "a string");
	return value;
}
function inputInteger(value, minimum, maximum, name) {
	const number = inputNumber(value, name);
	if (!Number.isInteger(number) || number < minimum || number > maximum) throw rangeError(name, `an integer from ${minimum} through ${maximum}`);
	return number;
}
function validateFields(value, allowedFields, name) {
	for (const field of Object.keys(value)) if (!allowedFields.has(field)) throw typeError(name, "free of unknown fields");
}
function geometryObject(value, allowedFields, name) {
	const object = inputObject(value, name);
	validateFields(object, allowedFields, name);
	return object;
}
function withStyleEncoder(style, wireVersion, presenceBytes, use) {
	inputObject(style, "Style");
	const usesSharedBuffer = !sharedStyleBufferInUse;
	if (usesSharedBuffer) sharedStyleBufferInUse = true;
	const encoder = usesSharedBuffer ? sharedStyleEncoder ??= new StyleEncoder(sharedStyleBuffer) : new StyleEncoder(new Uint8Array(COMMON_STYLE_BUFFER_SIZE));
	encoder.reset(wireVersion, presenceBytes);
	try {
		return use(encoder);
	} finally {
		if (usesSharedBuffer) {
			encoder.releaseTemporaryStorage();
			sharedStyleBufferInUse = false;
		}
	}
}
var StyleEncoder = class {
	#initialBytes;
	#initialView;
	#bytes;
	#view;
	#offset;
	#presenceOffset = 4;
	constructor(bytes) {
		this.#initialBytes = bytes;
		this.#initialView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
		this.#bytes = bytes;
		this.#view = this.#initialView;
		this.#offset = 0;
	}
	reset(wireVersion, presenceBytes) {
		this.releaseTemporaryStorage();
		this.#offset = this.#presenceOffset + presenceBytes;
		this.#bytes.fill(0, 0, this.#offset);
		this.#bytes[0] = STYLE_MAGIC_0;
		this.#bytes[1] = STYLE_MAGIC_1;
		this.#bytes[2] = wireVersion;
		this.#bytes[3] = presenceBytes;
	}
	releaseTemporaryStorage() {
		this.#bytes = this.#initialBytes;
		this.#view = this.#initialView;
	}
	field(index) {
		this.#bytes[this.#presenceOffset + (index >> 3)] |= 1 << (index & 7);
	}
	finish() {
		return this.#bytes.subarray(0, this.#offset);
	}
	boolean(value, name) {
		if (typeof value !== "boolean") throw typeError(name, "a boolean");
		this.#u8(value ? 1 : 0);
	}
	number(value, name) {
		this.#f64(inputNumber(value, name));
	}
	nullableNumber(value, name) {
		if (value === null) {
			this.#u8(0);
			return;
		}
		this.#u8(1);
		this.number(value, name);
	}
	enumeration(value, mask, name) {
		const code = inputInteger(value, 0, 30, name);
		if ((mask & 1 << code) === 0) throw rangeError(name, "a supported enum value");
		this.#u8(code);
	}
	nullableEnumeration(value, mask, name) {
		if (value === null) {
			this.#u8(0);
			return;
		}
		this.#u8(1);
		this.enumeration(value, mask, name);
	}
	partialPointEnumeration(value, mask, name) {
		const object = geometryObject(value, POINT_FIELDS, name);
		const x = object.x;
		const y = object.y;
		this.#u8((x === void 0 ? 0 : 1) | (y === void 0 ? 0 : 2));
		if (x !== void 0) this.enumeration(x, mask, `${name}.x`);
		if (y !== void 0) this.enumeration(y, mask, `${name}.y`);
	}
	partialRectLengthPercentageAuto(value, name) {
		if (this.#isLengthInput(value, name)) {
			this.#u8(SCALAR_GEOMETRY);
			this.#length(value, true, name);
			return;
		}
		const object = geometryObject(value, RECT_FIELDS, name);
		const left = object.left;
		const right = object.right;
		const top = object.top;
		const bottom = object.bottom;
		this.#u8((left === void 0 ? 0 : 1) | (right === void 0 ? 0 : 2) | (top === void 0 ? 0 : 4) | (bottom === void 0 ? 0 : 8));
		if (left !== void 0) this.#length(left, true, `${name}.left`);
		if (right !== void 0) this.#length(right, true, `${name}.right`);
		if (top !== void 0) this.#length(top, true, `${name}.top`);
		if (bottom !== void 0) this.#length(bottom, true, `${name}.bottom`);
	}
	partialSizeDimension(value, name) {
		if (this.#isLengthInput(value, name)) {
			this.#u8(SCALAR_GEOMETRY);
			this.#length(value, true, name);
			return;
		}
		const object = geometryObject(value, SIZE_FIELDS, name);
		const width = object.width;
		const height = object.height;
		this.#u8((width === void 0 ? 0 : 1) | (height === void 0 ? 0 : 2));
		if (width !== void 0) this.#length(width, true, `${name}.width`);
		if (height !== void 0) this.#length(height, true, `${name}.height`);
	}
	partialRectLengthPercentage(value, name) {
		if (this.#isLengthInput(value, name)) {
			this.#u8(SCALAR_GEOMETRY);
			this.#length(value, false, name);
			return;
		}
		const object = geometryObject(value, RECT_FIELDS, name);
		const left = object.left;
		const right = object.right;
		const top = object.top;
		const bottom = object.bottom;
		this.#u8((left === void 0 ? 0 : 1) | (right === void 0 ? 0 : 2) | (top === void 0 ? 0 : 4) | (bottom === void 0 ? 0 : 8));
		if (left !== void 0) this.#length(left, false, `${name}.left`);
		if (right !== void 0) this.#length(right, false, `${name}.right`);
		if (top !== void 0) this.#length(top, false, `${name}.top`);
		if (bottom !== void 0) this.#length(bottom, false, `${name}.bottom`);
	}
	partialSizeLengthPercentage(value, name) {
		if (this.#isLengthInput(value, name)) {
			this.#u8(SCALAR_GEOMETRY);
			this.#length(value, false, name);
			return;
		}
		const object = geometryObject(value, SIZE_FIELDS, name);
		const width = object.width;
		const height = object.height;
		this.#u8((width === void 0 ? 0 : 1) | (height === void 0 ? 0 : 2));
		if (width !== void 0) this.#length(width, false, `${name}.width`);
		if (height !== void 0) this.#length(height, false, `${name}.height`);
	}
	dimension(value, name) {
		this.#length(value, true, name);
	}
	gridTemplateComponents(value, name) {
		const values = inputArray(value, name);
		this.#u32(values.length);
		for (let index = 0; index < values.length; index += 1) this.#gridTemplateComponent(values[index], `${name}[${index}]`);
	}
	trackSizingFunctions(value, name) {
		const values = inputArray(value, name);
		this.#u32(values.length);
		for (let index = 0; index < values.length; index += 1) this.#trackSizingFunction(values[index], `${name}[${index}]`);
	}
	nullableGridTemplateAreas(value, name) {
		if (value === null) {
			this.#u8(0);
			return;
		}
		this.#u8(1);
		const object = inputObject(value, name);
		const areas = inputArray(object.areas, `${name}.areas`);
		const rowCount = inputInteger(object.rowCount, 0, 65535, `${name}.rowCount`);
		const columnCount = inputInteger(object.columnCount, 0, 65535, `${name}.columnCount`);
		this.#u32(areas.length);
		for (let index = 0; index < areas.length; index += 1) {
			const areaName = `${name}.areas[${index}]`;
			const area = inputObject(areas[index], areaName);
			const gridName = inputString(area.name, `${areaName}.name`);
			const rowStart = inputInteger(area.rowStart, 0, 65535, `${areaName}.rowStart`);
			const rowEnd = inputInteger(area.rowEnd, 0, 65535, `${areaName}.rowEnd`);
			const columnStart = inputInteger(area.columnStart, 0, 65535, `${areaName}.columnStart`);
			const columnEnd = inputInteger(area.columnEnd, 0, 65535, `${areaName}.columnEnd`);
			this.#string(gridName, `${areaName}.name`);
			this.#u16(rowStart);
			this.#u16(rowEnd);
			this.#u16(columnStart);
			this.#u16(columnEnd);
		}
		this.#u16(rowCount);
		this.#u16(columnCount);
	}
	stringMatrix(value, name) {
		this.#stringMatrix(value, name);
	}
	partialLineGridPlacement(value, name) {
		const object = geometryObject(value, LINE_FIELDS, name);
		const start = object.start;
		const end = object.end;
		this.#u8((start === void 0 ? 0 : 1) | (end === void 0 ? 0 : 2));
		if (start !== void 0) this.#gridPlacement(start, `${name}.start`);
		if (end !== void 0) this.#gridPlacement(end, `${name}.end`);
	}
	#isLengthInput(value, name) {
		if (typeof value === "number") return true;
		const unit = inputObject(value, name).unit;
		if (unit === void 0 || unit === null) return false;
		inputNumber(unit, `${name}.unit`);
		return true;
	}
	#length(value, allowAuto, name) {
		if (typeof value === "number") {
			this.#u8(LengthUnit.Length);
			this.#f64(value);
			return;
		}
		const object = inputObject(value, name);
		const unit = inputInteger(object.unit, 0, 255, `${name}.unit`);
		if (unit !== LengthUnit.Length && unit !== LengthUnit.Percent && unit !== LengthUnit.Auto) throw rangeError(`${name}.unit`, "a supported length unit");
		const payload = object.value;
		if (payload !== void 0) inputNumber(payload, `${name}.value`);
		if (unit === LengthUnit.Auto) {
			if (!allowAuto) throw typeError(name, "a non-Auto length");
			this.#u8(unit);
			return;
		}
		this.#u8(unit);
		this.#f64(inputNumber(payload, `${name}.value`));
	}
	#gridPlacement(value, name) {
		const object = inputObject(value, name);
		const kind = inputInteger(object.kind, 0, 255, `${name}.kind`);
		if (kind !== GridPlacementKind.Auto && kind !== GridPlacementKind.Line && kind !== GridPlacementKind.NamedLine && kind !== GridPlacementKind.Span && kind !== GridPlacementKind.NamedSpan) throw rangeError(`${name}.kind`, "a supported Grid placement kind");
		const gridName = object.name;
		const index = object.index;
		const span = object.span;
		this.#u8(kind);
		if (kind === GridPlacementKind.Line) this.#i16(inputInteger(index, -32768, 32767, `${name}.index`));
		else if (kind === GridPlacementKind.NamedLine) {
			this.#string(inputString(gridName, `${name}.name`), `${name}.name`);
			this.#i16(inputInteger(index, -32768, 32767, `${name}.index`));
		} else if (kind === GridPlacementKind.Span) this.#u16(inputInteger(span, 0, 65535, `${name}.span`));
		else if (kind === GridPlacementKind.NamedSpan) {
			this.#string(inputString(gridName, `${name}.name`), `${name}.name`);
			this.#u16(inputInteger(span, 0, 65535, `${name}.span`));
		}
	}
	#trackSizingFunction(value, name) {
		const object = inputObject(value, name);
		const minimum = object.min;
		const maximum = object.max;
		if (minimum === void 0) throw typeError(`${name}.min`, "present");
		if (maximum === void 0) throw typeError(`${name}.max`, "present");
		this.#trackSizingValue(minimum, false, `${name}.min`);
		this.#trackSizingValue(maximum, true, `${name}.max`);
	}
	#trackSizingValue(value, maximum, name) {
		const object = inputObject(value, name);
		const kind = inputInteger(object.kind, 0, 255, `${name}.kind`);
		if (kind !== TrackSizingKind.Length && kind !== TrackSizingKind.Percent && kind !== TrackSizingKind.Auto && kind !== TrackSizingKind.MinContent && kind !== TrackSizingKind.MaxContent && kind !== TrackSizingKind.FitContent && kind !== TrackSizingKind.Fr) throw rangeError(`${name}.kind`, "a supported track sizing kind");
		const payload = object.value;
		if (!maximum && (kind === TrackSizingKind.FitContent || kind === TrackSizingKind.Fr)) throw typeError(name, "a valid minimum track value");
		this.#u8(kind);
		if (kind === TrackSizingKind.Length || kind === TrackSizingKind.Percent || kind === TrackSizingKind.Fr) this.#f64(inputNumber(payload, `${name}.value`));
		else if (kind === TrackSizingKind.FitContent) this.#length(payload, false, `${name}.value`);
	}
	#gridTemplateComponent(value, name) {
		const object = inputObject(value, name);
		const kind = inputInteger(object.kind, 0, 255, `${name}.kind`);
		if (kind !== GridTemplateComponentKind.Single && kind !== GridTemplateComponentKind.Repeat) throw rangeError(`${name}.kind`, "a supported Grid template component kind");
		const payload = object.value;
		if (payload === void 0) throw typeError(`${name}.value`, "present");
		this.#u8(kind);
		if (kind === GridTemplateComponentKind.Single) {
			this.#trackSizingFunction(payload, `${name}.value`);
			return;
		}
		const repetition = inputObject(payload, `${name}.value`);
		const count = repetition.count;
		const tracks = repetition.tracks;
		const lineNames = repetition.lineNames;
		if (count === void 0) throw typeError(`${name}.value.count`, "present");
		this.#repetitionCount(count, `${name}.value.count`);
		this.trackSizingFunctions(tracks, `${name}.value.tracks`);
		this.#stringMatrix(lineNames, `${name}.value.lineNames`);
	}
	#repetitionCount(value, name) {
		const object = inputObject(value, name);
		const kind = inputInteger(object.kind, 0, 255, `${name}.kind`);
		if (kind !== RepetitionCountKind.Count && kind !== RepetitionCountKind.AutoFill && kind !== RepetitionCountKind.AutoFit) throw rangeError(`${name}.kind`, "a supported repetition count kind");
		const payload = object.value;
		this.#u8(kind);
		if (kind === RepetitionCountKind.Count) this.#u16(inputInteger(payload, 0, 65535, `${name}.value`));
	}
	#stringMatrix(value, name) {
		const rows = inputArray(value, name);
		this.#u32(rows.length);
		for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
			const rowName = `${name}[${rowIndex}]`;
			const row = inputArray(rows[rowIndex], rowName);
			this.#u32(row.length);
			for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
				const valueName = `${rowName}[${columnIndex}]`;
				this.#string(inputString(row[columnIndex], valueName), valueName);
			}
		}
	}
	#ensure(additional) {
		const required = this.#offset + additional;
		if (required <= this.#bytes.length) return;
		let capacity = Math.max(this.#bytes.length, INITIAL_OVERSIZED_STYLE_BUFFER_SIZE);
		while (capacity < required) {
			capacity *= 2;
			if (!Number.isSafeInteger(capacity)) throw rangeError("Encoded Style", "representable");
		}
		const next = new Uint8Array(capacity);
		next.set(this.#bytes.subarray(0, this.#offset));
		this.#bytes = next;
		this.#view = new DataView(next.buffer);
	}
	#u8(value) {
		this.#ensure(1);
		this.#bytes[this.#offset] = value;
		this.#offset += 1;
	}
	#u16(value) {
		this.#ensure(2);
		this.#view.setUint16(this.#offset, value, true);
		this.#offset += 2;
	}
	#i16(value) {
		this.#ensure(2);
		this.#view.setInt16(this.#offset, value, true);
		this.#offset += 2;
	}
	#u32(value) {
		this.#ensure(4);
		this.#view.setUint32(this.#offset, value, true);
		this.#offset += 4;
	}
	#f64(value) {
		this.#ensure(8);
		this.#view.setFloat64(this.#offset, value, true);
		this.#offset += 8;
	}
	#string(value, name) {
		const maximumLength = value.length * 3;
		if (!Number.isSafeInteger(maximumLength) || maximumLength > 4294967295) throw rangeError(name, "at most 2^32 - 1 UTF-8 bytes");
		this.#ensure(4 + maximumLength);
		const lengthOffset = this.#offset;
		this.#offset += 4;
		const result = textEncoder.encodeInto(value, this.#bytes.subarray(this.#offset));
		if (result.read !== value.length) throw rangeError(name, "valid encodable text");
		this.#view.setUint32(lengthOffset, result.written, true);
		this.#offset += result.written;
	}
};
//#endregion
//#region src/style-input.ts
function withEncodedStyle(style, use) {
	return withStyleEncoder(style, 2, 6, (encoder) => {
		const display = style.display;
		if (display !== void 0) {
			encoder.field(0);
			const value = display;
			encoder.enumeration(value, 31, "Style.display");
		}
		const itemIsTable = style.itemIsTable;
		if (itemIsTable !== void 0) {
			encoder.field(1);
			const value = itemIsTable;
			encoder.boolean(value, "Style.itemIsTable");
		}
		const itemIsReplaced = style.itemIsReplaced;
		if (itemIsReplaced !== void 0) {
			encoder.field(2);
			const value = itemIsReplaced;
			encoder.boolean(value, "Style.itemIsReplaced");
		}
		const boxSizing = style.boxSizing;
		if (boxSizing !== void 0) {
			encoder.field(3);
			const value = boxSizing;
			encoder.enumeration(value, 3, "Style.boxSizing");
		}
		const direction = style.direction;
		if (direction !== void 0) {
			encoder.field(4);
			const value = direction;
			encoder.enumeration(value, 3, "Style.direction");
		}
		const overflow = style.overflow;
		if (overflow !== void 0) {
			encoder.field(5);
			const value = overflow;
			encoder.partialPointEnumeration(value, 15, "Style.overflow");
		}
		const scrollbarWidth = style.scrollbarWidth;
		if (scrollbarWidth !== void 0) {
			encoder.field(6);
			const value = scrollbarWidth;
			encoder.number(value, "Style.scrollbarWidth");
		}
		const contain = style.contain;
		if (contain !== void 0) {
			encoder.field(7);
			const value = contain;
			encoder.enumeration(value, 15, "Style.contain");
		}
		const float = style.float;
		if (float !== void 0) {
			encoder.field(8);
			const value = float;
			encoder.enumeration(value, 7, "Style.float");
		}
		const clear = style.clear;
		if (clear !== void 0) {
			encoder.field(9);
			const value = clear;
			encoder.enumeration(value, 15, "Style.clear");
		}
		const position = style.position;
		if (position !== void 0) {
			encoder.field(10);
			const value = position;
			encoder.enumeration(value, 3, "Style.position");
		}
		const inset = style.inset;
		if (inset !== void 0) {
			encoder.field(11);
			const value = inset;
			encoder.partialRectLengthPercentageAuto(value, "Style.inset");
		}
		const size = style.size;
		if (size !== void 0) {
			encoder.field(12);
			const value = size;
			encoder.partialSizeDimension(value, "Style.size");
		}
		const minSize = style.minSize;
		if (minSize !== void 0) {
			encoder.field(13);
			const value = minSize;
			encoder.partialSizeDimension(value, "Style.minSize");
		}
		const maxSize = style.maxSize;
		if (maxSize !== void 0) {
			encoder.field(14);
			const value = maxSize;
			encoder.partialSizeDimension(value, "Style.maxSize");
		}
		const aspectRatio = style.aspectRatio;
		if (aspectRatio !== void 0) {
			encoder.field(15);
			const value = aspectRatio;
			encoder.nullableNumber(value, "Style.aspectRatio");
		}
		const margin = style.margin;
		if (margin !== void 0) {
			encoder.field(16);
			const value = margin;
			encoder.partialRectLengthPercentageAuto(value, "Style.margin");
		}
		const padding = style.padding;
		if (padding !== void 0) {
			encoder.field(17);
			const value = padding;
			encoder.partialRectLengthPercentage(value, "Style.padding");
		}
		const border = style.border;
		if (border !== void 0) {
			encoder.field(18);
			const value = border;
			encoder.partialRectLengthPercentage(value, "Style.border");
		}
		const alignItems = style.alignItems;
		if (alignItems !== void 0) {
			encoder.field(19);
			const value = alignItems;
			encoder.nullableEnumeration(value, 65535, "Style.alignItems");
		}
		const alignSelf = style.alignSelf;
		if (alignSelf !== void 0) {
			encoder.field(20);
			const value = alignSelf;
			encoder.nullableEnumeration(value, 65535, "Style.alignSelf");
		}
		const justifyItems = style.justifyItems;
		if (justifyItems !== void 0) {
			encoder.field(21);
			const value = justifyItems;
			encoder.nullableEnumeration(value, 65535, "Style.justifyItems");
		}
		const justifySelf = style.justifySelf;
		if (justifySelf !== void 0) {
			encoder.field(22);
			const value = justifySelf;
			encoder.nullableEnumeration(value, 65535, "Style.justifySelf");
		}
		const alignContent = style.alignContent;
		if (alignContent !== void 0) {
			encoder.field(23);
			const value = alignContent;
			encoder.nullableEnumeration(value, 16383, "Style.alignContent");
		}
		const justifyContent = style.justifyContent;
		if (justifyContent !== void 0) {
			encoder.field(24);
			const value = justifyContent;
			encoder.nullableEnumeration(value, 16383, "Style.justifyContent");
		}
		const gap = style.gap;
		if (gap !== void 0) {
			encoder.field(25);
			const value = gap;
			encoder.partialSizeLengthPercentage(value, "Style.gap");
		}
		const textAlign = style.textAlign;
		if (textAlign !== void 0) {
			encoder.field(26);
			const value = textAlign;
			encoder.enumeration(value, 15, "Style.textAlign");
		}
		const flexDirection = style.flexDirection;
		if (flexDirection !== void 0) {
			encoder.field(27);
			const value = flexDirection;
			encoder.enumeration(value, 15, "Style.flexDirection");
		}
		const flexWrap = style.flexWrap;
		if (flexWrap !== void 0) {
			encoder.field(28);
			const value = flexWrap;
			encoder.enumeration(value, 7, "Style.flexWrap");
		}
		const flexBasis = style.flexBasis;
		if (flexBasis !== void 0) {
			encoder.field(29);
			const value = flexBasis;
			encoder.dimension(value, "Style.flexBasis");
		}
		const flexGrow = style.flexGrow;
		if (flexGrow !== void 0) {
			encoder.field(30);
			const value = flexGrow;
			encoder.number(value, "Style.flexGrow");
		}
		const flexShrink = style.flexShrink;
		if (flexShrink !== void 0) {
			encoder.field(31);
			const value = flexShrink;
			encoder.number(value, "Style.flexShrink");
		}
		const gridTemplateRows = style.gridTemplateRows;
		if (gridTemplateRows !== void 0) {
			encoder.field(32);
			const value = gridTemplateRows;
			encoder.gridTemplateComponents(value, "Style.gridTemplateRows");
		}
		const gridTemplateColumns = style.gridTemplateColumns;
		if (gridTemplateColumns !== void 0) {
			encoder.field(33);
			const value = gridTemplateColumns;
			encoder.gridTemplateComponents(value, "Style.gridTemplateColumns");
		}
		const gridAutoRows = style.gridAutoRows;
		if (gridAutoRows !== void 0) {
			encoder.field(34);
			const value = gridAutoRows;
			encoder.trackSizingFunctions(value, "Style.gridAutoRows");
		}
		const gridAutoColumns = style.gridAutoColumns;
		if (gridAutoColumns !== void 0) {
			encoder.field(35);
			const value = gridAutoColumns;
			encoder.trackSizingFunctions(value, "Style.gridAutoColumns");
		}
		const gridAutoFlow = style.gridAutoFlow;
		if (gridAutoFlow !== void 0) {
			encoder.field(36);
			const value = gridAutoFlow;
			encoder.enumeration(value, 15, "Style.gridAutoFlow");
		}
		const gridTemplateAreas = style.gridTemplateAreas;
		if (gridTemplateAreas !== void 0) {
			encoder.field(37);
			const value = gridTemplateAreas;
			encoder.nullableGridTemplateAreas(value, "Style.gridTemplateAreas");
		}
		const gridTemplateColumnNames = style.gridTemplateColumnNames;
		if (gridTemplateColumnNames !== void 0) {
			encoder.field(38);
			const value = gridTemplateColumnNames;
			encoder.stringMatrix(value, "Style.gridTemplateColumnNames");
		}
		const gridTemplateRowNames = style.gridTemplateRowNames;
		if (gridTemplateRowNames !== void 0) {
			encoder.field(39);
			const value = gridTemplateRowNames;
			encoder.stringMatrix(value, "Style.gridTemplateRowNames");
		}
		const gridRow = style.gridRow;
		if (gridRow !== void 0) {
			encoder.field(40);
			const value = gridRow;
			encoder.partialLineGridPlacement(value, "Style.gridRow");
		}
		const gridColumn = style.gridColumn;
		if (gridColumn !== void 0) {
			encoder.field(41);
			const value = gridColumn;
			encoder.partialLineGridPlacement(value, "Style.gridColumn");
		}
		return use(encoder.finish());
	});
}
//#endregion
//#region src/tree.ts
const SLOT_KNOWN_WIDTH = 0;
const SLOT_KNOWN_HEIGHT = 1;
const SLOT_AVAILABLE_WIDTH = 2;
const SLOT_AVAILABLE_HEIGHT = 3;
const SLOT_TAGS = 4;
const SLOT_NODE_LOW = 5;
const SLOT_NODE_HIGH = 6;
const TAG_KNOWN_WIDTH_PRESENT = 1;
const TAG_KNOWN_HEIGHT_PRESENT = 2;
const TAG_AVAILABLE_WIDTH_SHIFT = 2;
const TAG_AVAILABLE_HEIGHT_SHIFT = 4;
const TAG_KIND_MASK = 3;
const constraintRecord = new Float64Array(/* @__PURE__ */ new ArrayBuffer(56));
function availableSpaceConstraint(value, kind) {
	if (kind === AvailableSpaceKind.MinContent) return { kind: AvailableSpaceKind.MinContent };
	if (kind === AvailableSpaceKind.MaxContent) return { kind: AvailableSpaceKind.MaxContent };
	return {
		kind: AvailableSpaceKind.Definite,
		value
	};
}
function decodeConstraints(slots) {
	const tags = slots[SLOT_TAGS];
	return {
		knownDimensions: {
			width: (tags & TAG_KNOWN_WIDTH_PRESENT) === 0 ? void 0 : slots[SLOT_KNOWN_WIDTH],
			height: (tags & TAG_KNOWN_HEIGHT_PRESENT) === 0 ? void 0 : slots[SLOT_KNOWN_HEIGHT]
		},
		availableSpace: {
			width: availableSpaceConstraint(slots[SLOT_AVAILABLE_WIDTH], tags >>> TAG_AVAILABLE_WIDTH_SHIFT & TAG_KIND_MASK),
			height: availableSpaceConstraint(slots[SLOT_AVAILABLE_HEIGHT], tags >>> TAG_AVAILABLE_HEIGHT_SHIFT & TAG_KIND_MASK)
		},
		node: BigInt(slots[SLOT_NODE_HIGH]) << 32n | BigInt(slots[SLOT_NODE_LOW])
	};
}
const DEFAULT_STYLE_INPUT = {};
const layoutCodecBuffer = new Float64Array(/* @__PURE__ */ new ArrayBuffer(184));
function checkedChildIndex(index) {
	if (typeof index !== "number") throw new TypeError("Child index must be a number");
	return index;
}
/** Owns one independent node tree, its contexts, styles, and stored layouts. */
var TaffyTree = class {
	#inner;
	#contexts = /* @__PURE__ */ new Map();
	#measures = /* @__PURE__ */ new Map();
	/** Creates an independent Taffy tree. */
	constructor() {
		this.#inner = new BindingTaffyTree();
	}
	/** Enables pixel rounding for subsequently computed public layouts. */
	enableRounding() {
		this.#inner.rawEnableRounding();
	}
	/** Disables pixel rounding while retaining unrounded layout values. */
	disableRounding() {
		this.#inner.rawDisableRounding();
	}
	/** Returns the number of live nodes owned by this tree. */
	getNodeCount() {
		return this.#inner.rawGetNodeCount();
	}
	/** Returns the current number of children for one parent. */
	getChildCount(parent) {
		return this.#inner.rawGetChildCount(toRawNodeId(parent));
	}
	/** Returns the current parent or null for a root node. */
	getParent(node) {
		return this.#inner.rawGetParent(toRawNodeId(node));
	}
	/** Returns a detached readonly snapshot of the ordered children. */
	getChildren(parent) {
		return this.#inner.rawGetChildren(toRawNodeId(parent));
	}
	/** Returns the child at the requested parent index. */
	getChildAtIndex(parent, index) {
		return this.#inner.rawGetChildAtIndex(toRawNodeId(parent), checkedChildIndex(index));
	}
	/** Appends an existing node to the parent child list. */
	addChild(parent, child) {
		const rawParent = toRawNodeId(parent);
		const rawChild = toRawNodeId(child);
		this.#inner.rawAddChild(rawParent, rawChild);
	}
	/** Inserts an existing child at the requested parent index. */
	insertChildAtIndex(parent, index, child) {
		const rawParent = toRawNodeId(parent);
		const rawChild = toRawNodeId(child);
		this.#inner.rawInsertChildAtIndex(rawParent, checkedChildIndex(index), rawChild);
	}
	/** Replaces the complete ordered child list for one parent. */
	setChildren(parent, children) {
		const rawParent = toRawNodeId(parent);
		if (!Array.isArray(children)) throw new TypeError("children must be an array");
		const rawChildren = Array.from(children, (child) => toRawNodeId(child));
		this.#inner.rawSetChildren(rawParent, rawChildren);
	}
	/** Detaches the selected child from its current parent. */
	removeChild(parent, child) {
		const rawParent = toRawNodeId(parent);
		const rawChild = toRawNodeId(child);
		this.#inner.rawRemoveChild(rawParent, rawChild);
	}
	/** Detaches and returns the child at the requested index. */
	removeChildAtIndex(parent, index) {
		return this.#inner.rawRemoveChildAtIndex(toRawNodeId(parent), checkedChildIndex(index));
	}
	/** Detaches children in the supplied half-open index range. */
	removeChildrenRange(parent, range) {
		this.#inner.rawRemoveChildrenRange(toRawNodeId(parent), range);
	}
	/** Replaces and returns the child at the requested index. */
	replaceChildAtIndex(parent, index, newChild) {
		const rawParent = toRawNodeId(parent);
		const rawNewChild = toRawNodeId(newChild);
		return this.#inner.rawReplaceChildAtIndex(rawParent, checkedChildIndex(index), rawNewChild);
	}
	/** Creates a leaf node, using Taffy's defaults when style is omitted. */
	newLeaf(style = DEFAULT_STYLE_INPUT) {
		return withEncodedStyle(style, (encoded) => this.#inner.rawNewLeaf(encoded));
	}
	/** Creates a leaf node with JavaScript context and an optional style. */
	newLeafWithContext(context, style = DEFAULT_STYLE_INPUT) {
		return withEncodedStyle(style, (encoded) => {
			const node = this.#inner.rawNewLeafWithContext(encoded, context !== void 0);
			if (context !== void 0) this.#contexts.set(node, context);
			return node;
		});
	}
	/** Creates a parent from ordered children and an optional style. */
	newWithChildren(children, style = DEFAULT_STYLE_INPUT) {
		if (!Array.isArray(children)) throw new TypeError("children must be an array");
		const rawChildren = Array.from(children, (child) => toRawNodeId(child));
		return withEncodedStyle(style, (encoded) => this.#inner.rawNewWithChildren(encoded, rawChildren));
	}
	/** Removes one node and releases its context and measure function. The NodeId must not be used again. */
	remove(node) {
		const raw = toRawNodeId(node);
		this.#inner.rawRemove(raw);
		this.#contexts.delete(node);
		this.#measures.delete(node);
	}
	/** Returns the JavaScript context currently associated with one node. */
	getNodeContext(node) {
		toRawNodeId(node);
		return this.#contexts.get(node);
	}
	/** Replaces or clears the JavaScript context for one node. */
	setNodeContext(node, context) {
		const raw = toRawNodeId(node);
		this.#inner.rawSetNodeContext(raw, context !== void 0);
		if (context === void 0) this.#contexts.delete(node);
		else this.#contexts.set(node, context);
	}
	/** Sets or clears this node's synchronous measure function; every call marks it dirty, including when the function identity is unchanged. */
	setMeasure(node, measure) {
		const raw = toRawNodeId(node);
		if (measure !== void 0 && typeof measure !== "function") throw new TypeError("measure must be a function or undefined");
		this.#inner.rawSetMeasure(raw, measure !== void 0);
		if (measure === void 0) this.#measures.delete(node);
		else this.#measures.set(node, measure);
	}
	/** Replaces a node style and marks affected layout state dirty. */
	setStyle(node, style) {
		const raw = toRawNodeId(node);
		withEncodedStyle(style, (encoded) => this.#inner.rawSetStyle(raw, encoded));
	}
	/** Updates supplied style fields and geometry components, preserving omitted values. */
	updateStyle(node, update) {
		const raw = toRawNodeId(node);
		withEncodedStyle(update, (encoded) => this.#inner.rawUpdateStyle(raw, encoded));
	}
	/** Returns a detached readable snapshot of the node style. */
	getStyle(node) {
		return this.#inner.rawGetStyle(toRawNodeId(node));
	}
	/** Returns the most recently stored layout selected by the tree's current rounding mode. */
	getLayout(node) {
		this.#inner.rawWriteLayout(toRawNodeId(node), layoutCodecBuffer);
		return decodeLayout(layoutCodecBuffer);
	}
	/** Returns the most recently stored unrounded layout snapshot. */
	getUnroundedLayout(node) {
		this.#inner.rawWriteUnroundedLayout(toRawNodeId(node), layoutCodecBuffer);
		return decodeLayout(layoutCodecBuffer);
	}
	/** Returns detailed Grid tracks and item placement when available. */
	getDetailedLayoutInfo(node) {
		return this.#inner.rawGetDetailedLayoutInfo(toRawNodeId(node));
	}
	/** Explicitly marks a node for layout recomputation. */
	markDirty(node) {
		this.#inner.rawMarkDirty(toRawNodeId(node));
	}
	/** Reports whether a node currently needs layout recomputation. */
	isDirty(node) {
		return this.#inner.rawIsDirty(toRawNodeId(node));
	}
	/** Removes every node, context value, and per-node measure function from this tree. */
	clear() {
		this.#inner.rawClear();
		this.#contexts.clear();
		this.#measures.clear();
	}
	/** Computes and stores layout synchronously with configured per-node measures and an optional global fallback. */
	computeLayout(options) {
		const root = toRawNodeId(options.root);
		const measure = options.measure;
		if (measure !== void 0 && typeof measure !== "function") throw new TypeError("measure must be a function or undefined");
		if (this.#measures.size === 0 && measure === void 0) {
			this.#inner.rawComputeLayout(root, options.availableSpace);
			return;
		}
		this.#computeMeasuredLayout(root, options.availableSpace, measure);
	}
	#computeMeasuredLayout(root, availableSpace, fallback) {
		this.#inner.rawComputeLayoutWithMeasure(root, availableSpace, (getStyle) => {
			const constraints = decodeConstraints(constraintRecord);
			const node = constraints.node;
			const measure = this.#measures.get(node) ?? fallback;
			if (measure === void 0) throw new Error("Native measure marker has no JavaScript measure function");
			return measure({
				knownDimensions: constraints.knownDimensions,
				availableSpace: constraints.availableSpace,
				node,
				context: this.#contexts.get(node),
				getStyle
			});
		}, constraintRecord, fallback !== void 0);
	}
};
//#endregion
export { AlignContent, AlignItems, AvailableSpace, AvailableSpaceKind, BoxSizing, Clear, Contain, DetailedLayoutInfoKind, Dimension, Direction, Display, FlexDirection, FlexWrap, Float, GridAutoFlow, GridPlacement, GridPlacementKind, GridTemplateComponent, GridTemplateComponentKind, LengthUnit, Overflow, Position, RepetitionCount, RepetitionCountKind, TaffyTree, TextAlign, TrackSizingFunction, TrackSizingKind };
