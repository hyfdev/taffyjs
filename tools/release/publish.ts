import assert from "node:assert/strict";
import { appendFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, sep } from "node:path";

import { releaseGroups, repository } from "./config.ts";
import {
  capture,
  parseRemoteTagCommit,
  readJson,
  root,
  run,
  sha512Integrity,
  wait,
  writeJson,
} from "./lib.ts";
import type { ReleaseBundleManifest, ReleaseBundlePackage } from "./assemble.ts";

const options = parseOptions(process.argv.slice(2));
const bundleDirectory = safePath(options.bundle);
const manifest = await readJson<ReleaseBundleManifest>(
  resolve(bundleDirectory, "release-manifest.json"),
);
await verifyBundle(bundleDirectory, manifest);

if (!options.publish) {
  console.log(
    `Validated ${manifest.packages.length} ${manifest.group} tarballs for ${manifest.tag}; pass --publish only from the trusted workflow`,
  );
  process.exit(0);
}

const githubSha = process.env.GITHUB_SHA;
if (!githubSha) throw new Error("Publishing requires GITHUB_SHA");
assert.equal(githubSha, manifest.commit, "The release bundle must belong to the workflow commit");
assert.equal(process.env.GITHUB_REF, "refs/heads/main", "Publishing is restricted to main");
await assertRemoteTag(manifest.tag, manifest.commit, true);

const npmWorkingDirectory = await mkdtemp(resolve(tmpdir(), "taffyjs-release-publish-"));
try {
  await writeJson(resolve(npmWorkingDirectory, "package.json"), {
    name: "taffyjs-release-publisher",
    private: true,
  });
  for (const packageArtifact of manifest.packages) {
    await publishPackage(bundleDirectory, packageArtifact, npmWorkingDirectory);
  }
} finally {
  await rm(npmWorkingDirectory, { recursive: true, force: true });
}

await retry("installed registry smoke", 5, async () => {
  await run(process.execPath, [
    "tools/release/test-bundle.ts",
    "--bundle",
    options.bundle,
    "--registry",
  ]);
});
await createGitHubRelease(bundleDirectory, manifest);
await writeSummary(manifest);

async function verifyBundle(
  bundleDirectory: string,
  manifest: ReleaseBundleManifest,
): Promise<void> {
  const group = releaseGroups[manifest.group];
  assert(group, `Unknown release group ${manifest.group}`);
  assert.equal(manifest.tag, `${group.tagPrefix}${manifest.version}`);
  assert.deepEqual(
    manifest.packages.map(({ name }) => name),
    group.packages.map(({ name }) => name),
    "Release package order or membership drifted",
  );
  for (const packageArtifact of manifest.packages) {
    assert.equal(packageArtifact.version, manifest.version);
    assert.equal(
      await sha512Integrity(resolve(bundleDirectory, packageArtifact.tarball)),
      packageArtifact.integrity,
      `${packageArtifact.name} tarball no longer matches its assembled integrity`,
    );
  }
}

async function publishPackage(
  bundleDirectory: string,
  packageArtifact: ReleaseBundlePackage,
  npmWorkingDirectory: string,
): Promise<void> {
  const existingIntegrity = await registryIntegrity(packageArtifact.name, packageArtifact.version);
  if (existingIntegrity !== null) {
    assert.equal(
      existingIntegrity,
      packageArtifact.integrity,
      `${packageArtifact.name}@${packageArtifact.version} already exists with different bytes`,
    );
    console.log(`Skipping verified ${packageArtifact.name}@${packageArtifact.version}`);
    return;
  }

  await retry(`publish ${packageArtifact.name}@${packageArtifact.version}`, 3, async () => {
    try {
      await run(
        process.platform === "win32" ? "npm.cmd" : "npm",
        ["publish", resolve(bundleDirectory, packageArtifact.tarball), "--access", "public"],
        { cwd: npmWorkingDirectory },
      );
    } catch (error) {
      const integrity = await registryIntegrity(packageArtifact.name, packageArtifact.version);
      if (integrity === packageArtifact.integrity) return;
      throw error;
    }
  });

  await retry(`verify ${packageArtifact.name}@${packageArtifact.version}`, 5, async () => {
    assert.equal(
      await registryIntegrity(packageArtifact.name, packageArtifact.version),
      packageArtifact.integrity,
    );
  });
}

