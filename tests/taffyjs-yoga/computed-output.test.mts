import assert from "node:assert/strict";
import { TaffyTree, type NodeId } from "@taffyjs/node";
import Yoga, {
  BoxSizing,
  Direction,
  Display,
  Edge,
  FlexDirection,
  PositionType,
  type Node,
} from "yoga-layout";
import { loadYoga } from "yoga-layout/load";
import OracleYoga, {
  BoxSizing as OracleBoxSizing,
  Direction as OracleDirection,
  Display as OracleDisplay,
  Edge as OracleEdge,
  FlexDirection as OracleFlexDirection,
  PositionType as OraclePositionType,
  type Node as OracleNode,
} from "yoga-layout-oracle";
import { test } from "vite-plus/test";

function assertLayoutEqual(actual: Node, expected: OracleNode, message?: string): void {
  assert.deepEqual(actual.getComputedLayout(), expected.getComputedLayout(), message);
  assert.equal(actual.getComputedLeft(), expected.getComputedLeft(), message);
  assert.equal(actual.getComputedRight(), expected.getComputedRight(), message);
  assert.equal(actual.getComputedTop(), expected.getComputedTop(), message);
  assert.equal(actual.getComputedBottom(), expected.getComputedBottom(), message);
  assert.equal(actual.getComputedWidth(), expected.getComputedWidth(), message);
  assert.equal(actual.getComputedHeight(), expected.getComputedHeight(), message);
}

function assertFloatCompatible(actual: number, expected: number, message: string): void {
  if (Number.isNaN(actual) && Number.isNaN(expected)) return;
  assert.ok(
    Math.abs(actual - expected) < 0.0001,
    `${message}: expected ${expected}, received ${actual}`,
  );
}

test("finite owner dimensions become exact selected-root constraints", () => {
  const scenarios: Array<{
    readonly name: string;
    readonly configure: (actual: Node, expected: OracleNode) => void;
  }> = [
    { name: "empty", configure: () => {} },
    {
      name: "margins",
      configure: (actual, expected) => {
        actual.setMargin(Edge.Left, 10);
        actual.setMargin(Edge.Right, 20);
        expected.setMargin(OracleEdge.Left, 10);
        expected.setMargin(OracleEdge.Right, 20);
      },
    },
    {
      name: "padding and border",
      configure: (actual, expected) => {
        actual.setPadding(Edge.Horizontal, 10);
        actual.setBorder(Edge.Right, 4);
        expected.setPadding(OracleEdge.Horizontal, 10);
        expected.setBorder(OracleEdge.Right, 4);
      },
    },
    {
      name: "content box",
      configure: (actual, expected) => {
        actual.setBoxSizing(BoxSizing.ContentBox);
        actual.setPadding(Edge.Horizontal, 10);
        expected.setBoxSizing(OracleBoxSizing.ContentBox);
        expected.setPadding(OracleEdge.Horizontal, 10);
      },
    },
    {
      name: "minimum",
      configure: (actual, expected) => {
        actual.setMinWidth(120);
        expected.setMinWidth(120);
      },
    },
    {
      name: "maximum",
      configure: (actual, expected) => {
        actual.setMaxWidth(70);
        expected.setMaxWidth(70);
      },
    },
    {
      name: "percentage declaration",
      configure: (actual, expected) => {
        actual.setWidthPercent(50);
        expected.setWidthPercent(50);
      },
    },
    {
      name: "selected display-none root",
      configure: (actual, expected) => {
        actual.setDisplay(Display.None);
        actual.setWidth(40);
        actual.setHeight(20);
        expected.setDisplay(OracleDisplay.None);
        expected.setWidth(40);
        expected.setHeight(20);
      },
    },
  ];

  for (const scenario of scenarios) {
    const actual = Yoga.Node.create();
    const expected = OracleYoga.Node.create();
    try {
      scenario.configure(actual, expected);
      const declaration = actual.getWidth();
      actual.calculateLayout(100, 80, Direction.LTR);
      expected.calculateLayout(100, 80, OracleDirection.LTR);
      assertLayoutEqual(actual, expected, scenario.name);
      assert.deepEqual(actual.getWidth(), declaration, `${scenario.name} declaration`);
    } finally {
      actual.free();
      expected.free();
    }
  }

  for (const width of [1e39, -1e39]) {
    const overflowed = Yoga.Node.create();
    const oracleOverflowed = OracleYoga.Node.create();
    try {
      overflowed.calculateLayout(width, 10);
      oracleOverflowed.calculateLayout(width, 10);
      assertLayoutEqual(overflowed, oracleOverflowed, `finite ${width} that overflows f32`);
    } finally {
      overflowed.free();
      oracleOverflowed.free();
    }
  }
});

