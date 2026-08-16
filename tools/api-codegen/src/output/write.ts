import { randomUUID } from "node:crypto";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";
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

export async function writeOutputFiles(
  repositoryRoot: string,
  files: readonly OutputFile[],
): Promise<void> {
  for (const file of files) {
    const destination = outputPath(repositoryRoot, file);
    await mkdir(dirname(destination), { recursive: true });
    const temporary = resolve(
      dirname(destination),
      `.${basename(destination)}.${randomUUID()}.tmp`,
    );
    try {
      await writeFile(temporary, file.content, { encoding: "utf8", flag: "wx" });
      await rename(temporary, destination);
    } finally {
      await unlink(temporary).catch(() => undefined);
    }
  }
}
