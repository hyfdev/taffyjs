import assert from "node:assert/strict";
import Yoga, {
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
  type Node,
} from "yoga-layout";
import OracleYoga, {
  Align as OracleAlign,
  BoxSizing as OracleBoxSizing,
  Direction as OracleDirection,
  Display as OracleDisplay,
  Edge as OracleEdge,
  FlexDirection as OracleFlexDirection,
  Gutter as OracleGutter,
  Justify as OracleJustify,
  Overflow as OracleOverflow,
  PositionType as OraclePositionType,
  Wrap as OracleWrap,
  type Node as OracleNode,
} from "yoga-layout-oracle";
import { test } from "vite-plus/test";

const edges = [
  Edge.Left,
  Edge.Top,
  Edge.Right,
  Edge.Bottom,
  Edge.Start,
  Edge.End,
  Edge.Horizontal,
  Edge.Vertical,
  Edge.All,
] as const;

const gutters = [Gutter.Column, Gutter.Row, Gutter.All] as const;

function assertStyleEqual(actual: Node, expected: OracleNode): void {
  assert.equal(actual.getAlignContent(), expected.getAlignContent());
  assert.equal(actual.getAlignItems(), expected.getAlignItems());
  assert.equal(actual.getAlignSelf(), expected.getAlignSelf());
  assert.equal(actual.getAspectRatio(), expected.getAspectRatio());
  assert.equal(actual.getDirection(), expected.getDirection());
  assert.equal(actual.getDisplay(), expected.getDisplay());
  assert.deepEqual(actual.getFlexBasis(), expected.getFlexBasis());
  assert.equal(actual.getFlexDirection(), expected.getFlexDirection());
  assert.equal(actual.getFlexGrow(), expected.getFlexGrow());
  assert.equal(actual.getFlexShrink(), expected.getFlexShrink());
  assert.equal(actual.getFlexWrap(), expected.getFlexWrap());
  assert.deepEqual(actual.getHeight(), expected.getHeight());
  assert.equal(actual.getJustifyContent(), expected.getJustifyContent());
  assert.deepEqual(actual.getMaxHeight(), expected.getMaxHeight());
  assert.deepEqual(actual.getMaxWidth(), expected.getMaxWidth());
  assert.deepEqual(actual.getMinHeight(), expected.getMinHeight());
  assert.deepEqual(actual.getMinWidth(), expected.getMinWidth());
  assert.equal(actual.getOverflow(), expected.getOverflow());
  assert.equal(actual.getPositionType(), expected.getPositionType());
  assert.equal(actual.getBoxSizing(), expected.getBoxSizing());
  assert.deepEqual(actual.getWidth(), expected.getWidth());

  for (const edge of edges) {
    assert.equal(actual.getBorder(edge), expected.getBorder(edge as OracleEdge));
    assert.deepEqual(actual.getMargin(edge), expected.getMargin(edge as OracleEdge));
    assert.deepEqual(actual.getPadding(edge), expected.getPadding(edge as OracleEdge));
    assert.deepEqual(actual.getPosition(edge), expected.getPosition(edge as OracleEdge));
  }
  for (const gutter of gutters) {
    assert.equal(
      actual.getGap(gutter) as unknown,
      expected.getGap(gutter as OracleGutter) as unknown,
    );
  }
}

test("normal and web-default declaration getters match Yoga", () => {
  for (const webDefaults of [false, true]) {
    const config = Yoga.Config.create();
    const oracleConfig = OracleYoga.Config.create();
    config.setUseWebDefaults(webDefaults);
    oracleConfig.setUseWebDefaults(webDefaults);
    const node = Yoga.Node.createWithConfig(config);
    const oracleNode = OracleYoga.Node.createWithConfig(oracleConfig);
    try {
      assertStyleEqual(node, oracleNode);
    } finally {
      node.free();
      oracleNode.free();
      config.free();
      oracleConfig.free();
    }
  }
});

