import {
  AlignContent as TaffyAlignContent,
  AlignItems as TaffyAlignItems,
  BoxSizing as TaffyBoxSizing,
  Dimension as TaffyDimension,
  Direction as TaffyDirection,
  Display as TaffyDisplay,
  FlexDirection as TaffyFlexDirection,
  FlexWrap as TaffyFlexWrap,
  Overflow as TaffyOverflow,
  Position as TaffyPosition,
  type AlignContent as TaffyAlignContentValue,
  type AlignItems as TaffyAlignItemsValue,
  type DimensionInput,
  type StyleInput,
} from "@taffyjs/node";
import { resolveEdge, resolveGutter, type YogaDeclarations } from "./declarations.js";
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
  Unit,
  Wrap,
} from "./enums.js";
import {
  toDimension,
  toLengthPercentage,
  toLengthPercentageAuto,
  undefinedValue,
  type YogaValue,
} from "./values.js";

export interface TranslationConfig {
  readonly useWebDefaults: boolean;
}

function alignItems(value: Align): TaffyAlignItemsValue {
  switch (value) {
    case Align.FlexStart:
      return TaffyAlignItems.FlexStart;
    case Align.Center:
      return TaffyAlignItems.Center;
    case Align.FlexEnd:
      return TaffyAlignItems.FlexEnd;
    case Align.Stretch:
      return TaffyAlignItems.Stretch;
    case Align.Baseline:
      return TaffyAlignItems.Baseline;
    default:
      throw new TypeError("Unsupported item alignment");
  }
}

function alignContent(value: Align): TaffyAlignContentValue {
  switch (value) {
    case Align.FlexStart:
      return TaffyAlignContent.FlexStart;
    case Align.Center:
      return TaffyAlignContent.Center;
    case Align.FlexEnd:
      return TaffyAlignContent.FlexEnd;
    case Align.Stretch:
      return TaffyAlignContent.Stretch;
    case Align.SpaceBetween:
      return TaffyAlignContent.SpaceBetween;
    case Align.SpaceAround:
      return TaffyAlignContent.SpaceAround;
    case Align.SpaceEvenly:
      return TaffyAlignContent.SpaceEvenly;
    default:
      throw new TypeError("Unsupported content alignment");
  }
}

function justifyContent(value: Justify): TaffyAlignContentValue {
  switch (value) {
    case Justify.FlexStart:
      return TaffyAlignContent.FlexStart;
    case Justify.Center:
      return TaffyAlignContent.Center;
    case Justify.FlexEnd:
      return TaffyAlignContent.FlexEnd;
    case Justify.SpaceBetween:
      return TaffyAlignContent.SpaceBetween;
    case Justify.SpaceAround:
      return TaffyAlignContent.SpaceAround;
    case Justify.SpaceEvenly:
      return TaffyAlignContent.SpaceEvenly;
  }
}

function direction(value: Direction.LTR | Direction.RTL) {
  return value === Direction.RTL ? TaffyDirection.Rtl : TaffyDirection.Ltr;
}

function flexDirection(value: FlexDirection) {
  switch (value) {
    case FlexDirection.Column:
      return TaffyFlexDirection.Column;
    case FlexDirection.ColumnReverse:
      return TaffyFlexDirection.ColumnReverse;
    case FlexDirection.Row:
      return TaffyFlexDirection.Row;
    case FlexDirection.RowReverse:
      return TaffyFlexDirection.RowReverse;
  }
}

function flexWrap(value: Wrap) {
  switch (value) {
    case Wrap.NoWrap:
      return TaffyFlexWrap.NoWrap;
    case Wrap.Wrap:
      return TaffyFlexWrap.Wrap;
    case Wrap.WrapReverse:
      return TaffyFlexWrap.WrapReverse;
  }
}

function physicalValue(
  values: YogaDeclarations["margin"],
  edge: Edge.Left | Edge.Top | Edge.Right | Edge.Bottom,
  resolvedDirection: Direction.LTR | Direction.RTL,
): YogaValue {
  return resolveEdge(
    values,
    edge,
    resolvedDirection,
    (value) => value.unit !== Unit.Undefined,
    undefinedValue,
  );
}

function physicalNumber(
  values: YogaDeclarations["border"],
  edge: Edge.Left | Edge.Top | Edge.Right | Edge.Bottom,
  resolvedDirection: Direction.LTR | Direction.RTL,
): number {
  return (
    resolveEdge(
      values,
      edge,
      resolvedDirection,
      (value) => value !== undefined,
      () => 0,
    ) ?? 0
  );
}

