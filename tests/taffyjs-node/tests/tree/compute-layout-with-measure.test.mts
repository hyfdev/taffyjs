import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  AvailableSpace,
  AvailableSpaceKind,
  Dimension,
  Display,
  FlexDirection,
  GridPlacement,
  GridPlacementKind,
  LengthUnit,
  type MeasureArgs,
  type MeasureFunction,
  type NodeId,
  TaffyTree,
} from "@taffyjs/node";
import { test } from "vite-plus/test";

function availableSpace() {
  return {
    width: 200,
    height: AvailableSpace.MinContent,
  };
}

function minContentSpace() {
  return { width: AvailableSpace.MinContent, height: AvailableSpace.MinContent };
}

function captureError(body: () => unknown): unknown {
  try {
    body();
  } catch (error) {
    return error;
  }
  assert.fail("Expected operation to throw");
}

function compute(tree: TaffyTree, root: NodeId, measure: MeasureFunction<unknown>): void {
  tree.computeLayout({ root, availableSpace: minContentSpace(), measure });
}

type MeasureRequestKey = readonly [
  node: string,
  knownWidth: string,
  knownHeight: string,
  availableWidth: string,
  availableHeight: string,
];

interface NestedMeasureFixture {
  readonly tree: TaffyTree;
  readonly measured: NodeId;
  readonly root: NodeId;
}

function f32Bits(value: number): string {
  const float = new Float32Array([value]);
  return new Uint32Array(float.buffer)[0].toString(16);
}

function knownDimensionKey(value: number | undefined): string {
  return value === undefined ? "undefined" : f32Bits(value);
}

function availableSpaceKey(value: MeasureArgs<unknown>["availableSpace"]["width"]): string {
  if (value.kind === AvailableSpaceKind.Definite) {
    return `definite:${f32Bits(value.value)}`;
  }
  return value.kind === AvailableSpaceKind.MinContent ? "min-content" : "max-content";
}

function measureRequestKey(args: MeasureArgs<unknown>): MeasureRequestKey {
  return [
    String(args.node),
    knownDimensionKey(args.knownDimensions.width),
    knownDimensionKey(args.knownDimensions.height),
    availableSpaceKey(args.availableSpace.width),
    availableSpaceKey(args.availableSpace.height),
  ];
}

function hasPairDifferingOnlyAt(
  requests: readonly MeasureRequestKey[],
  component: number,
  acceptsDifference: (left: string, right: string) => boolean = () => true,
): boolean {
  for (const [leftIndex, left] of requests.entries()) {
    for (const right of requests.slice(leftIndex + 1)) {
      if (
        left[component] !== right[component] &&
        acceptsDifference(left[component], right[component]) &&
        left.every((value, index) => index === component || value === right[index])
      ) {
        return true;
      }
    }
  }
  return false;
}

function assertNoDuplicateMeasureRequests(requests: readonly MeasureRequestKey[]): void {
  const uniqueRequests = new Set(requests.map((request) => JSON.stringify(request)));
  assert.equal(
    uniqueRequests.size,
    requests.length,
    "one compute must enter JavaScript once for each exact measure request",
  );
}

function createNestedMeasureFixture(
  firstDirection: typeof FlexDirection.Row | typeof FlexDirection.Column,
): NestedMeasureFixture {
  const tree = new TaffyTree();
  tree.disableRounding();
  const measured = tree.newLeafWithContext(true, {
    flexShrink: 1,
    minSize: { width: 0, height: 0 },
  });
  let nested = measured;
  for (let depth = 0; depth < 4; depth += 1) {
    const otherDirection =
      firstDirection === FlexDirection.Row ? FlexDirection.Column : FlexDirection.Row;
    const flexDirection = depth % 2 === 0 ? firstDirection : otherDirection;
    nested = tree.newWithChildren([nested], {
      display: Display.Flex,
      flexDirection,
      flexGrow: depth === 3 ? 1 : 0,
      flexShrink: 1,
      minSize: { width: 0, height: 0 },
      padding: 3,
      gap: 2,
    });
  }
  const fixed = tree.newLeaf({ size: { width: 264, height: 100 } });
  const root = tree.newWithChildren([fixed, nested], {
    display: Display.Flex,
    flexDirection: FlexDirection.Row,
    size: { width: 1280, height: 800 },
    padding: 16,
  });
  return { tree, measured, root };
}