test("negative width and height declarations compute as auto without changing getters", () => {
  const scenarios: Array<{
    readonly name: string;
    readonly axis: "width" | "height";
    readonly configure: (actual: Node, expected: OracleNode) => void;
  }> = [
    {
      name: "negative point width",
      axis: "width",
      configure: (actual, expected) => {
        actual.setWidth(-1);
        expected.setWidth(-1);
      },
    },
    {
      name: "negative percent width",
      axis: "width",
      configure: (actual, expected) => {
        actual.setWidthPercent(-10);
        expected.setWidthPercent(-10);
      },
    },
    {
      name: "negative point height",
      axis: "height",
      configure: (actual, expected) => {
        actual.setHeight(-1);
        expected.setHeight(-1);
      },
    },
    {
      name: "negative percent height",
      axis: "height",
      configure: (actual, expected) => {
        actual.setHeightPercent(-10);
        expected.setHeightPercent(-10);
      },
    },
  ];

  for (const scenario of scenarios) {
    const actualParent = Yoga.Node.create();
    const actualChild = Yoga.Node.create();
    const expectedParent = OracleYoga.Node.create();
    const expectedChild = OracleYoga.Node.create();
    try {
      actualParent.setWidth(100);
      actualParent.setHeight(100);
      expectedParent.setWidth(100);
      expectedParent.setHeight(100);
      if (scenario.axis === "width") {
        actualParent.setFlexDirection(FlexDirection.Column);
        expectedParent.setFlexDirection(OracleFlexDirection.Column);
        actualChild.setHeight(20);
        expectedChild.setHeight(20);
      } else {
        actualParent.setFlexDirection(FlexDirection.Row);
        expectedParent.setFlexDirection(OracleFlexDirection.Row);
        actualChild.setWidth(20);
        expectedChild.setWidth(20);
      }
      scenario.configure(actualChild, expectedChild);
      actualParent.insertChild(actualChild, 0);
      expectedParent.insertChild(expectedChild, 0);

      const actualDeclaration =
        scenario.axis === "width" ? actualChild.getWidth() : actualChild.getHeight();
      const expectedDeclaration =
        scenario.axis === "width" ? expectedChild.getWidth() : expectedChild.getHeight();
      assert.deepEqual(actualDeclaration, expectedDeclaration, `${scenario.name} declaration`);
      actualParent.calculateLayout(undefined, undefined);
      expectedParent.calculateLayout(undefined, undefined);
      assertLayoutEqual(actualChild, expectedChild, scenario.name);
      assert.deepEqual(
        scenario.axis === "width" ? actualChild.getWidth() : actualChild.getHeight(),
        actualDeclaration,
        `${scenario.name} retained declaration`,
      );
    } finally {
      actualParent.freeRecursive();
      expectedParent.freeRecursive();
    }
  }
});

test("selected-root definite sizes follow Yoga's conflicting-constraint order", () => {
  for (const axis of ["width", "height"] as const) {
    for (const unit of ["point", "percent"] as const) {
      for (const base of [25, 50, 75]) {
        const actual = Yoga.Node.create();
        const expected = OracleYoga.Node.create();
        const name = `${axis} ${unit} base ${base}`;
        try {
          if (axis === "width") {
            actual.setWidth(base);
            actual.setHeight(10);
            expected.setWidth(base);
            expected.setHeight(10);
            if (unit === "point") {
              actual.setMinWidth(100);
              actual.setMaxWidth(50);
              expected.setMinWidth(100);
              expected.setMaxWidth(50);
            } else {
              actual.setMinWidthPercent(60);
              actual.setMaxWidthPercent(25);
              expected.setMinWidthPercent(60);
              expected.setMaxWidthPercent(25);
            }
          } else {
            actual.setWidth(10);
            actual.setHeight(base);
            expected.setWidth(10);
            expected.setHeight(base);
            if (unit === "point") {
              actual.setMinHeight(100);
              actual.setMaxHeight(50);
              expected.setMinHeight(100);
              expected.setMaxHeight(50);
            } else {
              actual.setMinHeightPercent(60);
              actual.setMaxHeightPercent(25);
              expected.setMinHeightPercent(60);
              expected.setMaxHeightPercent(25);
            }
          }

          const ownerWidth = unit === "percent" && axis === "width" ? 200 : undefined;
          const ownerHeight = unit === "percent" && axis === "height" ? 200 : undefined;
          const minimum = axis === "width" ? actual.getMinWidth() : actual.getMinHeight();
          const maximum = axis === "width" ? actual.getMaxWidth() : actual.getMaxHeight();
          assert.deepEqual(
            minimum,
            axis === "width" ? expected.getMinWidth() : expected.getMinHeight(),
            `${name} minimum`,
          );
          assert.deepEqual(
            maximum,
            axis === "width" ? expected.getMaxWidth() : expected.getMaxHeight(),
            `${name} maximum`,
          );
          actual.calculateLayout(ownerWidth, ownerHeight);
          expected.calculateLayout(ownerWidth, ownerHeight);
          assertLayoutEqual(actual, expected, name);
          assert.deepEqual(
            axis === "width" ? actual.getMinWidth() : actual.getMinHeight(),
            minimum,
            `${name} retained minimum`,
          );
          assert.deepEqual(
            axis === "width" ? actual.getMaxWidth() : actual.getMaxHeight(),
            maximum,
            `${name} retained maximum`,
          );
        } finally {
          actual.free();
          expected.free();
        }
      }
    }
  }
});

