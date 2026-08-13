import { runCodegen } from "./diagnostics.ts";
import { buildOutputFiles, repositoryRoot } from "./index.ts";
import { formatOutputFiles } from "./output/format.ts";
import { writeOutputFiles } from "./output/write.ts";

await runCodegen(async () => {
  await writeOutputFiles(repositoryRoot, formatOutputFiles(await buildOutputFiles()));
});
