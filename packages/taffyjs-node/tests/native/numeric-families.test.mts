import assert from "node:assert/strict";
import * as native from "../../native.js";
import * as publicApi from "../../src/index.ts";
import { test } from "vite-plus/test";

const numericFamilies = {
  Display: ["Block", "FlowRoot", "Flex", "Grid", "None"],
  BoxSizing: ["BorderBox", "ContentBox"],
  Direction: ["Ltr", "Rtl"],
  Overflow: ["Visible", "Clip", "Hidden", "Scroll"],
  Float: ["Left", "Right", "None"],
  Clear: ["Left", "Right", "Both", "None"],
  Position: ["Relative", "Absolute"],
  TextAlign: ["Auto", "LegacyLeft", "LegacyRight", "LegacyCenter"],
  FlexDirection: ["Row", "Column", "RowReverse", "ColumnReverse"],
  FlexWrap: ["NoWrap", "Wrap", "WrapReverse"],
  GridAutoFlow: ["Row", "Column", "RowDense", "ColumnDense"],
  AlignItems: [
    "Start",
    "End",
    "FlexStart",
    "FlexEnd",
    "SelfStart",
    "SelfEnd",
    "Center",
    "Baseline",
    "Stretch",
    "SafeStart",
    "SafeEnd",
    "SafeFlexStart",
    "SafeFlexEnd",
    "SafeSelfStart",
    "SafeSelfEnd",
    "SafeCenter",
  ],
  AlignContent: [
    "Start",
    "End",
    "FlexStart",
    "FlexEnd",
    "Center",
    "Stretch",
    "SpaceBetween",
    "SpaceEvenly",
    "SpaceAround",
    "SafeStart",
    "SafeEnd",
    "SafeFlexStart",
    "SafeFlexEnd",
    "SafeCenter",
  ],
  LengthUnit: ["Length", "Percent", "Auto"],
  AvailableSpaceKind: ["Definite", "MinContent", "MaxContent"],
  GridPlacementKind: ["Auto", "Line", "NamedLine", "Span", "NamedSpan"],
  TrackSizingKind: ["Length", "Percent", "Auto", "MinContent", "MaxContent", "FitContent", "Fr"],
  RepetitionCountKind: ["Count", "AutoFill", "AutoFit"],
  GridTemplateComponentKind: ["Single", "Repeat"],
  DetailedLayoutInfoKind: ["None", "Grid"],
} as const;

type NativeTaffyTree = {
  rawGetStyle(node: bigint, publicMethod: string): { display: number };
  rawNewLeaf(style: object, publicMethod: string): bigint;
  rawNodeCount(publicMethod: string): number;
};
type NativeTaffyTreeConstructor = new () => NativeTaffyTree;

const NativeTaffyTree = Reflect.get(native, "NativeTaffyTree") as NativeTaffyTreeConstructor;

test("numeric values are stable", () => {
  for (const [family, members] of Object.entries(numericFamilies)) {
    assert.deepEqual(
      Reflect.get(publicApi, family),
      Object.fromEntries(members.map((member, index) => [member, index])),
      family,
    );
  }
});

test("numeric families are frozen", () => {
  for (const family of Object.keys(numericFamilies)) {
    const value = Reflect.get(publicApi, family);
    assert.equal(typeof value, "object", `${family} is exported`);
    assert.notEqual(value, null, `${family} is exported`);
    assert.equal(Object.isFrozen(value), true, family);
  }
});

test("native input accepts a numeric literal", () => {
  const owner = new NativeTaffyTree();
  const node = owner.rawNewLeaf({ display: 0 }, "newLeaf");
  assert.equal(owner.rawGetStyle(node, "getStyle").display, 0);
});

test("native input rejects an invalid numeric value atomically", () => {
  const owner = new NativeTaffyTree();
  const before = owner.rawNodeCount("getNodeCount");
  assert.throws(() => owner.rawNewLeaf({ display: 255 }, "newLeaf"), RangeError);
  assert.equal(owner.rawNodeCount("getNodeCount"), before);
});
