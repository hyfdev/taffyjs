import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { contractTest } from "./contract-test.mts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

async function loadChecker() {
  return import("../src/index.mjs");
}

async function expectDiagnostic(action: () => unknown, diagnostic: string) {
  await assert.rejects(
    () => Promise.resolve().then(action),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal("diagnostic" in error ? error.diagnostic : undefined, diagnostic);
      return true;
    },
  );
}

contractTest("INFRA-001/generate", async () => {
  const checker = await loadChecker();
  const goal = await readFile(resolve(root, ".agents/docs/loop-goal.md"), "utf8");
  const generated = await checker.generateArtifacts({ root, goal, write: false });
  assert.equal(
    generated.contractJson,
    await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"),
  );
  assert.equal(
    generated.expectedDeclaration,
    await readFile(resolve(root, "tools/taffy-api/expected-declaration.d.ts"), "utf8"),
  );
  assert.deepEqual(
    checker.extractCanonicalContract(
      goal.replace("## Goal", "## A prose heading that is not machine input"),
    ),
    checker.extractCanonicalContract(goal),
  );
  await expectDiagnostic(
    () => checker.extractCanonicalContract(goal.replace("<!-- taffy-contract-json:end -->", "")),
    "contract-json-markers",
  );
});

contractTest("INFRA-001/pin-drift", async () => {
  const checker = await loadChecker();
  const fixture = await checker.createRepositoryFixture(root);
  const mutations = [
    "cargo-napi-requirement",
    "cargo-napi-derive-requirement",
    "cargo-napi-build-requirement",
    "cargo-taffy-requirement",
    "cargo-lock-version",
    "taffy-checksum",
    "taffy-default-features",
    "taffy-resolved-features",
    "node-range",
    "minimum-node-runtime",
    "typescript-version",
    "oxfmt-version",
  ];
  for (const mutation of mutations) {
    await expectDiagnostic(
      () => checker.checkRepositoryFixture(fixture.mutate(mutation)),
      `pin-drift/${mutation}`,
    );
  }
  const implemented = fixture.withTaskState("INFRA-002", "implemented");
  for (const mutation of ["types-node-target", "packed-engines-node"]) {
    await expectDiagnostic(
      () => checker.checkRepositoryFixture(implemented.mutate(mutation)),
      `pin-drift/${mutation}`,
    );
  }
});

contractTest("INFRA-001/source-drift", async () => {
  const checker = await loadChecker();
  const fixture = await checker.createRepositoryFixture(root);
  await expectDiagnostic(
    () => checker.checkRepositoryFixture(fixture.mutate("contract-unknown-field")),
    "contract-schema-unknown-field",
  );
  await expectDiagnostic(
    () => checker.checkRepositoryFixture(fixture.mutate("rule-unknown-field")),
    "contract-schema-unknown-rule-key",
  );
  for (const mutation of [
    "method-missing",
    "method-added",
    "method-renamed",
    "method-primitive-argument",
    "method-return-type",
    "method-feature-gate",
    "named-data-field",
    "named-data-variant",
    "named-data-payload",
    "named-data-feature-gate",
    "adjacent-root",
  ]) {
    await expectDiagnostic(
      () => checker.checkRepositoryFixture(fixture.mutate(mutation)),
      `source-drift/${mutation}`,
    );
  }
});

