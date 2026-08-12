import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
  const contract = JSON.parse(
    await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"),
  );
  const realSource = await checker.validateRealPinsAndSource(root, contract);
  checker.validateParsedSourceInventory(contract, realSource.parsed);
  const metadata = realSource.metadata as {
    packages: Array<{ name: string; version: string; manifest_path: string }>;
  };
  const taffyPackage = metadata.packages.find(
    ({ name, version }: { name: string; version: string }) =>
      name === "taffy" && version === contract.pins.taffyVersion,
  );
  assert.ok(taffyPackage);
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), "taffy-api-source-"));
  const taffyRoot = resolve(temporaryRoot, "taffy");
  await cp(dirname(taffyPackage.manifest_path), taffyRoot, { recursive: true });
  const mutations = [
    {
      path: "src/tree/taffy_tree.rs",
      find: "    pub fn clear(&mut self) {",
      replace: "    fn clear(&mut self) {",
      diagnostic: "source-drift/method-missing",
    },
    {
      path: "src/tree/taffy_tree.rs",
      find: "    pub fn new() -> Self {",
      replace: "    pub fn contract_extra(&self) {}\n\n    pub fn new() -> Self {",
      diagnostic: "source-drift/method-added",
    },
    {
      path: "src/tree/taffy_tree.rs",
      find: "    pub fn clear(&mut self) {",
      replace: "    pub fn clear_renamed(&mut self) {",
      diagnostic: "source-drift/method-renamed",
    },
    {
      path: "src/tree/taffy_tree.rs",
      find: "    pub fn with_capacity(capacity: usize) -> Self {",
      replace: "    pub fn with_capacity(capacity: u64) -> Self {",
      diagnostic: "source-drift/method-signature",
    },
    {
      path: "src/tree/taffy_tree.rs",
      find: "    pub fn total_node_count(&self) -> usize {",
      replace: "    pub fn total_node_count(&self) -> u64 {",
      diagnostic: "source-drift/method-signature",
    },
    {
      path: "src/tree/taffy_tree.rs",
      find: "    pub fn clear(&mut self) {",
      replace: '    #[cfg_attr(not(feature = "grid"), cfg(any()))]\n    pub fn clear(&mut self) {',
      diagnostic: "source-drift/method-feature-gate",
    },
    {
      path: "src/tree/layout.rs",
      find: "    pub order: u32,",
      replace: "    pub contract_extra: f32,\n    pub order: u32,",
      diagnostic: "source-drift/named-data-shape",
    },
    {
      path: "src/style/mod.rs",
      find: "    /// The node is hidden, and it's children will also be hidden\n    None,",
      replace:
        "    Extra,\n    /// The node is hidden, and it's children will also be hidden\n    None,",
      diagnostic: "source-drift/named-data-shape",
    },
    {
      path: "src/style/available_space.rs",
      find: "    Definite(f32),",
      replace: "    Definite(f64),",
      diagnostic: "source-drift/named-data-shape",
    },
    {
      path: "src/style/mod.rs",
      find: '    /// The children will follow the CSS Grid layout algorithm\n    #[cfg(feature = "grid")]\n    Grid,',
      replace:
        '    /// The children will follow the CSS Grid layout algorithm\n    #[cfg(feature = "flexbox")]\n    Grid,',
      diagnostic: "source-drift/named-data-shape",
    },
    {
      path: "src/tree/taffy_tree.rs",
      find: "pub struct TaffyTreeChildIter<'a>(core::slice::Iter<'a, NodeId>);",
      replace: "pub(crate) struct TaffyTreeChildIter<'a>(core::slice::Iter<'a, NodeId>);",
      diagnostic: "source-drift/adjacent-root",
    },
  ];
  try {
    for (const mutation of mutations) {
      const path = resolve(taffyRoot, mutation.path);
      const source = await readFile(path, "utf8");
      assert.equal(source.split(mutation.find).length, 2, mutation.path);
      await writeFile(path, source.replace(mutation.find, mutation.replace));
      await expectDiagnostic(
        () => checker.validateRealSourceInventory(root, contract, taffyRoot),
        mutation.diagnostic,
      );
      await writeFile(path, source);
    }
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
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
        "// #[test]\n// fn contract__commented() {}\n#[test]\nfn contract__fixture_rust__one() {}\n",
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
  type MutableStatus = Record<string, unknown> & {
    activeTaskId: string | null;
    blockers: unknown[];
    candidateCommit: string;
    closures: unknown[];
    findings: unknown[];
    phase: string;
    remainingMinorFindings: unknown[];
    reports: Array<{ reviewerIdentity: string }>;
    taskStates: Record<string, string>;
    verdicts: Array<Record<string, unknown> & { verdict: string }>;
  };
  const status = checker.extractLoopStatus(
    await readFile(resolve(root, ".agents/docs/loop-status.md"), "utf8"),
  ) as MutableStatus;
  const validBlocked = structuredClone(status);
  validBlocked.phase = "blocked";
  validBlocked.activeTaskId = null;
  validBlocked.taskStates["INFRA-001"] = "blocked";
  validBlocked.taskStates["INFRA-002"] = "pending";
  validBlocked.blockers = [
    {
      taskId: "INFRA-001",
      category: "external-tool-barrier",
      evidence: ["The same external service failed in three distinct attempts."],
      attempts: ["attempt one evidence", "attempt two evidence", "attempt three evidence"],
      requiredDecision: "Restore the external service, then resume INFRA-001.",
    },
  ];
  validBlocked.nextAction = "Restore the external service, then resume INFRA-001.";
  checker.validateStatusShape(validBlocked, contract, contract.generated);
  const missingBlockerEvidence = structuredClone(validBlocked);
  missingBlockerEvidence.blockers = [];
  await expectDiagnostic(
    () => checker.validateStatusShape(missingBlockerEvidence, contract, contract.generated),
    "loop-status-blocker-record",
  );
  const tooFewAttempts = structuredClone(validBlocked);
  (tooFewAttempts.blockers[0] as { attempts: string[] }).attempts.pop();
  await expectDiagnostic(
    () => checker.validateStatusShape(tooFewAttempts, contract, contract.generated),
    "loop-status-blocker-record",
  );
  const blockedOrder = structuredClone(status);
  blockedOrder.phase = "build";
  blockedOrder.activeTaskId = "INFRA-002";
  blockedOrder.taskStates["INFRA-001"] = "blocked";
  blockedOrder.taskStates["INFRA-002"] = "active";
  await expectDiagnostic(
    () => checker.validateStatusShape(blockedOrder, contract, contract.generated),
    "loop-status-blocked-task",
  );

  const review = structuredClone(status);
  const reviewCandidate = "a".repeat(40);
  const reviewTasks = [...contract.milestones.M0];
  const reviewSlots = contract.reviewPolicy.perTaskVerdictMatrix.ordinaryReviewerSlots.map(
    ({ slot }: { slot: string }) => slot,
  );
  const reviewProjection = {
    contractBaseCommit: review.contractBaseCommit,
    candidateCommit: reviewCandidate,
    previousAcceptedMilestoneCommit: null,
    activeMilestone: "M0",
    reviewRoundId: "M0-fixture-round",
    currentTaskIds: reviewTasks,
    reviewerSlots: reviewSlots,
    inspectionCommands: ["git diff --check"],
  };
  const reviewHash = createHash("sha256")
    .update(checker.serializeReviewInputProjection(reviewProjection))
    .digest("hex");
  Object.assign(review, reviewProjection, {
    reviewedCommits: {
      contractBaseCommit: reviewProjection.contractBaseCommit,
      previousCommit: null,
      candidateCommit: reviewCandidate,
    },
    reviewInputProjection: reviewProjection,
    reviewInputStatusHash: reviewHash,
  });
  review.reports = reviewSlots.map((slot: string, index: number) => ({
    slot,
    reviewerIdentity: `fixture-reviewer-${index}`,
    startCandidateCommit: reviewCandidate,
    endCandidateCommit: reviewCandidate,
    startReviewInputStatusHash: reviewHash,
    endReviewInputStatusHash: reviewHash,
    earlierImpact: [],
    inspectedEvidence: ["fixture evidence"],
  }));
  review.verdicts = reviewTasks.flatMap((taskId: string) =>
    reviewSlots.map((slot: string) => ({
      taskId,
      slot,
      verdict: "PASS",
      candidateCommit: reviewCandidate,
      reviewInputStatusHash: reviewHash,
    })),
  );
  review.findings = [];
  review.closures = [];
  review.blockers = [];
  review.remainingMinorFindings = [];
  checker.validateActualReviewRecord(contract, review);
  review.findings = [
    {
      id: "FIXTURE-FINDING",
      reviewerIdentity: review.reports[0].reviewerIdentity,
      taskId: "INFRA-001",
      severity: "major",
      disposition: "fixed",
      fixCommit: "0000000000000000000000000000000000000000",
    },
  ];
  review.closures = [
    {
      findingId: "FIXTURE-FINDING",
      reviewerIdentity: review.reports[0].reviewerIdentity,
      candidateCommit: review.candidateCommit,
      confirmed: true,
    },
  ];
  await expectDiagnostic(
    () => checker.validateActualReviewRecord(contract, review),
    "review-finding-fix-commit",
  );

  const rootConfig = (await import("../../../vite.config.ts")).default;
  assert.ok(rootConfig.run?.tasks);
  const tasks = structuredClone(rootConfig.run.tasks) as Record<
    string,
    { command: string; dependsOn?: string[] }
  >;
  checker.validateRunnerTaskGraph(contract, contract.generated, status, tasks);
  tasks["check:test:integration"].command = "node --version";
  await expectDiagnostic(
    () => checker.validateRunnerTaskGraph(contract, contract.generated, status, tasks),
    "collection-drift/runner-graph",
  );

  const documentedClass = contract.publicDeclarationContract.classDeclaration.members
    .map(
      ([, member]: [string, string]) =>
        `  /** Documents this public tree operation for package consumers. */\n  ${member}`,
    )
    .join("\n");
  const documented = [
    "/** Documents this public fixture symbol for package consumers. */",
    "export interface Fixture {",
    "  /** Documents this public fixture member for package consumers. */",
    "  value: number;",
    "}",
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
    "declaration-jsdoc-public-member",
  );
  await expectDiagnostic(
    () =>
      checker.validateWholeSurfaceJsDoc(
        contract,
        documented.replace(
          "  /** Documents this public fixture member for package consumers. */\n",
          "",
        ),
      ),
    "declaration-jsdoc-public-member",
  );
});