function collectMeasureRequests(
  fixture: NestedMeasureFixture,
  source: "global" | "per-node" = "global",
): MeasureRequestKey[] {
  const requests: MeasureRequestKey[] = [];
  const measure: MeasureFunction<unknown> = (args) => {
    requests.push(measureRequestKey(args));
    return { width: 73, height: 19 };
  };
  if (source === "per-node") {
    fixture.tree.setMeasure(fixture.measured, measure);
    fixture.tree.computeLayout({
      root: fixture.root,
      availableSpace: { width: 1280, height: 800 },
    });
  } else {
    fixture.tree.computeLayout({
      root: fixture.root,
      availableSpace: { width: 1280, height: 800 },
      measure,
    });
  }
  return requests;
}

test("callback-args", () => {
  const tree = new TaffyTree();
  const context = { label: "callback" };
  const node = tree.newLeafWithContext(context, { flexGrow: 1.25 });
  let saved: MeasureArgs<unknown> | undefined;

  tree.computeLayout({
    root: node,
    availableSpace: availableSpace(),
    measure(args) {
      saved ??= args;
      return { width: 30, height: 10 };
    },
  });

  assert.ok(saved);
  assert.deepEqual(Object.keys(saved), [
    "knownDimensions",
    "availableSpace",
    "node",
    "context",
    "getStyle",
  ]);
  assert.deepEqual(saved.knownDimensions, { width: undefined, height: undefined });
  assert.deepEqual(saved.availableSpace, {
    width: { kind: AvailableSpaceKind.Definite, value: 200 },
    height: AvailableSpace.MinContent,
  });
  assert.equal(saved.node, node);
  assert.equal(saved.context, context);
  assert.equal(typeof saved.getStyle, "function");
  assert.equal(Object.isFrozen(saved), false);

  const firstStyle = saved.getStyle();
  assert.deepEqual(firstStyle, tree.getStyle(node));
  (firstStyle as { flexGrow: number }).flexGrow = 99;
  assert.equal(tree.getStyle(node).flexGrow, Math.fround(1.25));
  const secondStyle = saved.getStyle();
  assert.notEqual(secondStyle, firstStyle);
  assert.equal(secondStyle.flexGrow, Math.fround(1.25));
});

test("callback-args reconstruct MaxContent, negative, and non-finite available space", () => {
  const tree = new TaffyTree();
  const node = tree.newLeafWithContext(true);
  const received: MeasureArgs<unknown>["availableSpace"][] = [];

  for (const availableSpace of [
    { width: AvailableSpace.MaxContent, height: AvailableSpace.MinContent },
    { width: -4, height: Number.POSITIVE_INFINITY },
    { width: Number.NaN, height: Number.NEGATIVE_INFINITY },
    { width: -0, height: 0 },
  ] as const) {
    tree.computeLayout({
      root: node,
      availableSpace,
      measure(args) {
        received.push(args.availableSpace);
        return { width: 8, height: 4 };
      },
    });
  }

  assert.deepEqual(received[0], {
    width: AvailableSpace.MaxContent,
    height: AvailableSpace.MinContent,
  });
  assert.equal(received[1].width.kind, AvailableSpaceKind.Definite);
  assert.equal(received[1].width.value, -4);
  assert.equal(received[1].height.kind, AvailableSpaceKind.Definite);
  assert.equal(received[1].height.value, Number.POSITIVE_INFINITY);
  assert.equal(received[2].width.kind, AvailableSpaceKind.Definite);
  assert.equal(Number.isNaN(received[2].width.value), true);
  assert.equal(received[2].height.kind, AvailableSpaceKind.Definite);
  assert.equal(received[2].height.value, Number.NEGATIVE_INFINITY);
  assert.equal(received[3].width.kind, AvailableSpaceKind.Definite);
  assert.equal(Object.is(received[3].width.value, -0), true);
  assert.equal(received[3].height.kind, AvailableSpaceKind.Definite);
  assert.equal(Object.is(received[3].height.value, 0), true);
});

