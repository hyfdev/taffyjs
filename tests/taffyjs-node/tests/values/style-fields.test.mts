import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type StyleRecord = Record<string, unknown>;
type Layout = {
  location: { x: number; y: number };
  size: { width: number; height: number };
  contentSize: { width: number; height: number };
  scrollbarSize: { width: number; height: number };
  border: { left: number; right: number; top: number; bottom: number };
  padding: { left: number; right: number; top: number; bottom: number };
  margin: { left: number; right: number; top: number; bottom: number };
};
type MeasureArgs = { style: StyleRecord };
type Tree = {
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  computeLayoutWithMeasure(options: {
    root: bigint;
    availableSpace: object;
    measure(args: MeasureArgs): { width: number; height: number };
  }): void;
  getStyle(node: bigint): StyleRecord;
  getUnroundedLayout(node: bigint): Layout;
  isDirty(node: bigint): boolean;
  newLeaf(style: StyleRecord): bigint;
  newLeafWithContext(style: StyleRecord, context: unknown): bigint;
  newWithChildren(style: StyleRecord, children: readonly bigint[]): bigint;
  setStyle(node: bigint, style: StyleRecord): void;
};
type TreeConstructor = new () => Tree;
type NativeCase = { input: unknown; expected: unknown };
type StyleSpec = {
  field: string;
  defaultValue(): unknown;
  sample(): NativeCase;
  invalidValue(): unknown;
  nativeCases?(): NativeCase[];
  enumMembers?: readonly number[];
  enumInput?(value: number): unknown;
  enumExpected?(value: number): unknown;
};

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  return value as unknown as TreeConstructor;
}

function length(value: number) {
  return { unit: api.LengthUnit.Length, value };
}

function percent(value: number) {
  return { unit: api.LengthUnit.Percent, value };
}

function storedPercent(value: number) {
  return { unit: api.LengthUnit.Percent, value: Math.fround(value / 100) * 100 };
}

function auto() {
  return { unit: api.LengthUnit.Auto };
}

function rect(value: unknown) {
  return { left: value, right: value, top: value, bottom: value };
}

function size(value: unknown) {
  return { width: value, height: value };
}

function placementAuto() {
  return { kind: api.GridPlacementKind.Auto };
}

function line(start: unknown = placementAuto(), end: unknown = placementAuto()) {
  return { start, end };
}

function fixedTrack(value: number) {
  return {
    min: { kind: api.TrackSizingKind.Length, value },
    max: { kind: api.TrackSizingKind.Length, value },
  };
}

function singleTrack(value: number) {
  return { kind: api.GridTemplateComponentKind.Single, value: fixedTrack(value) };
}

function repeatTrack(count: unknown) {
  return {
    kind: api.GridTemplateComponentKind.Repeat,
    value: {
      count,
      tracks: [fixedTrack(10)],
      lineNames: [["start"], ["end"]],
    },
  };
}

function finiteSpace(width: number, height: number) {
  return {
    width: api.AvailableSpace.Definite(width),
    height: api.AvailableSpace.Definite(height),
  };
}

function maxContentSpace() {
  return {
    width: api.AvailableSpace.MaxContent,
    height: api.AvailableSpace.MaxContent,
  };
}

function computeLeaf(style: StyleRecord): Layout {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf(style);
  tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
  return tree.getUnroundedLayout(node);
}

function computeChildren(
  parentStyle: StyleRecord,
  childStyles: readonly StyleRecord[],
  availableSpace: object = finiteSpace(100, 100),
): Layout[] {
  const tree = new (TaffyTree())();
  const children = childStyles.map((style) => tree.newLeaf(style));
  const root = tree.newWithChildren(parentStyle, children);
  tree.computeLayout({ root, availableSpace });
  return children.map((child) => tree.getUnroundedLayout(child));
}

function tableBlockChildLayout(value: boolean): Layout {
  const tree = new (TaffyTree())();
  const grandchild = tree.newLeaf({
    display: api.Display.Block,
    size: { width: length(10), height: length(10) },
    margin: { top: length(20) },
  });
  const child = tree.newWithChildren({ display: api.Display.Block, itemIsTable: value }, [
    grandchild,
  ]);
  const root = tree.newWithChildren(
    {
      display: api.Display.Block,
      size: { width: length(100) },
      padding: { top: length(1) },
    },
    [child],
  );
  tree.computeLayout({
    root,
    availableSpace: {
      width: api.AvailableSpace.Definite(100),
      height: api.AvailableSpace.MaxContent,
    },
  });
  return tree.getUnroundedLayout(child);
}

function replacedGridChildLayout(value: boolean): Layout {
  const tree = new (TaffyTree())();
  const child = tree.newLeafWithContext(
    {
      itemIsReplaced: value,
      maxSize: { width: percent(50) },
    },
    "measured",
  );
  const root = tree.newWithChildren(
    {
      display: api.Display.Grid,
      size: { width: length(40) },
      gridTemplateRows: [api.GridTemplateComponent.Single(api.TrackSizingFunction.Auto)],
      gridTemplateColumns: [api.GridTemplateComponent.Single(api.TrackSizingFunction.Auto)],
    },
    [child],
  );
  tree.computeLayoutWithMeasure({
    root,
    availableSpace: {
      width: api.AvailableSpace.Definite(40),
      height: api.AvailableSpace.MaxContent,
    },
    measure: () => ({ width: 100, height: 10 }),
  });
  return tree.getUnroundedLayout(child);
}

function gridChild(parentStyle: StyleRecord, childStyle: StyleRecord): Layout {
  const tree = new (TaffyTree())();
  const child = tree.newLeaf(childStyle);
  const root = tree.newWithChildren(
    {
      display: api.Display.Grid,
      gridTemplateRows: [singleTrack(10), singleTrack(15)],
      gridTemplateColumns: [singleTrack(20), singleTrack(30)],
      ...parentStyle,
    },
    [child],
  );
  tree.computeLayout({ root, availableSpace: finiteSpace(50, 25) });
  return tree.getUnroundedLayout(child);
}

function assertNamedGridLineSemantics(axis: "column" | "row"): void {
  const namesField = axis === "column" ? "gridTemplateColumnNames" : "gridTemplateRowNames";
  const placementField = axis === "column" ? "gridColumn" : "gridRow";
  const templateField = axis === "column" ? "gridTemplateColumns" : "gridTemplateRows";
  const coordinate = axis === "column" ? "x" : "y";
  const unicodeName = axis === "column" ? "列-😀-é" : "行-😀-é";
  const inputNames = [[], [unicodeName, "\ud800"], []];
  const tree = new (TaffyTree())();
  const child = tree.newLeaf({
    [placementField]: {
      start: api.GridPlacement.NamedLine(unicodeName, 1),
      end: api.GridPlacement.Span(1),
    },
  });
  const root = tree.newWithChildren(
    {
      display: api.Display.Grid,
      gridTemplateRows: [singleTrack(10), singleTrack(15)],
      gridTemplateColumns: [singleTrack(20), singleTrack(30)],
      [namesField]: inputNames,
    },
    [child],
  );
  inputNames[1][0] = "changed";
  inputNames[1][1] = "changed";
  tree.computeLayout({ root, availableSpace: finiteSpace(50, 25) });

  const expectedNames = [[], [unicodeName, "\ufffd"], []];
  const firstNames = tree.getStyle(root)[namesField] as string[][];
  assert.deepEqual(firstNames, expectedNames);
  firstNames[1][0] = "output";
  assert.deepEqual(tree.getStyle(root)[namesField], expectedNames);
  assert.equal(tree.getUnroundedLayout(child).location[coordinate], axis === "column" ? 20 : 10);

  const unsafeRepeat = {
    kind: api.GridTemplateComponentKind.Repeat,
    value: {
      count: api.RepetitionCount.Count(1),
      tracks: [fixedTrack(10)],
      lineNames: [],
    },
  };
  const underflowTree = new (TaffyTree())();
  assertExactError(
    () => underflowTree.newLeaf({ [templateField]: [unsafeRepeat], [namesField]: [[]] }),
    RangeError,
    `${namesField} underflow uses the fixed uncoded RangeError`,
  );
}

