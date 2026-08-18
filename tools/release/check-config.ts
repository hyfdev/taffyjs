import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { platforms } from "../platforms.ts";
import {
  allPublishedPackages,
  bindingPackages,
  bootstrapVersion,
  corePackages,
  firstReleaseVersion,
  releaseGroups,
  yogaPackages,
} from "./config.ts";
import { readJson, root } from "./lib.ts";

interface PackageJson {
  readonly name: string;
  readonly version: string;
  readonly private: boolean;
  readonly license: string;
  readonly dependencies?: Readonly<Record<string, string>>;
}

assert.equal(allPublishedPackages.length, 17);
assert.equal(corePackages.length, 15);
assert.equal(bindingPackages.length, 13);
assert.equal(yogaPackages.length, 2);
assert.equal(new Set(allPublishedPackages.map(({ name }) => name)).size, 17);
assert.equal(bootstrapVersion, "0.0.0-bootstrap.0");
assert.equal(firstReleaseVersion, "0.0.1");

const license = await readFile(resolve(root, "LICENSE"), "utf8");
assert(license.startsWith("MIT License\n"));
assert(license.includes("Yunfei He"));

for (const packageDefinition of allPublishedPackages) {
  const manifest = await readJson<PackageJson>(
    resolve(root, packageDefinition.sourceDirectory, "package.json"),
  );
  assert.equal(manifest.name, packageDefinition.name);
  assert.equal(manifest.version, "0.0.0");
  assert.equal(manifest.private, true);
  assert.equal(manifest.license, "MIT");
}

const yogaManifest = await readJson<PackageJson>(
  resolve(root, "packages/taffyjs-yoga/package.json"),
);
const yogaWasmManifest = await readJson<PackageJson>(
  resolve(root, "packages/taffyjs-yoga-wasm/package.json"),
);
assert.deepEqual(yogaManifest.dependencies, { "@taffyjs/node": "workspace:*" });
assert.deepEqual(yogaWasmManifest.dependencies, { "@taffyjs/wasm": "workspace:*" });

for (const group of Object.values(releaseGroups)) {
  const workflow = await readFile(resolve(root, ".github/workflows", group.workflow), "utf8");
  assert(workflow.includes("workflow_dispatch:"));
  assert.equal(workflow.includes("pull_request:"), false);
  assert.equal(workflow.includes("\n  push:"), false);
  assert(workflow.includes("github.ref != 'refs/heads/main'"));
  assert(workflow.includes("cancel-in-progress: false"));
  assert(workflow.includes("id-token: write"));
  assert.equal(workflow.match(/id-token: write/g)?.length, 1);
  assert(workflow.includes(`tools/release/plan.ts --group ${group.name}`));
  assert.equal(workflow.includes("NODE_AUTH_TOKEN"), false);
  assert.equal(workflow.includes("cache: true"), false);
  for (const match of workflow.matchAll(/^\s*- uses: (?<action>[^\s#]+).*$/gm)) {
    const action = match.groups?.action;
    assert(action, `Cannot read an action reference in ${group.workflow}`);
    assert.match(action, /@[0-9a-f]{40}$/, `${group.workflow} must pin ${action} to a commit`);
  }
}

const coreWorkflow = await readFile(
  resolve(root, ".github/workflows", releaseGroups.core.workflow),
  "utf8",
);
for (const platform of platforms) {
  assert(coreWorkflow.includes(platform.target), `Core publication omits ${platform.target}`);
}

const ordinaryCi = await readFile(resolve(root, ".github/workflows/ci.yml"), "utf8");
assert.equal(ordinaryCi.includes("matrix.settings.target"), false);
assert.equal(ordinaryCi.includes("x86_64-unknown-freebsd"), false);
assert(ordinaryCi.includes("pnpm exec vp run check:release"));

const rootManifest = await readJson<PackageJson>(resolve(root, "package.json"));
assert.equal(rootManifest.license, "MIT");
