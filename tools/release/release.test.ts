import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

import {
  rewriteNodeLoaderVersion,
  shouldCopyStagePath,
  type ReleaseBundlePackage,
} from "./assemble.ts";
import { bootstrapState } from "./bootstrap-registry.ts";
import { bootstrapVersion, isReleasePath, npmRegistry } from "./config.ts";
import { parseRemoteTagCommit, root } from "./lib.ts";
import {
  ensureRegistryAuthentication,
  npmTrustArguments,
  revokeTemporaryAuthentication,
  type CommandRunner,
} from "./npm-trust.ts";
import { publishReleasePackages } from "./publish.ts";
import {
  automaticBump,
  incrementVersion,
  parseConventionalCommit,
  relevantCommits,
  type ConventionalCommit,
} from "./version.ts";

void test("the two release groups own different package paths", () => {
  assert.equal(isReleasePath("core", "packages/taffyjs-node/src/index.ts"), true);
  assert.equal(isReleasePath("core", "packages/taffyjs-yoga/src/index.ts"), false);
  assert.equal(isReleasePath("yoga", "packages/taffyjs-yoga/src/index.ts"), true);
  assert.equal(isReleasePath("yoga", "packages/taffyjs-node/src/index.ts"), false);
  assert.equal(isReleasePath("core", ".github/workflows/publish-core.yml"), false);
  assert.equal(isReleasePath("yoga", "tools/release/plan.ts"), false);
});

void test("release staging keeps sources and excludes generated dependency trees", () => {
  assert.equal(shouldCopyStagePath(resolve(root, "packages/taffyjs-node/index.js")), true);
  assert.equal(shouldCopyStagePath(resolve(root, "packages/taffyjs-node/node_modules")), false);
  assert.equal(
    shouldCopyStagePath(resolve(root, "packages/taffyjs-node/node_modules/dependency/index.js")),
    false,
  );
  assert.equal(shouldCopyStagePath(resolve(root, "packages/taffyjs-wasm/.napi-build")), false);
  assert.equal(
    shouldCopyStagePath(resolve(root, "packages/taffyjs-node/.napi-rs-filesystem-transaction-123")),
    false,
  );
});

void test("release staging rewrites every generated native loader version check", () => {
  const source = [
    'if (bindingPackageVersion !== "0.0.0") throw new Error(`expected 0.0.0 but got ${bindingPackageVersion}`);',
    'if (bindingPackageVersion !== "0.0.0") throw new Error(`expected 0.0.0 but got ${bindingPackageVersion}`);',
  ].join("\n");
  const rewritten = rewriteNodeLoaderVersion(source, "0.0.0", "0.0.1");
  assert.equal(rewritten.includes("0.0.0"), false);
  assert.equal(rewritten.match(/0\.0\.1/g)?.length, 4);
  assert.throws(() =>
    rewriteNodeLoaderVersion(`${source}\nconst unrelated = "0.0.0";`, "0.0.0", "0.0.1"),
  );
});

void test("remote release tags resolve lightweight and annotated commits", () => {
  const commit = "1".repeat(40);
  const tagObject = "2".repeat(40);
  assert.equal(parseRemoteTagCommit(`${commit}\trefs/tags/v0.0.1`, "v0.0.1"), commit);
  assert.equal(
    parseRemoteTagCommit(
      `${tagObject}\trefs/tags/v0.0.1\n${commit}\trefs/tags/v0.0.1^{}`,
      "v0.0.1",
    ),
    commit,
  );
  assert.equal(parseRemoteTagCommit("", "v0.0.1"), null);
});

void test("publication preflights every package before the first registry write", async () => {
  const missing = releasePackage("@taffyjs/missing", "sha512-missing");
  const conflicting = releasePackage("@taffyjs/conflicting", "sha512-expected");
  const published: string[] = [];

  await assert.rejects(
    () =>
      publishReleasePackages([missing, conflicting], {
        registryIntegrity: async (name) => (name === missing.name ? null : "sha512-unexpected"),
        publish: async ({ name }) => {
          published.push(name);
        },
      }),
    /already exists with different bytes/,
  );

  assert.deepEqual(published, []);
});

