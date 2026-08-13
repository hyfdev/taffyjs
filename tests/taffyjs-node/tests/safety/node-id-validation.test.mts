import assert from "node:assert/strict";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";
import {
  createCompleteStateFixture,
  maxContentSpace,
  snapshotCompletePublicState,
  type StateTree,
} from "./fixtures/complete-public-state.mts";

type CodedError = Error & { code?: string };
type Tree = StateTree & {
  addChild(parent: bigint, child: bigint): void;
  clear(): void;
  computeLayoutWithMeasure(options: {
    root: bigint;
    availableSpace: object;
    measure(): { width: number; height: number };
  }): void;
  getChildAtIndex(parent: bigint, index: number): bigint;
  markDirty(node: bigint): void;
  remove(node: bigint): void;
  removeChild(parent: bigint, child: bigint): void;
  removeChildAtIndex(parent: bigint, index: number): bigint;
  removeChildrenRange(parent: bigint, range: { start: number; end: number }): void;
  replaceChildAtIndex(parent: bigint, index: number, newChild: bigint): bigint;
  setChildren(parent: bigint, children: readonly bigint[]): void;
  setNodeContext(node: bigint, context: unknown): void;
  setStyle(node: bigint, style: object): void;
  insertChildAtIndex(parent: bigint, index: number, child: bigint): void;
};
type TreeConstructor = new () => Tree;
type CaseKind =
  | "valid"
  | "wrong-type"
  | "malformed"
  | "foreign"
  | "stale-removed"
  | "stale-cleared"
  | "slot-reuse";
type Position = "first" | "middle" | "last";

const SLOT_MASK = (1n << 32n) - 1n;
const INVALID_CASES = [
  "wrong-type",
  "malformed",
  "foreign",
  "stale-removed",
  "stale-cleared",
  "slot-reuse",
] as const satisfies readonly Exclude<CaseKind, "valid">[];
const POSITIONS: readonly Position[] = ["first", "middle", "last"];
const ERROR_BY_CASE = {
  "wrong-type": { ErrorClass: TypeError, code: undefined },
  malformed: { ErrorClass: Error, code: "ERR_TAFFY_INVALID_NODE_ID" },
  foreign: { ErrorClass: Error, code: "ERR_TAFFY_FOREIGN_NODE_ID" },
  "stale-removed": { ErrorClass: Error, code: "ERR_TAFFY_STALE_NODE_ID" },
  "stale-cleared": { ErrorClass: Error, code: "ERR_TAFFY_STALE_NODE_ID" },
  "slot-reuse": { ErrorClass: Error, code: "ERR_TAFFY_STALE_NODE_ID" },
} as const;
const ROLE_BINDINGS = [
  ["newWithChildren", "children-element", "children[]"],
  ["remove", "node", "node"],
  ["setNodeContext", "node", "node"],
  ["getNodeContext", "node", "node"],
  ["addChild", "parent", "parent"],
  ["addChild", "child", "child"],
  ["insertChildAtIndex", "parent", "parent"],
  ["insertChildAtIndex", "child", "child"],
  ["setChildren", "parent", "parent"],
  ["setChildren", "children-element", "children[]"],
  ["removeChild", "parent", "parent"],
  ["removeChild", "child", "child"],
  ["removeChildAtIndex", "parent", "parent"],
  ["removeChildrenRange", "parent", "parent"],
  ["replaceChildAtIndex", "parent", "parent"],
  ["replaceChildAtIndex", "new-child", "newChild"],
  ["getChildAtIndex", "parent", "parent"],
  ["getChildCount", "parent", "parent"],
  ["getParent", "node", "node"],
  ["getChildren", "parent", "parent"],
  ["setStyle", "node", "node"],
  ["getStyle", "node", "node"],
  ["getLayout", "node", "node"],
  ["getUnroundedLayout", "node", "node"],
  ["getDetailedLayoutInfo", "node", "node"],
  ["markDirty", "node", "node"],
  ["isDirty", "node", "node"],
  ["computeLayoutWithMeasure", "root", "options.root"],
  ["computeLayout", "root", "options.root"],
] as const;
type Method = (typeof ROLE_BINDINGS)[number][0];
type NodeIdCase = {
  method: Method;
  role: string;
  caseKind: CaseKind;
  position?: Position;
};

