import { readdir, readFile, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageDirectory = resolve(repositoryDirectory, "packages/taffyjs-wasm");
const outputDirectory = resolve(packageDirectory, "dist");
const manifest = JSON.parse(await readFile(resolve(packageDirectory, "package.json"), "utf8"));
const publishedOutputFiles = new Set(
  manifest.files
    .filter((path) => path.startsWith("dist/"))
    .map((path) => path.slice("dist/".length)),
);

for (const entry of await readdir(outputDirectory, { withFileTypes: true })) {
  if (!entry.isFile()) {
    throw new Error(`Unexpected directory in the Wasm package output: ${entry.name}`);
  }
  if (!publishedOutputFiles.has(entry.name)) {
    await unlink(resolve(outputDirectory, entry.name));
  }
}
