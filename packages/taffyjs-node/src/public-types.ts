import {
  AlignContent,
  AlignItems,
  BoxSizing,
  Clear,
  Contain,
  DetailedLayoutInfoKind,
  Direction,
  Display,
  FlexDirection,
  FlexWrap,
  Float,
  GridAutoFlow,
  GridPlacementKind,
  GridTemplateComponentKind,
  Overflow,
  Position,
  RepetitionCountKind,
  TextAlign,
  TrackSizingKind,
} from "./numeric-families.js";
import type { NodeId } from "./node-id.js";
import type {
  AvailableSpace,
  AvailableSpaceInput,
  Dimension,
  LengthPercentage,
  LengthPercentageAuto,
  LengthPercentageInput,
} from "./tagged-values.js";

/** Supplies writable point data at the public API boundary. */
export interface PointInput<T> {
  /** Supplies the x value used by PointInput. */ x: T;
  /** Supplies the y value used by PointInput. */ y: T;
}

/** Supplies writable partial point data at the public API boundary. */
export interface PartialPointInput<T> {
  /** Supplies the x value used by PartialPointInput. */ x?: T | undefined;
  /** Supplies the y value used by PartialPointInput. */ y?: T | undefined;
}

/** Represents the public point value used by TaffyJS. */
export interface Point<T> {
  /** Stores the x component of this Point value. */ readonly x: T;
  /** Stores the y component of this Point value. */ readonly y: T;
}

/** Supplies writable size data at the public API boundary. */
export interface SizeInput<T> {
  /** Supplies the width value used by SizeInput. */ width: T;
  /** Supplies the height value used by SizeInput. */ height: T;
}

/** Supplies writable partial size data at the public API boundary. */
export interface PartialSizeInput<T> {
  /** Supplies the width value used by PartialSizeInput. */ width?: T | undefined;
  /** Supplies the height value used by PartialSizeInput. */ height?: T | undefined;
}

/** Represents the public size value used by TaffyJS. */
export interface Size<T> {
  /** Stores the width component of this Size value. */ readonly width: T;
  /** Stores the height component of this Size value. */ readonly height: T;
}

/** Supplies writable rect data at the public API boundary. */
export interface RectInput<T> {
  /** Supplies the left value used by RectInput. */ left: T;
  /** Supplies the right value used by RectInput. */ right: T;
  /** Supplies the top value used by RectInput. */ top: T;
  /** Supplies the bottom value used by RectInput. */ bottom: T;
}

/** Supplies writable partial rect data at the public API boundary. */
export interface PartialRectInput<T> {
  /** Supplies the left value used by PartialRectInput. */ left?: T | undefined;
  /** Supplies the right value used by PartialRectInput. */ right?: T | undefined;
  /** Supplies the top value used by PartialRectInput. */ top?: T | undefined;
  /** Supplies the bottom value used by PartialRectInput. */ bottom?: T | undefined;
}

/** Represents the public rect value used by TaffyJS. */
export interface Rect<T> {
  /** Stores the left component of this Rect value. */ readonly left: T;
  /** Stores the right component of this Rect value. */ readonly right: T;
  /** Stores the top component of this Rect value. */ readonly top: T;
  /** Stores the bottom component of this Rect value. */ readonly bottom: T;
}

/** Supplies writable line data at the public API boundary. */
export interface LineInput<T> {
  /** Supplies the start value used by LineInput. */ start: T;
  /** Supplies the end value used by LineInput. */ end: T;
}

/** Supplies writable partial line data at the public API boundary. */
export interface PartialLineInput<T> {
  /** Supplies the start value used by PartialLineInput. */ start?: T | undefined;
  /** Supplies the end value used by PartialLineInput. */ end?: T | undefined;
}

/** Represents the public line value used by TaffyJS. */
export interface Line<T> {
  /** Stores the start component of this Line value. */ readonly start: T;
  /** Stores the end component of this Line value. */ readonly end: T;
}

/** Supplies writable grid placement data at the public API boundary. */
export type GridPlacementInput =
  | {
      /** Identifies which GridPlacementInput tagged variant this value contains. */ kind: typeof GridPlacementKind.Auto;
    }
  | {
      /** Identifies which GridPlacementInput tagged variant this value contains. */ kind: typeof GridPlacementKind.Line;
      /** Supplies the index value used by GridPlacementInput. */ index: number;
    }
  | {
      /** Identifies which GridPlacementInput tagged variant this value contains. */ kind: typeof GridPlacementKind.NamedLine;
      /** Supplies the name value used by GridPlacementInput. */ name: string;
      /** Supplies the index value used by GridPlacementInput. */ index: number;
    }
  | {
      /** Identifies which GridPlacementInput tagged variant this value contains. */ kind: typeof GridPlacementKind.Span;
      /** Supplies the span value used by GridPlacementInput. */ span: number;
    }
  | {
      /** Identifies which GridPlacementInput tagged variant this value contains. */ kind: typeof GridPlacementKind.NamedSpan;
      /** Supplies the name value used by GridPlacementInput. */ name: string;
      /** Supplies the span value used by GridPlacementInput. */ span: number;
    };

