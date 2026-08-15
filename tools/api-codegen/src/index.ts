import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compileNumericFamilies } from "./compiler/numeric-families.ts";
import { compileTaggedValues } from "./compiler/tagged-values.ts";
import { emitNumericFamiliesRust } from "./emit/numeric-families/rust.ts";
import { emitNumericFamiliesTypeScript } from "./emit/numeric-families/typescript.ts";
import { emitTaggedValuesRust } from "./emit/tagged-values/rust.ts";
import { emitTaggedValuesTypeScript } from "./emit/tagged-values/typescript.ts";
import { loadJson } from "./input/load.ts";
import { validateNumericFamilies } from "./input/numeric-families.ts";
import { validateTaggedValues } from "./input/tagged-values.ts";

export interface OutputFile {
  readonly path: string;
  readonly content: string;
}

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const numericFamiliesPath = "api/numeric-families.json";
const taggedValuesPath = "api/tagged-values.json";

export async function buildOutputFiles(): Promise<readonly OutputFile[]> {
  const numericInput = validateNumericFamilies(
    await loadJson(repositoryRoot, numericFamiliesPath),
    numericFamiliesPath,
  );
  const numericModel = compileNumericFamilies(numericInput, numericFamiliesPath);
  const taggedInput = validateTaggedValues(
    await loadJson(repositoryRoot, taggedValuesPath),
    taggedValuesPath,
  );
  const taggedModel = compileTaggedValues(taggedInput, taggedValuesPath, numericModel);
  return [
    emitNumericFamiliesTypeScript(numericModel),
    emitNumericFamiliesRust(numericModel),
    emitTaggedValuesTypeScript(taggedModel),
    emitTaggedValuesRust(taggedModel),
  ];
}
