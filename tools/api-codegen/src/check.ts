import { runCodegen } from "./diagnostics.ts";
import { buildOutputFiles, repositoryRoot } from "./index.ts";
import { checkOutputFiles } from "./output/check.ts";
import { formatOutputFiles } from "./output/format.ts";

await runCodegen(async () => {
  await checkOutputFiles(repositoryRoot, formatOutputFiles(await buildOutputFiles()));
});
