import assert from "node:assert/strict";
import {
  AlignContent,
  AlignItems,
  AvailableSpace,
  BoxSizing,
  Clear,
  Contain,
  Dimension,
  Direction,
  Display,
  FlexDirection,
  FlexWrap,
  Float,
  GridAutoFlow,
  GridPlacement,
  GridTemplateComponent,
  Overflow,
  Position,
  RepetitionCount,
  TaffyTree,
  TextAlign,
  TrackSizingFunction,
  type StyleUpdate,
} from "@taffyjs/node";
import { test } from "vite-plus/test";

function maxContentSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
}

function oneFieldUpdate(field: keyof StyleUpdate, value: unknown): StyleUpdate {
  return { [field]: value } as StyleUpdate;
}

const fieldCases = [
  ["display", Display.None, Display.Grid],
  ["itemIsTable", true, false],
  ["itemIsReplaced", true, false],
  ["boxSizing", BoxSizing.ContentBox, BoxSizing.BorderBox],
  ["direction", Direction.Rtl, Direction.Ltr],
  [
    "overflow",
    { x: Overflow.Hidden, y: Overflow.Scroll },
    { x: Overflow.Clip, y: Overflow.Visible },
  ],
  ["scrollbarWidth", 3, 4],
  ["contain", Contain.Layout, Contain.Content],
  ["float", Float.Left, Float.Right],
  ["clear", Clear.Left, Clear.Both],
  ["position", Position.Absolute, Position.Relative],
  ["inset", { left: 1, right: 2, top: 3, bottom: 4 }, { left: 5, right: 6, top: 7, bottom: 8 }],
  ["size", { width: 10, height: 11 }, { width: 12, height: 13 }],
  ["minSize", { width: 10, height: 11 }, { width: 12, height: 13 }],
  ["maxSize", { width: 20, height: 21 }, { width: 22, height: 23 }],
  ["aspectRatio", 2, 3],
  ["margin", { left: 1, right: 2, top: 3, bottom: 4 }, { left: 5, right: 6, top: 7, bottom: 8 }],
  ["padding", { left: 1, right: 2, top: 3, bottom: 4 }, { left: 5, right: 6, top: 7, bottom: 8 }],
  ["border", { left: 1, right: 2, top: 3, bottom: 4 }, { left: 5, right: 6, top: 7, bottom: 8 }],
  ["alignItems", AlignItems.Center, AlignItems.End],
  ["alignSelf", AlignItems.Center, AlignItems.End],
  ["justifyItems", AlignItems.Center, AlignItems.End],
  ["justifySelf", AlignItems.Center, AlignItems.End],
  ["alignContent", AlignContent.Center, AlignContent.End],
  ["justifyContent", AlignContent.Center, AlignContent.End],
  ["gap", { width: 1, height: 2 }, { width: 3, height: 4 }],
  ["textAlign", TextAlign.LegacyLeft, TextAlign.LegacyRight],
  ["flexDirection", FlexDirection.Column, FlexDirection.RowReverse],
  ["flexWrap", FlexWrap.Wrap, FlexWrap.WrapReverse],
  ["flexBasis", 2, 3],
  ["flexGrow", 2, 3],
  ["flexShrink", 2, 3],
  [
    "gridTemplateRows",
    [GridTemplateComponent.Single(TrackSizingFunction.Length(1))],
    [GridTemplateComponent.Single(TrackSizingFunction.Length(2))],
  ],
  [
    "gridTemplateColumns",
    [GridTemplateComponent.Single(TrackSizingFunction.Length(1))],
    [GridTemplateComponent.Single(TrackSizingFunction.Length(2))],
  ],
  ["gridAutoRows", [TrackSizingFunction.Length(1)], [TrackSizingFunction.Length(2)]],
  ["gridAutoColumns", [TrackSizingFunction.Length(1)], [TrackSizingFunction.Length(2)]],
  ["gridAutoFlow", GridAutoFlow.Column, GridAutoFlow.RowDense],
  [
    "gridTemplateAreas",
    {
      areas: [{ name: "a", rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 1 }],
      rowCount: 1,
      columnCount: 1,
    },
    {
      areas: [{ name: "b", rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 1 }],
      rowCount: 1,
      columnCount: 1,
    },
  ],
  ["gridTemplateColumnNames", [["a"]], [["b"]]],
  ["gridTemplateRowNames", [["a"]], [["b"]]],
  [
    "gridRow",
    { start: GridPlacement.Line(1), end: GridPlacement.Span(2) },
    { start: GridPlacement.Line(2), end: GridPlacement.Span(3) },
  ],
  [
    "gridColumn",
    { start: GridPlacement.Line(1), end: GridPlacement.Span(2) },
    { start: GridPlacement.Line(2), end: GridPlacement.Span(3) },
  ],
] as const satisfies readonly (readonly [keyof StyleUpdate, unknown, unknown])[];

type MissingStyleUpdateField = Exclude<keyof StyleUpdate, (typeof fieldCases)[number][0]>;
const allStyleUpdateFieldsCovered: [MissingStyleUpdateField] extends [never] ? true : false = true;