test("calculation input preserves Yoga's owner-direction fallback and finite boundary", () => {
  for (const direction of [Direction.Inherit, Direction.LTR, Direction.RTL] as const) {
    const actualRoot = Yoga.Node.create();
    const actualChild = Yoga.Node.create();
    const expectedRoot = OracleYoga.Node.create();
    const expectedChild = OracleYoga.Node.create();
    try {
      actualRoot.setWidth(100);
      actualRoot.setHeight(20);
      actualRoot.setFlexDirection(FlexDirection.Row);
      actualChild.setWidth(10);
      actualChild.setMargin(Edge.Start, 5);
      actualRoot.insertChild(actualChild, 0);

      expectedRoot.setWidth(100);
      expectedRoot.setHeight(20);
      expectedRoot.setFlexDirection(OracleFlexDirection.Row);
      expectedChild.setWidth(10);
      expectedChild.setMargin(OracleEdge.Start, 5);
      expectedRoot.insertChild(expectedChild, 0);

      actualRoot.calculateLayout(undefined, undefined, direction);
      expectedRoot.calculateLayout(undefined, undefined, direction as unknown as OracleDirection);
      assertLayoutEqual(actualRoot, expectedRoot, Direction[direction]);
      assertLayoutEqual(actualChild, expectedChild, Direction[direction]);
    } finally {
      actualRoot.freeRecursive();
      expectedRoot.freeRecursive();
    }
  }

  const node = Yoga.Node.create();
  try {
    node.setWidth(12);
    node.setHeight(7);
    node.calculateLayout(undefined, undefined);
    const previous = node.getComputedLayout();
    assert.throws(() => node.calculateLayout(Infinity, undefined), /finite number/);
    assert.throws(() => node.calculateLayout(undefined, -Infinity), /finite number/);
    assert.deepEqual(node.getComputedLayout(), previous);
  } finally {
    node.free();
  }
});

test("subtree projection matches Yoga positions across directions and reversed axes", () => {
  const positionCases = ["left", "right", "both"] as const;
  for (const direction of [Direction.LTR, Direction.RTL] as const) {
    for (const flexDirection of [
      FlexDirection.Row,
      FlexDirection.RowReverse,
      FlexDirection.Column,
      FlexDirection.ColumnReverse,
    ] as const) {
      for (const positionType of [PositionType.Relative, PositionType.Absolute] as const) {
        for (const positionCase of positionCases) {
          const actualParent = Yoga.Node.create();
          const actualChild = Yoga.Node.create();
          const expectedParent = OracleYoga.Node.create();
          const expectedChild = OracleYoga.Node.create();
          try {
            actualParent.setDirection(direction);
            actualParent.setFlexDirection(flexDirection);
            actualParent.setWidth(100);
            actualParent.setHeight(80);
            expectedParent.setDirection(direction as unknown as OracleDirection);
            expectedParent.setFlexDirection(flexDirection as unknown as OracleFlexDirection);
            expectedParent.setWidth(100);
            expectedParent.setHeight(80);

            actualChild.setPositionType(positionType);
            actualChild.setWidth(40);
            actualChild.setHeight(20);
            actualChild.setMargin(Edge.Left, 1);
            actualChild.setMargin(Edge.Right, 2);
            actualChild.setMargin(Edge.Top, 3);
            actualChild.setMargin(Edge.Bottom, 4);
            expectedChild.setPositionType(positionType as unknown as OraclePositionType);
            expectedChild.setWidth(40);
            expectedChild.setHeight(20);
            expectedChild.setMargin(OracleEdge.Left, 1);
            expectedChild.setMargin(OracleEdge.Right, 2);
            expectedChild.setMargin(OracleEdge.Top, 3);
            expectedChild.setMargin(OracleEdge.Bottom, 4);
            if (positionCase !== "right") {
              actualChild.setPosition(Edge.Left, 5);
              expectedChild.setPosition(OracleEdge.Left, 5);
            }
            if (positionCase !== "left") {
              actualChild.setPosition(Edge.Right, 6);
              expectedChild.setPosition(OracleEdge.Right, 6);
            }
            actualChild.setPosition(Edge.Top, 7);
            actualChild.setPosition(Edge.Bottom, 8);
            expectedChild.setPosition(OracleEdge.Top, 7);
            expectedChild.setPosition(OracleEdge.Bottom, 8);

            actualParent.insertChild(actualChild, 0);
            expectedParent.insertChild(expectedChild, 0);
            actualParent.calculateLayout(undefined, undefined, direction);
            expectedParent.calculateLayout(
              undefined,
              undefined,
              direction as unknown as OracleDirection,
            );
            assertLayoutEqual(
              actualChild,
              expectedChild,
              `${Direction[direction]} ${FlexDirection[flexDirection]} ${PositionType[positionType]} ${positionCase}`,
            );
          } finally {
            actualParent.freeRecursive();
            expectedParent.freeRecursive();
          }
        }
      }
    }
  }
});

test("display-none output follows the node selected for calculation", () => {
  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  const oracleParent = OracleYoga.Node.create();
  const oracleChild = OracleYoga.Node.create();
  try {
    child.setDisplay(Display.None);
    child.setWidth(40);
    child.setHeight(20);
    child.setMargin(Edge.Left, 3);
    oracleChild.setDisplay(OracleDisplay.None);
    oracleChild.setWidth(40);
    oracleChild.setHeight(20);
    oracleChild.setMargin(OracleEdge.Left, 3);
    parent.insertChild(child, 0);
    oracleParent.insertChild(oracleChild, 0);
    parent.calculateLayout(100, 80);
    oracleParent.calculateLayout(100, 80);
    assertLayoutEqual(child, oracleChild, "suppressed child");
    assert.equal(child.getComputedMargin(Edge.Left), 0);

    child.calculateLayout(100, 80);
    oracleChild.calculateLayout(100, 80);
    assertLayoutEqual(child, oracleChild, "selected display-none root");
    assert.equal(child.getComputedMargin(Edge.Left), 3);
  } finally {
    parent.freeRecursive();
    oracleParent.freeRecursive();
  }
});

