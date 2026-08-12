import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contractTest, registrations } from "./contract-test.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const packageRoot = resolve(root, "packages/taffyjs-node");
const vp = resolve(root, "node_modules/.bin/vp");
function asciiCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

async function run(command, args, cwd) {
  const env = { ...process.env };
  delete env.NAPI_RS_NATIVE_LIBRARY_PATH;
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const result = {
        code: code ?? -1,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      };
      if (result.code === 0) resolvePromise(result);
      else
        reject(
          new Error(
            `${command} ${args.join(" ")} exited ${result.code}\n${result.stdout}${result.stderr}`,
          ),
        );
    });
  });
}

function hostTarget() {
  const targets = {
    "darwin/arm64": "aarch64-apple-darwin",
    "darwin/x64": "x86_64-apple-darwin",
    "linux/x64": "x86_64-unknown-linux-gnu",
    "win32/x64": "x86_64-pc-windows-msvc",
  };
  const key = `${process.platform}/${process.arch}`;
  const target = targets[key];
  assert.ok(target, `Unsupported minimum-Node host ${key}`);
  return target;
}

async function firstTarball(directory) {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".tgz"));
  assert.equal(names.length, 1);
  return resolve(directory, names[0]);
}

async function sha256(path) {
  return createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
}

async function copyRelative(sourceRoot, destinationRoot, path) {
  const destination = resolve(destinationRoot, path);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(sourceRoot, path), destination);
}

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await walk(path)));
    else if (entry.isFile()) output.push(path);
  }
  return output;
}

async function createConsumer(temporaryRoot, rootTarball, platformTarball, platform) {
  const consumer = resolve(temporaryRoot, "consumer");
  await mkdir(consumer, { recursive: true });
  await writeFile(
    resolve(consumer, "package.json"),
    `${JSON.stringify(
      {
        name: "taffyjs-minimum-node-consumer",
        private: true,
        type: "module",
        packageManager: "pnpm@11.20.0",
        dependencies: {
          "@taffyjs/node": `file:${rootTarball}`,
          [platform.name]: `file:${platformTarball}`,
        },
      },
      null,
      2,
    )}\n`,
  );
  await run(vp, ["install", "--offline", "--no-frozen-lockfile", "--ignore-scripts"], consumer);
  return consumer;
}

async function projectTestSources(contract, consumer) {
  const projectionRoot = resolve(consumer, "projection");
  const primaryById = new Map(
    contract.generated.evidence.primary.map((record) => [record.id, record]),
  );
  const secondary = contract.generated.evidence.minimumNode.map((record) => {
    const primary = primaryById.get(record.sourceId);
    assert.ok(primary);
    return { id: record.sourceId, owner: record.owner, path: primary.path };
  });
  assert.equal(secondary.length, 816);
  const testPaths = [...new Set(secondary.map(({ path }) => path))].sort(asciiCompare);
  for (const path of testPaths) await copyRelative(root, projectionRoot, path);

  const publicTestRoot = resolve(root, "tests/taffyjs-node/tests");
  for (const path of await walk(publicTestRoot)) {
    const relativePath = relative(root, path).replaceAll("\\", "/");
    if (relativePath.includes("/fixtures/")) {
      await copyRelative(root, projectionRoot, relativePath);
    }
  }
  await copyRelative(root, projectionRoot, "tools/taffy-api/contract.json");
  await copyRelative(
    root,
    projectionRoot,
    "packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts",
  );

  const installedRoot = resolve(consumer, "node_modules/@taffyjs/node");
  for (const name of ["package.json", "README.md", "index.js", "index.d.ts", "native.js"]) {
    await copyRelative(installedRoot, resolve(projectionRoot, "packages/taffyjs-node"), name);
  }
  await mkdir(resolve(projectionRoot, "packages/taffyjs-node/node_modules/.cache"), {
    recursive: true,
  });

  const registrarPath = resolve(projectionRoot, "tests/taffyjs-node/tests/contract-test.mts");
  await mkdir(dirname(registrarPath), { recursive: true });
  await writeFile(
    registrarPath,
    [
      "export const contractTests = [];",
      "export function contractTest(id, body) { contractTests.push({ id, body }); }",
      "",
    ].join("\n"),
  );

  const runnerPath = "tests/taffyjs-node/minimum-node/projection-runner.mjs";
  await copyRelative(root, projectionRoot, runnerPath);
  const metadata = {
    testPaths,
    secondary,
    runtimeExportsByOwner: contract.publicRuntimeExportsByOwner,
    classMembersByOwner: contract.publicClassMembersByOwner,
    numericFamilies: contract.numericFamilies,
    helperCoverage:
      contract.primaryEvidenceRules.minimumNodeCompatibility
        .valueHelperCoverageAcceptanceIdsByExport,
  };
  await writeFile(
    resolve(projectionRoot, "tests/taffyjs-node/minimum-node/metadata.json"),
    `${JSON.stringify(metadata)}\n`,
  );
  return resolve(projectionRoot, runnerPath);
}