function assertGridPlacementIntegerBoundaries(field: "gridRow" | "gridColumn"): void {
  const tree = new (TaffyTree())();
  const cases = [
    line(api.GridPlacement.Line(-32768), api.GridPlacement.Line(32767)),
    line(
      api.GridPlacement.NamedLine("minimum", -32768),
      api.GridPlacement.NamedLine("maximum", 32767),
    ),
    line(api.GridPlacement.Span(0), api.GridPlacement.Span(65535)),
    line(api.GridPlacement.NamedSpan("zero", 0), api.GridPlacement.NamedSpan("maximum", 65535)),
  ];
  for (const value of cases) {
    const node = tree.newLeaf({ [field]: value });
    assert.deepEqual(tree.getStyle(node)[field], value);
  }

  for (const placement of [
    api.GridPlacement.Line(-32769),
    api.GridPlacement.Line(32768),
    api.GridPlacement.NamedLine("outside", -32769),
    api.GridPlacement.NamedLine("outside", 32768),
    api.GridPlacement.Span(-1),
    api.GridPlacement.Span(65536),
    api.GridPlacement.NamedSpan("outside", 65536),
  ]) {
    assertExactError(
      () => tree.newLeaf({ [field]: { start: placement } }),
      RangeError,
      `${field} integer boundary uses the fixed uncoded RangeError`,
    );
  }
}

function assertTemplateComponentSemantics(axis: "column" | "row"): void {
  const templateField = axis === "column" ? "gridTemplateColumns" : "gridTemplateRows";
  const coordinate = axis === "column" ? "x" : "y";
  const extent = axis === "column" ? "width" : "height";
  const single = singleTrack(20);
  const repeat = repeatTrack(api.RepetitionCount.Count(2));
  const components = [single, repeat];
  const tree = new (TaffyTree())();
  const children = [{}, {}, {}].map((style) => tree.newLeaf(style));
  const root = tree.newWithChildren(
    {
      display: api.Display.Grid,
      gridTemplateRows: [singleTrack(100)],
      gridTemplateColumns: [singleTrack(100)],
      [templateField]: components,
    },
    children,
  );

  single.value.min.value = 99;
  repeat.value.tracks[0].min.value = 99;
  repeat.value.lineNames[0][0] = "changed";
  const expectedComponents = [singleTrack(20), repeatTrack(api.RepetitionCount.Count(2))];
  assert.deepEqual(tree.getStyle(root)[templateField], expectedComponents);

  tree.computeLayout({ root, availableSpace: finiteSpace(100, 100) });
  assert.deepEqual(
    children.map((child) => {
      const layout = tree.getUnroundedLayout(child);
      return [layout.location[coordinate], layout.size[extent]];
    }),
    [
      [0, 20],
      [20, 10],
      [30, 10],
    ],
  );

  const firstOutput = tree.getStyle(root)[templateField] as Array<{
    value: { lineNames?: string[][] };
  }>;
  firstOutput[1].value.lineNames?.[0].splice(0, 1, "output");
  assert.deepEqual(tree.getStyle(root)[templateField], expectedComponents);
}

function assertTemplateAreaIntegerBoundaries(): void {
  const tree = new (TaffyTree())();
  const maximum = {
    areas: [
      {
        name: "maximum",
        rowStart: 65535,
        rowEnd: 65535,
        columnStart: 65535,
        columnEnd: 65535,
      },
    ],
    rowCount: 65535,
    columnCount: 65535,
  };
  const maximumNode = tree.newLeaf({ gridTemplateAreas: maximum });
  assert.deepEqual(tree.getStyle(maximumNode).gridTemplateAreas, maximum);

  const areaFields = ["rowStart", "rowEnd", "columnStart", "columnEnd"] as const;
  const countFields = ["rowCount", "columnCount"] as const;
  for (const value of [-1, 65536, 0.5]) {
    for (const field of areaFields) {
      assertExactError(
        () =>
          tree.newLeaf({
            gridTemplateAreas: {
              areas: [{ ...maximum.areas[0], [field]: value }],
              rowCount: 1,
              columnCount: 1,
            },
          }),
        RangeError,
        `gridTemplateAreas.${field} boundary uses the fixed uncoded RangeError`,
      );
    }
    for (const field of countFields) {
      assertExactError(
        () =>
          tree.newLeaf({
            gridTemplateAreas: { areas: [], rowCount: 1, columnCount: 1, [field]: value },
          }),
        RangeError,
        `gridTemplateAreas.${field} boundary uses the fixed uncoded RangeError`,
      );
    }
  }
}

function scalarEnumSpec(
  field: string,
  defaultValue: number | null,
  sampleValue: number,
  members: readonly number[],
): StyleSpec {
  return {
    field,
    defaultValue: () => defaultValue,
    sample: () => ({ input: sampleValue, expected: sampleValue }),
    invalidValue: () => 255,
    enumMembers: members,
  };
}

const trackCases = (): NativeCase[] => [
  { input: api.TrackSizingFunction.Length(10), expected: fixedTrack(10) },
  {
    input: api.TrackSizingFunction.Percent(25),
    expected: {
      min: { kind: api.TrackSizingKind.Percent, value: 25 },
      max: { kind: api.TrackSizingKind.Percent, value: 25 },
    },
  },
  { input: api.TrackSizingFunction.Auto, expected: api.TrackSizingFunction.Auto },
  { input: api.TrackSizingFunction.MinContent, expected: api.TrackSizingFunction.MinContent },
  { input: api.TrackSizingFunction.MaxContent, expected: api.TrackSizingFunction.MaxContent },
  {
    input: api.TrackSizingFunction.FitContent(length(40)),
    expected: {
      min: { kind: api.TrackSizingKind.Auto },
      max: { kind: api.TrackSizingKind.FitContent, value: length(40) },
    },
  },
  {
    input: api.TrackSizingFunction.Fr(2),
    expected: {
      min: { kind: api.TrackSizingKind.Auto },
      max: { kind: api.TrackSizingKind.Fr, value: 2 },
    },
  },
];

const placementCases = (): NativeCase[] => {
  const placements = [
    api.GridPlacement.Auto,
    api.GridPlacement.Line(2),
    api.GridPlacement.NamedLine("line", 1),
    api.GridPlacement.Span(2),
    api.GridPlacement.NamedSpan("line", 2),
  ];
  return placements.flatMap((placement) => [
    { input: { start: placement }, expected: line(placement) },
    { input: { end: placement }, expected: line(placementAuto(), placement) },
  ]);
};

