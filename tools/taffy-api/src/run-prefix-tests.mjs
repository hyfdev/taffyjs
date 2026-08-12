import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extractLoopStatus } from "./index.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const contract = JSON.parse(await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"));
const status = extractLoopStatus(
  await readFile(resolve(root, ".agents/docs/loop-status.md"), "utf8"),
);
const implementedStates = new Set(["implemented", "verified", "under-review", "accepted"]);
const modalities = new Set(
  contract.generated.evidence.primary
    .filter(
      ({ modality, owner }) =>
        modality !== "machine-check" &&
        modality !== "command-attestation" &&
        implementedStates.has(status.taskStates[owner]),
    )
    .map(({ modality }) => modality),
);
const commands = {
  "public-js": ["vp", ["run", "@taffyjs/node-integration-tests#test"]],
  "native-js": [
    "vp",
    [
      "test",
      "--config",
      "packages/taffyjs-node/vite.config.ts",
      "--reporter=tools/taffy-api/src/contract-reporter.mjs",
      "packages/taffyjs-node/tests/native",
    ],
  ],
  "wrapper-js": [
    "vp",
    [
      "test",
      "--config",
      "packages/taffyjs-node/vite.config.ts",
      "--reporter=tools/taffy-api/src/contract-reporter.mjs",
      "packages/taffyjs-node/tests/wrapper",
    ],
  ],
  types: ["node", ["tools/taffy-api/src/run-type-tests.mjs"]],
  "rust-contract": ["node", ["tools/taffy-api/src/run-rust-tests.mjs"]],
  "minimum-node-js": [
    "vp",
    [
      "env",
      "exec",
      "--node",
      contract.pins.minimumNodeTestRuntime,
      "--",
      "node",
      "tests/taffyjs-node/minimum-node/run.mjs",
    ],
  ],
};

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code ?? signal}`));
    });
  });
}

for (const modality of [
  "public-js",
  "native-js",
  "wrapper-js",
  "types",
  "rust-contract",
  "minimum-node-js",
]) {
  if (modalities.has(modality)) await run(...commands[modality]);
}