contractTest("MATURITY-002/minimum-node", async () => {
  assert.equal(process.version, "v22.18.0");
  const contract = JSON.parse(
    await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"),
  );
  const target = hostTarget();
  const platform = contract.platformPackages[target];
  assert.ok(platform);
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), "taffyjs-node-22-18-"));
  try {
    const rootTarballs = resolve(temporaryRoot, "root-tarball");
    const platformTarballs = resolve(temporaryRoot, "platform-tarball");
    await Promise.all([
      mkdir(rootTarballs, { recursive: true }),
      mkdir(platformTarballs, { recursive: true }),
    ]);
    const platformRoot = resolve(
      packageRoot,
      "npm",
      platform.name.slice("@taffyjs/binding-".length),
    );
    await Promise.all([
      run(vp, ["exec", "pnpm", "pack", "--pack-destination", rootTarballs], packageRoot),
      run(vp, ["exec", "pnpm", "pack", "--pack-destination", platformTarballs], platformRoot),
    ]);
    const rootTarball = await firstTarball(rootTarballs);
    const platformTarball = await firstTarball(platformTarballs);
    const consumer = await createConsumer(temporaryRoot, rootTarball, platformTarball, platform);
    const runner = await projectTestSources(contract, consumer);
    const execution = await run(process.execPath, [runner], consumer);
    const outputLines = execution.stdout.trim().split("\n");
    assert.equal(outputLines.length, 1);
    const projected = JSON.parse(outputLines[0]);
    assert.equal(projected.runtime, "v22.18.0");
    assert.ok(
      fileURLToPath(projected.resolvedPackageUrl).startsWith(resolve(consumer, "node_modules")),
    );
    const expectedSecondary = contract.generated.evidence.minimumNode
      .map(({ id }) => id)
      .sort(asciiCompare);
    const expectedProbes = contract.generated.evidence.surfaceProbes
      .map(({ id }) => id)
      .sort(asciiCompare);
    assert.deepEqual(
      projected.secondaryResults.map(({ identity }) => identity),
      expectedSecondary,
    );
    assert.deepEqual(
      projected.surfaceProbeResults.map(({ identity }) => identity),
      expectedProbes,
    );
    assert.ok(projected.secondaryResults.every(({ result }) => result === "pass"));
    assert.ok(projected.surfaceProbeResults.every(({ result }) => result === "pass"));
    return {
      schemaVersion: 1,
      primary: { identity: "MATURITY-002/minimum-node", result: "pass" },
      runtime: {
        version: process.version,
        executableSha256: await sha256(process.execPath),
      },
      tarballs: {
        root: { sha256: await sha256(rootTarball) },
        platform: { name: platform.name, target, sha256: await sha256(platformTarball) },
      },
      packageResolution: {
        specifier: "@taffyjs/node",
        kind: "packed",
        resolvedUrl: projected.resolvedPackageUrl,
      },
      secondaryResults: projected.secondaryResults,
      surfaceProbeResults: projected.surfaceProbeResults,
    };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

assert.equal(registrations.length, 1);
export const minimumNodeTest = registrations[0];
