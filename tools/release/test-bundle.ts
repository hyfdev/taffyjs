import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";

import { platformForHost } from "../platforms.ts";
import { npmRegistry } from "./config.ts";
import { readJson, root, run, sha512Integrity, writeJson } from "./lib.ts";
import type { ReleaseBundleManifest, ReleaseBundlePackage } from "./assemble.ts";

const options = parseOptions(process.argv.slice(2));
await testReleaseBundle(
  safePath(options.bundle),
  options.coreBundle ? { coreBundle: safePath(options.coreBundle) } : {},
);

export async function testReleaseBundle(
  bundleDirectory: string,
  options: { readonly coreBundle?: string } = {},
): Promise<void> {
  const manifest = await readJson<ReleaseBundleManifest>(
    resolve(bundleDirectory, "release-manifest.json"),
  );
  await verifyBundleIntegrity(bundleDirectory, manifest);

  const consumerDirectory = await mkdtemp(resolve(root, ".release-consumer-"));
  try {
    await writeJson(resolve(consumerDirectory, "package.json"), {
      name: "taffyjs-release-consumer",
      version: "0.0.0",
      private: true,
      type: "module",
    });

    const packageSpecs = await bundleSpecs(bundleDirectory, manifest, options.coreBundle);
    const usesLocalCore = manifest.group === "core" || options.coreBundle !== undefined;
    await run(
      process.platform === "win32" ? "npm.cmd" : "npm",
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--package-lock=false",
        "--registry",
        npmRegistry,
        ...(usesLocalCore ? ["--omit=optional"] : []),
        ...packageSpecs,
      ],
      { cwd: consumerDirectory },
    );

    const smokePath = resolve(consumerDirectory, "smoke.mjs");
    await writeFile(smokePath, smokeSource(manifest.group));
    await run(process.execPath, [smokePath], {
      cwd: consumerDirectory,
      env: { ...process.env, NAPI_RS_ENFORCE_VERSION_CHECK: "1" },
    });
  } finally {
    await rm(consumerDirectory, { recursive: true, force: true });
  }
}

async function verifyBundleIntegrity(
  bundleDirectory: string,
  manifest: ReleaseBundleManifest,
): Promise<void> {
  for (const packageArtifact of manifest.packages) {
    assert.equal(packageArtifact.version, manifest.version);
    assert.equal(
      await sha512Integrity(resolve(bundleDirectory, packageArtifact.tarball)),
      packageArtifact.integrity,
      `${packageArtifact.name} tarball changed after assembly`,
    );
  }
}

async function bundleSpecs(
  bundleDirectory: string,
  manifest: ReleaseBundleManifest,
  coreBundle: string | undefined,
): Promise<readonly string[]> {
  if (manifest.group === "core") return coreBundleSpecs(bundleDirectory, manifest);

  const ownSpecs = manifest.packages.map(({ tarball }) => resolve(bundleDirectory, tarball));
  if (coreBundle === undefined) {
    assert(manifest.coreVersion, "Yoga bundle is missing its Core dependency version");
    return [
      `@taffyjs/node@${manifest.coreVersion}`,
      `@taffyjs/wasm@${manifest.coreVersion}`,
      ...ownSpecs,
    ];
  }

  const coreManifest = await readJson<ReleaseBundleManifest>(
    resolve(coreBundle, "release-manifest.json"),
  );
  assert.equal(coreManifest.group, "core");
  assert.equal(coreManifest.version, manifest.coreVersion);
  return [...coreBundleSpecs(coreBundle, coreManifest), ...ownSpecs];
}

function coreBundleSpecs(
  bundleDirectory: string,
  manifest: ReleaseBundleManifest,
): readonly string[] {
  const platform = platformForHost();
  if (!platform) throw new Error(`No release binding supports ${process.platform}/${process.arch}`);
  const selected = [
    packageByName(manifest, platform.packageName),
    packageByName(manifest, "@taffyjs/node"),
    packageByName(manifest, "@taffyjs/wasm"),
  ];
  return selected.map(({ tarball }) => resolve(bundleDirectory, tarball));
}

function packageByName(manifest: ReleaseBundleManifest, name: string): ReleaseBundlePackage {
  const packageArtifact = manifest.packages.find((candidate) => candidate.name === name);
  if (!packageArtifact) throw new Error(`Release bundle is missing ${name}`);
  return packageArtifact;
}

function smokeSource(group: "core" | "yoga"): string {
  if (group === "core") {
    return `
import { TaffyTree as NativeTree } from "@taffyjs/node";
import { TaffyTree as WasmTree } from "@taffyjs/wasm";

for (const [name, Tree] of [["@taffyjs/node", NativeTree], ["@taffyjs/wasm", WasmTree]]) {
  const tree = new Tree();
  const node = tree.newLeaf({ size: { width: 120, height: 80 } });
  tree.computeLayout({ root: node, availableSpace: { width: 800, height: 600 } });
  const { width, height } = tree.getLayout(node).size;
  if (width !== 120 || height !== 80) throw new Error(\`${"${name}"} returned ${"${width}"}x${"${height}"}\`);
}
`;
  }

  const nativeName = "@taffyjs/yoga";
  const wasmName = "@taffyjs/yoga-wasm";
  return `
import NativeYoga from ${JSON.stringify(nativeName)};
import WasmYoga from ${JSON.stringify(wasmName)};

for (const [name, Yoga] of [[${JSON.stringify(nativeName)}, NativeYoga], [${JSON.stringify(wasmName)}, WasmYoga]]) {
  const node = Yoga.Node.create();
  try {
    node.setWidth(120);
    node.setHeight(80);
    node.calculateLayout(undefined, undefined);
    const { width, height } = node.getComputedLayout();
    if (width !== 120 || height !== 80) throw new Error(\`${"${name}"} returned ${"${width}"}x${"${height}"}\`);
  } finally {
    node.free();
  }
}
`;
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
  readonly coreBundle?: string;
} {
  let bundle: string | undefined;
  let coreBundle: string | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--bundle" || argument === "--core-bundle") {
      const value = args[index + 1];
      if (value === undefined) throw new Error(`${argument} requires a path`);
      if (argument === "--bundle") bundle = value;
      else coreBundle = value;
      index += 1;
    } else {
      throw new Error(`Unknown argument ${argument ?? ""}`);
    }
  }
  if (!bundle) throw new Error("test-bundle.ts requires --bundle <path>");
  return {
    bundle,
    ...(coreBundle === undefined ? {} : { coreBundle }),
  };
}