test("getStyle provider is reused per node and refreshed for the next compute", () => {
  const fixture = createNestedMeasureFixture(FlexDirection.Row);
  const providers = new Map<NodeId, () => ReturnType<MeasureArgs<unknown>["getStyle"]>>();
  let repeatedProvider = false;

  fixture.tree.computeLayout({
    root: fixture.root,
    availableSpace: { width: 1280, height: 800 },
    measure(args) {
      const previous = providers.get(args.node);
      if (previous === undefined) providers.set(args.node, args.getStyle);
      else {
        repeatedProvider = true;
        assert.equal(args.getStyle, previous);
      }
      return { width: 73, height: 19 };
    },
  });

  assert.equal(repeatedProvider, true);
  const previousProvider = providers.get(fixture.measured);
  assert.ok(previousProvider);
  assert.equal(previousProvider().flexGrow, 0);

  fixture.tree.setStyle(fixture.measured, { flexGrow: 2 });
  let nextProvider: MeasureArgs<unknown>["getStyle"] | undefined;
  fixture.tree.computeLayout({
    root: fixture.root,
    availableSpace: { width: 1280, height: 800 },
    measure(args) {
      if (args.node === fixture.measured) nextProvider ??= args.getStyle;
      return { width: 73, height: 19 };
    },
  });

  assert.ok(nextProvider);
  assert.notEqual(nextProvider, previousProvider);
  assert.equal(nextProvider().flexGrow, 2);
  assert.equal(previousProvider().flexGrow, 0);
});

test("computeLayout keeps ordinary leaves native when no measure is configured", () => {
  const tree = new TaffyTree<{ label: string }>();
  const fixed = tree.newLeafWithContext(
    { label: "context does not enable measurement" },
    { size: { width: 40, height: 12 } },
  );

  tree.computeLayout({ root: fixed, availableSpace: minContentSpace(), measure: undefined });

  assert.deepEqual(tree.getUnroundedLayout(fixed).size, { width: 40, height: 12 });
});

test("computeLayout invokes only configured measures independently of context", () => {
  const tree = new TaffyTree<string>();
  const contextOnly = tree.newLeafWithContext("context only");
  const measureOnly = tree.newLeaf();
  const fixed = tree.newLeafWithContext("fixed context", { size: { width: 40, height: 12 } });
  const root = tree.newWithChildren([contextOnly, measureOnly, fixed]);
  const receivedContexts: Array<string | undefined> = [];
  const measuredNodes = new Set<NodeId>();
  tree.setMeasure(measureOnly, (args) => {
    measuredNodes.add(args.node);
    receivedContexts.push(args.context);
    return { width: 30, height: 10 };
  });

  tree.computeLayout({ root, availableSpace: minContentSpace() });
  assert.deepEqual([...measuredNodes], [measureOnly]);
  assert.equal(receivedContexts.length > 0, true);
  assert.equal(
    receivedContexts.every((context) => context === undefined),
    true,
  );
  assert.deepEqual(tree.getUnroundedLayout(fixed).size, { width: 40, height: 12 });

  tree.setNodeContext(measureOnly, "added later");
  tree.computeLayout({ root, availableSpace: minContentSpace() });
  assert.equal(receivedContexts.at(-1), "added later");

  tree.setNodeContext(measureOnly, undefined);
  tree.computeLayout({ root, availableSpace: minContentSpace() });
  assert.equal(receivedContexts.at(-1), undefined);
});

