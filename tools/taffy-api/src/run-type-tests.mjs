import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const contract = JSON.parse(await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"));
const expectedByPath = new Map(
  contract.generated.evidence.primary
    .filter(({ modality }) => modality === "types")
    .map((record) => [record.path, record]),
);

async function walk(directory) {
  const output = [];
  let entries = [];
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return output;
    throw error;
  }
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await walk(path)));
    else if (entry.isFile() && path.endsWith(".test-d.ts")) output.push(path);
  }
  return output.sort((left, right) => left.localeCompare(right));
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    const output = [];
    child.stdout.on("data", (chunk) => output.push(chunk));
    child.stderr.on("data", (chunk) => output.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => resolvePromise({ code, output: Buffer.concat(output).toString() }));
  });
}

const compiler = resolve(root, "packages/taffyjs-node/node_modules/.bin/tsc");
const runtimeApi = await import(
  pathToFileURL(resolve(root, "packages/taffyjs-node/index.js")).href
);
const expectedRuntimeExports = Object.values(contract.publicRuntimeExportsByOwner)
  .flat()
  .toSorted((left, right) => left.localeCompare(right));
const actualRuntimeExports = Object.keys(runtimeApi).toSorted((left, right) =>
  left.localeCompare(right),
);
const results = [];
for (const path of await walk(resolve(root, "tests/taffyjs-node/tests/types"))) {
  const relativePath = relative(root, path).replaceAll("\\", "/");
  const record = expectedByPath.get(relativePath);
  const execution = await run(compiler, [
    "--ignoreConfig",
    "--noEmit",
    "--strict",
    "--exactOptionalPropertyTypes",
    "--target",
    "ES2022",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    path,
  ]);
  const runtimeExportsMatch =
    record?.id !== "TEST-TYPES-001/exports-signatures" ||
    JSON.stringify(actualRuntimeExports) === JSON.stringify(expectedRuntimeExports);
  const output = [
    execution.output,
    ...(runtimeExportsMatch
      ? []
      : [
          `Runtime exports differ: expected ${JSON.stringify(expectedRuntimeExports)}, received ${JSON.stringify(actualRuntimeExports)}\n`,
        ]),
  ].join("");
  results.push({
    acceptanceId: record?.id ?? `unknown-types:${relativePath}`,
    path: relativePath,
    result: execution.code === 0 && record && runtimeExportsMatch ? "pass" : "failed",
    ...(output ? { output } : {}),
  });
}

results.sort((left, right) => left.acceptanceId.localeCompare(right.acceptanceId));
process.stdout.write(`${JSON.stringify({ schemaVersion: 1, results })}\n`);
if (
  results.length === 0 ||
  new Set(results.map(({ acceptanceId }) => acceptanceId)).size !== results.length ||
  results.some(({ result }) => result !== "pass")
) {
  process.exitCode = 1;
}
