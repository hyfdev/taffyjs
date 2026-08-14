export const platforms = [
  {
    os: "win32",
    cpu: "x64",
    packageName: "@taffyjs/binding-win32-x64-msvc",
    directory: "win32-x64-msvc",
    binary: "taffyjs.win32-x64-msvc.node",
  },
  {
    os: "linux",
    cpu: "x64",
    packageName: "@taffyjs/binding-linux-x64-gnu",
    directory: "linux-x64-gnu",
    binary: "taffyjs.linux-x64-gnu.node",
  },
];

export function platformForHost(os = process.platform, cpu = process.arch) {
  return platforms.find((platform) => platform.os === os && platform.cpu === cpu);
}