test("every supported Style setter family round-trips like Yoga", () => {
  const node = Yoga.Node.create();
  const oracle = OracleYoga.Node.create();
  try {
    node.setAlignContent(Align.SpaceEvenly);
    oracle.setAlignContent(OracleAlign.SpaceEvenly);
    node.setAlignItems(Align.Baseline);
    oracle.setAlignItems(OracleAlign.Baseline);
    node.setAlignSelf(Align.Center);
    oracle.setAlignSelf(OracleAlign.Center);
    node.setAspectRatio(1.1);
    oracle.setAspectRatio(1.1);
    node.setBorder(Edge.Bottom, 2.3);
    oracle.setBorder(OracleEdge.Bottom, 2.3);
    node.setDirection(Direction.RTL);
    oracle.setDirection(OracleDirection.RTL);
    node.setDisplay(Display.None);
    oracle.setDisplay(OracleDisplay.None);
    node.setFlex(2.4);
    oracle.setFlex(2.4);
    node.setFlexBasis("12.5%");
    oracle.setFlexBasis("12.5%");
    node.setFlexBasisPercent(13.5);
    oracle.setFlexBasisPercent(13.5);
    node.setFlexBasisAuto();
    oracle.setFlexBasisAuto();
    node.setFlexDirection(FlexDirection.RowReverse);
    oracle.setFlexDirection(OracleFlexDirection.RowReverse);
    node.setFlexGrow(3.4);
    oracle.setFlexGrow(3.4);
    node.setFlexShrink(4.5);
    oracle.setFlexShrink(4.5);
    node.setFlexWrap(Wrap.WrapReverse);
    oracle.setFlexWrap(OracleWrap.WrapReverse);
    node.setHeight("42.5%");
    oracle.setHeight("42.5%");
    node.setHeightAuto();
    oracle.setHeightAuto();
    node.setHeightPercent(43.5);
    oracle.setHeightPercent(43.5);
    node.setJustifyContent(Justify.SpaceAround);
    oracle.setJustifyContent(OracleJustify.SpaceAround);
    assert.equal(node.setGap(Gutter.All, "7.5%") as unknown, undefined);
    assert.equal(oracle.setGap(OracleGutter.All, "7.5%") as unknown, undefined);
    assert.equal(node.setGapPercent(Gutter.Column, 8.5) as unknown, undefined);
    assert.equal(oracle.setGapPercent(OracleGutter.Column, 8.5) as unknown, undefined);
    node.setMargin(Edge.All, 9.5);
    oracle.setMargin(OracleEdge.All, 9.5);
    node.setMarginAuto(Edge.Left);
    oracle.setMarginAuto(OracleEdge.Left);
    node.setMarginPercent(Edge.Start, 10.5);
    oracle.setMarginPercent(OracleEdge.Start, 10.5);
    node.setMaxHeight("51.5%");
    oracle.setMaxHeight("51.5%");
    node.setMaxHeightPercent(52.5);
    oracle.setMaxHeightPercent(52.5);
    node.setMaxWidth("53.5%");
    oracle.setMaxWidth("53.5%");
    node.setMaxWidthPercent(54.5);
    oracle.setMaxWidthPercent(54.5);
    node.setMinHeight("31.5%");
    oracle.setMinHeight("31.5%");
    node.setMinHeightPercent(32.5);
    oracle.setMinHeightPercent(32.5);
    node.setMinWidth("33.5%");
    oracle.setMinWidth("33.5%");
    node.setMinWidthPercent(34.5);
    oracle.setMinWidthPercent(34.5);
    node.setOverflow(Overflow.Scroll);
    oracle.setOverflow(OracleOverflow.Scroll);
    node.setPadding(Edge.Horizontal, "11.5%");
    oracle.setPadding(OracleEdge.Horizontal, "11.5%");
    node.setPaddingPercent(Edge.End, 12.5);
    oracle.setPaddingPercent(OracleEdge.End, 12.5);
    node.setPosition(Edge.Right, "13.5%");
    oracle.setPosition(OracleEdge.Right, "13.5%");
    node.setPositionPercent(Edge.Top, 14.5);
    oracle.setPositionPercent(OracleEdge.Top, 14.5);
    node.setPositionAuto(Edge.Bottom);
    oracle.setPositionAuto(OracleEdge.Bottom);
    node.setPositionType(PositionType.Absolute);
    oracle.setPositionType(OraclePositionType.Absolute);
    node.setBoxSizing(BoxSizing.ContentBox);
    oracle.setBoxSizing(OracleBoxSizing.ContentBox);
    node.setWidth(61.5);
    oracle.setWidth(61.5);
    node.setWidthAuto();
    oracle.setWidthAuto();
    node.setWidthPercent(62.5);
    oracle.setWidthPercent(62.5);

    assertStyleEqual(node, oracle);
  } finally {
    node.free();
    oracle.free();
  }
});