test("absolute logical insets use the containing Node's direction", () => {
  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  const oracleParent = OracleYoga.Node.create();
  const oracleChild = OracleYoga.Node.create();
  try {
    parent.setDirection(Direction.LTR);
    parent.setFlexDirection(FlexDirection.RowReverse);
    parent.setWidth(100);
    parent.setHeight(80);
    parent.setPadding(Edge.All, 3);
    parent.setBorder(Edge.All, 2);
    child.setDirection(Direction.RTL);
    child.setPositionType(PositionType.Absolute);
    child.setWidth(40);
    child.setHeight(20);
    child.setPosition(Edge.Start, 5);
    child.setPosition(Edge.End, 6);
    child.setPosition(Edge.Top, 7);
    child.setPosition(Edge.Bottom, 8);
    parent.insertChild(child, 0);
    oracleParent.setDirection(OracleDirection.LTR);
    oracleParent.setFlexDirection(OracleFlexDirection.RowReverse);
    oracleParent.setWidth(100);
    oracleParent.setHeight(80);
    oracleParent.setPadding(OracleEdge.All, 3);
    oracleParent.setBorder(OracleEdge.All, 2);
    oracleChild.setDirection(OracleDirection.RTL);
    oracleChild.setPositionType(OraclePositionType.Absolute);
    oracleChild.setWidth(40);
    oracleChild.setHeight(20);
    oracleChild.setPosition(OracleEdge.Start, 5);
    oracleChild.setPosition(OracleEdge.End, 6);
    oracleChild.setPosition(OracleEdge.Top, 7);
    oracleChild.setPosition(OracleEdge.Bottom, 8);
    oracleParent.insertChild(oracleChild, 0);
    parent.calculateLayout(undefined, undefined, Direction.LTR);
    oracleParent.calculateLayout(undefined, undefined, OracleDirection.LTR);
    assertLayoutEqual(child, oracleChild);
  } finally {
    parent.freeRecursive();
    oracleParent.freeRecursive();
  }
});

test("absolute logical inset sizing tracks the containing Node's direction", () => {
  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  const oracleParent = OracleYoga.Node.create();
  const oracleChild = OracleYoga.Node.create();
  try {
    parent.setWidth(100);
    parent.setHeight(40);
    child.setDirection(Direction.RTL);
    child.setPositionType(PositionType.Absolute);
    child.setHeight(10);
    child.setPosition(Edge.Start, 5);
    child.setPosition(Edge.Right, 7);
    parent.insertChild(child, 0);
    oracleParent.setWidth(100);
    oracleParent.setHeight(40);
    oracleChild.setDirection(OracleDirection.RTL);
    oracleChild.setPositionType(OraclePositionType.Absolute);
    oracleChild.setHeight(10);
    oracleChild.setPosition(OracleEdge.Start, 5);
    oracleChild.setPosition(OracleEdge.Right, 7);
    oracleParent.insertChild(oracleChild, 0);

    for (const direction of [Direction.LTR, Direction.RTL] as const) {
      parent.setDirection(direction);
      oracleParent.setDirection(direction as unknown as OracleDirection);
      parent.calculateLayout(undefined, undefined);
      oracleParent.calculateLayout(undefined, undefined);
      assertLayoutEqual(child, oracleChild, Direction[direction]);
    }
  } finally {
    parent.freeRecursive();
    oracleParent.freeRecursive();
  }
});

test("absolute logical margins use containing direction for placement", () => {
  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  const oracleParent = OracleYoga.Node.create();
  const oracleChild = OracleYoga.Node.create();
  try {
    parent.setFlexDirection(FlexDirection.Row);
    parent.setWidth(103);
    parent.setHeight(40);
    parent.setPadding(Edge.All, 3);
    parent.setBorder(Edge.All, 2);
    child.setDirection(Direction.RTL);
    child.setPositionType(PositionType.Absolute);
    child.setWidth(20);
    child.setHeight(10);
    child.setMarginPercent(Edge.Start, 9);
    parent.insertChild(child, 0);
    oracleParent.setFlexDirection(OracleFlexDirection.Row);
    oracleParent.setWidth(103);
    oracleParent.setHeight(40);
    oracleParent.setPadding(OracleEdge.All, 3);
    oracleParent.setBorder(OracleEdge.All, 2);
    oracleChild.setDirection(OracleDirection.RTL);
    oracleChild.setPositionType(OraclePositionType.Absolute);
    oracleChild.setWidth(20);
    oracleChild.setHeight(10);
    oracleChild.setMarginPercent(OracleEdge.Start, 9);
    oracleParent.insertChild(oracleChild, 0);
    parent.calculateLayout(undefined, undefined);
    oracleParent.calculateLayout(undefined, undefined);
    assertLayoutEqual(child, oracleChild);
    assert.equal(
      child.getComputedMargin(Edge.Right),
      oracleChild.getComputedMargin(OracleEdge.Right),
    );
  } finally {
    parent.freeRecursive();
    oracleParent.freeRecursive();
  }
});