const styleSpecs: readonly StyleSpec[] = [
  scalarEnumSpec("display", api.Display.Flex, api.Display.Block, Object.values(api.Display)),
  {
    field: "itemIsTable",
    defaultValue: () => false,
    sample: () => ({ input: true, expected: true }),
    invalidValue: () => 1,
  },
  {
    field: "itemIsReplaced",
    defaultValue: () => false,
    sample: () => ({ input: true, expected: true }),
    invalidValue: () => 1,
  },
  scalarEnumSpec(
    "boxSizing",
    api.BoxSizing.BorderBox,
    api.BoxSizing.ContentBox,
    Object.values(api.BoxSizing),
  ),
  scalarEnumSpec("direction", api.Direction.Ltr, api.Direction.Rtl, Object.values(api.Direction)),
  {
    field: "overflow",
    defaultValue: () => ({ x: api.Overflow.Visible, y: api.Overflow.Visible }),
    sample: () => ({
      input: { x: api.Overflow.Scroll, y: api.Overflow.Hidden },
      expected: { x: api.Overflow.Scroll, y: api.Overflow.Hidden },
    }),
    invalidValue: () => ({ x: 255 }),
    enumMembers: Object.values(api.Overflow),
    enumInput: (value) => ({ x: value, y: value }),
    enumExpected: (value) => ({ x: value, y: value }),
    nativeCases: () => [
      {
        input: { y: api.Overflow.Hidden },
        expected: { x: api.Overflow.Visible, y: api.Overflow.Hidden },
      },
    ],
  },
  {
    field: "scrollbarWidth",
    defaultValue: () => 0,
    sample: () => ({ input: 7.25, expected: Math.fround(7.25) }),
    invalidValue: () => "7",
    nativeCases: () =>
      [-1.25, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].map((value) => ({
        input: value,
        expected: Math.fround(value),
      })),
  },
  scalarEnumSpec("float", api.Float.None, api.Float.Left, Object.values(api.Float)),
  scalarEnumSpec("clear", api.Clear.None, api.Clear.Both, Object.values(api.Clear)),
  scalarEnumSpec(
    "position",
    api.Position.Relative,
    api.Position.Absolute,
    Object.values(api.Position),
  ),
  {
    field: "inset",
    defaultValue: () => rect(auto()),
    sample: () => ({ input: length(4), expected: rect(length(4)) }),
    invalidValue: () => ({ left: { unit: 255 } }),
    nativeCases: () => [
      { input: percent(25), expected: rect(storedPercent(25)) },
      {
        input: { left: length(5), top: percent(10) },
        expected: { left: length(5), right: auto(), top: storedPercent(10), bottom: auto() },
      },
    ],
  },
  {
    field: "size",
    defaultValue: () => size(auto()),
    sample: () => ({ input: length(40), expected: size(length(40)) }),
    invalidValue: () => ({ width: { unit: 255 } }),
    nativeCases: () => [
      { input: percent(25), expected: size(storedPercent(25)) },
      { input: { width: length(30) }, expected: { width: length(30), height: auto() } },
    ],
  },
  {
    field: "minSize",
    defaultValue: () => size(auto()),
    sample: () => ({ input: length(30), expected: size(length(30)) }),
    invalidValue: () => ({ width: { unit: 255 } }),
    nativeCases: () => [
      { input: percent(25), expected: size(storedPercent(25)) },
      { input: { height: length(20) }, expected: { width: auto(), height: length(20) } },
    ],
  },
  {
    field: "maxSize",
    defaultValue: () => size(auto()),
    sample: () => ({ input: length(40), expected: size(length(40)) }),
    invalidValue: () => ({ width: { unit: 255 } }),
    nativeCases: () => [
      { input: percent(75), expected: size(storedPercent(75)) },
      { input: { width: length(50) }, expected: { width: length(50), height: auto() } },
    ],
  },
  {
    field: "aspectRatio",
    defaultValue: () => null,
    sample: () => ({ input: 2, expected: 2 }),
    invalidValue: () => "2",
    nativeCases: () => [
      { input: null, expected: null },
      { input: Number.NaN, expected: Number.NaN },
    ],
  },
  {
    field: "margin",
    defaultValue: () => rect(length(0)),
    sample: () => ({ input: auto(), expected: rect(auto()) }),
    invalidValue: () => ({ left: { unit: 255 } }),
    nativeCases: () => [
      { input: length(8), expected: rect(length(8)) },
      {
        input: { left: percent(10), top: auto() },
        expected: {
          left: storedPercent(10),
          right: length(0),
          top: auto(),
          bottom: length(0),
        },
      },
    ],
  },
  {
    field: "padding",
    defaultValue: () => rect(length(0)),
    sample: () => ({ input: length(6), expected: rect(length(6)) }),
    invalidValue: () => auto(),
    nativeCases: () => [
      { input: percent(10), expected: rect(storedPercent(10)) },
      {
        input: { left: length(3), bottom: percent(5) },
        expected: {
          left: length(3),
          right: length(0),
          top: length(0),
          bottom: storedPercent(5),
        },
      },
    ],
  },
  {
    field: "border",
    defaultValue: () => rect(length(0)),
    sample: () => ({ input: length(4), expected: rect(length(4)) }),
    invalidValue: () => auto(),
    nativeCases: () => [
      { input: percent(10), expected: rect(storedPercent(10)) },
      {
        input: { right: length(3), top: percent(5) },
        expected: {
          left: length(0),
          right: length(3),
          top: storedPercent(5),
          bottom: length(0),
        },
      },
    ],
  },
  scalarEnumSpec("alignItems", null, api.AlignItems.SafeCenter, Object.values(api.AlignItems)),
  scalarEnumSpec("alignSelf", null, api.AlignItems.End, Object.values(api.AlignItems)),
  scalarEnumSpec("justifyItems", null, api.AlignItems.Center, Object.values(api.AlignItems)),
  scalarEnumSpec("justifySelf", null, api.AlignItems.End, Object.values(api.AlignItems)),
  scalarEnumSpec(
    "alignContent",
    null,
    api.AlignContent.SpaceBetween,
    Object.values(api.AlignContent),
  ),
  scalarEnumSpec("justifyContent", null, api.AlignContent.End, Object.values(api.AlignContent)),
  {
    field: "gap",
    defaultValue: () => size(length(0)),
    sample: () => ({ input: length(5), expected: size(length(5)) }),
    invalidValue: () => auto(),
    nativeCases: () => [
      { input: percent(10), expected: size(storedPercent(10)) },
      {
        input: { width: length(3), height: percent(5) },
        expected: { width: length(3), height: storedPercent(5) },
      },
    ],
  },
  scalarEnumSpec(
    "textAlign",
    api.TextAlign.Auto,
    api.TextAlign.LegacyCenter,
    Object.values(api.TextAlign),
  ),
  scalarEnumSpec(
    "flexDirection",
    api.FlexDirection.Row,
    api.FlexDirection.Column,
    Object.values(api.FlexDirection),
  ),
  scalarEnumSpec("flexWrap", api.FlexWrap.NoWrap, api.FlexWrap.Wrap, Object.values(api.FlexWrap)),
  {
    field: "flexBasis",
    defaultValue: () => auto(),
    sample: () => ({ input: length(30), expected: length(30) }),
    invalidValue: () => ({ unit: 255 }),
    nativeCases: () => [
      { input: percent(25), expected: percent(25) },
      { input: auto(), expected: auto() },
    ],
  },
  {
    field: "flexGrow",
    defaultValue: () => 0,
    sample: () => ({ input: 2.5, expected: Math.fround(2.5) }),
    invalidValue: () => "2",
    nativeCases: () =>
      [-1.25, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].map((value) => ({
        input: value,
        expected: Math.fround(value),
      })),
  },
  {
    field: "flexShrink",
    defaultValue: () => 1,
    sample: () => ({ input: 0.25, expected: Math.fround(0.25) }),
    invalidValue: () => "1",
    nativeCases: () =>
      [-1.25, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].map((value) => ({
        input: value,
        expected: Math.fround(value),
      })),
  },
  {
    field: "gridTemplateRows",
    defaultValue: () => [],
    sample: () => ({ input: [singleTrack(20)], expected: [singleTrack(20)] }),
    invalidValue: () => "rows",
    nativeCases: () => [
      {
        input: [repeatTrack(api.RepetitionCount.Count(2))],
        expected: [repeatTrack(api.RepetitionCount.Count(2))],
      },
      {
        input: [repeatTrack(api.RepetitionCount.AutoFill)],
        expected: [repeatTrack(api.RepetitionCount.AutoFill)],
      },
      {
        input: [repeatTrack(api.RepetitionCount.AutoFit)],
        expected: [repeatTrack(api.RepetitionCount.AutoFit)],
      },
    ],
  },
  {
    field: "gridTemplateColumns",
    defaultValue: () => [],
    sample: () => ({ input: [singleTrack(20)], expected: [singleTrack(20)] }),
    invalidValue: () => "columns",
    nativeCases: () => [
      {
        input: [repeatTrack(api.RepetitionCount.Count(2))],
        expected: [repeatTrack(api.RepetitionCount.Count(2))],
      },
      {
        input: [repeatTrack(api.RepetitionCount.AutoFill)],
        expected: [repeatTrack(api.RepetitionCount.AutoFill)],
      },
      {
        input: [repeatTrack(api.RepetitionCount.AutoFit)],
        expected: [repeatTrack(api.RepetitionCount.AutoFit)],
      },
    ],
  },
  {
    field: "gridAutoRows",
    defaultValue: () => [],
    sample: () => ({ input: [fixedTrack(20)], expected: [fixedTrack(20)] }),
    invalidValue: () => "rows",
    nativeCases: () =>
      trackCases().map(({ input, expected }) => ({ input: [input], expected: [expected] })),
  },
  {
    field: "gridAutoColumns",
    defaultValue: () => [],
    sample: () => ({ input: [fixedTrack(20)], expected: [fixedTrack(20)] }),
    invalidValue: () => "columns",
    nativeCases: () =>
      trackCases().map(({ input, expected }) => ({ input: [input], expected: [expected] })),
  },
  scalarEnumSpec(
    "gridAutoFlow",
    api.GridAutoFlow.Row,
    api.GridAutoFlow.ColumnDense,
    Object.values(api.GridAutoFlow),
  ),
  {
    field: "gridTemplateAreas",
    defaultValue: () => null,
    sample: () => ({
      input: {
        areas: [{ name: "hero", rowStart: 1, rowEnd: 2, columnStart: 1, columnEnd: 2 }],
        rowCount: 1,
        columnCount: 1,
      },
      expected: {
        areas: [{ name: "hero", rowStart: 1, rowEnd: 2, columnStart: 1, columnEnd: 2 }],
        rowCount: 1,
        columnCount: 1,
      },
    }),
    invalidValue: () => ({ areas: "hero", rowCount: 1, columnCount: 1 }),
    nativeCases: () => [
      { input: null, expected: null },
      {
        input: { areas: [], rowCount: 0, columnCount: 0 },
        expected: { areas: [], rowCount: 0, columnCount: 0 },
      },
    ],
  },
  {
    field: "gridTemplateColumnNames",
    defaultValue: () => [],
    sample: () => ({ input: [["start"], ["end"]], expected: [["start"], ["end"]] }),
    invalidValue: () => "columns",
  },
  {
    field: "gridTemplateRowNames",
    defaultValue: () => [],
    sample: () => ({ input: [["start"], ["end"]], expected: [["start"], ["end"]] }),
    invalidValue: () => "rows",
  },
  {
    field: "gridRow",
    defaultValue: () => line(),
    sample: () => ({
      input: { start: api.GridPlacement.Line(2), end: api.GridPlacement.Span(1) },
      expected: line(api.GridPlacement.Line(2), api.GridPlacement.Span(1)),
    }),
    invalidValue: () => ({ start: { kind: 255 } }),
    nativeCases: placementCases,
  },
  {
    field: "gridColumn",
    defaultValue: () => line(),
    sample: () => ({
      input: { start: api.GridPlacement.Line(2), end: api.GridPlacement.Span(1) },
      expected: line(api.GridPlacement.Line(2), api.GridPlacement.Span(1)),
    }),
    invalidValue: () => ({ start: { kind: 255 } }),
    nativeCases: placementCases,
  },
];

