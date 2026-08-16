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
  type AlignContentValue,
  type AlignItemsValue,
  type AlignSelfValue,
  type Config,
  type DirtiedFunction,
  type MeasureFunction,
  type Node,
} from "yoga-layout";
import {
  loadYoga,
  type AlignContentValue as LoadedAlignContentValue,
  type AlignItemsValue as LoadedAlignItemsValue,
  type AlignSelfValue as LoadedAlignSelfValue,
  type Yoga as LoadedYoga,
  type Config as LoadedConfig,
  type Node as LoadedNode,
} from "yoga-layout/load";
import type { Config as OracleConfig, Node as OracleNode } from "yoga-layout-oracle";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? true
    : false;
type Assert<Value extends true> = Value;
type ConfigMethodNamesMatch = Assert<Equal<keyof Config, keyof OracleConfig>>;
type NodeMethodNamesMatch = Assert<Equal<keyof Node, keyof OracleNode>>;
type AlignValueSetsMatch = Assert<
  Equal<
    [AlignContentValue, AlignItemsValue, AlignSelfValue],
    [
      (
        | Align.FlexStart
        | Align.Center
        | Align.FlexEnd
        | Align.Stretch
        | Align.SpaceBetween
        | Align.SpaceAround
        | Align.SpaceEvenly
      ),
      Align.FlexStart | Align.Center | Align.FlexEnd | Align.Stretch | Align.Baseline,
      Align.Auto | Align.FlexStart | Align.Center | Align.FlexEnd | Align.Stretch | Align.Baseline,
    ]
  >
>;
type AlignSetterParametersMatch = Assert<
  Equal<
    [
      Parameters<Node["setAlignContent"]>[0],
      Parameters<Node["setAlignItems"]>[0],
      Parameters<Node["setAlignSelf"]>[0],
    ],
    [AlignContentValue, AlignItemsValue, AlignSelfValue]
  >
>;
type LoadedAlignValuesMatch = Assert<
  Equal<
    [LoadedAlignContentValue, LoadedAlignItemsValue, LoadedAlignSelfValue],
    [AlignContentValue, AlignItemsValue, AlignSelfValue]
  >
>;
type LegacyAlignConstantIsBroad = Assert<Equal<typeof Yoga.ALIGN_AUTO, Align>>;

declare const replacementConfigFactory: typeof Yoga.Config;
declare const replacementConfigCreate: () => Config;
declare const replacementNodeFactory: typeof Yoga.Node;
declare const replacementNodeCreate: (config?: Config) => Node;

Yoga.ALIGN_AUTO = Align.Center;
Yoga.Config = replacementConfigFactory;
Yoga.Config.create = replacementConfigCreate;
Yoga.Node = replacementNodeFactory;
Yoga.Node.create = replacementNodeCreate;

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
declare const alignContentValue: AlignContentValue;
declare const alignItemsValue: AlignItemsValue;
declare const alignSelfValue: AlignSelfValue;
node.setAlignContent(alignContentValue);
node.setAlignItems(alignItemsValue);
node.setAlignSelf(alignSelfValue);
const forwardAlignContent = <Value extends AlignContentValue>(value: Value): void => {
  node.setAlignContent(value);
};
const forwardAlignItems = <Value extends AlignItemsValue>(value: Value): void => {
  node.setAlignItems(value);
};
const forwardAlignSelf = <Value extends AlignSelfValue>(value: Value): void => {
  node.setAlignSelf(value);
};
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
node.setWidth(" 1%");
node.setWidth("0x10%");
node.setWidth("0b10%");
node.setWidth("0o10%");
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
const computedMargin: number = node.getComputedMargin(Edge.Start);
const computedPadding: number = node.getComputedPadding(Edge.End);
const computedBorder: number = node.getComputedBorder(Edge.Left);
const dirtied: DirtiedFunction = (dirtyNode) => dirtyNode.getComputedWidth();
const measure: MeasureFunction = () => ({ width: 1, height: 2 });
const child: Node = Yoga.Node.create();
node.insertChild(child, 0);
const childCount: number = node.getChildCount();
const typedChild: Node = node.getChild(0);
const typedParent: Node | null = child.getParent();
node.removeChild(child);
const dirty: boolean = node.isDirty();
const newLayout: boolean = node.hasNewLayout();
node.markLayoutSeen();
node.setMeasureFunc(measure);
node.markDirty();
node.unsetMeasureFunc();
node.setMeasureFunc(null);
node.setDirtiedFunc(dirtied);
node.unsetDirtiedFunc();
node.setDirtiedFunc(null);
node.setIsReferenceBaseline(false);
const referenceBaseline: boolean = node.isReferenceBaseline();
node.setAlwaysFormsContainingBlock(true);
node.reset();
child.freeRecursive();
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
declare const broadAlign: Align;
// @ts-expect-error A broad Align may contain a value unsupported by align-content.
node.setAlignContent(broadAlign);
// @ts-expect-error A broad Align may contain a value unsupported by align-items.
node.setAlignItems(broadAlign);
// @ts-expect-error A broad Align may contain a value unsupported by align-self.
node.setAlignSelf(broadAlign);
declare const mixedItemsAlign: Align.Center | Align.SpaceBetween;
// @ts-expect-error The union still contains an align-items value that is unsupported.
node.setAlignItems(mixedItemsAlign);
const forwardBroadAlign = <Value extends Align>(value: Value): void => {
  // @ts-expect-error A broad generic may contain a value unsupported by align-content.
  node.setAlignContent(value);
  // @ts-expect-error A broad generic may contain a value unsupported by align-items.
  node.setAlignItems(value);
  // @ts-expect-error A broad generic may contain a value unsupported by align-self.
  node.setAlignSelf(value);
};
// @ts-expect-error Static is omitted and its numeric value is rejected.
node.setPositionType(0);
// @ts-expect-error Value-like objects are not accepted by generic setters.
node.setWidth(node.getWidth());
// @ts-expect-error Reference-baseline selection is unsupported.
node.setIsReferenceBaseline(true);
// @ts-expect-error The eager root does not export Yoga as a named type.
type RootYoga = import("yoga-layout").Yoga;

void [
  width,
  computedMargin,
  computedPadding,
  computedBorder,
  webDefaults,
  webFlexBasis,
  errata,
  declaredGapResult,
  declaredGapPercentResult,
  styleWidth,
  gap,
  margin,
  childCount,
  typedChild,
  typedParent,
  dirty,
  newLayout,
  referenceBaseline,
  dirtied,
  measure,
  loadedPromise,
  loadedConfig,
  loadedNode,
  Display.Flex,
  PositionType.Relative,
  Errata.None,
  0 as unknown as RootYoga,
  0 as unknown as ConfigMethodNamesMatch,
  0 as unknown as NodeMethodNamesMatch,
  0 as unknown as AlignValueSetsMatch,
  0 as unknown as AlignSetterParametersMatch,
  0 as unknown as LoadedAlignValuesMatch,
  0 as unknown as LegacyAlignConstantIsBroad,
  alignContentValue,
  alignItemsValue,
  alignSelfValue,
  broadAlign,
  mixedItemsAlign,
  forwardAlignContent,
  forwardAlignItems,
  forwardAlignSelf,
  forwardBroadAlign,
];
