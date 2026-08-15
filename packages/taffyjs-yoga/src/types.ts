import type {
  Align,
  BoxSizing,
  Direction,
  Display,
  Edge,
  Errata,
  ExperimentalFeature,
  FlexDirection,
  Gutter,
  Justify,
  MeasureMode,
  Overflow,
  PositionType,
  Unit,
  Wrap,
} from "./enums.js";
import type { legacyConstants } from "./enums.js";

export interface Layout {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Value {
  unit: Unit;
  value: number;
}

export type DirtiedFunction = (node: Node) => void;

export type MeasureFunction = (
  width: number,
  widthMode: MeasureMode,
  height: number,
  heightMode: MeasureMode,
) => Size;

export type LayoutDimension = number | "auto" | undefined;

export type AlignContentValue =
  | Align.FlexStart
  | Align.Center
  | Align.FlexEnd
  | Align.Stretch
  | Align.SpaceBetween
  | Align.SpaceAround
  | Align.SpaceEvenly;

export type AlignItemsValue =
  | Align.FlexStart
  | Align.Center
  | Align.FlexEnd
  | Align.Stretch
  | Align.Baseline;

export type AlignSelfValue = Align.Auto | AlignItemsValue;

export interface Config {
  free(): void;
  isExperimentalFeatureEnabled(feature: ExperimentalFeature): boolean;
  setExperimentalFeatureEnabled(feature: ExperimentalFeature, enabled: boolean): void;
  setPointScaleFactor(factor: number): void;
  getErrata(): Errata;
  setErrata(errata: Errata): void;
  useWebDefaults(): boolean;
  setUseWebDefaults(useWebDefaults: boolean): void;
}

export interface Node {
  free(): void;
  copyStyle(node: Node): void;
  getAlignContent(): Align;
  getAlignItems(): Align;
  getAlignSelf(): Align;
  getAspectRatio(): number;
  getBorder(edge: Edge): number;
  getDirection(): Direction;
  getDisplay(): Display;
  getFlexBasis(): Value;
  getFlexDirection(): FlexDirection;
  getFlexGrow(): number;
  getFlexShrink(): number;
  getFlexWrap(): Wrap;
  getHeight(): Value;
  getJustifyContent(): Justify;
  getGap(gutter: Gutter): Value;
  getMargin(edge: Edge): Value;
  getMaxHeight(): Value;
  getMaxWidth(): Value;
  getMinHeight(): Value;
  getMinWidth(): Value;
  getOverflow(): Overflow;
  getPadding(edge: Edge): Value;
  getPosition(edge: Edge): Value;
  getPositionType(): PositionType;
  getBoxSizing(): BoxSizing;
  getWidth(): Value;
  setAlignContent(alignContent: AlignContentValue): void;
  setAlignItems(alignItems: AlignItemsValue): void;
  setAlignSelf(alignSelf: AlignSelfValue): void;
  setAspectRatio(aspectRatio: number | undefined): void;
  setBorder(edge: Edge, borderWidth: number | undefined): void;
  setDirection(direction: Direction): void;
  setDisplay(display: Display): void;
  setFlex(flex: number | undefined): void;
  setFlexBasis(flexBasis: number | "auto" | `${number}%` | undefined): void;
  setFlexBasisPercent(flexBasis: number | undefined): void;
  setFlexBasisAuto(): void;
  setFlexDirection(flexDirection: FlexDirection): void;
  setFlexGrow(flexGrow: number | undefined): void;
  setFlexShrink(flexShrink: number | undefined): void;
  setFlexWrap(flexWrap: Wrap): void;
  setHeight(height: number | "auto" | `${number}%` | undefined): void;
  setHeightAuto(): void;
  setHeightPercent(height: number | undefined): void;
  setJustifyContent(justifyContent: Justify): void;
  setGap(gutter: Gutter, gapLength: number | `${number}%` | undefined): Value;
  setGapPercent(gutter: Gutter, gapLength: number | undefined): Value;
  setMargin(edge: Edge, margin: number | "auto" | `${number}%` | undefined): void;
  setMarginAuto(edge: Edge): void;
  setMarginPercent(edge: Edge, margin: number | undefined): void;
  setMaxHeight(maxHeight: number | `${number}%` | undefined): void;
  setMaxHeightPercent(maxHeight: number | undefined): void;
  setMaxWidth(maxWidth: number | `${number}%` | undefined): void;
  setMaxWidthPercent(maxWidth: number | undefined): void;
  setMinHeight(minHeight: number | `${number}%` | undefined): void;
  setMinHeightPercent(minHeight: number | undefined): void;
  setMinWidth(minWidth: number | `${number}%` | undefined): void;
  setMinWidthPercent(minWidth: number | undefined): void;
  setOverflow(overflow: Overflow): void;
  setPadding(edge: Edge, padding: number | `${number}%` | undefined): void;
  setPaddingPercent(edge: Edge, padding: number | undefined): void;
  setPosition(edge: Edge, position: number | `${number}%` | undefined): void;
  setPositionPercent(edge: Edge, position: number | undefined): void;
  setPositionType(positionType: PositionType): void;
  setPositionAuto(edge: Edge): void;
  setBoxSizing(boxSizing: BoxSizing): void;
  setWidth(width: number | "auto" | `${number}%` | undefined): void;
  setWidthAuto(): void;
  setWidthPercent(width: number | undefined): void;
  calculateLayout(width: LayoutDimension, height: LayoutDimension, direction?: Direction): void;
  getComputedLeft(): number;
  getComputedRight(): number;
  getComputedTop(): number;
  getComputedBottom(): number;
  getComputedWidth(): number;
  getComputedHeight(): number;
  getComputedLayout(): Layout;
}

export interface ConfigFactory {
  create(): Config;
  destroy(config: Config): void;
}

export interface NodeFactory {
  create(config?: Config): Node;
  createDefault(): Node;
  createWithConfig(config: Config): Node;
  destroy(node: Node): void;
}

export type Yoga = Readonly<
  {
    Config: ConfigFactory;
    Node: NodeFactory;
  } & typeof legacyConstants
>;
