import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CodegenError } from "../diagnostics.ts";

export async function loadJson(repositoryRoot: string, relativePath: string): Promise<unknown> {
  let source: string;
  try {
    source = await readFile(resolve(repositoryRoot, relativePath), "utf8");
  } catch (error) {
    throw new CodegenError(
      `${relativePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  try {
    return JSON.parse(source) as unknown;
  } catch (error) {
    throw new CodegenError(
      `${relativePath}: invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
