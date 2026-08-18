import { platforms } from "../platforms.ts";

export type ReleaseGroupName = "core" | "yoga";
export type ReleasePackageKind = "binding" | "node" | "wasm" | "yoga" | "yoga-wasm";

export interface ReleasePackage {
  readonly name: string;
  readonly kind: ReleasePackageKind;
  readonly sourceDirectory: string;
}

export const bootstrapVersion = "0.0.0-bootstrap.0";
export const firstReleaseVersion = "0.0.1";
export const npmRegistry = "https://registry.npmjs.org";
export const repository = "hyfdev/taffyjs";

export const bindingPackages: readonly ReleasePackage[] = platforms.map((platform) => ({
  name: platform.packageName,
  kind: "binding",
  sourceDirectory: `packages/taffyjs-node/npm/${platform.directory}`,
}));

export const corePackages: readonly ReleasePackage[] = [
  ...bindingPackages,
  {
    name: "@taffyjs/node",
    kind: "node",
    sourceDirectory: "packages/taffyjs-node",
  },
  {
    name: "@taffyjs/wasm",
    kind: "wasm",
    sourceDirectory: "packages/taffyjs-wasm",
  },
];

export const yogaPackages: readonly ReleasePackage[] = [
  {
    name: "@taffyjs/yoga",
    kind: "yoga",
    sourceDirectory: "packages/taffyjs-yoga",
  },
  {
    name: "@taffyjs/yoga-wasm",
    kind: "yoga-wasm",
    sourceDirectory: "packages/taffyjs-yoga-wasm",
  },
];

export const allPublishedPackages: readonly ReleasePackage[] = [...corePackages, ...yogaPackages];

export interface ReleaseGroup {
  readonly name: ReleaseGroupName;
  readonly displayName: string;
  readonly tagPrefix: string;
  readonly workflow: string;
  readonly packages: readonly ReleasePackage[];
}

export const releaseGroups: Readonly<Record<ReleaseGroupName, ReleaseGroup>> = {
  core: {
    name: "core",
    displayName: "TaffyJS Core",
    tagPrefix: "v",
    workflow: "publish-core.yml",
    packages: corePackages,
  },
  yoga: {
    name: "yoga",
    displayName: "TaffyJS Yoga",
    tagPrefix: "yoga-v",
    workflow: "publish-yoga.yml",
    packages: yogaPackages,
  },
};

const coreReleasePaths = [
  "Cargo.lock",
  "Cargo.toml",
  "crates/taffyjs_binding/",
  "packages/taffyjs-node/",
  "packages/taffyjs-wasm/",
  "tools/api-codegen/",
  "tools/platforms.ts",
  "tools/sync-platform-artifact.ts",
  "tools/taffy-node/",
  "tools/taffy-wasm/",
] as const;

const yogaReleasePaths = ["packages/taffyjs-yoga/", "packages/taffyjs-yoga-wasm/"] as const;

export function isReleasePath(group: ReleaseGroupName, path: string): boolean {
  const candidates = group === "core" ? coreReleasePaths : yogaReleasePaths;
  return candidates.some((candidate) =>
    candidate.endsWith("/") ? path.startsWith(candidate) : path === candidate,
  );
}

export function parseReleaseGroup(value: string | undefined): ReleaseGroupName {
  if (value === "core" || value === "yoga") return value;
  throw new Error(`Expected release group core or yoga, received ${value ?? "nothing"}`);
}
