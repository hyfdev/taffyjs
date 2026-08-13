import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";
import {
  createCompleteStateFixture,
  maxContentSpace,
  snapshotCompletePublicState,
  type CompleteStateFixture,
  type StateTree,
} from "./fixtures/complete-public-state.mts";

type CodedError = Error & { code?: string };
type MeasureArgs = { context: unknown };
type Tree = StateTree & {
  addChild(parent: bigint, child: bigint): void;
  clear(): void;
  computeLayoutWithMeasure(options: {
    root: bigint;
    availableSpace: object;
    measure(args: MeasureArgs): unknown;
  }): void;
  disableRounding(): void;
  enableRounding(): void;
  getChildAtIndex(parent: bigint, index: number): bigint;
  insertChildAtIndex(parent: bigint, index: number, child: bigint): void;
  markDirty(node: bigint): void;
  newLeaf(style: object): bigint;
  newLeafWithContext(style: object, context: unknown): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  remove(node: bigint): void;
  removeChild(parent: bigint, child: bigint): void;
  removeChildAtIndex(parent: bigint, index: number): bigint;
  removeChildrenRange(parent: bigint, range: { start: number; end: number }): void;
  replaceChildAtIndex(parent: bigint, index: number, newChild: bigint): bigint;
  setChildren(parent: bigint, children: readonly bigint[]): void;
  setNodeContext(node: bigint, context: unknown): void;
  setStyle(node: bigint, style: object): void;
};
type TreeConstructor = new () => Tree;
type FailureKind =
  | "argument-shape"
  | "callback-throw"
  | "child-index-out-of-bounds"
  | "discrete-value"
  | "invalid-topology"
  | "measure-result-shape"
  | "tree-busy";

const FAILURES_BY_METHOD = {
  enableRounding: ["tree-busy"],
  disableRounding: ["tree-busy"],
  newLeaf: ["argument-shape", "discrete-value", "tree-busy"],
  newLeafWithContext: ["argument-shape", "discrete-value", "tree-busy"],
  newWithChildren: ["argument-shape", "discrete-value", "invalid-topology", "tree-busy"],
  clear: ["tree-busy"],
  remove: ["tree-busy"],
  setNodeContext: ["tree-busy"],
  addChild: ["invalid-topology", "tree-busy"],
  insertChildAtIndex: [
    "argument-shape",
    "discrete-value",
    "child-index-out-of-bounds",
    "invalid-topology",
    "tree-busy",
  ],
  setChildren: ["argument-shape", "invalid-topology", "tree-busy"],
  removeChild: ["invalid-topology", "tree-busy"],
  removeChildAtIndex: [
    "argument-shape",
    "discrete-value",
    "child-index-out-of-bounds",
    "tree-busy",
  ],
  removeChildrenRange: ["argument-shape", "discrete-value", "tree-busy"],
  replaceChildAtIndex: [
    "argument-shape",
    "discrete-value",
    "child-index-out-of-bounds",
    "invalid-topology",
    "tree-busy",
  ],
  setStyle: ["argument-shape", "discrete-value", "tree-busy"],
  markDirty: ["tree-busy"],
  computeLayoutWithMeasure: [
    "argument-shape",
    "discrete-value",
    "tree-busy",
    "measure-result-shape",
    "callback-throw",
  ],
  computeLayout: ["argument-shape", "discrete-value", "tree-busy"],
} as const satisfies Record<string, readonly FailureKind[]>;
type Method = keyof typeof FAILURES_BY_METHOD;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  return value as unknown as TreeConstructor;
}

function captureError(body: () => unknown): CodedError {
  try {
    body();
  } catch (error) {
    assert.ok(error instanceof Error);
    return error;
  }
  assert.fail("Expected operation to throw");
}

function captureThrown(body: () => unknown): unknown {
  try {
    body();
  } catch (error) {
    return error;
  }
  assert.fail("Expected operation to throw");
}

function invalidSpace() {
  return {
    width: { kind: 99 },
    height: api.AvailableSpace.MaxContent,
  };
}

