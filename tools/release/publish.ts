import assert from "node:assert/strict";
import { appendFile, readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

import { npmRegistry, releaseGroups } from "./config.ts";
import {
  capture,
  isMainModule,
  parseRemoteTagCommit,
  pnpmCommand,
  readJson,
  root,
  run,
  sha512Integrity,
} from "./lib.ts";
import type { ReleaseBundleManifest, ReleaseBundlePackage } from "./assemble.ts";

if (isMainModule(import.meta.url)) {
  await main();
}

async function main(): Promise<void> {
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
    return;
  }

  const githubSha = process.env.GITHUB_SHA;
  if (!githubSha) throw new Error("Publishing requires GITHUB_SHA");
  assert.equal(githubSha, manifest.commit, "The release bundle must belong to the workflow commit");
  assert.equal(process.env.GITHUB_REF, "refs/heads/main", "Publishing is restricted to main");
  await assertRemoteTag(manifest.tag, manifest.commit, true);

  await publishReleasePackages(manifest.packages, {
    registryIntegrity,
    publish: async (packageArtifact) => publishPackage(bundleDirectory, packageArtifact),
  });

  await pushReleaseTag(manifest);
  await writeSummary(bundleDirectory, manifest);
}

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

// A successful publish command is the write boundary. Registry reads are
// eventually consistent, so they are used only by an attempt's initial preflight.
export async function publishReleasePackages(
  packages: readonly ReleaseBundlePackage[],
  operations: {
    readonly registryIntegrity: (name: string, version: string) => Promise<string | null>;
    readonly publish: (packageArtifact: ReleaseBundlePackage) => Promise<void>;
  },
): Promise<void> {
  const missing: ReleaseBundlePackage[] = [];
  for (const packageArtifact of packages) {
    const existingIntegrity = await operations.registryIntegrity(
      packageArtifact.name,
      packageArtifact.version,
    );
    if (existingIntegrity === null) {
      missing.push(packageArtifact);
    } else {
      assert.equal(
        existingIntegrity,
        packageArtifact.integrity,
        `${packageArtifact.name}@${packageArtifact.version} already exists with different bytes`,
      );
      console.log(`Skipping verified ${packageArtifact.name}@${packageArtifact.version}`);
    }
  }

  for (const packageArtifact of missing) await operations.publish(packageArtifact);
}

async function publishPackage(
  bundleDirectory: string,
  packageArtifact: ReleaseBundlePackage,
): Promise<void> {
  await run(pnpmCommand, [
    "publish",
    resolve(bundleDirectory, packageArtifact.tarball),
    "--access",
    "public",
    "--no-git-checks",
    "--ignore-scripts",
    "--provenance",
    "--registry",
    npmRegistry,
  ]);
}

async function registryIntegrity(name: string, version: string): Promise<string | null> {
  const response = await fetch(
    `${npmRegistry}/${encodeURIComponent(name)}/${encodeURIComponent(version)}`,
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

// The tag marks completion only after every required publish command succeeds.
async function pushReleaseTag(manifest: ReleaseBundleManifest): Promise<void> {
  if (await assertRemoteTag(manifest.tag, manifest.commit, true)) {
    console.log(`Verified existing release tag ${manifest.tag}`);
    return;
  }
  await run("git", ["tag", manifest.tag, manifest.commit]);
  await run("git", ["push", "origin", `refs/tags/${manifest.tag}`]);
  await assertRemoteTag(manifest.tag, manifest.commit, false);
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

async function writeSummary(
  bundleDirectory: string,
  manifest: ReleaseBundleManifest,
): Promise<void> {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  const rows = manifest.packages.map(
    ({ name, version, integrity }) => `| \`${name}\` | \`${version}\` | \`${integrity}\` |`,
  );
  const notes = await readFile(resolve(bundleDirectory, "release-notes.md"), "utf8");
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    [
      `## Published ${manifest.tag}`,
      "",
      notes,
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
