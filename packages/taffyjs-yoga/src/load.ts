export {
  Align,
  BoxSizing,
  Dimension,
  Direction,
  Display,
  Edge,
  Errata,
  ExperimentalFeature,
  FlexDirection,
  Gutter,
  Justify,
  LogLevel,
  MeasureMode,
  NodeType,
  Overflow,
  PositionType,
  Unit,
  Wrap,
} from "./enums.js";
export type {
  AlignContentValue,
  AlignItemsValue,
  AlignSelfValue,
  Config,
  DirtiedFunction,
  MeasureFunction,
  Node,
  Yoga,
} from "./types.js";

import { createYoga } from "./facade.js";
import type { Yoga } from "./types.js";

export async function loadYoga(): Promise<Yoga> {
  return createYoga();
}
