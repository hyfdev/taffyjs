import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await walk(path)));
    else if (entry.isFile() && path.endsWith(".test-d.ts")) output.push(path);
  }
  return output.toSorted((left, right) => left.localeCompare(right));
}

function run(compiler, path) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      compiler,
      [
        "--ignoreConfig",
        "--noEmit",
        "--strict",
        "--exactOptionalPropertyTypes",
        "--target",
        "ES2022",
        "--module",
        "NodeNext",
        "--moduleResolution",
        "NodeNext",
        path,
      ],
      { cwd: root, stdio: "inherit" },
    );
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${relative(root, path)} exited ${code ?? `from signal ${signal}`}`));
    });
  });
}

const tests = await walk(resolve(root, "tests/taffyjs-node/tests/types"));
if (tests.length === 0) throw new Error("No type tests found");
const compiler = resolve(root, "packages/taffyjs-node/node_modules/.bin/tsc");
for (const test of tests) await run(compiler, test);
