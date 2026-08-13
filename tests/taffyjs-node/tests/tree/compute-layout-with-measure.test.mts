import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as api from "@taffyjs/node";
import { test } from "vite-plus/test";

type MeasureArgs = {
  knownDimensions: { width: number | undefined; height: number | undefined };
  availableSpace: {
    width: { kind: number; value?: number };
    height: { kind: number; value?: number };
  };
  node: bigint;
  context: unknown;
  style: Record<string, unknown>;
};
type Layout = { size: { width: number; height: number } };
type MeasureOptions = {
  root: bigint;
  availableSpace: object;
  measure: (args: MeasureArgs) => unknown;
};
type Tree = {
  computeLayoutWithMeasure(options: MeasureOptions): void;
  getChildren(parent: bigint): readonly bigint[];
  getNodeContext(node: bigint): unknown;
  getNodeCount(): number;
  getParent(node: bigint): bigint | null;
  getStyle(node: bigint): Record<string, unknown>;
  getUnroundedLayout(node: bigint): Layout;
  isDirty(node: bigint): boolean;
  newLeaf(style: object): bigint;
  newLeafWithContext(style: object, context: unknown): bigint;
  newWithChildren(style: object, children: readonly bigint[]): bigint;
  setStyle(node: bigint, style: object): void;
};
type TreeConstructor = new () => Tree;

function TaffyTree(): TreeConstructor {
  const value = Reflect.get(api, "TaffyTree");
  assert.equal(typeof value, "function", "TaffyTree is exported");
  assert.equal(
    typeof Reflect.get(value.prototype, "computeLayoutWithMeasure"),
    "function",
    "computeLayoutWithMeasure is public",
  );
  return value as unknown as TreeConstructor;
}

function availableSpace() {
  return {
    width: api.AvailableSpace.Definite(200),
    height: api.AvailableSpace.MinContent,
  };
}

function minContentSpace() {
  return { width: api.AvailableSpace.MinContent, height: api.AvailableSpace.MinContent };
}

function captureError(body: () => unknown): unknown {
  try {
    body();
  } catch (error) {
    return error;
  }
  assert.fail("Expected operation to throw");
}

function compute(tree: Tree, root: bigint, measure: MeasureOptions["measure"]): void {
  tree.computeLayoutWithMeasure({ root, availableSpace: minContentSpace(), measure });
}

test("callback-args", () => {
  const tree = new (TaffyTree())();
  const context = { label: "callback" };
  const node = tree.newLeafWithContext({ flexGrow: 1.25 }, context);
  let saved: MeasureArgs | undefined;

  tree.computeLayoutWithMeasure({
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
    "style",
  ]);
  assert.deepEqual(saved.knownDimensions, { width: undefined, height: undefined });
  assert.deepEqual(saved.availableSpace, availableSpace());
  assert.equal(saved.node, node);
  assert.equal(saved.context, context);
  assert.deepEqual(saved.style, tree.getStyle(node));
  saved.style.flexGrow = 99;
  assert.equal(tree.getStyle(node).flexGrow, Math.fround(1.25));
});

test("result-f32", () => {
  const finiteTree = new (TaffyTree())();
  const finite = finiteTree.newLeafWithContext({}, true);
  compute(finiteTree, finite, () => ({ width: 12.2500001, height: 8.5000001 }));
  assert.deepEqual(finiteTree.getUnroundedLayout(finite).size, {
    width: Math.fround(12.2500001),
    height: Math.fround(8.5000001),
  });

  const infinityTree = new (TaffyTree())();
  const infinity = infinityTree.newLeafWithContext({}, true);
  compute(infinityTree, infinity, () => ({
    width: Number.POSITIVE_INFINITY,
    height: Number.NEGATIVE_INFINITY,
  }));
  assert.deepEqual(infinityTree.getUnroundedLayout(infinity).size, {
    width: Number.POSITIVE_INFINITY,
    height: 0,
  });

  const nanTree = new (TaffyTree())();
  const nan = nanTree.newLeafWithContext({}, true);
  compute(nanTree, nan, () => ({ width: Number.NaN, height: Number.NaN }));
  assert.deepEqual(nanTree.getUnroundedLayout(nan).size, { width: 0, height: 0 });
});

