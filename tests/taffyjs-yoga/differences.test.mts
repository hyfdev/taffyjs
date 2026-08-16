import assert from "node:assert/strict";
import Yoga, {
  Align,
  Direction,
  Edge,
  ExperimentalFeature,
  FlexDirection,
  Gutter,
  Justify,
  Wrap,
} from "yoga-layout";
import OracleYoga, {
  Align as OracleAlign,
  Direction as OracleDirection,
  Edge as OracleEdge,
  ExperimentalFeature as OracleExperimentalFeature,
  FlexDirection as OracleFlexDirection,
  Gutter as OracleGutter,
  Justify as OracleJustify,
  Wrap as OracleWrap,
} from "yoga-layout-oracle";
import { test } from "vite-plus/test";

test("Different: a live useWebDefaults change does not reproduce Yoga's stale cache", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const root = Yoga.Node.createWithConfig(config);
  const row = Yoga.Node.createWithConfig(config);
  const first = Yoga.Node.createWithConfig(config);
  const second = Yoga.Node.createWithConfig(config);
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleRow = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleFirst = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleSecond = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    root.setFlexDirection(FlexDirection.Row);
    root.setWidth(200);
    root.setHeight(20);
    row.setFlexDirection(FlexDirection.Row);
    row.setWidth(100);
    row.setHeight(20);
    first.setWidth(80);
    first.setHeight(20);
    second.setWidth(80);
    second.setHeight(20);
    row.insertChild(first, 0);
    row.insertChild(second, 1);
    root.insertChild(row, 0);
    oracleRoot.setFlexDirection(OracleFlexDirection.Row);
    oracleRoot.setWidth(200);
    oracleRoot.setHeight(20);
    oracleRow.setFlexDirection(OracleFlexDirection.Row);
    oracleRow.setWidth(100);
    oracleRow.setHeight(20);
    oracleFirst.setWidth(80);
    oracleFirst.setHeight(20);
    oracleSecond.setWidth(80);
    oracleSecond.setHeight(20);
    oracleRow.insertChild(oracleFirst, 0);
    oracleRow.insertChild(oracleSecond, 1);
    oracleRoot.insertChild(oracleRow, 0);
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.deepEqual([first.getComputedWidth(), second.getComputedWidth()], [80, 80]);
    assert.deepEqual([oracleFirst.getComputedWidth(), oracleSecond.getComputedWidth()], [80, 80]);

    config.setUseWebDefaults(true);
    oracleConfig.setUseWebDefaults(true);
    row.calculateLayout(undefined, undefined);
    oracleRow.calculateLayout(undefined, undefined);
    assert.deepEqual([first.getComputedWidth(), second.getComputedWidth()], [50, 50]);
    assert.deepEqual([oracleFirst.getComputedWidth(), oracleSecond.getComputedWidth()], [80, 80]);
    assert.equal(root.isDirty(), false);
    assert.equal(row.isDirty(), false);
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

test("Different: dirtied callbacks use the declared argument and null unsets", () => {
  const node = Yoga.Node.create();
  const oracle = OracleYoga.Node.create();
  try {
    node.calculateLayout(undefined, undefined);
    oracle.calculateLayout(undefined, undefined);
    let actualArguments = -1;
    let oracleArguments = -1;
    node.setDirtiedFunc((...arguments_) => {
      actualArguments = arguments_.length;
      assert.equal(arguments_[0], node);
    });
    oracle.setDirtiedFunc((...arguments_) => {
      oracleArguments = arguments_.length;
    });
    node.setWidth(1);
    oracle.setWidth(1);
    assert.equal(actualArguments, 1);
    assert.equal(oracleArguments, 0);

    node.calculateLayout(undefined, undefined);
    oracle.calculateLayout(undefined, undefined);
    node.setDirtiedFunc(null);
    oracle.setDirtiedFunc(null);
    assert.doesNotThrow(() => node.setWidth(2));
    assert.throws(() => oracle.setWidth(2), TypeError);
  } finally {
    node.free();
    oracle.free();
  }
});

test("Different: max size combined with flex shrink keeps Taffy geometry", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const root = Yoga.Node.createWithConfig(config);
  const child = Yoga.Node.createWithConfig(config);
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleChild = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    root.setFlexDirection(FlexDirection.Row);
    root.setWidth(60);
    child.setWidth(120);
    child.setMaxWidth(90);
    child.setFlexShrink(1);
    root.insertChild(child, 0);
    oracleRoot.setFlexDirection(OracleFlexDirection.Row);
    oracleRoot.setWidth(60);
    oracleChild.setWidth(120);
    oracleChild.setMaxWidth(90);
    oracleChild.setFlexShrink(1);
    oracleRoot.insertChild(oracleChild, 0);
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.equal(child.getComputedWidth(), 60);
    assert.equal(oracleChild.getComputedWidth(), 67.5);
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

test("Different: shrink factors totaling below one keep Taffy's partial shrink", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const root = Yoga.Node.createWithConfig(config);
  const first = Yoga.Node.createWithConfig(config);
  const second = Yoga.Node.createWithConfig(config);
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleFirst = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleSecond = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    root.setFlexDirection(FlexDirection.Row);
    root.setWidth(100);
    first.setWidth(80);
    first.setFlexShrink(0.5);
    second.setWidth(80);
    second.setFlexShrink(0);
    root.insertChild(first, 0);
    root.insertChild(second, 1);
    oracleRoot.setFlexDirection(OracleFlexDirection.Row);
    oracleRoot.setWidth(100);
    oracleFirst.setWidth(80);
    oracleFirst.setFlexShrink(0.5);
    oracleSecond.setWidth(80);
    oracleSecond.setFlexShrink(0);
    oracleRoot.insertChild(oracleFirst, 0);
    oracleRoot.insertChild(oracleSecond, 1);
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.deepEqual([first.getComputedWidth(), second.getComputedWidth()], [50, 80]);
    assert.deepEqual([oracleFirst.getComputedWidth(), oracleSecond.getComputedWidth()], [20, 80]);
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

test("Different: a percentage gap does not contribute to an auto main size", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const root = Yoga.Node.createWithConfig(config);
  const first = Yoga.Node.createWithConfig(config);
  const second = Yoga.Node.createWithConfig(config);
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleFirst = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleSecond = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    root.setGapPercent(Gutter.Row, 10);
    first.setWidth(30);
    first.setHeight(20);
    second.setWidth(30);
    second.setHeight(20);
    root.insertChild(first, 0);
    root.insertChild(second, 1);
    oracleRoot.setGapPercent(OracleGutter.Row, 10);
    oracleFirst.setWidth(30);
    oracleFirst.setHeight(20);
    oracleSecond.setWidth(30);
    oracleSecond.setHeight(20);
    oracleRoot.insertChild(oracleFirst, 0);
    oracleRoot.insertChild(oracleSecond, 1);
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.deepEqual(
      [root.getComputedHeight(), second.getComputedTop(), second.getComputedHeight()],
      [40, 24, 20],
    );
    assert.deepEqual(
      [
        oracleRoot.getComputedHeight(),
        oracleSecond.getComputedTop(),
        oracleSecond.getComputedHeight(),
      ],
      [44, 24, 20],
    );
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

test("Different: intrinsic selected roots keep Taffy's conflicting constraint order", () => {
  for (const kind of ["child content", "measurement"] as const) {
    const config = Yoga.Config.create();
    const oracleConfig = OracleYoga.Config.create();
    config.setPointScaleFactor(0);
    oracleConfig.setPointScaleFactor(0);
    const root = Yoga.Node.createWithConfig(config);
    const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
    try {
      root.setHeight(10);
      root.setMinWidth(100);
      root.setMaxWidth(50);
      oracleRoot.setHeight(10);
      oracleRoot.setMinWidth(100);
      oracleRoot.setMaxWidth(50);
      if (kind === "child content") {
        const child = Yoga.Node.createWithConfig(config);
        const oracleChild = OracleYoga.Node.createWithConfig(oracleConfig);
        child.setWidth(25);
        child.setHeight(1);
        oracleChild.setWidth(25);
        oracleChild.setHeight(1);
        root.insertChild(child, 0);
        oracleRoot.insertChild(oracleChild, 0);
      } else {
        root.setMeasureFunc(() => ({ width: 75, height: 10 }));
        oracleRoot.setMeasureFunc(() => ({ width: 75, height: 10 }));
      }

      root.calculateLayout(undefined, undefined);
      oracleRoot.calculateLayout(undefined, undefined);
      assert.equal(root.getComputedWidth(), 100, `${kind} Taffy`);
      assert.equal(oracleRoot.getComputedWidth(), 50, `${kind} Yoga`);
    } finally {
      root.freeRecursive();
      oracleRoot.freeRecursive();
      config.free();
      oracleConfig.free();
    }
  }
});

test("Different: overlapping physical and logical margins keep Taffy sizing", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const root = Yoga.Node.createWithConfig(config);
  const child = Yoga.Node.createWithConfig(config);
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleChild = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    root.setFlexDirection(FlexDirection.Row);
    root.setWidth(100);
    child.setDirection(Direction.RTL);
    child.setWidth(20);
    child.setHeight(10);
    child.setMargin(Edge.Left, 4);
    child.setMarginPercent(Edge.Start, 10);
    root.insertChild(child, 0);
    oracleRoot.setFlexDirection(OracleFlexDirection.Row);
    oracleRoot.setWidth(100);
    oracleChild.setDirection(OracleDirection.RTL);
    oracleChild.setWidth(20);
    oracleChild.setHeight(10);
    oracleChild.setMargin(OracleEdge.Left, 4);
    oracleChild.setMarginPercent(OracleEdge.Start, 10);
    oracleRoot.insertChild(oracleChild, 0);
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.equal(child.getComputedWidth(), 20);
    assert.equal(oracleChild.getComputedWidth(), 16);
    assert.deepEqual(
      [child.getComputedMargin(Edge.Left), child.getComputedMargin(Edge.Right)],
      [4, 10],
    );
    assert.deepEqual(
      [
        oracleChild.getComputedMargin(OracleEdge.Left),
        oracleChild.getComputedMargin(OracleEdge.Right),
      ],
      [4, 10],
    );
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

test("Different: calculated aspect ratio keeps Taffy's CSS-oriented result", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const row = Yoga.Node.createWithConfig(config);
  const child = Yoga.Node.createWithConfig(config);
  const oracleRow = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleChild = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    row.setFlexDirection(FlexDirection.Row);
    row.setWidth(100);
    row.setHeight(100);
    child.setWidth(40);
    child.setAspectRatio(2);
    row.insertChild(child, 0);
    oracleRow.setFlexDirection(OracleFlexDirection.Row);
    oracleRow.setWidth(100);
    oracleRow.setHeight(100);
    oracleChild.setWidth(40);
    oracleChild.setAspectRatio(2);
    oracleRow.insertChild(oracleChild, 0);
    row.calculateLayout(undefined, undefined);
    oracleRow.calculateLayout(undefined, undefined);
    assert.deepEqual([child.getComputedWidth(), child.getComputedHeight()], [40, 100]);
    assert.deepEqual([oracleChild.getComputedWidth(), oracleChild.getComputedHeight()], [40, 20]);
  } finally {
    row.freeRecursive();
    oracleRow.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

test("Different: disabled WebFlexBasis does not retain Yoga's stale percentage basis", () => {
  for (const enabled of [false, true]) {
    const config = Yoga.Config.create();
    const oracleConfig = OracleYoga.Config.create();
    config.setPointScaleFactor(0);
    oracleConfig.setPointScaleFactor(0);
    config.setExperimentalFeatureEnabled(ExperimentalFeature.WebFlexBasis, enabled);
    oracleConfig.setExperimentalFeatureEnabled(OracleExperimentalFeature.WebFlexBasis, enabled);
    const root = Yoga.Node.createWithConfig(config);
    const child = Yoga.Node.createWithConfig(config);
    const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
    const oracleChild = OracleYoga.Node.createWithConfig(oracleConfig);
    try {
      root.setFlexDirection(FlexDirection.Row);
      root.setWidth(100);
      root.setHeight(20);
      child.setFlexBasisPercent(50);
      child.setFlexShrink(0);
      root.insertChild(child, 0);
      oracleRoot.setFlexDirection(OracleFlexDirection.Row);
      oracleRoot.setWidth(100);
      oracleRoot.setHeight(20);
      oracleChild.setFlexBasisPercent(50);
      oracleChild.setFlexShrink(0);
      oracleRoot.insertChild(oracleChild, 0);
      root.calculateLayout(undefined, undefined);
      oracleRoot.calculateLayout(undefined, undefined);
      root.setWidth(200);
      oracleRoot.setWidth(200);
      root.calculateLayout(undefined, undefined);
      oracleRoot.calculateLayout(undefined, undefined);
      assert.equal(child.getComputedWidth(), 100);
      assert.equal(oracleChild.getComputedWidth(), enabled ? 100 : 50);
    } finally {
      root.freeRecursive();
      oracleRoot.freeRecursive();
      config.free();
      oracleConfig.free();
    }
  }
});

test("Different: an ancestor recomputes after a separate attached-subtree calculation", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const nodes = Array.from({ length: 4 }, () => Yoga.Node.createWithConfig(config));
  const oracleNodes = Array.from({ length: 4 }, () =>
    OracleYoga.Node.createWithConfig(oracleConfig),
  );
  const [root, row, first, second] = nodes;
  const [oracleRoot, oracleRow, oracleFirst, oracleSecond] = oracleNodes;
  try {
    root.setFlexDirection(FlexDirection.Row);
    root.setWidth(200);
    root.setHeight(20);
    row.setFlexDirection(FlexDirection.Row);
    row.setFlexGrow(1);
    row.setHeight(20);
    for (const child of [first, second]) {
      child.setWidth(80);
      child.setHeight(20);
      child.setFlexShrink(1);
    }
    row.insertChild(first, 0);
    row.insertChild(second, 1);
    root.insertChild(row, 0);
    oracleRoot.setFlexDirection(OracleFlexDirection.Row);
    oracleRoot.setWidth(200);
    oracleRoot.setHeight(20);
    oracleRow.setFlexDirection(OracleFlexDirection.Row);
    oracleRow.setFlexGrow(1);
    oracleRow.setHeight(20);
    for (const child of [oracleFirst, oracleSecond]) {
      child.setWidth(80);
      child.setHeight(20);
      child.setFlexShrink(1);
    }
    oracleRow.insertChild(oracleFirst, 0);
    oracleRow.insertChild(oracleSecond, 1);
    oracleRoot.insertChild(oracleRow, 0);
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    row.calculateLayout(100, 20);
    oracleRow.calculateLayout(100, 20);
    assert.deepEqual([row.getComputedWidth(), first.getComputedWidth()], [100, 50]);
    assert.deepEqual([oracleRow.getComputedWidth(), oracleFirst.getComputedWidth()], [100, 50]);

    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.deepEqual([row.getComputedWidth(), first.getComputedWidth()], [200, 80]);
    assert.deepEqual([oracleRow.getComputedWidth(), oracleFirst.getComputedWidth()], [100, 50]);
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

test("Different: oversized WrapReverse distribution keeps Taffy line positions", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const root = Yoga.Node.createWithConfig(config);
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const children = [10, 20, 15].map(() => Yoga.Node.createWithConfig(config));
  const oracleChildren = [10, 20, 15].map(() => OracleYoga.Node.createWithConfig(oracleConfig));
  try {
    root.setWidth(100);
    root.setHeight(30);
    root.setFlexDirection(FlexDirection.Row);
    root.setFlexWrap(Wrap.WrapReverse);
    root.setAlignContent(Align.Stretch);
    oracleRoot.setWidth(100);
    oracleRoot.setHeight(30);
    oracleRoot.setFlexDirection(OracleFlexDirection.Row);
    oracleRoot.setFlexWrap(OracleWrap.WrapReverse);
    oracleRoot.setAlignContent(OracleAlign.Stretch);
    for (const [index, height] of [10, 20, 15].entries()) {
      children[index].setWidth(60);
      children[index].setHeight(height);
      root.insertChild(children[index], index);
      oracleChildren[index].setWidth(60);
      oracleChildren[index].setHeight(height);
      oracleRoot.insertChild(oracleChildren[index], index);
    }
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.deepEqual(
      children.map((child) => child.getComputedTop()),
      [35, 15, 0],
    );
    assert.deepEqual(
      oracleChildren.map((child) => child.getComputedTop()),
      [20, 0, -15],
    );
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

test("Different: ordinary WrapReverse cross margins keep Taffy placement", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const root = Yoga.Node.createWithConfig(config);
  const child = Yoga.Node.createWithConfig(config);
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleChild = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    root.setWidth(100);
    root.setHeight(100);
    root.setFlexDirection(FlexDirection.Row);
    root.setFlexWrap(Wrap.WrapReverse);
    root.setAlignItems(Align.FlexStart);
    child.setWidth(40);
    child.setHeight(20);
    child.setMargin(Edge.Bottom, 11);
    root.insertChild(child, 0);
    oracleRoot.setWidth(100);
    oracleRoot.setHeight(100);
    oracleRoot.setFlexDirection(OracleFlexDirection.Row);
    oracleRoot.setFlexWrap(OracleWrap.WrapReverse);
    oracleRoot.setAlignItems(OracleAlign.FlexStart);
    oracleChild.setWidth(40);
    oracleChild.setHeight(20);
    oracleChild.setMargin(OracleEdge.Bottom, 11);
    oracleRoot.insertChild(oracleChild, 0);
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.equal(child.getComputedTop(), 69);
    assert.equal(oracleChild.getComputedTop(), 80);
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

test("Different: overflowing reversed justify distribution keeps Taffy positions", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const root = Yoga.Node.createWithConfig(config);
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const children = [140, 130, 120].map(() => Yoga.Node.createWithConfig(config));
  const oracleChildren = [140, 130, 120].map(() => OracleYoga.Node.createWithConfig(oracleConfig));
  try {
    root.setWidth(240);
    root.setHeight(20);
    root.setFlexDirection(FlexDirection.RowReverse);
    root.setJustifyContent(Justify.SpaceBetween);
    oracleRoot.setWidth(240);
    oracleRoot.setHeight(20);
    oracleRoot.setFlexDirection(OracleFlexDirection.RowReverse);
    oracleRoot.setJustifyContent(OracleJustify.SpaceBetween);
    for (const [index, width] of [140, 130, 120].entries()) {
      children[index].setWidth(width);
      children[index].setHeight(10);
      children[index].setFlexShrink(0);
      root.insertChild(children[index], index);
      oracleChildren[index].setWidth(width);
      oracleChildren[index].setHeight(10);
      oracleChildren[index].setFlexShrink(0);
      oracleRoot.insertChild(oracleChildren[index], index);
    }
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.deepEqual(
      children.map((child) => child.getComputedLeft()),
      [250, 120, 0],
    );
    assert.deepEqual(
      oracleChildren.map((child) => child.getComputedLeft()),
      [100, -30, -150],
    );
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

test("Different: zero-cross-size stretched lines keep Taffy distribution", () => {
  for (const wrap of [Wrap.Wrap, Wrap.WrapReverse] as const) {
    const config = Yoga.Config.create();
    const oracleConfig = OracleYoga.Config.create();
    config.setPointScaleFactor(0);
    oracleConfig.setPointScaleFactor(0);
    const root = Yoga.Node.createWithConfig(config);
    const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
    const children = [0, 1].map(() => Yoga.Node.createWithConfig(config));
    const oracleChildren = [0, 1].map(() => OracleYoga.Node.createWithConfig(oracleConfig));
    try {
      root.setWidth(100);
      root.setHeight(180);
      root.setFlexDirection(FlexDirection.Row);
      root.setFlexWrap(wrap);
      root.setAlignContent(Align.Center);
      root.setAlignItems(Align.Stretch);
      oracleRoot.setWidth(100);
      oracleRoot.setHeight(180);
      oracleRoot.setFlexDirection(OracleFlexDirection.Row);
      oracleRoot.setFlexWrap(wrap as unknown as OracleWrap);
      oracleRoot.setAlignContent(OracleAlign.Center);
      oracleRoot.setAlignItems(OracleAlign.Stretch);
      for (const [index, child] of children.entries()) {
        child.setWidth(60);
        child.setFlexBasis(0);
        root.insertChild(child, index);
        oracleChildren[index].setWidth(60);
        oracleChildren[index].setFlexBasis(0);
        oracleRoot.insertChild(oracleChildren[index], index);
      }
      root.calculateLayout(undefined, undefined);
      oracleRoot.calculateLayout(undefined, undefined);
      assert.deepEqual(
        children.map((child) => child.getComputedTop()),
        [90, 90],
      );
      assert.deepEqual(
        oracleChildren.map((child) => child.getComputedTop()),
        wrap === Wrap.Wrap ? [0, 0] : [180, 180],
      );
    } finally {
      root.freeRecursive();
      oracleRoot.freeRecursive();
      config.free();
      oracleConfig.free();
    }
  }
});

test("Different: main-axis auto margins retain Taffy's justify offset", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const root = Yoga.Node.createWithConfig(config);
  const first = Yoga.Node.createWithConfig(config);
  const second = Yoga.Node.createWithConfig(config);
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleFirst = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleSecond = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    root.setWidth(240);
    root.setHeight(180);
    root.setFlexDirection(FlexDirection.Column);
    root.setJustifyContent(Justify.Center);
    first.setWidth(10);
    first.setHeight(30);
    first.setMarginAuto(Edge.Top);
    first.setMarginAuto(Edge.Bottom);
    second.setWidth(20);
    second.setHeight(20);
    root.insertChild(first, 0);
    root.insertChild(second, 1);
    oracleRoot.setWidth(240);
    oracleRoot.setHeight(180);
    oracleRoot.setFlexDirection(OracleFlexDirection.Column);
    oracleRoot.setJustifyContent(OracleJustify.Center);
    oracleFirst.setWidth(10);
    oracleFirst.setHeight(30);
    oracleFirst.setMarginAuto(OracleEdge.Top);
    oracleFirst.setMarginAuto(OracleEdge.Bottom);
    oracleSecond.setWidth(20);
    oracleSecond.setHeight(20);
    oracleRoot.insertChild(oracleFirst, 0);
    oracleRoot.insertChild(oracleSecond, 1);
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.deepEqual([first.getComputedTop(), second.getComputedTop()], [130, 225]);
    assert.deepEqual([oracleFirst.getComputedTop(), oracleSecond.getComputedTop()], [65, 160]);
    assert.equal(first.getComputedMargin(Edge.Top), 0);
    assert.equal(first.getComputedMargin(Edge.Bottom), 0);
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

for (const fixture of [
  { name: "both auto", left: "auto", right: "auto", taffyLeft: -10, yogaLeft: [0, -20] },
  { name: "left auto", left: "auto", right: undefined, taffyLeft: -20, yogaLeft: [0, -20] },
  { name: "left 10, right auto", left: 10, right: "auto", taffyLeft: 10, yogaLeft: [10, -20] },
  { name: "left auto, right 10", left: "auto", right: 10, taffyLeft: -30, yogaLeft: [0, -30] },
] as const) {
  test(`Different: oversized cross-axis auto margins keep Taffy's alignment (${fixture.name})`, () => {
    const config = Yoga.Config.create();
    const oracleConfig = OracleYoga.Config.create();
    config.setPointScaleFactor(0);
    oracleConfig.setPointScaleFactor(0);
    const root = Yoga.Node.createWithConfig(config);
    const child = Yoga.Node.createWithConfig(config);
    const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
    const oracleChild = OracleYoga.Node.createWithConfig(oracleConfig);
    try {
      root.setWidth(52);
      root.setHeight(52);
      root.setJustifyContent(Justify.Center);
      child.setWidth(72);
      child.setHeight(72);
      oracleRoot.setWidth(52);
      oracleRoot.setHeight(52);
      oracleRoot.setJustifyContent(OracleJustify.Center);
      oracleChild.setWidth(72);
      oracleChild.setHeight(72);

      for (const [value, edge, oracleEdge] of [
        [fixture.left, Edge.Left, OracleEdge.Left],
        [fixture.right, Edge.Right, OracleEdge.Right],
      ] as const) {
        if (value === "auto") {
          child.setMarginAuto(edge);
          oracleChild.setMarginAuto(oracleEdge);
        } else if (value !== undefined) {
          child.setMargin(edge, value);
          oracleChild.setMargin(oracleEdge, value);
        }
      }

      root.insertChild(child, 0);
      oracleRoot.insertChild(oracleChild, 0);
      for (const [index, direction, oracleDirection] of [
        [0, Direction.LTR, OracleDirection.LTR],
        [1, Direction.RTL, OracleDirection.RTL],
      ] as const) {
        root.calculateLayout(undefined, undefined, direction);
        oracleRoot.calculateLayout(undefined, undefined, oracleDirection);
        assert.deepEqual(
          [child.getComputedLeft(), child.getComputedTop()],
          [fixture.taffyLeft, -10],
        );
        assert.deepEqual(
          [oracleChild.getComputedLeft(), oracleChild.getComputedTop()],
          [fixture.yogaLeft[index], -10],
        );
      }
    } finally {
      root.freeRecursive();
      oracleRoot.freeRecursive();
      config.free();
      oracleConfig.free();
    }
  });
}

test("Different: reversed-axis auto margins keep Taffy's distribution", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);
  const root = Yoga.Node.createWithConfig(config);
  const child = Yoga.Node.createWithConfig(config);
  const oracleRoot = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleChild = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    root.setWidth(240);
    root.setHeight(100);
    root.setFlexDirection(FlexDirection.RowReverse);
    child.setWidth(60);
    child.setHeight(20);
    child.setMarginAuto(Edge.Left);
    root.insertChild(child, 0);
    oracleRoot.setWidth(240);
    oracleRoot.setHeight(100);
    oracleRoot.setFlexDirection(OracleFlexDirection.RowReverse);
    oracleChild.setWidth(60);
    oracleChild.setHeight(20);
    oracleChild.setMarginAuto(OracleEdge.Left);
    oracleRoot.insertChild(oracleChild, 0);
    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    assert.equal(child.getComputedLeft(), 360);
    assert.equal(oracleChild.getComputedLeft(), 180);
    assert.equal(child.getComputedMargin(Edge.Left), 0);
    assert.equal(oracleChild.getComputedMargin(OracleEdge.Left), 0);
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});
