import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { contractTest } from "../contract-test.mts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const packageRoot = resolve(root, "packages/taffyjs-node");
const vp = resolve(root, "node_modules/.bin/vp");

async function readJson(path: string) {
  return JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
}

async function importPublicPackage() {
  const specifier: string = "@taffyjs/node";
  return (await import(specifier)) as Record<string, unknown>;
}

async function run(command: string, args: string[], cwd: string, allowFailure = false) {
  const env = { ...process.env };
  delete env.NAPI_RS_NATIVE_LIBRARY_PATH;
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const result = {
        code: code ?? -1,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      };
      if (code !== 0 && !allowFailure) {
        reject(
          new Error(
            `${command} ${args.join(" ")} exited ${code}\n${result.stdout}${result.stderr}`,
          ),
        );
      } else resolvePromise(result);
    });
  });
}

function hostTarget() {
  const key = `${process.platform}/${process.arch}`;
  const targets: Record<string, string> = {
    "darwin/arm64": "aarch64-apple-darwin",
    "darwin/x64": "x86_64-apple-darwin",
    "linux/x64": "x86_64-unknown-linux-gnu",
    "win32/x64": "x86_64-pc-windows-msvc",
  };
  const target = targets[key];
  assert.ok(target, `Unsupported contract-test host ${key}`);
  return target;
}

async function expectedRuntimeExports() {
  const [contract, statusSource] = await Promise.all([
    readJson(resolve(root, "tools/taffy-api/contract.json")),
    readFile(resolve(root, ".agents/docs/loop-status.md"), "utf8"),
  ]);
  const match =
    /<!-- loop-status-json:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- loop-status-json:end -->/u.exec(
      statusSource,
    );
  assert.ok(match);
  const status = JSON.parse(match[1]) as { taskStates: Record<string, string> };
  const implemented = new Set(["implemented", "verified", "under-review", "accepted"]);
  const exportsByOwner = contract.publicRuntimeExportsByOwner as Record<string, string[]>;
  return Object.entries(exportsByOwner)
    .filter(([owner]) => implemented.has(status.taskStates[owner]))
    .flatMap(([, names]) => names)
    .sort();
}

type PackedFixture = {
  exportedKeys: string[];
  platformEntries: string[];
  platformManifest: Record<string, unknown>;
  privateImportCode: string | null;
  platformBinaryRequired: boolean;
  rootEntries: string[];
  rootManifest: Record<string, unknown>;
};

let packedFixturePromise: Promise<PackedFixture> | undefined;

