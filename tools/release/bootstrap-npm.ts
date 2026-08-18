import assert from "node:assert/strict";
import { cp, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { platforms } from "../platforms.ts";
import {
  allPublishedPackages,
  bootstrapVersion,
  releaseGroups,
  repository,
  type ReleasePackage,
} from "./config.ts";
import { capture, root, run, wait, writeJson } from "./lib.ts";

const publish = process.argv.slice(2).includes("--publish");
if (process.argv.length > (publish ? 3 : 2)) {
  throw new Error("Usage: bootstrap-npm.ts [--publish]");
}

if (publish) await verifyPublishCheckout();
await verifyNpmVersion(publish);
const stageRoot = await mkdtemp(resolve(root, ".release-bootstrap-"));

try {
  // npm walks up to the repository's package.json and rejects non-pnpm commands
  // because of devEngines. A local sentinel keeps npm scoped to this staging area.
  await writeJson(resolve(stageRoot, "package.json"), {
    name: "taffyjs-npm-bootstrap",
    private: true,
  });
  const tarballs = new Map<string, string>();
  for (const packageDefinition of allPublishedPackages) {
    const packageDirectory = resolve(stageRoot, packageDefinition.name.replace(/^@/, ""));
    await mkdir(packageDirectory, { recursive: true });
    await cp(resolve(root, "LICENSE"), resolve(packageDirectory, "LICENSE"));
    await writeFile(
      resolve(packageDirectory, "README.md"),
      `# ${packageDefinition.name}\n\nThis prerelease exists only to establish npm trusted publishing. Install a stable release instead.\n`,
    );
    await writeJson(
      resolve(packageDirectory, "package.json"),
      bootstrapManifest(packageDefinition),
    );
    const output = await capture(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["pack", "--json", "--ignore-scripts", "--pack-destination", stageRoot],
      { cwd: packageDirectory },
    );
    const results = JSON.parse(output) as readonly { readonly filename: string }[];
    const filename = results[0]?.filename;
    if (results.length !== 1 || filename === undefined) {
      throw new Error(`Failed to create one bootstrap tarball for ${packageDefinition.name}`);
    }
    tarballs.set(packageDefinition.name, resolve(stageRoot, filename));
  }

  if (!publish) {
    console.log(`Prepared ${tarballs.size} bootstrap tarballs without changing npm.`);
    console.log(
      "Run the repository task release:bootstrap-npm only after its workflows are on main.",
    );
  } else {
    const states = await Promise.all(
      allPublishedPackages.map(async ({ name }) => [name, await bootstrapState(name)] as const),
    );
    for (const [name, state] of states) {
      if (state === "unexpected") {
        throw new Error(
          `${name} already exists without the expected ${bootstrapVersion} bootstrap`,
        );
      }
    }

    for (const [name, state] of states) {
      if (state === "ready") {
        console.log(`Skipping existing ${name}@${bootstrapVersion}`);
        continue;
      }
      const tarball = tarballs.get(name);
      assert(tarball, `Missing bootstrap tarball for ${name}`);
      await run(
        process.platform === "win32" ? "npm.cmd" : "npm",
        ["publish", tarball, "--access", "public", "--tag", "bootstrap"],
        { cwd: stageRoot },
      );
      assert.equal(await bootstrapState(name), "ready", `${name} bootstrap verification failed`);
    }

    for (const group of Object.values(releaseGroups)) {
      for (const packageDefinition of group.packages) {
        if (await hasExpectedTrust(packageDefinition.name, group.workflow)) {
          console.log(`Skipping existing trust for ${packageDefinition.name}`);
          continue;
        }
        await run(
          process.platform === "win32" ? "npm.cmd" : "npm",
          [
            "trust",
            "github",
            packageDefinition.name,
            "--file",
            group.workflow,
            "--repository",
            repository,
            "--allow-publish",
            "--yes",
          ],
          { cwd: stageRoot },
        );
        assert.equal(
          await hasExpectedTrust(packageDefinition.name, group.workflow),
          true,
          `${packageDefinition.name} trust verification failed`,
        );
        await wait(2_000);
      }
    }

    console.log(
      "Bootstrap complete. Remove any temporary npm token before running a release workflow.",
    );
  }
} finally {
  await rm(stageRoot, { recursive: true, force: true });
}

function bootstrapManifest(packageDefinition: ReleasePackage): Record<string, unknown> {
  const platform = platforms.find(({ packageName }) => packageName === packageDefinition.name);
  return {
    name: packageDefinition.name,
    version: bootstrapVersion,
    description: "TaffyJS trusted-publishing bootstrap placeholder.",
    license: "MIT",
    repository: {
      type: "git",
      url: `git+https://github.com/${repository}.git`,
      directory: packageDefinition.sourceDirectory,
    },
    files: ["README.md", "LICENSE"],
    publishConfig: { access: "public", tag: "bootstrap" },
    ...(platform === undefined
      ? {}
      : {
          os: [platform.os],
          cpu: [platform.cpu],
          ...(platform.libc === undefined ? {} : { libc: [platform.libc] }),
        }),
  };
}

async function verifyPublishCheckout(): Promise<void> {
  assert.equal(await capture("git", ["branch", "--show-current"]), "main");
  assert.equal(
    await capture("git", ["status", "--porcelain"]),
    "",
    "Bootstrap requires a clean checkout",
  );
  await run("git", ["fetch", "origin", "main"]);
  assert.equal(
    await capture("git", ["rev-parse", "HEAD"]),
    await capture("git", ["rev-parse", "origin/main"]),
    "Bootstrap requires the current origin/main commit",
  );
  for (const group of Object.values(releaseGroups)) {
    await capture("git", ["show", `origin/main:.github/workflows/${group.workflow}`]);
  }
}

async function verifyNpmVersion(required: boolean): Promise<void> {
  const version = await capture(process.platform === "win32" ? "npm.cmd" : "npm", ["--version"]);
  const [major = 0, minor = 0] = version.split(".").map(Number);
  if (required && (major < 11 || (major === 11 && minor < 15))) {
    throw new Error(`npm trust requires npm >=11.15.0; found ${version}`);
  }
}

async function bootstrapState(name: string): Promise<"missing" | "ready" | "unexpected"> {
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {
    cache: "no-store",
  });
  if (response.status === 404) return "missing";
  if (!response.ok) throw new Error(`Registry returned ${response.status} for ${name}`);
  const document = (await response.json()) as {
    readonly versions?: Record<
      string,
      { readonly license?: unknown; readonly repository?: unknown }
    >;
    readonly "dist-tags"?: Record<string, unknown>;
  };
  const manifest = document.versions?.[bootstrapVersion];
  const tag = document["dist-tags"]?.bootstrap;
  if (manifest?.license !== "MIT" || tag !== bootstrapVersion) return "unexpected";
  return "ready";
}

async function hasExpectedTrust(name: string, workflow: string): Promise<boolean> {
  try {
    const output = await capture(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["trust", "list", name, "--json"],
      { cwd: stageRoot },
    );
    const config = JSON.parse(output) as {
      readonly type?: unknown;
      readonly repository?: unknown;
      readonly file?: unknown;
      readonly permissions?: unknown;
    };
    return (
      config.type === "github" &&
      config.repository === repository &&
      config.file === workflow &&
      Array.isArray(config.permissions) &&
      config.permissions.includes("createPackage")
    );
  } catch {
    return false;
  }
}
