import type { OutputFile } from "../index.ts";

export function formatOutputFiles(files: readonly OutputFile[]): readonly OutputFile[] {
  return files.map((file) => ({
    ...file,
    content: `${file.content.replaceAll("\r\n", "\n").trimEnd()}\n`,
  }));
}
