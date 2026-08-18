export interface Platform {
  readonly target: string;
  readonly os: string;
  readonly cpu: string;
  readonly libc?: "glibc" | "musl";
  readonly packageName: string;
  readonly directory: string;
  readonly binary: string;
}

export const platforms: readonly Platform[] = [
  {
    target: "x86_64-apple-darwin",
    os: "darwin",
    cpu: "x64",
    packageName: "@taffyjs/binding-darwin-x64",
    directory: "darwin-x64",
    binary: "taffyjs.darwin-x64.node",
  },
  {
    target: "aarch64-apple-darwin",
    os: "darwin",
    cpu: "arm64",
    packageName: "@taffyjs/binding-darwin-arm64",
    directory: "darwin-arm64",
    binary: "taffyjs.darwin-arm64.node",
  },
  {
    target: "x86_64-unknown-linux-gnu",
    os: "linux",
    cpu: "x64",
    libc: "glibc",
    packageName: "@taffyjs/binding-linux-x64-gnu",
    directory: "linux-x64-gnu",
    binary: "taffyjs.linux-x64-gnu.node",
  },
  {
    target: "x86_64-pc-windows-msvc",
    os: "win32",
    cpu: "x64",
    packageName: "@taffyjs/binding-win32-x64-msvc",
    directory: "win32-x64-msvc",
    binary: "taffyjs.win32-x64-msvc.node",
  },
  {
    target: "x86_64-unknown-linux-musl",
    os: "linux",
    cpu: "x64",
    libc: "musl",
    packageName: "@taffyjs/binding-linux-x64-musl",
    directory: "linux-x64-musl",
    binary: "taffyjs.linux-x64-musl.node",
  },
  {
    target: "aarch64-unknown-linux-gnu",
    os: "linux",
    cpu: "arm64",
    libc: "glibc",
    packageName: "@taffyjs/binding-linux-arm64-gnu",
    directory: "linux-arm64-gnu",
    binary: "taffyjs.linux-arm64-gnu.node",
  },
  {
    target: "i686-pc-windows-msvc",
    os: "win32",
    cpu: "ia32",
    packageName: "@taffyjs/binding-win32-ia32-msvc",
    directory: "win32-ia32-msvc",
    binary: "taffyjs.win32-ia32-msvc.node",
  },
  {
    target: "armv7-unknown-linux-gnueabihf",
    os: "linux",
    cpu: "arm",
    libc: "glibc",
    packageName: "@taffyjs/binding-linux-arm-gnueabihf",
    directory: "linux-arm-gnueabihf",
    binary: "taffyjs.linux-arm-gnueabihf.node",
  },
  {
    target: "aarch64-linux-android",
    os: "android",
    cpu: "arm64",
    packageName: "@taffyjs/binding-android-arm64",
    directory: "android-arm64",
    binary: "taffyjs.android-arm64.node",
  },
  {
    target: "x86_64-unknown-freebsd",
    os: "freebsd",
    cpu: "x64",
    packageName: "@taffyjs/binding-freebsd-x64",
    directory: "freebsd-x64",
    binary: "taffyjs.freebsd-x64.node",
  },
  {
    target: "aarch64-unknown-linux-musl",
    os: "linux",
    cpu: "arm64",
    libc: "musl",
    packageName: "@taffyjs/binding-linux-arm64-musl",
    directory: "linux-arm64-musl",
    binary: "taffyjs.linux-arm64-musl.node",
  },
  {
    target: "aarch64-pc-windows-msvc",
    os: "win32",
    cpu: "arm64",
    packageName: "@taffyjs/binding-win32-arm64-msvc",
    directory: "win32-arm64-msvc",
    binary: "taffyjs.win32-arm64-msvc.node",
  },
  {
    target: "armv7-linux-androideabi",
    os: "android",
    cpu: "arm",
    packageName: "@taffyjs/binding-android-arm-eabi",
    directory: "android-arm-eabi",
    binary: "taffyjs.android-arm-eabi.node",
  },
];

function libcForHost(os: string): "glibc" | "musl" | undefined {
  if (os !== "linux") return undefined;
  const report = process.report.getReport() as {
    readonly header?: { readonly glibcVersionRuntime?: string };
  };
  return report.header?.glibcVersionRuntime ? "glibc" : "musl";
}

export function platformForHost(
  os: string = process.platform,
  cpu: string = process.arch,
  libc: "glibc" | "musl" | undefined = libcForHost(os),
): Platform | undefined {
  return platforms.find(
    (platform) => platform.os === os && platform.cpu === cpu && platform.libc === libc,
  );
}
