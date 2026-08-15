import Yoga, {
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
  Overflow,
  PositionType,
  Unit,
  Wrap,
  type Config,
  type DirtiedFunction,
  type MeasureFunction,
  type Node,
} from "yoga-layout";
import {
  loadYoga,
  type Yoga as LoadedYoga,
  type Config as LoadedConfig,
  type Node as LoadedNode,
} from "yoga-layout/load";

const config: Config = Yoga.Config.create();
const node: Node = Yoga.Node.create(config);
config.setUseWebDefaults(true);
const webDefaults: boolean = config.useWebDefaults();
config.setExperimentalFeatureEnabled(ExperimentalFeature.WebFlexBasis, true);
const webFlexBasis: boolean = config.isExperimentalFeatureEnabled(ExperimentalFeature.WebFlexBasis);
config.setPointScaleFactor(2);
config.setErrata(Errata.None);
const errata: Errata = config.getErrata();

node.setAlignContent(Align.SpaceEvenly);
node.setAlignItems(Align.Baseline);
node.setAlignSelf(Align.Auto);
node.setAspectRatio(2);
node.setBorder(Edge.All, 1);
node.setDirection(Direction.Inherit);
node.setDisplay(Display.Flex);
node.setFlex(1);
node.setFlexBasis("25%");
node.setFlexBasisPercent(25);
node.setFlexBasisAuto();
node.setFlexDirection(FlexDirection.Row);
node.setFlexGrow(1);
node.setFlexShrink(1);
node.setFlexWrap(Wrap.Wrap);
node.setWidth(100);
node.setWidthPercent(50);
node.setWidthAuto();
node.setHeight(40);
node.setHeightPercent(50);
node.setHeightAuto();
node.setJustifyContent(Justify.SpaceBetween);
const declaredGapResult: { unit: Unit; value: number } = node.setGap(Gutter.Row, 4);
const declaredGapPercentResult: { unit: Unit; value: number } = node.setGapPercent(
  Gutter.Column,
  5,
);
node.setMargin(Edge.Start, "auto");
node.setMarginPercent(Edge.End, 5);
node.setMarginAuto(Edge.All);
node.setMinWidth("25%");
node.setMinWidthPercent(25);
node.setMinHeight("25%");
node.setMinHeightPercent(25);
node.setMaxWidth("75%");
node.setMaxWidthPercent(75);
node.setMaxHeight("75%");
node.setMaxHeightPercent(75);
node.setOverflow(Overflow.Hidden);
node.setPadding(Edge.Horizontal, "5%");
node.setPaddingPercent(Edge.Vertical, 5);
node.setPosition(Edge.Left, "5%");
node.setPositionPercent(Edge.Right, 5);
node.setPositionAuto(Edge.Top);
node.setPositionType(PositionType.Relative);
node.setBoxSizing(BoxSizing.BorderBox);
const styleWidth: { unit: Unit; value: number } = node.getWidth();
const gap: { unit: Unit; value: number } = node.getGap(Gutter.Row);
const margin: { unit: Unit; value: number } = node.getMargin(Edge.Start);
node.copyStyle(node);
node.calculateLayout(undefined, undefined, Direction.LTR);
const width: number = node.getComputedWidth();
const dirtied: DirtiedFunction = (dirtyNode) => dirtyNode.getComputedWidth();
const measure: MeasureFunction = () => ({ width: 1, height: 2 });
const loadedPromise: Promise<LoadedYoga> = loadYoga();
const loadedConfig: LoadedConfig = config;
const loadedNode: LoadedNode = node;

// @ts-expect-error Display.Contents is unsupported and omitted.
void Display.Contents;
// @ts-expect-error PositionType.Static is unsupported and omitted.
void PositionType.Static;
// @ts-expect-error Non-None Errata values are unsupported and omitted.
void Errata.Classic;
// @ts-expect-error Auto is not a valid align-content value.
node.setAlignContent(Align.Auto);
// @ts-expect-error Distribution values are not valid align-items values.
node.setAlignItems(Align.SpaceBetween);
// @ts-expect-error Distribution values are not valid align-self values.
node.setAlignSelf(Align.SpaceEvenly);
// @ts-expect-error Static is omitted and its numeric value is rejected.
node.setPositionType(0);
// @ts-expect-error Value-like objects are not accepted by generic setters.
node.setWidth(node.getWidth());
// @ts-expect-error The eager root does not export Yoga as a named type.
type RootYoga = import("yoga-layout").Yoga;

void [
  width,
  webDefaults,
  webFlexBasis,
  errata,
  declaredGapResult,
  declaredGapPercentResult,
  styleWidth,
  gap,
  margin,
  dirtied,
  measure,
  loadedPromise,
  loadedConfig,
  loadedNode,
  Display.Flex,
  PositionType.Relative,
  Errata.None,
  0 as unknown as RootYoga,
];
