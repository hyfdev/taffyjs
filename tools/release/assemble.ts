import assert from "node:assert/strict";
import { cp, mkdtemp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, relative, resolve, sep } from "node:path";

import { platforms } from "../platforms.ts";
import {
  releaseGroups,
  type ReleaseGroupName,
  type ReleasePackage,
  type ReleasePackageKind,
} from "./config.ts";
import { capture, isMainModule, readJson, root, sha512Integrity, writeJson } from "./lib.ts";
import type { ReleasePlan } from "./plan.ts";
import { parseStableVersion } from "./version.ts";

interface PackageJson extends Record<string, unknown> {
  name: string;
  version: string;
  private?: boolean;
  license?: string;
  files?: readonly string[];
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

interface PackResult {
  readonly filename: string;
  readonly integrity: string;
  readonly files: readonly { readonly path: string }[];
}

export interface ReleaseBundlePackage {
  readonly name: string;
  readonly kind: ReleasePackageKind;
  readonly version: string;
  readonly tarball: string;
  readonly integrity: string;
  readonly files: readonly string[];
}

export interface ReleaseBundleManifest {
  readonly group: ReleaseGroupName;
  readonly version: string;
  readonly tag: string;
  readonly commit: string;
  readonly coreVersion?: string;
  readonly packages: readonly ReleaseBundlePackage[];
}

if (isMainModule(import.meta.url)) {
  const options = parseOptions(process.argv.slice(2));
  const planPath = safePath(options.plan);
  const outputDirectory = safePath(options.output);
  const artifactDirectory = options.artifacts ? safePath(options.artifacts) : undefined;
  const plan = await readJson<ReleasePlan>(planPath);
  await assemble(plan, outputDirectory, artifactDirectory, options.coreVersion);
}

export async function assemble(
  plan: ReleasePlan,
  outputDirectory: string,
  artifactDirectory?: string,
  requestedCoreVersion?: string,
): Promise<void> {
  const group = releaseGroups[plan.group];
  parseStableVersion(plan.version);
  assert.equal(plan.tag, `${group.tagPrefix}${plan.version}`);
  assert.equal(plan.commit, await capture("git", ["rev-parse", "HEAD"]));

  const coreVersion =
    plan.group === "yoga" ? await resolveCoreVersion(requestedCoreVersion) : undefined;
  if (plan.group === "core") {
    if (artifactDirectory === undefined) throw new Error("Core assembly requires native artifacts");
    await verifyNativeArtifacts(artifactDirectory);
  }

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  const stageRoot = await mkdtemp(resolve(root, ".release-stage-"));

  try {
    const packages: ReleaseBundlePackage[] = [];
    for (const packageDefinition of group.packages) {
      const packageDirectory = resolve(stageRoot, packageDefinition.name.replace(/^@/, ""));
      await cp(resolve(root, packageDefinition.sourceDirectory), packageDirectory, {
        recursive: true,
        filter: shouldCopyStagePath,
      });
      await cp(resolve(root, "LICENSE"), resolve(packageDirectory, "LICENSE"));

      const manifestPath = resolve(packageDirectory, "package.json");
      const manifest = await readJson<PackageJson>(manifestPath);
      const sourceVersion = manifest.version;
      prepareManifest(manifest, packageDefinition, plan.version, coreVersion);
      await writeJson(manifestPath, manifest);

      if (packageDefinition.kind === "node") {
        const entryPath = resolve(packageDirectory, "index.js");
        const entry = await readFile(entryPath, "utf8");
        await writeFile(entryPath, rewriteNodeLoaderVersion(entry, sourceVersion, plan.version));
      }

      if (packageDefinition.kind === "binding") {
        const platform = platforms.find(
          ({ packageName }) => packageName === packageDefinition.name,
        );
        assert(platform, `Missing platform definition for ${packageDefinition.name}`);
        await cp(
          resolve(artifactDirectory ?? "", platform.binary),
          resolve(packageDirectory, platform.binary),
        );
      }

      const pack = await packPackage(packageDirectory, outputDirectory);
      validatePackedFiles(
        packageDefinition.kind,
        pack.files.map(({ path }) => path),
      );
      const tarballPath = resolve(outputDirectory, pack.filename);
      const integrity = await sha512Integrity(tarballPath);
      assert.equal(
        integrity,
        pack.integrity,
        `${packageDefinition.name} tarball integrity drifted`,
      );
      packages.push({
        name: packageDefinition.name,
        kind: packageDefinition.kind,
        version: plan.version,
        tarball: basename(tarballPath),
        integrity,
        files: pack.files.map(({ path }) => path).sort(),
      });
    }

    const manifest: ReleaseBundleManifest = {
      group: plan.group,
      version: plan.version,
      tag: plan.tag,
      commit: plan.commit,
      ...(coreVersion === undefined ? {} : { coreVersion }),
      packages,
    };
    await writeJson(resolve(outputDirectory, "release-manifest.json"), manifest);
    await writeFile(resolve(outputDirectory, "release-notes.md"), plan.notes);
  } finally {
    await rm(stageRoot, { recursive: true, force: true });
  }
}

function prepareManifest(
  manifest: PackageJson,
  packageDefinition: ReleasePackage,
  version: string,
  coreVersion: string | undefined,
): void {
  assert.equal(manifest.name, packageDefinition.name);
  manifest.version = version;
  manifest.license = "MIT";
  delete manifest.private;
  manifest.publishConfig = { access: "public" };

  if (packageDefinition.kind === "node") {
    manifest.optionalDependencies = Object.fromEntries(
      [...platforms]
        .sort((left, right) => left.packageName.localeCompare(right.packageName))
        .map((platform) => [platform.packageName, version]),
    );
  } else if (packageDefinition.kind === "yoga") {
    assert(coreVersion, "Yoga assembly requires a Core version");
    manifest.dependencies = { "@taffyjs/node": coreVersion };
  } else if (packageDefinition.kind === "yoga-wasm") {
    assert(coreVersion, "Yoga Wasm assembly requires a Core version");
    manifest.dependencies = { "@taffyjs/wasm": coreVersion };
  }

  assert.equal(
    JSON.stringify(manifest).includes("workspace:"),
    false,
    `${manifest.name} retains a workspace dependency`,
  );
}

async function packPackage(packageDirectory: string, outputDirectory: string): Promise<PackResult> {
  const output = await capture(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["pack", "--json", "--ignore-scripts", "--pack-destination", outputDirectory],
    { cwd: packageDirectory },
  );
  const results = JSON.parse(output) as readonly PackResult[];
  const result = results[0];
  if (results.length !== 1 || result === undefined) {
    throw new Error(`Expected one packed tarball from ${packageDirectory}`);
  }
  return result;
}

async function verifyNativeArtifacts(artifactDirectory: string): Promise<void> {
  const actual = (await readdir(artifactDirectory)).filter((name) => name.endsWith(".node")).sort();
  const expected = platforms.map(({ binary }) => binary).sort();
  assert.deepEqual(actual, expected, "Native release artifacts must contain exactly 13 targets");
}

function validatePackedFiles(kind: ReleasePackageKind, files: readonly string[]): void {
  assert(files.includes("LICENSE"), `${kind} tarball is missing LICENSE`);
  assert(files.includes("package.json"), `${kind} tarball is missing package.json`);
  assert.equal(
    files.some((path) => path.startsWith("src/")),
    false,
  );
  assert.equal(
    files.some((path) => path.startsWith("tests/")),
    false,
  );
  assert.equal(
    files.some((path) => path.includes("node_modules")),
    false,
  );

  if (kind === "binding") {
    assert.equal(files.filter((path) => path.endsWith(".node")).length, 1);
    assert.deepEqual(
      [...files].sort(),
      ["LICENSE", "README.md", files.find((path) => path.endsWith(".node")), "package.json"]
        .filter((path): path is string => path !== undefined)
        .sort(),
    );
  } else if (kind === "node") {
    assert.deepEqual([...files].sort(), [
      "LICENSE",
      "README.md",
      "index.d.ts",
      "index.js",
      "package.json",
    ]);
  } else if (kind === "wasm") {
    assert.equal(
      files.some((path) => path.endsWith(".wasm")),
      false,
    );
    assert(files.includes("dist/taffyjs.wasm-base64.js"));
  } else {
    assert(files.includes("THIRD-PARTY-LICENSES"));
    assert(files.includes("dist/index.js"));
    assert(files.includes("dist/index.d.ts"));
  }
}

async function resolveCoreVersion(requestedVersion: string | undefined): Promise<string> {
  if (requestedVersion !== undefined) {
    parseStableVersion(requestedVersion);
    return requestedVersion;
  }
  const [nodeVersion, wasmVersion] = await Promise.all([
    latestVersion("@taffyjs/node"),
    latestVersion("@taffyjs/wasm"),
  ]);
  assert.equal(nodeVersion, wasmVersion, "Core package latest versions must match");
  parseStableVersion(nodeVersion);
  return nodeVersion;
}

async function latestVersion(packageName: string): Promise<string> {
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(packageName).replaceAll("%2F", "%2f")}/latest`,
  );
  if (!response.ok) {
    throw new Error(`Cannot resolve ${packageName}@latest: registry returned ${response.status}`);
  }
  const manifest = (await response.json()) as { readonly version?: unknown };
  if (typeof manifest.version !== "string") throw new Error(`${packageName}@latest has no version`);
  return manifest.version;
}

export function shouldCopyStagePath(source: string): boolean {
  const segments = relative(root, source).split(sep);
  return (
    !segments.includes("node_modules") &&
    !segments.includes(".napi-build") &&
    !segments.some((segment) => segment.startsWith(".napi-rs-filesystem-transaction"))
  );
}

export function rewriteNodeLoaderVersion(
  contents: string,
  sourceVersion: string,
  releaseVersion: string,
): string {
  const comparison = `bindingPackageVersion !== "${sourceVersion}"`;
  const message = `expected ${sourceVersion} but got`;
  const comparisonCount = contents.split(comparison).length - 1;
  const messageCount = contents.split(message).length - 1;
  const sourceVersionCount = contents.split(sourceVersion).length - 1;
  assert(comparisonCount > 0, "Node loader has no native package version checks");
  assert.equal(messageCount, comparisonCount, "Node loader version messages drifted");
  assert.equal(
    sourceVersionCount,
    comparisonCount + messageCount,
    "Node loader contains an unclassified source-version literal",
  );
  return contents
    .replaceAll(comparison, `bindingPackageVersion !== "${releaseVersion}"`)
    .replaceAll(message, `expected ${releaseVersion} but got`);
}

function safePath(path: string): string {
  const resolved = resolve(root, path);
  if (resolved === root || !resolved.startsWith(`${root}${sep}`)) {
    throw new Error(`Release paths must stay below the repository root: ${path}`);
  }
  return resolved;
}

function parseOptions(args: readonly string[]): {
  readonly plan: string;
  readonly output: string;
  readonly artifacts?: string;
  readonly coreVersion?: string;
} {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error(
        "Usage: assemble.ts --plan <path> --output <path> [--artifacts <path>] [--core-version <version>]",
      );
    }
    values.set(key.slice(2), value);
  }
  const plan = values.get("plan");
  const output = values.get("output");
  if (!plan || !output) throw new Error("assemble.ts requires --plan and --output");
  const artifacts = values.get("artifacts");
  const coreVersion = values.get("core-version");
  return {
    plan,
    output,
    ...(artifacts === undefined ? {} : { artifacts }),
    ...(coreVersion === undefined ? {} : { coreVersion }),
  };
}
