import { pathToFileURL } from "node:url";

const artifact = process.env.TAFFY_TEST_HOOKS;
if (!artifact) throw new Error("TAFFY_TEST_HOOKS is required");

const { NativeTaffyTree } = await import(pathToFileURL(artifact).href);
const owner = new NativeTaffyTree();
let first;
let second;
let accessedAfterPoison = false;

try {
  owner.__triggerPanic();
} catch (error) {
  first = { class: error?.constructor?.name, code: error?.code };
}

try {
  owner.rawNodeCount("getNodeCount");
  accessedAfterPoison = true;
} catch (error) {
  second = { class: error?.constructor?.name, code: error?.code };
}

process.stdout.write(`${JSON.stringify({ first, second, accessedAfterPoison, survived: true })}\n`);