test("absolute vertical percentage margins separate placement and computed-margin bases", () => {
  for (const [edge, oracleEdge] of [
    [Edge.Top, OracleEdge.Top],
    [Edge.Bottom, OracleEdge.Bottom],
  ] as const) {
    const config = Yoga.Config.create();
    const oracleConfig = OracleYoga.Config.create();
    config.setPointScaleFactor(0);
    oracleConfig.setPointScaleFactor(0);
    const parent = Yoga.Node.createWithConfig(config);
    const child = Yoga.Node.createWithConfig(config);
    const oracleParent = OracleYoga.Node.createWithConfig(oracleConfig);
    const oracleChild = OracleYoga.Node.createWithConfig(oracleConfig);
    try {
      parent.setWidth(120);
      parent.setHeight(90);
      child.setPositionType(PositionType.Absolute);
      child.setWidth(10);
      child.setHeight(10);
      child.setPosition(edge, 0);
      child.setMarginPercent(edge, 5);
      parent.insertChild(child, 0);
      oracleParent.setWidth(120);
      oracleParent.setHeight(90);
      oracleChild.setPositionType(OraclePositionType.Absolute);
      oracleChild.setWidth(10);
      oracleChild.setHeight(10);
      oracleChild.setPosition(oracleEdge, 0);
      oracleChild.setMarginPercent(oracleEdge, 5);
      oracleParent.insertChild(oracleChild, 0);

      parent.calculateLayout(undefined, undefined);
      oracleParent.calculateLayout(undefined, undefined);
      assertLayoutEqual(child, oracleChild, Edge[edge]);
      assert.equal(child.getComputedMargin(edge), oracleChild.getComputedMargin(oracleEdge));
      assert.equal(child.getComputedMargin(edge), 6, `${Edge[edge]} computed margin uses width`);
    } finally {
      parent.freeRecursive();
      oracleParent.freeRecursive();
      config.free();
      oracleConfig.free();
    }
  }
});

test("percentage projected positions preserve Yoga float32 operation order", () => {
  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  const oracleParent = OracleYoga.Node.create();
  const oracleChild = OracleYoga.Node.create();
  try {
    parent.setWidth(93);
    parent.setHeight(40);
    child.setWidth(21);
    child.setHeight(10);
    child.setPositionPercent(Edge.Left, 7);
    parent.insertChild(child, 0);
    oracleParent.setWidth(93);
    oracleParent.setHeight(40);
    oracleChild.setWidth(21);
    oracleChild.setHeight(10);
    oracleChild.setPositionPercent(OracleEdge.Left, 7);
    oracleParent.insertChild(oracleChild, 0);
    parent.calculateLayout(undefined, undefined);
    oracleParent.calculateLayout(undefined, undefined);
    assertLayoutEqual(child, oracleChild);

    parent.setFlexDirection(FlexDirection.RowReverse);
    oracleParent.setFlexDirection(OracleFlexDirection.RowReverse);
    parent.calculateLayout(undefined, undefined);
    oracleParent.calculateLayout(undefined, undefined);
    assertLayoutEqual(child, oracleChild, "reversed axis");
  } finally {
    parent.freeRecursive();
    oracleParent.freeRecursive();
  }
});

test("unrounded percentage projection respects the documented float boundary", () => {
  const config = Yoga.Config.create();
  const oracleConfig = OracleYoga.Config.create();
  config.setPointScaleFactor(0);
  oracleConfig.setPointScaleFactor(0);

  const relativeParent = Yoga.Node.createWithConfig(config);
  const relativeChild = Yoga.Node.createWithConfig(config);
  const oracleRelativeParent = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleRelativeChild = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    relativeParent.setWidth(3);
    relativeChild.setWidth(1);
    relativeChild.setHeight(1);
    relativeChild.setPositionPercent(Edge.Left, 0.3);
    relativeParent.insertChild(relativeChild, 0);
    oracleRelativeParent.setWidth(3);
    oracleRelativeChild.setWidth(1);
    oracleRelativeChild.setHeight(1);
    oracleRelativeChild.setPositionPercent(OracleEdge.Left, 0.3);
    oracleRelativeParent.insertChild(oracleRelativeChild, 0);
    relativeParent.calculateLayout(undefined, undefined);
    oracleRelativeParent.calculateLayout(undefined, undefined);
    assert.equal(relativeChild.getComputedLeft(), oracleRelativeChild.getComputedLeft());
  } finally {
    relativeParent.freeRecursive();
    oracleRelativeParent.freeRecursive();
  }

  const absoluteParent = Yoga.Node.createWithConfig(config);
  const absoluteChild = Yoga.Node.createWithConfig(config);
  const oracleAbsoluteParent = OracleYoga.Node.createWithConfig(oracleConfig);
  const oracleAbsoluteChild = OracleYoga.Node.createWithConfig(oracleConfig);
  try {
    absoluteParent.setDirection(Direction.RTL);
    absoluteParent.setWidth(103);
    absoluteParent.setHeight(40);
    absoluteChild.setDirection(Direction.LTR);
    absoluteChild.setPositionType(PositionType.Absolute);
    absoluteChild.setWidth(20);
    absoluteChild.setHeight(10);
    absoluteChild.setMarginPercent(Edge.Start, 9);
    absoluteParent.insertChild(absoluteChild, 0);
    oracleAbsoluteParent.setDirection(OracleDirection.RTL);
    oracleAbsoluteParent.setWidth(103);
    oracleAbsoluteParent.setHeight(40);
    oracleAbsoluteChild.setDirection(OracleDirection.LTR);
    oracleAbsoluteChild.setPositionType(OraclePositionType.Absolute);
    oracleAbsoluteChild.setWidth(20);
    oracleAbsoluteChild.setHeight(10);
    oracleAbsoluteChild.setMarginPercent(OracleEdge.Start, 9);
    oracleAbsoluteParent.insertChild(oracleAbsoluteChild, 0);
    absoluteParent.calculateLayout(undefined, undefined);
    oracleAbsoluteParent.calculateLayout(undefined, undefined);
    const actual = absoluteChild.getComputedLayout();
    const expected = oracleAbsoluteChild.getComputedLayout();
    for (const key of ["left", "right", "top", "bottom", "width", "height"] as const) {
      assertFloatCompatible(actual[key], expected[key], `absolute ${key}`);
    }
    assert.equal(
      absoluteChild.getComputedMargin(Edge.Left),
      oracleAbsoluteChild.getComputedMargin(OracleEdge.Left),
    );
  } finally {
    absoluteParent.freeRecursive();
    oracleAbsoluteParent.freeRecursive();
    config.free();
    oracleConfig.free();
  }
});

