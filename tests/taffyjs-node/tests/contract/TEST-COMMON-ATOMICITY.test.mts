import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";
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
  | "node-id-serial-exhaustion"
  | "tree-busy";

const MEMBER_BY_OWNER = {
  "API-TREE-002": "enableRounding",
  "API-TREE-003": "disableRounding",
  "API-TREE-004": "newLeaf",
  "API-TREE-005": "newLeafWithContext",
  "API-TREE-006": "newWithChildren",
  "API-TREE-007": "clear",
  "API-TREE-008": "remove",
  "API-TREE-009": "setNodeContext",
  "API-TREE-011": "addChild",
  "API-TREE-012": "insertChildAtIndex",
  "API-TREE-013": "setChildren",
  "API-TREE-014": "removeChild",
  "API-TREE-015": "removeChildAtIndex",
  "API-TREE-016": "removeChildrenRange",
  "API-TREE-017": "replaceChildAtIndex",
  "API-TREE-023": "setStyle",
  "API-TREE-028": "markDirty",
  "API-TREE-030": "computeLayoutWithMeasure",
  "API-TREE-031": "computeLayout",
} as const;

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

function parseAtomicityId(id: string) {
  const [prefix, owner, failureKind, extra] = id.split("/");
  assert.equal(prefix, "ATOMICITY");
  assert.equal(extra, undefined);
  assert.ok(owner in MEMBER_BY_OWNER, `${id} has an unknown mutation owner`);
  return { owner: owner as keyof typeof MEMBER_BY_OWNER, failureKind: failureKind as FailureKind };
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
  owner: keyof typeof MEMBER_BY_OWNER,
  failureKind: FailureKind,
) {
  switch (`${owner}/${failureKind}`) {
    case "API-TREE-004/argument-shape":
      tree.newLeaf({ unknownField: true });
      return;
    case "API-TREE-004/discrete-value":
      tree.newLeaf({ display: 999 });
      return;
    case "API-TREE-005/argument-shape":
      tree.newLeafWithContext({ unknownField: true }, { rejected: true });
      return;
    case "API-TREE-005/discrete-value":
      tree.newLeafWithContext({ display: 999 }, { rejected: true });
      return;
    case "API-TREE-006/argument-shape":
      tree.newWithChildren({}, {} as unknown as readonly bigint[]);
      return;
    case "API-TREE-006/discrete-value":
      tree.newWithChildren({ display: 999 }, [nodes.spareB, nodes.spareC]);
      return;
    case "API-TREE-006/invalid-topology":
      tree.newWithChildren({}, [nodes.spareB, nodes.spareB]);
      return;
    case "API-TREE-011/invalid-topology":
      tree.addChild(nodes.spareA, nodes.childA);
      return;
    case "API-TREE-012/argument-shape":
      tree.insertChildAtIndex(nodes.spareA, "0" as unknown as number, nodes.spareB);
      return;
    case "API-TREE-012/discrete-value":
      tree.insertChildAtIndex(nodes.spareA, -1, nodes.spareB);
      return;
    case "API-TREE-012/child-index-out-of-bounds":
      tree.insertChildAtIndex(nodes.parent, 4, nodes.spareA);
      return;
    case "API-TREE-012/invalid-topology":
      tree.insertChildAtIndex(nodes.spareA, 0, nodes.childA);
      return;
    case "API-TREE-013/argument-shape":
      tree.setChildren(nodes.spareA, {} as unknown as readonly bigint[]);
      return;
    case "API-TREE-013/invalid-topology":
      tree.setChildren(nodes.spareA, [nodes.spareB, nodes.spareB]);
      return;
    case "API-TREE-014/invalid-topology":
      tree.removeChild(nodes.parent, nodes.spareA);
      return;
    case "API-TREE-015/argument-shape":
      tree.removeChildAtIndex(nodes.parent, "0" as unknown as number);
      return;
    case "API-TREE-015/discrete-value":
      tree.removeChildAtIndex(nodes.parent, -1);
      return;
    case "API-TREE-015/child-index-out-of-bounds":
      tree.removeChildAtIndex(nodes.parent, 3);
      return;
    case "API-TREE-016/argument-shape":
      tree.removeChildrenRange(nodes.parent, null as unknown as { start: number; end: number });
      return;
    case "API-TREE-016/discrete-value":
      tree.removeChildrenRange(nodes.parent, { start: 2, end: 1 });
      return;
    case "API-TREE-017/argument-shape":
      tree.replaceChildAtIndex(nodes.parent, "0" as unknown as number, nodes.spareA);
      return;
    case "API-TREE-017/discrete-value":
      tree.replaceChildAtIndex(nodes.parent, -1, nodes.spareA);
      return;
    case "API-TREE-017/child-index-out-of-bounds":
      tree.replaceChildAtIndex(nodes.parent, 3, nodes.spareA);
      return;
    case "API-TREE-017/invalid-topology":
      tree.replaceChildAtIndex(nodes.parent, 0, nodes.childB);
      return;
    case "API-TREE-023/argument-shape":
      tree.setStyle(nodes.childA, { unknownField: true });
      return;
    case "API-TREE-023/discrete-value":
      tree.setStyle(nodes.childA, { display: 999 });
      return;
    case "API-TREE-030/argument-shape":
      tree.computeLayoutWithMeasure({
        root: nodes.root,
        availableSpace: null as unknown as object,
        measure: () => ({ width: 12, height: 8 }),
      });
      return;
    case "API-TREE-030/discrete-value":
      tree.computeLayoutWithMeasure({
        root: nodes.root,
        availableSpace: invalidSpace(),
        measure: () => ({ width: 12, height: 8 }),
      });
      return;
    case "API-TREE-031/argument-shape":
      tree.computeLayout({ root: nodes.root, availableSpace: null as unknown as object });
      return;
    case "API-TREE-031/discrete-value":
      tree.computeLayout({ root: nodes.root, availableSpace: invalidSpace() });
      return;
    default:
      assert.fail(`Missing rejected-mutation fixture for ${owner}/${failureKind}`);
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

function runBeforeAfter(owner: keyof typeof MEMBER_BY_OWNER, failureKind: FailureKind, id: string) {
  const fixture = createCompleteStateFixture(new (TaffyTree())());
  const before = snapshotCompletePublicState(fixture);
  const error = captureError(() =>
    invokeRejectedMutation(fixture.tree, fixture.nodes, owner, failureKind),
  );
  assertFailure(error, failureKind, id);
  assert.deepEqual(snapshotCompletePublicState(fixture), before, id);
  fixture.tree.computeLayout({ root: fixture.nodes.root, availableSpace: maxContentSpace() });
}

function invokeBusyOperation(
  fixture: CompleteStateFixture<Tree>,
  owner: keyof typeof MEMBER_BY_OWNER,
) {
  const { tree, nodes } = fixture;
  switch (owner) {
    case "API-TREE-002":
      tree.enableRounding();
      return;
    case "API-TREE-003":
      tree.disableRounding();
      return;
    case "API-TREE-004":
      tree.newLeaf({});
      return;
    case "API-TREE-005":
      tree.newLeafWithContext({}, "busy");
      return;
    case "API-TREE-006":
      tree.newWithChildren({}, [nodes.spareB]);
      return;
    case "API-TREE-007":
      tree.clear();
      return;
    case "API-TREE-008":
      tree.remove(nodes.spareA);
      return;
    case "API-TREE-009":
      tree.setNodeContext(nodes.childA, "busy");
      return;
    case "API-TREE-011":
      tree.addChild(nodes.spareA, nodes.spareB);
      return;
    case "API-TREE-012":
      tree.insertChildAtIndex(nodes.spareA, 0, nodes.spareB);
      return;
    case "API-TREE-013":
      tree.setChildren(nodes.spareA, [nodes.spareB, nodes.spareC]);
      return;
    case "API-TREE-014":
      tree.removeChild(nodes.parent, nodes.childA);
      return;
    case "API-TREE-015":
      tree.removeChildAtIndex(nodes.parent, 0);
      return;
    case "API-TREE-016":
      tree.removeChildrenRange(nodes.parent, { start: 0, end: 1 });
      return;
    case "API-TREE-017":
      tree.replaceChildAtIndex(nodes.parent, 0, nodes.spareA);
      return;
    case "API-TREE-023":
      tree.setStyle(nodes.childA, { flexGrow: 2 });
      return;
    case "API-TREE-028":
      tree.markDirty(nodes.childA);
      return;
    case "API-TREE-030":
      tree.computeLayoutWithMeasure({
        root: nodes.root,
        availableSpace: maxContentSpace(),
        measure: () => ({ width: 12, height: 8 }),
      });
      return;
    case "API-TREE-031":
      tree.computeLayout({ root: nodes.root, availableSpace: maxContentSpace() });
      return;
  }
}

function measurement({ context }: MeasureArgs) {
  return context === "child-b" ? { width: 17, height: 9 } : { width: 13, height: 7 };
}

function runControlCompute(owner: keyof typeof MEMBER_BY_OWNER, id: string) {
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
      if (!busyError) busyError = captureError(() => invokeBusyOperation(attempted, owner));
      return measurement(args);
    },
  });

  assert.equal(controlCalls > 0, true, `${id} control callback`);
  assert.equal(attemptedCalls, controlCalls, `${id} callback count`);
  assert.ok(busyError, `${id} must attempt the busy operation exactly once`);
  assert.equal(Object.getPrototypeOf(busyError), Error.prototype, `${id} error class`);
  assert.equal(busyError.code, "ERR_TAFFY_TREE_BUSY", id);
  assert.equal(
    busyError.message,
    `Cannot call ${MEMBER_BY_OWNER[owner]} on this TaffyTree while it is computing layout from a measure callback`,
    id,
  );
  assert.deepEqual(
    snapshotCompletePublicState(attempted),
    snapshotCompletePublicState(control),
    id,
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

function runAtomicityCase(id: string) {
  const { owner, failureKind } = parseAtomicityId(id);
  if (failureKind === "tree-busy") {
    runControlCompute(owner, id);
    return;
  }
  if (failureKind === "callback-throw" || failureKind === "measure-result-shape") {
    runNontransactional(failureKind, id);
    return;
  }
  assert.notEqual(failureKind, "node-id-serial-exhaustion", `${id} belongs to wrapper tests`);
  runBeforeAfter(owner, failureKind, id);
}

type AtomicityRecord = {
  apiOwner: string;
  comparison: "before-after" | "control-compute" | "nontransactional";
  failureKind: FailureKind;
  id: string;
  modality: "public-js" | "wrapper-js";
  path: string;
};
type Contract = {
  generated: {
    evidence: {
      atomicity: AtomicityRecord[];
      nodeId: Array<{ id: string; apiOwner: string; caseKind: string }>;
    };
  };
  publicClassMembersByOwner: Record<string, string[]>;
  publicMutationFailuresByOwner: Record<string, FailureKind[]>;
};

async function readContract(): Promise<Contract> {
  return JSON.parse(
    await readFile(new URL("../../../../tools/taffy-api/contract.json", import.meta.url), "utf8"),
  ) as Contract;
}

contractTest("TEST-COMMON-ATOMICITY/mutation-bijection", async () => {
  const contract = await readContract();
  assert.equal(Object.keys(contract.publicMutationFailuresByOwner).length, 19);
  assert.deepEqual(
    Object.keys(MEMBER_BY_OWNER),
    Object.keys(contract.publicMutationFailuresByOwner),
  );
  for (const [owner, member] of Object.entries(MEMBER_BY_OWNER)) {
    assert.deepEqual(contract.publicClassMembersByOwner[owner], [member], owner);
  }

  const expectedPairs = Object.entries(contract.publicMutationFailuresByOwner).flatMap(
    ([owner, failures]) => failures.map((failure) => `ATOMICITY/${owner}/${failure}`),
  );
  assert.deepEqual(
    contract.generated.evidence.atomicity.map(({ id }) => id),
    expectedPairs,
  );
  assert.equal(new Set(expectedPairs).size, 54);

  const publicSource = await readFile(fileURLToPath(import.meta.url), "utf8");
  const wrapperSource = await readFile(
    new URL(
      "../../../../packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts",
      import.meta.url,
    ),
    "utf8",
  );
  const registered = [publicSource, wrapperSource].flatMap((source) =>
    Array.from(
      source.matchAll(/contractTest\("(ATOMICITY\/[A-Z0-9-]+\/[a-z-]+)"/g),
      (match) => match[1],
    ),
  );
  assert.equal(registered.length, 54);
  assert.deepEqual(new Set(registered), new Set(expectedPairs));

  const mutationOwners = new Set(Object.keys(contract.publicMutationFailuresByOwner));
  const mutatingNodeIdFailures = contract.generated.evidence.nodeId.filter(
    ({ apiOwner, caseKind }) => caseKind !== "valid" && mutationOwners.has(apiOwner),
  );
  assert.equal(mutatingNodeIdFailures.length, 138);
  assert.equal(new Set(mutatingNodeIdFailures.map(({ id }) => id)).size, 138);
});

contractTest("TEST-COMMON-ATOMICITY/state-equality", async () => {
  const contract = await readContract();
  for (const record of contract.generated.evidence.atomicity) {
    if (record.modality === "public-js" && record.comparison !== "nontransactional") {
      runAtomicityCase(record.id);
    }
  }
});

contractTest("TEST-COMMON-ATOMICITY/callback-exception", () => {
  runAtomicityCase("ATOMICITY/API-TREE-030/measure-result-shape");
  runAtomicityCase("ATOMICITY/API-TREE-030/callback-throw");
});

// The contract checker requires every public generated ID as a top-level literal call.
// The three serial-exhaustion IDs live in the private wrapper test named by the contract.

contractTest("ATOMICITY/API-TREE-002/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-002/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-003/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-003/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-004/argument-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-004/argument-shape"),
);
contractTest("ATOMICITY/API-TREE-004/discrete-value", () =>
  runAtomicityCase("ATOMICITY/API-TREE-004/discrete-value"),
);
contractTest("ATOMICITY/API-TREE-004/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-004/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-005/argument-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-005/argument-shape"),
);
contractTest("ATOMICITY/API-TREE-005/discrete-value", () =>
  runAtomicityCase("ATOMICITY/API-TREE-005/discrete-value"),
);
contractTest("ATOMICITY/API-TREE-005/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-005/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-006/argument-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-006/argument-shape"),
);
contractTest("ATOMICITY/API-TREE-006/discrete-value", () =>
  runAtomicityCase("ATOMICITY/API-TREE-006/discrete-value"),
);
contractTest("ATOMICITY/API-TREE-006/invalid-topology", () =>
  runAtomicityCase("ATOMICITY/API-TREE-006/invalid-topology"),
);
contractTest("ATOMICITY/API-TREE-006/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-006/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-007/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-007/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-008/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-008/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-009/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-009/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-011/invalid-topology", () =>
  runAtomicityCase("ATOMICITY/API-TREE-011/invalid-topology"),
);
contractTest("ATOMICITY/API-TREE-011/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-011/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-012/argument-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-012/argument-shape"),
);
contractTest("ATOMICITY/API-TREE-012/discrete-value", () =>
  runAtomicityCase("ATOMICITY/API-TREE-012/discrete-value"),
);
contractTest("ATOMICITY/API-TREE-012/child-index-out-of-bounds", () =>
  runAtomicityCase("ATOMICITY/API-TREE-012/child-index-out-of-bounds"),
);
contractTest("ATOMICITY/API-TREE-012/invalid-topology", () =>
  runAtomicityCase("ATOMICITY/API-TREE-012/invalid-topology"),
);
contractTest("ATOMICITY/API-TREE-012/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-012/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-013/argument-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-013/argument-shape"),
);
contractTest("ATOMICITY/API-TREE-013/invalid-topology", () =>
  runAtomicityCase("ATOMICITY/API-TREE-013/invalid-topology"),
);
contractTest("ATOMICITY/API-TREE-013/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-013/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-014/invalid-topology", () =>
  runAtomicityCase("ATOMICITY/API-TREE-014/invalid-topology"),
);
contractTest("ATOMICITY/API-TREE-014/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-014/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-015/argument-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-015/argument-shape"),
);
contractTest("ATOMICITY/API-TREE-015/discrete-value", () =>
  runAtomicityCase("ATOMICITY/API-TREE-015/discrete-value"),
);
contractTest("ATOMICITY/API-TREE-015/child-index-out-of-bounds", () =>
  runAtomicityCase("ATOMICITY/API-TREE-015/child-index-out-of-bounds"),
);
contractTest("ATOMICITY/API-TREE-015/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-015/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-016/argument-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-016/argument-shape"),
);
contractTest("ATOMICITY/API-TREE-016/discrete-value", () =>
  runAtomicityCase("ATOMICITY/API-TREE-016/discrete-value"),
);
contractTest("ATOMICITY/API-TREE-016/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-016/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-017/argument-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-017/argument-shape"),
);
contractTest("ATOMICITY/API-TREE-017/discrete-value", () =>
  runAtomicityCase("ATOMICITY/API-TREE-017/discrete-value"),
);
contractTest("ATOMICITY/API-TREE-017/child-index-out-of-bounds", () =>
  runAtomicityCase("ATOMICITY/API-TREE-017/child-index-out-of-bounds"),
);
contractTest("ATOMICITY/API-TREE-017/invalid-topology", () =>
  runAtomicityCase("ATOMICITY/API-TREE-017/invalid-topology"),
);
contractTest("ATOMICITY/API-TREE-017/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-017/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-023/argument-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-023/argument-shape"),
);
contractTest("ATOMICITY/API-TREE-023/discrete-value", () =>
  runAtomicityCase("ATOMICITY/API-TREE-023/discrete-value"),
);
contractTest("ATOMICITY/API-TREE-023/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-023/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-028/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-028/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-030/argument-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-030/argument-shape"),
);
contractTest("ATOMICITY/API-TREE-030/discrete-value", () =>
  runAtomicityCase("ATOMICITY/API-TREE-030/discrete-value"),
);
contractTest("ATOMICITY/API-TREE-030/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-030/tree-busy"),
);
contractTest("ATOMICITY/API-TREE-030/measure-result-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-030/measure-result-shape"),
);
contractTest("ATOMICITY/API-TREE-030/callback-throw", () =>
  runAtomicityCase("ATOMICITY/API-TREE-030/callback-throw"),
);
contractTest("ATOMICITY/API-TREE-031/argument-shape", () =>
  runAtomicityCase("ATOMICITY/API-TREE-031/argument-shape"),
);
contractTest("ATOMICITY/API-TREE-031/discrete-value", () =>
  runAtomicityCase("ATOMICITY/API-TREE-031/discrete-value"),
);
contractTest("ATOMICITY/API-TREE-031/tree-busy", () =>
  runAtomicityCase("ATOMICITY/API-TREE-031/tree-busy"),
);
