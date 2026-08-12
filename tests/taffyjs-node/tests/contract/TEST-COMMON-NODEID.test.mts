import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as api from "@taffyjs/node";
import { contractTest } from "../contract-test.mts";
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
const CASE_ORDER: readonly CaseKind[] = [
  "valid",
  "wrong-type",
  "malformed",
  "foreign",
  "stale-removed",
  "stale-cleared",
  "slot-reuse",
];
const INVALID_CASE_ORDER = CASE_ORDER.slice(1) as readonly Exclude<CaseKind, "valid">[];
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
  ["API-TREE-006", "children-element", "children[]", "newWithChildren"],
  ["API-TREE-008", "node", "node", "remove"],
  ["API-TREE-009", "node", "node", "setNodeContext"],
  ["API-TREE-010", "node", "node", "getNodeContext"],
  ["API-TREE-011", "parent", "parent", "addChild"],
  ["API-TREE-011", "child", "child", "addChild"],
  ["API-TREE-012", "parent", "parent", "insertChildAtIndex"],
  ["API-TREE-012", "child", "child", "insertChildAtIndex"],
  ["API-TREE-013", "parent", "parent", "setChildren"],
  ["API-TREE-013", "children-element", "children[]", "setChildren"],
  ["API-TREE-014", "parent", "parent", "removeChild"],
  ["API-TREE-014", "child", "child", "removeChild"],
  ["API-TREE-015", "parent", "parent", "removeChildAtIndex"],
  ["API-TREE-016", "parent", "parent", "removeChildrenRange"],
  ["API-TREE-017", "parent", "parent", "replaceChildAtIndex"],
  ["API-TREE-017", "new-child", "newChild", "replaceChildAtIndex"],
  ["API-TREE-018", "parent", "parent", "getChildAtIndex"],
  ["API-TREE-019", "parent", "parent", "getChildCount"],
  ["API-TREE-021", "node", "node", "getParent"],
  ["API-TREE-022", "parent", "parent", "getChildren"],
  ["API-TREE-023", "node", "node", "setStyle"],
  ["API-TREE-024", "node", "node", "getStyle"],
  ["API-TREE-025", "node", "node", "getLayout"],
  ["API-TREE-026", "node", "node", "getUnroundedLayout"],
  ["API-TREE-027", "node", "node", "getDetailedLayoutInfo"],
  ["API-TREE-028", "node", "node", "markDirty"],
  ["API-TREE-029", "node", "node", "isDirty"],
  ["API-TREE-030", "root", "options.root", "computeLayoutWithMeasure"],
  ["API-TREE-031", "root", "options.root", "computeLayout"],
] as const;
const MUTATION_OWNERS = new Set([
  "API-TREE-006",
  "API-TREE-008",
  "API-TREE-009",
  "API-TREE-011",
  "API-TREE-012",
  "API-TREE-013",
  "API-TREE-014",
  "API-TREE-015",
  "API-TREE-016",
  "API-TREE-017",
  "API-TREE-023",
  "API-TREE-028",
  "API-TREE-030",
  "API-TREE-031",
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

function parseNodeIdCase(id: string) {
  const [prefix, owner, role, caseKind, position] = id.split("/");
  assert.equal(prefix, "NODEID");
  assert.ok(CASE_ORDER.includes(caseKind as CaseKind), `${id} has an unknown case kind`);
  const binding = ROLE_BINDINGS.find(
    ([candidateOwner, candidateRole]) => candidateOwner === owner && candidateRole === role,
  );
  assert.ok(binding, `${id} has an unknown role`);
  const isCollection = binding[2].endsWith("[]");
  if (isCollection && caseKind !== "valid") {
    assert.ok(POSITIONS.includes(position as Position), `${id} needs a collection position`);
  } else {
    assert.equal(position, undefined, `${id} must not have a position`);
  }
  return {
    owner,
    role,
    caseKind: caseKind as CaseKind,
    position: position as Position | undefined,
  };
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
  owner: string,
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

  switch (owner) {
    case "API-TREE-006":
      tree.newWithChildren({}, collection());
      return;
    case "API-TREE-008":
      tree.remove(selected(nodes.spareA));
      return;
    case "API-TREE-009":
      tree.setNodeContext(selected(nodes.childA), { updated: true });
      return;
    case "API-TREE-010":
      tree.getNodeContext(selected(nodes.childA));
      return;
    case "API-TREE-011":
      tree.addChild(
        role === "parent" ? selected(nodes.spareA) : nodes.spareA,
        role === "child" ? selected(nodes.spareB) : nodes.spareB,
      );
      return;
    case "API-TREE-012":
      tree.insertChildAtIndex(
        role === "parent" ? selected(nodes.spareA) : nodes.spareA,
        0,
        role === "child" ? selected(nodes.spareB) : nodes.spareB,
      );
      return;
    case "API-TREE-013":
      tree.setChildren(
        role === "parent" ? selected(nodes.spareA) : nodes.spareA,
        role === "children-element" ? collection() : [nodes.spareB, nodes.spareC, nodes.spareD],
      );
      return;
    case "API-TREE-014":
      tree.removeChild(
        role === "parent" ? selected(nodes.parent) : nodes.parent,
        role === "child" ? selected(nodes.childA) : nodes.childA,
      );
      return;
    case "API-TREE-015":
      tree.removeChildAtIndex(selected(nodes.parent), 0);
      return;
    case "API-TREE-016":
      tree.removeChildrenRange(selected(nodes.parent), { start: 0, end: 1 });
      return;
    case "API-TREE-017":
      tree.replaceChildAtIndex(
        role === "parent" ? selected(nodes.parent) : nodes.parent,
        0,
        role === "new-child" ? selected(nodes.spareA) : nodes.spareA,
      );
      return;
    case "API-TREE-018":
      tree.getChildAtIndex(selected(nodes.parent), 0);
      return;
    case "API-TREE-019":
      tree.getChildCount(selected(nodes.parent));
      return;
    case "API-TREE-021":
      tree.getParent(selected(nodes.childA));
      return;
    case "API-TREE-022":
      tree.getChildren(selected(nodes.parent));
      return;
    case "API-TREE-023":
      tree.setStyle(selected(nodes.childA), { flexGrow: 2 });
      return;
    case "API-TREE-024":
      tree.getStyle(selected(nodes.childA));
      return;
    case "API-TREE-025":
      tree.getLayout(selected(nodes.childA));
      return;
    case "API-TREE-026":
      tree.getUnroundedLayout(selected(nodes.childA));
      return;
    case "API-TREE-027":
      tree.getDetailedLayoutInfo(selected(nodes.childA));
      return;
    case "API-TREE-028":
      tree.markDirty(selected(nodes.childA));
      return;
    case "API-TREE-029":
      tree.isDirty(selected(nodes.childA));
      return;
    case "API-TREE-030":
      tree.computeLayoutWithMeasure({
        root: selected(nodes.root),
        availableSpace: maxContentSpace(),
        measure: () => ({ width: 12, height: 8 }),
      });
      return;
    case "API-TREE-031":
      tree.computeLayout({
        root: selected(nodes.root),
        availableSpace: maxContentSpace(),
      });
      return;
    default:
      assert.fail(`Missing NodeId fixture for ${owner}/${role}`);
  }
}

function assertTreeUsable(tree: Tree, root: bigint) {
  assert.equal(tree.getNodeCount() > 0, true);
  assert.equal(typeof tree.getStyle(root), "object");
  tree.computeLayout({ root, availableSpace: maxContentSpace() });
  assert.equal(typeof tree.getLayout(root), "object");
}

function runNodeIdCase(id: string) {
  const { owner, role, caseKind, position } = parseNodeIdCase(id);
  const { fixture, invalidNode } = prepareCase(caseKind);
  const { tree, nodes } = fixture;
  const compareState = caseKind !== "valid" && MUTATION_OWNERS.has(owner);
  const before = compareState ? snapshotCompletePublicState(fixture) : undefined;

  if (caseKind === "valid") {
    invokeCase(tree, nodes, owner, role, caseKind, position, invalidNode);
  } else {
    const error = captureError(() =>
      invokeCase(tree, nodes, owner, role, caseKind, position, invalidNode),
    );
    const expected = ERROR_BY_CASE[caseKind];
    assert.equal(error.constructor, expected.ErrorClass, id);
    assert.equal(error.code, expected.code, id);
    assert.notEqual(error.code, "ERR_TAFFY_PANIC", id);
  }

  if (before) assert.deepEqual(snapshotCompletePublicState(fixture), before, id);
  assertTreeUsable(tree, nodes.root);
}

type ExpectedRecord = {
  apiOwner: string;
  roleId: string;
  rolePath: string;
  caseKind: CaseKind;
  position: Position | null;
  error: string | null;
};

function expandExpectedRecords() {
  const records: ExpectedRecord[] = [];
  for (const [apiOwner, roleId, rolePath] of ROLE_BINDINGS) {
    records.push({
      apiOwner,
      roleId,
      rolePath,
      caseKind: "valid",
      position: null,
      error: null,
    });
    if (!rolePath.endsWith("[]")) {
      for (const caseKind of INVALID_CASE_ORDER) {
        records.push({
          apiOwner,
          roleId,
          rolePath,
          caseKind,
          position: null,
          error: errorKey(caseKind),
        });
      }
      continue;
    }
    for (const caseKind of INVALID_CASE_ORDER) {
      for (const position of POSITIONS) {
        records.push({
          apiOwner,
          roleId,
          rolePath,
          caseKind,
          position,
          error: errorKey(caseKind),
        });
      }
    }
  }
  return records;
}

function errorKey(caseKind: Exclude<CaseKind, "valid">) {
  if (caseKind === "wrong-type") return "node-id-not-bigint";
  if (caseKind === "malformed") return "malformed-node-id";
  if (caseKind === "foreign") return "foreign-node-id";
  return "stale-node-id";
}

type Contract = {
  errors: Record<string, { class: string; code: string | null }>;
  generated: {
    evidence: {
      nodeId: Array<{
        apiOwner: string;
        roleId: string;
        rolePath: string;
        caseKind: string;
        position?: string | null;
        error?: string;
        id: string;
      }>;
    };
  };
  nodeIdRolesByOwner: Record<
    string,
    Array<{ id: string; path: string; invalidPositions?: string[] }>
  >;
  publicClassMembersByOwner: Record<string, string[]>;
  publicMutationFailuresByOwner: Record<string, string[]>;
};

async function readContract(): Promise<Contract> {
  return JSON.parse(
    await readFile(new URL("../../../../tools/taffy-api/contract.json", import.meta.url), "utf8"),
  ) as Contract;
}

contractTest("TEST-COMMON-NODEID/role-bijection", async () => {
  const contract = await readContract();
  const declaredRoles = Object.entries(contract.nodeIdRolesByOwner).flatMap(([owner, roles]) =>
    roles.map(({ id, path }) => [owner, id, path]),
  );
  assert.deepEqual(
    ROLE_BINDINGS.map(([owner, role, path]) => [owner, role, path]),
    declaredRoles,
  );
  for (const [owner, , , member] of ROLE_BINDINGS) {
    assert.deepEqual(contract.publicClassMembersByOwner[owner], [member], owner);
  }

  const generated = contract.generated.evidence.nodeId.map((record) => ({
    apiOwner: record.apiOwner,
    roleId: record.roleId,
    rolePath: record.rolePath,
    caseKind: record.caseKind,
    position: record.position ?? null,
    error: record.error ?? null,
  }));
  assert.deepEqual(generated, expandExpectedRecords());

  const source = await readFile(fileURLToPath(import.meta.url), "utf8");
  const registered = Array.from(
    source.matchAll(/contractTest\("(NODEID\/[A-Z0-9-]+\/[a-z-]+\/[a-z-]+(?:\/[a-z]+)?)"/g),
    (match) => match[1],
  );
  assert.equal(new Set(registered).size, 227);
  assert.deepEqual(
    registered,
    contract.generated.evidence.nodeId.map(({ id }) => id),
  );

  const expectedMutationOwners = new Set(
    Object.keys(contract.nodeIdRolesByOwner).filter(
      (owner) => contract.publicMutationFailuresByOwner[owner] !== undefined,
    ),
  );
  assert.deepEqual(MUTATION_OWNERS, expectedMutationOwners);
  assert.equal(
    contract.generated.evidence.nodeId.filter(
      ({ apiOwner, caseKind }) => caseKind !== "valid" && MUTATION_OWNERS.has(apiOwner),
    ).length,
    138,
  );
});

contractTest("TEST-COMMON-NODEID/controlled-errors", async () => {
  const contract = await readContract();
  assert.deepEqual(contract.errors["node-id-not-bigint"], { class: "TypeError", code: null });
  assert.deepEqual(contract.errors["malformed-node-id"], {
    class: "Error",
    code: "ERR_TAFFY_INVALID_NODE_ID",
  });
  assert.deepEqual(contract.errors["foreign-node-id"], {
    class: "Error",
    code: "ERR_TAFFY_FOREIGN_NODE_ID",
  });
  assert.deepEqual(contract.errors["stale-node-id"], {
    class: "Error",
    code: "ERR_TAFFY_STALE_NODE_ID",
  });
  for (const caseKind of INVALID_CASE_ORDER) {
    runNodeIdCase(`NODEID/API-TREE-024/node/${caseKind}`);
  }
});

contractTest("TEST-COMMON-NODEID/no-panic", async () => {
  const contract = await readContract();
  for (const { id } of contract.generated.evidence.nodeId) runNodeIdCase(id);
});

// The contract checker requires all generated IDs as unconditional top-level literal calls.
// Each call uses the shared runner above so only the role and invalid NodeId change.

contractTest("NODEID/API-TREE-006/children-element/valid", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/valid"),
);
contractTest("NODEID/API-TREE-006/children-element/wrong-type/first", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/wrong-type/first"),
);
contractTest("NODEID/API-TREE-006/children-element/wrong-type/middle", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/wrong-type/middle"),
);
contractTest("NODEID/API-TREE-006/children-element/wrong-type/last", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/wrong-type/last"),
);
contractTest("NODEID/API-TREE-006/children-element/malformed/first", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/malformed/first"),
);
contractTest("NODEID/API-TREE-006/children-element/malformed/middle", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/malformed/middle"),
);
contractTest("NODEID/API-TREE-006/children-element/malformed/last", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/malformed/last"),
);
contractTest("NODEID/API-TREE-006/children-element/foreign/first", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/foreign/first"),
);
contractTest("NODEID/API-TREE-006/children-element/foreign/middle", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/foreign/middle"),
);
contractTest("NODEID/API-TREE-006/children-element/foreign/last", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/foreign/last"),
);
contractTest("NODEID/API-TREE-006/children-element/stale-removed/first", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/stale-removed/first"),
);
contractTest("NODEID/API-TREE-006/children-element/stale-removed/middle", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/stale-removed/middle"),
);
contractTest("NODEID/API-TREE-006/children-element/stale-removed/last", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/stale-removed/last"),
);
contractTest("NODEID/API-TREE-006/children-element/stale-cleared/first", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/stale-cleared/first"),
);
contractTest("NODEID/API-TREE-006/children-element/stale-cleared/middle", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/stale-cleared/middle"),
);
contractTest("NODEID/API-TREE-006/children-element/stale-cleared/last", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/stale-cleared/last"),
);
contractTest("NODEID/API-TREE-006/children-element/slot-reuse/first", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/slot-reuse/first"),
);
contractTest("NODEID/API-TREE-006/children-element/slot-reuse/middle", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/slot-reuse/middle"),
);
contractTest("NODEID/API-TREE-006/children-element/slot-reuse/last", () =>
  runNodeIdCase("NODEID/API-TREE-006/children-element/slot-reuse/last"),
);
contractTest("NODEID/API-TREE-008/node/valid", () =>
  runNodeIdCase("NODEID/API-TREE-008/node/valid"),
);
contractTest("NODEID/API-TREE-008/node/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-008/node/wrong-type"),
);
contractTest("NODEID/API-TREE-008/node/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-008/node/malformed"),
);
contractTest("NODEID/API-TREE-008/node/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-008/node/foreign"),
);
contractTest("NODEID/API-TREE-008/node/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-008/node/stale-removed"),
);
contractTest("NODEID/API-TREE-008/node/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-008/node/stale-cleared"),
);
contractTest("NODEID/API-TREE-008/node/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-008/node/slot-reuse"),
);
contractTest("NODEID/API-TREE-009/node/valid", () =>
  runNodeIdCase("NODEID/API-TREE-009/node/valid"),
);
contractTest("NODEID/API-TREE-009/node/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-009/node/wrong-type"),
);
contractTest("NODEID/API-TREE-009/node/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-009/node/malformed"),
);
contractTest("NODEID/API-TREE-009/node/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-009/node/foreign"),
);
contractTest("NODEID/API-TREE-009/node/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-009/node/stale-removed"),
);
contractTest("NODEID/API-TREE-009/node/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-009/node/stale-cleared"),
);
contractTest("NODEID/API-TREE-009/node/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-009/node/slot-reuse"),
);
contractTest("NODEID/API-TREE-010/node/valid", () =>
  runNodeIdCase("NODEID/API-TREE-010/node/valid"),
);
contractTest("NODEID/API-TREE-010/node/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-010/node/wrong-type"),
);
contractTest("NODEID/API-TREE-010/node/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-010/node/malformed"),
);
contractTest("NODEID/API-TREE-010/node/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-010/node/foreign"),
);
contractTest("NODEID/API-TREE-010/node/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-010/node/stale-removed"),
);
contractTest("NODEID/API-TREE-010/node/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-010/node/stale-cleared"),
);
contractTest("NODEID/API-TREE-010/node/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-010/node/slot-reuse"),
);
contractTest("NODEID/API-TREE-011/parent/valid", () =>
  runNodeIdCase("NODEID/API-TREE-011/parent/valid"),
);
contractTest("NODEID/API-TREE-011/parent/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-011/parent/wrong-type"),
);
contractTest("NODEID/API-TREE-011/parent/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-011/parent/malformed"),
);
contractTest("NODEID/API-TREE-011/parent/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-011/parent/foreign"),
);
contractTest("NODEID/API-TREE-011/parent/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-011/parent/stale-removed"),
);
contractTest("NODEID/API-TREE-011/parent/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-011/parent/stale-cleared"),
);
contractTest("NODEID/API-TREE-011/parent/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-011/parent/slot-reuse"),
);
contractTest("NODEID/API-TREE-011/child/valid", () =>
  runNodeIdCase("NODEID/API-TREE-011/child/valid"),
);
contractTest("NODEID/API-TREE-011/child/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-011/child/wrong-type"),
);
contractTest("NODEID/API-TREE-011/child/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-011/child/malformed"),
);
contractTest("NODEID/API-TREE-011/child/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-011/child/foreign"),
);
contractTest("NODEID/API-TREE-011/child/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-011/child/stale-removed"),
);
contractTest("NODEID/API-TREE-011/child/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-011/child/stale-cleared"),
);
contractTest("NODEID/API-TREE-011/child/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-011/child/slot-reuse"),
);
contractTest("NODEID/API-TREE-012/parent/valid", () =>
  runNodeIdCase("NODEID/API-TREE-012/parent/valid"),
);
contractTest("NODEID/API-TREE-012/parent/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-012/parent/wrong-type"),
);
contractTest("NODEID/API-TREE-012/parent/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-012/parent/malformed"),
);
contractTest("NODEID/API-TREE-012/parent/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-012/parent/foreign"),
);
contractTest("NODEID/API-TREE-012/parent/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-012/parent/stale-removed"),
);
contractTest("NODEID/API-TREE-012/parent/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-012/parent/stale-cleared"),
);
contractTest("NODEID/API-TREE-012/parent/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-012/parent/slot-reuse"),
);
contractTest("NODEID/API-TREE-012/child/valid", () =>
  runNodeIdCase("NODEID/API-TREE-012/child/valid"),
);
contractTest("NODEID/API-TREE-012/child/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-012/child/wrong-type"),
);
contractTest("NODEID/API-TREE-012/child/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-012/child/malformed"),
);
contractTest("NODEID/API-TREE-012/child/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-012/child/foreign"),
);
contractTest("NODEID/API-TREE-012/child/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-012/child/stale-removed"),
);
contractTest("NODEID/API-TREE-012/child/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-012/child/stale-cleared"),
);
contractTest("NODEID/API-TREE-012/child/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-012/child/slot-reuse"),
);
contractTest("NODEID/API-TREE-013/parent/valid", () =>
  runNodeIdCase("NODEID/API-TREE-013/parent/valid"),
);
contractTest("NODEID/API-TREE-013/parent/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-013/parent/wrong-type"),
);
contractTest("NODEID/API-TREE-013/parent/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-013/parent/malformed"),
);
contractTest("NODEID/API-TREE-013/parent/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-013/parent/foreign"),
);
contractTest("NODEID/API-TREE-013/parent/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-013/parent/stale-removed"),
);
contractTest("NODEID/API-TREE-013/parent/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-013/parent/stale-cleared"),
);
contractTest("NODEID/API-TREE-013/parent/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-013/parent/slot-reuse"),
);
contractTest("NODEID/API-TREE-013/children-element/valid", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/valid"),
);
contractTest("NODEID/API-TREE-013/children-element/wrong-type/first", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/wrong-type/first"),
);
contractTest("NODEID/API-TREE-013/children-element/wrong-type/middle", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/wrong-type/middle"),
);
contractTest("NODEID/API-TREE-013/children-element/wrong-type/last", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/wrong-type/last"),
);
contractTest("NODEID/API-TREE-013/children-element/malformed/first", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/malformed/first"),
);
contractTest("NODEID/API-TREE-013/children-element/malformed/middle", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/malformed/middle"),
);
contractTest("NODEID/API-TREE-013/children-element/malformed/last", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/malformed/last"),
);
contractTest("NODEID/API-TREE-013/children-element/foreign/first", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/foreign/first"),
);
contractTest("NODEID/API-TREE-013/children-element/foreign/middle", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/foreign/middle"),
);
contractTest("NODEID/API-TREE-013/children-element/foreign/last", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/foreign/last"),
);
contractTest("NODEID/API-TREE-013/children-element/stale-removed/first", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/stale-removed/first"),
);
contractTest("NODEID/API-TREE-013/children-element/stale-removed/middle", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/stale-removed/middle"),
);
contractTest("NODEID/API-TREE-013/children-element/stale-removed/last", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/stale-removed/last"),
);
contractTest("NODEID/API-TREE-013/children-element/stale-cleared/first", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/stale-cleared/first"),
);
contractTest("NODEID/API-TREE-013/children-element/stale-cleared/middle", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/stale-cleared/middle"),
);
contractTest("NODEID/API-TREE-013/children-element/stale-cleared/last", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/stale-cleared/last"),
);
contractTest("NODEID/API-TREE-013/children-element/slot-reuse/first", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/slot-reuse/first"),
);
contractTest("NODEID/API-TREE-013/children-element/slot-reuse/middle", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/slot-reuse/middle"),
);
contractTest("NODEID/API-TREE-013/children-element/slot-reuse/last", () =>
  runNodeIdCase("NODEID/API-TREE-013/children-element/slot-reuse/last"),
);
contractTest("NODEID/API-TREE-014/parent/valid", () =>
  runNodeIdCase("NODEID/API-TREE-014/parent/valid"),
);
contractTest("NODEID/API-TREE-014/parent/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-014/parent/wrong-type"),
);
contractTest("NODEID/API-TREE-014/parent/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-014/parent/malformed"),
);
contractTest("NODEID/API-TREE-014/parent/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-014/parent/foreign"),
);
contractTest("NODEID/API-TREE-014/parent/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-014/parent/stale-removed"),
);
contractTest("NODEID/API-TREE-014/parent/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-014/parent/stale-cleared"),
);
contractTest("NODEID/API-TREE-014/parent/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-014/parent/slot-reuse"),
);
contractTest("NODEID/API-TREE-014/child/valid", () =>
  runNodeIdCase("NODEID/API-TREE-014/child/valid"),
);
contractTest("NODEID/API-TREE-014/child/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-014/child/wrong-type"),
);
contractTest("NODEID/API-TREE-014/child/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-014/child/malformed"),
);
contractTest("NODEID/API-TREE-014/child/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-014/child/foreign"),
);
contractTest("NODEID/API-TREE-014/child/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-014/child/stale-removed"),
);
contractTest("NODEID/API-TREE-014/child/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-014/child/stale-cleared"),
);
contractTest("NODEID/API-TREE-014/child/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-014/child/slot-reuse"),
);
contractTest("NODEID/API-TREE-015/parent/valid", () =>
  runNodeIdCase("NODEID/API-TREE-015/parent/valid"),
);
contractTest("NODEID/API-TREE-015/parent/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-015/parent/wrong-type"),
);
contractTest("NODEID/API-TREE-015/parent/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-015/parent/malformed"),
);
contractTest("NODEID/API-TREE-015/parent/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-015/parent/foreign"),
);
contractTest("NODEID/API-TREE-015/parent/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-015/parent/stale-removed"),
);
contractTest("NODEID/API-TREE-015/parent/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-015/parent/stale-cleared"),
);
contractTest("NODEID/API-TREE-015/parent/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-015/parent/slot-reuse"),
);
contractTest("NODEID/API-TREE-016/parent/valid", () =>
  runNodeIdCase("NODEID/API-TREE-016/parent/valid"),
);
contractTest("NODEID/API-TREE-016/parent/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-016/parent/wrong-type"),
);
contractTest("NODEID/API-TREE-016/parent/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-016/parent/malformed"),
);
contractTest("NODEID/API-TREE-016/parent/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-016/parent/foreign"),
);
contractTest("NODEID/API-TREE-016/parent/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-016/parent/stale-removed"),
);
contractTest("NODEID/API-TREE-016/parent/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-016/parent/stale-cleared"),
);
contractTest("NODEID/API-TREE-016/parent/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-016/parent/slot-reuse"),
);
contractTest("NODEID/API-TREE-017/parent/valid", () =>
  runNodeIdCase("NODEID/API-TREE-017/parent/valid"),
);
contractTest("NODEID/API-TREE-017/parent/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-017/parent/wrong-type"),
);
contractTest("NODEID/API-TREE-017/parent/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-017/parent/malformed"),
);
contractTest("NODEID/API-TREE-017/parent/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-017/parent/foreign"),
);
contractTest("NODEID/API-TREE-017/parent/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-017/parent/stale-removed"),
);
contractTest("NODEID/API-TREE-017/parent/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-017/parent/stale-cleared"),
);
contractTest("NODEID/API-TREE-017/parent/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-017/parent/slot-reuse"),
);
contractTest("NODEID/API-TREE-017/new-child/valid", () =>
  runNodeIdCase("NODEID/API-TREE-017/new-child/valid"),
);
contractTest("NODEID/API-TREE-017/new-child/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-017/new-child/wrong-type"),
);
contractTest("NODEID/API-TREE-017/new-child/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-017/new-child/malformed"),
);
contractTest("NODEID/API-TREE-017/new-child/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-017/new-child/foreign"),
);
contractTest("NODEID/API-TREE-017/new-child/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-017/new-child/stale-removed"),
);
contractTest("NODEID/API-TREE-017/new-child/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-017/new-child/stale-cleared"),
);
contractTest("NODEID/API-TREE-017/new-child/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-017/new-child/slot-reuse"),
);
contractTest("NODEID/API-TREE-018/parent/valid", () =>
  runNodeIdCase("NODEID/API-TREE-018/parent/valid"),
);
contractTest("NODEID/API-TREE-018/parent/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-018/parent/wrong-type"),
);
contractTest("NODEID/API-TREE-018/parent/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-018/parent/malformed"),
);
contractTest("NODEID/API-TREE-018/parent/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-018/parent/foreign"),
);
contractTest("NODEID/API-TREE-018/parent/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-018/parent/stale-removed"),
);
contractTest("NODEID/API-TREE-018/parent/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-018/parent/stale-cleared"),
);
contractTest("NODEID/API-TREE-018/parent/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-018/parent/slot-reuse"),
);
contractTest("NODEID/API-TREE-019/parent/valid", () =>
  runNodeIdCase("NODEID/API-TREE-019/parent/valid"),
);
contractTest("NODEID/API-TREE-019/parent/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-019/parent/wrong-type"),
);
contractTest("NODEID/API-TREE-019/parent/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-019/parent/malformed"),
);
contractTest("NODEID/API-TREE-019/parent/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-019/parent/foreign"),
);
contractTest("NODEID/API-TREE-019/parent/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-019/parent/stale-removed"),
);
contractTest("NODEID/API-TREE-019/parent/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-019/parent/stale-cleared"),
);
contractTest("NODEID/API-TREE-019/parent/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-019/parent/slot-reuse"),
);
contractTest("NODEID/API-TREE-021/node/valid", () =>
  runNodeIdCase("NODEID/API-TREE-021/node/valid"),
);
contractTest("NODEID/API-TREE-021/node/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-021/node/wrong-type"),
);
contractTest("NODEID/API-TREE-021/node/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-021/node/malformed"),
);
contractTest("NODEID/API-TREE-021/node/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-021/node/foreign"),
);
contractTest("NODEID/API-TREE-021/node/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-021/node/stale-removed"),
);
contractTest("NODEID/API-TREE-021/node/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-021/node/stale-cleared"),
);
contractTest("NODEID/API-TREE-021/node/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-021/node/slot-reuse"),
);
contractTest("NODEID/API-TREE-022/parent/valid", () =>
  runNodeIdCase("NODEID/API-TREE-022/parent/valid"),
);
contractTest("NODEID/API-TREE-022/parent/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-022/parent/wrong-type"),
);
contractTest("NODEID/API-TREE-022/parent/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-022/parent/malformed"),
);
contractTest("NODEID/API-TREE-022/parent/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-022/parent/foreign"),
);
contractTest("NODEID/API-TREE-022/parent/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-022/parent/stale-removed"),
);
contractTest("NODEID/API-TREE-022/parent/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-022/parent/stale-cleared"),
);
contractTest("NODEID/API-TREE-022/parent/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-022/parent/slot-reuse"),
);
contractTest("NODEID/API-TREE-023/node/valid", () =>
  runNodeIdCase("NODEID/API-TREE-023/node/valid"),
);
contractTest("NODEID/API-TREE-023/node/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-023/node/wrong-type"),
);
contractTest("NODEID/API-TREE-023/node/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-023/node/malformed"),
);
contractTest("NODEID/API-TREE-023/node/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-023/node/foreign"),
);
contractTest("NODEID/API-TREE-023/node/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-023/node/stale-removed"),
);
contractTest("NODEID/API-TREE-023/node/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-023/node/stale-cleared"),
);
contractTest("NODEID/API-TREE-023/node/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-023/node/slot-reuse"),
);
contractTest("NODEID/API-TREE-024/node/valid", () =>
  runNodeIdCase("NODEID/API-TREE-024/node/valid"),
);
contractTest("NODEID/API-TREE-024/node/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-024/node/wrong-type"),
);
contractTest("NODEID/API-TREE-024/node/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-024/node/malformed"),
);
contractTest("NODEID/API-TREE-024/node/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-024/node/foreign"),
);
contractTest("NODEID/API-TREE-024/node/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-024/node/stale-removed"),
);
contractTest("NODEID/API-TREE-024/node/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-024/node/stale-cleared"),
);
contractTest("NODEID/API-TREE-024/node/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-024/node/slot-reuse"),
);
contractTest("NODEID/API-TREE-025/node/valid", () =>
  runNodeIdCase("NODEID/API-TREE-025/node/valid"),
);
contractTest("NODEID/API-TREE-025/node/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-025/node/wrong-type"),
);
contractTest("NODEID/API-TREE-025/node/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-025/node/malformed"),
);
contractTest("NODEID/API-TREE-025/node/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-025/node/foreign"),
);
contractTest("NODEID/API-TREE-025/node/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-025/node/stale-removed"),
);
contractTest("NODEID/API-TREE-025/node/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-025/node/stale-cleared"),
);
contractTest("NODEID/API-TREE-025/node/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-025/node/slot-reuse"),
);
contractTest("NODEID/API-TREE-026/node/valid", () =>
  runNodeIdCase("NODEID/API-TREE-026/node/valid"),
);
contractTest("NODEID/API-TREE-026/node/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-026/node/wrong-type"),
);
contractTest("NODEID/API-TREE-026/node/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-026/node/malformed"),
);
contractTest("NODEID/API-TREE-026/node/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-026/node/foreign"),
);
contractTest("NODEID/API-TREE-026/node/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-026/node/stale-removed"),
);
contractTest("NODEID/API-TREE-026/node/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-026/node/stale-cleared"),
);
contractTest("NODEID/API-TREE-026/node/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-026/node/slot-reuse"),
);
contractTest("NODEID/API-TREE-027/node/valid", () =>
  runNodeIdCase("NODEID/API-TREE-027/node/valid"),
);
contractTest("NODEID/API-TREE-027/node/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-027/node/wrong-type"),
);
contractTest("NODEID/API-TREE-027/node/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-027/node/malformed"),
);
contractTest("NODEID/API-TREE-027/node/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-027/node/foreign"),
);
contractTest("NODEID/API-TREE-027/node/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-027/node/stale-removed"),
);
contractTest("NODEID/API-TREE-027/node/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-027/node/stale-cleared"),
);
contractTest("NODEID/API-TREE-027/node/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-027/node/slot-reuse"),
);
contractTest("NODEID/API-TREE-028/node/valid", () =>
  runNodeIdCase("NODEID/API-TREE-028/node/valid"),
);
contractTest("NODEID/API-TREE-028/node/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-028/node/wrong-type"),
);
contractTest("NODEID/API-TREE-028/node/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-028/node/malformed"),
);
contractTest("NODEID/API-TREE-028/node/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-028/node/foreign"),
);
contractTest("NODEID/API-TREE-028/node/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-028/node/stale-removed"),
);
contractTest("NODEID/API-TREE-028/node/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-028/node/stale-cleared"),
);
contractTest("NODEID/API-TREE-028/node/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-028/node/slot-reuse"),
);
contractTest("NODEID/API-TREE-029/node/valid", () =>
  runNodeIdCase("NODEID/API-TREE-029/node/valid"),
);
contractTest("NODEID/API-TREE-029/node/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-029/node/wrong-type"),
);
contractTest("NODEID/API-TREE-029/node/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-029/node/malformed"),
);
contractTest("NODEID/API-TREE-029/node/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-029/node/foreign"),
);
contractTest("NODEID/API-TREE-029/node/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-029/node/stale-removed"),
);
contractTest("NODEID/API-TREE-029/node/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-029/node/stale-cleared"),
);
contractTest("NODEID/API-TREE-029/node/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-029/node/slot-reuse"),
);
contractTest("NODEID/API-TREE-030/root/valid", () =>
  runNodeIdCase("NODEID/API-TREE-030/root/valid"),
);
contractTest("NODEID/API-TREE-030/root/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-030/root/wrong-type"),
);
contractTest("NODEID/API-TREE-030/root/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-030/root/malformed"),
);
contractTest("NODEID/API-TREE-030/root/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-030/root/foreign"),
);
contractTest("NODEID/API-TREE-030/root/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-030/root/stale-removed"),
);
contractTest("NODEID/API-TREE-030/root/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-030/root/stale-cleared"),
);
contractTest("NODEID/API-TREE-030/root/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-030/root/slot-reuse"),
);
contractTest("NODEID/API-TREE-031/root/valid", () =>
  runNodeIdCase("NODEID/API-TREE-031/root/valid"),
);
contractTest("NODEID/API-TREE-031/root/wrong-type", () =>
  runNodeIdCase("NODEID/API-TREE-031/root/wrong-type"),
);
contractTest("NODEID/API-TREE-031/root/malformed", () =>
  runNodeIdCase("NODEID/API-TREE-031/root/malformed"),
);
contractTest("NODEID/API-TREE-031/root/foreign", () =>
  runNodeIdCase("NODEID/API-TREE-031/root/foreign"),
);
contractTest("NODEID/API-TREE-031/root/stale-removed", () =>
  runNodeIdCase("NODEID/API-TREE-031/root/stale-removed"),
);
contractTest("NODEID/API-TREE-031/root/stale-cleared", () =>
  runNodeIdCase("NODEID/API-TREE-031/root/stale-cleared"),
);
contractTest("NODEID/API-TREE-031/root/slot-reuse", () =>
  runNodeIdCase("NODEID/API-TREE-031/root/slot-reuse"),
);