test("nodes select their own measures and may share one callback", () => {
  const tree = new TaffyTree();
  const first = tree.newLeaf();
  const second = tree.newLeaf();
  const third = tree.newLeaf();
  const root = tree.newWithChildren([first, second, third]);
  const firstNodes = new Set<NodeId>();
  const sharedNodes = new Set<NodeId>();
  tree.setMeasure(first, ({ node }) => {
    firstNodes.add(node);
    return { width: 10, height: 5 };
  });
  const shared: MeasureFunction<unknown> = ({ node }) => {
    sharedNodes.add(node);
    return { width: 20, height: 6 };
  };
  tree.setMeasure(second, shared);
  tree.setMeasure(third, shared);

  tree.computeLayout({ root, availableSpace: minContentSpace() });

  assert.deepEqual([...firstNodes], [first]);
  assert.deepEqual(sharedNodes, new Set([second, third]));
});

test("per-node measures take priority over the global fallback", () => {
  const tree = new TaffyTree();
  const configured = tree.newLeaf();
  const fallback = tree.newLeaf();
  const root = tree.newWithChildren([configured, fallback]);
  const configuredNodes = new Set<NodeId>();
  const fallbackNodes = new Set<NodeId>();
  tree.setMeasure(configured, ({ node }) => {
    configuredNodes.add(node);
    return { width: 30, height: 10 };
  });

  tree.computeLayout({
    root,
    availableSpace: minContentSpace(),
    measure({ node }) {
      fallbackNodes.add(node);
      return { width: 40, height: 12 };
    },
  });

  assert.deepEqual([...configuredNodes], [configured]);
  assert.deepEqual([...fallbackNodes], [fallback]);
});

test("setMeasure always invalidates cached measurement and clearing restores fallback", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf();
  let measuredWidth = 10;
  let calls = 0;
  const measure: MeasureFunction<unknown> = () => {
    calls += 1;
    return { width: measuredWidth, height: 5 };
  };

  tree.setMeasure(node, measure);
  tree.computeLayout({ root: node, availableSpace: minContentSpace() });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 10, height: 5 });
  const firstCalls = calls;

  measuredWidth = 20;
  tree.setMeasure(node, measure);
  tree.computeLayout({ root: node, availableSpace: minContentSpace() });
  assert.equal(calls > firstCalls, true, "setting the same callback identity dirties the node");
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 20, height: 5 });

  tree.setMeasure(node, () => ({ width: 30, height: 6 }));
  tree.computeLayout({ root: node, availableSpace: minContentSpace() });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 30, height: 6 });

  tree.setMeasure(node, undefined);
  tree.computeLayout({ root: node, availableSpace: minContentSpace() });
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 0, height: 0 });

  let fallbackCalls = 0;
  tree.markDirty(node);
  tree.computeLayout({
    root: node,
    availableSpace: minContentSpace(),
    measure() {
      fallbackCalls += 1;
      return { width: 40, height: 7 };
    },
  });
  assert.equal(fallbackCalls > 0, true);
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 40, height: 7 });
});

test("remove and clear release per-node measure state", () => {
  const tree = new TaffyTree();
  let calls = 0;
  const removed = tree.newLeaf();
  tree.setMeasure(removed, () => {
    calls += 1;
    return { width: 10, height: 5 };
  });
  tree.remove(removed);

  const replacement = tree.newLeaf();
  tree.computeLayout({ root: replacement, availableSpace: minContentSpace() });
  assert.equal(calls, 0);

  tree.setMeasure(replacement, () => {
    calls += 1;
    return { width: 20, height: 6 };
  });
  tree.clear();

  const afterClear = tree.newLeaf();
  tree.computeLayout({ root: afterClear, availableSpace: minContentSpace() });
  assert.equal(calls, 0);
});

