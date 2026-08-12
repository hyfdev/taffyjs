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
  assert.equal(
    generated.numericTypeScript,
    await readFile(
      resolve(root, "packages/taffyjs-node/src/generated/numeric-families.ts"),
      "utf8",
    ),
  );
  assert.equal(
    generated.numericRust,
    await readFile(resolve(root, "crates/taffyjs_binding/src/generated_numeric.rs"), "utf8"),
  );
  assert.equal(
    generated.numericTypeFixture,
    await readFile(
      resolve(root, "tests/taffyjs-node/tests/types/INFRA-003/narrowing.test-d.ts"),
      "utf8",
    ),
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
  const contract = JSON.parse(
    await readFile(resolve(root, "tools/taffy-api/contract.json"), "utf8"),
  );
  const workspace = await readFile(resolve(root, "pnpm-workspace.yaml"), "utf8");
  const lock = await readFile(resolve(root, "pnpm-lock.yaml"), "utf8");
  const manifests = {
    ".": JSON.parse(await readFile(resolve(root, "package.json"), "utf8")),
    "packages/taffyjs-node": JSON.parse(
      await readFile(resolve(root, "packages/taffyjs-node/package.json"), "utf8"),
    ),
    "tests/taffyjs-node": JSON.parse(
      await readFile(resolve(root, "tests/taffyjs-node/package.json"), "utf8"),
    ),
  };
  const withTypesNode = { includeTypesNode: true };
  checker.validatePnpmPins(contract, workspace, lock, manifests, withTypesNode);
  await expectDiagnostic(
    () =>
      checker.validatePnpmPins(
        contract,
        workspace.replace(`typescript: ^${contract.pins.typescript}`, "typescript: ^7.0.3"),
        lock,
        manifests,
        withTypesNode,
      ),
    "pin-drift/typescript-version",
  );
  const misplacedWorkspace = workspace
    .replace(`  typescript: ^${contract.pins.typescript}\n`, "")
    .replace("overrides:\n", `overrides:\n  typescript: ^${contract.pins.typescript}\n`);
  await expectDiagnostic(
    () => checker.validatePnpmPins(contract, misplacedWorkspace, lock, manifests, withTypesNode),
    "pin-drift/typescript-version",
  );
  const driftedLock = lock.replace(
    `    typescript:\n      specifier: ^${contract.pins.typescript}\n      version: ${contract.pins.typescript}\n`,
    `    typescript:\n      specifier: ^${contract.pins.typescript}\n      version: 7.0.3\n`,
  );
  assert.notEqual(driftedLock, lock);
  await expectDiagnostic(
    () => checker.validatePnpmPins(contract, workspace, driftedLock, manifests, withTypesNode),
    "pin-drift/typescript-version",
  );
  const typescriptPackage = new RegExp(
    `(\\n  typescript@${contract.pins.typescript.replaceAll(".", "\\.")}:\\n)    resolution: \\{integrity: [^\\n]+\\}`,
    "u",
  );
  for (const resolution of ["null", "{integrity: sha512-fabricated}"]) {
    const corruptedLock = lock.replace(typescriptPackage, `$1    resolution: ${resolution}`);
    assert.notEqual(corruptedLock, lock);
    await expectDiagnostic(
      () => checker.validatePnpmPins(contract, workspace, corruptedLock, manifests, withTypesNode),
      "pin-drift/typescript-version",
    );
  }
  const missingSnapshot = lock.replace(
    `\n  typescript@${contract.pins.typescript}:\n    optionalDependencies:`,
    `\n  typescript@7.0.3:\n    optionalDependencies:`,
  );
  assert.notEqual(missingSnapshot, lock);
  await expectDiagnostic(
    () => checker.validatePnpmPins(contract, workspace, missingSnapshot, manifests, withTypesNode),
    "pin-drift/typescript-version",
  );
  const beforeInfra002 = structuredClone(manifests);
  for (const manifest of Object.values(beforeInfra002)) {
    delete manifest.devDependencies["@types/node"];
  }
  checker.validatePnpmPins(contract, workspace, lock, beforeInfra002);
  await expectDiagnostic(
    () => checker.validatePnpmPins(contract, workspace, lock, beforeInfra002, withTypesNode),
    "pin-drift/types-node-target",
  );
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
  const realSource = await checker.validateRealPinsAndSource(root, contract, {
    taskStates: { "INFRA-002": "implemented" },
  });
  checker.validateParsedSourceInventory(contract, realSource.parsed);
  const omittedReachableContract = structuredClone(contract);
  delete omittedReachableContract.namedDataShapes.Layout;
  for (const group of omittedReachableContract.namedDataGroups) {
    group.items = group.items.filter((name: string) => name !== "Layout");
  }
  const omittedReachableParsed = structuredClone(realSource.parsed) as {
    namedData: Record<string, unknown>;
  };
  delete omittedReachableParsed.namedData.Layout;
  await expectDiagnostic(
    () => checker.validateParsedSourceInventory(omittedReachableContract, omittedReachableParsed),
    "source-drift/named-data-reachability",
  );
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
        () =>
          checker.validateRealSourceInventory(root, contract, taffyRoot, realSource.archivePath),
        mutation.diagnostic,
      );
      await writeFile(path, source);
    }
    const cargoPath = resolve(taffyRoot, "Cargo.toml");
    const cargoSource = await readFile(cargoPath, "utf8");
    const decoyPath = resolve(taffyRoot, "src/contract_decoy.rs");
    await writeFile(cargoPath, `${cargoSource}\n[lib]\npath = "src/contract_decoy.rs"\n`);
    await writeFile(decoyPath, "");
    await expectDiagnostic(
      () => checker.validateRealSourceInventory(root, contract, taffyRoot, realSource.archivePath),
      "source-drift/named-data-binding",
    );
    await writeFile(cargoPath, cargoSource);
    await rm(decoyPath);
    const libPath = resolve(taffyRoot, "src/lib.rs");
    const treePath = resolve(taffyRoot, "src/tree/taffy_tree.rs");
    const libSource = await readFile(libPath, "utf8");
    const treeSource = await readFile(treePath, "utf8");
    await writeFile(libPath, `${libSource}\npub mod contract_decoy;\n`);
    await writeFile(decoyPath, "pub struct Size<T> { pub width: T, pub height: T }\n");
    await writeFile(
      treePath,
      treeSource.replace("use crate::geometry::Size;", "use crate::contract_decoy::Size;"),
    );
    await expectDiagnostic(
      () => checker.validateRealSourceInventory(root, contract, taffyRoot, realSource.archivePath),
      "source-drift/named-data-binding",
    );
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
      writeFile(
        resolve(temporaryRoot, "crates/taffyjs_binding/src/lib.rs"),
        "mod contract_tests;\n",
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
    await writeFile(
      resolve(temporaryRoot, "crates/taffyjs_binding/src/lib.rs"),
      '#[cfg(target_os = "linux")] mod contract_tests;\n',
    );
    await assert.rejects(
      () =>
        checker.collectStaticEvidence(
          temporaryRoot,
          { evidence: { primary: records } },
          fixtureStatus,
        ),
      /contract-test module must be registered exactly once without cfg/u,
    );
    await writeFile(
      resolve(temporaryRoot, "crates/taffyjs_binding/src/lib.rs"),
      '#[path = "alternate.rs"] mod contract_tests;\n',
    );
    await assert.rejects(
      () =>
        checker.collectStaticEvidence(
          temporaryRoot,
          { evidence: { primary: records } },
          fixtureStatus,
        ),
      /path override/u,
    );
    await writeFile(
      resolve(temporaryRoot, "crates/taffyjs_binding/src/lib.rs"),
      "mod contract_tests;\n",
    );
    await writeFile(
      resolve(temporaryRoot, records[2].path),
      '#![cfg(target_os = "linux")]\n#[test]\nfn contract__fixture_rust__one() {}\n',
    );
    await assert.rejects(
      () =>
        checker.collectStaticEvidence(
          temporaryRoot,
          { evidence: { primary: records } },
          fixtureStatus,
        ),
      /source file must not have cfg/u,
    );
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

  const stagedEvidence = {
    acceptanceId: evidence.id,
    candidateCommit: "candidate",
    result: "pass",
    runner: evidence.runner,
    path: evidence.path,
  };
  const finalStaging = {
    activeMilestone: "M4",
    phase: "verify",
    candidateCommit: "candidate",
    prefixEvidenceCommit: null,
    milestoneReviewCommit: null,
    commandEvidence: {},
    taskStates: { FIXTURE: "implemented" },
    greenEvidence: [stagedEvidence],
  };
  checker.validateCurrentEvidence(
    {
      tasks: [{ id: "FIXTURE", milestone: "M4" }],
      evidence: { primary: [evidence] },
    },
    finalStaging,
  );
  await expectDiagnostic(
    () =>
      checker.validateCurrentEvidence(
        {
          tasks: [{ id: "FIXTURE", milestone: "M4" }],
          evidence: { primary: [evidence] },
        },
        { ...finalStaging, phase: "build" },
      ),
    "evidence-premature",
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
  validBlocked.activeMilestone = "M0";
  validBlocked.phase = "blocked";
  validBlocked.activeTaskId = null;
  validBlocked.previousAcceptedMilestoneCommit = null;
  for (const taskId of Object.keys(validBlocked.taskStates)) {
    validBlocked.taskStates[taskId] = "pending";
  }
  validBlocked.taskStates["INFRA-001"] = "blocked";
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
  const blockerOutsideBlockedPhase = structuredClone(status);
  blockerOutsideBlockedPhase.blockers = validBlocked.blockers;
  await expectDiagnostic(
    () => checker.validateStatusShape(blockerOutsideBlockedPhase, contract, contract.generated),
    "loop-status-blocker-record",
  );
  const blockedOrder = structuredClone(validBlocked);
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
  const missingBuild = structuredClone(rootConfig.run.tasks) as Record<
    string,
    { command: string; dependsOn?: string[] }
  >;
  missingBuild.build.dependsOn = [];
  await expectDiagnostic(
    () => checker.validateRunnerTaskGraph(contract, contract.generated, status, missingBuild),
    "collection-drift/runner-graph",
  );
  const noOpReviewCompletion = structuredClone(rootConfig.run.tasks) as Record<
    string,
    { command: string; dependsOn?: string[] }
  >;
  noOpReviewCompletion["check:review-completion"].command = "echo ok";
  await expectDiagnostic(
    () =>
      checker.validateRunnerTaskGraph(contract, contract.generated, status, noOpReviewCompletion),
    "collection-drift/runner-graph",
  );
  const packageManifest = JSON.parse(
    await readFile(resolve(root, "packages/taffyjs-node/package.json"), "utf8"),
  );
  checker.validatePackageBuildScript(packageManifest);
  const noOpPackageBuild = structuredClone(packageManifest);
  noOpPackageBuild.scripts.build = "node --version";
  await expectDiagnostic(
    () => checker.validatePackageBuildScript(noOpPackageBuild),
    "collection-drift/runner-graph",
  );

  await expectDiagnostic(
    () =>
      checker.extractLoopStatus(
        `<!-- loop-status-json:start -->\n\n\`\`\`json\n{"verdict":"FAIL","verdict":"PASS"}\n\`\`\`\n\n<!-- loop-status-json:end -->\n`,
      ),
    "loop-status-duplicate-field",
  );

  const undocumented = [
    "export interface Fixture {",
    "  value: number;",
    "}",
    `${contract.publicDeclarationContract.classDeclaration.header} {`,
    contract.publicDeclarationContract.classDeclaration.members
      .map(([, member]: [string, string]) => `  ${member}`)
      .join("\n"),
    "}",
  ].join("\n");
  const documented = checker.documentPublicDeclaration(undocumented);
  checker.validateWholeSurfaceJsDoc(contract, documented);
  assert.equal(
    await checker.formatDeclaration(checker.stripDeclarationJsDoc(documented), root),
    await checker.formatDeclaration(undocumented, root),
  );
  const multilineDocumented = documented.replace(
    "/** Carries the payload for this Fixture tagged variant. */",
    "/**\n   * Carries the payload for this Fixture tagged variant.\n   */",
  );
  assert.equal(
    await checker.formatDeclaration(checker.stripDeclarationJsDoc(multilineDocumented), root),
    await checker.formatDeclaration(undocumented, root),
  );

  const publicDeclaration = await readFile(
    resolve(root, "packages/taffyjs-node/index.d.ts"),
    "utf8",
  );
  checker.validateNullableStyleJsDoc(contract, publicDeclaration);
  await expectDiagnostic(
    () =>
      checker.validateNullableStyleJsDoc(
        contract,
        publicDeclaration.replace(
          `${contract.publicDeclarationContract.styleGeneration.nullableInputJSDoc} aspectRatio?:`,
          "aspectRatio?:",
        ),
      ),
    "declaration-jsdoc-nullable-field",
  );
  await expectDiagnostic(
    () =>
      checker.validateWholeSurfaceJsDoc(
        contract,
        documented.replace(
          "/** Creates an independent Taffy tree with its own NodeId namespace. */\n  constructor",
          "  constructor",
        ),
      ),
    "declaration-jsdoc-public-member",
  );
  await expectDiagnostic(
    () =>
      checker.validateWholeSurfaceJsDoc(
        contract,
        documented.replace("  /** Carries the payload for this Fixture tagged variant. */\n", ""),
      ),
    "declaration-jsdoc-public-member",
  );
  await expectDiagnostic(
    () =>
      checker.validateWholeSurfaceJsDoc(
        contract,
        publicDeclaration.replace(
          "/** Reports which preceding floats this node must clear. */ readonly clear:",
          "/** Removes every node and context value from this tree. */ readonly clear:",
        ),
      ),
    "declaration-jsdoc-public-member",
  );
  await expectDiagnostic(
    () =>
      checker.validateWholeSurfaceJsDoc(
        contract,
        publicDeclaration.replace(
          "/** Keeps NodeId distinct from arbitrary bigint values during type checking. */ readonly [phantomMarker]",
          "/** Describes the member carried by this value. */ readonly [phantomMarker]",
        ),
      ),
    "declaration-jsdoc-public-member",
  );
});