void test("publication skips matching versions and does not read them again after writing", async () => {
  const existing = releasePackage("@taffyjs/existing", "sha512-existing");
  const firstMissing = releasePackage("@taffyjs/first-missing", "sha512-first-missing");
  const secondMissing = releasePackage("@taffyjs/second-missing", "sha512-second-missing");
  const events: string[] = [];

  await publishReleasePackages([existing, firstMissing, secondMissing], {
    registryIntegrity: async (name) => {
      events.push(`read ${name}`);
      return name === existing.name ? existing.integrity : null;
    },
    publish: async ({ name }) => {
      events.push(`publish ${name}`);
    },
  });

  assert.deepEqual(events, [
    `read ${existing.name}`,
    `read ${firstMissing.name}`,
    `read ${secondMissing.name}`,
    `publish ${firstMissing.name}`,
    `publish ${secondMissing.name}`,
  ]);
});

void test("publication stops at a command failure without retrying or continuing", async () => {
  const first = releasePackage("@taffyjs/first", "sha512-first");
  const failing = releasePackage("@taffyjs/failing", "sha512-failing");
  const unattempted = releasePackage("@taffyjs/unattempted", "sha512-unattempted");
  const attempts: string[] = [];

  await assert.rejects(
    () =>
      publishReleasePackages([first, failing, unattempted], {
        registryIntegrity: async () => null,
        publish: async ({ name }) => {
          attempts.push(name);
          if (name === failing.name) throw new Error("publish failed");
        },
      }),
    /publish failed/,
  );

  assert.deepEqual(attempts, [first.name, failing.name]);
});

void test("bootstrap revokes only the npm login it creates", async () => {
  const events: string[] = [];
  let authenticated = false;
  const runner = authenticationRunner(
    () => authenticated,
    (value) => {
      authenticated = value;
    },
    events,
  );
  const state = { temporaryLogin: false };

  await ensureRegistryAuthentication("/isolated", state, runner);
  assert.equal(state.temporaryLogin, true);
  await revokeTemporaryAuthentication("/isolated", state, runner);
  assert.equal(state.temporaryLogin, false);
  assert.deepEqual(events, ["login", "logout"]);

  events.length = 0;
  authenticated = true;
  await ensureRegistryAuthentication("/isolated", state, runner);
  await revokeTemporaryAuthentication("/isolated", state, runner);
  assert.deepEqual(events, []);
});

void test("a post-login failure still leaves the temporary token revocable", async () => {
  const events: string[] = [];
  let trustWhoamiCalls = 0;
  const runner: CommandRunner = {
    capture: async (_command, arguments_) => {
      if (arguments_.includes("dlx") && arguments_.includes("whoami")) {
        trustWhoamiCalls += 1;
        if (trustWhoamiCalls === 1) throw authenticationRequiredError();
        throw new Error("verification failed");
      }
      throw new Error(`Unexpected capture ${arguments_.join(" ")}`);
    },
    run: async (_command, arguments_) => {
      if (arguments_.includes("login")) events.push("login");
      else if (arguments_.includes("logout")) events.push("logout");
      else throw new Error(`Unexpected run ${arguments_.join(" ")}`);
    },
  };
  const state = { temporaryLogin: false };

  await assert.rejects(() => ensureRegistryAuthentication("/isolated", state, runner));
  assert.equal(state.temporaryLogin, true);
  await revokeTemporaryAuthentication("/isolated", state, runner);
  assert.deepEqual(events, ["login", "logout"]);
});

void test("a registry failure does not replace or revoke an existing login", async () => {
  const state = { temporaryLogin: false };
  const runner: CommandRunner = {
    capture: async () => {
      throw Object.assign(new Error("registry unavailable"), { stderr: "ECONNREFUSED" });
    },
    run: async () => assert.fail("A network failure must not open or revoke a login"),
  };

  await assert.rejects(() => ensureRegistryAuthentication("/isolated", state, runner));
  await revokeTemporaryAuthentication("/isolated", state, runner);
  assert.equal(state.temporaryLogin, false);
});

void test("npm trust is an exact-version helper fetched through pnpm", () => {
  assert.deepEqual(npmTrustArguments(["trust", "github", "@taffyjs/node", "--yes"]), [
    "--config.registry=https://registry.npmjs.org",
    "dlx",
    "npm@11.18.0",
    "trust",
    "github",
    "@taffyjs/node",
    "--yes",
    "--registry",
    "https://registry.npmjs.org",
  ]);
});