function rect<T>(read: (edge: Edge.Left | Edge.Top | Edge.Right | Edge.Bottom) => T) {
  return {
    left: read(Edge.Left),
    top: read(Edge.Top),
    right: read(Edge.Right),
    bottom: read(Edge.Bottom),
  };
}

function effectiveFlexBasis(
  declarations: YogaDeclarations,
  config: TranslationConfig,
): DimensionInput {
  if (
    declarations.flexBasis.unit === Unit.Auto &&
    declarations.flex !== undefined &&
    declarations.flex > 0 &&
    !config.useWebDefaults
  ) {
    return TaffyDimension.Length(0);
  }
  return toDimension(declarations.flexBasis);
}

function effectiveFlexGrow(declarations: YogaDeclarations): number {
  if (declarations.flexGrow !== undefined) return declarations.flexGrow;
  return declarations.flex !== undefined && declarations.flex > 0 ? declarations.flex : 0;
}

function effectiveFlexShrink(declarations: YogaDeclarations, config: TranslationConfig): number {
  if (declarations.flexShrink !== undefined) return declarations.flexShrink;
  if (!config.useWebDefaults && declarations.flex !== undefined && declarations.flex < 0) {
    return -declarations.flex;
  }
  return config.useWebDefaults ? 1 : 0;
}

export function translateStyle(
  declarations: YogaDeclarations,
  config: TranslationConfig,
  resolvedDirection: Direction.LTR | Direction.RTL,
): StyleInput {
  const margin = rect((edge) =>
    toLengthPercentageAuto(physicalValue(declarations.margin, edge, resolvedDirection)),
  );
  const padding = rect((edge) =>
    toLengthPercentage(physicalValue(declarations.padding, edge, resolvedDirection)),
  );
  const position = rect((edge) =>
    toDimension(physicalValue(declarations.position, edge, resolvedDirection)),
  );
  const border = rect((edge) => physicalNumber(declarations.border, edge, resolvedDirection));
  const columnGap = resolveGutter(
    declarations.gap,
    Gutter.Column,
    (value) => value.unit !== Unit.Undefined,
    undefinedValue,
  );
  const rowGap = resolveGutter(
    declarations.gap,
    Gutter.Row,
    (value) => value.unit !== Unit.Undefined,
    undefinedValue,
  );

  return {
    display: declarations.display === Display.None ? TaffyDisplay.None : TaffyDisplay.Flex,
    boxSizing:
      declarations.boxSizing === BoxSizing.ContentBox
        ? TaffyBoxSizing.ContentBox
        : TaffyBoxSizing.BorderBox,
    direction: direction(resolvedDirection),
    overflow: {
      x:
        declarations.overflow === Overflow.Hidden
          ? TaffyOverflow.Hidden
          : declarations.overflow === Overflow.Scroll
            ? TaffyOverflow.Scroll
            : TaffyOverflow.Visible,
      y:
        declarations.overflow === Overflow.Hidden
          ? TaffyOverflow.Hidden
          : declarations.overflow === Overflow.Scroll
            ? TaffyOverflow.Scroll
            : TaffyOverflow.Visible,
    },
    position:
      declarations.positionType === PositionType.Absolute
        ? TaffyPosition.Absolute
        : TaffyPosition.Relative,
    inset: position,
    size: {
      width: toDimension(declarations.width),
      height: toDimension(declarations.height),
    },
    minSize: {
      width: toDimension(declarations.minWidth),
      height: toDimension(declarations.minHeight),
    },
    maxSize: {
      width: toDimension(declarations.maxWidth),
      height: toDimension(declarations.maxHeight),
    },
    aspectRatio: declarations.aspectRatio ?? null,
    margin,
    padding,
    border,
    alignItems: alignItems(declarations.alignItems),
    alignSelf: declarations.alignSelf === Align.Auto ? null : alignItems(declarations.alignSelf),
    alignContent: alignContent(declarations.alignContent),
    justifyContent: justifyContent(declarations.justifyContent),
    gap: {
      width: toLengthPercentage(columnGap),
      height: toLengthPercentage(rowGap),
    },
    flexDirection: flexDirection(declarations.flexDirection),
    flexWrap: flexWrap(declarations.flexWrap),
    flexBasis: effectiveFlexBasis(declarations, config),
    flexGrow: effectiveFlexGrow(declarations),
    flexShrink: effectiveFlexShrink(declarations, config),
  };
}

export function declarationDirection(
  declarations: YogaDeclarations,
  ownerDirection: Direction.LTR | Direction.RTL,
): Direction.LTR | Direction.RTL {
  return declarations.direction === Direction.Inherit ? ownerDirection : declarations.direction;
}