test("failed setMeasure calls leave native and JavaScript state aligned", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf();
  let originalCalls = 0;
  let replacementCalls = 0;
  let busyError: unknown;
  let attempted = false;
  const replacement = () => {
    replacementCalls += 1;
    return { width: 99, height: 9 };
  };
  tree.setMeasure(node, () => {
    originalCalls += 1;
    if (!attempted) {
      attempted = true;
      busyError = captureError(() => tree.setMeasure(node, replacement));
    }
    return { width: 20, height: 5 };
  });

  tree.computeLayout({ root: node, availableSpace: minContentSpace() });
  assert.equal((busyError as { code?: string }).code, "ERR_TAFFY_TREE_BUSY");
  assert.throws(() => tree.setMeasure(node, null as never), TypeError);
  assert.equal(tree.isDirty(node), false);

  tree.markDirty(node);
  tree.computeLayout({ root: node, availableSpace: minContentSpace() });
  assert.equal(originalCalls > 1, true);
  assert.equal(replacementCalls, 0);
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 20, height: 5 });
});

test("per-node callback failures preserve thrown identity and retry", () => {
  const tree = new TaffyTree();
  const node = tree.newLeaf();
  const thrown = { reason: "retry per-node measurement" };
  let shouldThrow = true;
  let calls = 0;
  tree.setMeasure(node, () => {
    calls += 1;
    if (shouldThrow) throw thrown;
    return { width: 30, height: 10 };
  });

  assert.equal(
    captureError(() => tree.computeLayout({ root: node, availableSpace: minContentSpace() })),
    thrown,
  );
  assert.equal(calls, 1);

  shouldThrow = false;
  tree.computeLayout({ root: node, availableSpace: minContentSpace() });
  assert.equal(calls > 1, true);
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 30, height: 10 });
});

test("result-f32", () => {
  const finiteTree = new TaffyTree();
  const finite = finiteTree.newLeafWithContext(true);
  compute(finiteTree, finite, () => ({ width: 12.2500001, height: 8.5000001 }));
  assert.deepEqual(finiteTree.getUnroundedLayout(finite).size, {
    width: Math.fround(12.2500001),
    height: Math.fround(8.5000001),
  });

  const infinityTree = new TaffyTree();
  const infinity = infinityTree.newLeafWithContext(true);
  compute(infinityTree, infinity, () => ({
    width: Number.POSITIVE_INFINITY,
    height: Number.NEGATIVE_INFINITY,
  }));
  assert.deepEqual(infinityTree.getUnroundedLayout(infinity).size, {
    width: Number.POSITIVE_INFINITY,
    height: 0,
  });

  const nanTree = new TaffyTree();
  const nan = nanTree.newLeafWithContext(true);
  compute(nanTree, nan, () => ({ width: Number.NaN, height: Number.NaN }));
  assert.deepEqual(nanTree.getUnroundedLayout(nan).size, { width: 0, height: 0 });
});

test("identical requests reuse one callback result without merging constraints", () => {
  const rowFirst = collectMeasureRequests(createNestedMeasureFixture(FlexDirection.Row));
  const columnFirst = collectMeasureRequests(createNestedMeasureFixture(FlexDirection.Column));
  const perNodeRowFirst = collectMeasureRequests(
    createNestedMeasureFixture(FlexDirection.Row),
    "per-node",
  );
  const perNodeColumnFirst = collectMeasureRequests(
    createNestedMeasureFixture(FlexDirection.Column),
    "per-node",
  );
  assertNoDuplicateMeasureRequests(rowFirst);
  assertNoDuplicateMeasureRequests(columnFirst);
  assertNoDuplicateMeasureRequests(perNodeRowFirst);
  assertNoDuplicateMeasureRequests(perNodeColumnFirst);

  assert.equal(
    hasPairDifferingOnlyAt(rowFirst, 1),
    true,
    "known width remains part of the request key",
  );
  assert.equal(
    hasPairDifferingOnlyAt(columnFirst, 2),
    true,
    "known height remains part of the request key",
  );

  const kind = (value: string) => (value.startsWith("definite:") ? "definite" : value);
  const kindsDiffer = (left: string, right: string) => kind(left) !== kind(right);
  const definiteValuesDiffer = (left: string, right: string) =>
    left.startsWith("definite:") && right.startsWith("definite:");
  assert.equal(
    hasPairDifferingOnlyAt(columnFirst, 3, kindsDiffer),
    true,
    "available width kind remains part of the request key",
  );
  assert.equal(
    hasPairDifferingOnlyAt(columnFirst, 3, definiteValuesDiffer),
    true,
    "definite available width remains part of the request key",
  );
  assert.equal(
    hasPairDifferingOnlyAt(rowFirst, 4, kindsDiffer),
    true,
    "available height kind remains part of the request key",
  );
  assert.equal(
    hasPairDifferingOnlyAt(rowFirst, 4, definiteValuesDiffer),
    true,
    "definite available height remains part of the request key",
  );
});

