import assert from "node:assert/strict";

import { TaffyTree } from "@taffyjs/wasm";

function capture(body) {
  try {
    body();
  } catch (error) {
    return error;
  }
  assert.fail("Expected operation to throw");
}

const context = { label: "wasm-node" };
const tree = new TaffyTree();
const root = tree.newLeafWithContext({}, context);
let measureCalls = 0;

const compute = (measure) =>
  tree.computeLayoutWithMeasure({
    root,
    availableSpace: { width: 800, height: 600 },
    measure,
  });

compute((args) => {
  measureCalls += 1;
  assert.equal(args.node, root);
  assert.equal(args.context, context);
  return { width: 31, height: 17 };
});

assert.ok(measureCalls > 0);
assert.deepEqual(tree.getLayout(root).size, { width: 31, height: 17 });

const indexError = capture(() => tree.getChildAtIndex(root, -1));
assert.ok(indexError instanceof RangeError);
assert.equal(tree.getNodeCount(), 1);

const thrown = { source: "measure" };
tree.markDirty(root);
assert.equal(
  capture(() =>
    compute(() => {
      throw thrown;
    }),
  ),
  thrown,
);
assert.equal(tree.getNodeCount(), 1);

compute(() => ({ width: 41, height: 19 }));
assert.deepEqual(tree.getLayout(root).size, { width: 41, height: 19 });

console.log(
  JSON.stringify({
    runtime: "node",
    nodeCount: tree.getNodeCount(),
    measureCalls,
    reusableAfterExpectedErrors: true,
  }),
);
