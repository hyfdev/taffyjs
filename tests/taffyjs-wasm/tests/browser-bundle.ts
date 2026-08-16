import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = resolve(testDirectory, "../browser/dist");
const assets = await readdir(resolve(outputDirectory, "assets"));
const wasmAssets = assets.filter((name) => name.endsWith(".wasm"));
const scriptAssets = assets.filter((name) => name.endsWith(".js"));

assert.equal(wasmAssets.length, 0);
assert.ok(scriptAssets.length > 0);

const scripts = await Promise.all(
  scriptAssets.map((name) => readFile(resolve(outputDirectory, "assets", name), "utf8")),
);
const bundledJavaScript = scripts.join("\n");
assert.equal(bundledJavaScript.includes("node:wasi"), false);
assert.equal((bundledJavaScript.match(/AGFzbQE/g) ?? []).length, 1);
assert.equal((bundledJavaScript.match(/WebAssembly\.compile\(/g) ?? []).length, 1);
assert.equal(bundledJavaScript.includes("taffyjs-wasm-browser-pass"), true);

console.log(JSON.stringify({ wasmAssets, scriptAssets }));
