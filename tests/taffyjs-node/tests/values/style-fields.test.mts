import assert from "node:assert/strict";
import {
  AlignItems,
  AvailableSpace,
  Dimension,
  Display,
  GridPlacement,
  GridTemplateComponent,
  LengthUnit,
  Overflow,
  TaffyTree,
  TrackSizingFunction,
  type StyleInput,
} from "@taffyjs/node";
import { test } from "vite-plus/test";

const auto = () => ({ unit: LengthUnit.Auto });
const zero = () => ({ unit: LengthUnit.Length, value: 0 });
const size = (value: () => { unit: number; value?: number }) => ({
  width: value(),
  height: value(),
});
const rect = (value: () => { unit: number; value?: number }) => ({
  left: value(),
  right: value(),
  top: value(),
  bottom: value(),
});

test("default Style contains every public field and value", () => {
  const tree = new TaffyTree();
  const style = tree.getStyle(tree.newLeaf());

  assert.deepEqual(style, {
    display: 2,
    itemIsTable: false,
    itemIsReplaced: false,
    boxSizing: 0,
    direction: 0,
    overflow: { x: 0, y: 0 },
    scrollbarWidth: 0,
    float: 2,
    clear: 3,
    position: 0,
    inset: rect(auto),
    size: size(auto),
    minSize: size(auto),
    maxSize: size(auto),
    aspectRatio: null,
    margin: rect(zero),
    padding: rect(zero),
    border: rect(zero),
    alignItems: null,
    alignSelf: null,
    justifyItems: null,
    justifySelf: null,
    alignContent: null,
    justifyContent: null,
    gap: size(zero),
    textAlign: 0,
    flexDirection: 0,
    flexWrap: 0,
    flexBasis: auto(),
    flexGrow: 0,
    flexShrink: 1,
    gridTemplateRows: [],
    gridTemplateColumns: [],
    gridAutoRows: [],
    gridAutoColumns: [],
    gridAutoFlow: 0,
    gridTemplateAreas: null,
    gridTemplateColumnNames: [],
    gridTemplateRowNames: [],
    gridRow: { start: { kind: 0 }, end: { kind: 0 } },
    gridColumn: { start: { kind: 0 }, end: { kind: 0 } },
  });
});

test("representative Style input categories round-trip", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    display: Display.Grid,
    itemIsTable: true,
    scrollbarWidth: 3.5,
    overflow: { x: Overflow.Hidden, y: Overflow.Scroll },
    size: 20,
    aspectRatio: null,
    alignItems: AlignItems.Center,
    flexBasis: Dimension.Percent(25),
    gridTemplateRows: [GridTemplateComponent.Single(TrackSizingFunction.Length(24))],
    gridRow: { start: GridPlacement.Line(2), end: GridPlacement.Span(1) },
  });
  const style = tree.getStyle(node);

  assert.equal(style.display, Display.Grid);
  assert.equal(style.itemIsTable, true);
  assert.equal(style.scrollbarWidth, 3.5);
  assert.deepEqual(style.overflow, { x: Overflow.Hidden, y: Overflow.Scroll });
  assert.deepEqual(style.size, { width: Dimension.Length(20), height: Dimension.Length(20) });
  assert.equal(style.aspectRatio, null);
  assert.equal(style.alignItems, AlignItems.Center);
  assert.deepEqual(style.flexBasis, Dimension.Percent(25));
  assert.deepEqual(style.gridTemplateRows, [
    GridTemplateComponent.Single(TrackSizingFunction.Length(24)),
  ]);
  assert.deepEqual(style.gridRow, {
    start: GridPlacement.Line(2),
    end: GridPlacement.Span(1),
  });
});

test("representative invalid Style conversion categories are rejected", () => {
  const invalidCases: ReadonlyArray<readonly [string, unknown, ErrorConstructor]> = [
    ["boolean", { itemIsTable: 1 }, TypeError],
    ["number", { flexGrow: "1" }, TypeError],
    ["nullable", { alignItems: "center" }, TypeError],
    ["numeric family", { display: 255 }, RangeError],
    ["length", { flexBasis: { unit: LengthUnit.Length } }, TypeError],
    ["geometry", { overflow: { x: Overflow.Hidden, z: Overflow.Scroll } }, TypeError],
    ["Grid collection", { gridTemplateRows: [null] }, TypeError],
    ["tagged union", { gridRow: { start: { kind: 255 } } }, RangeError],
  ];

  for (const [name, style, ErrorClass] of invalidCases) {
    const tree = new TaffyTree();
    assert.throws(() => tree.newLeaf(style as StyleInput), ErrorClass, name);
    assert.equal(tree.getNodeCount(), 0, name);
  }
});

test("failed Style replacement leaves the old Style and dirty state unchanged", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({ flexGrow: 2 });
  tree.computeLayout({
    root: node,
    availableSpace: {
      width: AvailableSpace.MaxContent,
      height: AvailableSpace.MaxContent,
    },
  });
  const before = tree.getStyle(node);
  const dirtyBefore = tree.isDirty(node);

  assert.throws(() => tree.setStyle(node, { flexGrow: 3, display: 255 as never }), RangeError);
  assert.deepEqual(tree.getStyle(node), before);
  assert.equal(tree.isDirty(node), dirtyBefore);
});
