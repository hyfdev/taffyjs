import { readFile, writeFile } from "node:fs/promises";
import { builtinModules } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const bindingPath = resolve(repositoryDirectory, "packages/taffyjs-node/binding.js");
const bareBuiltins = new Set(builtinModules.map((specifier) => specifier.replace(/^node:/, "")));
const moduleReferencePatterns = [
  /(\bfrom\s*)(["'])([^"']+)\2/g,
  /(\bimport\s*)(["'])([^"']+)\2/g,
  /(\brequire(?:\.resolve)?\s*\(\s*)(["'])([^"']+)\2/g,
  /(\bimport\s*\(\s*)(["'])([^"']+)\2/g,
];

let source = await readFile(bindingPath, "utf8");
const originalSource = source;

for (const pattern of moduleReferencePatterns) {
  source = source.replace(pattern, (reference, prefix, quote, specifier: string) => {
    if (!bareBuiltins.has(specifier)) return reference;
    return `${prefix}${quote}node:${specifier}${quote}`;
  });
}

for (const pattern of moduleReferencePatterns) {
  for (const match of source.matchAll(pattern)) {
    const specifier = match[3];
    if (specifier && bareBuiltins.has(specifier)) {
      throw new Error(`Generated Node loader still uses bare builtin ${JSON.stringify(specifier)}`);
    }
  }
}

if (source !== originalSource) await writeFile(bindingPath, source);
