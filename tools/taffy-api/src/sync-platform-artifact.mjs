import { copyFile, readFile, writeFile } from "node:fs/promises";
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
const loaderPath = resolve(packageRoot, "native.js");
const loader = await readFile(loaderPath, "utf8");
const supportedPlatformNames = Object.keys(hostTargets)
  .map((host) => (host === "linux/x64" ? "linux-x64-gnu" : host.replace("/", "-")))
  .sort((left, right) => left.localeCompare(right));
const supportedPlatforms = [
  "// taffyjs supported-platform guard:start",
  `const taffyjsSupportedPlatforms = ${JSON.stringify(supportedPlatformNames).replaceAll(",", ", ")};`,
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
await writeFile(loaderPath, withoutPreviousGuard.replace(marker, `${supportedPlatforms}${marker}`));
await copyFile(
  resolve(packageRoot, platform.binary),
  resolve(packageRoot, "npm", platform.name.slice("@taffyjs/binding-".length), platform.binary),
);
