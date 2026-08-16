import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(testDirectory, "../../../packages/taffyjs-yoga-wasm");
const sharedSourceDirectory = resolve(testDirectory, "../../../packages/taffyjs-yoga/src");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const output = execFileSync(npm, ["pack", "--dry-run", "--json"], {
  cwd: packageDirectory,
  encoding: "utf8",
});
const [pack] = JSON.parse(output) as [{ files: Array<{ path: string }> }];
const files = pack.files.map(({ path }) => path).sort();
const distFiles = (await readdir(resolve(packageDirectory, "dist")))
  .map((name) => `dist/${name}`)
  .sort();

assert.deepEqual(files, ["README.md", "THIRD-PARTY-LICENSES", ...distFiles, "package.json"]);
assert.equal(
  files.some((path) => path.endsWith(".wasm")),
  false,
);

const javascriptFiles = distFiles.filter((path) => path.endsWith(".js"));
const declarationFiles = distFiles.filter((path) => path.endsWith(".d.ts"));
const javascriptSources = await Promise.all(
  javascriptFiles.map((path) => readFile(resolve(packageDirectory, path), "utf8")),
);
const declarationSources = await Promise.all(
  declarationFiles.map((path) => readFile(resolve(packageDirectory, path), "utf8")),
);
const packageJavaScript = javascriptSources.join("\n");
const packageDeclarations = declarationSources.join("\n");

assert.equal(packageJavaScript.includes("@taffyjs/node"), false);
assert.equal((packageJavaScript.match(/@taffyjs\/wasm/g) ?? []).length, 1);
assert.equal(packageJavaScript.includes("AGFzbQE"), false);
assert.equal(packageDeclarations.includes("@taffyjs/node"), false);
assert.equal(packageDeclarations.includes("@taffyjs/wasm"), false);

const sourceByPath = new Map(
  javascriptFiles.map((path, index) => [path, javascriptSources[index]]),
);
const loadEntry = packageSource("dist/load.js");
assert.equal(loadEntry.includes('import("./facade-'), true);
assert.equal(loadEntry.includes('from "./facade-'), false);

const sharedSourceFiles = await readdir(sharedSourceDirectory);
assert.deepEqual(
  sharedSourceFiles.filter((name) => name.endsWith(".d.ts")),
  [],
  "the Yoga Wasm declaration build must not write into the shared source directory",
);

const manifest = await import("@taffyjs/yoga-wasm/package.json", { with: { type: "json" } });
assert.deepEqual(manifest.default.dependencies, { "@taffyjs/wasm": "workspace:*" });
assert.deepEqual(Object.keys(manifest.default.exports).sort(), [".", "./load", "./package.json"]);

console.log(
  JSON.stringify({
    packageFiles: files,
    backendImports: 1,
    embeddedWasmPayloads: 0,
    sharedSourceDeclarations: 0,
  }),
);

function packageSource(path: string): string {
  const source = sourceByPath.get(path);
  if (source === undefined) throw new Error(`Missing package source ${path}`);
  return source;
}
