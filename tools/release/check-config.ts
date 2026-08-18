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
  npmRegistry,
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
assert.equal(npmRegistry, "https://registry.npmjs.org");

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
  assert.equal(
    /^\s*run:.*\$\{\{\s*inputs\./m.test(workflow),
    false,
    `${group.workflow} must pass dispatch inputs through step environment variables`,
  );
  assert(workflow.includes("RELEASE_BUMP: ${{ inputs.bump }}"));
  assert(workflow.includes('--bump "$RELEASE_BUMP"'));
  assert.equal(workflow.includes("NODE_AUTH_TOKEN"), false);
  assert.equal(
    workflow.includes("npm install --global"),
    false,
    `${group.workflow} must use the repository's pinned pnpm for publication`,
  );
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
const coreWasmJob = workflowJob(coreWorkflow, "build-wasm");
assertJobRun(coreWasmJob, "pnpm exec vp run check:wasm", "Core Wasm verification");
assertJobRun(
  coreWasmJob,
  "pnpm dlx bun@1.2.0 packages/taffyjs-wasm/tests/runtime-smoke.mjs",
  "Core Bun smoke",
);
assertJobRun(
  coreWasmJob,
  "pnpm dlx deno@2.2.0 run --node-modules-dir=manual packages/taffyjs-wasm/tests/runtime-smoke.mjs",
  "Core Deno smoke",
);
assertJobNeeds(
  workflowJob(coreWorkflow, "assemble"),
  "[plan, build-native, build-freebsd, build-wasm]",
  "Core assembly",
);
assertJobNeeds(workflowJob(coreWorkflow, "publish"), "assemble", "Core publication");
for (const platform of platforms) {
  assert(coreWorkflow.includes(platform.target), `Core publication omits ${platform.target}`);
}

const yogaWorkflow = await readFile(
  resolve(root, ".github/workflows", releaseGroups.yoga.workflow),
  "utf8",
);
const yogaBuildJob = workflowJob(yogaWorkflow, "build");
assertJobRun(yogaBuildJob, "pnpm exec vp run check:wasm", "Yoga Wasm verification");
assertJobRun(
  yogaBuildJob,
  "pnpm dlx bun@1.2.0 tests/taffyjs-yoga-wasm/runtime-smoke.mjs",
  "Yoga Wasm Bun smoke",
);
assertJobRun(
  yogaBuildJob,
  "pnpm dlx deno@2.2.0 run --node-modules-dir=manual tests/taffyjs-yoga-wasm/runtime-smoke.mjs",
  "Yoga Wasm Deno smoke",
);
assertJobNeeds(workflowJob(yogaWorkflow, "assemble"), "[plan, build]", "Yoga assembly");
assertJobNeeds(workflowJob(yogaWorkflow, "publish"), "assemble", "Yoga publication");

const ordinaryCi = await readFile(resolve(root, ".github/workflows/ci.yml"), "utf8");
assert.deepEqual(
  [...ordinaryCi.matchAll(/^  (?<job>test-[a-z0-9-]+):$/gm)].map((match) => match.groups?.job),
  ["test-ubuntu-x64-gnu", "test-windows-x64-msvc"],
  "Ordinary CI must keep only the Linux and Windows runtime test jobs",
);
assert.equal(ordinaryCi.includes("matrix.settings.target"), false);
assert.equal(ordinaryCi.includes("x86_64-unknown-freebsd"), false);
assert.equal(ordinaryCi.includes("macos-"), false);
assert.equal(ordinaryCi.includes("wasm32-wasip1"), false);
assert.equal(ordinaryCi.includes("check:wasm"), false);
assert(ordinaryCi.includes("pnpm exec vp run check:release"));

const releaseDocumentation = await readFile(resolve(root, ".agents/docs/release.md"), "utf8");
assert.equal(
  releaseDocumentation.includes("npm login"),
  false,
  "Bootstrap must not require an npm command from the pnpm-only repository root",
);

for (const tool of ["assemble.ts", "publish.ts"]) {
  const source = await readFile(resolve(root, "tools/release", tool), "utf8");
  assert(source.includes("pnpmCommand"), `${tool} must use the pinned pnpm executable`);
  assert.equal(/\bnpmCommand\b/.test(source), false, `${tool} must not use the npm executable`);
  assert.equal(source.includes('"npm"'), false, `${tool} must not hard-code the npm executable`);
  assert.equal(source.includes('"npm.cmd"'), false, `${tool} must not hard-code npm.cmd`);
}

const npmTrustTool = await readFile(resolve(root, "tools/release/npm-trust.ts"), "utf8");
assert(npmTrustTool.includes('npmTrustPackage = "npm@11.18.0"'));
assert(npmTrustTool.includes('"dlx",'));
assert(npmTrustTool.includes("--config.registry="));
assert.equal(
  /\bnpmCommand\b/.test(npmTrustTool),
  false,
  "Bootstrap must invoke its isolated npm trust helper through pnpm",
);
const bootstrapTool = await readFile(resolve(root, "tools/release/bootstrap-npm.ts"), "utf8");
assert(bootstrapTool.includes("revokeTemporaryAuthentication(stageRoot, authenticationState)"));

const rootManifest = await readJson<PackageJson>(resolve(root, "package.json"));
assert.equal(rootManifest.license, "MIT");

function workflowJob(workflow: string, jobName: string): string {
  const marker = `  ${jobName}:\n`;
  assert.equal(
    workflow.split(marker).length,
    2,
    `Expected exactly one ${jobName} job in the publication workflow`,
  );
  const remainder = workflow.slice(workflow.indexOf(marker) + marker.length);
  const nextJob = remainder.search(/^  [A-Za-z_][A-Za-z0-9_-]*:\s*$/m);
  return nextJob === -1 ? remainder : remainder.slice(0, nextJob);
}

function assertJobRun(job: string, command: string, label: string): void {
  assert(
    job
      .split("\n")
      .some((line) => line === `      - run: ${command}` || line === `        run: ${command}`),
    `${label} must be an executable step in its required publication job`,
  );
}

function assertJobNeeds(job: string, dependency: string, label: string): void {
  assert(
    job.split("\n").some((line) => line === `    needs: ${dependency}`),
    `${label} must depend on ${dependency}`,
  );
}
