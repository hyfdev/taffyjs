import assert from "node:assert/strict";
import {
  AvailableSpace,
  Dimension,
  Display,
  GridPlacement,
  GridTemplateComponent,
  RepetitionCount,
  TaffyTree,
  TrackSizingFunction,
  type NodeId,
  type StyleInput,
} from "@taffyjs/node";
import { test } from "vite-plus/test";

function maxContentSpace() {
  return { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent };
}

function reentrantStyle(run: () => void, flexGrow: number): StyleInput {
  let entered = false;
  return {
    get flexGrow() {
      if (!entered) {
        entered = true;
        run();
      }
      return flexGrow;
    },
    gridTemplateRowNames: [["oversized-".repeat(512)]],
  };
}

test("Grid, strings, tagged unions, and oversized values round-trip", () => {
  const tree = new TaffyTree();
  const text = "列-😀-é";
  const replacementText = "\ud800";
  const track = TrackSizingFunction.MinMax(
    { kind: 1, value: 25 },
    { kind: 5, value: Dimension.Percent(50) },
  );
  const repeated = GridTemplateComponent.Repeat(
    RepetitionCount.Count(2),
    [TrackSizingFunction.Length(12), TrackSizingFunction.Fr(1)],
    [["start"], [text], ["end"]],
  );
  const node = tree.newLeaf({
    display: Display.Grid,
    gridTemplateRows: [GridTemplateComponent.Single(track), repeated],
    gridTemplateColumns: [GridTemplateComponent.Single(TrackSizingFunction.Auto)],
    gridAutoRows: [TrackSizingFunction.FitContent(Dimension.Percent(40))],
    gridAutoColumns: [TrackSizingFunction.MaxContent],
    gridTemplateAreas: {
      areas: [{ name: text, rowStart: 0, rowEnd: 1, columnStart: 0, columnEnd: 1 }],
      rowCount: 1,
      columnCount: 1,
    },
    gridTemplateColumnNames: [[text, replacementText]],
    gridTemplateRowNames: [["large".repeat(1024)]],
    gridRow: {
      start: GridPlacement.NamedLine(text, -2),
      end: GridPlacement.NamedSpan(text, 3),
    },
    gridColumn: { start: GridPlacement.Line(-32_768), end: GridPlacement.Span(65_535) },
  });
  const style = tree.getStyle(node);

  assert.deepEqual(style.gridTemplateRows, [GridTemplateComponent.Single(track), repeated]);
  assert.equal(style.gridAutoRows[0]?.max.kind, 5);
  assert.deepEqual(style.gridAutoRows[0]?.max.value, {
    unit: 1,
    value: Math.fround(40 / 100) * 100,
  });
  assert.equal(style.gridTemplateAreas?.areas[0]?.name, text);
  assert.deepEqual(style.gridTemplateColumnNames, [[text, "�"]]);
  assert.deepEqual(style.gridRow, {
    start: GridPlacement.NamedLine(text, -2),
    end: GridPlacement.NamedSpan(text, 3),
  });
  assert.deepEqual(style.gridColumn, {
    start: GridPlacement.Line(-32_768),
    end: GridPlacement.Span(65_535),
  });
  assert.deepEqual(style.gridTemplateRowNames, [["large".repeat(1024)]]);
});

test("known Proxy properties are read once and unknown properties are ignored", () => {
  const tree = new TaffyTree();
  const reads = new Map<PropertyKey, number>();
  const target = {
    flexGrow: 3,
    get unknownField(): never {
      throw new Error("unknown getter must not run");
    },
  };
  const style = new Proxy(target, {
    get(object, property, receiver) {
      reads.set(property, (reads.get(property) ?? 0) + 1);
      return Reflect.get(object, property, receiver);
    },
    ownKeys() {
      throw new Error("unknown-field filtering must not enumerate the Style object");
    },
  });

  const node = tree.newLeaf(style as never);
  assert.equal(tree.getStyle(node).flexGrow, 3);
  assert.equal(reads.get("flexGrow"), 1);
  assert.equal(reads.has("unknownField"), false);
});

