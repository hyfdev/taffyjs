import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Worker } from "node:worker_threads";
import { AvailableSpace, Dimension, TaffyTree } from "@taffyjs/node";
import { afterAll } from "vite-plus/test";
import { test } from "vite-plus/test";
import { platformForHost, platforms } from "../../../../tools/platforms.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const packageRoot = resolve(root, "packages/taffyjs-node");
const vp = resolve(root, "node_modules/.bin/vp");

type CommandResult = { code: number; stdout: string; stderr: string };
type Platform = (typeof platforms)[number];

const PUBLIC_RUNTIME_EXPORTS = [
  "AlignContent",
  "AlignItems",
  "AvailableSpace",
  "AvailableSpaceKind",
  "BoxSizing",
  "Clear",
  "DetailedLayoutInfoKind",
  "Dimension",
  "Direction",
  "Display",
  "FlexDirection",
  "FlexWrap",
  "Float",
  "GridAutoFlow",
  "GridPlacement",
  "GridPlacementKind",
  "GridTemplateComponent",
  "GridTemplateComponentKind",
  "LengthUnit",
  "Overflow",
  "Position",
  "RepetitionCount",
  "RepetitionCountKind",
  "TaffyTree",
  "TextAlign",
  "TrackSizingFunction",
  "TrackSizingKind",
] as const;
const ROOT_TARBALL_ENTRIES = [
  "package/README.md",
  "package/index.d.ts",
  "package/index.js",
  "package/native.js",
  "package/package.json",
];

async function readJson(path: string) {
  return JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
}

async function run(
  command: string,
  args: string[],
  cwd: string,
  {
    allowFailure = false,
    environment = {},
  }: { allowFailure?: boolean; environment?: Record<string, string> } = {},
) {
  const env = { ...process.env, ...environment };
  if (!("NAPI_RS_NATIVE_LIBRARY_PATH" in environment)) delete env.NAPI_RS_NATIVE_LIBRARY_PATH;
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

function hostPlatform() {
  const platform = platformForHost();
  assert.ok(platform, `Unsupported package-test host ${process.platform}/${process.arch}`);
  return platform;
}

async function firstTarball(directory: string) {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".tgz"));
  assert.equal(names.length, 1);
  return resolve(directory, names[0]);
}

async function tarEntries(path: string, cwd: string) {
  return (await run("tar", ["-tzf", path], cwd)).stdout.trim().split("\n").sort();
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
          [platform.packageName]: `file:${platformTarball}`,
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
  platform: Platform;
  rootEntries: string[];
  platformEntries: string[];
  firstConsumer: string;
  secondConsumer: string;
  missingPlatformBinaryFails: boolean;
};

let packedFixturePromise: Promise<PackedFixture> | undefined;
let packedFixtureRoot: string | undefined;

