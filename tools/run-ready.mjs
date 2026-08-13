import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

await new Promise((resolvePromise, reject) => {
  const child = spawn("vp", ["run", "--concurrency-limit", "1", "ready:body"], {
    cwd: root,
    stdio: "inherit",
  });
  child.on("error", reject);
  child.on("close", (code, signal) => {
    if (code === 0) resolvePromise();
    else reject(new Error(`ready:body exited ${code ?? `from signal ${signal}`}`));
  });
});