test("computed physical and logical edges match Yoga and reject shorthands", () => {
  const edges = [Edge.Left, Edge.Top, Edge.Right, Edge.Bottom, Edge.Start, Edge.End] as const;
  for (const direction of [Direction.LTR, Direction.RTL] as const) {
    const actualParent = Yoga.Node.create();
    const actualChild = Yoga.Node.create();
    const expectedParent = OracleYoga.Node.create();
    const expectedChild = OracleYoga.Node.create();
    try {
      actualParent.setDirection(direction);
      actualParent.setWidth(200);
      actualParent.setHeight(100);
      expectedParent.setDirection(direction as unknown as OracleDirection);
      expectedParent.setWidth(200);
      expectedParent.setHeight(100);
      actualChild.setWidth(40);
      actualChild.setHeight(20);
      actualChild.setMargin(Edge.Left, 3);
      actualChild.setMargin(Edge.Start, 7);
      actualChild.setMarginAuto(Edge.End);
      actualChild.setPaddingPercent(Edge.Horizontal, 5);
      actualChild.setPadding(Edge.Start, 13);
      actualChild.setBorder(Edge.All, 2);
      actualChild.setBorder(Edge.End, 4);
      expectedChild.setWidth(40);
      expectedChild.setHeight(20);
      expectedChild.setMargin(OracleEdge.Left, 3);
      expectedChild.setMargin(OracleEdge.Start, 7);
      expectedChild.setMarginAuto(OracleEdge.End);
      expectedChild.setPaddingPercent(OracleEdge.Horizontal, 5);
      expectedChild.setPadding(OracleEdge.Start, 13);
      expectedChild.setBorder(OracleEdge.All, 2);
      expectedChild.setBorder(OracleEdge.End, 4);
      actualParent.insertChild(actualChild, 0);
      expectedParent.insertChild(expectedChild, 0);
      actualParent.calculateLayout(undefined, undefined, direction);
      expectedParent.calculateLayout(undefined, undefined, direction as unknown as OracleDirection);

      for (const edge of edges) {
        assert.equal(
          actualChild.getComputedMargin(edge),
          expectedChild.getComputedMargin(edge as unknown as OracleEdge),
        );
        assert.equal(
          actualChild.getComputedPadding(edge),
          expectedChild.getComputedPadding(edge as unknown as OracleEdge),
        );
        assert.equal(
          actualChild.getComputedBorder(edge),
          expectedChild.getComputedBorder(edge as unknown as OracleEdge),
        );
      }
      assert.equal(actualChild.getComputedMargin(Edge.End), 0, "auto margin is masked");
    } finally {
      actualParent.freeRecursive();
      expectedParent.freeRecursive();
    }
  }

  const node = Yoga.Node.create();
  try {
    for (const edge of edges) {
      assert.equal(node.getComputedMargin(edge), 0);
      assert.equal(node.getComputedPadding(edge), 0);
      assert.equal(node.getComputedBorder(edge), 0);
    }
    for (const edge of [Edge.Horizontal, Edge.Vertical, Edge.All]) {
      assert.throws(() => node.getComputedMargin(edge), TypeError);
      assert.throws(() => node.getComputedPadding(edge), TypeError);
      assert.throws(() => node.getComputedBorder(edge), TypeError);
    }
  } finally {
    node.free();
  }
});