contractTest("INFRA-001/task-drift", async () => {
  const checker = await loadChecker();
  const fixture = await checker.createRepositoryFixture(root);
  for (const mutation of [
    "task-missing",
    "task-duplicate",
    "owner-missing",
    "owner-duplicate",
    "acceptance-missing",
    "acceptance-duplicate",
    "generated-id-missing",
    "minimum-node-secondary-missing",
    "surface-probe-missing",
    "artifact-projection-missing",
    "status-entry-missing",
    "evidence-entry-missing",
    "declaration-signature",
    "declaration-optional-marker",
    "declaration-readonly-marker",
    "declaration-overload-count",
    "node-id-role-binding",
    "node-id-collection-valid-position",
    "node-id-collection-invalid-position",
  ]) {
    await expectDiagnostic(
      () => checker.checkRepositoryFixture(fixture.mutate(mutation)),
      `task-drift/${mutation}`,
    );
  }
  for (const acceptanceId of [
    "TYPE-LENGTH-001/forms",
    "TYPE-LENGTH-001/helper-materialization",
    "TYPE-AVAILABLE-001/variants",
    "TYPE-AVAILABLE-001/helper-materialization",
    "TYPE-GRID-001/families",
    "TYPE-GRID-001/minmax",
    "TYPE-GRID-001/repeat-lines",
    "TYPE-GRID-001/helper-materialization",
  ]) {
    await expectDiagnostic(
      () =>
        checker.checkRepositoryFixture(
          fixture.mutate("remove-acceptance-path-override", acceptanceId),
        ),
      `task-drift/acceptance-path/${acceptanceId}`,
    );
  }

  const contract = JSON.parse(
    await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"),
  );
  checker.validateNodeIdDeclarationBindings(contract);
  for (const mutate of [
    (copy: typeof contract) => {
      const member = copy.publicDeclarationContract.classDeclaration.members.find(
        ([name]: [string]) => name === "remove",
      );
      member[1] = "remove(node: bigint): void;";
    },
    (copy: typeof contract) => {
      copy.publicDeclarationContract.fixedStatementsByOwner["API-TREE-031"][0] =
        "export interface ComputeLayoutOptions { root: bigint; availableSpace: SizeInput<AvailableSpaceInput>; }";
    },
    (copy: typeof contract) => {
      const member = copy.publicDeclarationContract.classDeclaration.members.find(
        ([name]: [string]) => name === "setChildren",
      );
      member[1] = "setChildren(parent: NodeId, children: readonly bigint[]): void;";
    },
    (copy: typeof contract) => {
      const member = copy.publicDeclarationContract.classDeclaration.members.find(
        ([name]: [string]) => name === "clear",
      );
      member[1] = "clear(unbound: NodeId): void;";
    },
  ]) {
    const copy = structuredClone(contract);
    mutate(copy);
    await expectDiagnostic(
      () => checker.validateNodeIdDeclarationBindings(copy),
      "task-drift/node-id-role-binding",
    );
  }
});