const specsByField = new Map(styleSpecs.map((spec) => [spec.field, spec]));
const nullableFields = new Set([
  "aspectRatio",
  "alignItems",
  "alignSelf",
  "justifyItems",
  "justifySelf",
  "alignContent",
  "justifyContent",
  "gridTemplateAreas",
]);
const rangeErrorInvalidFields = new Set([
  "display",
  "boxSizing",
  "direction",
  "overflow",
  "float",
  "clear",
  "position",
  "inset",
  "size",
  "minSize",
  "maxSize",
  "margin",
  "alignItems",
  "alignSelf",
  "justifyItems",
  "justifySelf",
  "alignContent",
  "justifyContent",
  "textAlign",
  "flexDirection",
  "flexWrap",
  "flexBasis",
  "gridAutoFlow",
  "gridRow",
  "gridColumn",
]);

function assertExactError(
  body: () => unknown,
  ErrorClass: ErrorConstructor,
  message: string,
): void {
  assert.throws(body, (error: unknown) => {
    assert.ok(error instanceof Error, message);
    assert.equal(error.constructor, ErrorClass, message);
    assert.equal((error as Error & { code?: unknown }).code, undefined, message);
    return true;
  });
}

function nativeCases(spec: StyleSpec): NativeCase[] {
  const cases = [spec.sample(), ...(spec.nativeCases?.() ?? [])];
  if (spec.enumMembers) {
    cases.push(
      ...spec.enumMembers.map((value) => ({
        input: spec.enumInput?.(value) ?? value,
        expected: spec.enumExpected?.(value) ?? value,
      })),
    );
  }
  return cases;
}

function getSpec(field: string): StyleSpec {
  const spec = specsByField.get(field);
  assert.notEqual(spec, undefined, field);
  return spec as StyleSpec;
}

function assertUnfrozenDetached(first: unknown, second: unknown, path = "style"): void {
  if (first === null || typeof first !== "object") return;
  assert.notEqual(first, second, `${path} is a fresh value`);
  assert.equal(Object.isFrozen(first), false, `${path} is not frozen`);
  assert.deepEqual(Object.keys(first), Object.keys(second as object), `${path} keys`);
  for (const key of Object.keys(first)) {
    assertUnfrozenDetached(
      Reflect.get(first, key),
      Reflect.get(second as object, key),
      `${path}.${key}`,
    );
  }
}

function runStyleCase(field: string, suffix: string): void {
  const spec = getSpec(field);
  const Tree = TaffyTree();

  if (suffix === "default") {
    const tree = new Tree();
    const node = tree.newLeaf({});
    assert.deepEqual(tree.getStyle(node)[spec.field], spec.defaultValue());
    return;
  }

  if (suffix === "missing") {
    const tree = new Tree();
    const node = tree.newLeaf({ [spec.field]: spec.sample().input });
    const sentinel = spec.field === "flexGrow" ? { itemIsTable: true } : { flexGrow: 3 };
    tree.setStyle(node, sentinel);
    assert.deepEqual(tree.getStyle(node)[spec.field], spec.defaultValue());
    return;
  }

  if (suffix === "undefined") {
    const tree = new Tree();
    const node = tree.newLeaf({ [spec.field]: spec.sample().input });
    tree.setStyle(node, { [spec.field]: undefined });
    assert.deepEqual(tree.getStyle(node)[spec.field], spec.defaultValue());
    return;
  }

  if (suffix === "native") {
    const tree = new Tree();
    const node = tree.newLeaf({});
    for (const testCase of nativeCases(spec)) {
      tree.setStyle(node, { [spec.field]: testCase.input });
      assert.deepEqual(tree.getStyle(node)[spec.field], testCase.expected);
    }
    return;
  }

  if (suffix === "roundtrip") {
    const tree = new Tree();
    const node = tree.newLeaf({ [spec.field]: spec.sample().input });
    const first = tree.getStyle(node);
    assert.deepEqual(first[spec.field], spec.sample().expected);
    tree.setStyle(node, first);
    assert.deepEqual(tree.getStyle(node), first);
    return;
  }

  if (suffix === "invalid") {
    const tree = new Tree();
    const node = tree.newLeaf({});
    const ErrorClass = rangeErrorInvalidFields.has(spec.field) ? RangeError : TypeError;
    assertExactError(
      () => tree.setStyle(node, { [spec.field]: spec.invalidValue() }),
      ErrorClass,
      `${spec.field} invalid value`,
    );
    if (nullableFields.has(spec.field)) {
      tree.setStyle(node, { [spec.field]: null });
      assert.equal(tree.getStyle(node)[spec.field], null);
    } else {
      assertExactError(
        () => tree.setStyle(node, { [spec.field]: null }),
        TypeError,
        `${spec.field} null`,
      );
    }
    return;
  }

  if (suffix === "atomic") {
    const tree = new Tree();
    const node = tree.newLeaf({});
    tree.computeLayout({ root: node, availableSpace: maxContentSpace() });
    const beforeStyle = tree.getStyle(node);
    const beforeDirty = tree.isDirty(node);
    const sentinel = spec.field === "flexGrow" ? { itemIsTable: true } : { flexGrow: 7 };
    assertExactError(
      () => tree.setStyle(node, { ...sentinel, [spec.field]: spec.invalidValue() }),
      rangeErrorInvalidFields.has(spec.field) ? RangeError : TypeError,
      `${spec.field} invalid mutation`,
    );
    assert.deepEqual(tree.getStyle(node), beforeStyle);
    assert.equal(tree.isDirty(node), beforeDirty);
    return;
  }

  if (suffix === "semantic") {
    runSemanticCase(spec.field);
    return;
  }

  assert.fail(`Unknown style check: ${suffix}`);
}

