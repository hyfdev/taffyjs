import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "vite-plus/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const readmePath = resolve(root, "packages/taffyjs-node/README.md");
const declarationPath = resolve(root, "packages/taffyjs-node/index.d.ts");

function markedSection(source: string, name: string) {
  const match = new RegExp(
    `<!-- ${name}:start -->\\n([\\s\\S]*?)\\n<!-- ${name}:end -->`,
    "u",
  ).exec(source);
  assert.ok(match, `Missing ${name} section`);
  return match[1];
}

function backtickItems(source: string) {
  return Array.from(source.matchAll(/^- `([^`]+)`:/gmu), (match) => match[1]);
}

function publicSymbols(declaration: string) {
  return [
    ...new Set(
      Array.from(
        declaration.matchAll(
          /^export (?:declare )?(?:const|class|interface|type) ([A-Za-z][A-Za-z0-9]*)/gmu,
        ),
        (match) => match[1],
      ),
    ),
  ];
}

function treeMembers(declaration: string) {
  const classDeclaration = /export declare class TaffyTree[\s\S]*?^\}/mu.exec(declaration)?.[0];
  assert.ok(classDeclaration, "TaffyTree declaration is present");
  return Array.from(
    classDeclaration.matchAll(/\*\/\s+(constructor|[A-Za-z][A-Za-z0-9]*)\s*\(/gu),
    (match) => match[1],
  );
}

function assertPublicDeclarationsHaveDocumentation(declaration: string) {
  const declarations = declaration.matchAll(
    /^export (?:declare )?(?:const|class|interface|type) [A-Za-z][A-Za-z0-9]*/gmu,
  );
  for (const match of declarations) {
    assert.match(declaration.slice(0, match.index), /\/\*\*[\s\S]*?\*\/\s*$/u, match[0]);
  }
}

function example(source: string, name: string) {
  const fence = "```";
  const match = new RegExp(
    `<!-- example:${name} -->\\n\\s*${fence}ts\\n([\\s\\S]*?)\\n${fence}`,
    "u",
  ).exec(source);
  assert.ok(match, `Missing ${name} example`);
  return match[1];
}

async function run(command: string, args: string[], cwd: string) {
  return new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else {
        reject(
          new Error(
            `${command} ${args.join(" ")} exited ${code}\n${Buffer.concat(stdout).toString("utf8")}${Buffer.concat(stderr).toString("utf8")}`,
          ),
        );
      }
    });
  });
}

test("README lists every public symbol and tree method", async () => {
  const [declaration, readme] = await Promise.all([
    readFile(declarationPath, "utf8"),
    readFile(readmePath, "utf8"),
  ]);
  assertPublicDeclarationsHaveDocumentation(declaration);
  assert.deepEqual(
    backtickItems(markedSection(readme, "public-symbols")).sort(),
    publicSymbols(declaration).sort(),
  );
  assert.deepEqual(
    backtickItems(markedSection(readme, "public-tree-members")).sort(),
    treeMembers(declaration).sort(),
  );
});

test("README documents observable behavior", async () => {
  const readme = await readFile(readmePath, "utf8");
  const rules = markedSection(readme, "semantic-rules");
  for (const pattern of [
    /`NodeId` is an opaque `bigint`/u,
    /foreign tree/u,
    /stale ID/u,
    /Layout work is explicit[\s\S]*computeLayout[\s\S]*stored `Layout`[\s\S]*failed measured computation/u,
    /context[\s\S]*undefined[\s\S]*null/u,
    /measure callback[\s\S]*synchronous[\s\S]*cache control[\s\S]*different callback[\s\S]*markDirty[\s\S]*ERR_TAFFY_TREE_BUSY/u,
    /numeric constants[\s\S]*raw numeric literal/u,
    /StyleInput[\s\S]*omitted[\s\S]*undefined[\s\S]*null/u,
    /ERR_TAFFY_INVALID_NODE_ID[\s\S]*ERR_TAFFY_FOREIGN_NODE_ID[\s\S]*ERR_TAFFY_STALE_NODE_ID/u,
  ]) {
    assert.match(rules, pattern);
  }
  assert.doesNotMatch(rules, /last result written by a successful computation/u);
  assert.match(readme, /Unsupported surfaces[\s\S]*CSS parsing[\s\S]*async layout/u);
});

test("README examples compile and run", async () => {
  const readme = await readFile(readmePath, "utf8");
  const names = ["block", "flex", "grid", "measure"];
  const cacheRoot = resolve(root, "tests/taffyjs-node/.cache");
  await mkdir(cacheRoot, { recursive: true });
  const temporaryRoot = await mkdtemp(resolve(cacheRoot, "taffyjs-doc-examples-"));
  try {
    const paths = await Promise.all(
      names.map(async (name) => {
        const path = resolve(temporaryRoot, `${name}.mts`);
        await writeFile(path, `${example(readme, name)}\n`);
        return path;
      }),
    );
    const tsc = resolve(root, "packages/taffyjs-node/node_modules/.bin/tsc");
    await run(
      tsc,
      [
        "--ignoreConfig",
        "--noEmit",
        "--strict",
        "--exactOptionalPropertyTypes",
        "--skipLibCheck",
        "--target",
        "ES2022",
        "--module",
        "NodeNext",
        "--moduleResolution",
        "NodeNext",
        "--types",
        "node",
        ...paths,
      ],
      root,
    );
    for (const path of paths) await run(process.execPath, [path], temporaryRoot);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("README recommends named numeric constants", async () => {
  const readme = await readFile(readmePath, "utf8");
  const normalExamples = ["block", "flex", "grid", "measure"]
    .map((name) => example(readme, name))
    .join("\n");
  assert.doesNotMatch(
    normalExamples,
    /(?:display|float|clear|position|overflow|kind|unit|gridAutoFlow)\s*:\s*-?\d/u,
  );
  assert.equal((readme.match(/<!-- boundary-example:not-recommended -->/gu) ?? []).length, 1);
  assert.match(readme, /boundary example[\s\S]*not recommended[\s\S]*raw numeric literal/iu);
});
