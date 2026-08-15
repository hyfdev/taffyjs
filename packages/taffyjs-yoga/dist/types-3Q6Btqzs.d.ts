//#region src/enums.d.ts
declare enum Align {
  Auto = 0,
  FlexStart = 1,
  Center = 2,
  FlexEnd = 3,
  Stretch = 4,
  Baseline = 5,
  SpaceBetween = 6,
  SpaceAround = 7,
  SpaceEvenly = 8
}
declare enum BoxSizing {
  BorderBox = 0,
  ContentBox = 1
}
declare enum Dimension {
  Width = 0,
  Height = 1
}
declare enum Direction {
  Inherit = 0,
  LTR = 1,
  RTL = 2
}
declare enum Display {
  Flex = 0,
  None = 1
}
declare enum Edge {
  Left = 0,
  Top = 1,
  Right = 2,
  Bottom = 3,
  Start = 4,
  End = 5,
  Horizontal = 6,
  Vertical = 7,
  All = 8
}
declare enum Errata {
  None = 0
}
declare enum ExperimentalFeature {
  WebFlexBasis = 0
}
declare enum FlexDirection {
  Column = 0,
  ColumnReverse = 1,
  Row = 2,
  RowReverse = 3
}
declare enum Gutter {
  Column = 0,
  Row = 1,
  All = 2
}
declare enum Justify {
  FlexStart = 0,
  Center = 1,
  FlexEnd = 2,
  SpaceBetween = 3,
  SpaceAround = 4,
  SpaceEvenly = 5
}
declare enum LogLevel {
  Error = 0,
  Warn = 1,
  Info = 2,
  Debug = 3,
  Verbose = 4,
  Fatal = 5
}
declare enum MeasureMode {
  Undefined = 0,
  Exactly = 1,
  AtMost = 2
}
declare enum NodeType {
  Default = 0,
  Text = 1
}
declare enum Overflow {
  Visible = 0,
  Hidden = 1,
  Scroll = 2
}
declare enum PositionType {
  Relative = 1,
  Absolute = 2
}
declare enum Unit {
  Undefined = 0,
  Point = 1,
  Percent = 2,
  Auto = 3
}
declare enum Wrap {
  NoWrap = 0,
  Wrap = 1,
  WrapReverse = 2
}
declare const legacyConstants: Readonly<{
  readonly ALIGN_AUTO: Align.Auto;
  readonly ALIGN_FLEX_START: Align.FlexStart;
  readonly ALIGN_CENTER: Align.Center;
  readonly ALIGN_FLEX_END: Align.FlexEnd;
  readonly ALIGN_STRETCH: Align.Stretch;
  readonly ALIGN_BASELINE: Align.Baseline;
  readonly ALIGN_SPACE_BETWEEN: Align.SpaceBetween;
  readonly ALIGN_SPACE_AROUND: Align.SpaceAround;
  readonly ALIGN_SPACE_EVENLY: Align.SpaceEvenly;
  readonly BOX_SIZING_BORDER_BOX: BoxSizing.BorderBox;
  readonly BOX_SIZING_CONTENT_BOX: BoxSizing.ContentBox;
  readonly DIMENSION_WIDTH: Dimension.Width;
  readonly DIMENSION_HEIGHT: Dimension.Height;
  readonly DIRECTION_INHERIT: Direction.Inherit;
  readonly DIRECTION_LTR: Direction.LTR;
  readonly DIRECTION_RTL: Direction.RTL;
  readonly DISPLAY_FLEX: Display.Flex;
  readonly DISPLAY_NONE: Display.None;
  readonly EDGE_LEFT: Edge.Left;
  readonly EDGE_TOP: Edge.Top;
  readonly EDGE_RIGHT: Edge.Right;
  readonly EDGE_BOTTOM: Edge.Bottom;
  readonly EDGE_START: Edge.Start;
  readonly EDGE_END: Edge.End;
  readonly EDGE_HORIZONTAL: Edge.Horizontal;
  readonly EDGE_VERTICAL: Edge.Vertical;
  readonly EDGE_ALL: Edge.All;
  readonly ERRATA_NONE: Errata;
  readonly EXPERIMENTAL_FEATURE_WEB_FLEX_BASIS: ExperimentalFeature;
  readonly FLEX_DIRECTION_COLUMN: FlexDirection.Column;
  readonly FLEX_DIRECTION_COLUMN_REVERSE: FlexDirection.ColumnReverse;
  readonly FLEX_DIRECTION_ROW: FlexDirection.Row;
  readonly FLEX_DIRECTION_ROW_REVERSE: FlexDirection.RowReverse;
  readonly GUTTER_COLUMN: Gutter.Column;
  readonly GUTTER_ROW: Gutter.Row;
  readonly GUTTER_ALL: Gutter.All;
  readonly JUSTIFY_FLEX_START: Justify.FlexStart;
  readonly JUSTIFY_CENTER: Justify.Center;
  readonly JUSTIFY_FLEX_END: Justify.FlexEnd;
  readonly JUSTIFY_SPACE_BETWEEN: Justify.SpaceBetween;
  readonly JUSTIFY_SPACE_AROUND: Justify.SpaceAround;
  readonly JUSTIFY_SPACE_EVENLY: Justify.SpaceEvenly;
  readonly LOG_LEVEL_ERROR: LogLevel.Error;
  readonly LOG_LEVEL_WARN: LogLevel.Warn;
  readonly LOG_LEVEL_INFO: LogLevel.Info;
  readonly LOG_LEVEL_DEBUG: LogLevel.Debug;
  readonly LOG_LEVEL_VERBOSE: LogLevel.Verbose;
  readonly LOG_LEVEL_FATAL: LogLevel.Fatal;
  readonly MEASURE_MODE_UNDEFINED: MeasureMode.Undefined;
  readonly MEASURE_MODE_EXACTLY: MeasureMode.Exactly;
  readonly MEASURE_MODE_AT_MOST: MeasureMode.AtMost;
  readonly NODE_TYPE_DEFAULT: NodeType.Default;
  readonly NODE_TYPE_TEXT: NodeType.Text;
  readonly OVERFLOW_VISIBLE: Overflow.Visible;
  readonly OVERFLOW_HIDDEN: Overflow.Hidden;
  readonly OVERFLOW_SCROLL: Overflow.Scroll;
  readonly POSITION_TYPE_RELATIVE: PositionType.Relative;
  readonly POSITION_TYPE_ABSOLUTE: PositionType.Absolute;
  readonly UNIT_UNDEFINED: Unit.Undefined;
  readonly UNIT_POINT: Unit.Point;
  readonly UNIT_PERCENT: Unit.Percent;
  readonly UNIT_AUTO: Unit.Auto;
  readonly WRAP_NO_WRAP: Wrap.NoWrap;
  readonly WRAP_WRAP: Wrap.Wrap;
  readonly WRAP_WRAP_REVERSE: Wrap.WrapReverse;
}>;
//#endregion
//#region src/types.d.ts
interface Layout {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}
interface Size {
  width: number;
  height: number;
}
type DirtiedFunction = (node: Node) => void;
type MeasureFunction = (width: number, widthMode: MeasureMode, height: number, heightMode: MeasureMode) => Size;
type LayoutDimension = number | "auto" | undefined;
interface Config {
  free(): void;
}
interface Node {
  free(): void;
  setWidth(value: number | string | undefined): void;
  setHeight(value: number | string | undefined): void;
  calculateLayout(width: LayoutDimension, height: LayoutDimension, direction?: Direction): void;
  getComputedLeft(): number;
  getComputedRight(): number;
  getComputedTop(): number;
  getComputedBottom(): number;
  getComputedWidth(): number;
  getComputedHeight(): number;
  getComputedLayout(): Layout;
}
interface ConfigFactory {
  create(): Config;
  destroy(config: Config): void;
}
interface NodeFactory {
  create(config?: Config): Node;
  createDefault(): Node;
  createWithConfig(config: Config): Node;
  destroy(node: Node): void;
}
type Yoga = Readonly<{
  Config: ConfigFactory;
  Node: NodeFactory;
} & typeof legacyConstants>;
//#endregion
export { PositionType as C, Overflow as S, Wrap as T, Gutter as _, Node as a, MeasureMode as b, Align as c, Direction as d, Display as f, FlexDirection as g, ExperimentalFeature as h, MeasureFunction as i, BoxSizing as l, Errata as m, ConfigFactory as n, NodeFactory as o, Edge as p, DirtiedFunction as r, Yoga as s, Config as t, Dimension as u, Justify as v, Unit as w, NodeType as x, LogLevel as y };