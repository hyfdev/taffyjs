import { parentPort } from "node:worker_threads";
import { TaffyTree } from "@taffyjs/node";

if (!parentPort) throw new Error("This fixture must run in a worker");

parentPort.once("message", (receivedNode) => {
  const tree = new TaffyTree();
  let receivedError;
  try {
    tree.getStyle(receivedNode);
  } catch (error) {
    receivedError = { class: error?.constructor?.name, code: error?.code };
  }
  parentPort.postMessage({
    receivedType: typeof receivedNode,
    receivedError,
    workerNode: tree.newLeaf({}),
  });
});
