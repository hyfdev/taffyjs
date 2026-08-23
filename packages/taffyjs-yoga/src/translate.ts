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
  type LengthPercentageAutoInput,
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
  toMinDimension,
  toSizeDimension,
  undefinedValue,
  resolvePercentage,
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
): LengthPercentageAutoInput {
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
  ownerDirection: Direction.LTR | Direction.RTL,
): StyleInput {
  const absoluteDirection =
    declarations.positionType === PositionType.Absolute ? ownerDirection : resolvedDirection;
  const margin = rect((edge) =>
    toLengthPercentageAuto(physicalValue(declarations.margin, edge, absoluteDirection)),
  );
  const padding = rect((edge) =>
    toLengthPercentage(physicalValue(declarations.padding, edge, resolvedDirection)),
  );
  const position = rect((edge) =>
    toDimension(physicalValue(declarations.position, edge, absoluteDirection)),
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
      width: toSizeDimension(declarations.width),
      height: toSizeDimension(declarations.height),
    },
    minSize: {
      width: toMinDimension(declarations.minWidth),
      height: toMinDimension(declarations.minHeight),
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

function resolveLength(value: YogaValue, basis: number | undefined): number | undefined {
  switch (value.unit) {
    case Unit.Point:
      return value.value;
    case Unit.Percent:
      return basis === undefined ? undefined : resolvePercentage(basis, value.value);
    case Unit.Auto:
    case Unit.Undefined:
      return undefined;
  }
}

function exactRootDimension(
  declarations: YogaDeclarations,
  axis: "width" | "height",
  ownerSize: number | undefined,
  ownerWidth: number | undefined,
  resolvedDirection: Direction.LTR | Direction.RTL,
): number | undefined {
  if (
    ownerSize === undefined ||
    Number.isNaN(ownerSize) ||
    ownerSize === Number.NEGATIVE_INFINITY
  ) {
    return undefined;
  }
  const declared = axis === "width" ? declarations.width : declarations.height;
  const maximum = axis === "width" ? declarations.maxWidth : declarations.maxHeight;
  const declaredLength = resolveLength(declared, ownerSize);
  if (declaredLength !== undefined && declaredLength >= 0) return undefined;
  if (resolveLength(maximum, ownerSize) !== undefined) return undefined;

  const startEdge = axis === "width" ? Edge.Left : Edge.Top;
  const endEdge = axis === "width" ? Edge.Right : Edge.Bottom;
  const marginStart =
    resolveLength(physicalValue(declarations.margin, startEdge, resolvedDirection), ownerWidth) ??
    0;
  const marginEnd =
    resolveLength(physicalValue(declarations.margin, endEdge, resolvedDirection), ownerWidth) ?? 0;
  let outerSize = Math.fround(Math.fround(ownerSize - marginStart) - marginEnd);

  if (declarations.boxSizing === BoxSizing.ContentBox) {
    const paddingStart = Math.max(
      0,
      resolveLength(
        physicalValue(declarations.padding, startEdge, resolvedDirection),
        ownerWidth,
      ) ?? 0,
    );
    const paddingEnd = Math.max(
      0,
      resolveLength(physicalValue(declarations.padding, endEdge, resolvedDirection), ownerWidth) ??
        0,
    );
    const borderStart = Math.max(
      0,
      physicalNumber(declarations.border, startEdge, resolvedDirection),
    );
    const borderEnd = Math.max(0, physicalNumber(declarations.border, endEdge, resolvedDirection));
    outerSize = Math.fround(
      Math.fround(Math.fround(Math.fround(outerSize - paddingStart) - paddingEnd) - borderStart) -
        borderEnd,
    );
  }

  return Math.max(0, outerSize);
}

function rootMinimumOverride(
  declared: YogaValue,
  minimum: YogaValue,
  maximum: YogaValue,
  ownerSize: number | undefined,
): LengthPercentageAutoInput | undefined {
  const declaredLength = resolveLength(declared, ownerSize);
  const minimumLength = resolveLength(minimum, ownerSize);
  const maximumLength = resolveLength(maximum, ownerSize);
  return declaredLength !== undefined &&
    declaredLength >= 0 &&
    minimumLength !== undefined &&
    minimumLength >= 0 &&
    maximumLength !== undefined &&
    maximumLength >= 0 &&
    minimumLength > maximumLength &&
    declaredLength > maximumLength
    ? toDimension(maximum)
    : undefined;
}

export interface CalculationStylePlan {
  readonly style: StyleInput | null;
  readonly exactWidth: boolean;
  readonly exactHeight: boolean;
}

export function translateCalculationStyle(
  declarations: YogaDeclarations,
  config: TranslationConfig,
  resolvedDirection: Direction.LTR | Direction.RTL,
  ownerDirection: Direction.LTR | Direction.RTL,
  ownerWidth: number | undefined,
  ownerHeight: number | undefined,
): CalculationStylePlan {
  const width = exactRootDimension(
    declarations,
    "width",
    ownerWidth,
    ownerWidth,
    resolvedDirection,
  );
  const height = exactRootDimension(
    declarations,
    "height",
    ownerHeight,
    ownerWidth,
    resolvedDirection,
  );
  const forceFlexDisplay = declarations.display === Display.None;
  const minimumWidth = rootMinimumOverride(
    declarations.width,
    declarations.minWidth,
    declarations.maxWidth,
    ownerWidth,
  );
  const minimumHeight = rootMinimumOverride(
    declarations.height,
    declarations.minHeight,
    declarations.maxHeight,
    ownerHeight,
  );
  if (
    width === undefined &&
    height === undefined &&
    minimumWidth === undefined &&
    minimumHeight === undefined &&
    !forceFlexDisplay
  ) {
    return { style: null, exactWidth: false, exactHeight: false };
  }

  const ordinary = translateStyle(declarations, config, resolvedDirection, ownerDirection);
  return {
    style: {
      ...ordinary,
      display: forceFlexDisplay ? TaffyDisplay.Flex : ordinary.display,
      size: {
        width:
          width === undefined ? toSizeDimension(declarations.width) : TaffyDimension.Length(width),
        height:
          height === undefined
            ? toSizeDimension(declarations.height)
            : TaffyDimension.Length(height),
      },
      minSize: {
        width: minimumWidth ?? toMinDimension(declarations.minWidth),
        height: minimumHeight ?? toMinDimension(declarations.minHeight),
      },
    },
    exactWidth: width !== undefined,
    exactHeight: height !== undefined,
  };
}

export function declarationDirection(
  declarations: YogaDeclarations,
  ownerDirection: Direction.LTR | Direction.RTL,
): Direction.LTR | Direction.RTL {
  return declarations.direction === Direction.Inherit ? ownerDirection : declarations.direction;
}