test("point-grid output rounding matches Yoga per Config", () => {
  for (const factor of [0, 1, 2, 3, Infinity]) {
    const config = Yoga.Config.create();
    const oracleConfig = OracleYoga.Config.create();
    config.setPointScaleFactor(factor);
    oracleConfig.setPointScaleFactor(factor);
    const actualParent = Yoga.Node.createWithConfig(config);
    const actualChild = Yoga.Node.createWithConfig(config);
    const expectedParent = OracleYoga.Node.createWithConfig(oracleConfig);
    const expectedChild = OracleYoga.Node.createWithConfig(oracleConfig);
    try {
      actualParent.setFlexDirection(FlexDirection.Row);
      actualParent.setWidth(10.25);
      actualParent.setHeight(6.25);
      actualParent.setPadding(Edge.Left, 0.2);
      actualChild.setWidth(3.3);
      actualChild.setHeight(2.2);
      actualChild.setMargin(Edge.Left, 0.15);
      expectedParent.setFlexDirection(OracleFlexDirection.Row);
      expectedParent.setWidth(10.25);
      expectedParent.setHeight(6.25);
      expectedParent.setPadding(OracleEdge.Left, 0.2);
      expectedChild.setWidth(3.3);
      expectedChild.setHeight(2.2);
      expectedChild.setMargin(OracleEdge.Left, 0.15);
      actualParent.insertChild(actualChild, 0);
      expectedParent.insertChild(expectedChild, 0);
      actualParent.calculateLayout(undefined, undefined);
      expectedParent.calculateLayout(undefined, undefined);
      assertLayoutEqual(actualParent, expectedParent, `factor ${factor} parent`);
      assertLayoutEqual(actualChild, expectedChild, `factor ${factor} child`);
    } finally {
      actualParent.freeRecursive();
      expectedParent.freeRecursive();
      config.free();
      oracleConfig.free();
    }
  }

  const parentConfig = Yoga.Config.create();
  const childConfig = Yoga.Config.create();
  const oracleParentConfig = OracleYoga.Config.create();
  const oracleChildConfig = OracleYoga.Config.create();
  parentConfig.setPointScaleFactor(1);
  childConfig.setPointScaleFactor(3);
  oracleParentConfig.setPointScaleFactor(1);
  oracleChildConfig.setPointScaleFactor(3);
  const parent = Yoga.Node.createWithConfig(parentConfig);
  const child = Yoga.Node.createWithConfig(childConfig);
  const oracleParent = OracleYoga.Node.createWithConfig(oracleParentConfig);
  const oracleChild = OracleYoga.Node.createWithConfig(oracleChildConfig);
  try {
    parent.setFlexDirection(FlexDirection.Row);
    parent.setWidth(10.3);
    parent.setHeight(6.2);
    child.setWidth(3.3);
    child.setHeight(2.2);
    oracleParent.setFlexDirection(OracleFlexDirection.Row);
    oracleParent.setWidth(10.3);
    oracleParent.setHeight(6.2);
    oracleChild.setWidth(3.3);
    oracleChild.setHeight(2.2);
    parent.insertChild(child, 0);
    oracleParent.insertChild(oracleChild, 0);
    parent.calculateLayout(undefined, undefined);
    oracleParent.calculateLayout(undefined, undefined);
    assertLayoutEqual(parent, oracleParent, "mixed Config parent");
    assertLayoutEqual(child, oracleChild, "mixed Config child");
  } finally {
    parent.freeRecursive();
    oracleParent.freeRecursive();
    parentConfig.free();
    childConfig.free();
    oracleParentConfig.free();
    oracleChildConfig.free();
  }
});

test("detaching a child resets its complete computed output", () => {
  const parent = Yoga.Node.create();
  const child = Yoga.Node.create();
  child.setWidth(10);
  child.setHeight(4);
  child.setMargin(Edge.Left, 2);
  child.setPadding(Edge.Left, 3);
  child.setBorder(Edge.Left, 1);
  parent.insertChild(child, 0);
  parent.calculateLayout(undefined, undefined);
  assert.equal(child.getComputedMargin(Edge.Left), 2);
  assert.equal(child.getComputedPadding(Edge.Left), 3);
  assert.equal(child.getComputedBorder(Edge.Left), 1);

  parent.removeChild(child);
  assert.deepEqual(child.getComputedLayout(), {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: Number.NaN,
    height: Number.NaN,
  });
  assert.equal(child.getComputedMargin(Edge.Left), 0);
  assert.equal(child.getComputedPadding(Edge.Left), 0);
  assert.equal(child.getComputedBorder(Edge.Left), 0);
  parent.free();
  child.free();
});

test("ordinary nested Flex, percentage, grow, and shrink geometry matches Yoga", () => {
  const actual = Array.from({ length: 4 }, () => Yoga.Node.create());
  const expected = Array.from({ length: 4 }, () => OracleYoga.Node.create());
  const [root, first, second, grandchild] = actual;
  const [oracleRoot, oracleFirst, oracleSecond, oracleGrandchild] = expected;
  try {
    root.setFlexDirection(FlexDirection.Row);
    root.setWidth(200);
    root.setHeight(100);
    root.setPadding(Edge.All, 10);
    first.setWidthPercent(25);
    first.setHeightPercent(50);
    first.setMargin(Edge.Right, 5);
    second.setFlexGrow(1);
    second.setFlexBasis(20);
    second.setHeight(60);
    second.setPadding(Edge.Left, 3);
    grandchild.setWidthPercent(50);
    grandchild.setHeight(20);
    second.insertChild(grandchild, 0);
    root.insertChild(first, 0);
    root.insertChild(second, 1);

    oracleRoot.setFlexDirection(OracleFlexDirection.Row);
    oracleRoot.setWidth(200);
    oracleRoot.setHeight(100);
    oracleRoot.setPadding(OracleEdge.All, 10);
    oracleFirst.setWidthPercent(25);
    oracleFirst.setHeightPercent(50);
    oracleFirst.setMargin(OracleEdge.Right, 5);
    oracleSecond.setFlexGrow(1);
    oracleSecond.setFlexBasis(20);
    oracleSecond.setHeight(60);
    oracleSecond.setPadding(OracleEdge.Left, 3);
    oracleGrandchild.setWidthPercent(50);
    oracleGrandchild.setHeight(20);
    oracleSecond.insertChild(oracleGrandchild, 0);
    oracleRoot.insertChild(oracleFirst, 0);
    oracleRoot.insertChild(oracleSecond, 1);

    root.calculateLayout(undefined, undefined);
    oracleRoot.calculateLayout(undefined, undefined);
    for (const [index, node] of actual.entries()) {
      assertLayoutEqual(node, expected[index], `node ${index}`);
    }
  } finally {
    root.freeRecursive();
    oracleRoot.freeRecursive();
  }
});