function invokeRejectedMutation(
  tree: Tree,
  nodes: CompleteStateFixture<Tree>["nodes"],
  method: Method,
  failureKind: FailureKind,
) {
  switch (`${method}/${failureKind}`) {
    case "newLeaf/argument-shape":
      tree.newLeaf({ unknownField: true });
      return;
    case "newLeaf/discrete-value":
      tree.newLeaf({ display: 999 });
      return;
    case "newLeafWithContext/argument-shape":
      tree.newLeafWithContext({ unknownField: true }, { rejected: true });
      return;
    case "newLeafWithContext/discrete-value":
      tree.newLeafWithContext({ display: 999 }, { rejected: true });
      return;
    case "newWithChildren/argument-shape":
      tree.newWithChildren({}, {} as unknown as readonly bigint[]);
      return;
    case "newWithChildren/discrete-value":
      tree.newWithChildren({ display: 999 }, [nodes.spareB, nodes.spareC]);
      return;
    case "newWithChildren/invalid-topology":
      tree.newWithChildren({}, [nodes.spareB, nodes.spareB]);
      return;
    case "addChild/invalid-topology":
      tree.addChild(nodes.spareA, nodes.childA);
      return;
    case "insertChildAtIndex/argument-shape":
      tree.insertChildAtIndex(nodes.spareA, "0" as unknown as number, nodes.spareB);
      return;
    case "insertChildAtIndex/discrete-value":
      tree.insertChildAtIndex(nodes.spareA, -1, nodes.spareB);
      return;
    case "insertChildAtIndex/child-index-out-of-bounds":
      tree.insertChildAtIndex(nodes.parent, 4, nodes.spareA);
      return;
    case "insertChildAtIndex/invalid-topology":
      tree.insertChildAtIndex(nodes.spareA, 0, nodes.childA);
      return;
    case "setChildren/argument-shape":
      tree.setChildren(nodes.spareA, {} as unknown as readonly bigint[]);
      return;
    case "setChildren/invalid-topology":
      tree.setChildren(nodes.spareA, [nodes.spareB, nodes.spareB]);
      return;
    case "removeChild/invalid-topology":
      tree.removeChild(nodes.parent, nodes.spareA);
      return;
    case "removeChildAtIndex/argument-shape":
      tree.removeChildAtIndex(nodes.parent, "0" as unknown as number);
      return;
    case "removeChildAtIndex/discrete-value":
      tree.removeChildAtIndex(nodes.parent, -1);
      return;
    case "removeChildAtIndex/child-index-out-of-bounds":
      tree.removeChildAtIndex(nodes.parent, 3);
      return;
    case "removeChildrenRange/argument-shape":
      tree.removeChildrenRange(nodes.parent, null as unknown as { start: number; end: number });
      return;
    case "removeChildrenRange/discrete-value":
      tree.removeChildrenRange(nodes.parent, { start: 2, end: 1 });
      return;
    case "replaceChildAtIndex/argument-shape":
      tree.replaceChildAtIndex(nodes.parent, "0" as unknown as number, nodes.spareA);
      return;
    case "replaceChildAtIndex/discrete-value":
      tree.replaceChildAtIndex(nodes.parent, -1, nodes.spareA);
      return;
    case "replaceChildAtIndex/child-index-out-of-bounds":
      tree.replaceChildAtIndex(nodes.parent, 3, nodes.spareA);
      return;
    case "replaceChildAtIndex/invalid-topology":
      tree.replaceChildAtIndex(nodes.parent, 0, nodes.childB);
      return;
    case "setStyle/argument-shape":
      tree.setStyle(nodes.childA, { unknownField: true });
      return;
    case "setStyle/discrete-value":
      tree.setStyle(nodes.childA, { display: 999 });
      return;
    case "computeLayoutWithMeasure/argument-shape":
      tree.computeLayoutWithMeasure({
        root: nodes.root,
        availableSpace: null as unknown as object,
        measure: () => ({ width: 12, height: 8 }),
      });
      return;
    case "computeLayoutWithMeasure/discrete-value":
      tree.computeLayoutWithMeasure({
        root: nodes.root,
        availableSpace: invalidSpace(),
        measure: () => ({ width: 12, height: 8 }),
      });
      return;
    case "computeLayout/argument-shape":
      tree.computeLayout({ root: nodes.root, availableSpace: null as unknown as object });
      return;
    case "computeLayout/discrete-value":
      tree.computeLayout({ root: nodes.root, availableSpace: invalidSpace() });
      return;
    default:
      assert.fail(`Missing rejected-mutation fixture for ${method}/${failureKind}`);
  }
}

function assertFailure(error: CodedError, failureKind: FailureKind, id: string) {
  switch (failureKind) {
    case "argument-shape":
      assert.equal(error.constructor, TypeError, id);
      assert.equal(error.code, undefined, id);
      return;
    case "discrete-value":
      assert.equal(error.constructor, RangeError, id);
      assert.equal(error.code, undefined, id);
      return;
    case "child-index-out-of-bounds":
      assert.equal(error.constructor, RangeError, id);
      assert.equal(error.code, "ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS", id);
      return;
    case "invalid-topology":
      assert.equal(error.constructor, Error, id);
      assert.equal(error.code, "ERR_TAFFY_INVALID_TOPOLOGY", id);
      return;
    default:
      assert.fail(`Missing error assertion for ${failureKind}`);
  }
}