test("declared numeric boundary inputs normalize like Yoga", () => {
  interface NumericCase {
    setter: string;
    getter: string;
    arguments: readonly unknown[];
    getterArguments?: readonly unknown[];
  }

  const cases: NumericCase[] = [];
  const numbers = [
    undefined,
    Number.NaN,
    Infinity,
    -Infinity,
    -0,
    0,
    0.1,
    -3,
    1e39,
    -1e39,
    1e-50,
  ] as const;
  const lengths = [...numbers, "25%", "-0%", "1e2%", "1e39%", "-1e39%"] as const;
  const autoLengths = [...lengths, "auto"] as const;

  for (const [setter, getter, values] of [
    ["setWidth", "getWidth", autoLengths],
    ["setHeight", "getHeight", autoLengths],
    ["setFlexBasis", "getFlexBasis", autoLengths],
    ["setMinWidth", "getMinWidth", lengths],
    ["setMinHeight", "getMinHeight", lengths],
    ["setMaxWidth", "getMaxWidth", lengths],
    ["setMaxHeight", "getMaxHeight", lengths],
  ] as const) {
    for (const value of values) cases.push({ setter, getter, arguments: [value] });
  }

  for (const [setter, getter] of [
    ["setWidthPercent", "getWidth"],
    ["setHeightPercent", "getHeight"],
    ["setFlexBasisPercent", "getFlexBasis"],
    ["setMinWidthPercent", "getMinWidth"],
    ["setMinHeightPercent", "getMinHeight"],
    ["setMaxWidthPercent", "getMaxWidth"],
    ["setMaxHeightPercent", "getMaxHeight"],
    ["setFlexGrow", "getFlexGrow"],
    ["setFlexShrink", "getFlexShrink"],
    ["setAspectRatio", "getAspectRatio"],
  ] as const) {
    for (const value of numbers) cases.push({ setter, getter, arguments: [value] });
  }

  for (const [setter, getter, edge, values] of [
    ["setMargin", "getMargin", Edge.Start, autoLengths],
    ["setPadding", "getPadding", Edge.Horizontal, lengths],
    ["setPosition", "getPosition", Edge.End, lengths],
  ] as const) {
    for (const value of values) {
      cases.push({ setter, getter, arguments: [edge, value], getterArguments: [edge] });
    }
  }

  for (const [setter, getter, edge] of [
    ["setMarginPercent", "getMargin", Edge.Start],
    ["setPaddingPercent", "getPadding", Edge.Horizontal],
    ["setPositionPercent", "getPosition", Edge.End],
    ["setBorder", "getBorder", Edge.All],
  ] as const) {
    for (const value of numbers) {
      cases.push({ setter, getter, arguments: [edge, value], getterArguments: [edge] });
    }
  }

  for (const value of lengths) {
    cases.push({
      setter: "setGap",
      getter: "getGap",
      arguments: [Gutter.Row, value],
      getterArguments: [Gutter.Row],
    });
  }
  for (const value of numbers) {
    cases.push({
      setter: "setGapPercent",
      getter: "getGap",
      arguments: [Gutter.Column, value],
      getterArguments: [Gutter.Column],
    });
  }

  for (const entry of cases) {
    const node = Yoga.Node.create();
    const oracle = OracleYoga.Node.create();
    try {
      const implementationView = node as unknown as Record<
        string,
        (...arguments_: readonly unknown[]) => unknown
      >;
      const oracleView = oracle as unknown as Record<
        string,
        (...arguments_: readonly unknown[]) => unknown
      >;
      implementationView[entry.setter](...entry.arguments);
      oracleView[entry.setter](...entry.arguments);
      assert.deepEqual(
        implementationView[entry.getter](...(entry.getterArguments ?? [])),
        oracleView[entry.getter](...(entry.getterArguments ?? [])),
        `${entry.setter}(${entry.arguments.map(String).join(", ")})`,
      );
    } finally {
      node.free();
      oracle.free();
    }
  }
});

test("Value getters return fresh Yoga-shaped records while gap keeps Yoga's runtime mismatch", () => {
  const node = Yoga.Node.create();
  const oracle = OracleYoga.Node.create();
  try {
    node.setWidth(0.1);
    oracle.setWidth(0.1);
    const width = node.getWidth();
    assert.deepEqual(width, oracle.getWidth());
    assert.deepEqual(Object.keys(width), Object.keys(oracle.getWidth()));
    width.value = 99;
    width.unit = Unit.Auto;
    assert.deepEqual(node.getWidth(), oracle.getWidth());

    node.setGap(Gutter.Row, "25%");
    oracle.setGap(OracleGutter.Row, "25%");
    assert.equal(typeof (node.getGap(Gutter.Row) as unknown), "number");
    assert.equal(node.getGap(Gutter.Row) as unknown, oracle.getGap(OracleGutter.Row) as unknown);
  } finally {
    node.free();
    oracle.free();
  }
});

