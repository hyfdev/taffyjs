import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vite-plus/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const readmePath = resolve(root, "packages/taffyjs-node/README.md");

function example(source: string, name: string) {
  const fence = "```";
  const match = new RegExp(
    `<!-- example:${name} -->\\n\\s*${fence}ts\\n([\\s\\S]*?)\\n${fence}`,
    "u",
  ).exec(source);
  assert.ok(match, `Missing ${name} example`);
  return match[1];
}

async function run(command: string, args: string[], cwd: string) {
  return new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else {
        reject(
          new Error(
            `${command} ${args.join(" ")} exited ${code}\n${Buffer.concat(stdout).toString("utf8")}${Buffer.concat(stderr).toString("utf8")}`,
          ),
        );
      }
    });
  });
}

test("README examples compile and run", async () => {
  const readme = await readFile(readmePath, "utf8");
  const names = ["block", "flex", "grid", "measure"];
  const cacheRoot = resolve(root, "tests/taffyjs-node/.cache");
  await mkdir(cacheRoot, { recursive: true });
  const temporaryRoot = await mkdtemp(resolve(cacheRoot, "taffyjs-doc-examples-"));
  try {
    const paths = await Promise.all(
      names.map(async (name) => {
        const path = resolve(temporaryRoot, `${name}.mts`);
        await writeFile(path, `${example(readme, name)}\n`);
        return path;
      }),
    );
    const tsc = resolve(root, "packages/taffyjs-node/node_modules/.bin/tsc");
    await run(
      tsc,
      [
        "--ignoreConfig",
        "--noEmit",
        "--strict",
        "--exactOptionalPropertyTypes",
        "--skipLibCheck",
        "--target",
        "ES2022",
        "--module",
        "NodeNext",
        "--moduleResolution",
        "NodeNext",
        "--types",
        "node",
        ...paths,
      ],
      root,
    );
    for (const path of paths) await run(process.execPath, [path], temporaryRoot);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