contractTest("INFRA-001/collection-drift", async () => {
  const checker = await loadChecker();
  const fixture = await checker.createRepositoryFixture(root);
  for (const mutation of [
    "test-skipped",
    "test-todo",
    "test-conditional",
    "test-duplicate",
    "test-uncollected",
    "test-retried",
    "suite-zero",
    "minimum-node-wrong-runtime",
    "minimum-node-workspace-resolution",
    "evidence-collection-root",
    "minimum-node-not-packed",
  ]) {
    await expectDiagnostic(
      () => checker.checkRepositoryFixture(fixture.mutate(mutation)),
      `collection-drift/${mutation}`,
    );
  }
  await expectDiagnostic(
    () =>
      checker.extractContractTestCalls(
        'if (enabled) contractTest("INFRA-001/generate", () => {});',
        "conditional.test.mts",
        root,
      ),
    "collection-drift/test-conditional",
  );
  await expectDiagnostic(
    () =>
      checker.extractContractTestCalls(
        'contractTest.todo("INFRA-001/generate", () => {});',
        "todo.test.mts",
        root,
      ),
    "collection-drift/test-todo",
  );
  assert.deepEqual(
    await checker.extractContractTestCalls(
      'contractTest("INFRA-001/generate", () => {});',
      "top-level.test.mts",
      root,
    ),
    [{ id: "INFRA-001/generate", path: "top-level.test.mts", offset: 0 }],
  );

  const temporaryRoot = await mkdtemp(resolve(tmpdir(), "taffy-static-evidence-"));
  try {
    const records = [
      {
        id: "FIXTURE-JS/one",
        identity: "contractTest(FIXTURE-JS/one, fn)",
        modality: "machine-check",
        owner: "FIXTURE-JS",
        path: "tools/taffy-api/tests/FIXTURE-JS.test.mts",
      },
      {
        id: "FIXTURE-TYPES/one",
        identity: "FIXTURE-TYPES/one",
        modality: "types",
        owner: "FIXTURE-TYPES",
        path: "tests/taffyjs-node/tests/types/FIXTURE-TYPES/one.test-d.ts",
      },
      {
        id: "FIXTURE-RUST/one",
        identity: "contract_tests::contract__fixture_rust__one",
        modality: "rust-contract",
        owner: "FIXTURE-RUST",
        path: "crates/taffyjs_binding/src/contract_tests.rs",
      },
      {
        id: "FIXTURE-COMMAND/one",
        identity: "FIXTURE-COMMAND/one",
        modality: "command-attestation",
        owner: "FIXTURE-COMMAND",
        path: "loop-status.md::commandEvidence.<ACCEPTANCE-ID>",
      },
    ];
    await Promise.all([
      mkdir(resolve(temporaryRoot, "tools/taffy-api/tests"), { recursive: true }),
      mkdir(resolve(temporaryRoot, "tests/taffyjs-node/tests/types/FIXTURE-TYPES"), {
        recursive: true,
      }),
      mkdir(resolve(temporaryRoot, "crates/taffyjs_binding/src"), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        resolve(temporaryRoot, records[0].path),
        'contractTest("FIXTURE-JS/one", () => {});\n',
      ),
      writeFile(resolve(temporaryRoot, records[1].path), "export {};\n"),
      writeFile(
        resolve(temporaryRoot, records[2].path),
        "#[test]\nfn contract__fixture_rust__one() {}\n",
      ),
    ]);
    const fixtureStatus = {
      taskStates: Object.fromEntries(records.map(({ owner }) => [owner, "tests-authored"])),
    };
    const calls = await checker.collectStaticEvidence(
      temporaryRoot,
      { evidence: { primary: records } },
      fixtureStatus,
    );
    assert.deepEqual(
      calls.map(({ id }: { id: string }) => id).sort(),
      records.map(({ id }) => id).sort(),
    );
    checker.validateStaticCollection({}, { evidence: { primary: records } }, fixtureStatus, calls);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

contractTest("INFRA-001/incremental-all", async () => {
  const checker = await loadChecker();
  const fixture = await checker.createRepositoryFixture(root);
  for (const mutation of [
    "premature-runtime-artifact",
    "premature-declaration-artifact",
    "missing-tests-authored-registration",
    "implemented-artifact-missing",
    "verified-evidence-stale",
    "accepted-invalid-order",
    "all-incomplete-task",
    "completion-command-missing",
    "review-hash-wrong",
    "review-candidate-wrong",
    "ordinary-reviewer-slot-missing",
    "ordinary-reviewer-slot-additional",
    "ordinary-reviewer-slot-duplicate",
    "ordinary-reviewer-slot-reordered",
    "final-reviewer-slot-missing",
    "final-reviewer-slot-additional",
    "final-reviewer-slot-duplicate",
    "final-reviewer-slot-reordered",
    "ordinary-reviewer-identity-reused",
    "final-reviewer-identity-reused",
    "verdict-cell-missing",
    "verdict-cell-duplicate",
    "aggregate-only-verdict",
    "ordinary-current-task-missing",
    "ordinary-current-task-additional",
    "ordinary-current-task-duplicate",
    "ordinary-current-task-reordered",
    "final-current-task-missing",
    "final-current-task-additional",
    "final-current-task-duplicate",
    "final-current-task-reordered",
    "earlier-impact-verdict-missing",
    "blocker-unresolved",
    "major-unresolved",
    "rejection-unconfirmed",
    "minimum-node-helper-constant-missing",
    "minimum-node-helper-tag-corrupt",
    "minimum-node-helper-payload-corrupt",
    "accepted-transition-invalid",
    "complete-transition-invalid",
  ]) {
    await expectDiagnostic(
      () => checker.checkRepositoryFixture(fixture.mutate(mutation)),
      `incremental-all/${mutation}`,
    );
  }

  const evidence = {
    id: "FIXTURE/green",
    modality: "public-js",
    owner: "FIXTURE",
    path: "fixture.test.mts",
    runner: "vp run fixture",
  };
  await expectDiagnostic(
    () =>
      checker.validateCurrentEvidence(
        { evidence: { primary: [evidence] } },
        {
          candidateCommit: "candidate",
          prefixEvidenceCommit: "candidate",
          taskStates: { FIXTURE: "accepted" },
          greenEvidence: [],
        },
      ),
    "evidence-current-commit",
  );

  const contract = JSON.parse(
    await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"),
  );
  const documentedClass = contract.publicDeclarationContract.classDeclaration.members
    .map(
      ([, member]: [string, string]) =>
        `  /** Documents this public tree operation for package consumers. */\n  ${member}`,
    )
    .join("\n");
  const documented = [
    "/** Documents this public fixture symbol for package consumers. */",
    "export interface Fixture {}",
    "/** Documents the public TaffyTree class for package consumers. */",
    `${contract.publicDeclarationContract.classDeclaration.header} {`,
    documentedClass,
    "}",
  ].join("\n");
  checker.validateWholeSurfaceJsDoc(contract, documented);
  await expectDiagnostic(
    () =>
      checker.validateWholeSurfaceJsDoc(
        contract,
        documented.replace(
          "/** Documents this public tree operation for package consumers. */\n  constructor",
          "  constructor",
        ),
      ),
    "declaration-jsdoc-class-member",
  );
});
