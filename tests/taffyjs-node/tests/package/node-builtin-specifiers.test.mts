import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { builtinModules } from "node:module";
import { fileURLToPath } from "node:url";

import { test } from "vite-plus/test";

const bareBuiltinAlternatives = [
  ...new Set(builtinModules.map((specifier) => specifier.replace(/^node:/, ""))),
]
  .sort((left, right) => right.length - left.length)
  .map((specifier) => specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");
const bareBuiltinReference = new RegExp(
  String.raw`(?:\bfrom\s+|\bimport\s+|\brequire(?:\.resolve)?\s*\(\s*|\bimport\s*\(\s*)(["'])(${bareBuiltinAlternatives})\1`,
  "g",
);

test("public entry uses the node protocol for built-in modules", async () => {
  const entryPath = fileURLToPath(import.meta.resolve("@taffyjs/node"));
  const source = await readFile(entryPath, "utf8");
  const bareReferences = [...source.matchAll(bareBuiltinReference)].map((match) => match[2]);

  assert.deepEqual(
    bareReferences,
    [],
    `Expected node: prefixes for built-in modules, found: ${bareReferences.join(", ")}`,
  );
});
