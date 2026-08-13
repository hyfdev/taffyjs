export const platforms = [
  {
    target: "x86_64-apple-darwin",
    os: "darwin",
    cpu: "x64",
    packageName: "@taffyjs/binding-darwin-x64",
    directory: "darwin-x64",
    binary: "taffyjs.darwin-x64.node",
    loaderPlatform: "darwin-x64",
  },
  {
    target: "aarch64-apple-darwin",
    os: "darwin",
    cpu: "arm64",
    packageName: "@taffyjs/binding-darwin-arm64",
    directory: "darwin-arm64",
    binary: "taffyjs.darwin-arm64.node",
    loaderPlatform: "darwin-arm64",
  },
  {
    target: "x86_64-pc-windows-msvc",
    os: "win32",
    cpu: "x64",
    packageName: "@taffyjs/binding-win32-x64-msvc",
    directory: "win32-x64-msvc",
    binary: "taffyjs.win32-x64-msvc.node",
    loaderPlatform: "win32-x64",
  },
  {
    target: "x86_64-unknown-linux-gnu",
    os: "linux",
    cpu: "x64",
    packageName: "@taffyjs/binding-linux-x64-gnu",
    directory: "linux-x64-gnu",
    binary: "taffyjs.linux-x64-gnu.node",
    loaderPlatform: "linux-x64-gnu",
  },
];

export function platformForHost(os = process.platform, cpu = process.arch) {
  return platforms.find((platform) => platform.os === os && platform.cpu === cpu);
}
