import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { CodegenError } from "../diagnostics.ts";
import type { OutputFile } from "../index.ts";

function outputPath(repositoryRoot: string, file: OutputFile): string {
  const absolutePath = resolve(repositoryRoot, file.path);
  const pathFromRoot = relative(repositoryRoot, absolutePath);
  if (pathFromRoot.startsWith("..") || isAbsolute(pathFromRoot)) {
    throw new CodegenError(`Generated output escapes the repository: ${file.path}`);
  }
  return absolutePath;
}

export async function checkOutputFiles(
  repositoryRoot: string,
  files: readonly OutputFile[],
): Promise<void> {
  const stale: string[] = [];
  for (const file of files) {
    const actual = await readFile(outputPath(repositoryRoot, file), "utf8").catch(() => null);
    if (actual !== file.content) stale.push(file.path);
  }
  if (stale.length > 0) {
    throw new CodegenError(
      `Generated files are stale:\n${stale.map((path) => `- ${path}`).join("\n")}\nRun vp run codegen.`,
    );
  }
}