test("copyStyle copies declarations but retains the destination Config", () => {
  const webConfig = Yoga.Config.create();
  const oracleWebConfig = OracleYoga.Config.create();
  webConfig.setUseWebDefaults(true);
  oracleWebConfig.setUseWebDefaults(true);
  const source = Yoga.Node.create();
  const oracleSource = OracleYoga.Node.create();
  const destination = Yoga.Node.createWithConfig(webConfig);
  const oracleDestination = OracleYoga.Node.createWithConfig(oracleWebConfig);
  try {
    source.setWidth("45%");
    oracleSource.setWidth("45%");
    source.setMargin(Edge.Start, 3);
    oracleSource.setMargin(OracleEdge.Start, 3);
    source.setFlex(2);
    oracleSource.setFlex(2);

    destination.copyStyle(source);
    oracleDestination.copyStyle(oracleSource);
    assertStyleEqual(destination, oracleDestination);
    assert.equal(destination.getFlexShrink(), 1);

    source.setWidth(90);
    oracleSource.setWidth(90);
    assert.notDeepEqual(destination.getWidth(), source.getWidth());
    assert.deepEqual(destination.getWidth(), oracleDestination.getWidth());
  } finally {
    source.free();
    oracleSource.free();
    destination.free();
    oracleDestination.free();
    webConfig.free();
    oracleWebConfig.free();
  }
});

test("invalid and unsupported dynamic Style inputs fail without changing declarations", async () => {
  const node = Yoga.Node.create();
  node.setWidth(25);
  node.setMargin(Edge.Left, 4);
  node.setAlignContent(Align.Center);
  node.setAlignItems(Align.Center);
  node.setAlignSelf(Align.Center);
  const width = node.getWidth();
  const margin = node.getMargin(Edge.Left);
  const alignContent = node.getAlignContent();
  const alignItems = node.getAlignItems();
  const alignSelf = node.getAlignSelf();
  try {
    assert.throws(() => node.setWidth("12px" as never), TypeError);
    assert.throws(() => node.setWidth({ unit: Unit.Point, value: 12 } as never), TypeError);
    assert.throws(() => node.setAlignContent(Align.Auto as never), TypeError);
    assert.throws(() => node.setAlignContent(Align.Baseline as never), TypeError);
    assert.throws(() => node.setAlignItems(Align.SpaceBetween as never), TypeError);
    assert.throws(() => node.setAlignSelf(Align.SpaceEvenly as never), TypeError);
    assert.throws(() => node.setDisplay(2 as never), TypeError);
    assert.throws(() => node.setPositionType(0 as never), TypeError);
    assert.throws(() => node.setMargin(99 as never, 10), TypeError);
    assert.throws(() => node.setGap(99 as never, 10), TypeError);
    assert.deepEqual(node.getWidth(), width);
    assert.deepEqual(node.getMargin(Edge.Left), margin);
    assert.equal(node.getAlignContent(), alignContent);
    assert.equal(node.getAlignItems(), alignItems);
    assert.equal(node.getAlignSelf(), alignSelf);

    const { loadYoga } = await import("yoga-layout/load");
    const otherFacade = await loadYoga();
    const other = otherFacade.Node.create();
    try {
      assert.throws(() => node.copyStyle(other), /another Yoga facade/);
      assert.deepEqual(node.getWidth(), width);
    } finally {
      other.free();
    }
  } finally {
    node.free();
  }
});

test("translated fixed-leaf Style cases match Yoga geometry", () => {
  const cases: Array<(node: Node | OracleNode) => void> = [
    (node) => {
      node.setWidth(100);
      node.setHeight(40);
      node.setMinWidth(120);
    },
    (node) => {
      node.setWidth(100);
      node.setHeight(40);
      node.setPadding(Edge.All, 5);
      node.setBorder(Edge.All, 2);
      node.setBoxSizing(BoxSizing.ContentBox);
    },
  ];

  for (const configure of cases) {
    const node = Yoga.Node.create();
    const oracle = OracleYoga.Node.create();
    try {
      configure(node);
      configure(oracle);
      node.calculateLayout(undefined, undefined, Direction.LTR);
      oracle.calculateLayout(undefined, undefined, OracleDirection.LTR);
      assert.equal(node.getComputedWidth(), oracle.getComputedWidth());
      assert.equal(node.getComputedHeight(), oracle.getComputedHeight());
    } finally {
      node.free();
      oracle.free();
    }
  }
});
