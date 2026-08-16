import { _ as Unit, a as Display, c as ExperimentalFeature, d as Justify, f as LogLevel, g as PositionType, h as Overflow, i as Direction, l as FlexDirection, m as NodeType, n as BoxSizing, o as Edge, p as MeasureMode, r as Dimension, s as Errata, t as Align, u as Gutter, v as Wrap } from "./enums-CbyzWgT7.js";
//#region src/load.ts
async function loadYoga() {
	const { createYoga } = await import("./facade-Cs5hoRIK.js").then((n) => n.n);
	return createYoga();
}
//#endregion
export { Align, BoxSizing, Dimension, Direction, Display, Edge, Errata, ExperimentalFeature, FlexDirection, Gutter, Justify, LogLevel, MeasureMode, NodeType, Overflow, PositionType, Unit, Wrap, loadYoga };