test("identical constraints on different nodes remain separate requests", () => {
  const tree = new TaffyTree();
  const first = tree.newLeafWithContext("first", {
    flexGrow: 1,
    flexShrink: 1,
    minSize: { width: 0 },
  });
  const second = tree.newLeafWithContext("second", {
    flexGrow: 1,
    flexShrink: 1,
    minSize: { width: 0 },
  });
  const root = tree.newWithChildren([first, second], {
    display: Display.Flex,
    flexDirection: FlexDirection.Row,
    size: { width: 200, height: 100 },
  });
  const requests: MeasureRequestKey[] = [];
  const measuredNodes = new Set<NodeId>();

  tree.computeLayout({
    root,
    availableSpace: { width: 200, height: 100 },
    measure(args) {
      requests.push(measureRequestKey(args));
      measuredNodes.add(args.node);
      return { width: 30, height: 10 };
    },
  });

  assert.equal(measuredNodes.has(first), true);
  assert.equal(measuredNodes.has(second), true);
  assert.equal(
    hasPairDifferingOnlyAt(requests, 0),
    true,
    "node identity remains part of the request key",
  );
});

test("measure request reuse ends when compute returns", () => {
  const fixture = createNestedMeasureFixture(FlexDirection.Row);
  const first = collectMeasureRequests(fixture);
  assertNoDuplicateMeasureRequests(first);

  fixture.tree.markDirty(fixture.measured);
  const second = collectMeasureRequests(fixture);
  assertNoDuplicateMeasureRequests(second);
  const firstRequests = new Set(first.map((request) => JSON.stringify(request)));
  assert.equal(
    second.some((request) => firstRequests.has(JSON.stringify(request))),
    true,
    "a later compute must re-enter JavaScript for a repeated Taffy request",
  );
});

test("cache-calls", () => {
  const tree = new TaffyTree();
  const node = tree.newLeafWithContext(true);
  const options = {
    root: node,
    availableSpace: minContentSpace(),
    measure: () => {
      calls += 1;
      return { width: 30, height: 10 };
    },
  };
  let calls = 0;

  tree.computeLayout(options);
  const firstCalls = calls;
  assert.equal(firstCalls > 0, true);
  tree.computeLayout(options);
  assert.equal(calls, firstCalls, "unchanged input may use the cached result without a callback");

  tree.setStyle(node, { flexGrow: 1 });
  tree.computeLayout(options);
  assert.equal(calls > firstCalls, true, "dirty input asks Taffy to measure again");
});

test("changing the global fallback requires dirtying each affected leaf", () => {
  const tree = new TaffyTree();
  const leaf = tree.newLeaf();
  const root = tree.newWithChildren([leaf]);
  let firstCalls = 0;
  let secondCalls = 0;

  tree.computeLayout({
    root,
    availableSpace: minContentSpace(),
    measure() {
      firstCalls += 1;
      return { width: 10, height: 5 };
    },
  });
  assert.equal(firstCalls > 0, true);
  assert.deepEqual(tree.getUnroundedLayout(leaf).size, { width: 10, height: 5 });

  tree.markDirty(root);
  tree.computeLayout({
    root,
    availableSpace: minContentSpace(),
    measure() {
      secondCalls += 1;
      return { width: 20, height: 6 };
    },
  });
  assert.equal(secondCalls, 0, "markDirty(root) does not clear a descendant leaf's cache");
  assert.deepEqual(tree.getUnroundedLayout(leaf).size, { width: 10, height: 5 });

  tree.markDirty(leaf);
  tree.computeLayout({
    root,
    availableSpace: minContentSpace(),
    measure() {
      secondCalls += 1;
      return { width: 20, height: 6 };
    },
  });
  assert.equal(secondCalls > 0, true);
  assert.deepEqual(tree.getUnroundedLayout(leaf).size, { width: 20, height: 6 });
});

