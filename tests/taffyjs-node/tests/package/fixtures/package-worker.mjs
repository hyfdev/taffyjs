import { parentPort } from "node:worker_threads";
import { TaffyTree } from "@taffyjs/node";

if (!parentPort) throw new Error("This fixture must run in a worker");

const tree = new TaffyTree();
const node = tree.newLeaf({});
parentPort.postMessage({ node, count: tree.getNodeCount() });