const MUTATION_METHODS = new Set<Method>([
  "newWithChildren",
  "remove",
  "setNodeContext",
  "addChild",
  "insertChildAtIndex",
  "setChildren",
  "removeChild",
  "removeChildAtIndex",
  "removeChildrenRange",
  "replaceChildAtIndex",
  "setStyle",
  "markDirty",
  "computeLayoutWithMeasure",
  "computeLayout",
]);

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

function prepareCase(caseKind: CaseKind) {
  const tree = new (TaffyTree())();
  let staleCleared: bigint | undefined;
  if (caseKind === "stale-cleared") {
    staleCleared = tree.newLeaf({});
    tree.clear();
  }

  const fixture = createCompleteStateFixture(tree);
  let invalidNode: unknown;
  switch (caseKind) {
    case "valid":
      break;
    case "wrong-type":
      invalidNode = 1;
      break;
    case "malformed":
      invalidNode = 0n;
      break;
    case "foreign":
      invalidNode = new (TaffyTree())().newLeaf({});
      break;
    case "stale-removed": {
      const removed = tree.newLeaf({});
      tree.remove(removed);
      invalidNode = removed;
      break;
    }
    case "stale-cleared":
      assert.ok(staleCleared);
      invalidNode = staleCleared;
      break;
    case "slot-reuse": {
      const removed = tree.newLeaf({});
      tree.remove(removed);
      const replacement = tree.newLeaf({ flexGrow: 5 });
      assert.equal(removed & SLOT_MASK, replacement & SLOT_MASK, "fixture must reuse a slot");
      assert.notEqual(removed, replacement);
      fixture.live.set("slotReplacement", replacement);
      invalidNode = removed;
      break;
    }
  }
  return { fixture, invalidNode };
}

function invokeCase(
  tree: Tree,
  nodes: ReturnType<typeof createCompleteStateFixture<Tree>>["nodes"],
  method: Method,
  role: string,
  caseKind: CaseKind,
  position: Position | undefined,
  invalidNode: unknown,
) {
  const selected = (valid: bigint) => (caseKind === "valid" ? valid : (invalidNode as bigint));
  const collection = () => {
    const children = [nodes.spareB, nodes.spareC, nodes.spareD];
    if (caseKind !== "valid") {
      const index = { first: 0, middle: 1, last: 2 }[position as Position];
      children[index] = invalidNode as bigint;
    }
    return children;
  };

  switch (method) {
    case "newWithChildren":
      tree.newWithChildren({}, collection());
      return;
    case "remove":
      tree.remove(selected(nodes.spareA));
      return;
    case "setNodeContext":
      tree.setNodeContext(selected(nodes.childA), { updated: true });
      return;
    case "getNodeContext":
      tree.getNodeContext(selected(nodes.childA));
      return;
    case "addChild":
      tree.addChild(
        role === "parent" ? selected(nodes.spareA) : nodes.spareA,
        role === "child" ? selected(nodes.spareB) : nodes.spareB,
      );
      return;
    case "insertChildAtIndex":
      tree.insertChildAtIndex(
        role === "parent" ? selected(nodes.spareA) : nodes.spareA,
        0,
        role === "child" ? selected(nodes.spareB) : nodes.spareB,
      );
      return;
    case "setChildren":
      tree.setChildren(
        role === "parent" ? selected(nodes.spareA) : nodes.spareA,
        role === "children-element" ? collection() : [nodes.spareB, nodes.spareC, nodes.spareD],
      );
      return;
    case "removeChild":
      tree.removeChild(
        role === "parent" ? selected(nodes.parent) : nodes.parent,
        role === "child" ? selected(nodes.childA) : nodes.childA,
      );
      return;
    case "removeChildAtIndex":
      tree.removeChildAtIndex(selected(nodes.parent), 0);
      return;
    case "removeChildrenRange":
      tree.removeChildrenRange(selected(nodes.parent), { start: 0, end: 1 });
      return;
    case "replaceChildAtIndex":
      tree.replaceChildAtIndex(
        role === "parent" ? selected(nodes.parent) : nodes.parent,
        0,
        role === "new-child" ? selected(nodes.spareA) : nodes.spareA,
      );
      return;
    case "getChildAtIndex":
      tree.getChildAtIndex(selected(nodes.parent), 0);
      return;
    case "getChildCount":
      tree.getChildCount(selected(nodes.parent));
      return;
    case "getParent":
      tree.getParent(selected(nodes.childA));
      return;
    case "getChildren":
      tree.getChildren(selected(nodes.parent));
      return;
    case "setStyle":
      tree.setStyle(selected(nodes.childA), { flexGrow: 2 });
      return;
    case "getStyle":
      tree.getStyle(selected(nodes.childA));
      return;
    case "getLayout":
      tree.getLayout(selected(nodes.childA));
      return;
    case "getUnroundedLayout":
      tree.getUnroundedLayout(selected(nodes.childA));
      return;
    case "getDetailedLayoutInfo":
      tree.getDetailedLayoutInfo(selected(nodes.childA));
      return;
    case "markDirty":
      tree.markDirty(selected(nodes.childA));
      return;
    case "isDirty":
      tree.isDirty(selected(nodes.childA));
      return;
    case "computeLayoutWithMeasure":
      tree.computeLayoutWithMeasure({
        root: selected(nodes.root),
        availableSpace: maxContentSpace(),
        measure: () => ({ width: 12, height: 8 }),
      });
      return;
    case "computeLayout":
      tree.computeLayout({
        root: selected(nodes.root),
        availableSpace: maxContentSpace(),
      });
      return;
    default:
      assert.fail(`Missing NodeId fixture for ${String(method)}/${role}`);
  }
}

