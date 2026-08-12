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
const registeredStates = new Set([
  "tests-authored",
  "implemented",
  "verified",
  "under-review",
  "accepted",
]);
const expectedByIdentity = new Map(
  contract.generated.evidence.primary
    .filter(
      ({ modality, owner }) =>
        modality === "rust-contract" && registeredStates.has(status.taskStates[owner]),
    )
    .map((record) => [record.identity, record]),
);

function run(args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn("cargo", args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    const output = [];
    child.stdout.on("data", (chunk) => output.push(chunk));
    child.stderr.on("data", (chunk) => output.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => resolvePromise({ code, output: Buffer.concat(output).toString() }));
  });
}

const listed = await run(["test", "--locked", "-p", "taffyjs_binding", "--lib", "--", "--list"]);
if (listed.code !== 0) {
  process.stdout.write(listed.output);
  process.exit(1);
}
const identities = listed.output
  .split("\n")
  .map((line) => /^(contract_tests::contract__[a-z0-9_]+): test$/u.exec(line)?.[1])
  .filter(Boolean)
  .sort((left, right) => left.localeCompare(right));
const expectedIdentities = [...expectedByIdentity.keys()].sort((left, right) =>
  left.localeCompare(right),
);
if (JSON.stringify(identities) !== JSON.stringify(expectedIdentities)) {
  process.stdout.write(
    `${JSON.stringify({ schemaVersion: 1, listedIdentities: identities, expectedIdentities, results: [] })}\n`,
  );
  process.exit(1);
}
const results = [];
for (const identity of identities) {
  const record = expectedByIdentity.get(identity);
  const execution = await run([
    "test",
    "--locked",
    "-p",
    "taffyjs_binding",
    "--lib",
    "--",
    "--exact",
    identity,
  ]);
  results.push({
    acceptanceId: record?.id ?? `unknown-rust:${identity}`,
    path: record?.path ?? "crates/taffyjs_binding/src/contract_tests.rs",
    result: execution.code === 0 && record ? "pass" : "failed",
    ...(execution.code === 0 ? {} : { output: execution.output }),
  });
}

process.stdout.write(
  `${JSON.stringify({ schemaVersion: 1, listedIdentities: identities, results })}\n`,
);
if (
  results.length === 0 ||
  new Set(identities).size !== identities.length ||
  results.some(({ result }) => result !== "pass")
) {
  process.exitCode = 1;
}
