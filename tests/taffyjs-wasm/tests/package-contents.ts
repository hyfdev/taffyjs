import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(testDirectory, "../../../packages/taffyjs-wasm");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const output = execFileSync(npm, ["pack", "--dry-run", "--json"], {
  cwd: packageDirectory,
  encoding: "utf8",
});
const [pack] = JSON.parse(output) as [{ files: Array<{ path: string }> }];
const files = pack.files.map(({ path }) => path).sort();

assert.deepEqual(files, [
  "README.md",
  "dist/index.browser.js",
  "dist/index.d.ts",
  "dist/index.js",
  "dist/taffyjs.browser.js",
  "dist/taffyjs.node.cjs",
  "dist/taffyjs.node.js",
  "dist/taffyjs.wasip1-deferred.js",
  "dist/taffyjs.wasm-base64.js",
  "package.json",
]);
assert.equal(
  files.some((path) => path.endsWith(".wasm")),
  false,
);

const javascriptFiles = files.filter((path) => /\.c?js$/.test(path));
const javascriptSources = await Promise.all(
  javascriptFiles.map((path) => readFile(resolve(packageDirectory, path), "utf8")),
);
const sourceByPath = new Map(
  javascriptFiles.map((path, index) => [path, javascriptSources[index]]),
);
const packageJavaScript = javascriptSources.join("\n");
const encodedWasmMarkers = packageJavaScript.match(/AGFzbQE/g) ?? [];

assert.equal(encodedWasmMarkers.length, 1);
assert.equal((packageJavaScript.match(/WebAssembly\.compile\(/g) ?? []).length, 1);
assert.equal(packageSource("dist/taffyjs.wasm-base64.js").includes("AGFzbQE"), true);
assert.equal(packageJavaScript.includes("node:wasi"), false);
assert.equal(packageJavaScript.includes("process.env"), false);
assert.equal(packageJavaScript.includes("preopens"), false);

function packageSource(path: string): string {
  const source = sourceByPath.get(path);
  if (source === undefined) throw new Error(`Missing package source ${path}`);
  return source;
}

const nodeEntry = packageSource("dist/index.js");
const browserEntry = packageSource("dist/index.browser.js");
const nodeBridge = packageSource("dist/taffyjs.node.js");
const nodeAdapter = packageSource("dist/taffyjs.node.cjs");
const browserAdapter = packageSource("dist/taffyjs.browser.js");
const deferredLoader = packageSource("dist/taffyjs.wasip1-deferred.js");
const nodeGraph = [nodeEntry, nodeBridge, nodeAdapter].join("\n");

assert.equal(nodeEntry.includes('from "./taffyjs.node.js"'), true);
assert.equal(nodeEntry.includes("taffyjs.browser.js"), false);
assert.equal(browserEntry.includes('from "./taffyjs.browser.js"'), true);
assert.equal(browserEntry.includes("taffyjs.node.js"), false);
assert.equal(nodeBridge.includes('from "./taffyjs.wasm-base64.js"'), true);
assert.equal(nodeBridge.includes("const binding = loadBinding(wasmBase64)"), true);
assert.equal(nodeGraph.includes("WebAssembly.compile("), false);
assert.equal(/\bawait\b/.test(nodeGraph), false);
assert.equal(nodeGraph.includes("instantiateNapiModuleSync"), true);
assert.equal(nodeGraph.includes("initial: 4000"), true);
assert.equal(nodeGraph.includes("require.resolve("), false);
assert.equal(nodeGraph.includes("@taffyjs/binding-wasm"), false);
assert.equal(browserAdapter.includes("await WebAssembly.compile("), true);
assert.equal(browserAdapter.includes("await instantiate("), true);
assert.equal(deferredLoader.includes("initial: 1024"), true);

const manifest = await import("@taffyjs/wasm/package.json", { with: { type: "json" } });
assert.deepEqual(Object.keys(manifest.default.exports).sort(), [".", "./package.json"]);
assert.equal(manifest.default.napi.packageName, "@taffyjs/binding");
const dependencyNames = Object.entries(manifest.default).flatMap(([key, dependencies]) => {
  const isDependencyMap = key === "dependencies" || key.endsWith("Dependencies");
  if (!isDependencyMap || typeof dependencies !== "object" || dependencies === null) {
    return [];
  }
  return Object.keys(dependencies);
});
assert.equal(
  dependencyNames.some((name) => name.includes("binding-wasm")),
  false,
);

console.log(
  JSON.stringify({
    packageFiles: files,
    inlineWasmPayloads: 1,
    nodeTopLevelAwait: false,
    wasmFiles: 0,
  }),
);