// Every numeric layout expectation below is pinned to the exact Taffy 0.13.0 sources at:
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/block.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/float.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/flexbox.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/common/alignment.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/grid/mod.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/grid/alignment.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/grid/placement.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/grid/track_sizing.rs
// https://docs.rs/crate/taffy/0.13.0/source/src/compute/leaf.rs
function runSemanticCase(field: string): void {
  switch (field) {
    case "display": {
      const expected = new Map<
        number,
        { location: { x: number; y: number }; size?: { width: number; height: number } }
      >([
        [api.Display.Block, { location: { x: 0, y: 10 } }],
        [api.Display.FlowRoot, { location: { x: 0, y: 10 } }],
        [api.Display.Flex, { location: { x: 10, y: 0 } }],
        [api.Display.Grid, { location: { x: 0, y: 47.5 } }],
        [api.Display.None, { location: { x: 0, y: 0 }, size: { width: 0, height: 0 } }],
      ]);
      for (const display of Object.values(api.Display)) {
        const layouts = computeChildren(
          { display, size: { width: length(100), height: length(100) } },
          [
            { size: { width: length(10), height: length(10) } },
            { size: { width: length(20), height: length(15) } },
          ],
        );
        assert.deepEqual(layouts[1].location, expected.get(display)?.location, `${display}`);
        if (expected.get(display)?.size) {
          assert.deepEqual(layouts[1].size, expected.get(display)?.size, `${display}`);
        }
      }
      return;
    }
    case "itemIsTable": {
      const normal = tableBlockChildLayout(false);
      const table = tableBlockChildLayout(true);
      assert.deepEqual(
        { location: normal.location, size: normal.size },
        { location: { x: 0, y: 21 }, size: { width: 100, height: 10 } },
      );
      assert.deepEqual(
        { location: table.location, size: table.size },
        { location: { x: 0, y: 1 }, size: { width: 10, height: 30 } },
      );
      return;
    }
    case "itemIsReplaced": {
      const normal = replacedGridChildLayout(false);
      const replaced = replacedGridChildLayout(true);
      assert.deepEqual(normal.size, { width: 50, height: 10 });
      assert.deepEqual(replaced.size, { width: 20, height: 10 });
      return;
    }
    case "boxSizing":
      assert.deepEqual(
        computeLeaf({
          boxSizing: api.BoxSizing.BorderBox,
          size: { width: length(100), height: length(50) },
          padding: length(10),
        }).size,
        { width: 100, height: 50 },
      );
      assert.deepEqual(
        computeLeaf({
          boxSizing: api.BoxSizing.ContentBox,
          size: { width: length(100), height: length(50) },
          padding: length(10),
        }).size,
        { width: 120, height: 70 },
      );
      return;
    case "direction": {
      const child = { size: { width: length(20), height: length(10) } };
      const ltr = computeChildren(
        {
          display: api.Display.Flex,
          direction: api.Direction.Ltr,
          justifyContent: api.AlignContent.Start,
          size: { width: length(100), height: length(50) },
        },
        [child],
        finiteSpace(100, 50),
      );
      const rtl = computeChildren(
        {
          display: api.Display.Flex,
          direction: api.Direction.Rtl,
          justifyContent: api.AlignContent.Start,
          size: { width: length(100), height: length(50) },
        },
        [child],
        finiteSpace(100, 50),
      );
      assert.equal(ltr[0].location.x, 0);
      assert.equal(rtl[0].location.x, 80);
      return;
    }
    case "overflow": {
      const xScroll = computeLeaf({
        size: { width: length(100), height: length(50) },
        overflow: { x: api.Overflow.Scroll, y: api.Overflow.Hidden },
        scrollbarWidth: 7,
      });
      const yScroll = computeLeaf({
        size: { width: length(100), height: length(50) },
        overflow: { x: api.Overflow.Hidden, y: api.Overflow.Scroll },
        scrollbarWidth: 7,
      });
      assert.deepEqual(xScroll.scrollbarSize, { width: 0, height: 7 });
      assert.deepEqual(yScroll.scrollbarSize, { width: 7, height: 0 });
      return;
    }
    case "scrollbarWidth":
      assert.deepEqual(
        computeLeaf({
          size: { width: length(100), height: length(50) },
          overflow: { x: api.Overflow.Scroll, y: api.Overflow.Scroll },
          scrollbarWidth: 7.25,
        }).scrollbarSize,
        { width: Math.fround(7.25), height: Math.fround(7.25) },
      );
      return;
    case "float": {
      const left = computeChildren(
        { display: api.Display.Block, size: { width: length(100) } },
        [
          {
            display: api.Display.Block,
            float: api.Float.Left,
            size: { width: length(20), height: length(10) },
          },
        ],
        { width: api.AvailableSpace.Definite(100), height: api.AvailableSpace.MaxContent },
      );
      const right = computeChildren(
        { display: api.Display.Block, size: { width: length(100) } },
        [
          {
            display: api.Display.Block,
            float: api.Float.Right,
            size: { width: length(20), height: length(10) },
          },
        ],
        { width: api.AvailableSpace.Definite(100), height: api.AvailableSpace.MaxContent },
      );
      assert.equal(left[0].location.x, 0);
      assert.equal(right[0].location.x, 80);
      return;
    }
    case "clear": {
      const children = (float: number, clear: number) =>
        computeChildren(
          { display: api.Display.Block, size: { width: length(100) } },
          [
            {
              display: api.Display.Block,
              float,
              size: { width: length(20), height: length(10) },
            },
            { display: api.Display.Block, clear, size: { width: length(30), height: length(5) } },
          ],
          { width: api.AvailableSpace.Definite(100), height: api.AvailableSpace.MaxContent },
        );
      const expected = new Map([
        [api.Clear.None, [0, 0]],
        [api.Clear.Left, [10, 0]],
        [api.Clear.Right, [0, 10]],
        [api.Clear.Both, [10, 10]],
      ]);
      for (const clear of Object.values(api.Clear)) {
        assert.deepEqual(
          [
            children(api.Float.Left, clear)[1].location.y,
            children(api.Float.Right, clear)[1].location.y,
          ],
          expected.get(clear),
          `${clear}`,
        );
      }
      return;
    }
    case "position": {
      const children = (position: number) =>
        computeChildren(
          { display: api.Display.Block, size: { width: length(100), height: length(50) } },
          [
            {
              position,
              inset: { left: length(5), top: length(7) },
              size: { width: length(10), height: length(10) },
            },
            { size: { width: length(10), height: length(10) } },
          ],
          finiteSpace(100, 50),
        );
      const relative = children(api.Position.Relative);
      const absolute = children(api.Position.Absolute);
      assert.deepEqual(relative[0].location, { x: 5, y: 7 });
      assert.equal(relative[1].location.y, 10);
      assert.deepEqual(absolute[0].location, { x: 5, y: 7 });
      assert.equal(absolute[1].location.y, 0);
      return;
    }
    case "inset": {
      const layout = computeChildren(
        { display: api.Display.Block, size: { width: length(100), height: length(50) } },
        [
          {
            position: api.Position.Absolute,
            inset: { left: length(12), top: length(9) },
            size: { width: length(10), height: length(10) },
          },
        ],
        finiteSpace(100, 50),
      )[0];
      assert.deepEqual(layout.location, { x: 12, y: 9 });
      return;
    }
    case "size":
      assert.deepEqual(computeLeaf({ size: { width: length(40), height: percent(50) } }).size, {
        width: 40,
        height: 0,
      });
      assert.deepEqual(
        computeChildren(
          { size: { width: length(100), height: length(80) } },
          [{ size: { width: percent(25), height: percent(50) } }],
          finiteSpace(100, 80),
        )[0].size,
        { width: 25, height: 40 },
      );
      return;
    case "minSize":
      assert.deepEqual(
        computeLeaf({ size: length(10), minSize: { width: length(30), height: length(20) } }).size,
        { width: 30, height: 20 },
      );
      return;
    case "maxSize":
      assert.deepEqual(
        computeLeaf({ size: length(100), maxSize: { width: length(40), height: length(30) } }).size,
        { width: 40, height: 30 },
      );
      return;
    case "aspectRatio":
      assert.deepEqual(computeLeaf({ size: { width: length(40) }, aspectRatio: 2 }).size, {
        width: 40,
        height: 20,
      });
      return;
    case "margin": {
      const layout = computeChildren(
        { display: api.Display.Block, size: { width: length(100) } },
        [
          {
            size: { width: length(20), height: length(10) },
            margin: { left: length(12), top: length(7) },
          },
        ],
        { width: api.AvailableSpace.Definite(100), height: api.AvailableSpace.MaxContent },
      )[0];
      assert.equal(layout.location.x, 12);
      assert.deepEqual(layout.margin, { left: 12, right: 0, top: 7, bottom: 0 });
      return;
    }
    case "padding": {
      assert.deepEqual(
        computeLeaf({
          size: { width: length(50), height: length(40) },
          padding: { left: length(3), right: length(4), top: length(5), bottom: length(6) },
        }).padding,
        { left: 3, right: 4, top: 5, bottom: 6 },
      );
      assert.deepEqual(
        computeLeaf({
          boxSizing: api.BoxSizing.BorderBox,
          size: { width: length(50), height: length(40) },
          padding: length(5),
        }).size,
        { width: 50, height: 40 },
      );
      assert.deepEqual(
        computeLeaf({
          boxSizing: api.BoxSizing.ContentBox,
          size: { width: length(50), height: length(40) },
          padding: length(5),
        }).size,
        { width: 60, height: 50 },
      );
      return;
    }
    case "border":
      assert.deepEqual(
        computeLeaf({
          size: { width: length(50), height: length(40) },
          border: { left: length(3), right: length(4), top: length(5), bottom: length(6) },
        }).border,
        { left: 3, right: 4, top: 5, bottom: 6 },
      );
      return;
    case "alignItems": {
      const expected = new Map<number, { fitting: number[]; overflow: number }>([
        [api.AlignItems.Start, { fitting: [0, 0], overflow: 0 }],
        [api.AlignItems.End, { fitting: [90, 80], overflow: -20 }],
        [api.AlignItems.FlexStart, { fitting: [0, 0], overflow: 0 }],
        [api.AlignItems.FlexEnd, { fitting: [90, 80], overflow: -20 }],
        [api.AlignItems.SelfStart, { fitting: [0, 0], overflow: 0 }],
        [api.AlignItems.SelfEnd, { fitting: [90, 80], overflow: -20 }],
        [api.AlignItems.Center, { fitting: [45, 40], overflow: -10 }],
        [api.AlignItems.Baseline, { fitting: [10, 0], overflow: 0 }],
        [api.AlignItems.Stretch, { fitting: [0, 0], overflow: 0 }],
        [api.AlignItems.SafeStart, { fitting: [0, 0], overflow: 0 }],
        [api.AlignItems.SafeEnd, { fitting: [90, 80], overflow: 0 }],
        [api.AlignItems.SafeFlexStart, { fitting: [0, 0], overflow: 0 }],
        [api.AlignItems.SafeFlexEnd, { fitting: [90, 80], overflow: 0 }],
        [api.AlignItems.SafeSelfStart, { fitting: [0, 0], overflow: 0 }],
        [api.AlignItems.SafeSelfEnd, { fitting: [90, 80], overflow: 0 }],
        [api.AlignItems.SafeCenter, { fitting: [45, 40], overflow: 0 }],
      ]);
      for (const alignItems of Object.values(api.AlignItems)) {
        const expectedCase = expected.get(alignItems);
        assert.ok(expectedCase, `${alignItems}`);
        const fitting = computeChildren(
          {
            display: api.Display.Flex,
            alignItems,
            size: { width: length(100), height: length(100) },
          },
          [
            { size: { width: length(20), height: length(10) } },
            { size: { width: length(20), height: length(20) } },
          ],
        );
        assert.deepEqual(
          fitting.map(({ location }) => location.y),
          expectedCase.fitting,
          `${alignItems} fitting`,
        );
        const overflow = computeChildren(
          {
            display: api.Display.Flex,
            alignItems,
            size: { width: length(100), height: length(100) },
          },
          [{ size: { width: length(20), height: length(120) } }],
        )[0];
        assert.equal(overflow.location.y, expectedCase.overflow, `${alignItems} overflow`);
      }
      const stretched = computeChildren(
        {
          display: api.Display.Flex,
          alignItems: api.AlignItems.Stretch,
          size: { width: length(100), height: length(100) },
        },
        [{ size: { width: length(20) } }],
      )[0];
      assert.equal(stretched.size.height, 100);
      return;
    }
    case "alignSelf": {
      const layout = computeChildren(
        {
          display: api.Display.Flex,
          alignItems: api.AlignItems.Start,
          size: { width: length(100), height: length(100) },
        },
        [{ alignSelf: api.AlignItems.End, size: { width: length(20), height: length(10) } }],
      )[0];
      assert.equal(layout.location.y, 90);
      return;
    }
    case "justifyItems":
      assert.equal(
        gridChild(
          { justifyItems: api.AlignItems.Center, gridTemplateColumns: [singleTrack(50)] },
          { size: { width: length(20), height: length(10) } },
        ).location.x,
        15,
      );
      return;
    case "justifySelf":
      assert.equal(
        gridChild(
          { justifyItems: api.AlignItems.Start },
          { justifySelf: api.AlignItems.End, size: { width: length(10), height: length(10) } },
        ).location.x,
        10,
      );
      return;
    case "alignContent": {
      const expected = new Map<number, { fitting: number[]; overflow: number[] }>([
        [api.AlignContent.Start, { fitting: [0, 10], overflow: [0, 60] }],
        [api.AlignContent.End, { fitting: [80, 90], overflow: [-20, 40] }],
        [api.AlignContent.FlexStart, { fitting: [0, 10], overflow: [0, 60] }],
        [api.AlignContent.FlexEnd, { fitting: [80, 90], overflow: [-20, 40] }],
        [api.AlignContent.Center, { fitting: [40, 50], overflow: [-10, 50] }],
        [api.AlignContent.Stretch, { fitting: [0, 50], overflow: [0, 60] }],
        [api.AlignContent.SpaceBetween, { fitting: [0, 90], overflow: [0, 60] }],
        [
          api.AlignContent.SpaceEvenly,
          { fitting: [26.66666603088379, 63.33332824707031], overflow: [0, 60] },
        ],
        [api.AlignContent.SpaceAround, { fitting: [20, 70], overflow: [0, 60] }],
        [api.AlignContent.SafeStart, { fitting: [0, 10], overflow: [0, 60] }],
        [api.AlignContent.SafeEnd, { fitting: [80, 90], overflow: [0, 60] }],
        [api.AlignContent.SafeFlexStart, { fitting: [0, 10], overflow: [0, 60] }],
        [api.AlignContent.SafeFlexEnd, { fitting: [80, 90], overflow: [0, 60] }],
        [api.AlignContent.SafeCenter, { fitting: [40, 50], overflow: [0, 60] }],
      ]);
      const positions = (alignContent: number, height: number) =>
        computeChildren(
          {
            display: api.Display.Flex,
            flexWrap: api.FlexWrap.Wrap,
            alignContent,
            size: { width: length(50), height: length(100) },
          },
          [
            { size: { width: length(30), height: length(height) } },
            { size: { width: length(30), height: length(height) } },
          ],
          finiteSpace(50, 100),
        ).map(({ location }) => location.y);
      for (const alignContent of Object.values(api.AlignContent)) {
        const expectedCase = expected.get(alignContent);
        assert.ok(expectedCase, `${alignContent}`);
        assert.deepEqual(
          positions(alignContent, 10),
          expectedCase.fitting,
          `${alignContent} fitting`,
        );
        assert.deepEqual(
          positions(alignContent, 60),
          expectedCase.overflow,
          `${alignContent} overflow`,
        );
      }
      return;
    }
    case "justifyContent": {
      const flexLayout = computeChildren(
        {
          display: api.Display.Flex,
          justifyContent: api.AlignContent.End,
          size: { width: length(100), height: length(50) },
        },
        [{ size: { width: length(20), height: length(10) } }],
        finiteSpace(100, 50),
      )[0];
      assert.equal(flexLayout.location.x, 80);
      const gridLayouts = computeChildren(
        {
          display: api.Display.Grid,
          justifyContent: api.AlignContent.End,
          size: { width: length(100), height: length(20) },
          gridTemplateRows: [singleTrack(10)],
          gridTemplateColumns: [singleTrack(20), singleTrack(20)],
        },
        [{}, {}],
        finiteSpace(100, 20),
      );
      assert.deepEqual(
        gridLayouts.map(({ location }) => location.x),
        [60, 80],
      );
      return;
    }
    case "gap": {
      const layouts = computeChildren(
        {
          display: api.Display.Flex,
          gap: { width: length(5), height: length(9) },
          size: { width: length(100), height: length(50) },
        },
        [
          { size: { width: length(10), height: length(10) } },
          { size: { width: length(10), height: length(10) } },
        ],
        finiteSpace(100, 50),
      );
      assert.equal(layouts[1].location.x, 15);
      const gridLayouts = computeChildren(
        {
          display: api.Display.Grid,
          gap: { width: length(7), height: length(9) },
          size: { width: length(100), height: length(100) },
          gridTemplateRows: [singleTrack(10), singleTrack(10)],
          gridTemplateColumns: [singleTrack(20), singleTrack(20)],
        },
        [{}, {}, {}, {}],
      );
      assert.deepEqual(
        gridLayouts.map(({ location }) => location),
        [
          { x: 0, y: 0 },
          { x: 27, y: 0 },
          { x: 0, y: 19 },
          { x: 27, y: 19 },
        ],
      );
      return;
    }
    case "textAlign": {
      const child = { display: api.Display.Block, size: { width: length(20), height: length(10) } };
      const layout = (textAlign: number) =>
        computeChildren(
          { display: api.Display.Block, textAlign, size: { width: length(100) } },
          [child],
          { width: api.AvailableSpace.Definite(100), height: api.AvailableSpace.MaxContent },
        )[0];
      assert.equal(layout(api.TextAlign.LegacyLeft).location.x, 0);
      assert.equal(layout(api.TextAlign.LegacyRight).location.x, 80);
      assert.equal(layout(api.TextAlign.LegacyCenter).location.x, 40);
      return;
    }
    case "flexDirection": {
      const positions = (flexDirection: number) =>
        computeChildren(
          {
            display: api.Display.Flex,
            flexDirection,
            size: { width: length(100), height: length(100) },
          },
          [
            { size: { width: length(10), height: length(10) } },
            { size: { width: length(20), height: length(20) } },
          ],
        ).map(({ location }) => location);
      assert.deepEqual(positions(api.FlexDirection.Row), [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ]);
      assert.deepEqual(positions(api.FlexDirection.Column), [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ]);
      assert.deepEqual(positions(api.FlexDirection.RowReverse), [
        { x: 90, y: 0 },
        { x: 70, y: 0 },
      ]);
      assert.deepEqual(positions(api.FlexDirection.ColumnReverse), [
        { x: 0, y: 90 },
        { x: 0, y: 70 },
      ]);
      return;
    }
    case "flexWrap": {
      const positions = (flexWrap: number) =>
        computeChildren(
          {
            display: api.Display.Flex,
            flexWrap,
            alignContent: api.AlignContent.Start,
            size: { width: length(50), height: length(100) },
          },
          [
            { size: { width: length(30), height: length(10) } },
            { size: { width: length(30), height: length(10) } },
          ],
          finiteSpace(50, 100),
        ).map(({ location }) => location);
      assert.deepEqual(positions(api.FlexWrap.NoWrap), [
        { x: 0, y: 0 },
        { x: 25, y: 0 },
      ]);
      assert.deepEqual(positions(api.FlexWrap.Wrap), [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ]);
      assert.deepEqual(positions(api.FlexWrap.WrapReverse), [
        { x: 0, y: 10 },
        { x: 0, y: 0 },
      ]);
      return;
    }
    case "flexBasis": {
      const width = (flexBasis: unknown) =>
        computeChildren(
          { display: api.Display.Flex, size: { width: length(100), height: length(20) } },
          [{ size: { width: length(10) }, flexBasis }],
          finiteSpace(100, 20),
        )[0].size.width;
      assert.equal(width(length(30)), 30);
      assert.equal(width(percent(25)), 25);
      assert.equal(width(auto()), 10);
      return;
    }
    case "flexGrow": {
      const layouts = computeChildren(
        { display: api.Display.Flex, size: { width: length(100), height: length(20) } },
        [
          { size: { width: length(10) }, flexGrow: 1 },
          { size: { width: length(10) }, flexGrow: 1 },
        ],
        finiteSpace(100, 20),
      );
      assert.deepEqual(
        layouts.map(({ size: itemSize }) => itemSize.width),
        [50, 50],
      );
      return;
    }
    case "flexShrink": {
      const layouts = computeChildren(
        { display: api.Display.Flex, size: { width: length(50), height: length(20) } },
        [
          { size: { width: length(40) }, flexShrink: 0 },
          { size: { width: length(40) }, flexShrink: 1 },
        ],
        finiteSpace(50, 20),
      );
      assert.deepEqual(
        layouts.map(({ size: itemSize }) => itemSize.width),
        [40, 10],
      );
      return;
    }
    case "gridTemplateRows": {
      assertTemplateComponentSemantics("row");
      return;
    }
    case "gridTemplateColumns": {
      assertTemplateComponentSemantics("column");
      return;
    }
    case "gridAutoRows": {
      const layouts = computeChildren(
        {
          display: api.Display.Grid,
          gridTemplateColumns: [singleTrack(100)],
          gridAutoRows: [fixedTrack(20)],
        },
        [{}, {}],
      );
      assert.deepEqual(
        layouts.map(({ location, size: itemSize }) => [location.y, itemSize.height]),
        [
          [0, 20],
          [20, 20],
        ],
      );
      return;
    }
    case "gridAutoColumns": {
      const layouts = computeChildren(
        {
          display: api.Display.Grid,
          gridTemplateRows: [singleTrack(100)],
          gridAutoColumns: [fixedTrack(20)],
          gridAutoFlow: api.GridAutoFlow.Column,
        },
        [{}, {}],
      );
      assert.deepEqual(
        layouts.map(({ location, size: itemSize }) => [location.x, itemSize.width]),
        [
          [0, 20],
          [20, 20],
        ],
      );
      return;
    }
    case "gridAutoFlow": {
      const positions = (gridAutoFlow: number) => {
        const rowAxis =
          gridAutoFlow === api.GridAutoFlow.Row || gridAutoFlow === api.GridAutoFlow.RowDense;
        return computeChildren(
          {
            display: api.Display.Grid,
            gridTemplateRows: [singleTrack(20), singleTrack(20), singleTrack(20)],
            gridTemplateColumns: [singleTrack(20), singleTrack(20), singleTrack(20)],
            gridAutoFlow,
          },
          rowAxis
            ? [
                { gridColumn: { start: api.GridPlacement.Span(2) } },
                { gridColumn: { start: api.GridPlacement.Span(2) } },
                {},
              ]
            : [
                { gridRow: { start: api.GridPlacement.Span(2) } },
                { gridRow: { start: api.GridPlacement.Span(2) } },
                {},
              ],
          finiteSpace(60, 60),
        ).map(({ location }) => location);
      };
      assert.deepEqual(positions(api.GridAutoFlow.Row), [
        { x: 0, y: 0 },
        { x: 0, y: 20 },
        { x: 40, y: 20 },
      ]);
      assert.deepEqual(positions(api.GridAutoFlow.Column), [
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 20, y: 40 },
      ]);
      assert.deepEqual(positions(api.GridAutoFlow.RowDense), [
        { x: 0, y: 0 },
        { x: 0, y: 20 },
        { x: 40, y: 0 },
      ]);
      assert.deepEqual(positions(api.GridAutoFlow.ColumnDense), [
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 0, y: 40 },
      ]);
      return;
    }
    case "gridTemplateAreas": {
      assertTemplateAreaIntegerBoundaries();
      const result = gridChild(
        {
          gridTemplateAreas: {
            areas: [{ name: "hero", rowStart: 1, rowEnd: 3, columnStart: 1, columnEnd: 3 }],
            rowCount: 2,
            columnCount: 2,
          },
        },
        {
          gridRow: {
            start: api.GridPlacement.NamedLine("hero-start", 1),
            end: api.GridPlacement.NamedLine("hero-end", 1),
          },
          gridColumn: {
            start: api.GridPlacement.NamedLine("hero-start", 1),
            end: api.GridPlacement.NamedLine("hero-end", 1),
          },
        },
      );
      assert.deepEqual(result.size, { width: 50, height: 25 });
      return;
    }
    case "gridTemplateColumnNames": {
      assertNamedGridLineSemantics("column");
      return;
    }
    case "gridTemplateRowNames": {
      assertNamedGridLineSemantics("row");
      return;
    }
    case "gridRow": {
      assertGridPlacementIntegerBoundaries("gridRow");
      const result = gridChild(
        {},
        {
          gridRow: { start: api.GridPlacement.Line(2), end: api.GridPlacement.Span(1) },
          gridColumn: { start: api.GridPlacement.Line(1), end: api.GridPlacement.Span(1) },
        },
      );
      assert.deepEqual(result.location, { x: 0, y: 10 });
      assert.deepEqual(result.size, { width: 20, height: 15 });
      return;
    }
    case "gridColumn": {
      assertGridPlacementIntegerBoundaries("gridColumn");
      const result = gridChild(
        {},
        {
          gridRow: { start: api.GridPlacement.Line(1), end: api.GridPlacement.Span(1) },
          gridColumn: { start: api.GridPlacement.Line(2), end: api.GridPlacement.Span(1) },
        },
      );
      assert.deepEqual(result.location, { x: 20, y: 0 });
      assert.deepEqual(result.size, { width: 30, height: 10 });
      return;
    }
    default:
      assert.fail(`Missing semantic Style fixture for ${field}`);
  }
}

