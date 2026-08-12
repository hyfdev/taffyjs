import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Worker } from "node:worker_threads";
import { AvailableSpace, Dimension, TaffyTree } from "@taffyjs/node";
import { afterAll } from "vite-plus/test";
import { contractTest } from "../contract-test.mts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const packageRoot = resolve(root, "packages/taffyjs-node");
const vp = resolve(root, "node_modules/.bin/vp");

type CommandResult = { code: number; stdout: string; stderr: string };
type Platform = { binary: string; name: string };
type PackageContract = {
  pins: { node: string };
  platformPackages: Record<string, Platform>;
  publicRuntimeExportsByOwner: Record<string, string[]>;
  tarballContents: { platform: string[]; root: string[] };
};

async function readJson(path: string) {
  return JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
}

async function run(
  command: string,
  args: string[],
  cwd: string,
  { allowFailure = false }: { allowFailure?: boolean } = {},
) {
  const env = { ...process.env };
  delete env.NAPI_RS_NATIVE_LIBRARY_PATH;
  return new Promise<CommandResult>((resolvePromise, reject) => {
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
      if (result.code === 0 || allowFailure) resolvePromise(result);
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
  const targets: Record<string, string> = {
    "darwin/arm64": "aarch64-apple-darwin",
    "darwin/x64": "x86_64-apple-darwin",
    "linux/x64": "x86_64-unknown-linux-gnu",
    "win32/x64": "x86_64-pc-windows-msvc",
  };
  const key = `${process.platform}/${process.arch}`;
  const target = targets[key];
  assert.ok(target, `Unsupported lifecycle-test host ${key}`);
  return target;
}

async function firstTarball(directory: string) {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".tgz"));
  assert.equal(names.length, 1);
  return resolve(directory, names[0]);
}

async function tarEntries(path: string, cwd: string) {
  return (await run("tar", ["-tzf", path], cwd)).stdout.trim().split("\n").sort();
}

async function sha256(path: string) {
  return createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
}