test("applies every top-level field and skips equal or undefined values", () => {
  assert.equal(allStyleUpdateFieldsCovered, true);
  assert.equal(fieldCases.length, 42);

  for (const [field, initial, next] of fieldCases) {
    const tree = new TaffyTree();
    const node = tree.newLeaf(oneFieldUpdate(field, initial));
    const expectedNode = tree.newLeaf(oneFieldUpdate(field, next));
    const expectedStyle = tree.getStyle(expectedNode);

    tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
    tree.updateStyle(node, oneFieldUpdate(field, next));
    assert.equal(tree.isDirty(node), true, `${field} should dirty the node when changed`);
    assert.deepEqual(tree.getStyle(node), expectedStyle, `${field} should apply the new value`);

    tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
    tree.updateStyle(node, oneFieldUpdate(field, next));
    assert.equal(tree.isDirty(node), false, `${field} should remain clean when unchanged`);

    tree.updateStyle(node, oneFieldUpdate(field, undefined));
    assert.equal(tree.isDirty(node), false, `${field}: undefined should preserve the value`);
    assert.deepEqual(tree.getStyle(node), expectedStyle, `${field}: undefined should be a no-op`);
  }
});

test("preserves omitted fields and geometry components", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    display: Display.None,
    flexGrow: 2,
    overflow: { x: Overflow.Hidden, y: Overflow.Scroll },
    size: { width: 10, height: 20 },
    margin: { left: 1, right: 2, top: 3, bottom: 4 },
    gridRow: { start: GridPlacement.Line(2), end: GridPlacement.Span(3) },
  });

  tree.updateStyle(node, {
    display: undefined,
    flexGrow: 3,
    overflow: { y: Overflow.Visible },
    size: { width: 30 },
    margin: { left: 5 },
    gridRow: { end: GridPlacement.Auto },
  });

  const style = tree.getStyle(node);
  assert.equal(style.display, Display.None);
  assert.equal(style.flexGrow, 3);
  assert.deepEqual(style.overflow, { x: Overflow.Hidden, y: Overflow.Visible });
  assert.deepEqual(style.size, { width: Dimension.Length(30), height: Dimension.Length(20) });
  assert.deepEqual(style.margin, {
    left: Dimension.Length(5),
    right: Dimension.Length(2),
    top: Dimension.Length(3),
    bottom: Dimension.Length(4),
  });
  assert.deepEqual(style.gridRow, {
    start: GridPlacement.Line(2),
    end: GridPlacement.Auto,
  });
});

test("replaces complete values and clears nullable fields and arrays", () => {
  const tree = new TaffyTree();
  const track = TrackSizingFunction.Fr(2);
  const node = tree.newLeaf({
    aspectRatio: 2,
    flexBasis: 12,
    gridAutoRows: [track],
  });

  tree.updateStyle(node, {
    aspectRatio: null,
    flexBasis: Dimension.Auto,
    gridAutoRows: [],
  });

  const style = tree.getStyle(node);
  assert.equal(style.aspectRatio, null);
  assert.deepEqual(style.flexBasis, Dimension.Auto);
  assert.deepEqual(style.gridAutoRows, []);
});

test("empty and unchanged updates preserve clean state", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    flexGrow: Number.NaN,
    size: { width: 10, height: 20 },
    gridAutoRows: [TrackSizingFunction.Fr(2)],
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  assert.equal(tree.isDirty(node), false);

  for (const update of [
    {},
    { flexGrow: undefined },
    { size: {} },
    { flexGrow: Number.NaN },
    { size: { width: 10 } },
    { gridAutoRows: [TrackSizingFunction.Fr(2)] },
  ]) {
    tree.updateStyle(node, update);
    assert.equal(tree.isDirty(node), false);
  }

  tree.updateStyle(node, tree.getStyle(node));
  assert.equal(tree.isDirty(node), false);

  tree.updateStyle(node, { scrollbarWidth: -0 });
  assert.equal(tree.isDirty(node), true);
  assert.equal(Object.is(tree.getStyle(node).scrollbarWidth, -0), true);
});

test("unknown fields are ignored", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({ flexGrow: 2 });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });

  tree.updateStyle(node, { unknownField: true } as never);
  assert.equal(tree.getStyle(node).flexGrow, 2);
  assert.equal(tree.isDirty(node), false);
});

test("validates the merged style before one atomic write", () => {
  const tree = new TaffyTree();
  const track = TrackSizingFunction.Length(10);
  const node = tree.newLeaf({
    flexGrow: 1,
    gridTemplateRows: [GridTemplateComponent.Single(track)],
    gridTemplateRowNames: [["row"]],
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  const beforeStyle = tree.getStyle(node);
  const beforeDirty = tree.isDirty(node);

  assert.throws(
    () =>
      tree.updateStyle(node, {
        flexGrow: 2,
        gridTemplateRows: [
          GridTemplateComponent.Repeat(RepetitionCount.Count(1), [track], [["row"]]),
        ],
      }),
    RangeError,
  );
  assert.deepEqual(tree.getStyle(node), beforeStyle);
  assert.equal(tree.isDirty(node), beforeDirty);
});