test("style field table is complete", () => {
  assert.equal(styleSpecs.length, 41);
  assert.equal(specsByField.size, styleSpecs.length);
});

test("numeric style fields cover every public member", () => {
  const expected = new Map<string, readonly number[]>([
    ["display", Object.values(api.Display)],
    ["boxSizing", Object.values(api.BoxSizing)],
    ["direction", Object.values(api.Direction)],
    ["overflow", Object.values(api.Overflow)],
    ["float", Object.values(api.Float)],
    ["clear", Object.values(api.Clear)],
    ["position", Object.values(api.Position)],
    ["alignItems", Object.values(api.AlignItems)],
    ["alignSelf", Object.values(api.AlignItems)],
    ["justifyItems", Object.values(api.AlignItems)],
    ["justifySelf", Object.values(api.AlignItems)],
    ["alignContent", Object.values(api.AlignContent)],
    ["justifyContent", Object.values(api.AlignContent)],
    ["textAlign", Object.values(api.TextAlign)],
    ["flexDirection", Object.values(api.FlexDirection)],
    ["flexWrap", Object.values(api.FlexWrap)],
    ["gridAutoFlow", Object.values(api.GridAutoFlow)],
  ]);
  assert.deepEqual(
    styleSpecs.filter(({ enumMembers }) => enumMembers).map(({ field }) => field),
    [...expected.keys()],
  );
  for (const [field, members] of expected) {
    const spec = styleSpecs.find((candidate) => candidate.field === field);
    assert.deepEqual(spec?.enumMembers, members, field);
  }
});

