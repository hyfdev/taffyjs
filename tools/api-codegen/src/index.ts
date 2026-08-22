import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compileLayoutCodec } from "./compiler/layout-codec.ts";
import { compileNumericFamilies } from "./compiler/numeric-families.ts";
import { compileStyleCodec } from "./compiler/style-codec.ts";
import { compileTaggedValues } from "./compiler/tagged-values.ts";
import { emitLayoutCodecRust } from "./emit/layout-codec/rust.ts";
import { emitLayoutCodecTypeScript } from "./emit/layout-codec/typescript.ts";
import { emitNumericFamiliesRust } from "./emit/numeric-families/rust.ts";
import { emitNumericFamiliesTypeScript } from "./emit/numeric-families/typescript.ts";
import { emitStyleCodecRust } from "./emit/style-codec/rust.ts";
import { emitStyleCodecTypeScript } from "./emit/style-codec/typescript.ts";
import { emitTaggedValuesRust } from "./emit/tagged-values/rust.ts";
import { emitTaggedValuesTypeScript } from "./emit/tagged-values/typescript.ts";
import { loadJson } from "./input/load.ts";
import { validateLayoutCodec } from "./input/layout-codec.ts";
import { validateNumericFamilies } from "./input/numeric-families.ts";
import { validateStyleCodec } from "./input/style-codec.ts";
import { validateTaggedValues } from "./input/tagged-values.ts";

export interface OutputFile {
  readonly path: string;
  readonly content: string;
}

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const layoutCodecPath = "api/layout-codec.json";
const numericFamiliesPath = "api/numeric-families.json";
const styleCodecPath = "api/style-codec.json";
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
  const styleInput = validateStyleCodec(
    await loadJson(repositoryRoot, styleCodecPath),
    styleCodecPath,
  );
  const styleModel = compileStyleCodec(styleInput, styleCodecPath, numericModel);
  const layoutInput = validateLayoutCodec(
    await loadJson(repositoryRoot, layoutCodecPath),
    layoutCodecPath,
  );
  const layoutModel = compileLayoutCodec(layoutInput, layoutCodecPath);
  return [
    emitNumericFamiliesTypeScript(numericModel),
    emitNumericFamiliesRust(numericModel),
    emitTaggedValuesTypeScript(taggedModel),
    emitTaggedValuesRust(taggedModel),
    emitStyleCodecTypeScript(styleModel),
    emitStyleCodecRust(styleModel),
    emitLayoutCodecTypeScript(layoutModel),
    emitLayoutCodecRust(layoutModel),
  ];
}
