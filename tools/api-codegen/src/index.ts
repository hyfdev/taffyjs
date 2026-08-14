import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compileNumericFamilies } from "./compiler/numeric-families.ts";
import { emitNumericFamiliesRust } from "./emit/numeric-families/rust.ts";
import { emitNumericFamiliesTypeScript } from "./emit/numeric-families/typescript.ts";
import { loadJson } from "./input/load.ts";
import { validateNumericFamilies } from "./input/numeric-families.ts";

export interface OutputFile {
  readonly path: string;
  readonly content: string;
}

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const numericFamiliesPath = "api/numeric-families.json";

export async function buildOutputFiles(): Promise<readonly OutputFile[]> {
  const input = validateNumericFamilies(
    await loadJson(repositoryRoot, numericFamiliesPath),
    numericFamiliesPath,
  );
  const model = compileNumericFamilies(input, numericFamiliesPath);
  return [emitNumericFamiliesTypeScript(model), emitNumericFamiliesRust(model)];
}