test("undefined minimums do not impose Taffy's automatic content floor", () => {
  for (const axis of ["row", "column"] as const) {
    const actual = Array.from({ length: 4 }, () => Yoga.Node.create());
    const expected = Array.from({ length: 4 }, () => OracleYoga.Node.create());
    const [root, zeroBasis, child, sibling] = actual;
    const [oracleRoot, oracleZeroBasis, oracleChild, oracleSibling] = expected;
    try {
      root.setFlexDirection(axis === "row" ? FlexDirection.Row : FlexDirection.Column);
      oracleRoot.setFlexDirection(
        axis === "row" ? OracleFlexDirection.Row : OracleFlexDirection.Column,
      );
      if (axis === "row") {
        root.setWidth(6);
        oracleRoot.setWidth(6);
      } else {
        root.setHeight(6);
        oracleRoot.setHeight(6);
      }
      zeroBasis.setFlexBasis(0);
      oracleZeroBasis.setFlexBasis(0);
      child.setMeasureFunc(() => ({ width: 1, height: 1 }));
      oracleChild.setMeasureFunc(() => ({ width: 1, height: 1 }));
      sibling.setMeasureFunc(() => ({ width: 1, height: 1 }));
      oracleSibling.setMeasureFunc(() => ({ width: 1, height: 1 }));
      zeroBasis.insertChild(child, 0);
      oracleZeroBasis.insertChild(oracleChild, 0);
      root.insertChild(zeroBasis, 0);
      oracleRoot.insertChild(oracleZeroBasis, 0);
      root.insertChild(sibling, 1);
      oracleRoot.insertChild(oracleSibling, 1);

      root.calculateLayout(undefined, undefined);
      oracleRoot.calculateLayout(undefined, undefined);
      for (const [index, node] of actual.entries()) {
        assertLayoutEqual(node, expected[index], `${axis} node ${index}`);
      }
    } finally {
      root.freeRecursive();
      oracleRoot.freeRecursive();
    }
  }
});

test("one calculation commits the complete selected subtree atomically", async () => {
  const facade = await loadYoga();
  const root = facade.Node.create();
  const child = facade.Node.create();
  child.setWidth(10);
  child.setHeight(4);
  root.insertChild(child, 0);
  root.calculateLayout(undefined, undefined);
  const previousRoot = root.getComputedLayout();
  const previousChild = child.getComputedLayout();
  child.setWidth(20);

  const prototype = TaffyTree.prototype;
  const originalGet = Object.getOwnPropertyDescriptor(prototype, "getUnroundedLayout")
    ?.value as TaffyTree["getUnroundedLayout"];
  const sentinel = new Error("expected projection failure");
  let reads = 0;
  prototype.getUnroundedLayout = function (this: TaffyTree, node: NodeId) {
    reads += 1;
    if (reads === 2) throw sentinel;
    return originalGet.call(this, node);
  };
  try {
    assert.throws(
      () => root.calculateLayout(undefined, undefined),
      (error) => error === sentinel,
    );
  } finally {
    prototype.getUnroundedLayout = originalGet;
  }

  assert.deepEqual(root.getComputedLayout(), previousRoot);
  assert.deepEqual(child.getComputedLayout(), previousChild);
  assert.equal(root.isDirty(), true);
  assert.equal(child.isDirty(), true);
  root.calculateLayout(undefined, undefined);
  assert.equal(root.getComputedWidth(), 20);
  assert.equal(child.getComputedWidth(), 20);
  root.freeRecursive();
});

test("failed native calculation restores the temporary root Style and old output", async () => {
  const facade = await loadYoga();
  const node = facade.Node.create();
  node.calculateLayout(100, 40);
  const previous = node.getComputedLayout();

  const prototype = TaffyTree.prototype;
  const originalCompute = Object.getOwnPropertyDescriptor(prototype, "computeLayout")
    ?.value as TaffyTree["computeLayout"];
  const sentinel = { reason: "expected calculation failure" };
  prototype.computeLayout = function (): never {
    throw sentinel;
  };
  try {
    assert.throws(
      () => node.calculateLayout(200, 80),
      (error) => error === sentinel,
    );
  } finally {
    prototype.computeLayout = originalCompute;
  }

  assert.deepEqual(node.getComputedLayout(), previous);
  assert.equal(node.isDirty(), false);
  node.calculateLayout(200, 80);
  assert.deepEqual(node.getComputedLayout(), {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 200,
    height: 80,
  });
  node.free();
});

test("an unexpected temporary-Style restoration failure poisons only its facade", async () => {
  const facade = await loadYoga();
  const node = facade.Node.create();
  const prototype = TaffyTree.prototype;
  const originalSetStyle = Object.getOwnPropertyDescriptor(prototype, "setStyle")
    ?.value as TaffyTree["setStyle"];
  const sentinel = new Error("expected restoration failure");
  let writes = 0;
  prototype.setStyle = function (
    this: TaffyTree,
    nodeId: NodeId,
    style: Parameters<TaffyTree["setStyle"]>[1],
  ): void {
    writes += 1;
    if (writes === 2) throw sentinel;
    originalSetStyle.call(this, nodeId, style);
  };
  try {
    assert.throws(() => node.calculateLayout(100, 40), /facade is unusable/);
  } finally {
    prototype.setStyle = originalSetStyle;
  }
  assert.equal(writes, 2);
  assert.throws(() => node.getComputedWidth(), /facade is unusable/);

  const healthyFacade = await loadYoga();
  const healthy = healthyFacade.Node.create();
  healthy.calculateLayout(12, 7);
  assert.equal(healthy.getComputedWidth(), 12);
  healthy.free();
});