async function registryIntegrity(name: string, version: string): Promise<string | null> {
  const response = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,
    { cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Registry returned ${response.status} for ${name}@${version}`);
  const document = (await response.json()) as { readonly dist?: { readonly integrity?: unknown } };
  const integrity = document.dist?.integrity;
  if (typeof integrity !== "string")
    throw new Error(`${name}@${version} has no registry integrity`);
  return integrity;
}

async function createGitHubRelease(
  bundleDirectory: string,
  manifest: ReleaseBundleManifest,
): Promise<void> {
  await retry(`create GitHub release ${manifest.tag}`, 3, async () => {
    if (await githubReleaseExists(manifest)) return;

    const tagExists = await assertRemoteTag(manifest.tag, manifest.commit, true);
    const arguments_ = [
      "release",
      "create",
      manifest.tag,
      "--repo",
      repository,
      ...(tagExists ? ["--verify-tag"] : ["--target", manifest.commit]),
      "--title",
      `${releaseGroups[manifest.group].displayName} ${manifest.version}`,
      "--notes-file",
      resolve(bundleDirectory, "release-notes.md"),
      "--latest=false",
    ];
    try {
      await run("gh", arguments_);
    } catch (error) {
      if (await githubReleaseExists(manifest)) return;
      throw error;
    }
    assert.equal(
      await githubReleaseExists(manifest),
      true,
      `GitHub release ${manifest.tag} was not visible after creation`,
    );
  });
}

async function githubReleaseExists(manifest: ReleaseBundleManifest): Promise<boolean> {
  let output: string;
  try {
    output = await capture("gh", [
      "release",
      "view",
      manifest.tag,
      "--repo",
      repository,
      "--json",
      "tagName,isDraft",
    ]);
  } catch {
    return false;
  }
  const existing = JSON.parse(output) as { readonly tagName: string; readonly isDraft: boolean };
  assert.equal(existing.tagName, manifest.tag);
  assert.equal(existing.isDraft, false, `GitHub release ${manifest.tag} must not be a draft`);
  await assertRemoteTag(manifest.tag, manifest.commit, false);
  console.log(`Verified existing GitHub release ${manifest.tag}`);
  return true;
}

async function assertRemoteTag(
  tag: string,
  expectedCommit: string,
  allowMissing: boolean,
): Promise<boolean> {
  const actualCommit = await remoteTagCommit(tag);
  if (actualCommit === null) {
    assert.equal(allowMissing, true, `Remote tag ${tag} is missing`);
    return false;
  }
  assert.equal(actualCommit, expectedCommit, `Remote tag ${tag} points to an unexpected commit`);
  return true;
}

async function remoteTagCommit(tag: string): Promise<string | null> {
  const reference = `refs/tags/${tag}`;
  const output = await capture("git", [
    "ls-remote",
    "--tags",
    "origin",
    reference,
    `${reference}^{}`,
  ]);
  return parseRemoteTagCommit(output, tag);
}

async function retry(
  label: string,
  attempts: number,
  operation: () => Promise<void>,
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await operation();
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        console.warn(`${label} failed on attempt ${attempt}; retrying`);
        await wait(2_000 * attempt);
      }
    }
  }
  throw lastError;
}

async function writeSummary(manifest: ReleaseBundleManifest): Promise<void> {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  const rows = manifest.packages.map(
    ({ name, version, integrity }) => `| \`${name}\` | \`${version}\` | \`${integrity}\` |`,
  );
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    [
      `## Published ${manifest.tag}`,
      "",
      "| Package | Version | Integrity |",
      "| --- | --- | --- |",
      ...rows,
      "",
    ].join("\n"),
  );
}

function safePath(path: string): string {
  const resolved = resolve(root, path);
  if (resolved === root || !resolved.startsWith(`${root}${sep}`)) {
    throw new Error(`Release paths must stay below the repository root: ${path}`);
  }
  return resolved;
}

function parseOptions(args: readonly string[]): {
  readonly bundle: string;
  readonly publish: boolean;
} {
  let bundle: string | undefined;
  let publish = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--publish") {
      publish = true;
    } else if (argument === "--bundle") {
      bundle = args[index + 1];
      if (bundle === undefined) throw new Error("--bundle requires a path");
      index += 1;
    } else {
      throw new Error(`Unknown argument ${argument ?? ""}`);
    }
  }
  if (!bundle) throw new Error("publish.ts requires --bundle <path>");
  return { bundle, publish };
}