async function installConsumer(
  temporaryRoot: string,
  name: string,
  rootTarball: string,
  platformTarball: string,
  platform: Platform,
) {
  const consumer = resolve(temporaryRoot, name);
  await mkdir(consumer, { recursive: true });
  await writeFile(
    resolve(consumer, "package.json"),
    `${JSON.stringify(
      {
        name: `taffyjs-${name}`,
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

type PackedFixture = {
  contract: PackageContract;
  platform: Platform;
  rootTarball: string;
  platformTarball: string;
  rootEntries: string[];
  platformEntries: string[];
  rootHash: string;
  platformHash: string;
  firstConsumer: string;
  secondConsumer: string;
  temporaryRoot: string;
};

let packedFixturePromise: Promise<PackedFixture> | undefined;
let packedFixtureRoot: string | undefined;

async function createPackedFixture(): Promise<PackedFixture> {
  const contract = JSON.parse(
    await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"),
  ) as PackageContract;
  const platform = contract.platformPackages[hostTarget()];
  assert.ok(platform);
  const platformRoot = resolve(packageRoot, "npm", platform.name.slice("@taffyjs/binding-".length));
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), "taffyjs-maturity-002-"));
  packedFixtureRoot = temporaryRoot;
  const rootTarballs = resolve(temporaryRoot, "root-tarball");
  const platformTarballs = resolve(temporaryRoot, "platform-tarball");
  await Promise.all([
    mkdir(rootTarballs, { recursive: true }),
    mkdir(platformTarballs, { recursive: true }),
  ]);
  await Promise.all([
    run(vp, ["exec", "pnpm", "pack", "--pack-destination", rootTarballs], packageRoot),
    run(vp, ["exec", "pnpm", "pack", "--pack-destination", platformTarballs], platformRoot),
  ]);
  const rootTarball = await firstTarball(rootTarballs);
  const platformTarball = await firstTarball(platformTarballs);
  const [firstConsumer, secondConsumer, rootEntries, platformEntries, rootHash, platformHash] =
    await Promise.all([
      installConsumer(temporaryRoot, "consumer-one", rootTarball, platformTarball, platform),
      installConsumer(temporaryRoot, "consumer-two", rootTarball, platformTarball, platform),
      tarEntries(rootTarball, temporaryRoot),
      tarEntries(platformTarball, temporaryRoot),
      sha256(rootTarball),
      sha256(platformTarball),
    ]);
  return {
    contract,
    platform,
    rootTarball,
    platformTarball,
    rootEntries,
    platformEntries,
    rootHash,
    platformHash,
    firstConsumer,
    secondConsumer,
    temporaryRoot,
  };
}

function packedFixture() {
  packedFixturePromise ??= createPackedFixture();
  return packedFixturePromise;
}

afterAll(async () => {
  if (packedFixtureRoot) await rm(packedFixtureRoot, { recursive: true, force: true });
});

async function runConsumer(consumer: string, name: string, source: string, allowFailure = false) {
  const path = resolve(consumer, name);
  await writeFile(path, source);
  return run(process.execPath, [path], consumer, { allowFailure });
}

async function workerResult() {
  const fixture = new URL("./fixtures/maturity-002-worker.mjs", import.meta.url);
  const worker = new Worker(fixture);
  try {
    return await new Promise<{ count: number; node: bigint }>((resolvePromise, reject) => {
      worker.once("error", reject);
      worker.once("message", resolvePromise);
    });
  } finally {
    await worker.terminate();
  }
}

contractTest("MATURITY-002/workspace-import", () => {
  const tree = new TaffyTree();
  const root = tree.newLeaf({
    size: { width: Dimension.Length(12), height: Dimension.Length(7) },
  });
  tree.computeLayout({
    root,
    availableSpace: { width: AvailableSpace.MaxContent, height: AvailableSpace.MaxContent },
  });
  assert.deepEqual(tree.getUnroundedLayout(root).size, { width: 12, height: 7 });
});

contractTest("MATURITY-002/tarball-consumer", async () => {
  const fixture = await packedFixture();
  const source = [
    'import * as api from "@taffyjs/node";',
    "const tree = new api.TaffyTree();",
    "const node = tree.newLeaf({});",
    'console.log(JSON.stringify({ keys: Object.keys(api).sort(), count: tree.getNodeCount(), type: typeof node, resolved: import.meta.resolve("@taffyjs/node") }));',
  ].join("\n");
  const result = JSON.parse(
    (await runConsumer(fixture.firstConsumer, "public-probe.mjs", source)).stdout,
  ) as { count: number; keys: string[]; resolved: string; type: string };
  const expected = Object.values(fixture.contract.publicRuntimeExportsByOwner).flat().sort();
  assert.deepEqual(result.keys, expected);
  assert.equal(result.count, 1);
  assert.equal(result.type, "bigint");
  assert.ok(
    fileURLToPath(result.resolved).startsWith(resolve(fixture.firstConsumer, "node_modules")),
  );
  assert.doesNotMatch(source, /@taffyjs\/binding-|native\.js/u);
});

contractTest("MATURITY-002/contents", async () => {
  const fixture = await packedFixture();
  assert.deepEqual(fixture.rootEntries, [...fixture.contract.tarballContents.root].sort());
  assert.deepEqual(
    fixture.platformEntries,
    fixture.contract.tarballContents.platform
      .map((entry) => entry.replace("<target-binary>", fixture.platform.binary))
      .sort(),
  );
  assert.match(fixture.rootHash, /^[a-f0-9]{64}$/u);
  assert.match(fixture.platformHash, /^[a-f0-9]{64}$/u);

  const rootManifest = await readJson(
    resolve(fixture.firstConsumer, "node_modules/@taffyjs/node/package.json"),
  );
  assert.equal((rootManifest.engines as { node?: string }).node, fixture.contract.pins.node);
  assert.deepEqual(rootManifest.optionalDependencies, {
    "@taffyjs/binding-darwin-arm64": "0.0.0",
    "@taffyjs/binding-darwin-x64": "0.0.0",
    "@taffyjs/binding-linux-x64-gnu": "0.0.0",
    "@taffyjs/binding-win32-x64-msvc": "0.0.0",
  });
  assert.ok(
    (
      await stat(
        resolve(
          fixture.firstConsumer,
          `node_modules/${fixture.platform.name}/${fixture.platform.binary}`,
        ),
      )
    ).isFile(),
  );

  const manifests = [await readJson(resolve(packageRoot, "package.json"))];
  for (const { name } of Object.values(fixture.contract.platformPackages)) {
    manifests.push(
      await readJson(
        resolve(packageRoot, "npm", name.slice("@taffyjs/binding-".length), "package.json"),
      ),
    );
  }
  assert.equal(manifests.length, 5);
  for (const manifest of manifests) {
    assert.equal(manifest.private, true);
    assert.equal(manifest.version, "0.0.0");
    assert.equal(manifest.license, "UNLICENSED");
  }
});

contractTest("MATURITY-002/cleanup", async () => {
  const child = await run(
    process.execPath,
    ["--expose-gc", fileURLToPath(new URL("./fixtures/maturity-002-cleanup.mjs", import.meta.url))],
    root,
  );
  assert.deepEqual(JSON.parse(child.stdout), {
    wrapperCollected: true,
    nativeCollected: true,
    contextCollected: true,
    callbackCollected: true,
    retainedTreesAlive: true,
  });
});

contractTest("MATURITY-002/isolation", async () => {
  const [firstWorker, secondWorker, fixture] = await Promise.all([
    workerResult(),
    workerResult(),
    packedFixture(),
  ]);
  assert.equal(firstWorker.count, 1);
  assert.equal(secondWorker.count, 1);
  const localTree = new TaffyTree();
  assert.throws(() => localTree.getStyle(firstWorker.node as never), {
    code: "ERR_TAFFY_FOREIGN_NODE_ID",
  });
  assert.throws(() => localTree.getStyle(secondWorker.node as never), {
    code: "ERR_TAFFY_FOREIGN_NODE_ID",
  });

  const resolveFrom = (consumer: string) =>
    createRequire(resolve(consumer, "package.json")).resolve("@taffyjs/node");
  const [firstApi, secondApi] = await Promise.all([
    import(pathToFileURL(resolveFrom(fixture.firstConsumer)).href),
    import(pathToFileURL(resolveFrom(fixture.secondConsumer)).href),
  ]);
  assert.notEqual(resolveFrom(fixture.firstConsumer), resolveFrom(fixture.secondConsumer));
  const firstTree = new firstApi.TaffyTree();
  const secondTree = new secondApi.TaffyTree();
  const firstNode = firstTree.newLeaf({});
  assert.throws(() => secondTree.getStyle(firstNode), { code: "ERR_TAFFY_FOREIGN_NODE_ID" });
});

contractTest("MATURITY-002/unsupported-platform", async () => {
  const fixture = await packedFixture();
  const source = [
    'Object.defineProperty(process, "platform", { value: "freebsd" });',
    "try {",
    '  await import("@taffyjs/node");',
    "  console.log(JSON.stringify({ loaded: true, messages: [] }));",
    "} catch (error) {",
    "  const messages = [];",
    "  for (let current = error; current; current = current.cause) messages.push(String(current.message));",
    "  console.log(JSON.stringify({ loaded: false, messages }));",
    "}",
  ].join("\n");
  const result = JSON.parse(
    (await runConsumer(fixture.firstConsumer, "unsupported-platform.mjs", source)).stdout,
  ) as { loaded: boolean; messages: string[] };
  assert.equal(result.loaded, false);
  assert.ok(
    result.messages.some((message) =>
      /Unsupported OS and architecture: freebsd x64/u.test(message),
    ),
  );
});

contractTest("MATURITY-002/private-path", async () => {
  const fixture = await packedFixture();
  const subpaths = [
    "native.js",
    "index.js",
    "index.d.ts",
    "README.md",
    "src/index.js",
    "taffyjs.node",
  ];
  const source = [
    `const subpaths = ${JSON.stringify(subpaths)};`,
    "const results = [];",
    "for (const subpath of subpaths) {",
    "  try {",
    "    await import(`@taffyjs/node/${subpath}`);",
    "    results.push({ subpath, code: null });",
    "  } catch (error) {",
    "    results.push({ subpath, code: error.code ?? null });",
    "  }",
    "}",
    "console.log(JSON.stringify(results));",
  ].join("\n");
  const results = JSON.parse(
    (await runConsumer(fixture.firstConsumer, "private-paths.mjs", source)).stdout,
  ) as { code: string | null; subpath: string }[];
  assert.deepEqual(
    results,
    subpaths.map((subpath) => ({ subpath, code: "ERR_PACKAGE_PATH_NOT_EXPORTED" })),
  );
  const readme = await readFile(resolve(packageRoot, "README.md"), "utf8");
  assert.match(readme, /Direct absolute-file access[\s\S]*unsupported[\s\S]*technically possible/u);
});