function assertTreeUsable(tree: Tree, root: bigint) {
  assert.equal(tree.getNodeCount() > 0, true);
  assert.equal(typeof tree.getStyle(root), "object");
  tree.computeLayout({ root, availableSpace: maxContentSpace() });
  assert.equal(typeof tree.getLayout(root), "object");
}

function runNodeIdCase({ method, role, caseKind, position }: NodeIdCase) {
  const label = [method, role, caseKind, position].filter(Boolean).join(" ");
  const { fixture, invalidNode } = prepareCase(caseKind);
  const { tree, nodes } = fixture;
  const compareState = caseKind !== "valid" && MUTATION_METHODS.has(method);
  const before = compareState ? snapshotCompletePublicState(fixture) : undefined;

  if (caseKind === "valid") {
    invokeCase(tree, nodes, method, role, caseKind, position, invalidNode);
  } else {
    const error = captureError(() =>
      invokeCase(tree, nodes, method, role, caseKind, position, invalidNode),
    );
    const expected = ERROR_BY_CASE[caseKind];
    assert.equal(error.constructor, expected.ErrorClass, label);
    assert.equal(error.code, expected.code, label);
    assert.notEqual(error.code, "ERR_TAFFY_PANIC", label);
  }

  if (before) assert.deepEqual(snapshotCompletePublicState(fixture), before, label);
  assertTreeUsable(tree, nodes.root);
}

const nodeIdCases: NodeIdCase[] = ROLE_BINDINGS.flatMap(([method, role, path]) => {
  const cases: NodeIdCase[] = [{ method, role, caseKind: "valid" }];
  for (const caseKind of INVALID_CASES) {
    if (path.endsWith("[]")) {
      for (const position of POSITIONS) cases.push({ method, role, caseKind, position });
    } else {
      cases.push({ method, role, caseKind });
    }
  }
  return cases;
});

for (const nodeIdCase of nodeIdCases) {
  const title = [nodeIdCase.method, nodeIdCase.role, nodeIdCase.caseKind, nodeIdCase.position]
    .filter(Boolean)
    .join(" ");
  test(title, () => runNodeIdCase(nodeIdCase));
}
