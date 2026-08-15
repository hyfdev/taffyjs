import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(testDirectory, "../../../packages/taffyjs-wasm");
const temporaryDirectory = await mkdtemp(resolve(tmpdir(), "taffyjs-wasm-packed-consumer-"));
const packDirectory = resolve(temporaryDirectory, "packed");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const consumerProgram = `
  import { TaffyTree } from "@taffyjs/wasm";
  const tree = new TaffyTree();
  const root = tree.newLeaf({ size: { width: 23, height: 11 } });
  tree.computeLayout({ root, availableSpace: { width: 100, height: 100 } });
  console.log(JSON.stringify(tree.getLayout(root).size));
`;

try {
  await mkdir(packDirectory);
  execFileSync(pnpm, ["pack", "--pack-destination", packDirectory], {
    cwd: packageDirectory,
    stdio: "pipe",
  });
  const tarballs = (await readdir(packDirectory)).filter((name) => name.endsWith(".tgz"));
  assert.equal(tarballs.length, 1);
  const tarball = resolve(packDirectory, tarballs[0]);

  for (const packageManager of ["npm", "pnpm"]) {
    const consumerDirectory = resolve(temporaryDirectory, packageManager);
    await mkdir(consumerDirectory);
    if (packageManager === "npm") {
      execFileSync(npm, ["install", tarball, "--ignore-scripts", "--no-audit", "--no-fund"], {
        cwd: consumerDirectory,
        stdio: "pipe",
      });
    } else {
      execFileSync(pnpm, ["add", tarball, "--ignore-scripts"], {
        cwd: consumerDirectory,
        stdio: "pipe",
      });
    }

    const output = execFileSync(
      process.execPath,
      ["--input-type=module", "--eval", consumerProgram],
      {
        cwd: consumerDirectory,
        encoding: "utf8",
      },
    );
    assert.deepEqual(JSON.parse(output), { width: 23, height: 11 }, packageManager);
  }

  console.log(JSON.stringify({ packedConsumers: ["npm", "pnpm"] }));
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
