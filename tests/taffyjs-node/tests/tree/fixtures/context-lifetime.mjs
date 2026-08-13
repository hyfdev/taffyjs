import assert from "node:assert/strict";
import { AvailableSpace, TaffyTree } from "@taffyjs/node";

const immediate = () => new Promise((resolve) => setImmediate(resolve));

async function collect(weak) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    globalThis.gc();
    await immediate();
    if (weak.deref() === undefined) return true;
    await immediate();
  }
  return false;
}

function removedContext() {
  const tree = new TaffyTree();
  let context = { label: "removed" };
  const weak = new WeakRef(context);
  const node = tree.newLeafWithContext({}, context);
  context = undefined;
  tree.remove(node);
  return { tree, weak };
}

function clearedContext() {
  const tree = new TaffyTree();
  let context = { label: "cleared" };
  const weak = new WeakRef(context);
  tree.newLeafWithContext({}, context);
  context = undefined;
  tree.clear();
  return { tree, weak };
}

function failedConversionContext() {
  const tree = new TaffyTree();
  let context = { label: "failed conversion" };
  const weak = new WeakRef(context);
  assert.throws(() => tree.newLeafWithContext({ unknownField: true }, context), TypeError);
  context = undefined;
  return { tree, weak };
}

function completedMeasureCallback() {
  const tree = new TaffyTree();
  const node = tree.newLeafWithContext({}, { label: "measured" });
  let callback = ({ context }) => {
    assert.equal(context.label, "measured");
    return { width: 31, height: 17 };
  };
  const weak = new WeakRef(callback);
  tree.computeLayoutWithMeasure({
    root: node,
    availableSpace: {
      width: AvailableSpace.MinContent,
      height: AvailableSpace.MinContent,
    },
    measure: callback,
  });
  callback = undefined;
  return { tree, weak };
}

if (typeof globalThis.gc !== "function") throw new Error("This fixture requires --expose-gc");
const removed = removedContext();
const cleared = clearedContext();
const failedConversion = failedConversionContext();
const completedMeasure = completedMeasureCallback();
process.stdout.write(
  `${JSON.stringify({
    removedCollected: await collect(removed.weak),
    clearedCollected: await collect(cleared.weak),
    failedConversionCollected: await collect(failedConversion.weak),
    callbackCollected: await collect(completedMeasure.weak),
  })}\n`,
);