function runBeforeAfter(method: Method, failureKind: FailureKind, label: string) {
  const fixture = createCompleteStateFixture(new (TaffyTree())());
  const before = snapshotCompletePublicState(fixture);
  const error = captureError(() =>
    invokeRejectedMutation(fixture.tree, fixture.nodes, method, failureKind),
  );
  assertFailure(error, failureKind, label);
  assert.deepEqual(snapshotCompletePublicState(fixture), before, label);
  fixture.tree.computeLayout({ root: fixture.nodes.root, availableSpace: maxContentSpace() });
}

function invokeBusyOperation(fixture: CompleteStateFixture<Tree>, method: Method) {
  const { tree, nodes } = fixture;
  switch (method) {
    case "enableRounding":
      tree.enableRounding();
      return;
    case "disableRounding":
      tree.disableRounding();
      return;
    case "newLeaf":
      tree.newLeaf({});
      return;
    case "newLeafWithContext":
      tree.newLeafWithContext({}, "busy");
      return;
    case "newWithChildren":
      tree.newWithChildren({}, [nodes.spareB]);
      return;
    case "clear":
      tree.clear();
      return;
    case "remove":
      tree.remove(nodes.spareA);
      return;
    case "setNodeContext":
      tree.setNodeContext(nodes.childA, "busy");
      return;
    case "addChild":
      tree.addChild(nodes.spareA, nodes.spareB);
      return;
    case "insertChildAtIndex":
      tree.insertChildAtIndex(nodes.spareA, 0, nodes.spareB);
      return;
    case "setChildren":
      tree.setChildren(nodes.spareA, [nodes.spareB, nodes.spareC]);
      return;
    case "removeChild":
      tree.removeChild(nodes.parent, nodes.childA);
      return;
    case "removeChildAtIndex":
      tree.removeChildAtIndex(nodes.parent, 0);
      return;
    case "removeChildrenRange":
      tree.removeChildrenRange(nodes.parent, { start: 0, end: 1 });
      return;
    case "replaceChildAtIndex":
      tree.replaceChildAtIndex(nodes.parent, 0, nodes.spareA);
      return;
    case "setStyle":
      tree.setStyle(nodes.childA, { flexGrow: 2 });
      return;
    case "markDirty":
      tree.markDirty(nodes.childA);
      return;
    case "computeLayoutWithMeasure":
      tree.computeLayoutWithMeasure({
        root: nodes.root,
        availableSpace: maxContentSpace(),
        measure: () => ({ width: 12, height: 8 }),
      });
      return;
    case "computeLayout":
      tree.computeLayout({ root: nodes.root, availableSpace: maxContentSpace() });
      return;
  }
}

function measurement({ context }: MeasureArgs) {
  return context === "child-b" ? { width: 17, height: 9 } : { width: 13, height: 7 };
}

function runControlCompute(method: Method, label: string) {
  const control = createCompleteStateFixture(new (TaffyTree())());
  const attempted = createCompleteStateFixture(new (TaffyTree())());
  control.tree.markDirty(control.nodes.childA);
  attempted.tree.markDirty(attempted.nodes.childA);

  let controlCalls = 0;
  control.tree.computeLayoutWithMeasure({
    root: control.nodes.root,
    availableSpace: maxContentSpace(),
    measure(args) {
      controlCalls += 1;
      return measurement(args);
    },
  });

  let attemptedCalls = 0;
  let busyError: CodedError | undefined;
  attempted.tree.computeLayoutWithMeasure({
    root: attempted.nodes.root,
    availableSpace: maxContentSpace(),
    measure(args) {
      attemptedCalls += 1;
      if (!busyError) busyError = captureError(() => invokeBusyOperation(attempted, method));
      return measurement(args);
    },
  });

  assert.equal(controlCalls > 0, true, `${label} control callback`);
  assert.equal(attemptedCalls, controlCalls, `${label} callback count`);
  assert.ok(busyError, `${label} must attempt the busy operation exactly once`);
  assert.equal(Object.getPrototypeOf(busyError), Error.prototype, `${label} error class`);
  assert.equal(busyError.code, "ERR_TAFFY_TREE_BUSY", label);
  assert.equal(
    busyError.message,
    `Cannot call ${method} on this TaffyTree while it is computing layout from a measure callback`,
    label,
  );
  assert.deepEqual(
    snapshotCompletePublicState(attempted),
    snapshotCompletePublicState(control),
    label,
  );
}

function normalizedNodeLabel(fixture: CompleteStateFixture<Tree>, node: bigint) {
  for (const [label, candidate] of fixture.live) {
    if (candidate === node) return label;
  }
  assert.fail(`Unknown NodeId ${node}`);
}

