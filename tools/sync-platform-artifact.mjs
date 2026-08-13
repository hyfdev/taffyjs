import { copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { platformForHost } from "./platforms.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = resolve(root, "packages/taffyjs-node");
const platform = platformForHost();
if (!platform) throw new Error(`Unsupported build host ${process.platform}/${process.arch}`);

await copyFile(
  resolve(packageRoot, platform.binary),
  resolve(packageRoot, "npm", platform.directory, platform.binary),
);
