import assert from "node:assert/strict";
import { execFile as execFileCallback, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

export interface CommandOptions {
  readonly cwd?: string;
  readonly env?: NodeJS.ProcessEnv;
}

export async function capture(
  command: string,
  args: readonly string[],
  options: CommandOptions = {},
): Promise<string> {
  const { stdout } = await execFile(command, [...args], {
    cwd: options.cwd ?? root,
    env: options.env,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  return stdout.trim();
}

export async function run(
  command: string,
  args: readonly string[],
  options: CommandOptions = {},
): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, [...args], {
      cwd: options.cwd ?? root,
      env: options.env,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(
        new Error(
          `${command} exited with ${code === null ? `signal ${signal ?? "unknown"}` : `code ${code}`}`,
        ),
      );
    });
  });
}

export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, undefined, 2)}\n`);
}

export async function sha512Integrity(path: string): Promise<string> {
  const contents = await readFile(path);
  return `sha512-${createHash("sha512").update(contents).digest("base64")}`;
}

export async function wait(milliseconds: number): Promise<void> {
  await new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
}

export function packageSlug(name: string): string {
  return name.replace(/^@/, "").replaceAll("/", "-");
}

export function isMainModule(moduleUrl: string): boolean {
  return process.argv[1] !== undefined && fileURLToPath(moduleUrl) === resolve(process.argv[1]);
}

export function parseRemoteTagCommit(output: string, tag: string): string | null {
  if (output === "") return null;
  const reference = `refs/tags/${tag}`;
  const entries = new Map(
    output.split("\n").map((line) => {
      const [hash, name] = line.split(/\s+/);
      assert.match(hash ?? "", /^[0-9a-f]{40}$/);
      assert(name, `Cannot parse remote tag line: ${line}`);
      return [name, hash] as const;
    }),
  );
  const commit = entries.get(`${reference}^{}`) ?? entries.get(reference);
  assert(commit, `Cannot resolve remote tag ${tag}`);
  return commit;
}