function snapshotWrapperRegistry(fixture: CompleteStateFixture<Tree>) {
  const { tree } = fixture;
  assert.equal(tree.getNodeCount(), fixture.live.size);
  return Array.from(fixture.live, ([label, node]) => {
    const context = tree.getNodeContext(node);
    if (fixture.contexts.has(label)) assert.equal(context, fixture.contexts.get(label));
    else assert.equal(context, undefined);
    const parent = tree.getParent(node);
    const children = [...tree.getChildren(node)];
    assert.equal(tree.getChildCount(node), children.length);
    return {
      label,
      parent: parent === null ? null : normalizedNodeLabel(fixture, parent),
      children: children.map((child) => normalizedNodeLabel(fixture, child)),
      style: tree.getStyle(node),
      context:
        typeof context === "object" && context !== null ? `context:${label}` : (context ?? null),
    };
  });
}

function runNontransactional(failureKind: "measure-result-shape" | "callback-throw", id: string) {
  const fixture = createCompleteStateFixture(new (TaffyTree())());
  const { tree, nodes } = fixture;

  tree.markDirty(nodes.childA);
  tree.computeLayoutWithMeasure({
    root: nodes.root,
    availableSpace: maxContentSpace(),
    measure: measurement,
  });
  for (const node of [nodes.root, nodes.parent, nodes.childA, nodes.childB, nodes.childC]) {
    assert.equal(tree.isDirty(node), false, `${id} warm computation`);
  }

  for (const node of [nodes.childA, nodes.childB]) tree.markDirty(node);
  let controlCalls = 0;
  tree.computeLayoutWithMeasure({
    root: nodes.root,
    availableSpace: maxContentSpace(),
    measure(args) {
      controlCalls += 1;
      return measurement(args);
    },
  });
  assert.equal(controlCalls >= 2, true, `${id} control must request later callbacks`);

  for (const node of [nodes.childA, nodes.childB]) tree.markDirty(node);
  assert.equal(tree.isDirty(nodes.childA), true);
  assert.equal(tree.isDirty(nodes.childB), true);
  assert.equal(tree.isDirty(nodes.childC), false);
  const wrapperBefore = snapshotWrapperRegistry(fixture);
  const outsideBefore = {
    layout: tree.getLayout(nodes.roundingProbe),
    unroundedLayout: tree.getUnroundedLayout(nodes.roundingProbe),
    details: tree.getDetailedLayoutInfo(nodes.roundingProbe),
    dirty: tree.isDirty(nodes.roundingProbe),
  };
  const thrown = { reason: "expected callback failure" };
  let calls = 0;
  const received = captureThrown(() =>
    tree.computeLayoutWithMeasure({
      root: nodes.root,
      availableSpace: maxContentSpace(),
      measure() {
        calls += 1;
        if (failureKind === "callback-throw") throw thrown;
        return { width: 1 };
      },
    }),
  );

  assert.equal(calls, 1, `${id} must stop calling JavaScript after the first failure`);
  if (failureKind === "callback-throw") assert.equal(received, thrown, id);
  else {
    assert.ok(received instanceof Error, id);
    assert.equal(received.constructor, TypeError, id);
    assert.equal((received as CodedError).code, undefined, id);
  }
  assert.deepEqual(snapshotWrapperRegistry(fixture), wrapperBefore, id);
  assert.deepEqual(
    {
      layout: tree.getLayout(nodes.roundingProbe),
      unroundedLayout: tree.getUnroundedLayout(nodes.roundingProbe),
      details: tree.getDetailedLayoutInfo(nodes.roundingProbe),
      dirty: tree.isDirty(nodes.roundingProbe),
    },
    outsideBefore,
    id,
  );
  for (const node of [nodes.root, nodes.parent, nodes.childA, nodes.childB, nodes.childC]) {
    assert.equal(tree.isDirty(node), true, `${id} requested subtree invalidation`);
  }

  let recoveryCalls = 0;
  tree.computeLayoutWithMeasure({
    root: nodes.root,
    availableSpace: maxContentSpace(),
    measure(args) {
      recoveryCalls += 1;
      return measurement(args);
    },
  });
  assert.equal(recoveryCalls > 0, true, `${id} recovery callback`);
  for (const node of [nodes.root, nodes.parent, nodes.childA, nodes.childB, nodes.childC]) {
    assert.equal(tree.isDirty(node), false, `${id} recovery state`);
  }
  snapshotCompletePublicState(fixture);
}

function runAtomicityCase(method: Method, failureKind: FailureKind) {
  const label = `${method} ${failureKind}`;
  if (failureKind === "tree-busy") {
    runControlCompute(method, label);
    return;
  }
  if (failureKind === "callback-throw" || failureKind === "measure-result-shape") {
    runNontransactional(failureKind, label);
    return;
  }
  runBeforeAfter(method, failureKind, label);
}

for (const method of Object.keys(FAILURES_BY_METHOD) as Method[]) {
  for (const failureKind of FAILURES_BY_METHOD[method] as readonly FailureKind[]) {
    test(method + " " + failureKind, () => runAtomicityCase(method, failureKind));
  }
}
