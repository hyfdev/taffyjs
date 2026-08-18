import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

import { rewriteNodeLoaderVersion, shouldCopyStagePath } from "./assemble.ts";
import {
  bootstrapState,
  publishBootstrapPackage,
  verifyBootstrapReady,
  type BootstrapState,
} from "./bootstrap-registry.ts";
import { isReleasePath } from "./config.ts";
import { capture, parseRemoteTagCommit, root } from "./lib.ts";
import {
  ensureRegistryAuthentication,
  npmTrustArguments,
  revokeTemporaryAuthentication,
  type CommandRunner,
} from "./npm-trust.ts";
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
  assert.equal(parseRemoteTagCommit(`${commit}\trefs/tags/core-v0.0.1`, "core-v0.0.1"), commit);
  assert.equal(
    parseRemoteTagCommit(
      `${tagObject}\trefs/tags/core-v0.0.1\n${commit}\trefs/tags/core-v0.0.1^{}`,
      "core-v0.0.1",
    ),
    commit,
  );
  assert.equal(parseRemoteTagCommit("", "core-v0.0.1"), null);
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
  assert.deepEqual(npmTrustArguments(["trust", "list", "@taffyjs/node", "--json"]), [
    "--config.registry=https://registry.npmjs.org",
    "dlx",
    "npm@11.18.0",
    "trust",
    "list",
    "@taffyjs/node",
    "--json",
    "--registry",
    "https://registry.npmjs.org",
  ]);
});

void test("bootstrap waits for a newly published package to become visible", async () => {
  const observedStates: BootstrapState[] = ["missing", "unexpected", "ready"];
  let observations = 0;

  await verifyBootstrapReady("@taffyjs/binding-darwin-x64", {
    readState: async () => {
      const state = observedStates[observations];
      observations += 1;
      assert(state);
      return state;
    },
    retryDelays: [0, 0],
    sleep: async () => {},
    onRetry: () => {},
  });

  assert.equal(observations, 3);
});

void test("bootstrap recovers when a stale missing read causes a duplicate publish", async () => {
  const observedStates: BootstrapState[] = ["missing", "ready"];
  let observations = 0;

  await publishBootstrapPackage(
    "@taffyjs/binding-darwin-x64",
    async () => {
      throw new Error("npm rejected an already published version");
    },
    {
      readState: async () => {
        const state = observedStates[observations];
        observations += 1;
        assert(state);
        return state;
      },
      retryDelays: [0],
      sleep: async () => {},
      onRetry: () => {},
    },
  );

  assert.equal(observations, 2);
});

void test("bootstrap registry reads abort instead of hanging", async () => {
  const request: typeof fetch = async (_input, init) =>
    await new Promise<Response>((_resolvePromise, reject) => {
      const signal = init?.signal;
      assert(signal);
      const keepAlive = setInterval(() => {}, 1_000);
      signal.addEventListener(
        "abort",
        () => {
          clearInterval(keepAlive);
          reject(signal.reason);
        },
        { once: true },
      );
    });

  await assert.rejects(
    () => bootstrapState("@taffyjs/binding-darwin-x64", request, 5),
    /timeout|aborted/i,
  );
});

void test("command capture aborts a stuck npm trust read", async () => {
  await assert.rejects(
    () =>
      capture(process.execPath, ["-e", "setInterval(() => {}, 1_000)"], {
        signal: AbortSignal.timeout(20),
      }),
    /aborted/i,
  );
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
