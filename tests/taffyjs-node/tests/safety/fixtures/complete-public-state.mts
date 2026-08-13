import assert from "node:assert/strict";
import * as api from "@taffyjs/node";

export type StateTree = {
  computeLayout(options: { root: bigint; availableSpace: object }): void;
  getChildCount(parent: bigint): number;
  getChildren(parent: bigint): readonly bigint[];
  getDetailedLayoutInfo(node: bigint): object;
  getLayout(node: bigint): object;
  getNodeContext(node: bigint): unknown;
  getNodeCount(): number;
  getParent(node: bigint): bigint | null;
  getStyle(node: bigint): object;
  getUnroundedLayout(node: bigint): object;
  isDirty(node: bigint): boolean;
  newLeaf(style: object): bigint;
  newLeafWithContext(style: object, context: unknown): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
};

export type CompleteStateFixture<TTree extends StateTree> = {
  tree: TTree;
  nodes: Record<
    | "childA"
    | "childB"
    | "childC"
    | "parent"
    | "root"
    | "roundingProbe"
    | "spareA"
    | "spareB"
    | "spareC"
    | "spareD",
    bigint
  >;
  live: Map<string, bigint>;
  contexts: Map<string, unknown>;
};

export function maxContentSpace() {
  return {
    width: api.AvailableSpace.MaxContent,
    height: api.AvailableSpace.MaxContent,
  };
}

export function createCompleteStateFixture<TTree extends StateTree>(
  tree: TTree,
): CompleteStateFixture<TTree> {
  const objectContext = { label: "child-a" };
  const childA = tree.newLeafWithContext({ flexGrow: 0.25 }, objectContext);
  const childB = tree.newLeafWithContext({ flexGrow: 0.5 }, "child-b");
  const childC = tree.newLeaf({ flexGrow: 0.75 });
  const parent = tree.newWithChildren(
    {
      gap: {
        width: api.Dimension.Length(3),
        height: api.Dimension.Length(2),
      },
    },
    [childA, childB, childC],
  );
  const root = tree.newWithChildren(
    {
      display: api.Display.Flex,
      size: {
        width: api.Dimension.Length(100),
        height: api.Dimension.Length(60),
      },
    },
    [parent],
  );
  const spareA = tree.newLeaf({ flexGrow: 1 });
  const spareB = tree.newLeaf({ flexGrow: 2 });
  const spareC = tree.newLeaf({ flexGrow: 3 });
  const spareD = tree.newLeaf({ flexGrow: 4 });
  const roundingProbe = tree.newLeaf({
    size: {
      width: api.Dimension.Length(10.4),
      height: api.Dimension.Length(20.6),
    },
  });
  const nodes = {
    childA,
    childB,
    childC,
    parent,
    root,
    roundingProbe,
    spareA,
    spareB,
    spareC,
    spareD,
  };
  const live = new Map(Object.entries(nodes));
  const contexts = new Map<string, unknown>([
    ["childA", objectContext],
    ["childB", "child-b"],
  ]);

  tree.computeLayout({ root, availableSpace: maxContentSpace() });
  tree.computeLayout({ root: roundingProbe, availableSpace: maxContentSpace() });
  assert.notDeepEqual(
    tree.getLayout(roundingProbe),
    tree.getUnroundedLayout(roundingProbe),
    "the fixed probe must expose whether rounding is enabled",
  );

  return { tree, nodes, live, contexts };
}

function nodeLabel<TTree extends StateTree>(
  fixture: CompleteStateFixture<TTree>,
  node: bigint,
): string {
  for (const [label, candidate] of fixture.live) {
    if (candidate === node) return label;
  }
  assert.fail(`Native topology returned an unknown NodeId: ${node}`);
}

function contextState<TTree extends StateTree>(
  fixture: CompleteStateFixture<TTree>,
  label: string,
  node: bigint,
) {
  const actual = fixture.tree.getNodeContext(node);
  if (!fixture.contexts.has(label)) {
    assert.equal(actual, undefined, `${label} must not gain a context`);
    return { present: false };
  }

  const expected = fixture.contexts.get(label);
  assert.equal(actual, expected, `${label} must retain the exact context value`);
  return {
    present: true,
    value: typeof expected === "object" && expected !== null ? `context:${label}` : expected,
  };
}

export function snapshotCompletePublicState<TTree extends StateTree>(
  fixture: CompleteStateFixture<TTree>,
) {
  const { tree } = fixture;
  assert.equal(tree.getNodeCount(), fixture.live.size, "the public count must match live NodeIds");

  const nodes = Array.from(fixture.live, ([label, node]) => {
    const parent = tree.getParent(node);
    const children = [...tree.getChildren(node)];
    assert.equal(tree.getChildCount(node), children.length, `${label} child count`);

    return {
      label,
      parent: parent === null ? null : nodeLabel(fixture, parent),
      children: children.map((child) => nodeLabel(fixture, child)),
      style: tree.getStyle(node),
      layout: tree.getLayout(node),
      unroundedLayout: tree.getUnroundedLayout(node),
      details: tree.getDetailedLayoutInfo(node),
      dirty: tree.isDirty(node),
      context: contextState(fixture, label, node),
    };
  });

  const roundedProbe = tree.getLayout(fixture.nodes.roundingProbe);
  const unroundedProbe = tree.getUnroundedLayout(fixture.nodes.roundingProbe);
  assert.notDeepEqual(roundedProbe, unroundedProbe, "rounding must remain enabled");

  return {
    count: tree.getNodeCount(),
    nodes,
    rounding: { roundedProbe, unroundedProbe },
  };
}
