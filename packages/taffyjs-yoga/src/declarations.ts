import {
  Align,
  BoxSizing,
  Direction,
  Display,
  Edge,
  FlexDirection,
  Gutter,
  Justify,
  Overflow,
  PositionType,
  Wrap,
} from "./enums.js";
import { autoValue, cloneValue, sameValue, undefinedValue, type YogaValue } from "./values.js";

export type EdgeValues<T> = [T, T, T, T, T, T, T, T, T];
export type GutterValues<T> = [T, T, T];

export interface YogaDeclarations {
  alignContent: Align;
  alignItems: Align;
  alignSelf: Align;
  aspectRatio: number | undefined;
  border: EdgeValues<number | undefined>;
  direction: Direction;
  display: Display;
  flex: number | undefined;
  flexBasis: YogaValue;
  flexDirection: FlexDirection;
  flexGrow: number | undefined;
  flexShrink: number | undefined;
  flexWrap: Wrap;
  height: YogaValue;
  justifyContent: Justify;
  gap: GutterValues<YogaValue>;
  margin: EdgeValues<YogaValue>;
  maxHeight: YogaValue;
  maxWidth: YogaValue;
  minHeight: YogaValue;
  minWidth: YogaValue;
  overflow: Overflow;
  padding: EdgeValues<YogaValue>;
  position: EdgeValues<YogaValue>;
  positionType: PositionType;
  boxSizing: BoxSizing;
  width: YogaValue;
}

function edgeValues<T>(create: () => T): EdgeValues<T> {
  return [create(), create(), create(), create(), create(), create(), create(), create(), create()];
}

function gutterValues<T>(create: () => T): GutterValues<T> {
  return [create(), create(), create()];
}

export function createDeclarations(useWebDefaults: boolean): YogaDeclarations {
  return {
    alignContent: useWebDefaults ? Align.Stretch : Align.FlexStart,
    alignItems: Align.Stretch,
    alignSelf: Align.Auto,
    aspectRatio: undefined,
    border: edgeValues(() => undefined),
    direction: Direction.Inherit,
    display: Display.Flex,
    flex: undefined,
    flexBasis: autoValue(),
    flexDirection: useWebDefaults ? FlexDirection.Row : FlexDirection.Column,
    flexGrow: undefined,
    flexShrink: undefined,
    flexWrap: Wrap.NoWrap,
    height: autoValue(),
    justifyContent: Justify.FlexStart,
    gap: gutterValues(undefinedValue),
    margin: edgeValues(undefinedValue),
    maxHeight: undefinedValue(),
    maxWidth: undefinedValue(),
    minHeight: undefinedValue(),
    minWidth: undefinedValue(),
    overflow: Overflow.Visible,
    padding: edgeValues(undefinedValue),
    position: edgeValues(undefinedValue),
    positionType: PositionType.Relative,
    boxSizing: BoxSizing.BorderBox,
    width: autoValue(),
  };
}

export function cloneDeclarations(value: YogaDeclarations): YogaDeclarations {
  return {
    ...value,
    border: [...value.border],
    flexBasis: cloneValue(value.flexBasis),
    height: cloneValue(value.height),
    gap: value.gap.map(cloneValue) as GutterValues<YogaValue>,
    margin: value.margin.map(cloneValue) as EdgeValues<YogaValue>,
    maxHeight: cloneValue(value.maxHeight),
    maxWidth: cloneValue(value.maxWidth),
    minHeight: cloneValue(value.minHeight),
    minWidth: cloneValue(value.minWidth),
    padding: value.padding.map(cloneValue) as EdgeValues<YogaValue>,
    position: value.position.map(cloneValue) as EdgeValues<YogaValue>,
    width: cloneValue(value.width),
  };
}

function sameNumber(left: number | undefined, right: number | undefined): boolean {
  return Object.is(left, right);
}

function sameArray<T>(
  left: readonly T[],
  right: readonly T[],
  same: (left: T, right: T) => boolean,
): boolean {
  return left.every((value, index) => same(value, right[index]));
}

export function sameDeclarations(left: YogaDeclarations, right: YogaDeclarations): boolean {
  return (
    left.alignContent === right.alignContent &&
    left.alignItems === right.alignItems &&
    left.alignSelf === right.alignSelf &&
    sameNumber(left.aspectRatio, right.aspectRatio) &&
    sameArray(left.border, right.border, sameNumber) &&
    left.direction === right.direction &&
    left.display === right.display &&
    sameNumber(left.flex, right.flex) &&
    sameValue(left.flexBasis, right.flexBasis) &&
    left.flexDirection === right.flexDirection &&
    sameNumber(left.flexGrow, right.flexGrow) &&
    sameNumber(left.flexShrink, right.flexShrink) &&
    left.flexWrap === right.flexWrap &&
    sameValue(left.height, right.height) &&
    left.justifyContent === right.justifyContent &&
    sameArray(left.gap, right.gap, sameValue) &&
    sameArray(left.margin, right.margin, sameValue) &&
    sameValue(left.maxHeight, right.maxHeight) &&
    sameValue(left.maxWidth, right.maxWidth) &&
    sameValue(left.minHeight, right.minHeight) &&
    sameValue(left.minWidth, right.minWidth) &&
    left.overflow === right.overflow &&
    sameArray(left.padding, right.padding, sameValue) &&
    sameArray(left.position, right.position, sameValue) &&
    left.positionType === right.positionType &&
    left.boxSizing === right.boxSizing &&
    sameValue(left.width, right.width)
  );
}

function edgeCandidates(edge: Edge, direction: Direction.LTR | Direction.RTL): readonly Edge[] {
  switch (edge) {
    case Edge.Left:
      return [
        direction === Direction.LTR ? Edge.Start : Edge.End,
        Edge.Left,
        Edge.Horizontal,
        Edge.All,
      ];
    case Edge.Right:
      return [
        direction === Direction.LTR ? Edge.End : Edge.Start,
        Edge.Right,
        Edge.Horizontal,
        Edge.All,
      ];
    case Edge.Top:
      return [Edge.Top, Edge.Vertical, Edge.All];
    case Edge.Bottom:
      return [Edge.Bottom, Edge.Vertical, Edge.All];
    default:
      throw new TypeError("A physical edge is required");
  }
}

export function resolveEdge<T>(
  values: EdgeValues<T>,
  edge: Edge.Left | Edge.Top | Edge.Right | Edge.Bottom,
  direction: Direction.LTR | Direction.RTL,
  isDefined: (value: T) => boolean,
  fallback: () => T,
): T {
  for (const candidate of edgeCandidates(edge, direction)) {
    const value = values[candidate];
    if (isDefined(value)) return value;
  }
  return fallback();
}

export function resolveGutter<T>(
  values: GutterValues<T>,
  gutter: Gutter.Column | Gutter.Row,
  isDefined: (value: T) => boolean,
  fallback: () => T,
): T {
  const direct = values[gutter];
  if (isDefined(direct)) return direct;
  const all = values[Gutter.All];
  return isDefined(all) ? all : fallback();
}
