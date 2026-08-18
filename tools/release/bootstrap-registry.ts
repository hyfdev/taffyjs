import { bootstrapVersion, npmRegistry } from "./config.ts";
import { wait } from "./lib.ts";

export type BootstrapState = "missing" | "ready" | "unexpected";
export type BootstrapStateReader = (name: string) => Promise<BootstrapState>;

export interface BootstrapVerificationOptions {
  readonly readState?: BootstrapStateReader;
  readonly retryDelays?: readonly number[];
  readonly sleep?: (milliseconds: number) => Promise<void>;
  readonly onRetry?: (delay: number) => void;
}

export interface EventualVerificationOptions {
  readonly retryDelays?: readonly number[];
  readonly sleep?: (milliseconds: number) => Promise<void>;
  readonly onRetry?: (delay: number) => void;
}

const npmVisibilityRetryDelays = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000, 30_000, 30_000];
export const npmReadTimeoutMs = 30_000;

export async function bootstrapState(
  name: string,
  request: typeof fetch = fetch,
  timeoutMs = npmReadTimeoutMs,
): Promise<BootstrapState> {
  const response = await request(`${npmRegistry}/${encodeURIComponent(name)}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
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

export async function verifyBootstrapReady(
  name: string,
  { readState = bootstrapState, retryDelays, sleep, onRetry }: BootstrapVerificationOptions = {},
): Promise<void> {
  await verifyEventually(`${name} bootstrap`, async () => (await readState(name)) === "ready", {
    retryDelays,
    sleep,
    onRetry,
  });
}

export async function publishBootstrapPackage(
  name: string,
  publish: () => Promise<void>,
  verificationOptions: BootstrapVerificationOptions = {},
): Promise<void> {
  try {
    await publish();
  } catch (publishError) {
    try {
      await verifyBootstrapReady(name, verificationOptions);
    } catch {
      throw publishError;
    }
    console.log(`Recovered existing ${name}@${bootstrapVersion} after publish returned an error.`);
    return;
  }
  await verifyBootstrapReady(name, verificationOptions);
}

export async function verifyEventually(
  label: string,
  check: () => Promise<boolean>,
  {
    retryDelays = npmVisibilityRetryDelays,
    sleep = wait,
    onRetry = (delay) => {
      console.log(`Waiting ${delay / 1_000}s for npm to expose ${label}...`);
    },
  }: EventualVerificationOptions = {},
): Promise<void> {
  for (const delay of [...retryDelays, undefined]) {
    if (await check()) return;
    if (delay === undefined) break;
    onRetry(delay);
    await sleep(delay);
  }
  const totalWait = retryDelays.reduce((total, delay) => total + delay, 0);
  throw new Error(`${label} verification did not become ready after ${totalWait / 1_000}s`);
}
