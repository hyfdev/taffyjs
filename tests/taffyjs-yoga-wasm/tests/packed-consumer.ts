import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Browser } from "playwright";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../../..");
const wasmPackageDirectory = resolve(repositoryDirectory, "packages/taffyjs-wasm");
const yogaWasmPackageDirectory = resolve(repositoryDirectory, "packages/taffyjs-yoga-wasm");
const temporaryDirectory = await mkdtemp(resolve(tmpdir(), "taffyjs-yoga-wasm-consumer-"));
const packDirectory = resolve(temporaryDirectory, "packed");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const vp = process.platform === "win32" ? "vp.cmd" : "vp";

const nodeConsumerProgram = `
  import Yoga from "yoga-layout";
  import { loadYoga } from "yoga-layout/load";

  const node = Yoga.Node.create();
  node.setMeasureFunc(() => ({ width: 31, height: 17 }));
  node.calculateLayout(undefined, undefined);

  const otherYoga = await loadYoga();
  let isolated = false;
  try {
    otherYoga.Node.destroy(node);
  } catch {
    isolated = true;
  }

  console.log(JSON.stringify({
    width: node.getComputedWidth(),
    height: node.getComputedHeight(),
    isolated,
  }));
  node.free();
`;

try {
  await mkdir(packDirectory);
  pack(wasmPackageDirectory);
  pack(yogaWasmPackageDirectory);

  const tarballs = await readdir(packDirectory);
  const wasmTarball = resolveSingleTarball(tarballs, "taffyjs-wasm-");
  const yogaWasmTarball = resolveSingleTarball(tarballs, "taffyjs-yoga-wasm-");

  for (const packageManager of ["npm", "pnpm"] as const) {
    const consumerDirectory = resolve(temporaryDirectory, packageManager);
    await mkdir(consumerDirectory);
    await writeConsumerManifest(consumerDirectory, wasmTarball, yogaWasmTarball);

    if (packageManager === "pnpm") {
      await writeFile(
        resolve(consumerDirectory, "pnpm-workspace.yaml"),
        `packages:\n  - .\noverrides:\n  "@taffyjs/wasm@0.0.0": "file:${wasmTarball}"\n`,
      );
    }

    execFileSync(packageManager === "npm" ? npm : pnpm, ["install", "--ignore-scripts"], {
      cwd: consumerDirectory,
      stdio: "pipe",
    });

    const output = execFileSync(
      process.execPath,
      ["--input-type=module", "--eval", nodeConsumerProgram],
      {
        cwd: consumerDirectory,
        encoding: "utf8",
      },
    );
    assert.deepEqual(JSON.parse(output), { width: 31, height: 17, isolated: true }, packageManager);

    if (packageManager === "npm") await verifyPackedBrowserConsumer(consumerDirectory);
  }

  console.log(
    JSON.stringify({
      packedConsumers: ["npm", "pnpm"],
      browserEntries: ["root", "load"],
      browserWasmPayloadsPerBundle: 1,
    }),
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

function pack(packageDirectory: string): void {
  execFileSync(pnpm, ["pack", "--pack-destination", packDirectory], {
    cwd: packageDirectory,
    stdio: "pipe",
  });
}

function resolveSingleTarball(tarballs: string[], prefix: string): string {
  const matches = tarballs.filter((name) => name.startsWith(prefix) && name.endsWith(".tgz"));
  assert.equal(matches.length, 1, prefix);
  const [match] = matches;
  if (match === undefined) throw new Error(`Missing tarball ${prefix}`);
  return resolve(packDirectory, match);
}

async function writeConsumerManifest(
  consumerDirectory: string,
  wasmTarball: string,
  yogaWasmTarball: string,
): Promise<void> {
  await writeFile(
    resolve(consumerDirectory, "package.json"),
    `${JSON.stringify(
      {
        name: `taffyjs-yoga-wasm-${consumerDirectory.split(sep).at(-1)}-consumer`,
        private: true,
        type: "module",
        dependencies: {
          "@taffyjs/wasm": `file:${wasmTarball}`,
          "yoga-layout": `file:${yogaWasmTarball}`,
        },
      },
      null,
      2,
    )}\n`,
  );
}

async function verifyPackedBrowserConsumer(consumerDirectory: string): Promise<void> {
  const rootApplication = resolve(consumerDirectory, "root");
  const loadApplication = resolve(consumerDirectory, "load");
  await writeBrowserApplication(
    rootApplication,
    `
      import Yoga from "yoga-layout";

      const node = Yoga.Node.create();
      node.setMeasureFunc(() => ({ width: 31, height: 17 }));
      node.calculateLayout(undefined, undefined);
      document.querySelector("#result").textContent = JSON.stringify({
        width: node.getComputedWidth(),
        height: node.getComputedHeight(),
        crossOriginIsolated: globalThis.crossOriginIsolated,
        sharedArrayBufferType: typeof globalThis.SharedArrayBuffer,
      });
      node.free();
    `,
  );
  await writeBrowserApplication(
    loadApplication,
    `
      const originalCompile = WebAssembly.compile;
      let compileCalls = 0;
      WebAssembly.compile = (...args) => {
        compileCalls += 1;
        return originalCompile(...args);
      };

      const { loadYoga } = await import("yoga-layout/load");
      const compileCallsAfterImport = compileCalls;
      const Yoga = await loadYoga();
      const compileCallsAfterLoad = compileCalls;
      const node = Yoga.Node.create();
      node.setWidth(13);
      node.calculateLayout(undefined, undefined);
      document.querySelector("#result").textContent = JSON.stringify({
        width: node.getComputedWidth(),
        compileCallsAfterImport,
        compileCallsAfterLoad,
      });
      node.free();
      WebAssembly.compile = originalCompile;
    `,
  );

  for (const application of [rootApplication, loadApplication]) {
    execFileSync(vp, ["build", application, "--base", "./", "--target", "esnext"], {
      cwd: consumerDirectory,
      stdio: "pipe",
    });
    await inspectBrowserBundle(resolve(application, "dist"));
  }

  let browser: Browser | undefined;
  let server: Server | undefined;
  try {
    server = createStaticServer(consumerDirectory);
    const origin = await listen(server);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto(`${origin}/root/dist/`);
    await page.locator("#result").filter({ hasText: '"width":31' }).waitFor();
    assert.deepEqual(JSON.parse((await page.locator("#result").textContent()) ?? "null"), {
      width: 31,
      height: 17,
      crossOriginIsolated: false,
      sharedArrayBufferType: "undefined",
    });

    await page.goto(`${origin}/load/dist/`);
    await page.locator("#result").filter({ hasText: '"compileCallsAfterLoad":1' }).waitFor();
    assert.deepEqual(JSON.parse((await page.locator("#result").textContent()) ?? "null"), {
      width: 13,
      compileCallsAfterImport: 0,
      compileCallsAfterLoad: 1,
    });
    assert.deepEqual(pageErrors, []);
  } finally {
    await browser?.close();
    if (server !== undefined) await close(server);
  }
}

async function writeBrowserApplication(
  applicationDirectory: string,
  program: string,
): Promise<void> {
  await mkdir(resolve(applicationDirectory, "src"), { recursive: true });
  await writeFile(
    resolve(applicationDirectory, "index.html"),
    '<!doctype html><html><body><output id="result">pending</output><script type="module" src="./src/main.js"></script></body></html>\n',
  );
  await writeFile(resolve(applicationDirectory, "src/main.js"), program);
}

async function inspectBrowserBundle(outputDirectory: string): Promise<void> {
  const assetDirectory = resolve(outputDirectory, "assets");
  const assets = await readdir(assetDirectory);
  assert.deepEqual(
    assets.filter((name) => name.endsWith(".wasm")),
    [],
  );
  const scripts = await Promise.all(
    assets
      .filter((name) => name.endsWith(".js"))
      .map((name) => readFile(resolve(assetDirectory, name), "utf8")),
  );
  const bundledJavaScript = scripts.join("\n");
  assert.equal((bundledJavaScript.match(/AGFzbQE/g) ?? []).length, 1);
  assert.equal((bundledJavaScript.match(/WebAssembly\.compile\(/g) ?? []).length, 1);
  assert.equal(bundledJavaScript.includes("node:wasi"), false);
}

function createStaticServer(rootDirectory: string): Server {
  return createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(requestUrl.pathname);
      const relativePath = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
      const file = resolve(rootDirectory, `.${relativePath}`);
      const rootPrefix = `${resolve(rootDirectory)}${sep}`;
      if (!file.startsWith(rootPrefix)) throw new Error("Invalid path");
      const body = await readFile(file);
      response.statusCode = 200;
      response.setHeader("content-type", contentType(file));
      response.end(body);
    } catch {
      response.statusCode = 404;
      response.end("Not found");
    }
  });
}

function contentType(file: string): string {
  if (extname(file) === ".html") return "text/html; charset=utf-8";
  if (extname(file) === ".js") return "text/javascript; charset=utf-8";
  return "application/octet-stream";
}

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  if (address === null || typeof address === "string") throw new Error("Missing server address");
  return `http://127.0.0.1:${address.port}`;
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    server.close((error) => (error === undefined ? resolvePromise() : reject(error)));
  });
}