void test("bootstrap reads the exact version and dist-tag endpoints", async () => {
  const name = "@taffyjs/binding-darwin-arm64";
  const encodedName = encodeURIComponent(name);
  const requestedUrls: string[] = [];
  const request: typeof fetch = async (input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    requestedUrls.push(url);
    if (url === `${npmRegistry}/${encodedName}/${encodeURIComponent(bootstrapVersion)}`) {
      return new Response(JSON.stringify({ license: "MIT", version: bootstrapVersion }));
    }
    if (url === `${npmRegistry}/-/package/${encodedName}/dist-tags`) {
      return new Response(JSON.stringify({ bootstrap: bootstrapVersion }));
    }
    return new Response(undefined, { status: 404 });
  };

  assert.equal(await bootstrapState(name, request), "ready");
  assert.deepEqual(requestedUrls, [
    `${npmRegistry}/${encodedName}/${encodeURIComponent(bootstrapVersion)}`,
    `${npmRegistry}/-/package/${encodedName}/dist-tags`,
  ]);
});

void test("stable versions begin at 0.0.1 and use patch or minor increments", () => {
  assert.equal(incrementVersion("0.0.1", "patch"), "0.0.2");
  assert.equal(incrementVersion("0.0.9", "minor"), "0.1.0");
  assert.equal(incrementVersion("0.1.4", "minor"), "0.2.0");
  assert.throws(() => incrementVersion("0.0.1-beta.1", "patch"));
});

void test("breaking and feature commits outrank fixes", () => {
  const commits = [
    parsed("fix(node): preserve a value"),
    parsed("feat(node): add an operation"),
    parsed("perf(node): reduce copies"),
  ];
  assert.equal(automaticBump(commits), "minor");
  assert.equal(automaticBump([parsed("fix(node): preserve a value")]), "patch");
  assert.equal(automaticBump([parsed("docs(node): explain a value")]), undefined);
  assert.equal(automaticBump([parsed("fix(node)!: change a result")]), "minor");
});

void test("release relevance follows changed files rather than optional commit scopes", () => {
  const commits: ConventionalCommit[] = [
    commit("feat(runtime): add core behavior", ["packages/taffyjs-node/src/index.ts"]),
    commit("Raise the Node baseline", ["packages/taffyjs-node/package.json"]),
    commit("fix(runtime): correct Yoga behavior", ["packages/taffyjs-yoga/src/index.ts"]),
    commit("docs(repo): explain releases", [".agents/docs/release.md"]),
  ];
  assert.deepEqual(
    relevantCommits("core", commits).map(({ subject }) => subject),
    ["feat(runtime): add core behavior", "Raise the Node baseline"],
  );
  assert.deepEqual(
    relevantCommits("yoga", commits).map(({ subject }) => subject),
    ["fix(runtime): correct Yoga behavior"],
  );
  assert.equal(automaticBump(relevantCommits("core", commits)), "minor");
});

function commit(subject: string, paths: readonly string[]): ConventionalCommit {
  return { hash: "1234567890abcdef", subject, body: "", paths };
}

function releasePackage(name: string, integrity: string): ReleaseBundlePackage {
  return {
    name,
    kind: "binding",
    version: "0.0.2",
    tarball: `${name.replaceAll("/", "-")}.tgz`,
    integrity,
    files: ["package.json"],
  };
}

function parsed(subject: string) {
  return parseConventionalCommit(commit(subject, ["packages/taffyjs-node/src/index.ts"]));
}

function authenticationRunner(
  getAuthenticated: () => boolean,
  setAuthenticated: (value: boolean) => void,
  events: string[],
): CommandRunner {
  return {
    capture: async (_command, arguments_) => {
      if (arguments_.includes("dlx") && arguments_.includes("whoami")) {
        if (!getAuthenticated()) throw authenticationRequiredError();
        return "hyfdev";
      }
      if (arguments_[0] === "whoami") return "hyfdev";
      throw new Error(`Unexpected capture ${arguments_.join(" ")}`);
    },
    run: async (_command, arguments_) => {
      if (arguments_.includes("login")) {
        events.push("login");
        setAuthenticated(true);
      } else if (arguments_.includes("logout")) {
        events.push("logout");
        setAuthenticated(false);
      } else {
        throw new Error(`Unexpected run ${arguments_.join(" ")}`);
      }
    },
  };
}

function authenticationRequiredError(): Error {
  return Object.assign(new Error("authentication required"), {
    stderr: "npm error code ENEEDAUTH",
  });
}