test("callback-type-before-cache", () => {
  const tree = new TaffyTree();
  const node = tree.newLeafWithContext(true);
  const options = {
    root: node,
    availableSpace: minContentSpace(),
    measure: () => ({ width: 30, height: 10 }),
  };

  tree.computeLayout(options);
  assert.equal(tree.isDirty(node), false);

  assert.throws(() => tree.computeLayout({ ...options, measure: 42 as never }), TypeError);
  assert.throws(() => tree.computeLayout({ ...options, measure: null as never }), TypeError);
  assert.equal(tree.isDirty(node), false, "a cached tree is untouched by callback validation");

  tree.markDirty(node);
  assert.throws(() => tree.computeLayout({ ...options, measure: 42 as never }), TypeError);
  assert.equal(tree.isDirty(node), true, "a dirty tree is untouched by callback validation");
});

test("same-tree-busy", () => {
  const fixture = fileURLToPath(new URL("./fixtures/measure-reentrancy.ts", import.meta.url));
  const child = spawnSync(process.execPath, [fixture], { encoding: "utf8", timeout: 20_000 });
  assert.equal(child.signal, null);
  assert.equal(child.status, 0, child.stderr);
  const results = JSON.parse(child.stdout) as {
    callbackRan: boolean;
    results: { method: string; code?: string; message: string }[];
  };
  assert.equal(results.callbackRan, true);
  assert.equal(results.results.length, 31);
  for (const result of results.results) {
    assert.equal(result.code, "ERR_TAFFY_TREE_BUSY", result.method);
    assert.equal(
      result.message,
      `Cannot call ${result.method} on this TaffyTree while it is computing layout from a measure callback`,
    );
  }
});

test("js-only-reentry", () => {
  const tree = new TaffyTree();
  const context = { label: "available" };
  const node = tree.newLeafWithContext(context);

  compute(tree, node, ({ node: measured }) => {
    assert.equal(tree.getNodeContext(measured), context);
    assert.equal(typeof measured, "bigint");
    assert.equal(measured === node, true);
    assert.equal(measured + 0n, node);
    assert.deepEqual(Dimension.Length(4), { unit: LengthUnit.Length, value: 4 });
    assert.deepEqual(AvailableSpace.Definite(5), {
      kind: AvailableSpaceKind.Definite,
      value: 5,
    });
    assert.deepEqual(GridPlacement.Line(2), {
      kind: GridPlacementKind.Line,
      index: 2,
    });
    return { width: 30, height: 10 };
  });
});

test("different-tree", () => {
  const tree = new TaffyTree();
  const node = tree.newLeafWithContext(true);
  const other = new TaffyTree();
  let otherNode: NodeId | undefined;

  compute(tree, node, () => {
    otherNode = other.newLeaf({ flexGrow: 2 });
    assert.equal(other.getNodeCount(), 1);
    assert.equal(other.getStyle(otherNode).flexGrow, 2);
    return { width: 30, height: 10 };
  });

  assert.equal(typeof otherNode, "bigint");
  assert.equal(other.getNodeCount(), 1);
});

