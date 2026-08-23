import assert from "node:assert/strict";
import { Dimension, Display, TaffyTree, TrackSizingFunction } from "@taffyjs/node";
import { test } from "vite-plus/test";

const STYLE_FIELDS = [
  "display",
  "itemIsTable",
  "itemIsReplaced",
  "boxSizing",
  "direction",
  "overflow",
  "scrollbarWidth",
  "contain",
  "float",
  "clear",
  "position",
  "inset",
  "size",
  "minSize",
  "maxSize",
  "aspectRatio",
  "margin",
  "padding",
  "border",
  "alignItems",
  "alignSelf",
  "justifyItems",
  "justifySelf",
  "alignContent",
  "justifyContent",
  "gap",
  "textAlign",
  "flexDirection",
  "flexWrap",
  "flexBasis",
  "flexGrow",
  "flexShrink",
  "gridTemplateRows",
  "gridTemplateColumns",
  "gridAutoRows",
  "gridAutoColumns",
  "gridAutoFlow",
  "gridTemplateAreas",
  "gridTemplateColumnNames",
  "gridTemplateRowNames",
  "gridRow",
  "gridColumn",
];

test("exact-keys", () => {
  const tree = new TaffyTree();
  const defaults = tree.getStyle(tree.newLeaf());
  const changed = tree.getStyle(tree.newLeaf({ display: Display.Grid, flexGrow: 2 }));

  assert.deepEqual(Object.keys(defaults), STYLE_FIELDS);
  assert.deepEqual(Object.keys(changed), STYLE_FIELDS);
});

test("null-output", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    aspectRatio: null,
    alignItems: null,
    alignSelf: null,
    justifyItems: null,
    justifySelf: null,
    alignContent: null,
    justifyContent: null,
    gridTemplateAreas: null,
  });
  const style = tree.getStyle(node);

  for (const field of [
    "aspectRatio",
    "alignItems",
    "alignSelf",
    "justifyItems",
    "justifySelf",
    "alignContent",
    "justifyContent",
    "gridTemplateAreas",
  ] as const) {
    assert.equal(style[field], null, field);
  }
});

test("stored-f32", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    scrollbarWidth: 0.1,
    flexGrow: -0,
    flexShrink: Number.POSITIVE_INFINITY,
    size: { width: Dimension.Percent(1e39) },
  });
  const style = tree.getStyle(node);

  assert.equal(style.scrollbarWidth, Math.fround(0.1));
  assert.equal(Object.is(style.flexGrow, -0), true);
  assert.equal(style.flexShrink, Number.POSITIVE_INFINITY);
  assert.equal(
    (style.size as { width: { value: number } }).width.value,
    Math.fround(1e39 / 100) * 100,
  );
});

test("deep-detached", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({
    size: { width: 10 },
    gridTemplateRowNames: [["start"], ["end"]],
    gridAutoRows: [TrackSizingFunction.Fr(2)],
  });
  const first = tree.getStyle(node);

  assert.equal(Object.isFrozen(first), false);
  (first.size as { width: { value: number } }).width.value = 90;
  (first.gridTemplateRowNames as string[][])[0][0] = "changed";
  (first.gridAutoRows as unknown[]).push(TrackSizingFunction.Auto);

  const second = tree.getStyle(node);
  assert.deepEqual((second.size as { width: unknown }).width, Dimension.Length(10));
  assert.deepEqual(second.gridTemplateRowNames, [["start"], ["end"]]);
  assert.deepEqual(second.gridAutoRows, [TrackSizingFunction.Fr(2)]);
});

test("independent-snapshots", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf({ gridTemplateRowNames: [["row"]] });
  const first = tree.getStyle(node);
  const second = tree.getStyle(node);

  assert.deepEqual(first, second);
  assert.notEqual(first, second);
  assert.notEqual(first.size, second.size);
  assert.notEqual(first.gridTemplateRowNames, second.gridTemplateRowNames);
  assert.notEqual(
    (first.gridTemplateRowNames as unknown[])[0],
    (second.gridTemplateRowNames as unknown[])[0],
  );
});
