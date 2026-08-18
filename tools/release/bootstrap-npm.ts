import assert from "node:assert/strict";
import { cp, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { platforms } from "../platforms.ts";
import {
  allPublishedPackages,
  bootstrapVersion,
  npmRegistry,
  releaseGroups,
  repository,
  type ReleasePackage,
} from "./config.ts";
import { capture, pnpmCommand, root, run, wait, writeJson } from "./lib.ts";
import {
  ensureRegistryAuthentication,
  npmTrustArguments,
  revokeTemporaryAuthentication,
} from "./npm-trust.ts";
import { bootstrapState } from "./bootstrap-registry.ts";

const publish = process.argv.slice(2).includes("--publish");
if (process.argv.length > (publish ? 3 : 2)) {
  throw new Error("Usage: bootstrap-npm.ts [--publish]");
}

if (publish) await verifyPublishCheckout();
const stageRoot = await mkdtemp(resolve(root, ".release-bootstrap-"));
const authenticationState = { temporaryLogin: false };
const failures: unknown[] = [];

try {
  // npm is used only for the trust API. This sentinel keeps that one command
  // away from the repository's pnpm-only devEngines declaration.
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
      pnpmCommand,
      ["--config.ignore-scripts=true", "pack", "--json", "--pack-destination", stageRoot],
      { cwd: packageDirectory },
    );
    const result = JSON.parse(output) as { readonly filename?: unknown };
    if (typeof result.filename !== "string") {
      throw new Error(`Failed to create one bootstrap tarball for ${packageDefinition.name}`);
    }
    const tarball = resolve(result.filename);
    assert.equal(
      tarball,
      resolve(stageRoot, basename(result.filename)),
      `${packageDefinition.name} bootstrap tarball escaped its staging directory`,
    );
    tarballs.set(packageDefinition.name, tarball);
  }

  if (!publish) {
    console.log(`Prepared ${tarballs.size} bootstrap tarballs without changing npm.`);
    console.log(
      "Run the repository task release:bootstrap-npm only after its workflows are on main.",
    );
  } else {
    await ensureRegistryAuthentication(stageRoot, authenticationState);
    const states = new Map(
      await Promise.all(
        allPublishedPackages.map(async ({ name }) => [name, await bootstrapState(name)] as const),
      ),
    );
    for (const [name, state] of states) {
      if (state === "unexpected") {
        throw new Error(
          `${name} already exists without the expected ${bootstrapVersion} bootstrap`,
        );
      }
    }

    for (const group of Object.values(releaseGroups)) {
      for (const packageDefinition of group.packages) {
        const { name } = packageDefinition;
        if (states.get(name) === "ready") {
          console.log(`Skipping existing ${name}@${bootstrapVersion}`);
        } else {
          const tarball = tarballs.get(name);
          assert(tarball, `Missing bootstrap tarball for ${name}`);
          await run(pnpmCommand, [
            "publish",
            tarball,
            "--access",
            "public",
            "--tag",
            "bootstrap",
            "--no-git-checks",
            "--ignore-scripts",
            "--registry",
            npmRegistry,
          ]);
        }

        if (await hasExpectedTrust(packageDefinition.name, group.workflow)) {
          console.log(`Skipping existing trust for ${packageDefinition.name}`);
          continue;
        }
        await run(
          pnpmCommand,
          npmTrustArguments([
            "trust",
            "github",
            packageDefinition.name,
            "--file",
            group.workflow,
            "--repository",
            repository,
            "--allow-publish",
            "--yes",
          ]),
          { cwd: stageRoot },
        );
        await wait(2_000);
      }
    }

    console.log("Bootstrap complete. Release workflows now use OIDC instead of an npm token.");
  }
} catch (error) {
  failures.push(error);
}

try {
  await revokeTemporaryAuthentication(stageRoot, authenticationState);
} catch (error) {
  failures.push(error);
}
try {
  await rm(stageRoot, { recursive: true, force: true });
} catch (error) {
  failures.push(error);
}

if (failures.length === 1) throw failures[0];
if (failures.length > 1) {
  throw new AggregateError(failures, "Bootstrap and its cleanup both failed");
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
    publishConfig: { access: "public", tag: "bootstrap", registry: npmRegistry },
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

async function hasExpectedTrust(name: string, workflow: string): Promise<boolean> {
  try {
    const output = await capture(
      pnpmCommand,
      npmTrustArguments(["trust", "list", name, "--json"]),
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