/** Represents the public grid placement value used by TaffyJS. */
export type GridPlacement =
  | Readonly<{
      /** Identifies which GridPlacement tagged variant this value contains. */ kind: typeof GridPlacementKind.Auto;
    }>
  | Readonly<{
      /** Identifies which GridPlacement tagged variant this value contains. */ kind: typeof GridPlacementKind.Line;
      /** Reports the index component of this GridPlacement value. */ index: number;
    }>
  | Readonly<{
      /** Identifies which GridPlacement tagged variant this value contains. */ kind: typeof GridPlacementKind.NamedLine;
      /** Reports the name component of this GridPlacement value. */ name: string;
      /** Reports the index component of this GridPlacement value. */ index: number;
    }>
  | Readonly<{
      /** Identifies which GridPlacement tagged variant this value contains. */ kind: typeof GridPlacementKind.Span;
      /** Reports the span component of this GridPlacement value. */ span: number;
    }>
  | Readonly<{
      /** Identifies which GridPlacement tagged variant this value contains. */ kind: typeof GridPlacementKind.NamedSpan;
      /** Reports the name component of this GridPlacement value. */ name: string;
      /** Reports the span component of this GridPlacement value. */ span: number;
    }>;

/** Supplies writable min track sizing function data at the public API boundary. */
export type MinTrackSizingFunctionInput =
  | {
      /** Identifies which MinTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.Length;
      /** Carries the payload for this MinTrackSizingFunctionInput tagged variant. */ value: number;
    }
  | {
      /** Identifies which MinTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.Percent;
      /** Carries the payload for this MinTrackSizingFunctionInput tagged variant. */ value: number;
    }
  | {
      /** Identifies which MinTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.Auto;
    }
  | {
      /** Identifies which MinTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.MinContent;
    }
  | {
      /** Identifies which MinTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.MaxContent;
    };

/** Represents the public min track sizing function value used by TaffyJS. */
export type MinTrackSizingFunction =
  | Readonly<{
      /** Identifies which MinTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.Length;
      /** Carries the payload for this MinTrackSizingFunction tagged variant. */ value: number;
    }>
  | Readonly<{
      /** Identifies which MinTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.Percent;
      /** Carries the payload for this MinTrackSizingFunction tagged variant. */ value: number;
    }>
  | Readonly<{
      /** Identifies which MinTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.Auto;
    }>
  | Readonly<{
      /** Identifies which MinTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.MinContent;
    }>
  | Readonly<{
      /** Identifies which MinTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.MaxContent;
    }>;

/** Supplies writable max track sizing function data at the public API boundary. */
export type MaxTrackSizingFunctionInput =
  | MinTrackSizingFunctionInput
  | {
      /** Identifies which MaxTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.FitContent;
      /** Carries the payload for this MaxTrackSizingFunctionInput tagged variant. */ value: LengthPercentageInput;
    }
  | {
      /** Identifies which MaxTrackSizingFunctionInput tagged variant this value contains. */ kind: typeof TrackSizingKind.Fr;
      /** Carries the payload for this MaxTrackSizingFunctionInput tagged variant. */ value: number;
    };

/** Represents the public max track sizing function value used by TaffyJS. */
export type MaxTrackSizingFunction =
  | MinTrackSizingFunction
  | Readonly<{
      /** Identifies which MaxTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.FitContent;
      /** Carries the payload for this MaxTrackSizingFunction tagged variant. */ value: LengthPercentage;
    }>
  | Readonly<{
      /** Identifies which MaxTrackSizingFunction tagged variant this value contains. */ kind: typeof TrackSizingKind.Fr;
      /** Carries the payload for this MaxTrackSizingFunction tagged variant. */ value: number;
    }>;

/** Supplies writable track sizing function data at the public API boundary. */
export interface TrackSizingFunctionInput {
  /** Supplies the min value used by TrackSizingFunctionInput. */ min: MinTrackSizingFunctionInput;
  /** Supplies the max value used by TrackSizingFunctionInput. */ max: MaxTrackSizingFunctionInput;
}

/** Represents the public track sizing function value used by TaffyJS. */
export interface TrackSizingFunction {
  /** Reports the min component of this TrackSizingFunction value. */ readonly min: MinTrackSizingFunction;
  /** Reports the max component of this TrackSizingFunction value. */ readonly max: MaxTrackSizingFunction;
}

/** Supplies writable repetition count data at the public API boundary. */
export type RepetitionCountInput =
  | {
      /** Identifies which RepetitionCountInput tagged variant this value contains. */ kind: typeof RepetitionCountKind.Count;
      /** Carries the payload for this RepetitionCountInput tagged variant. */ value: number;
    }
  | {
      /** Identifies which RepetitionCountInput tagged variant this value contains. */ kind: typeof RepetitionCountKind.AutoFill;
    }
  | {
      /** Identifies which RepetitionCountInput tagged variant this value contains. */ kind: typeof RepetitionCountKind.AutoFit;
    };

/** Represents the public repetition count value used by TaffyJS. */
export type RepetitionCount =
  | Readonly<{
      /** Identifies which RepetitionCount tagged variant this value contains. */ kind: typeof RepetitionCountKind.Count;
      /** Carries the payload for this RepetitionCount tagged variant. */ value: number;
    }>
  | Readonly<{
      /** Identifies which RepetitionCount tagged variant this value contains. */ kind: typeof RepetitionCountKind.AutoFill;
    }>
  | Readonly<{
      /** Identifies which RepetitionCount tagged variant this value contains. */ kind: typeof RepetitionCountKind.AutoFit;
    }>;

/** Supplies writable grid template repetition data at the public API boundary. */
export interface GridTemplateRepetitionInput {
  /** Supplies the count value used by GridTemplateRepetitionInput. */ count: RepetitionCountInput;
  /** Supplies the tracks value used by GridTemplateRepetitionInput. */ tracks: readonly TrackSizingFunctionInput[];
  /** Supplies the line names value used by GridTemplateRepetitionInput. */ lineNames: readonly (readonly string[])[];
}

/** Represents the public grid template repetition value used by TaffyJS. */
export interface GridTemplateRepetition {
  /** Stores the count component of this GridTemplateRepetition value. */ readonly count: RepetitionCount;
  /** Stores the tracks component of this GridTemplateRepetition value. */ readonly tracks: readonly TrackSizingFunction[];
  /** Stores the line names component of this GridTemplateRepetition value. */ readonly lineNames: readonly (readonly string[])[];
}

/** Supplies writable grid template component data at the public API boundary. */
export type GridTemplateComponentInput =
  | {
      /** Identifies which GridTemplateComponentInput tagged variant this value contains. */ kind: typeof GridTemplateComponentKind.Single;
      /** Carries the payload for this GridTemplateComponentInput tagged variant. */ value: TrackSizingFunctionInput;
    }
  | {
      /** Identifies which GridTemplateComponentInput tagged variant this value contains. */ kind: typeof GridTemplateComponentKind.Repeat;
      /** Carries the payload for this GridTemplateComponentInput tagged variant. */ value: GridTemplateRepetitionInput;
    };

/** Represents the public grid template component value used by TaffyJS. */
export type GridTemplateComponent =
  | Readonly<{
      /** Identifies which GridTemplateComponent tagged variant this value contains. */ kind: typeof GridTemplateComponentKind.Single;
      /** Carries the payload for this GridTemplateComponent tagged variant. */ value: TrackSizingFunction;
    }>
  | Readonly<{
      /** Identifies which GridTemplateComponent tagged variant this value contains. */ kind: typeof GridTemplateComponentKind.Repeat;
      /** Carries the payload for this GridTemplateComponent tagged variant. */ value: GridTemplateRepetition;
    }>;

/** Supplies writable grid template areas data at the public API boundary. */
export interface GridTemplateAreasInput {
  /** Supplies the areas value used by GridTemplateAreasInput. */ areas: readonly GridTemplateAreaInput[];
  /** Supplies the row count value used by GridTemplateAreasInput. */ rowCount: number;
  /** Supplies the column count value used by GridTemplateAreasInput. */ columnCount: number;
}

/** Represents the public grid template areas value used by TaffyJS. */
export interface GridTemplateAreas {
  /** Stores the areas component of this GridTemplateAreas value. */ readonly areas: readonly GridTemplateArea[];
  /** Stores the row count component of this GridTemplateAreas value. */ readonly rowCount: number;
  /** Stores the column count component of this GridTemplateAreas value. */ readonly columnCount: number;
}

/** Supplies writable grid template area data at the public API boundary. */
export interface GridTemplateAreaInput {
  /** Supplies the name value used by GridTemplateAreaInput. */ name: string;
  /** Supplies the row start value used by GridTemplateAreaInput. */ rowStart: number;
  /** Supplies the row end value used by GridTemplateAreaInput. */ rowEnd: number;
  /** Supplies the column start value used by GridTemplateAreaInput. */ columnStart: number;
  /** Supplies the column end value used by GridTemplateAreaInput. */ columnEnd: number;
}

/** Represents the public grid template area value used by TaffyJS. */
export interface GridTemplateArea {
  /** Stores the name component of this GridTemplateArea value. */ readonly name: string;
  /** Stores the row start component of this GridTemplateArea value. */ readonly rowStart: number;
  /** Stores the row end component of this GridTemplateArea value. */ readonly rowEnd: number;
  /** Stores the column start component of this GridTemplateArea value. */ readonly columnStart: number;
  /** Stores the column end component of this GridTemplateArea value. */ readonly columnEnd: number;
}

/** Returns a complete detached readonly snapshot of a node's stored style. */
export interface Style {
  /** Reports the node's stored display style value. */ readonly display: Display;
  /** Reports the node's stored item is table style value. */ readonly itemIsTable: boolean;
  /** Reports the node's stored item is replaced style value. */ readonly itemIsReplaced: boolean;
  /** Reports the node's stored box sizing style value. */ readonly boxSizing: BoxSizing;
  /** Reports the node's stored direction style value. */ readonly direction: Direction;
  /** Reports the node's stored overflow style value. */ readonly overflow: Point<Overflow>;
  /** Reports the node's stored scrollbar width style value. */ readonly scrollbarWidth: number;
  /** Reports the node's stored layout and paint containment style value. */ readonly contain: Contain;
  /** Reports the node's stored float style value. */ readonly float: Float;
  /** Reports which preceding floats this node must clear. */ readonly clear: Clear;
  /** Reports the node's stored position style value. */ readonly position: Position;
  /** Reports the node's stored inset style value. */ readonly inset: Rect<LengthPercentageAuto>;
  /** Reports the node's stored size style value. */ readonly size: Size<Dimension>;
  /** Reports the node's stored min size style value. */ readonly minSize: Size<Dimension>;
  /** Reports the node's stored max size style value. */ readonly maxSize: Size<Dimension>;
  /** Reports the node's stored aspect ratio style value. */ readonly aspectRatio: number | null;
  /** Reports the node's stored margin style value. */ readonly margin: Rect<LengthPercentageAuto>;
  /** Reports the node's stored padding style value. */ readonly padding: Rect<LengthPercentage>;
  /** Reports the node's stored border style value. */ readonly border: Rect<LengthPercentage>;
  /** Reports the node's stored align items style value. */ readonly alignItems: AlignItems | null;
  /** Reports the node's stored align self style value. */ readonly alignSelf: AlignItems | null;
  /** Reports the node's stored justify items style value. */ readonly justifyItems: AlignItems | null;
  /** Reports the node's stored justify self style value. */ readonly justifySelf: AlignItems | null;
  /** Reports the node's stored align content style value. */ readonly alignContent: AlignContent | null;
  /** Reports the node's stored justify content style value. */ readonly justifyContent: AlignContent | null;
  /** Reports the node's stored gap style value. */ readonly gap: Size<LengthPercentage>;
  /** Reports the node's stored text align style value. */ readonly textAlign: TextAlign;
  /** Reports the node's stored flex direction style value. */ readonly flexDirection: FlexDirection;
  /** Reports the node's stored flex wrap style value. */ readonly flexWrap: FlexWrap;
  /** Reports the node's stored flex basis style value. */ readonly flexBasis: Dimension;
  /** Reports the node's stored flex grow style value. */ readonly flexGrow: number;
  /** Reports the node's stored flex shrink style value. */ readonly flexShrink: number;
  /** Reports the node's stored grid template rows style value. */ readonly gridTemplateRows: readonly GridTemplateComponent[];
  /** Reports the node's stored grid template columns style value. */ readonly gridTemplateColumns: readonly GridTemplateComponent[];
  /** Reports the node's stored grid auto rows style value. */ readonly gridAutoRows: readonly TrackSizingFunction[];
  /** Reports the node's stored grid auto columns style value. */ readonly gridAutoColumns: readonly TrackSizingFunction[];
  /** Reports the node's stored grid auto flow style value. */ readonly gridAutoFlow: GridAutoFlow;
  /** Reports the node's stored grid template areas style value. */ readonly gridTemplateAreas: GridTemplateAreas | null;
  /** Reports the node's stored grid template column names style value. */ readonly gridTemplateColumnNames: readonly (readonly string[])[];
  /** Reports the node's stored grid template row names style value. */ readonly gridTemplateRowNames: readonly (readonly string[])[];
  /** Reports the node's stored grid row style value. */ readonly gridRow: Line<GridPlacement>;
  /** Reports the node's stored grid column style value. */ readonly gridColumn: Line<GridPlacement>;
}

/** Reports detached readonly detailed layout info from a completed Grid layout. */
export type DetailedLayoutInfo =
  | Readonly<{
      /** Identifies which DetailedLayoutInfo tagged variant this value contains. */ kind: typeof DetailedLayoutInfoKind.None;
    }>
  | Readonly<{
      /** Identifies which DetailedLayoutInfo tagged variant this value contains. */ kind: typeof DetailedLayoutInfoKind.Grid;
      /** Carries the payload for this DetailedLayoutInfo tagged variant. */ value: DetailedGridInfo;
    }>;

/** Reports detached readonly detailed grid info from a completed Grid layout. */
export interface DetailedGridInfo {
  /** Reports the rows value stored in DetailedGridInfo. */ readonly rows: DetailedGridTracksInfo;
  /** Reports the columns value stored in DetailedGridInfo. */ readonly columns: DetailedGridTracksInfo;
  /** Reports the items value stored in DetailedGridInfo. */ readonly items: readonly DetailedGridItemInfo[];
}

/** Reports detached readonly detailed grid tracks info from a completed Grid layout. */
export interface DetailedGridTracksInfo {
  /** Reports the negative implicit tracks value stored in DetailedGridTracksInfo. */ readonly negativeImplicitTracks: number;
  /** Reports the explicit tracks value stored in DetailedGridTracksInfo. */ readonly explicitTracks: number;
  /** Reports the positive implicit tracks value stored in DetailedGridTracksInfo. */ readonly positiveImplicitTracks: number;
  /** Reports each track's start and end position relative to the Grid container's border box. */ readonly positions: readonly Line<number>[];
  /** Reports the names attached to each Grid line; empty when the axis has no named lines. */ readonly lineNames: readonly (readonly string[])[];
}

/** Reports detached readonly detailed grid item info from a completed Grid layout. */
export interface DetailedGridItemInfo {
  /** Reports the row start value stored in DetailedGridItemInfo. */ readonly rowStart: number;
  /** Reports the row end value stored in DetailedGridItemInfo. */ readonly rowEnd: number;
  /** Reports the column start value stored in DetailedGridItemInfo. */ readonly columnStart: number;
  /** Reports the column end value stored in DetailedGridItemInfo. */ readonly columnEnd: number;
}

/** Supplies dimensions, available space, identity, context, and on-demand style access to measurement. */
export type MeasureArgs<TContext> = Readonly<{
  /** Supplies the known dimensions value used by MeasureArgs. */ knownDimensions: Size<
    number | undefined
  >;
  /** Supplies the available space value used by MeasureArgs. */ availableSpace: Size<AvailableSpace>;
  /** Supplies the node value used by MeasureArgs. */ node: NodeId;
  /** Supplies the context value used by MeasureArgs. */ context: TContext | undefined;
  /** Returns a new detached snapshot of the measured node's complete normalized Style. */
  getStyle(): Style;
}>;

/** Measures synchronously when Taffy requests it; invocation count and order are unspecified, and changed external data requires explicit dirtying. The same type is used for per-node measures and a computeLayout fallback. */
export type MeasureFunction<TContext> = (args: MeasureArgs<TContext>) => SizeInput<number>;

/** Supplies a half-open child index range to removeChildrenRange. */
export interface ChildRangeInput {
  /** Supplies the start value used by ChildRangeInput. */ start: number;
  /** Supplies the end value used by ChildRangeInput. */ end: number;
}

/** Supplies a root, available space, and an optional synchronous fallback for layout. */
export interface ComputeLayoutOptions<TContext = unknown> {
  /** Supplies the root value used by ComputeLayoutOptions. */ root: NodeId;
  /** Supplies the available space value used by ComputeLayoutOptions. */ availableSpace: SizeInput<AvailableSpaceInput>;
  /** Supplies the optional global fallback used after any configured per-node measure. */ measure?: MeasureFunction<TContext>;
}