test("measure callbacks receive the same style snapshot as getStyle", () => {
  const tree = new (TaffyTree())();
  const representativeStyle = Object.fromEntries(
    styleSpecs.map((spec) => [spec.field, spec.sample().input]),
  );
  representativeStyle.display = api.Display.Block;
  representativeStyle.position = api.Position.Relative;
  representativeStyle.size = auto();
  representativeStyle.minSize = auto();
  representativeStyle.maxSize = auto();
  const node = tree.newLeafWithContext(representativeStyle, "measured");
  let callbackStyle: StyleRecord | undefined;
  tree.computeLayoutWithMeasure({
    root: node,
    availableSpace: maxContentSpace(),
    measure(args) {
      callbackStyle = args.style;
      return { width: 30, height: 10 };
    },
  });
  assert.ok(callbackStyle);
  assert.deepEqual(callbackStyle, tree.getStyle(node));
});

test("style snapshots are fresh and mutable", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeaf(
    Object.fromEntries(styleSpecs.map((spec) => [spec.field, spec.sample().input])),
  );
  const first = tree.getStyle(node);
  const second = tree.getStyle(node);
  assert.deepEqual(first, second);
  assertUnfrozenDetached(first, second);
});

const styleChecks = [
  "default",
  "missing",
  "undefined",
  "native",
  "roundtrip",
  "invalid",
  "atomic",
  "semantic",
] as const;

for (const spec of styleSpecs) {
  for (const check of styleChecks) {
    test(spec.field + ": " + check, () => runStyleCase(spec.field, check));
  }
}
