import assert from "node:assert/strict";

import { npmRegistry } from "./config.ts";
import { capture, pnpmCommand, run } from "./lib.ts";

export const npmTrustPackage = "npm@11.18.0";

export interface NpmAuthenticationState {
  temporaryLogin: boolean;
}

export interface CommandRunner {
  readonly capture: typeof capture;
  readonly run: typeof run;
}

const defaultRunner: CommandRunner = { capture, run };

export async function ensureRegistryAuthentication(
  workingDirectory: string,
  state: NpmAuthenticationState,
  runner: CommandRunner = defaultRunner,
): Promise<void> {
  let username: string;
  try {
    username = await runner.capture(pnpmCommand, npmTrustArguments(["whoami"]), {
      cwd: workingDirectory,
    });
  } catch (error) {
    if (!authenticationRequired(error)) throw error;
    console.log("npm trust needs an authenticated npm account; opening the one-time login now.");
    await runner.run(pnpmCommand, npmTrustArguments(["login"]), { cwd: workingDirectory });
    state.temporaryLogin = true;
    username = await runner.capture(pnpmCommand, npmTrustArguments(["whoami"]), {
      cwd: workingDirectory,
    });
  }
  assert(username, "npm authentication returned no username");
  assert.equal(
    await runner.capture(pnpmCommand, ["whoami", "--registry", npmRegistry], {
      cwd: workingDirectory,
    }),
    username,
    "pnpm and npm trust must use the same npm account",
  );
  console.log(`Authenticated npm bootstrap as ${username}`);
}

export async function revokeTemporaryAuthentication(
  workingDirectory: string,
  state: NpmAuthenticationState,
  runner: CommandRunner = defaultRunner,
): Promise<void> {
  if (!state.temporaryLogin) return;
  console.log("Revoking the temporary npm bootstrap login.");
  await runner.run(pnpmCommand, npmTrustArguments(["logout"]), { cwd: workingDirectory });
  state.temporaryLogin = false;
}

export function npmTrustArguments(arguments_: readonly string[]): readonly string[] {
  return [
    `--config.registry=${npmRegistry}`,
    "dlx",
    npmTrustPackage,
    ...arguments_,
    "--registry",
    npmRegistry,
  ];
}

function authenticationRequired(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { readonly message?: unknown; readonly stderr?: unknown };
  const text = [candidate.message, candidate.stderr]
    .filter((value): value is string => typeof value === "string")
    .join("\n");
  return /\b(?:E401|ENEEDAUTH)\b|401 Unauthorized/.test(text);
}
