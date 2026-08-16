import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { platformForHost, platforms } from "./platforms.ts";

interface RootPackageJson {
  readonly version: string;
  readonly optionalDependencies: Readonly<Record<string, string>>;
  readonly napi: {
    readonly targets: readonly string[];
  };
}

interface PlatformPackageJson {
  readonly name: string;
  readonly version: string;
  readonly private: boolean;
  readonly os: readonly string[];
  readonly cpu: readonly string[];
  readonly libc?: readonly string[];
  readonly main: string;
  readonly files: readonly string[];
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = resolve(root, "packages/taffyjs-node");
const npmRoot = resolve(packageRoot, "npm");
const rootPackage = JSON.parse(
  await readFile(resolve(packageRoot, "package.json"), "utf8"),
) as RootPackageJson;

assert.deepEqual(
  rootPackage.napi.targets,
  platforms.map((platform) => platform.target),
  "napi.targets must match tools/platforms.ts",
);
assert.deepEqual(
  rootPackage.optionalDependencies,
  Object.fromEntries(
    [...platforms]
      .sort((left, right) => left.packageName.localeCompare(right.packageName))
      .map((platform) => [platform.packageName, rootPackage.version]),
  ),
  "optionalDependencies must contain every platform package at the root version",
);

const directories = (await readdir(npmRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
assert.deepEqual(
  directories,
  platforms.map((platform) => platform.directory).sort(),
  "npm platform directories must match tools/platforms.ts",
);

for (const platform of platforms) {
  const packageJson = JSON.parse(
    await readFile(resolve(npmRoot, platform.directory, "package.json"), "utf8"),
  ) as PlatformPackageJson;
  assert.equal(packageJson.name, platform.packageName);
  assert.equal(packageJson.version, rootPackage.version);
  assert.equal(packageJson.private, true);
  assert.deepEqual(packageJson.os, [platform.os]);
  assert.deepEqual(packageJson.cpu, [platform.cpu]);
  assert.deepEqual(packageJson.libc, platform.libc ? [platform.libc] : undefined);
  assert.equal(packageJson.main, platform.binary);
  assert.deepEqual(packageJson.files, [platform.binary]);
  assert.equal(platformForHost(platform.os, platform.cpu, platform.libc), platform);
}