test("throw-identity", () => {
  for (const thrown of [{ reason: "stop" }, "stop", 17, null]) {
    const tree = new TaffyTree();
    const node = tree.newLeafWithContext(true);
    let failedCalls = 0;
    const received = captureError(() =>
      compute(tree, node, ({ getStyle }) => {
        failedCalls += 1;
        assert.equal(getStyle().flexGrow, 0);
        throw thrown;
      }),
    );
    assert.equal(received, thrown);
    assert.equal(failedCalls, 1);

    let retryCalls = 0;
    compute(tree, node, () => {
      retryCalls += 1;
      return { width: 30, height: 10 };
    });
    assert.equal(retryCalls > 0, true, "a thrown callback result must not be cached");
    assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 30, height: 10 });
  }
});

test("malformed-result", () => {
  for (const result of [
    null,
    [],
    { width: 1 },
    { width: "1", height: 2 },
    Promise.resolve({ width: 1, height: 2 }),
  ]) {
    const tree = new TaffyTree();
    const node = tree.newLeafWithContext(true);
    const error = captureError(() => compute(tree, node, () => result as never));
    assert.equal((error as Error).constructor, TypeError);
  }
});

test("extra-result-fields are ignored", () => {
  const tree = new TaffyTree();
  const node = tree.newLeafWithContext(true);
  compute(tree, node, () => ({ width: 30, height: 10, extra: 3 }) as never);
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 30, height: 10 });
});

test("zero-drain", () => {
  const tree = new TaffyTree();
  const first = tree.newLeafWithContext("first");
  const second = tree.newLeafWithContext("second");
  const root = tree.newWithChildren([first, second]);
  const thrown = new Error("first callback stops the session");
  let calls = 0;

  assert.equal(
    captureError(() =>
      compute(tree, root, () => {
        calls += 1;
        throw thrown;
      }),
    ),
    thrown,
  );
  assert.equal(calls, 1);
});

test("layout-nontransactional", () => {
  const tree = new TaffyTree();
  const firstContext = { label: "first" };
  const secondContext = { label: "second" };
  const first = tree.newLeafWithContext(firstContext, { flexGrow: 1 });
  const second = tree.newLeafWithContext(secondContext, { flexGrow: 2 });
  const root = tree.newWithChildren([first, second]);
  const thrown = { reason: "expected" };
  let calls = 0;

  assert.equal(
    captureError(() =>
      compute(tree, root, () => {
        calls += 1;
        throw thrown;
      }),
    ),
    thrown,
  );
  assert.equal(calls, 1);
  assert.equal(tree.getNodeCount(), 3);
  assert.deepEqual(tree.getChildren(root), [first, second]);
  assert.equal(tree.getParent(first), root);
  assert.equal(tree.getParent(second), root);
  assert.equal(tree.getNodeContext(first), firstContext);
  assert.equal(tree.getNodeContext(second), secondContext);
  assert.equal(tree.getStyle(first).flexGrow, 1);
  assert.equal(tree.getStyle(second).flexGrow, 2);
  for (const node of [first, second, root]) assert.equal(tree.isDirty(node), true);

  compute(tree, root, () => ({ width: 20, height: 10 }));
  assert.equal(tree.isDirty(root), false);
});

test("context-identity", () => {
  const tree = new TaffyTree();
  const context = { value: 1 };
  const node = tree.newLeafWithContext(context);

  compute(tree, node, ({ context: received }) => {
    assert.equal(received, context);
    (received as { value: number }).value += 1;
    return { width: 30, height: 10 };
  });

  assert.equal(tree.getNodeContext(node), context);
  assert.equal(context.value, 2);
});

test("recovery", () => {
  const tree = new TaffyTree();
  const node = tree.newLeafWithContext(true);

  assert.equal(
    (captureError(() => compute(tree, node, () => ({ width: 1 }) as never)) as Error).constructor,
    TypeError,
  );
  assert.deepEqual(tree.getStyle(node), tree.getStyle(node));

  let calls = 0;
  compute(tree, node, () => {
    calls += 1;
    return { width: 30, height: 10 };
  });
  assert.equal(calls > 0, true);
  assert.deepEqual(tree.getUnroundedLayout(node).size, { width: 30, height: 10 });
  assert.equal(tree.isDirty(node), false);
});
