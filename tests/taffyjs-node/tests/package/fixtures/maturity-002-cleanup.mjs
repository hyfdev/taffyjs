import { createRequire } from "node:module";
import { AvailableSpace, TaffyTree } from "@taffyjs/node";

if (typeof globalThis.gc !== "function") throw new Error("This fixture requires --expose-gc");
const testHooksPath = process.env.TAFFYJS_TEST_HOOKS_PATH;
if (!testHooksPath) throw new Error("This fixture requires TAFFYJS_TEST_HOOKS_PATH");
const { __liveNativeTreeCount } = createRequire(import.meta.url)(testHooksPath);
if (typeof __liveNativeTreeCount !== "function") {
  throw new Error("The native lifecycle counter is unavailable");
}

const immediate = () => new Promise((resolvePromise) => setImmediate(resolvePromise));

async function collected(weak) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    globalThis.gc();
    await immediate();
    if (weak.deref() === undefined) return true;
    await immediate();
  }
  return false;
}

async function eventually(predicate) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    globalThis.gc();
    await immediate();
    if (predicate()) return true;
    await immediate();
  }
  return false;
}

function releasedWrapper() {
  let tree = new TaffyTree();
  const weak = new WeakRef(tree);
  tree.newLeaf({});
  tree = undefined;
  return weak;
}

function releasedContext() {
  const tree = new TaffyTree();
  let context = { name: "released context" };
  const weak = new WeakRef(context);
  tree.newLeafWithContext({}, context);
  context = undefined;
  tree.clear();
  return { tree, weak };
}

function releasedCallback() {
  const tree = new TaffyTree();
  const root = tree.newLeafWithContext({}, true);
  let callback = () => ({ width: 10, height: 5 });
  const weak = new WeakRef(callback);
  tree.computeLayoutWithMeasure({
    root,
    availableSpace: {
      width: AvailableSpace.MaxContent,
      height: AvailableSpace.MaxContent,
    },
    measure: callback,
  });
  callback = undefined;
  return { tree, weak };
}

const context = releasedContext();
const callback = releasedCallback();
const retainedNativeCount = __liveNativeTreeCount();
const wrapper = releasedWrapper();
process.stdout.write(
  `${JSON.stringify({
    wrapperCollected: await collected(wrapper),
    ownedNativeCollected: await eventually(() => __liveNativeTreeCount() === retainedNativeCount),
    contextCollected: await collected(context.weak),
    callbackCollected: await collected(callback.weak),
    retainedTreesAlive: context.tree.getNodeCount() === 0 && callback.tree.getNodeCount() === 1,
  })}\n`,
);