test("all five Style operations isolate recursive calls and oversized storage", () => {
  const tree = new TaffyTree<{ label: string }>();
  const nested: NodeId[] = [];

  const leaf = tree.newLeaf(reentrantStyle(() => nested.push(tree.newLeaf({ flexGrow: 11 })), 1));
  const context = { label: "outer" };
  const contextual = tree.newLeafWithContext(
    context,
    reentrantStyle(() => nested.push(tree.newLeaf({ flexGrow: 12 })), 2),
  );
  const child = tree.newLeaf();
  const parent = tree.newWithChildren(
    [child],
    reentrantStyle(() => nested.push(tree.newLeaf({ flexGrow: 13 })), 3),
  );
  const setTarget = tree.newLeaf({ flexGrow: 20 });
  const setNestedTarget = tree.newLeaf();
  tree.setStyle(
    setTarget,
    reentrantStyle(() => tree.setStyle(setNestedTarget, { flexGrow: 14 }), 4),
  );
  const updateTarget = tree.newLeaf({ flexGrow: 21 });
  const updateNestedTarget = tree.newLeaf();
  tree.updateStyle(
    updateTarget,
    reentrantStyle(() => tree.updateStyle(updateNestedTarget, { flexGrow: 15 }), 5),
  );

  assert.equal(tree.getStyle(leaf).flexGrow, 1);
  assert.equal(tree.getStyle(contextual).flexGrow, 2);
  assert.equal(tree.getNodeContext(contextual), context);
  assert.equal(tree.getStyle(parent).flexGrow, 3);
  assert.deepEqual(tree.getChildren(parent), [child]);
  assert.equal(tree.getStyle(setTarget).flexGrow, 4);
  assert.equal(tree.getStyle(setNestedTarget).flexGrow, 14);
  assert.equal(tree.getStyle(updateTarget).flexGrow, 5);
  assert.equal(tree.getStyle(updateNestedTarget).flexGrow, 15);
  assert.deepEqual(
    nested.map((node) => tree.getStyle(node).flexGrow),
    [11, 12, 13],
  );
  for (const node of [leaf, contextual, parent, setTarget, updateTarget]) {
    assert.deepEqual(tree.getStyle(node).gridTemplateRowNames, [["oversized-".repeat(512)]]);
  }
});

test("NodeId representation is checked before Style getters", () => {
  const tree = new TaffyTree();
  let getterCalls = 0;
  const style = {
    get display(): never {
      getterCalls += 1;
      throw new Error("Style getter should not run");
    },
  };

  assert.throws(() => tree.setStyle(-1n as never, style), TypeError);
  assert.throws(() => tree.updateStyle((1n << 64n) as never, style), TypeError);
  assert.throws(() => tree.newWithChildren([1 as never], style), TypeError);
  assert.equal(getterCalls, 0);
});

test("NaN and signed zero retain bitwise update behavior", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    flexGrow: Number.NaN,
    scrollbarWidth: 0,
    size: { width: Number.NaN, height: 0 },
  });
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });

  tree.updateStyle(node, { flexGrow: Number.NaN, size: { width: Number.NaN } });
  assert.equal(tree.isDirty(node), false);

  tree.updateStyle(node, { scrollbarWidth: -0, size: { height: -0 } });
  assert.equal(tree.isDirty(node), true);
  const style = tree.getStyle(node);
  assert.equal(Object.is(style.scrollbarWidth, -0), true);
  assert.equal(style.size.height.unit, 0);
  assert.ok("value" in style.size.height);
  assert.equal(Object.is(style.size.height.value, -0), true);

  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  tree.updateStyle(node, { scrollbarWidth: -0, size: { height: -0 } });
  assert.equal(tree.isDirty(node), false);
});

test("unknown fields are ignored by newWithChildren", () => {
  const tree = new TaffyTree();
  const child = tree.newLeaf();
  const parent = tree.newWithChildren([child], { flexGrow: 2, unknownField: true } as never);

  assert.equal(tree.getStyle(parent).flexGrow, 2);
  assert.deepEqual(tree.getChildren(parent), [child]);
});
