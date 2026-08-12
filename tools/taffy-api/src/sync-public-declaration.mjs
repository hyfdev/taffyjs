import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assembleDeclaration, extractLoopStatus, formatDeclaration } from "./index.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const contract = JSON.parse(await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"));
let taskStates = null;
try {
  const statusSource = await readFile(resolve(root, ".agents/docs/loop-status.md"), "utf8");
  taskStates = extractLoopStatus(statusSource).taskStates;
} catch (error) {
  if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
}
const declaration = await formatDeclaration(assembleDeclaration(contract, taskStates), root);
await writeFile(resolve(root, "packages/taffyjs-node/index.d.ts"), declaration);