async function createPackedFixture(): Promise<PackedFixture> {
  const platform = hostPlatform();
  const platformRoot = resolve(packageRoot, "npm", platform.directory);
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), "taffyjs-package-test-"));
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
  const [firstConsumer, secondConsumer, missingBinaryConsumer, rootEntries, platformEntries] =
    await Promise.all([
      installConsumer(temporaryRoot, "consumer-one", rootTarball, platformTarball, platform),
      installConsumer(temporaryRoot, "consumer-two", rootTarball, platformTarball, platform),
      installConsumer(
        temporaryRoot,
        "consumer-missing-binary",
        rootTarball,
        platformTarball,
        platform,
      ),
      tarEntries(rootTarball, temporaryRoot),
      tarEntries(platformTarball, temporaryRoot),
    ]);
  await rename(
    resolve(missingBinaryConsumer, `node_modules/${platform.packageName}/${platform.binary}`),
    resolve(
      missingBinaryConsumer,
      `node_modules/${platform.packageName}/${platform.binary}.disabled`,
    ),
  );
  const missingBinary = await run(
    process.execPath,
    ["--input-type=module", "--eval", 'await import("@taffyjs/node")'],
    missingBinaryConsumer,
    { allowFailure: true },
  );
  return {
    platform,
    rootEntries,
    platformEntries,
    firstConsumer,
    secondConsumer,
    missingPlatformBinaryFails: missingBinary.code !== 0,
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
  const fixture = new URL("./fixtures/package-worker.mjs", import.meta.url);
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

test("public entry keeps the native loader private", async () => {
  const [manifest, source, output, nativeSource, nativeDeclaration] = await Promise.all([
    readJson(resolve(packageRoot, "package.json")),
    readFile(resolve(packageRoot, "src/index.ts"), "utf8"),
    readFile(resolve(packageRoot, "index.js"), "utf8"),
    readFile(resolve(packageRoot, "native.js"), "utf8"),
    readFile(resolve(packageRoot, "native.d.ts"), "utf8"),
  ]);
  assert.equal((manifest.engines as { node?: string })?.node, ">=22.18.0");
  assert.deepEqual(Object.keys(manifest.exports as object).sort(), [".", "./package.json"]);
  assert.match(source, /(?:^|\n)import ["']#native["'];/u);
  assert.match(output, /(?:^|\n)import ["']#native["'];/u);
  assert.doesNotMatch(output, /export\s+\*\s+from\s+["']\.\/native\.js["']/u);
  assert.doesNotMatch(nativeSource, /__bootstrap/u);
  assert.doesNotMatch(nativeDeclaration, /__bootstrap/u);
  assert.deepEqual(Object.keys(await import("@taffyjs/node")).sort(), PUBLIC_RUNTIME_EXPORTS);
});

test("workspace import", () => {
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

test("tarball works in a clean consumer", async () => {
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
  assert.deepEqual(result.keys, PUBLIC_RUNTIME_EXPORTS);
  assert.equal(result.count, 1);
  assert.equal(result.type, "bigint");
  assert.ok(
    fileURLToPath(result.resolved).startsWith(resolve(fixture.firstConsumer, "node_modules")),
  );
  assert.doesNotMatch(source, /@taffyjs\/binding-|native\.js/u);
});

test("tarballs contain only the published files", async () => {
  const fixture = await packedFixture();
  assert.deepEqual(fixture.rootEntries, ROOT_TARBALL_ENTRIES);
  assert.deepEqual(
    fixture.platformEntries,
    ["package/README.md", "package/package.json", `package/${fixture.platform.binary}`].sort(),
  );
  assert.equal(fixture.missingPlatformBinaryFails, true);
  const loader = await readFile(resolve(packageRoot, "native.js"), "utf8");
  const supported = /const taffyjsSupportedPlatforms = (\[[^\n]+\]);/u.exec(loader);
  assert.ok(supported);
  assert.deepEqual(JSON.parse(supported[1]), [
    "darwin-arm64",
    "darwin-x64",
    "linux-x64-gnu",
    "win32-x64",
  ]);
  const [workspace, lockfile] = await Promise.all([
    readFile(resolve(root, "pnpm-workspace.yaml"), "utf8"),
    readFile(resolve(root, "pnpm-lock.yaml"), "utf8"),
  ]);
  assert.match(workspace, /^  - packages\/taffyjs-node\/npm\/\*$/mu);
  assert.match(workspace, /^linkWorkspacePackages: true$/mu);
  for (const platform of platforms) {
    assert.match(
      lockfile,
      new RegExp(
        `'${platform.packageName.replaceAll("/", "\\/")}':\\n        specifier: 0\\.0\\.0\\n        version: link:npm\\/${platform.directory}`,
        "u",
      ),
    );
  }

  const rootManifest = await readJson(
    resolve(fixture.firstConsumer, "node_modules/@taffyjs/node/package.json"),
  );
  assert.equal((rootManifest.engines as { node?: string }).node, ">=22.18.0");
  assert.deepEqual(
    rootManifest.optionalDependencies,
    Object.fromEntries(platforms.map((platform) => [platform.packageName, "0.0.0"])),
  );
  const platformManifest = await readJson(
    resolve(fixture.firstConsumer, `node_modules/${fixture.platform.packageName}/package.json`),
  );
  assert.equal(platformManifest.name, fixture.platform.packageName);
  assert.equal(platformManifest.main, fixture.platform.binary);
  assert.ok(
    (
      await stat(
        resolve(
          fixture.firstConsumer,
          `node_modules/${fixture.platform.packageName}/${fixture.platform.binary}`,
        ),
      )
    ).isFile(),
  );

  const manifests = [await readJson(resolve(packageRoot, "package.json"))];
  for (const platform of platforms) {
    manifests.push(await readJson(resolve(packageRoot, "npm", platform.directory, "package.json")));
  }
  assert.equal(manifests.length, 5);
  for (const manifest of manifests) {
    assert.equal(manifest.private, true);
    assert.equal(manifest.version, "0.0.0");
    assert.equal(manifest.license, "UNLICENSED");
  }
});

test("garbage collection releases native state", async () => {
  const testHooksRoot = resolve(packageRoot, "node_modules/.cache/taffyjs-test-hooks");
  const nativeLibraries = (await readdir(testHooksRoot)).filter((name) => name.endsWith(".node"));
  assert.equal(nativeLibraries.length, 1);
  const testHooksPath = resolve(testHooksRoot, nativeLibraries[0]);
  const child = await run(
    process.execPath,
    ["--expose-gc", fileURLToPath(new URL("./fixtures/package-cleanup.mjs", import.meta.url))],
    root,
    {
      environment: {
        NAPI_RS_NATIVE_LIBRARY_PATH: testHooksPath,
        TAFFYJS_TEST_HOOKS_PATH: testHooksPath,
      },
    },
  );
  assert.deepEqual(JSON.parse(child.stdout), {
    wrapperCollected: true,
    ownedNativeCollected: true,
    contextCollected: true,
    callbackCollected: true,
    retainedTreesAlive: true,
  });
});

test("workers and separate installs keep tree identities isolated", async () => {
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

test("unsupported platforms have a clear error", async () => {
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

test("private package paths are not exported", async () => {
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
