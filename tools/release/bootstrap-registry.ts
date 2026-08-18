import { bootstrapVersion, npmRegistry } from "./config.ts";

export type BootstrapState = "missing" | "ready" | "unexpected";

export async function bootstrapState(
  name: string,
  request: typeof fetch = fetch,
): Promise<BootstrapState> {
  const encodedName = encodeURIComponent(name);
  const versionResponse = await request(
    `${npmRegistry}/${encodedName}/${encodeURIComponent(bootstrapVersion)}`,
    {
      cache: "no-store",
    },
  );
  if (versionResponse.status === 404) return "missing";
  if (!versionResponse.ok) {
    throw new Error(`Registry returned ${versionResponse.status} for ${name}@${bootstrapVersion}`);
  }
  const manifest = (await versionResponse.json()) as {
    readonly license?: unknown;
    readonly version?: unknown;
  };
  const tagsResponse = await request(`${npmRegistry}/-/package/${encodedName}/dist-tags`, {
    cache: "no-store",
  });
  if (!tagsResponse.ok) return "unexpected";
  const tags = (await tagsResponse.json()) as Record<string, unknown>;
  if (
    manifest.license !== "MIT" ||
    manifest.version !== bootstrapVersion ||
    tags.bootstrap !== bootstrapVersion
  ) {
    return "unexpected";
  }
  return "ready";
}
