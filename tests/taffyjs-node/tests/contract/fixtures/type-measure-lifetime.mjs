import { Worker, isMainThread, parentPort } from "node:worker_threads";
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

async function runCase(collectCallback) {
  const tree = new TaffyTree();
  const node = tree.newLeafWithContext({}, { label: "worker" });
  let callback = ({ context }) => {
    if (context.label !== "worker") throw new Error("Context identity was lost");
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
  const firstSize = tree.getUnroundedLayout(node).size;
  callback = undefined;
  const callbackCollected = collectCallback ? await collect(weak) : undefined;

  tree.setStyle(node, {});
  tree.computeLayoutWithMeasure({
    root: node,
    availableSpace: {
      width: AvailableSpace.MinContent,
      height: AvailableSpace.MinContent,
    },
    measure: () => ({ width: 7, height: 5 }),
  });
  return {
    callbackCollected,
    firstSize,
    secondSize: tree.getUnroundedLayout(node).size,
  };
}

if (isMainThread) {
  if (typeof globalThis.gc !== "function") throw new Error("This fixture requires --expose-gc");
  const localResult = await runCase(true);
  const worker = new Worker(new URL(import.meta.url), { execArgv: [] });
  const workerResult = await new Promise((resolve, reject) => {
    worker.once("error", reject);
    worker.once("message", resolve);
  });
  const exitCode = await new Promise((resolve) => worker.once("exit", resolve));
  process.stdout.write(
    `${JSON.stringify({ ...workerResult, callbackCollected: localResult.callbackCollected, workerExited: exitCode === 0 })}\n`,
  );
} else {
  const result = await runCase(false);
  parentPort.postMessage(result);
}
