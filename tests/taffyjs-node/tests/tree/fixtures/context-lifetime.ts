import assert from "node:assert/strict";

import type { MeasureFunction } from "@taffyjs/node";

type Context = { label: string };
type TestModule = typeof import("@taffyjs/node");

const testEntry = process.env.TAFFYJS_TEST_ENTRY ?? "@taffyjs/node";
const { AvailableSpace, TaffyTree } = (await import(testEntry)) as TestModule;

const collectGarbage = globalThis.gc;
if (typeof collectGarbage !== "function") {
  throw new Error("This fixture requires --expose-gc");
}
const runGarbageCollection: () => void = collectGarbage;

const immediate = () => new Promise<void>((resolve) => setImmediate(resolve));

async function collect<T extends WeakKey>(weak: WeakRef<T>): Promise<boolean> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    runGarbageCollection();
    await immediate();
    if (weak.deref() === undefined) return true;
    await immediate();
  }
  return false;
}

function removedContext() {
  const tree = new TaffyTree<Context>();
  let context: Context | undefined = { label: "removed" };
  const weak = new WeakRef(context);
  const node = tree.newLeafWithContext({}, context);
  context = undefined;
  tree.remove(node);
  return { tree, weak };
}

function clearedContext() {
  const tree = new TaffyTree<Context>();
  let context: Context | undefined = { label: "cleared" };
  const weak = new WeakRef(context);
  tree.newLeafWithContext({}, context);
  context = undefined;
  tree.clear();
  return { tree, weak };
}

function failedConversionContext() {
  const tree = new TaffyTree<Context>();
  let context: Context | undefined = { label: "failed conversion" };
  const weak = new WeakRef(context);
  // @ts-expect-error This fixture verifies the runtime rejection of an invalid style.
  assert.throws(() => tree.newLeafWithContext({ unknownField: true }, context), TypeError);
  context = undefined;
  return { tree, weak };
}

function completedMeasureCallback() {
  const tree = new TaffyTree<Context>();
  const node = tree.newLeafWithContext({}, { label: "measured" });
  let callback: MeasureFunction<Context> | undefined = ({ context }) => {
    assert.equal(context?.label, "measured");
    return { width: 31, height: 17 };
  };
  const weak = new WeakRef(callback);
  tree.computeLayout({
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
