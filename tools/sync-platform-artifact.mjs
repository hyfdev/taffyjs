import { copyFile, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { platformForHost, platforms } from "./platforms.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = resolve(root, "packages/taffyjs-node");
const platform = platformForHost();
if (!platform) throw new Error(`Unsupported build host ${process.platform}/${process.arch}`);

const loaderPath = resolve(packageRoot, "native.js");
const loader = await readFile(loaderPath, "utf8");
const supportedPlatforms = platforms
  .map((item) => item.loaderPlatform)
  .toSorted((left, right) => left.localeCompare(right));
const guard = [
  "// taffyjs supported-platform guard:start",
  `const taffyjsSupportedPlatforms = ${JSON.stringify(supportedPlatforms).replaceAll(",", ", ")};`,
  "const taffyjsPlatform =",
  '  process.platform === "linux"',
  '    ? `${process.platform}-${process.arch}-${isMusl() ? "musl" : "gnu"}`',
  "    : `${process.platform}-${process.arch}`;",
  "if (!taffyjsSupportedPlatforms.includes(taffyjsPlatform)) {",
  "  throw new Error(",
  '    `Unsupported OS and architecture: ${process.platform} ${process.arch}. Supported targets: ${taffyjsSupportedPlatforms.join(", ")}`,',
  "  );",
  "}",
  "// taffyjs supported-platform guard:end",
  "",
  "",
].join("\n");
const marker = "function requireNative() {\n";
if (!loader.includes(marker)) throw new Error("Could not find native loader entry point");
const withoutPreviousGuard = loader
  .replace(
    /\/\/ taffyjs supported-platform guard:start[\s\S]*?\/\/ taffyjs supported-platform guard:end\n\n/gu,
    "",
  )
  .replace(
    /const taffyjsSupportedPlatforms = \[[^\n]*\];\nconst taffyjsPlatform =[\s\S]*?^\}\n\n/gmu,
    "",
  );
await writeFile(loaderPath, withoutPreviousGuard.replace(marker, `${guard}${marker}`));
await copyFile(
  resolve(packageRoot, platform.binary),
  resolve(packageRoot, "npm", platform.directory, platform.binary),
);
