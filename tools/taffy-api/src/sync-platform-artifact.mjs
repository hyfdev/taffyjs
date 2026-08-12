import { copyFile, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const packageRoot = resolve(root, "packages/taffyjs-node");
const contract = JSON.parse(await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"));
const hostTargets = {
  "darwin/arm64": "aarch64-apple-darwin",
  "darwin/x64": "x86_64-apple-darwin",
  "linux/x64": "x86_64-unknown-linux-gnu",
  "win32/x64": "x86_64-pc-windows-msvc",
};
const target = hostTargets[`${process.platform}/${process.arch}`];
if (!target) throw new Error(`Unsupported build host ${process.platform}/${process.arch}`);
const platform = contract.platformPackages[target];
if (!platform) throw new Error(`Missing platform contract for ${target}`);
await copyFile(
  resolve(packageRoot, platform.binary),
  resolve(packageRoot, "npm", platform.name.slice("@taffyjs/binding-".length), platform.binary),
);
