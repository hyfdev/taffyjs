import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { platformForHost } from "../../../tools/platforms.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const packageRoot = resolve(root, "packages/taffyjs-node");
const vp = resolve(root, "node_modules/vite-plus/bin/vp");
const platform = platformForHost();
assert.ok(platform, `Unsupported packed-consumer host ${process.platform}/${process.arch}`);

function run(command, args, cwd) {
  const env = { ...process.env };
  delete env.NAPI_RS_NATIVE_LIBRARY_PATH;
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    const output = [];
    child.stdout.on("data", (chunk) => output.push(chunk));
    child.stderr.on("data", (chunk) => output.push(chunk));
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) resolvePromise(Buffer.concat(output).toString("utf8"));
      else {
        reject(
          new Error(
            `${command} ${args.join(" ")} exited ${code ?? `from signal ${signal}`}\n${Buffer.concat(output).toString("utf8")}`,
          ),
        );
      }
    });
  });
}

async function firstTarball(directory) {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".tgz"));
  assert.equal(names.length, 1);
  return resolve(directory, names[0]);
}

const temporaryRoot = await mkdtemp(resolve(tmpdir(), "taffyjs-packed-consumer-"));
try {
  const rootTarballs = resolve(temporaryRoot, "root-tarball");
  const platformTarballs = resolve(temporaryRoot, "platform-tarball");
  await Promise.all([
    mkdir(rootTarballs, { recursive: true }),
    mkdir(platformTarballs, { recursive: true }),
  ]);
  await Promise.all([
    run(
      process.execPath,
      [vp, "exec", "pnpm", "pack", "--pack-destination", rootTarballs],
      packageRoot,
    ),
    run(
      process.execPath,
      [vp, "exec", "pnpm", "pack", "--pack-destination", platformTarballs],
      resolve(packageRoot, "npm", platform.directory),
    ),
  ]);
  const [rootTarball, platformTarball] = await Promise.all([
    firstTarball(rootTarballs),
    firstTarball(platformTarballs),
  ]);
  const consumer = resolve(temporaryRoot, "consumer");
  await mkdir(consumer, { recursive: true });
  await writeFile(
    resolve(consumer, "package.json"),
    `${JSON.stringify(
      {
        name: "taffyjs-packed-consumer",
        private: true,
        type: "module",
        packageManager: "pnpm@11.20.0",
        dependencies: {
          "@taffyjs/node": `file:${rootTarball}`,
          [platform.packageName]: `file:${platformTarball}`,
        },
      },
      null,
      2,
    )}\n`,
  );
  await run(
    process.execPath,
    [vp, "install", "--offline", "--no-frozen-lockfile", "--ignore-scripts"],
    consumer,
  );
  await copyFile(new URL("./smoke.mjs", import.meta.url), resolve(consumer, "smoke.mjs"));
  await run(process.execPath, ["smoke.mjs"], consumer);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
