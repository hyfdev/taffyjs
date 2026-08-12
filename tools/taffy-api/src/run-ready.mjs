import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCandidate } from "./index.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const mode = process.argv[2];
const body = mode === "loop" ? "ready:loop:body" : mode === "all" ? "ready:body" : null;

if (!body) throw new Error(`Expected run-ready mode "loop" or "all", received ${mode ?? "none"}`);

async function runBody() {
  await new Promise((resolvePromise, reject) => {
    const child = spawn("vp", ["run", "--concurrency-limit", "1", body], {
      cwd: root,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`vp run ${body} exited ${code ?? `from signal ${signal}`}`));
    });
  });
}

await checkCandidate({ root });
await runBody();
await checkCandidate({ root });
