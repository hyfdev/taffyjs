import type { Layout as NativeLayout } from "@taffyjs/node";
import { resolveEdge, type YogaDeclarations } from "./declarations.js";
import { Direction, Display, Edge, FlexDirection, PositionType, Unit } from "./enums.js";
import type { Layout } from "./types.js";
import { resolvePercentage, type YogaValue } from "./values.js";

export interface ComputedEdges {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export interface ProjectionEntry {
  readonly declarations: YogaDeclarations;
  readonly direction: Direction.LTR | Direction.RTL;
  readonly pointScaleFactor: number;
  readonly measured: boolean;
  readonly nativeLayout: NativeLayout;
  readonly parentIndex: number | null;
}

export interface ProjectionOptions {
  readonly ownerWidth: number | undefined;
  readonly ownerHeight: number | undefined;
  readonly rootHasOwner: boolean;
}

export interface ProjectedOutput {
  readonly layout: Layout;
  readonly margin: ComputedEdges;
  readonly padding: ComputedEdges;
  readonly border: ComputedEdges;
  readonly direction: Direction.LTR | Direction.RTL;
}

interface ProjectionState extends ProjectedOutput {
  readonly absoluteLeft: number;
  readonly absoluteTop: number;
  readonly suppressed: boolean;
}

export function initialComputedEdges(): ComputedEdges {
  return { left: 0, top: 0, right: 0, bottom: 0 };
}

function floatAdd(left: number, right: number): number {
  return Math.fround(left + right);
}

function floatSubtract(left: number, right: number): number {
  return Math.fround(left - right);
}

function inexactEquals(left: number, right: number): boolean {
  if (!Number.isNaN(left) && !Number.isNaN(right)) return Math.abs(left - right) < 0.0001;
  return Number.isNaN(left) && Number.isNaN(right);
}

// Ported from Yoga 3.2.1's `yoga/algorithm/PixelGrid.cpp`, copyright Facebook, Inc. and its affiliates, under the MIT license. See `../THIRD_PARTY_NOTICES.md`.
function roundValueToPixelGrid(
  value: number,
  pointScaleFactor: number,
  forceCeil: boolean,
  forceFloor: boolean,
): number {
  let scaledValue = value * pointScaleFactor;
  let fractional = scaledValue % 1;
  if (fractional < 0) fractional += 1;

  if (inexactEquals(fractional, 0)) {
    scaledValue -= fractional;
  } else if (inexactEquals(fractional, 1)) {
    scaledValue = scaledValue - fractional + 1;
  } else if (forceCeil) {
    scaledValue = scaledValue - fractional + 1;
  } else if (forceFloor) {
    scaledValue -= fractional;
  } else {
    scaledValue =
      scaledValue -
      fractional +
      (!Number.isNaN(fractional) && (fractional > 0.5 || inexactEquals(fractional, 0.5)) ? 1 : 0);
  }

  return Math.fround(
    Number.isNaN(scaledValue) || Number.isNaN(pointScaleFactor)
      ? Number.NaN
      : scaledValue / pointScaleFactor,
  );
}

function roundLayout(
  layout: Layout,
  absoluteLeft: number,
  absoluteTop: number,
  pointScaleFactor: number,
  textRounding: boolean,
): Layout {
  if (pointScaleFactor === 0) return layout;

  const absoluteRight = absoluteLeft + layout.width;
  const absoluteBottom = absoluteTop + layout.height;
  const fractionalWidth = (layout.width * pointScaleFactor) % 1;
  const fractionalHeight = (layout.height * pointScaleFactor) % 1;
  const hasFractionalWidth =
    !inexactEquals(fractionalWidth, 0) && !inexactEquals(fractionalWidth, 1);
  const hasFractionalHeight =
    !inexactEquals(fractionalHeight, 0) && !inexactEquals(fractionalHeight, 1);

  return {
    left: roundValueToPixelGrid(layout.left, pointScaleFactor, false, textRounding),
    right: layout.right,
    top: roundValueToPixelGrid(layout.top, pointScaleFactor, false, textRounding),
    bottom: layout.bottom,
    width: Math.fround(
      roundValueToPixelGrid(
        absoluteRight,
        pointScaleFactor,
        textRounding && hasFractionalWidth,
        textRounding && !hasFractionalWidth,
      ) - roundValueToPixelGrid(absoluteLeft, pointScaleFactor, false, textRounding),
    ),
    height: Math.fround(
      roundValueToPixelGrid(
        absoluteBottom,
        pointScaleFactor,
        textRounding && hasFractionalHeight,
        textRounding && !hasFractionalHeight,
      ) - roundValueToPixelGrid(absoluteTop, pointScaleFactor, false, textRounding),
    ),
  };
}

function physicalValue(
  values: YogaDeclarations["position"],
  edge: Edge.Left | Edge.Top | Edge.Right | Edge.Bottom,
  direction: Direction.LTR | Direction.RTL,
): YogaValue {
  return resolveEdge(
    values,
    edge,
    direction,
    (value) => value.unit !== Unit.Undefined,
    () => ({ unit: Unit.Undefined, value: Number.NaN }),
  );
}

function resolvePosition(value: YogaValue, basis: number | undefined): number | undefined {
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

function resolveTaffyPosition(value: YogaValue, basis: number | undefined): number | undefined {
  return value.unit === Unit.Percent && basis !== undefined
    ? Math.fround(basis * Math.fround(value.value / 100))
    : resolvePosition(value, basis);
}

function axisRelativePosition(
  declarations: YogaDeclarations,
  start: Edge.Left | Edge.Top | Edge.Right | Edge.Bottom,
  end: Edge.Left | Edge.Top | Edge.Right | Edge.Bottom,
  direction: Direction.LTR | Direction.RTL,
  basis: number | undefined,
  resolve: (value: YogaValue, basis: number | undefined) => number | undefined = resolvePosition,
): number {
  const startValue = physicalValue(declarations.position, start, direction);
  const resolvedStart = resolve(startValue, basis);
  if (resolvedStart !== undefined) return resolvedStart;
  const endValue = physicalValue(declarations.position, end, direction);
  const resolvedEnd = resolve(endValue, basis);
  return resolvedEnd === undefined ? 0 : Math.fround(-resolvedEnd);
}

function nativeMarginEdges(entry: ProjectionEntry, suppressed: boolean): ComputedEdges {
  if (suppressed) return initialComputedEdges();
  const { declarations, direction, nativeLayout } = entry;
  const read = (edge: Edge.Left | Edge.Top | Edge.Right | Edge.Bottom): number =>
    physicalValue(declarations.margin, edge, direction).unit === Unit.Auto
      ? 0
      : nativeLayout.margin[
          edge === Edge.Left
            ? "left"
            : edge === Edge.Top
              ? "top"
              : edge === Edge.Right
                ? "right"
                : "bottom"
        ];
  return {
    left: read(Edge.Left),
    top: read(Edge.Top),
    right: read(Edge.Right),
    bottom: read(Edge.Bottom),
  };
}

function declaredMarginEdges(
  entry: ProjectionEntry,
  basis: number | undefined,
  suppressed: boolean,
): ComputedEdges {
  if (suppressed) return initialComputedEdges();
  const read = (edge: Edge.Left | Edge.Top | Edge.Right | Edge.Bottom): number => {
    const value = physicalValue(entry.declarations.margin, edge, entry.direction);
    return value.unit === Unit.Auto ? 0 : (resolvePosition(value, basis) ?? 0);
  };
  return {
    left: read(Edge.Left),
    top: read(Edge.Top),
    right: read(Edge.Right),
    bottom: read(Edge.Bottom),
  };
}

function nativeEdges(edges: NativeLayout["padding"], suppressed: boolean): ComputedEdges {
  return suppressed
    ? initialComputedEdges()
    : { left: edges.left, top: edges.top, right: edges.right, bottom: edges.bottom };
}

function resolveMainAxis(
  flexDirection: FlexDirection,
  direction: Direction.LTR | Direction.RTL,
): FlexDirection {
  if (direction === Direction.RTL) {
    if (flexDirection === FlexDirection.Row) return FlexDirection.RowReverse;
    if (flexDirection === FlexDirection.RowReverse) return FlexDirection.Row;
  }
  return flexDirection;
}

function resolveCrossAxis(
  mainAxis: FlexDirection,
  direction: Direction.LTR | Direction.RTL,
): FlexDirection {
  return mainAxis === FlexDirection.Column || mainAxis === FlexDirection.ColumnReverse
    ? resolveMainAxis(FlexDirection.Row, direction)
    : FlexDirection.Column;
}

function isHorizontal(axis: FlexDirection): boolean {
  return axis === FlexDirection.Row || axis === FlexDirection.RowReverse;
}

function startsAtEnd(axis: FlexDirection): boolean {
  return axis === FlexDirection.RowReverse || axis === FlexDirection.ColumnReverse;
}

function innerWidth(layout: NativeLayout): number {
  return Math.max(
    0,
    Math.fround(
      layout.size.width -
        layout.padding.left -
        layout.padding.right -
        layout.border.left -
        layout.border.right,
    ),
  );
}

function innerHeight(layout: NativeLayout): number {
  return Math.max(
    0,
    Math.fround(
      layout.size.height -
        layout.padding.top -
        layout.padding.bottom -
        layout.border.top -
        layout.border.bottom,
    ),
  );
}

function absoluteAxisLocation(
  entry: ProjectionEntry,
  parentEntry: ProjectionEntry,
  horizontal: boolean,
): { readonly location: number; readonly trailing: number | undefined } | undefined {
  const parentLayout = parentEntry.nativeLayout;
  const containingWidth = Math.max(
    0,
    Math.fround(parentLayout.size.width - parentLayout.border.left - parentLayout.border.right),
  );
  const containingHeight = Math.max(
    0,
    Math.fround(parentLayout.size.height - parentLayout.border.top - parentLayout.border.bottom),
  );
  const start = horizontal
    ? parentEntry.direction === Direction.RTL
      ? Edge.Right
      : Edge.Left
    : Edge.Top;
  const end = horizontal
    ? parentEntry.direction === Direction.RTL
      ? Edge.Left
      : Edge.Right
    : Edge.Bottom;
  const positionBasis = horizontal ? containingWidth : containingHeight;
  const startPosition = resolvePosition(
    physicalValue(entry.declarations.position, start, parentEntry.direction),
    positionBasis,
  );
  const endPosition = resolvePosition(
    physicalValue(entry.declarations.position, end, parentEntry.direction),
    positionBasis,
  );
  const selectedEdge = startPosition === undefined ? end : start;
  const selectedPosition = startPosition ?? endPosition;
  if (selectedPosition === undefined) return undefined;

  const selectedMargin =
    resolvePosition(
      physicalValue(entry.declarations.margin, selectedEdge, parentEntry.direction),
      positionBasis,
    ) ?? 0;
  const selectedBorder =
    selectedEdge === Edge.Left
      ? parentLayout.border.left
      : selectedEdge === Edge.Top
        ? parentLayout.border.top
        : selectedEdge === Edge.Right
          ? parentLayout.border.right
          : parentLayout.border.bottom;
  const offset = floatAdd(floatAdd(selectedPosition, selectedMargin), selectedBorder);
  const startsAtPhysicalEnd = selectedEdge === Edge.Right || selectedEdge === Edge.Bottom;
  if (!startsAtPhysicalEnd) return { location: offset, trailing: undefined };
  const parentSize = horizontal ? parentLayout.size.width : parentLayout.size.height;
  const childSize = horizontal ? entry.nativeLayout.size.width : entry.nativeLayout.size.height;
  return {
    location: floatSubtract(floatSubtract(parentSize, childSize), offset),
    trailing: startPosition === undefined ? undefined : offset,
  };
}

export function projectOutputs(
  entries: readonly ProjectionEntry[],
  options: ProjectionOptions,
): readonly ProjectedOutput[] {
  const states: ProjectionState[] = [];

  for (const [index, entry] of entries.entries()) {
    const parent = entry.parentIndex === null ? undefined : states[entry.parentIndex];
    if (entry.parentIndex !== null && parent === undefined) {
      throw new Error("Yoga projection requires parents before children");
    }
    const suppressed =
      parent?.suppressed === true || (index !== 0 && entry.declarations.display === Display.None);
    const parentEntry =
      entry.parentIndex === null ? undefined : entries[entry.parentIndex as number];
    const containingWidth =
      parentEntry === undefined
        ? options.ownerWidth
        : Math.max(
            0,
            Math.fround(
              parentEntry.nativeLayout.size.width -
                parentEntry.nativeLayout.border.left -
                parentEntry.nativeLayout.border.right,
            ),
          );
    const margin =
      entry.declarations.positionType === PositionType.Absolute
        ? declaredMarginEdges(entry, containingWidth, suppressed)
        : nativeMarginEdges(entry, suppressed);
    const positionMargin =
      entry.declarations.positionType === PositionType.Absolute && parentEntry !== undefined
        ? declaredMarginEdges(entry, innerWidth(parentEntry.nativeLayout), suppressed)
        : margin;
    const padding = nativeEdges(entry.nativeLayout.padding, suppressed);
    const border = nativeEdges(entry.nativeLayout.border, suppressed);

    let rawLayout: Layout;
    let absoluteLeft: number;
    let absoluteTop: number;
    if (suppressed) {
      rawLayout = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
      absoluteLeft = parent?.absoluteLeft ?? 0;
      absoluteTop = parent?.absoluteTop ?? 0;
    } else if (parent === undefined) {
      const positionDirection = options.rootHasOwner ? entry.direction : Direction.LTR;
      const relativeX = axisRelativePosition(
        entry.declarations,
        positionDirection === Direction.RTL ? Edge.Right : Edge.Left,
        positionDirection === Direction.RTL ? Edge.Left : Edge.Right,
        positionDirection,
        options.ownerWidth,
      );
      const relativeY = axisRelativePosition(
        entry.declarations,
        Edge.Top,
        Edge.Bottom,
        positionDirection,
        options.ownerHeight,
      );
      rawLayout = {
        left: floatAdd(margin.left, relativeX),
        right: floatAdd(margin.right, relativeX),
        top: floatAdd(margin.top, relativeY),
        bottom: floatAdd(margin.bottom, relativeY),
        width: entry.nativeLayout.size.width,
        height: entry.nativeLayout.size.height,
      };
      absoluteLeft = rawLayout.left;
      absoluteTop = rawLayout.top;
    } else {
      const parentEntry = entries[entry.parentIndex as number];
      const parentLayout = parentEntry.nativeLayout;
      const ownerWidth = innerWidth(parentLayout);
      const ownerHeight = innerHeight(parentLayout);
      const relativeX = axisRelativePosition(
        entry.declarations,
        entry.direction === Direction.RTL ? Edge.Right : Edge.Left,
        entry.direction === Direction.RTL ? Edge.Left : Edge.Right,
        entry.direction,
        ownerWidth,
      );
      const relativeY = axisRelativePosition(
        entry.declarations,
        Edge.Top,
        Edge.Bottom,
        entry.direction,
        ownerHeight,
      );
      const mainAxis = resolveMainAxis(
        parentEntry.declarations.flexDirection,
        parentEntry.direction,
      );
      const crossAxis = resolveCrossAxis(mainAxis, parentEntry.direction);
      const horizontalAxis = isHorizontal(mainAxis) ? mainAxis : crossAxis;
      const verticalAxis = isHorizontal(mainAxis) ? crossAxis : mainAxis;
      const horizontalStartsAtEnd = startsAtEnd(horizontalAxis);
      const verticalStartsAtEnd = startsAtEnd(verticalAxis);

      let left = entry.nativeLayout.location.x;
      let top = entry.nativeLayout.location.y;
      let reverseRight: number | undefined;
      let reverseBottom: number | undefined;
      if (entry.declarations.positionType === PositionType.Relative) {
        const physicalLeftFirst = axisRelativePosition(
          entry.declarations,
          Edge.Left,
          Edge.Right,
          entry.direction,
          ownerWidth,
          resolveTaffyPosition,
        );
        const physicalRightFirst = axisRelativePosition(
          entry.declarations,
          Edge.Right,
          Edge.Left,
          entry.direction,
          ownerWidth,
          resolveTaffyPosition,
        );
        const taffyX =
          parentEntry.direction === Direction.RTL
            ? Math.fround(-physicalRightFirst)
            : physicalLeftFirst;
        const taffyY = axisRelativePosition(
          entry.declarations,
          Edge.Top,
          Edge.Bottom,
          entry.direction,
          ownerHeight,
          resolveTaffyPosition,
        );
        const desiredX = horizontalStartsAtEnd ? Math.fround(-relativeX) : relativeX;
        const desiredY = verticalStartsAtEnd ? Math.fround(-relativeY) : relativeY;
        const flowLeft = floatSubtract(left, taffyX);
        const flowTop = floatSubtract(top, taffyY);
        left = floatAdd(flowLeft, desiredX);
        top = floatAdd(flowTop, desiredY);
        if (horizontalStartsAtEnd) {
          reverseRight = floatAdd(
            floatSubtract(
              floatSubtract(parentLayout.size.width, entry.nativeLayout.size.width),
              flowLeft,
            ),
            relativeX,
          );
        }
        if (verticalStartsAtEnd) {
          reverseBottom = floatAdd(
            floatSubtract(
              floatSubtract(parentLayout.size.height, entry.nativeLayout.size.height),
              flowTop,
            ),
            relativeY,
          );
        }
      } else {
        const horizontalLocation = absoluteAxisLocation(entry, parentEntry, true);
        const verticalLocation = absoluteAxisLocation(entry, parentEntry, false);
        if (horizontalLocation !== undefined) {
          left = horizontalLocation.location;
          if (horizontalStartsAtEnd) reverseRight = horizontalLocation.trailing;
        }
        if (verticalLocation !== undefined) {
          top = verticalLocation.location;
          if (verticalStartsAtEnd) reverseBottom = verticalLocation.trailing;
        }
      }

      rawLayout = {
        left,
        right: horizontalStartsAtEnd
          ? (reverseRight ??
            floatSubtract(
              floatSubtract(parentLayout.size.width, entry.nativeLayout.size.width),
              left,
            ))
          : floatAdd(positionMargin.right, relativeX),
        top,
        bottom: verticalStartsAtEnd
          ? (reverseBottom ??
            floatSubtract(
              floatSubtract(parentLayout.size.height, entry.nativeLayout.size.height),
              top,
            ))
          : floatAdd(positionMargin.bottom, relativeY),
        width: entry.nativeLayout.size.width,
        height: entry.nativeLayout.size.height,
      };
      absoluteLeft = parent.absoluteLeft + left;
      absoluteTop = parent.absoluteTop + top;
    }

    states.push({
      layout: roundLayout(
        rawLayout,
        absoluteLeft,
        absoluteTop,
        entry.pointScaleFactor,
        entry.measured,
      ),
      margin,
      padding,
      border,
      direction: entry.direction,
      absoluteLeft,
      absoluteTop,
      suppressed,
    });
  }

  return states;
}