test("cache-calls", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeafWithContext({}, true);
  const options = {
    root: node,
    availableSpace: minContentSpace(),
    measure: () => {
      calls += 1;
      return { width: 30, height: 10 };
    },
  };
  let calls = 0;

  tree.computeLayoutWithMeasure(options);
  const firstCalls = calls;
  assert.equal(firstCalls > 0, true);
  tree.computeLayoutWithMeasure(options);
  assert.equal(calls, firstCalls, "unchanged input may use the cached result without a callback");

  tree.setStyle(node, { flexGrow: 1 });
  tree.computeLayoutWithMeasure(options);
  assert.equal(calls > firstCalls, true, "dirty input asks Taffy to measure again");
});

test("same-tree-busy", () => {
  const fixture = fileURLToPath(new URL("./fixtures/measure-reentrancy.mjs", import.meta.url));
  const child = spawnSync(process.execPath, [fixture], { encoding: "utf8", timeout: 20_000 });
  assert.equal(child.signal, null);
  assert.equal(child.status, 0, child.stderr);
  const results = JSON.parse(child.stdout) as {
    callbackRan: boolean;
    results: { method: string; code?: string; message: string }[];
  };
  assert.equal(results.callbackRan, true);
  assert.equal(results.results.length, 29);
  for (const result of results.results) {
    assert.equal(result.code, "ERR_TAFFY_TREE_BUSY", result.method);
    assert.equal(
      result.message,
      `Cannot call ${result.method} on this TaffyTree while it is computing layout from a measure callback`,
    );
  }
});

test("js-only-reentry", () => {
  const tree = new (TaffyTree())();
  const context = { label: "available" };
  const node = tree.newLeafWithContext({}, context);

  compute(tree, node, ({ node: measured }) => {
    assert.equal(tree.getNodeContext(measured), context);
    assert.equal(typeof measured, "bigint");
    assert.equal(measured === node, true);
    assert.equal(measured + 0n, node);
    assert.deepEqual(api.Dimension.Length(4), { unit: api.LengthUnit.Length, value: 4 });
    assert.deepEqual(api.AvailableSpace.Definite(5), {
      kind: api.AvailableSpaceKind.Definite,
      value: 5,
    });
    assert.deepEqual(api.GridPlacement.Line(2), {
      kind: api.GridPlacementKind.Line,
      index: 2,
    });
    return { width: 30, height: 10 };
  });
});

test("different-tree", () => {
  const Tree = TaffyTree();
  const tree = new Tree();
  const node = tree.newLeafWithContext({}, true);
  const other = new Tree();
  let otherNode: bigint | undefined;

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
    const tree = new (TaffyTree())();
    const node = tree.newLeafWithContext({}, true);
    const received = captureError(() =>
      compute(tree, node, () => {
        throw thrown;
      }),
    );
    assert.equal(received, thrown);
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
    const tree = new (TaffyTree())();
    const node = tree.newLeafWithContext({}, true);
    const error = captureError(() => compute(tree, node, () => result));
    assert.equal((error as Error).constructor, TypeError);
  }
});

test("zero-drain", () => {
  const tree = new (TaffyTree())();
  const first = tree.newLeafWithContext({}, "first");
  const second = tree.newLeafWithContext({}, "second");
  const root = tree.newWithChildren({}, [first, second]);
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
  const tree = new (TaffyTree())();
  const firstContext = { label: "first" };
  const secondContext = { label: "second" };
  const first = tree.newLeafWithContext({ flexGrow: 1 }, firstContext);
  const second = tree.newLeafWithContext({ flexGrow: 2 }, secondContext);
  const root = tree.newWithChildren({}, [first, second]);
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
  const tree = new (TaffyTree())();
  const context = { value: 1 };
  const node = tree.newLeafWithContext({}, context);

  compute(tree, node, ({ context: received }) => {
    assert.equal(received, context);
    (received as { value: number }).value += 1;
    return { width: 30, height: 10 };
  });

  assert.equal(tree.getNodeContext(node), context);
  assert.equal(context.value, 2);
});

test("recovery", () => {
  const tree = new (TaffyTree())();
  const node = tree.newLeafWithContext({}, true);

  assert.equal(
    (captureError(() => compute(tree, node, () => ({ width: 1 }))) as Error).constructor,
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