async function createPackedFixture(): Promise<PackedFixture> {
  const contract = await readJson(resolve(root, "tools/taffy-api/contract.json"));
  const target = hostTarget();
  const platform = (contract.platformPackages as Record<string, { binary: string; name: string }>)[
    target
  ];
  assert.ok(platform);
  const platformRoot = resolve(packageRoot, "npm", platform.name.slice("@taffyjs/binding-".length));
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), "taffyjs-infra-002-"));
  try {
    const rootTarballs = resolve(temporaryRoot, "root-tarball");
    const platformTarballs = resolve(temporaryRoot, "platform-tarball");
    await Promise.all([
      mkdir(rootTarballs, { recursive: true }),
      mkdir(platformTarballs, { recursive: true }),
    ]);
    await run(vp, ["exec", "pnpm", "pack", "--pack-destination", rootTarballs], packageRoot);
    await run(vp, ["exec", "pnpm", "pack", "--pack-destination", platformTarballs], platformRoot);
    const rootTarball = resolve(
      rootTarballs,
      (await readdir(rootTarballs)).find((name) => name.endsWith(".tgz")) ?? "missing.tgz",
    );
    const platformTarball = resolve(
      platformTarballs,
      (await readdir(platformTarballs)).find((name) => name.endsWith(".tgz")) ?? "missing.tgz",
    );
    const rootEntries = (await run("tar", ["-tzf", rootTarball], temporaryRoot)).stdout
      .trim()
      .split("\n")
      .sort();
    const platformEntries = (await run("tar", ["-tzf", platformTarball], temporaryRoot)).stdout
      .trim()
      .split("\n")
      .sort();
    const consumer = resolve(temporaryRoot, "consumer");
    await mkdir(consumer, { recursive: true });
    await writeFile(
      resolve(consumer, "package.json"),
      `${JSON.stringify(
        {
          name: "taffyjs-infra-002-consumer",
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
    await writeFile(
      resolve(consumer, "probe.mjs"),
      [
        'import * as api from "@taffyjs/node";',
        "let privateImportCode = null;",
        'try { await import("@taffyjs/node/native.js"); } catch (error) { privateImportCode = error.code ?? null; }',
        "console.log(JSON.stringify({ exportedKeys: Object.keys(api).sort(), privateImportCode }));",
      ].join("\n"),
    );
    const probe = JSON.parse((await run(process.execPath, ["probe.mjs"], consumer)).stdout) as {
      exportedKeys: string[];
      privateImportCode: string | null;
    };
    const installedRoot = resolve(consumer, "node_modules/@taffyjs/node");
    const installedBinary = resolve(consumer, `node_modules/${platform.name}/${platform.binary}`);
    assert.ok((await stat(installedBinary)).isFile());
    assert.ok(!(await readdir(installedRoot)).some((entry) => entry.endsWith(".node")));
    const disabledBinary = `${installedBinary}.disabled`;
    await rename(installedBinary, disabledBinary);
    const withoutPlatformBinary = await run(process.execPath, ["probe.mjs"], consumer, true);
    return {
      ...probe,
      platformBinaryRequired: withoutPlatformBinary.code !== 0,
      platformEntries,
      platformManifest: await readJson(
        resolve(consumer, `node_modules/${platform.name}/package.json`),
      ),
      rootEntries,
      rootManifest: await readJson(resolve(consumer, "node_modules/@taffyjs/node/package.json")),
    };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

function packedFixture() {
  packedFixturePromise ??= createPackedFixture();
  return packedFixturePromise;
}

contractTest("INFRA-002/source-entry", async () => {
  const [manifest, workspace, packageSource, lock] = await Promise.all([
    readJson(resolve(packageRoot, "package.json")),
    readFile(resolve(root, "pnpm-workspace.yaml"), "utf8"),
    readFile(resolve(packageRoot, "src/index.ts"), "utf8"),
    readFile(resolve(root, "pnpm-lock.yaml"), "utf8"),
  ]);
  assert.equal((manifest.engines as { node?: string })?.node, ">=22.18.0");
  assert.equal((manifest.devDependencies as Record<string, string>)["@types/node"], "catalog:");
  assert.match(workspace, /"@types\/node": 22\.18\.0(?:\n|$)/u);
  assert.match(lock, /'@types\/node@22\.18\.0':/u);
  assert.match(packageSource, /(?:^|\n)import ["']#native["'];/u);
  assert.deepEqual(Object.keys(await importPublicPackage()).sort(), await expectedRuntimeExports());
});

contractTest("INFRA-002/private-native", async () => {
  const [manifest, nativeSource, nativeDeclaration, publicSource, fixture] = await Promise.all([
    readJson(resolve(packageRoot, "package.json")),
    readFile(resolve(packageRoot, "native.js"), "utf8"),
    readFile(resolve(packageRoot, "native.d.ts"), "utf8"),
    readFile(resolve(packageRoot, "index.js"), "utf8"),
    packedFixture(),
  ]);
  assert.deepEqual(Object.keys(manifest.exports as object).sort(), [".", "./package.json"]);
  assert.match(publicSource, /(?:^|\n)import ["']#native["'];/u);
  assert.doesNotMatch(publicSource, /export\s+\*\s+from\s+["']\.\/native\.js["']/u);
  assert.doesNotMatch(nativeSource, /__bootstrap/u);
  assert.doesNotMatch(nativeDeclaration, /__bootstrap/u);
  assert.equal(fixture.privateImportCode, "ERR_PACKAGE_PATH_NOT_EXPORTED");
});

contractTest("INFRA-002/pack-entry", async () => {
  const contract = await readJson(resolve(root, "tools/taffy-api/contract.json"));
  const target = hostTarget();
  const platform = (contract.platformPackages as Record<string, { binary: string; name: string }>)[
    target
  ];
  const fixture = await packedFixture();
  assert.deepEqual(
    fixture.rootEntries,
    [...(contract.tarballContents as { root: string[] }).root].sort(),
  );
  assert.equal(
    (fixture.rootManifest.engines as { node?: string })?.node,
    (contract.pins as { node: string }).node,
  );
  assert.deepEqual(
    fixture.platformEntries,
    (contract.tarballContents as { platform: string[] }).platform
      .map((entry) => entry.replace("<target-binary>", platform.binary))
      .sort(),
  );
  assert.equal(fixture.platformManifest.name, platform.name);
  assert.equal(fixture.platformManifest.main, platform.binary);
  assert.deepEqual(fixture.exportedKeys, await expectedRuntimeExports());
  assert.equal(fixture.platformBinaryRequired, true);
});

contractTest("INFRA-002/foundation-exports", async () => {
  const expected = await expectedRuntimeExports();
  const [workspace, packed] = await Promise.all([importPublicPackage(), packedFixture()]);
  assert.deepEqual(Object.keys(workspace).sort(), expected);
  assert.deepEqual(packed.exportedKeys, expected);
  assert.ok(!expected.includes("__bootstrap"));
});
