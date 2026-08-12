# @taffyjs/node Maturity Loop Goal

[VOUCHED @hyfdev 2026-08-12]

This is a draft unattended-run contract. The run must not start until Yunfei vouches this entire file with a stamp immediately below the title. Once vouched, no AI may edit this file, tick its checkboxes, weaken its criteria, or add a replacement contract. Progress belongs only in `loop-status.md`. A contract conflict must stop the run for Yunfei rather than being repaired in place.

## Goal

Make `@taffyjs/node` a complete, safe, typed, documented, and package-consumable binding for the pinned Taffy 0.13 high-level `TaffyTree` usage surface. Completion requires durable proof that every in-scope upstream API and every transitive public value is implemented or explicitly excluded, every required JavaScript API has verified declarations and observable behavior, supported misuse cannot panic or corrupt native state, and no required task or material review finding remains unresolved.

“Mature enough to use” in this run means that a Node application on the build host can install the locally packed package, use every documented API through the public ESM entry, and rely on the contracts in this file. It does not mean that the package has been published, that a semver or license policy has been selected, or that binaries have been released for every declared napi-rs target.

## Run boundary

The run changes only this repository and only work needed for `@taffyjs/node`, its private native adapter, its tests, its documentation, its build, and its contract checks. It may add small repository-local generation or verification tools required below.

The run must not publish packages, push commits, open a pull request, create a release, choose a public license or non-placeholder release version, remove `private: true`, or claim remote platform evidence that was not actually produced. Those actions require separate human direction.

The run must not add Yoga compatibility, CSS parsing, serde transport, low-level Taffy tree traits, JavaScript-owned custom trees, retained per-node measure callbacks, async or off-thread layout, cancellation, output caches, lazy values, selector or query builders, selective queries, prepared queries, batch APIs, live native views, runtime snapshot freezing, or automatic layout computation from getters or mutations. The researched output optimizations remain deferred exactly as recorded in [Output optimization research](output-optimization-research.md). That record is informational only: none of those optimizations is a task, acceptance dependency, maturity requirement, permitted substitute for a complete eager snapshot, or implementation target in this run.

The run must preserve Taffy as the only owner of topology, Style, Layout, cache, and computation state. JavaScript may own only the public wrapper, binding-issued NodeId metadata, exact caller-owned context values, ordinary immutable constants, and temporary converted values.

## Authority and pinned baseline

This vouched file is the highest authority for this run. Existing vouched rulings in [@taffyjs/node decisions](taffyjs-node-decisions.md) remain binding except for one explicit spelling replacement: the exact class signature below applies the later human-approved get-prefix rule and replaces the older `nodeContext(node)` spelling with `getNodeContext(node)` without changing the vouched context semantics. Any other actual conflict blocks the run. [Taffy-to-Node binding mapping](binding-mapping.md) supplies the general derivation method, and [Binding mapping cases](binding-cases.md) supplies the three completed worked examples and exact value-shape rationale. Every reference to those supporting records means their content at the clean contract-base commit recorded when this vouched file starts the run; later edits cannot silently change this contract. Unstamped research may explain but cannot override it.

The executable upstream baseline is the crates.io `taffy` package version `0.13.0` with Cargo checksum `c034e05f6ee85a12daa63863c2245797715075c70649947aa0da54f3f2ab1d0f`. Upstream commit `45a56299d366ddb383e593a1f0372158d00e8530` is the stable provenance link used by this record; Cargo metadata cannot independently prove a crates.io archive-to-git-commit relation, so the checker must not claim that it did. Taffy's default feature group remains enabled. Cargo currently resolves the exact feature set `alloc`, `block_layout`, `calc`, `content_size`, `default`, `detailed_layout_info`, `flexbox`, `float_layout`, `grid`, `std`, and `taffy_tree`; the checker compares this resolved set rather than only the nine functional members written in Taffy's `default` definition. The public Style vocabulary still excludes calc; retaining the compiled feature does not make calc reachable through the supported API.

The native-tool baseline is `napi 3.12.0`, `napi-derive 3.6.2`, `napi-build 2.4.0`, and `@napi-rs/cli 3.8.2`. M0 must express the four Rust crate requirements as exact Cargo requirements `=3.12.0`, `=3.6.2`, `=2.4.0`, and `=0.13.0`, not compatible ranges, and the checker must compare them with the lockfile. The declaration-tool baseline is the lockfile-selected TypeScript `7.0.2` CLI and oxfmt `0.61.0`; the broader JavaScript workflow remains Vite+. The supported runtime baseline for this run is Node.js `>=22.18.0`, ESM only. Compatibility with the lower bound is executable evidence rather than only `engines` metadata: Vite+'s managed runtime must execute the packed consumer under exact Node `22.18.0`. `implementationDependencyTargets` is different from an initialization pin: the contract base may still contain its preimplementation version, but once the owning task reaches `implemented`, the checker requires the exact target in authored dependency declarations and the lockfile and invalidates all later evidence on drift.

The current napi-rs build-target declaration remains `x86_64-apple-darwin`, `aarch64-apple-darwin`, `x86_64-pc-windows-msvc`, and `x86_64-unknown-linux-gnu`. The run must add reproducible CI jobs for these targets, locally verify the current host, and locally execute the current-host packed consumer under exact Node `22.18.0`. It must not treat an unexecuted remote job as evidence, and absence of authorization to push does not prevent source maturity: the final handover must distinguish locally proven behavior from release-platform verification still awaiting an authorized remote run.

Any change to the pinned Taffy version, checksum, feature set, Node minimum, module format, napi-rs versions, TypeScript declaration compiler or formatter version, public package boundary, or target declaration is outside this contract and blocks the run. Internal development-tool dependencies may be added only when required by a task below, must be pinned through the repository lockfile, and must survive the code-quality review.

## Formal completeness model

The implementation must create one checked-in machine-readable contract at `tools/taffy-api/contract.json` and one executable checker owned by `tools/taffy-api/`. The JSON must be generated deterministically from the single canonical JSON block in this section; hand editing it is forbidden, and generated drift fails. The generator extracts exactly one block between the `taffy-contract-json` markers, parses it with an ordinary JSON parser, validates `schemaVersion`, and writes a canonical key-sorted serialization. It must not infer catalog data from prose, Markdown tables, headings, code blocks, or backtick patterns. The surrounding tables and TODO prose are a human-reviewed mirror fixed by the whole-file vouch, not a runtime machine input. `INFRA-001/task-drift` checks the canonical JSON's internal references and its generated status, artifact, evidence, and test projections; it never parses the mirror. This file wins if a human-readable mirror disagrees. The checker must run from the root readiness graph and fail before tests when the pin, source inventory, public symbol inventory, task links, acceptance links, or required test collection is incomplete.

Let `U` be the upstream items in the source inventories below, `P` the public runtime and declaration symbols in this file, `T` the required task IDs, `A(t)` the acceptance assertions for task `t`, and `E(a)` the reproducible evidence linked to assertion `a`. The checker and reviews must enforce all of the following conditions:

```text
For every u in U, its exact normalized Rust signature or data shape and exactly one disposition exist: implement, covered-by(T), absorbed-by(T), or exclude(reason).
For every implemented or absorbed u, exactly one required task owns its completion evidence.
For every p in P, exactly one required task owns its implementation, declaration, documentation, and export evidence.
For every required t in T, A(t) is non-empty and the task belongs to exactly one milestone.
For every a in A(t), E(a) contains at least one collected automated test or machine check; a manual exception requires an exact reproducible command and rationale in this file.
For every recursively reachable Rust public field, enum variant, and variant payload, an exact machine-readable source shape and disposition exists.
For every Style field, enum member, tagged-union variant, Layout field, and DetailedLayoutInfo field, at least one named assertion and test ID exists.
Every NodeId input position in the packed declaration and every public mutation has an exact canonical generated-test bijection.
No source item, public symbol, task, assertion, test ID, review finding, or milestone may remain unclassified, decision-required, pending, or silently deferred at completion.
```

The source checker must locate Taffy through `cargo metadata`, verify exact-version Cargo requirements plus the lockfile version, checksum, default-feature setting, and resolved features, parse that checksum-pinned Rust source rather than an ephemeral hard-coded registry path, and compare the active `TaffyTree` methods and recursively reachable public data with the canonical sets below. `U` is closed as 34 inherent `TaffyTree` methods with exact parsed signatures, three adjacent concrete `TraversePartialTree for TaffyTree<NodeContext>` operations with exact parsed signatures, 48 reachable named-data definitions with every public field/variant/payload and effective feature gate, and four exact adjacent roots. The explicitly listed non-root conveniences and all other value-type associated items are outside `U`; their scope records prevent a grouped pseudo-item from masquerading as source inventory. The checker records the provenance commit string without representing it as independently verified package identity. A small `syn`-based repository tool is preferred over nightly rustdoc JSON or regex-only parsing. It must inspect actual registered test cases rather than text occurrence. Vite+ tests use a static `contractTest(id, fn)` registration that the checker parses and a machine-readable reporter; Rust evidence is matched against `cargo test -- --list` plus results; declaration and machine-check evidence uses the exact commands in the evidence index. The checker assembles and formats the expected declaration solely from `publicDeclarationContract`, requires the packed declaration's JSDoc-stripped formatted skeleton to match it byte-for-byte, independently verifies nullable and whole-surface JSDoc requirements, and makes the pinned TypeScript CLI typecheck both expected and actual declarations plus the canonical type fixtures. It never accepts declarations inferred from implementation code, tests, prose, or another generated file. It rejects required `.skip`, `.todo`, conditional registration, duplicate IDs, an uncollected file, a retry, and `--passWithNoTests`.

Incremental enforcement is exact by task state plus commit attestation. `pending` and `active` require only their immutable catalog entries, and their owned runtime export, class member, declaration export, documentation entry, and generated region must not yet be public. `tests-authored` additionally requires every owned test ID to be statically registered exactly once without skip, todo, conditional registration, or retry, but those tests are expected to be able to fail. `implemented` additionally requires the task's projected public and generated artifacts to exist exactly, while tests may remain red only until the current milestone's verification sweep. `verified` and `under-review` require every owned ID to have executed and passed exactly once on `candidateCommit`. `accepted` is immutable scheduling history for a completed milestone, not a claim that an older test result still attests a newer commit. Current validity requires `prefixEvidenceCommit === candidateCommit` and, at milestone acceptance, `milestoneReviewCommit === candidateCommit`; any implementation-affecting commit clears both attestations and all command evidence without creating an impossible task-order rollback. Unexpected or prematurely published artifacts always fail. `--all` ignores scheduling states and requires the complete final catalog, artifacts, collection, and all non-command evidence; it validates command-attestation definitions but cannot require the result of the command that is currently running. The subsequent `check:completion` requires the remaining command evidence before any M4 task becomes `verified`. The current public surface is therefore the exact projection owned by previously accepted tasks plus current tasks at `implemented` or later, not the final `P` during every intermediate milestone.

The checked-in contract must record source file, Rust name, exact normalized method signature, normalized item and member feature gates, every recursively reachable public field and enum variant including payload types, disposition, owning task, acceptance IDs, generated test-ID rules, uniquely resolved primary evidence modality and path, documentation location, milestone order, exact public declaration shape, public artifact ownership, and JavaScript-only conveniences. Changing Taffy or its feature set must produce a source-inventory diff that blocks ordinary implementation until Yunfei supplies a new vouched contract.

The following block is the sole machine-readable catalog. Compact disposition strings are schema-defined: `implement:<task>`, `absorbed:<task>`, `covered-by:<task>`, `absorbed-by:<task>`, and `exclude:<reason-key>`. An empty named-data `features` list means the item is unconditional once its containing module is compiled; a nonempty list names all required active features. Member `cfg` expressions are exactly `true`, `{ "feature": "name" }`, `{ "all": [cfg, ...] }`, `{ "any": [cfg, ...] }`, or `{ "not": cfg }`; an absent field/variant `cfg` entry means `true`, and the source checker normalizes Rust `cfg` into that form before comparison. Field and payload type strings are parsed as Rust types and compared structurally after path normalization rather than compared as source text. Variant maps contain `null` for a fieldless variant, an array for positional payload types, or an object for named payload fields. A generated contract expands evidence and documentation rules to concrete records, rejects an unknown field or rule key, proves every grouped item is unique, follows alias targets when checking reachability, and retains reasons rather than silently dropping compact data.

<!-- taffy-contract-json:start -->

```json
{
  "schemaVersion": 10,
  "pins": {
    "taffyVersion": "0.13.0",
    "taffyChecksum": "c034e05f6ee85a12daa63863c2245797715075c70649947aa0da54f3f2ab1d0f",
    "taffyCommit": "45a56299d366ddb383e593a1f0372158d00e8530",
    "taffyDefaultFeatures": true,
    "taffyResolvedFeatures": [
      "alloc",
      "block_layout",
      "calc",
      "content_size",
      "default",
      "detailed_layout_info",
      "flexbox",
      "float_layout",
      "grid",
      "std",
      "taffy_tree"
    ],
    "napi": "3.12.0",
    "napiDerive": "3.6.2",
    "napiBuild": "2.4.0",
    "napiCli": "3.8.2",
    "typescript": "7.0.2",
    "oxfmt": "0.61.0",
    "node": ">=22.18.0",
    "minimumNodeTestRuntime": "22.18.0",
    "moduleFormat": "esm"
  },
  "implementationDependencyTargets": {
    "INFRA-002": { "@types/node": "22.18.0" }
  },
  "targets": [
    "x86_64-apple-darwin",
    "aarch64-apple-darwin",
    "x86_64-pc-windows-msvc",
    "x86_64-unknown-linux-gnu"
  ],
  "platformPackages": {
    "x86_64-apple-darwin": {
      "name": "@taffyjs/binding-darwin-x64",
      "binary": "taffyjs.darwin-x64.node"
    },
    "aarch64-apple-darwin": {
      "name": "@taffyjs/binding-darwin-arm64",
      "binary": "taffyjs.darwin-arm64.node"
    },
    "x86_64-pc-windows-msvc": {
      "name": "@taffyjs/binding-win32-x64-msvc",
      "binary": "taffyjs.win32-x64-msvc.node"
    },
    "x86_64-unknown-linux-gnu": {
      "name": "@taffyjs/binding-linux-x64-gnu",
      "binary": "taffyjs.linux-x64-gnu.node"
    }
  },
  "tarballContents": {
    "root": [
      "package/package.json",
      "package/README.md",
      "package/index.js",
      "package/index.d.ts",
      "package/native.js"
    ],
    "rootManifest": {
      "owner": "INFRA-002",
      "engines": { "node": ">=22.18.0" }
    },
    "platform": ["package/package.json", "package/README.md", "package/<target-binary>"]
  },
  "milestones": {
    "M0": ["INFRA-001", "INFRA-002"],
    "M1": [
      "INFRA-004",
      "INFRA-003",
      "TYPE-NUMBER-001",
      "TYPE-GEOMETRY-001",
      "TYPE-LENGTH-001",
      "TYPE-AVAILABLE-001",
      "TYPE-GRID-001",
      "TYPE-STYLE-001"
    ],
    "M2": [
      "TYPE-NODEID-001",
      "TYPE-LAYOUT-001",
      "TYPE-DETAIL-001",
      "TYPE-MEASURE-001",
      "API-TREE-001",
      "API-TREE-020",
      "API-TREE-004",
      "API-TREE-023",
      "API-TREE-024",
      "API-TREE-007",
      "API-TREE-006",
      "API-TREE-019",
      "API-TREE-021",
      "API-TREE-022",
      "API-TREE-018",
      "API-TREE-011",
      "API-TREE-012",
      "API-TREE-013",
      "API-TREE-014",
      "API-TREE-015",
      "API-TREE-016",
      "API-TREE-017",
      "API-TREE-005",
      "API-TREE-010",
      "API-TREE-009",
      "API-TREE-031",
      "API-TREE-030",
      "API-TREE-025",
      "API-TREE-026",
      "API-TREE-002",
      "API-TREE-003",
      "API-TREE-027",
      "API-TREE-028",
      "API-TREE-029",
      "API-TREE-008"
    ],
    "M3": [
      "TEST-STYLE-001",
      "TEST-COMMON-NODEID",
      "TEST-COMMON-ATOMICITY",
      "TEST-TYPES-001",
      "TEST-ALGORITHMS-001"
    ],
    "M4": ["MATURITY-001", "MATURITY-002", "MATURITY-003"]
  },
  "milestonePrerequisites": {
    "M0": [],
    "M1": ["M0"],
    "M2": ["M1"],
    "M3": ["M2"],
    "M4": ["M3"]
  },
  "reviewPolicy": {
    "mode": "milestone-delta-with-prefix-evidence",
    "m4UsesFinalReviewers": true,
    "perTaskVerdictMatrix": {
      "ordinaryMilestones": ["M0", "M1", "M2", "M3"],
      "ordinaryReviewerSlots": [
        { "slot": "broad-1", "kind": "broad", "focus": "free-adversarial" },
        { "slot": "broad-2", "kind": "broad", "focus": "free-adversarial" },
        {
          "slot": "quality",
          "kind": "quality",
          "focus": "code-cleanliness-quality-elegance"
        }
      ],
      "finalMilestone": "M4",
      "ordinaryReviewerSlotIdsSource": "reviewPolicy.perTaskVerdictMatrix.ordinaryReviewerSlots[*].slot",
      "finalReviewerSlotIdsSource": "reviewPolicy.finalRoles",
      "reviewerSlotsRule": "For M0 through M3, the status reviewerSlots array must equal ordinaryReviewerSlotIdsSource exactly in length, values, and order; for M4 it must equal finalReviewerSlotIdsSource. Missing, additional, duplicate, or reordered slots reject before hashing or review.",
      "reviewerIdentityRule": "Each canonical slot is occupied by exactly one distinct fresh subagent identity for the entire round. One subagent cannot occupy or report for multiple slots, and one slot cannot combine identities.",
      "currentTaskIdsSource": "milestones[activeMilestone]",
      "currentTaskIdsRule": "The status currentTaskIds array must equal its canonical source exactly in length, values, and order before hashing or review. Missing, additional, duplicate, or reordered task IDs reject for every milestone.",
      "requiredCells": "After currentTaskIdsRule, reviewerSlotsRule, and reviewerIdentityRule pass, form the exact Cartesian product of currentTaskIds and reviewerSlots. Reviewer counts are derived only from the selected canonical slot array. Every cell contains exactly one explicit PASS or FAIL naming the same candidate commit and review-input hash.",
      "noAggregateSubstitution": "A milestone-level, report-level, or suite-level verdict cannot satisfy, infer, or replace any per-task cell. Missing or duplicate cells fail review completion."
    },
    "sameRoundInput": "candidate commit, previous commit, contract-base commit, task list, commands, reviewer slots, and review-input projection are identical for every reviewer in one round",
    "reviewInputStatusHash": {
      "projectionKeys": [
        "contractBaseCommit",
        "candidateCommit",
        "previousAcceptedMilestoneCommit",
        "activeMilestone",
        "reviewRoundId",
        "currentTaskIds",
        "reviewerSlots",
        "inspectionCommands"
      ],
      "serialization": "Create one ordinary object containing exactly projectionKeys in that order, recursively sort every nested object key by ASCII code-point order while retaining array order, serialize with JSON.stringify in the required Node >=22.18 runtime without a replacer or space, and append no newline.",
      "algorithm": "SHA-256 over the UTF-8 serialization bytes, lowercase 64-hex output",
      "selfExclusion": "reviewInputStatusHash, reports, verdicts, findings, closures, and nextAction are not projection keys",
      "reportRule": "Every reviewer receives the exact projection bytes and hash, recomputes and records the hash at both review start and review end, and records the immutable candidate commit at both points."
    },
    "candidateReadRule": "Review source, declarations, tests, and documentation only from the committed candidate tree or a clean reviewer worktree detached at that candidate; never read implementation bytes from the mutable implementing worktree. The implementing agent freezes all source and status writes until the all-reviewers-complete barrier.",
    "outcomeWriteBarrier": "do not write any report, verdict, finding, or report-derived next action to loop-status until every reviewer in the round has completed, including reviewers launched in later concurrency waves",
    "postReviewValidation": {
      "command": "vp run check:review-completion",
      "recursive": false,
      "runAfter": "write all outcomes together, resolve required findings, and write the proposed milestoneReviewCommit and accepted task states; M0 through M3 retain the reviewed milestone with phase=review until this command passes, while M4 proposes phase=complete",
      "validates": [
        "review-input projection and hash",
        "reviewerSlots exact ordered equality with the milestone's canonical slot source and one distinct subagent identity per slot",
        "start and end candidate and review-input hashes",
        "currentTaskIds exact ordered equality with milestones[activeMilestone], the exact per-task Cartesian verdict matrix, and every required earlier-impact verdict",
        "finding disposition, fix commit, and originating-reviewer closure",
        "prefixEvidenceCommit, milestoneReviewCommit, candidateCommit, task states, and phase transition"
      ],
      "terminalRule": "A failed command invalidates the proposed transition. After a pass, M0 through M3 may only initialize the next milestone while retaining the validated review record; after the final M4 pass, loop-status and implementation state remain unchanged.",
      "falseGreenOwner": "INFRA-001/incremental-all"
    },
    "finalRoles": [
      "upstream-api-source",
      "runtime-safety",
      "typescript-usability",
      "code-quality",
      "package-reproducibility"
    ],
    "isolation": "no-inherited-turns-no-agent-status-tools"
  },
  "taskStatePolicy": {
    "states": [
      "pending",
      "active",
      "tests-authored",
      "implemented",
      "verified",
      "under-review",
      "accepted",
      "blocked"
    ],
    "artifactProjectionStartsAt": "implemented",
    "testRegistrationStartsAt": "tests-authored",
    "greenEvidenceStartsAt": "verified",
    "acceptedIsSchedulingHistory": true,
    "commitAttestations": ["candidateCommit", "prefixEvidenceCommit", "milestoneReviewCommit"],
    "candidateChangeClears": ["prefixEvidenceCommit", "milestoneReviewCommit", "commandEvidence"],
    "finalMode": "all",
    "finalCommandEvidenceMode": "--all validates command-attestation definitions and every non-command result; check:completion validates the later exact-command results; after review outcomes and proposed state transitions exist, check:review-completion validates the review record and terminal state nonrecursively"
  },
  "rustSignaturePolicy": {
    "parser": "syn",
    "implHeaderSyntax": "empty Rust item impl",
    "methodSyntax": "Rust Signature without visibility or body",
    "ignored": ["attributes", "visibility", "non-receiver argument patterns"],
    "compared": [
      "constness",
      "asyncness",
      "unsafety",
      "abi",
      "receiver form, lifetime, and mutability",
      "generic parameter kind, order, bounds, and defaults",
      "argument type order and variadic marker",
      "return type",
      "where predicates"
    ],
    "normalization": [
      "alpha-rename declared generic parameters by position",
      "replace each non-receiver argument pattern with its positional index",
      "normalize Rust type paths by the named-data path rules",
      "compare parsed structure rather than tokens or whitespace"
    ]
  },
  "documentationRule": ".agents/docs/loop-goal.md::<TASK-ID>",
  "primaryEvidenceRules": {
    "expandedOrdinaryAcceptanceCount": 317,
    "expandedPrimaryAcceptanceCount": 926,
    "resolution": "An ordinary acceptance uses its exact acceptance override when present, otherwise its task default. A generated acceptance uses the single matching generatedModalityOverride when one exists, otherwise its generated-family modality. An exact acceptance path override wins before an owner path override. The checker expands every acceptance to exactly one modality, runner, path, and collected identity and rejects an unknown, missing, or multiply declared override.",
    "modalities": {
      "public-js": {
        "runner": "vp run check:test:integration",
        "identity": "contractTest(<ACCEPTANCE-ID>, fn)",
        "pathRule": "runtimeEvidencePathRules"
      },
      "native-js": {
        "runner": "vp run check:test:native",
        "identity": "contractTest(<ACCEPTANCE-ID>, fn)",
        "pathRule": "runtimeEvidencePathRules"
      },
      "wrapper-js": {
        "runner": "vp run check:test:wrapper",
        "identity": "contractTest(<ACCEPTANCE-ID>, fn)",
        "path": "packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts",
        "rule": "The test imports the authored production-private wrapper module, uses only the canonical random-source and next-serial injection seam, and calls the same wrapper and release native owner as production. No test implementation or package export is permitted."
      },
      "minimum-node-js": {
        "runner": "vp run check:test:node-minimum",
        "identity": "contractTest(<ACCEPTANCE-ID>, fn)",
        "path": "tests/taffyjs-node/minimum-node/MATURITY-002.test.mjs",
        "rule": "The entire harness runs through vp env exec --node 22.18.0, first asserts process.version, creates its own empty consumer, installs only the freshly packed local tarballs without registry fallback, imports only @taffyjs/node, executes the minimumNodeCompatibility projection, and emits exactly one machine-readable document containing the primary harness result and every required secondary result. Its .test.mjs path is not collected by the ordinary .test.mts integration runner."
      },
      "types": {
        "runner": "vp run check:test:types",
        "identity": "<ACCEPTANCE-ID>",
        "path": "tests/taffyjs-node/tests/types/<TASK-ID>/<SLUG>.test-d.ts"
      },
      "rust-contract": {
        "runner": "cargo test -p taffyjs_binding --lib",
        "identity": "contract_tests::contract__<TASK-ID-LOWER-SNAKE>__<SLUG-LOWER-SNAKE>",
        "identityNormalization": "ASCII lowercase and replace each hyphen with underscore",
        "path": "crates/taffyjs_binding/src/contract_tests.rs",
        "compileTimeRule": "Properties such as owner shape and !Send are asserted while this private crate test module compiles; a runtime assertion alone cannot satisfy them."
      },
      "machine-check": {
        "runner": "vp run check:contract:self-test",
        "identity": "<ACCEPTANCE-ID>",
        "path": "tools/taffy-api/tests/<TASK-ID>.test.mts"
      },
      "command-attestation": {
        "runner": "vp run check:completion",
        "identity": "<ACCEPTANCE-ID>",
        "path": "loop-status.md::commandEvidence.<ACCEPTANCE-ID>",
        "rule": "The completion checker requires the exact canonical command, candidate commit, UTC start and finish timestamps, exit code zero, complete UTF-8 combined stdout/stderr bytes in observed order retained inside commandEvidence, and their matching lowercase 64-hex SHA-256. A missing, nonzero, altered, or stale record fails. The attested command cannot invoke check:completion or consume its own record."
      }
    },
    "taskDefaults": {
      "default": "public-js",
      "overrides": {
        "INFRA-001": "machine-check",
        "INFRA-003": "native-js",
        "INFRA-004": "native-js",
        "TYPE-NUMBER-001": "native-js",
        "TYPE-GEOMETRY-001": "native-js",
        "TYPE-LENGTH-001": "native-js",
        "TYPE-AVAILABLE-001": "native-js",
        "TYPE-GRID-001": "native-js",
        "TYPE-STYLE-001": "native-js",
        "TEST-TYPES-001": "types"
      }
    },
    "acceptanceOverrides": {
      "API-TREE-001/rng-failure": "wrapper-js",
      "API-TREE-001/generic": "types",
      "API-TREE-010/generic": "types",
      "API-TREE-018/declaration": "types",
      "API-TREE-021/declaration": "types",
      "API-TREE-022/readonly": "types",
      "API-TREE-024/reusable-input": "types",
      "API-TREE-024/readonly": "types",
      "API-TREE-025/readonly": "types",
      "API-TREE-026/readonly": "types",
      "API-TREE-027/narrowing": "types",
      "INFRA-003/narrowing": "types",
      "INFRA-004/owner-shape": "rust-contract",
      "TYPE-NODEID-001/opaque": "types",
      "TYPE-NODEID-001/rng": "wrapper-js",
      "TYPE-NODEID-001/serial-boundary": "wrapper-js",
      "TYPE-GEOMETRY-001/declarations": "types",
      "TYPE-GEOMETRY-001/readonly": "types",
      "TYPE-LENGTH-001/forms": "public-js",
      "TYPE-LENGTH-001/helper-materialization": "public-js",
      "TYPE-LENGTH-001/narrowing": "types",
      "TYPE-AVAILABLE-001/variants": "public-js",
      "TYPE-AVAILABLE-001/helper-materialization": "public-js",
      "TYPE-AVAILABLE-001/narrowing": "types",
      "TYPE-AVAILABLE-001/readonly-reuse": "types",
      "TYPE-GRID-001/families": "public-js",
      "TYPE-GRID-001/minmax": "public-js",
      "TYPE-GRID-001/repeat-lines": "public-js",
      "TYPE-GRID-001/helper-materialization": "public-js",
      "TYPE-LAYOUT-001/readonly": "types",
      "TYPE-LAYOUT-001/order-u32": "native-js",
      "TYPE-DETAIL-001/narrowing": "types",
      "TYPE-MEASURE-001/non-send": "rust-contract",
      "MATURITY-002/minimum-node": "minimum-node-js",
      "MATURITY-003/local-green": "command-attestation"
    },
    "generatedModalities": {
      "style": "public-js",
      "nodeIdScalar": "public-js",
      "nodeIdCollectionValid": "public-js",
      "nodeIdCollectionInvalid": "public-js",
      "atomicity": "public-js"
    },
    "generatedModalityOverrides": [
      {
        "family": "atomicity",
        "selector": { "failureKind": "node-id-serial-exhaustion" },
        "modality": "wrapper-js"
      }
    ],
    "generatedModalityOverrideRule": "The only valid selector shape in this schema is family=atomicity with exactly one failureKind key. Match it against the expanded publicMutationFailuresByOwner failure kind. Zero matches use generatedModalities; more than one match, an unknown selector key, family, failure kind, or modality fails generation.",
    "minimumNodeCompatibility": {
      "runtime": "22.18.0",
      "runner": "vp run check:test:node-minimum",
      "sourcePrimaryModality": "public-js",
      "sourceOwnerPrefixes": ["API-TREE-", "TYPE-", "TEST-"],
      "expandedSecondaryAcceptanceCount": 816,
      "secondaryAcceptanceIdentity": "<PRIMARY-ACCEPTANCE-ID>::node-22.18.0",
      "secondaryAcceptanceRule": "Expand every ordinary and generated acceptance whose resolved primary modality is public-js and whose canonical evidence owner begins API-TREE-, TYPE-, or TEST- exactly once. This is the complete package-facing API, value-type, common-contract, and real-layout catalog; infrastructure, documentation, packaging, CI, and the minimum-runtime harness itself are not recursively projected. Deterministically bundle the exact registered contractTest body and every required non-test child fixture into a portable ESM artifact set, keep @taffyjs/node external, install and resolve that external only from the empty packed consumer, and execute the same inputs and assertions under the exact minimum runtime. There is no separately authored minimum-runtime expectation or implementation.",
      "surfaceInventorySources": ["publicRuntimeExportsByOwner", "publicClassMembersByOwner"],
      "expandedSurfaceProbeCount": 58,
      "surfaceProbeIdentity": "MATURITY-002/minimum-node::surface/<runtime-export|class-member>/<OWNER>/<NAME>",
      "valueHelperCoverageAcceptanceIdsByExport": {
        "Dimension": ["TYPE-LENGTH-001/forms", "TYPE-LENGTH-001/helper-materialization"],
        "AvailableSpace": [
          "TYPE-AVAILABLE-001/variants",
          "TYPE-AVAILABLE-001/helper-materialization"
        ],
        "GridPlacement": ["TYPE-GRID-001/families", "TYPE-GRID-001/helper-materialization"],
        "TrackSizingFunction": [
          "TYPE-GRID-001/families",
          "TYPE-GRID-001/minmax",
          "TYPE-GRID-001/helper-materialization"
        ],
        "RepetitionCount": [
          "TYPE-GRID-001/families",
          "TYPE-GRID-001/repeat-lines",
          "TYPE-GRID-001/helper-materialization"
        ],
        "GridTemplateComponent": [
          "TYPE-GRID-001/families",
          "TYPE-GRID-001/repeat-lines",
          "TYPE-GRID-001/helper-materialization"
        ]
      },
      "surfaceProbeRule": "Derive exactly one coverage probe for each of the 27 runtime exports and 31 class members. A class-member probe designates and observes an executed secondary acceptance owned by that member's task and fails if no such public-js acceptance invokes the member. A runtime-export probe imports the exact export through the packed public entry: TaffyTree must exist and construct; each numeric family must exist, be frozen, have exactly its canonical own member keys, and match every canonical numeric code; each of the six public value helpers must exist and its probe passes only when every exact mapped public-js secondary identity in valueHelperCoverageAcceptanceIdsByExport passes. The checker requires the map's keys to equal those six helper exports, every mapped ID to exist, resolve to public-js, enter this minimum-runtime projection, and assert exact own keys, tags, payloads, constants, frozen namespace/constants, and fresh mutable constructor records. There is no bare invoke/read probe and no separately authored minimum-runtime fixture or expected value.",
      "resultRule": "The one result document records exact runtime and tarball hashes, the sorted 816 secondary acceptance identities and results, and the sorted 58 surface probe identities and results. Missing, duplicate, additional, skipped, conditional, retried, failed, current-runtime, workspace-imported, or non-packed-package records fail collection.",
      "sameArtifactRule": "The current-runtime integration run and minimum-runtime projection use the same registered public-js test bodies. Bundling may adapt module loading only; it must not bundle, transform, alias, or replace @taffyjs/node, change a test expectation, or create another binding implementation."
    },
    "commandAttestations": {
      "MATURITY-003/local-green": {
        "command": "vp run ready",
        "workingDirectory": ".",
        "requiredCandidate": "candidateCommit",
        "forbiddenInvocation": "vp run check:completion"
      }
    }
  },
  "runtimeEvidencePathRules": {
    "apiTaskPrefix": "API-TREE-",
    "api": "tests/taffyjs-node/tests/api/<TASK-ID>.test.mts",
    "default": "tests/taffyjs-node/tests/contract/<TASK-ID>.test.mts",
    "collectionRootsByModality": {
      "public-js": "tests/taffyjs-node/",
      "native-js": "packages/taffyjs-node/tests/native/"
    },
    "collectionRootRule": "After exact-acceptance, owner, API-prefix, or default path resolution, every public-js path must be below the public root and every native-js path must be below the native root. An override never waives this check.",
    "acceptanceOverrides": {
      "TYPE-LENGTH-001/forms": "tests/taffyjs-node/tests/contract/TYPE-LENGTH-001.test.mts",
      "TYPE-LENGTH-001/helper-materialization": "tests/taffyjs-node/tests/contract/TYPE-LENGTH-001.test.mts",
      "TYPE-AVAILABLE-001/variants": "tests/taffyjs-node/tests/contract/TYPE-AVAILABLE-001.test.mts",
      "TYPE-AVAILABLE-001/helper-materialization": "tests/taffyjs-node/tests/contract/TYPE-AVAILABLE-001.test.mts",
      "TYPE-GRID-001/families": "tests/taffyjs-node/tests/contract/TYPE-GRID-001.test.mts",
      "TYPE-GRID-001/minmax": "tests/taffyjs-node/tests/contract/TYPE-GRID-001.test.mts",
      "TYPE-GRID-001/repeat-lines": "tests/taffyjs-node/tests/contract/TYPE-GRID-001.test.mts",
      "TYPE-GRID-001/helper-materialization": "tests/taffyjs-node/tests/contract/TYPE-GRID-001.test.mts",
      "TYPE-LAYOUT-001/order-u32": "packages/taffyjs-node/tests/native/TYPE-LAYOUT-001.test.mts"
    },
    "acceptanceOverrideIntegrityFixture": {
      "owner": "INFRA-001/task-drift",
      "acceptanceIds": [
        "TYPE-LENGTH-001/forms",
        "TYPE-LENGTH-001/helper-materialization",
        "TYPE-AVAILABLE-001/variants",
        "TYPE-AVAILABLE-001/helper-materialization",
        "TYPE-GRID-001/families",
        "TYPE-GRID-001/minmax",
        "TYPE-GRID-001/repeat-lines",
        "TYPE-GRID-001/helper-materialization"
      ],
      "mutation": "For each listed ID independently, remove its exact path override so that its native owner override wins.",
      "requiredResult": "The checker rejects the public-js modality plus native collection-root mismatch before test execution."
    },
    "overrides": {
      "INFRA-002": "tests/taffyjs-node/tests/package/INFRA-002.test.mts",
      "INFRA-003": "packages/taffyjs-node/tests/native/INFRA-003.test.mts",
      "INFRA-004": "packages/taffyjs-node/tests/native/INFRA-004.test.mts",
      "TYPE-NUMBER-001": "packages/taffyjs-node/tests/native/TYPE-NUMBER-001.test.mts",
      "TYPE-GEOMETRY-001": "packages/taffyjs-node/tests/native/TYPE-GEOMETRY-001.test.mts",
      "TYPE-LENGTH-001": "packages/taffyjs-node/tests/native/TYPE-LENGTH-001.test.mts",
      "TYPE-AVAILABLE-001": "packages/taffyjs-node/tests/native/TYPE-AVAILABLE-001.test.mts",
      "TYPE-GRID-001": "packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts",
      "TYPE-STYLE-001": "packages/taffyjs-node/tests/native/TYPE-STYLE-001.test.mts",
      "TEST-STYLE-001": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts",
      "MATURITY-001": "tests/taffyjs-node/tests/docs/MATURITY-001.test.mts",
      "MATURITY-002": "tests/taffyjs-node/tests/package/MATURITY-002.test.mts",
      "MATURITY-003": "tests/taffyjs-node/tests/package/MATURITY-003.test.mts"
    }
  },
  "taskAcceptances": {
    "API-TREE-001": ["construct", "rng-failure", "generic", "export-boundary"],
    "API-TREE-002": ["select-rounded", "reenable", "no-compute"],
    "API-TREE-003": ["select-unrounded", "repeat-toggle", "no-compute"],
    "API-TREE-004": ["default-style", "nondefault-style", "stable-id", "conversion-atomic"],
    "API-TREE-005": [
      "identity",
      "primitive-null-undefined",
      "removal-cleanup",
      "callback-delivery",
      "conversion-atomic"
    ],
    "API-TREE-006": [
      "empty",
      "ordered-children",
      "duplicate",
      "attached",
      "invalid-id",
      "failure-atomic"
    ],
    "API-TREE-007": ["empty-tree", "leaf-tree", "ids-stale", "serial-monotonic"],
    "API-TREE-008": [
      "remove-root",
      "remove-child",
      "id-stale",
      "parent-not-dirtied",
      "invalid-atomic"
    ],
    "API-TREE-009": [
      "replace-identity",
      "undefined-clears",
      "null-present",
      "always-dirty",
      "measure-delivery",
      "invalid-atomic"
    ],
    "API-TREE-010": ["absence", "identity", "manual-dirty", "generic", "invalid-id"],
    "API-TREE-011": ["append", "dirty", "topology-reject", "id-roles", "failure-atomic"],
    "API-TREE-012": ["positions", "end-bound", "index-errors", "id-roles", "failure-atomic"],
    "API-TREE-013": [
      "replace-order",
      "reparent",
      "detach-omitted",
      "dirty",
      "topology-reject",
      "invalid-middle",
      "failure-atomic"
    ],
    "API-TREE-014": ["detach", "nonchild", "dirty", "id-roles", "failure-atomic"],
    "API-TREE-015": ["positions", "returned-id", "bounds", "integer", "failure-atomic"],
    "API-TREE-016": [
      "ranges",
      "detached-live",
      "range-errors",
      "extra-properties",
      "failure-atomic"
    ],
    "API-TREE-017": [
      "replace",
      "returned-id",
      "dirty",
      "same-noop",
      "reject",
      "id-roles",
      "failure-atomic"
    ],
    "API-TREE-018": ["positions", "bounds", "integer", "invalid-parent", "declaration"],
    "API-TREE-019": ["empty", "topology-sequence", "number-result", "invalid-parent"],
    "API-TREE-020": ["initial", "leaf-clear", "number-result"],
    "API-TREE-021": [
      "root-null",
      "attached",
      "transitions",
      "slot-reuse",
      "invalid-id",
      "declaration"
    ],
    "API-TREE-022": [
      "empty",
      "ordered",
      "stable-ids",
      "detached-array",
      "readonly",
      "invalid-parent"
    ],
    "API-TREE-023": [
      "complete-replace",
      "undefined-null",
      "unknown-calc",
      "conversion-families",
      "dirty",
      "failure-atomic",
      "invalid-id"
    ],
    "API-TREE-024": [
      "exact-keys",
      "null-output",
      "stored-f32",
      "deep-detached",
      "reusable-input",
      "independent-snapshots",
      "readonly",
      "invalid-id"
    ],
    "API-TREE-025": [
      "exact-zero",
      "rounding-selection",
      "stale-stored",
      "detached",
      "readonly",
      "numeric-widening",
      "invalid-id"
    ],
    "API-TREE-026": [
      "exact-zero",
      "fractional",
      "stale-stored",
      "detached",
      "readonly",
      "invalid-id"
    ],
    "API-TREE-027": [
      "new-none",
      "empty-grid",
      "grid-payload",
      "deep-detached",
      "narrowing",
      "invalid-id",
      "stale-upstream"
    ],
    "API-TREE-028": [
      "propagation",
      "idempotent",
      "layout-retained",
      "child-nuance",
      "any-node",
      "invalid-id"
    ],
    "API-TREE-029": [
      "lifecycle",
      "style",
      "context",
      "topology",
      "explicit",
      "child-nuance",
      "invalid-id"
    ],
    "API-TREE-030": [
      "callback-args",
      "result-f32",
      "cache-calls",
      "same-tree-busy",
      "js-only-reentry",
      "different-tree",
      "throw-identity",
      "malformed-result",
      "zero-drain",
      "layout-nontransactional",
      "context-identity",
      "recovery"
    ],
    "API-TREE-031": [
      "algorithms",
      "percentage-content",
      "stored-output",
      "cache",
      "rounding",
      "invalid-root",
      "invalid-space",
      "no-measure",
      "wrapper-atomic"
    ],
    "INFRA-001": [
      "generate",
      "pin-drift",
      "source-drift",
      "task-drift",
      "collection-drift",
      "incremental-all"
    ],
    "INFRA-002": ["source-entry", "private-native", "pack-entry", "foundation-exports"],
    "INFRA-003": ["generate-check", "codes", "frozen", "narrowing", "raw-literal", "invalid-code"],
    "INFRA-004": [
      "owner-shape",
      "taxonomy",
      "busy-unit",
      "expected-reuse",
      "panic-poisons",
      "process-survives"
    ],
    "TYPE-NODEID-001": [
      "js-identity",
      "malformed",
      "foreign",
      "stale-clear",
      "slot-reuse",
      "realm-copy",
      "rng",
      "serial-boundary",
      "opaque"
    ],
    "TYPE-NUMBER-001": ["number-only", "f32-truth", "f32-special", "integer-bounds", "no-coercion"],
    "TYPE-GEOMETRY-001": [
      "declarations",
      "style-partial",
      "components",
      "style-shape-errors",
      "scalar-scope",
      "readonly",
      "detached-reuse"
    ],
    "TYPE-LENGTH-001": [
      "forms",
      "helper-conversion",
      "narrowing",
      "percent-scale",
      "f32-special",
      "invalid-shape",
      "auto-extra",
      "canonical",
      "aggregate",
      "helper-materialization"
    ],
    "TYPE-AVAILABLE-001": [
      "axis-record",
      "variants",
      "helper-conversion",
      "definite-value",
      "content-extra",
      "f32-special",
      "narrowing",
      "readonly-reuse",
      "whole-value-errors",
      "helper-materialization"
    ],
    "TYPE-GRID-001": [
      "families",
      "helper-conversion",
      "minmax",
      "repeat-lines",
      "panic-guard",
      "integers",
      "strings",
      "ownership",
      "areas-null",
      "canonical",
      "extra-fields",
      "no-css-validation",
      "helper-materialization"
    ],
    "TYPE-STYLE-001": [
      "field-set",
      "default-dispatch",
      "nullable-dispatch",
      "container-shape",
      "unknown-calc",
      "complete-before-native",
      "eager-output"
    ],
    "TEST-STYLE-001": ["bijection", "enum-members", "callback-equivalence", "no-freeze-cache"],
    "TYPE-LAYOUT-001": [
      "zero",
      "f32-special",
      "order-u32",
      "exact-keys",
      "detached",
      "readonly",
      "shared-converter"
    ],
    "TYPE-DETAIL-001": ["variants", "narrowing", "numeric-widening", "detached", "lifecycle"],
    "TYPE-MEASURE-001": [
      "args-owned",
      "result-sync",
      "failure-state",
      "env-lifetime",
      "non-send",
      "no-retention"
    ],
    "TEST-COMMON-NODEID": ["role-bijection", "controlled-errors", "no-panic"],
    "TEST-COMMON-ATOMICITY": ["mutation-bijection", "state-equality", "callback-exception"],
    "TEST-TYPES-001": [
      "exports-signatures",
      "valid-invalid",
      "node-enum",
      "mutability",
      "context-nullish",
      "private-absent"
    ],
    "TEST-ALGORITHMS-001": [
      "block-float",
      "flex",
      "grid",
      "measure-context",
      "topology-cache",
      "public-only"
    ],
    "MATURITY-001": ["symbol-bijection", "semantic-rules", "examples", "raw-literal-doc"],
    "MATURITY-002": [
      "workspace-import",
      "tarball-consumer",
      "minimum-node",
      "contents",
      "cleanup",
      "isolation",
      "unsupported-platform",
      "private-path"
    ],
    "MATURITY-003": ["ready-graph", "no-empty-suite", "local-green", "ci-targets", "handover-truth"]
  },
  "publicRuntimeExportsByOwner": {
    "API-TREE-001": ["TaffyTree"],
    "INFRA-003": [
      "Display",
      "BoxSizing",
      "Direction",
      "Overflow",
      "Float",
      "Clear",
      "Position",
      "TextAlign",
      "FlexDirection",
      "FlexWrap",
      "GridAutoFlow",
      "AlignItems",
      "AlignContent",
      "LengthUnit",
      "AvailableSpaceKind",
      "GridPlacementKind",
      "TrackSizingKind",
      "RepetitionCountKind",
      "GridTemplateComponentKind",
      "DetailedLayoutInfoKind"
    ],
    "TYPE-LENGTH-001": ["Dimension"],
    "TYPE-AVAILABLE-001": ["AvailableSpace"],
    "TYPE-GRID-001": [
      "GridPlacement",
      "TrackSizingFunction",
      "RepetitionCount",
      "GridTemplateComponent"
    ]
  },
  "publicDeclarationExportsByOwner": {
    "API-TREE-001": ["TaffyTree"],
    "TYPE-NODEID-001": ["NodeId"],
    "API-TREE-016": ["ChildRangeInput"],
    "INFRA-003": [
      "EnumValue",
      "Display",
      "BoxSizing",
      "Direction",
      "Overflow",
      "Float",
      "Clear",
      "Position",
      "TextAlign",
      "FlexDirection",
      "FlexWrap",
      "GridAutoFlow",
      "AlignItems",
      "AlignContent",
      "LengthUnit",
      "AvailableSpaceKind",
      "GridPlacementKind",
      "TrackSizingKind",
      "RepetitionCountKind",
      "GridTemplateComponentKind",
      "DetailedLayoutInfoKind"
    ],
    "TYPE-GEOMETRY-001": [
      "PointInput",
      "PartialPointInput",
      "Point",
      "SizeInput",
      "PartialSizeInput",
      "Size",
      "RectInput",
      "PartialRectInput",
      "Rect",
      "LineInput",
      "PartialLineInput",
      "Line"
    ],
    "TYPE-LENGTH-001": [
      "LengthInput",
      "PercentInput",
      "AutoInput",
      "LengthPercentageInput",
      "LengthPercentageAutoInput",
      "DimensionInput",
      "LengthPercentage",
      "LengthPercentageAuto",
      "Dimension"
    ],
    "TYPE-AVAILABLE-001": ["AvailableSpaceInput", "AvailableSpace"],
    "TYPE-GRID-001": [
      "GridPlacementInput",
      "GridPlacement",
      "MinTrackSizingFunctionInput",
      "MinTrackSizingFunction",
      "MaxTrackSizingFunctionInput",
      "MaxTrackSizingFunction",
      "TrackSizingFunctionInput",
      "TrackSizingFunction",
      "RepetitionCountInput",
      "RepetitionCount",
      "GridTemplateRepetitionInput",
      "GridTemplateRepetition",
      "GridTemplateComponentInput",
      "GridTemplateComponent",
      "GridTemplateAreasInput",
      "GridTemplateAreas",
      "GridTemplateAreaInput",
      "GridTemplateArea"
    ],
    "TYPE-STYLE-001": ["StyleInput", "Style"],
    "TYPE-LAYOUT-001": ["Layout"],
    "TYPE-DETAIL-001": [
      "DetailedLayoutInfo",
      "DetailedGridInfo",
      "DetailedGridTracksInfo",
      "DetailedGridItemInfo"
    ],
    "TYPE-MEASURE-001": ["MeasureArgs", "MeasureFunction"],
    "API-TREE-030": ["ComputeLayoutWithMeasureOptions"],
    "API-TREE-031": ["ComputeLayoutOptions"]
  },
  "publicClassMembersByOwner": {
    "API-TREE-001": ["constructor"],
    "API-TREE-002": ["enableRounding"],
    "API-TREE-003": ["disableRounding"],
    "API-TREE-004": ["newLeaf"],
    "API-TREE-005": ["newLeafWithContext"],
    "API-TREE-006": ["newWithChildren"],
    "API-TREE-007": ["clear"],
    "API-TREE-008": ["remove"],
    "API-TREE-009": ["setNodeContext"],
    "API-TREE-010": ["getNodeContext"],
    "API-TREE-011": ["addChild"],
    "API-TREE-012": ["insertChildAtIndex"],
    "API-TREE-013": ["setChildren"],
    "API-TREE-014": ["removeChild"],
    "API-TREE-015": ["removeChildAtIndex"],
    "API-TREE-016": ["removeChildrenRange"],
    "API-TREE-017": ["replaceChildAtIndex"],
    "API-TREE-018": ["getChildAtIndex"],
    "API-TREE-019": ["getChildCount"],
    "API-TREE-020": ["getNodeCount"],
    "API-TREE-021": ["getParent"],
    "API-TREE-022": ["getChildren"],
    "API-TREE-023": ["setStyle"],
    "API-TREE-024": ["getStyle"],
    "API-TREE-025": ["getLayout"],
    "API-TREE-026": ["getUnroundedLayout"],
    "API-TREE-027": ["getDetailedLayoutInfo"],
    "API-TREE-028": ["markDirty"],
    "API-TREE-029": ["isDirty"],
    "API-TREE-030": ["computeLayoutWithMeasure"],
    "API-TREE-031": ["computeLayout"]
  },
  "publicDeclarationContract": {
    "compiler": "the repository-pinned TypeScript 7.0.2 CLI",
    "formatter": "the repository-pinned oxfmt 0.61.0 stdin formatter",
    "serialization": {
      "assemblyOrder": [
        "privateSupportStatements",
        "INFRA-003.fixed",
        "INFRA-003.numeric",
        "TYPE-NODEID-001.fixed",
        "TYPE-GEOMETRY-001.generated",
        "TYPE-LENGTH-001.fixed",
        "TYPE-AVAILABLE-001.fixed",
        "TYPE-GRID-001.fixed",
        "TYPE-STYLE-001.generated",
        "TYPE-LAYOUT-001.fixed",
        "TYPE-DETAIL-001.fixed",
        "TYPE-MEASURE-001.fixed",
        "API-TREE-016.fixed",
        "API-TREE-030.fixed",
        "API-TREE-031.fixed",
        "API-TREE-001.class"
      ],
      "privateSupportOwner": "TYPE-NODEID-001",
      "templateRule": "Replace every {{name}} placeholder exactly once from its named scalar; join generated member, component, and property declaration arrays with one ASCII space; reject an unknown, missing, or leftover placeholder.",
      "unformattedSeparator": "two LF characters between declaration statements",
      "formatCommand": "vp exec oxfmt --stdin-filepath index.d.ts",
      "lineEnding": "LF",
      "finalNewline": true,
      "incrementalProjection": "omit a fixed or generated owner section until its owner is at implemented or later; once the class owner exists, include only class members whose own owners are at implemented or later"
    },
    "comparison": {
      "unit": "complete formatted declaration skeleton bytes",
      "expected": "assemble only from this object and the referenced canonical arrays, remove JSDoc with the projection below, run the formatCommand once, and retain stdout in memory",
      "actual": "packages/taffyjs-node/index.d.ts must already satisfy vp fmt --check; remove JSDoc with the same projection, format the result, and match expected byte-for-byte",
      "jsDocProjection": "A lexical TypeScript scanner removes only /** ... */ comments while preserving strings and every non-JSDoc token. It rejects an unterminated comment or string and every @deprecated, @internal, @private, @protected, or @experimental tag. Before removal, exactly the eight nullable StyleInput properties must each have the exact nullableInputJSDoc as their immediately adjacent JSDoc. MATURITY-001 separately requires meaningful JSDoc coverage for every public symbol and member; those additional comments do not change declaration shape.",
      "typecheck": "both the complete expected declaration and the packed actual declaration must pass the compiler with strict, noEmit, and exactOptionalPropertyTypes",
      "effect": "a missing, added, reordered, or changed declaration, export, member, overload, generic, parameter, type, optional marker, readonly marker, or return type rejects; nullable JSDoc and whole-surface JSDoc coverage reject through their separate exact checks"
    },
    "privateSupportStatements": ["declare const phantomMarker: unique symbol;"],
    "fixedStatementsByOwner": {
      "API-TREE-016": ["export interface ChildRangeInput { start: number; end: number; }"],
      "INFRA-003": [
        "export type EnumValue<Family extends Readonly<Record<string, number>>> = Family[keyof Family];"
      ],
      "TYPE-NODEID-001": ["export type NodeId = bigint & { readonly [phantomMarker]: never };"],
      "TYPE-LENGTH-001": [
        "export type LengthInput = { unit: typeof LengthUnit.Length; value: number };",
        "export type PercentInput = { unit: typeof LengthUnit.Percent; value: number };",
        "export type AutoInput = { unit: typeof LengthUnit.Auto };",
        "export type LengthPercentageInput = LengthInput | PercentInput;",
        "export type LengthPercentageAutoInput = LengthInput | PercentInput | AutoInput;",
        "export type DimensionInput = LengthPercentageAutoInput;",
        "export type LengthPercentage = Readonly<LengthInput> | Readonly<PercentInput>;",
        "export type LengthPercentageAuto = Readonly<LengthInput> | Readonly<PercentInput> | Readonly<AutoInput>;",
        "export type Dimension = LengthPercentageAuto;",
        "export declare const Dimension: Readonly<{ readonly Length: (value: number) => LengthInput; readonly Percent: (value: number) => PercentInput; readonly Auto: Readonly<AutoInput>; }>;"
      ],
      "TYPE-AVAILABLE-001": [
        "export type AvailableSpaceInput = { kind: typeof AvailableSpaceKind.Definite; value: number } | { kind: typeof AvailableSpaceKind.MinContent } | { kind: typeof AvailableSpaceKind.MaxContent };",
        "export type AvailableSpace = Readonly<{ kind: typeof AvailableSpaceKind.Definite; value: number }> | Readonly<{ kind: typeof AvailableSpaceKind.MinContent }> | Readonly<{ kind: typeof AvailableSpaceKind.MaxContent }> ;",
        "export declare const AvailableSpace: Readonly<{ readonly Definite: (value: number) => { kind: typeof AvailableSpaceKind.Definite; value: number }; readonly MinContent: Readonly<{ kind: typeof AvailableSpaceKind.MinContent }>; readonly MaxContent: Readonly<{ kind: typeof AvailableSpaceKind.MaxContent }>; }>;"
      ],
      "TYPE-GRID-001": [
        "export type GridPlacementInput = { kind: typeof GridPlacementKind.Auto } | { kind: typeof GridPlacementKind.Line; index: number } | { kind: typeof GridPlacementKind.NamedLine; name: string; index: number } | { kind: typeof GridPlacementKind.Span; span: number } | { kind: typeof GridPlacementKind.NamedSpan; name: string; span: number };",
        "export type GridPlacement = Readonly<{ kind: typeof GridPlacementKind.Auto }> | Readonly<{ kind: typeof GridPlacementKind.Line; index: number }> | Readonly<{ kind: typeof GridPlacementKind.NamedLine; name: string; index: number }> | Readonly<{ kind: typeof GridPlacementKind.Span; span: number }> | Readonly<{ kind: typeof GridPlacementKind.NamedSpan; name: string; span: number }> ;",
        "export type MinTrackSizingFunctionInput = { kind: typeof TrackSizingKind.Length; value: number } | { kind: typeof TrackSizingKind.Percent; value: number } | { kind: typeof TrackSizingKind.Auto } | { kind: typeof TrackSizingKind.MinContent } | { kind: typeof TrackSizingKind.MaxContent };",
        "export type MinTrackSizingFunction = Readonly<{ kind: typeof TrackSizingKind.Length; value: number }> | Readonly<{ kind: typeof TrackSizingKind.Percent; value: number }> | Readonly<{ kind: typeof TrackSizingKind.Auto }> | Readonly<{ kind: typeof TrackSizingKind.MinContent }> | Readonly<{ kind: typeof TrackSizingKind.MaxContent }> ;",
        "export type MaxTrackSizingFunctionInput = MinTrackSizingFunctionInput | { kind: typeof TrackSizingKind.FitContent; value: LengthPercentageInput } | { kind: typeof TrackSizingKind.Fr; value: number };",
        "export type MaxTrackSizingFunction = MinTrackSizingFunction | Readonly<{ kind: typeof TrackSizingKind.FitContent; value: LengthPercentage }> | Readonly<{ kind: typeof TrackSizingKind.Fr; value: number }> ;",
        "export interface TrackSizingFunctionInput { min: MinTrackSizingFunctionInput; max: MaxTrackSizingFunctionInput; }",
        "export interface TrackSizingFunction { readonly min: MinTrackSizingFunction; readonly max: MaxTrackSizingFunction; }",
        "export type RepetitionCountInput = { kind: typeof RepetitionCountKind.Count; value: number } | { kind: typeof RepetitionCountKind.AutoFill } | { kind: typeof RepetitionCountKind.AutoFit };",
        "export type RepetitionCount = Readonly<{ kind: typeof RepetitionCountKind.Count; value: number }> | Readonly<{ kind: typeof RepetitionCountKind.AutoFill }> | Readonly<{ kind: typeof RepetitionCountKind.AutoFit }> ;",
        "export interface GridTemplateRepetitionInput { count: RepetitionCountInput; tracks: TrackSizingFunctionInput[]; lineNames: string[][]; }",
        "export interface GridTemplateRepetition { readonly count: RepetitionCount; readonly tracks: readonly TrackSizingFunction[]; readonly lineNames: readonly (readonly string[])[]; }",
        "export type GridTemplateComponentInput = { kind: typeof GridTemplateComponentKind.Single; value: TrackSizingFunctionInput } | { kind: typeof GridTemplateComponentKind.Repeat; value: GridTemplateRepetitionInput };",
        "export type GridTemplateComponent = Readonly<{ kind: typeof GridTemplateComponentKind.Single; value: TrackSizingFunction }> | Readonly<{ kind: typeof GridTemplateComponentKind.Repeat; value: GridTemplateRepetition }> ;",
        "export interface GridTemplateAreasInput { areas: GridTemplateAreaInput[]; rowCount: number; columnCount: number; }",
        "export interface GridTemplateAreas { readonly areas: readonly GridTemplateArea[]; readonly rowCount: number; readonly columnCount: number; }",
        "export interface GridTemplateAreaInput { name: string; rowStart: number; rowEnd: number; columnStart: number; columnEnd: number; }",
        "export interface GridTemplateArea { readonly name: string; readonly rowStart: number; readonly rowEnd: number; readonly columnStart: number; readonly columnEnd: number; }",
        "export declare const GridPlacement: Readonly<{ readonly Auto: Readonly<{ kind: typeof GridPlacementKind.Auto }>; readonly Line: (index: number) => { kind: typeof GridPlacementKind.Line; index: number }; readonly NamedLine: (name: string, index: number) => { kind: typeof GridPlacementKind.NamedLine; name: string; index: number }; readonly Span: (span: number) => { kind: typeof GridPlacementKind.Span; span: number }; readonly NamedSpan: (name: string, span: number) => { kind: typeof GridPlacementKind.NamedSpan; name: string; span: number }; }>;",
        "export declare const TrackSizingFunction: Readonly<{ readonly Length: (value: number) => TrackSizingFunctionInput; readonly Percent: (value: number) => TrackSizingFunctionInput; readonly Auto: Readonly<{ readonly min: Readonly<{ kind: typeof TrackSizingKind.Auto }>; readonly max: Readonly<{ kind: typeof TrackSizingKind.Auto }>; }>; readonly MinContent: Readonly<{ readonly min: Readonly<{ kind: typeof TrackSizingKind.MinContent }>; readonly max: Readonly<{ kind: typeof TrackSizingKind.MinContent }>; }>; readonly MaxContent: Readonly<{ readonly min: Readonly<{ kind: typeof TrackSizingKind.MaxContent }>; readonly max: Readonly<{ kind: typeof TrackSizingKind.MaxContent }>; }>; readonly FitContent: (value: LengthPercentageInput) => TrackSizingFunctionInput; readonly Fr: (value: number) => TrackSizingFunctionInput; readonly MinMax: (min: MinTrackSizingFunctionInput, max: MaxTrackSizingFunctionInput) => TrackSizingFunctionInput; }>;",
        "export declare const RepetitionCount: Readonly<{ readonly Count: (value: number) => { kind: typeof RepetitionCountKind.Count; value: number }; readonly AutoFill: Readonly<{ kind: typeof RepetitionCountKind.AutoFill }>; readonly AutoFit: Readonly<{ kind: typeof RepetitionCountKind.AutoFit }>; }>;",
        "export declare const GridTemplateComponent: Readonly<{ readonly Single: (value: TrackSizingFunctionInput) => { kind: typeof GridTemplateComponentKind.Single; value: TrackSizingFunctionInput }; readonly Repeat: (count: RepetitionCountInput, tracks: TrackSizingFunctionInput[], lineNames?: string[][]) => { kind: typeof GridTemplateComponentKind.Repeat; value: GridTemplateRepetitionInput }; }>;"
      ],
      "TYPE-LAYOUT-001": [
        "export interface Layout { readonly order: number; readonly location: Point<number>; readonly size: Size<number>; readonly contentSize: Size<number>; readonly scrollbarSize: Size<number>; readonly border: Rect<number>; readonly padding: Rect<number>; readonly margin: Rect<number>; }"
      ],
      "TYPE-DETAIL-001": [
        "export type DetailedLayoutInfo = Readonly<{ kind: typeof DetailedLayoutInfoKind.None }> | Readonly<{ kind: typeof DetailedLayoutInfoKind.Grid; value: DetailedGridInfo }> ;",
        "export interface DetailedGridInfo { readonly rows: DetailedGridTracksInfo; readonly columns: DetailedGridTracksInfo; readonly items: readonly DetailedGridItemInfo[]; }",
        "export interface DetailedGridTracksInfo { readonly negativeImplicitTracks: number; readonly explicitTracks: number; readonly positiveImplicitTracks: number; readonly gutters: readonly number[]; readonly sizes: readonly number[]; }",
        "export interface DetailedGridItemInfo { readonly rowStart: number; readonly rowEnd: number; readonly columnStart: number; readonly columnEnd: number; }"
      ],
      "TYPE-MEASURE-001": [
        "export type MeasureArgs<TContext> = Readonly<{ knownDimensions: Size<number | undefined>; availableSpace: Size<AvailableSpace>; node: NodeId; context: TContext | undefined; style: Style; }>;",
        "export type MeasureFunction<TContext> = (args: MeasureArgs<TContext>) => SizeInput<number>;"
      ],
      "API-TREE-030": [
        "export interface ComputeLayoutWithMeasureOptions<TContext> { root: NodeId; availableSpace: SizeInput<AvailableSpaceInput>; measure: MeasureFunction<TContext>; }"
      ],
      "API-TREE-031": [
        "export interface ComputeLayoutOptions { root: NodeId; availableSpace: SizeInput<AvailableSpaceInput>; }"
      ]
    },
    "numericFamilyGeneration": {
      "source": "numericFamilies",
      "familyOrderSource": "publicRuntimeExportsByOwner.INFRA-003",
      "owner": "INFRA-003",
      "grouping": "per-family",
      "statementOrder": ["value", "type"],
      "indexRule": "zero-based array index",
      "memberTemplate": "readonly {{member}}: {{index}};",
      "valueTemplate": "export declare const {{family}}: Readonly<{ {{memberDeclarations}} }>;",
      "typeTemplate": "export type {{family}} = EnumValue<typeof {{family}}>;"
    },
    "geometryGeneration": {
      "owner": "TYPE-GEOMETRY-001",
      "familyOrder": ["Point", "Size", "Rect", "Line"],
      "grouping": "per-family",
      "statementOrder": ["input", "partialInput", "output"],
      "families": {
        "Point": ["x", "y"],
        "Size": ["width", "height"],
        "Rect": ["left", "right", "top", "bottom"],
        "Line": ["start", "end"]
      },
      "inputComponentTemplate": "{{component}}: T;",
      "partialInputComponentTemplate": "{{component}}?: T | undefined;",
      "outputComponentTemplate": "readonly {{component}}: T;",
      "inputTemplate": "export interface {{family}}Input<T> { {{componentDeclarations}} }",
      "partialInputTemplate": "export interface Partial{{family}}Input<T> { {{componentDeclarations}} }",
      "outputTemplate": "export interface {{family}}<T> { {{componentDeclarations}} }"
    },
    "styleGeneration": {
      "owner": "TYPE-STYLE-001",
      "rowOrderSource": "styleFields",
      "statementOrder": ["input", "output"],
      "inputPropertyTemplate": "{{nullableJSDocIfRequired}}{{field}}?: {{inputType}} | undefined;",
      "outputPropertyTemplate": "readonly {{field}}: {{outputType}};",
      "inputTemplate": "export interface StyleInput { {{propertyDeclarations}} }",
      "outputTemplate": "export interface Style { {{propertyDeclarations}} }",
      "nullableInputJSDoc": "/** Omission or undefined uses the Taffy default; null stores Taffy None. */",
      "nullableInputJSDocFieldsSource": "nullableStyleFields",
      "typesByField": {
        "display": ["Display", "Display"],
        "itemIsTable": ["boolean", "boolean"],
        "itemIsReplaced": ["boolean", "boolean"],
        "boxSizing": ["BoxSizing", "BoxSizing"],
        "direction": ["Direction", "Direction"],
        "overflow": ["PartialPointInput<Overflow>", "Point<Overflow>"],
        "scrollbarWidth": ["number", "number"],
        "float": ["Float", "Float"],
        "clear": ["Clear", "Clear"],
        "position": ["Position", "Position"],
        "inset": [
          "LengthPercentageAutoInput | PartialRectInput<LengthPercentageAutoInput>",
          "Rect<LengthPercentageAuto>"
        ],
        "size": ["DimensionInput | PartialSizeInput<DimensionInput>", "Size<Dimension>"],
        "minSize": ["DimensionInput | PartialSizeInput<DimensionInput>", "Size<Dimension>"],
        "maxSize": ["DimensionInput | PartialSizeInput<DimensionInput>", "Size<Dimension>"],
        "aspectRatio": ["number | null", "number | null"],
        "margin": [
          "LengthPercentageAutoInput | PartialRectInput<LengthPercentageAutoInput>",
          "Rect<LengthPercentageAuto>"
        ],
        "padding": [
          "LengthPercentageInput | PartialRectInput<LengthPercentageInput>",
          "Rect<LengthPercentage>"
        ],
        "border": [
          "LengthPercentageInput | PartialRectInput<LengthPercentageInput>",
          "Rect<LengthPercentage>"
        ],
        "alignItems": ["AlignItems | null", "AlignItems | null"],
        "alignSelf": ["AlignItems | null", "AlignItems | null"],
        "justifyItems": ["AlignItems | null", "AlignItems | null"],
        "justifySelf": ["AlignItems | null", "AlignItems | null"],
        "alignContent": ["AlignContent | null", "AlignContent | null"],
        "justifyContent": ["AlignContent | null", "AlignContent | null"],
        "gap": [
          "LengthPercentageInput | PartialSizeInput<LengthPercentageInput>",
          "Size<LengthPercentage>"
        ],
        "textAlign": ["TextAlign", "TextAlign"],
        "flexDirection": ["FlexDirection", "FlexDirection"],
        "flexWrap": ["FlexWrap", "FlexWrap"],
        "flexBasis": ["DimensionInput", "Dimension"],
        "flexGrow": ["number", "number"],
        "flexShrink": ["number", "number"],
        "gridTemplateRows": ["GridTemplateComponentInput[]", "readonly GridTemplateComponent[]"],
        "gridTemplateColumns": ["GridTemplateComponentInput[]", "readonly GridTemplateComponent[]"],
        "gridAutoRows": ["TrackSizingFunctionInput[]", "readonly TrackSizingFunction[]"],
        "gridAutoColumns": ["TrackSizingFunctionInput[]", "readonly TrackSizingFunction[]"],
        "gridAutoFlow": ["GridAutoFlow", "GridAutoFlow"],
        "gridTemplateAreas": ["GridTemplateAreasInput | null", "GridTemplateAreas | null"],
        "gridTemplateColumnNames": ["string[][]", "readonly (readonly string[])[]"],
        "gridTemplateRowNames": ["string[][]", "readonly (readonly string[])[]"],
        "gridRow": ["PartialLineInput<GridPlacementInput>", "Line<GridPlacement>"],
        "gridColumn": ["PartialLineInput<GridPlacementInput>", "Line<GridPlacement>"]
      }
    },
    "classDeclaration": {
      "owner": "API-TREE-001",
      "header": "export declare class TaffyTree<TContext = unknown>",
      "members": [
        ["constructor", "constructor();"],
        ["enableRounding", "enableRounding(): void;"],
        ["disableRounding", "disableRounding(): void;"],
        ["newLeaf", "newLeaf(style: StyleInput): NodeId;"],
        [
          "newLeafWithContext",
          "newLeafWithContext(style: StyleInput, context: TContext | undefined): NodeId;"
        ],
        [
          "newWithChildren",
          "newWithChildren(style: StyleInput, children: readonly NodeId[]): NodeId;"
        ],
        ["clear", "clear(): void;"],
        ["remove", "remove(node: NodeId): void;"],
        ["setNodeContext", "setNodeContext(node: NodeId, context: TContext | undefined): void;"],
        ["getNodeContext", "getNodeContext(node: NodeId): TContext | undefined;"],
        ["addChild", "addChild(parent: NodeId, child: NodeId): void;"],
        [
          "insertChildAtIndex",
          "insertChildAtIndex(parent: NodeId, index: number, child: NodeId): void;"
        ],
        ["setChildren", "setChildren(parent: NodeId, children: readonly NodeId[]): void;"],
        ["removeChild", "removeChild(parent: NodeId, child: NodeId): void;"],
        ["removeChildAtIndex", "removeChildAtIndex(parent: NodeId, index: number): NodeId;"],
        [
          "removeChildrenRange",
          "removeChildrenRange(parent: NodeId, range: ChildRangeInput): void;"
        ],
        [
          "replaceChildAtIndex",
          "replaceChildAtIndex(parent: NodeId, index: number, newChild: NodeId): NodeId;"
        ],
        ["getChildAtIndex", "getChildAtIndex(parent: NodeId, index: number): NodeId;"],
        ["getChildCount", "getChildCount(parent: NodeId): number;"],
        ["getNodeCount", "getNodeCount(): number;"],
        ["getParent", "getParent(node: NodeId): NodeId | null;"],
        ["getChildren", "getChildren(parent: NodeId): readonly NodeId[];"],
        ["setStyle", "setStyle(node: NodeId, style: StyleInput): void;"],
        ["getStyle", "getStyle(node: NodeId): Style;"],
        ["getLayout", "getLayout(node: NodeId): Layout;"],
        ["getUnroundedLayout", "getUnroundedLayout(node: NodeId): Layout;"],
        ["getDetailedLayoutInfo", "getDetailedLayoutInfo(node: NodeId): DetailedLayoutInfo;"],
        ["markDirty", "markDirty(node: NodeId): void;"],
        ["isDirty", "isDirty(node: NodeId): boolean;"],
        ["computeLayout", "computeLayout(options: ComputeLayoutOptions): void;"],
        [
          "computeLayoutWithMeasure",
          "computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void;"
        ]
      ]
    }
  },
  "generatedEvidenceIdRules": {
    "style": "<STYLE-ID>/<SUFFIX>",
    "nodeIdScalar": "NODEID/<OWNER>/<ROLE-ID>/<CASE-ID>",
    "nodeIdCollectionValid": "NODEID/<OWNER>/<ROLE-ID>/valid",
    "nodeIdCollectionInvalid": "NODEID/<OWNER>/<ROLE-ID>/<CASE-ID>/<POSITION>",
    "atomicity": "ATOMICITY/<OWNER>/<FAILURE-KIND>"
  },
  "generatedEvidenceOwners": {
    "style": "TEST-STYLE-001",
    "nodeIdScalar": "TEST-COMMON-NODEID",
    "nodeIdCollectionValid": "TEST-COMMON-NODEID",
    "nodeIdCollectionInvalid": "TEST-COMMON-NODEID",
    "atomicity": "TEST-COMMON-ATOMICITY"
  },
  "childIsolationRules": {
    "ordinaryAcceptanceIds": [
      "INFRA-004/panic-poisons",
      "INFRA-004/process-survives",
      "TYPE-NODEID-001/realm-copy",
      "TYPE-GRID-001/panic-guard",
      "TYPE-MEASURE-001/env-lifetime",
      "API-TREE-014/nonchild",
      "API-TREE-016/range-errors",
      "API-TREE-030/same-tree-busy",
      "MATURITY-002/cleanup",
      "MATURITY-002/isolation",
      "MATURITY-002/unsupported-platform"
    ],
    "generated": [
      {
        "family": "nodeIdScalar",
        "caseKinds": [
          "wrong-type",
          "malformed",
          "foreign",
          "stale-removed",
          "stale-cleared",
          "slot-reuse"
        ]
      },
      {
        "family": "nodeIdCollectionInvalid",
        "caseKinds": [
          "wrong-type",
          "malformed",
          "foreign",
          "stale-removed",
          "stale-cleared",
          "slot-reuse"
        ]
      },
      { "family": "atomicity", "failureKinds": ["tree-busy"] }
    ],
    "expandedChildAcceptanceCount": 228,
    "allOtherAcceptanceIds": "no dedicated hostile child fixture; ordinary subprocesses internal to the resolved runner are not separate evidence identities",
    "parentRule": "The canonical acceptance ID belongs only to its parent test; a spawned fixture is not test-runner collected and declares no independent evidence ID."
  },
  "nodeIdCaseKinds": {
    "valid": null,
    "wrong-type": "node-id-not-bigint",
    "malformed": "malformed-node-id",
    "foreign": "foreign-node-id",
    "stale-removed": "stale-node-id",
    "stale-cleared": "stale-node-id",
    "slot-reuse": "stale-node-id"
  },
  "nodeIdDeclarationBindingRules": {
    "ownerToMemberSource": "publicClassMembersByOwner; every owner in nodeIdRolesByOwner must own exactly one class member",
    "pathGrammar": "a parameter name, dot-separated required record properties, and an optional terminal [] array-element marker",
    "recordBindings": {
      "API-TREE-030/options": "ComputeLayoutWithMeasureOptions<TContext>",
      "API-TREE-031/options": "ComputeLayoutOptions"
    },
    "expectedRoleCount": 29,
    "expectedScalarRoleCount": 27,
    "expectedCollectionRoleCount": 2,
    "verification": "Resolve each path only through the exact class member and fixed interface statements in publicDeclarationContract; its terminal type must be NodeId, or readonly NodeId[] for a [] role, and no input NodeId terminal may remain unbound.",
    "selfTestMutations": [
      "remove one scalar NodeId input",
      "add one scalar NodeId input",
      "change a direct NodeId input to bigint",
      "change options.root to bigint",
      "change a NodeId collection element to bigint"
    ]
  },
  "nodeIdRolesByOwner": {
    "API-TREE-006": [
      {
        "id": "children-element",
        "path": "children[]",
        "invalidPositions": ["first", "middle", "last"]
      }
    ],
    "API-TREE-008": [{ "id": "node", "path": "node" }],
    "API-TREE-009": [{ "id": "node", "path": "node" }],
    "API-TREE-010": [{ "id": "node", "path": "node" }],
    "API-TREE-011": [
      { "id": "parent", "path": "parent" },
      { "id": "child", "path": "child" }
    ],
    "API-TREE-012": [
      { "id": "parent", "path": "parent" },
      { "id": "child", "path": "child" }
    ],
    "API-TREE-013": [
      { "id": "parent", "path": "parent" },
      {
        "id": "children-element",
        "path": "children[]",
        "invalidPositions": ["first", "middle", "last"]
      }
    ],
    "API-TREE-014": [
      { "id": "parent", "path": "parent" },
      { "id": "child", "path": "child" }
    ],
    "API-TREE-015": [{ "id": "parent", "path": "parent" }],
    "API-TREE-016": [{ "id": "parent", "path": "parent" }],
    "API-TREE-017": [
      { "id": "parent", "path": "parent" },
      { "id": "new-child", "path": "newChild" }
    ],
    "API-TREE-018": [{ "id": "parent", "path": "parent" }],
    "API-TREE-019": [{ "id": "parent", "path": "parent" }],
    "API-TREE-021": [{ "id": "node", "path": "node" }],
    "API-TREE-022": [{ "id": "parent", "path": "parent" }],
    "API-TREE-023": [{ "id": "node", "path": "node" }],
    "API-TREE-024": [{ "id": "node", "path": "node" }],
    "API-TREE-025": [{ "id": "node", "path": "node" }],
    "API-TREE-026": [{ "id": "node", "path": "node" }],
    "API-TREE-027": [{ "id": "node", "path": "node" }],
    "API-TREE-028": [{ "id": "node", "path": "node" }],
    "API-TREE-029": [{ "id": "node", "path": "node" }],
    "API-TREE-030": [{ "id": "root", "path": "options.root" }],
    "API-TREE-031": [{ "id": "root", "path": "options.root" }]
  },
  "constructionFailureCasesByOwner": {
    "API-TREE-001": ["random-source-failure"]
  },
  "ordinaryFailureKinds": {
    "argument-shape": {
      "error": "wrong-type-or-shape",
      "atomicity": "before-after"
    },
    "discrete-value": {
      "error": "discrete-range-or-enum",
      "atomicity": "before-after"
    },
    "child-index-out-of-bounds": {
      "error": "child-index-out-of-bounds",
      "atomicity": "before-after"
    },
    "invalid-topology": {
      "error": "invalid-topology",
      "atomicity": "before-after"
    },
    "node-id-serial-exhaustion": {
      "error": "node-id-serial-exhaustion",
      "atomicity": "before-after"
    },
    "tree-busy": {
      "error": "tree-busy",
      "atomicity": "control-compute"
    },
    "measure-result-shape": {
      "error": "wrong-type-or-shape",
      "atomicity": "nontransactional"
    },
    "callback-throw": {
      "error": "callback-throw",
      "atomicity": "nontransactional"
    }
  },
  "stateComparisonRules": {
    "normalizedCompletePublicState": [
      "live node set and getNodeCount",
      "NodeId liveness, normalized by deterministic fixture labels when comparing distinct trees",
      "getParent, getChildren, and getChildCount for every live node",
      "getStyle for every live node",
      "getLayout and getUnroundedLayout for every live node",
      "getDetailedLayoutInfo for every live node",
      "isDirty for every live node",
      "getNodeContext presence and primitive value or exact identity within one tree; distinct control trees compare fixture-assigned context labels and observable values",
      "rounding configuration observed without mutation through a precomputed fixed fractional probe node whose rounded and unrounded stored layouts differ",
      "wrapper registry consistency, native-owner availability, and poison state observed through the contracted public probes"
    ],
    "before-after": "Capture normalizedCompletePublicState immediately before and after the rejected operation on the same tree and require exact equality.",
    "control-compute": "Create two equivalent fixture trees. Compute one normally. In the other callback, attempt and catch exactly the selected busy operation, then return the same measure result. After both computations finish, compare normalizedCompletePublicState after normalizing distinct NodeIds and context identities to their fixture labels.",
    "nontransactional": "Do not compare Layout or cache to pre-compute state. Require first-failure zero drain, requested-subtree invalidation, normalized wrapper-registry and ID/context consistency, unchanged thrown-value or malformed-result classification, unpoisoned owner, and successful contracted recovery probes."
  },
  "publicMutationFailuresByOwner": {
    "API-TREE-002": ["tree-busy"],
    "API-TREE-003": ["tree-busy"],
    "API-TREE-004": ["argument-shape", "discrete-value", "node-id-serial-exhaustion", "tree-busy"],
    "API-TREE-005": ["argument-shape", "discrete-value", "node-id-serial-exhaustion", "tree-busy"],
    "API-TREE-006": [
      "argument-shape",
      "discrete-value",
      "invalid-topology",
      "node-id-serial-exhaustion",
      "tree-busy"
    ],
    "API-TREE-007": ["tree-busy"],
    "API-TREE-008": ["tree-busy"],
    "API-TREE-009": ["tree-busy"],
    "API-TREE-011": ["invalid-topology", "tree-busy"],
    "API-TREE-012": [
      "argument-shape",
      "discrete-value",
      "child-index-out-of-bounds",
      "invalid-topology",
      "tree-busy"
    ],
    "API-TREE-013": ["argument-shape", "invalid-topology", "tree-busy"],
    "API-TREE-014": ["invalid-topology", "tree-busy"],
    "API-TREE-015": ["argument-shape", "discrete-value", "child-index-out-of-bounds", "tree-busy"],
    "API-TREE-016": ["argument-shape", "discrete-value", "tree-busy"],
    "API-TREE-017": [
      "argument-shape",
      "discrete-value",
      "child-index-out-of-bounds",
      "invalid-topology",
      "tree-busy"
    ],
    "API-TREE-023": ["argument-shape", "discrete-value", "tree-busy"],
    "API-TREE-028": ["tree-busy"],
    "API-TREE-030": [
      "argument-shape",
      "discrete-value",
      "tree-busy",
      "measure-result-shape",
      "callback-throw"
    ],
    "API-TREE-031": ["argument-shape", "discrete-value", "tree-busy"]
  },
  "nodeIdFailuresUseBeforeAfterForMutationOwners": true,
  "numericFamilies": {
    "Display": ["Block", "FlowRoot", "Flex", "Grid", "None"],
    "BoxSizing": ["BorderBox", "ContentBox"],
    "Direction": ["Ltr", "Rtl"],
    "Overflow": ["Visible", "Clip", "Hidden", "Scroll"],
    "Float": ["Left", "Right", "None"],
    "Clear": ["Left", "Right", "Both", "None"],
    "Position": ["Relative", "Absolute"],
    "TextAlign": ["Auto", "LegacyLeft", "LegacyRight", "LegacyCenter"],
    "FlexDirection": ["Row", "Column", "RowReverse", "ColumnReverse"],
    "FlexWrap": ["NoWrap", "Wrap", "WrapReverse"],
    "GridAutoFlow": ["Row", "Column", "RowDense", "ColumnDense"],
    "AlignItems": [
      "Start",
      "End",
      "FlexStart",
      "FlexEnd",
      "SelfStart",
      "SelfEnd",
      "Center",
      "Baseline",
      "Stretch",
      "SafeStart",
      "SafeEnd",
      "SafeFlexStart",
      "SafeFlexEnd",
      "SafeSelfStart",
      "SafeSelfEnd",
      "SafeCenter"
    ],
    "AlignContent": [
      "Start",
      "End",
      "FlexStart",
      "FlexEnd",
      "Center",
      "Stretch",
      "SpaceBetween",
      "SpaceEvenly",
      "SpaceAround",
      "SafeStart",
      "SafeEnd",
      "SafeFlexStart",
      "SafeFlexEnd",
      "SafeCenter"
    ],
    "LengthUnit": ["Length", "Percent", "Auto"],
    "AvailableSpaceKind": ["Definite", "MinContent", "MaxContent"],
    "GridPlacementKind": ["Auto", "Line", "NamedLine", "Span", "NamedSpan"],
    "TrackSizingKind": [
      "Length",
      "Percent",
      "Auto",
      "MinContent",
      "MaxContent",
      "FitContent",
      "Fr"
    ],
    "RepetitionCountKind": ["Count", "AutoFill", "AutoFit"],
    "GridTemplateComponentKind": ["Single", "Repeat"],
    "DetailedLayoutInfoKind": ["None", "Grid"]
  },
  "styleFields": [
    ["STYLE-F01", "display"],
    ["STYLE-F02", "itemIsTable"],
    ["STYLE-F03", "itemIsReplaced"],
    ["STYLE-F04", "boxSizing"],
    ["STYLE-F05", "direction"],
    ["STYLE-F06", "overflow"],
    ["STYLE-F07", "scrollbarWidth"],
    ["STYLE-F08", "float"],
    ["STYLE-F09", "clear"],
    ["STYLE-F10", "position"],
    ["STYLE-F11", "inset"],
    ["STYLE-F12", "size"],
    ["STYLE-F13", "minSize"],
    ["STYLE-F14", "maxSize"],
    ["STYLE-F15", "aspectRatio"],
    ["STYLE-F16", "margin"],
    ["STYLE-F17", "padding"],
    ["STYLE-F18", "border"],
    ["STYLE-F19", "alignItems"],
    ["STYLE-F20", "alignSelf"],
    ["STYLE-F21", "justifyItems"],
    ["STYLE-F22", "justifySelf"],
    ["STYLE-F23", "alignContent"],
    ["STYLE-F24", "justifyContent"],
    ["STYLE-F25", "gap"],
    ["STYLE-F26", "textAlign"],
    ["STYLE-F27", "flexDirection"],
    ["STYLE-F28", "flexWrap"],
    ["STYLE-F29", "flexBasis"],
    ["STYLE-F30", "flexGrow"],
    ["STYLE-F31", "flexShrink"],
    ["STYLE-F32", "gridTemplateRows"],
    ["STYLE-F33", "gridTemplateColumns"],
    ["STYLE-F34", "gridAutoRows"],
    ["STYLE-F35", "gridAutoColumns"],
    ["STYLE-F36", "gridAutoFlow"],
    ["STYLE-F37", "gridTemplateAreas"],
    ["STYLE-F38", "gridTemplateColumnNames"],
    ["STYLE-F39", "gridTemplateRowNames"],
    ["STYLE-F40", "gridRow"],
    ["STYLE-F41", "gridColumn"]
  ],
  "nullableStyleFields": [
    "STYLE-F15",
    "STYLE-F19",
    "STYLE-F20",
    "STYLE-F21",
    "STYLE-F22",
    "STYLE-F23",
    "STYLE-F24",
    "STYLE-F37"
  ],
  "styleAcceptanceSuffixes": [
    "default",
    "missing",
    "undefined",
    "native",
    "roundtrip",
    "invalid",
    "atomic",
    "semantic"
  ],
  "layoutFields": [
    "order",
    "location",
    "size",
    "contentSize",
    "scrollbarSize",
    "border",
    "padding",
    "margin"
  ],
  "detailedFields": {
    "DetailedLayoutInfo": ["None", "Grid"],
    "DetailedGridInfo": ["rows", "columns", "items"],
    "DetailedGridTracksInfo": [
      "negativeImplicitTracks",
      "explicitTracks",
      "positiveImplicitTracks",
      "gutters",
      "sizes"
    ],
    "DetailedGridItemInfo": ["rowStart", "rowEnd", "columnStart", "columnEnd"]
  },
  "upstream": {
    "taffyTree": {
      "source": "src/tree/taffy_tree.rs",
      "feature": "taffy_tree",
      "implHeader": "impl<NodeContext> TaffyTree<NodeContext> {}",
      "methodFeatureOverrides": {
        "detailed_layout_info": ["taffy_tree", "detailed_layout_info"],
        "print_tree": ["taffy_tree", "std"]
      },
      "methods": {
        "new": {
          "signature": "fn new() -> Self",
          "disposition": "implement:API-TREE-001"
        },
        "with_capacity": {
          "signature": "fn with_capacity(capacity: usize) -> Self",
          "disposition": "exclude:capacity-only"
        },
        "enable_rounding": {
          "signature": "fn enable_rounding(&mut self)",
          "disposition": "implement:API-TREE-002"
        },
        "disable_rounding": {
          "signature": "fn disable_rounding(&mut self)",
          "disposition": "implement:API-TREE-003"
        },
        "new_leaf": {
          "signature": "fn new_leaf(&mut self, layout: Style) -> TaffyResult<NodeId>",
          "disposition": "implement:API-TREE-004"
        },
        "new_leaf_with_context": {
          "signature": "fn new_leaf_with_context(&mut self, layout: Style, context: NodeContext) -> TaffyResult<NodeId>",
          "disposition": "implement:API-TREE-005"
        },
        "new_with_children": {
          "signature": "fn new_with_children(&mut self, layout: Style, children: &[NodeId]) -> TaffyResult<NodeId>",
          "disposition": "implement:API-TREE-006"
        },
        "clear": {
          "signature": "fn clear(&mut self)",
          "disposition": "implement:API-TREE-007"
        },
        "remove": {
          "signature": "fn remove(&mut self, node: NodeId) -> TaffyResult<NodeId>",
          "disposition": "implement:API-TREE-008"
        },
        "set_node_context": {
          "signature": "fn set_node_context(&mut self, node: NodeId, measure: Option<NodeContext>) -> TaffyResult<()>",
          "disposition": "implement:API-TREE-009"
        },
        "get_node_context": {
          "signature": "fn get_node_context(&self, node: NodeId) -> Option<&NodeContext>",
          "disposition": "implement:API-TREE-010"
        },
        "get_node_context_mut": {
          "signature": "fn get_node_context_mut(&mut self, node: NodeId) -> Option<&mut NodeContext>",
          "disposition": "absorbed:API-TREE-010"
        },
        "get_disjoint_node_context_mut": {
          "signature": "fn get_disjoint_node_context_mut<const N: usize>(&mut self, keys: [NodeId; N]) -> Option<[&mut NodeContext; N]>",
          "disposition": "absorbed:API-TREE-010"
        },
        "add_child": {
          "signature": "fn add_child(&mut self, parent: NodeId, child: NodeId) -> TaffyResult<()>",
          "disposition": "implement:API-TREE-011"
        },
        "insert_child_at_index": {
          "signature": "fn insert_child_at_index(&mut self, parent: NodeId, child_index: usize, child: NodeId) -> TaffyResult<()>",
          "disposition": "implement:API-TREE-012"
        },
        "set_children": {
          "signature": "fn set_children(&mut self, parent: NodeId, children: &[NodeId]) -> TaffyResult<()>",
          "disposition": "implement:API-TREE-013"
        },
        "remove_child": {
          "signature": "fn remove_child(&mut self, parent: NodeId, child: NodeId) -> TaffyResult<NodeId>",
          "disposition": "implement:API-TREE-014"
        },
        "remove_child_at_index": {
          "signature": "fn remove_child_at_index(&mut self, parent: NodeId, child_index: usize) -> TaffyResult<NodeId>",
          "disposition": "implement:API-TREE-015"
        },
        "remove_children_range": {
          "signature": "fn remove_children_range<R>(&mut self, parent: NodeId, range: R) -> TaffyResult<()> where R: core::ops::RangeBounds<usize>",
          "disposition": "implement:API-TREE-016"
        },
        "replace_child_at_index": {
          "signature": "fn replace_child_at_index(&mut self, parent: NodeId, child_index: usize, new_child: NodeId) -> TaffyResult<NodeId>",
          "disposition": "implement:API-TREE-017"
        },
        "child_at_index": {
          "signature": "fn child_at_index(&self, parent: NodeId, child_index: usize) -> TaffyResult<NodeId>",
          "disposition": "implement:API-TREE-018"
        },
        "total_node_count": {
          "signature": "fn total_node_count(&self) -> usize",
          "disposition": "implement:API-TREE-020"
        },
        "parent": {
          "signature": "fn parent(&self, child_id: NodeId) -> Option<NodeId>",
          "disposition": "implement:API-TREE-021"
        },
        "children": {
          "signature": "fn children(&self, parent: NodeId) -> TaffyResult<Vec<NodeId>>",
          "disposition": "implement:API-TREE-022"
        },
        "set_style": {
          "signature": "fn set_style(&mut self, node: NodeId, style: Style) -> TaffyResult<()>",
          "disposition": "implement:API-TREE-023"
        },
        "style": {
          "signature": "fn style(&self, node: NodeId) -> TaffyResult<&Style>",
          "disposition": "implement:API-TREE-024"
        },
        "layout": {
          "signature": "fn layout(&self, node: NodeId) -> TaffyResult<&Layout>",
          "disposition": "implement:API-TREE-025"
        },
        "unrounded_layout": {
          "signature": "fn unrounded_layout(&self, node: NodeId) -> &Layout",
          "disposition": "implement:API-TREE-026"
        },
        "detailed_layout_info": {
          "signature": "fn detailed_layout_info(&self, node_id: NodeId) -> &DetailedLayoutInfo",
          "disposition": "implement:API-TREE-027"
        },
        "mark_dirty": {
          "signature": "fn mark_dirty(&mut self, node: NodeId) -> TaffyResult<()>",
          "disposition": "implement:API-TREE-028"
        },
        "dirty": {
          "signature": "fn dirty(&self, node: NodeId) -> TaffyResult<bool>",
          "disposition": "implement:API-TREE-029"
        },
        "compute_layout_with_measure": {
          "signature": "fn compute_layout_with_measure<MeasureFunction>(&mut self, node_id: NodeId, available_space: Size<AvailableSpace>, measure_function: MeasureFunction) -> Result<(), TaffyError> where MeasureFunction: FnMut(Size<Option<f32>>, Size<AvailableSpace>, NodeId, Option<&mut NodeContext>, &Style) -> Size<f32>",
          "disposition": "implement:API-TREE-030"
        },
        "compute_layout": {
          "signature": "fn compute_layout(&mut self, node: NodeId, available_space: Size<AvailableSpace>) -> Result<(), TaffyError>",
          "disposition": "implement:API-TREE-031"
        },
        "print_tree": {
          "signature": "fn print_tree(&mut self, root: NodeId)",
          "disposition": "exclude:unstable-stdout-debug"
        }
      }
    },
    "traversePartialTree": {
      "source": "src/tree/taffy_tree.rs",
      "declarationSource": "src/tree/traits.rs",
      "feature": "taffy_tree",
      "trait": "TraversePartialTree",
      "for": "TaffyTree<NodeContext>",
      "implHeader": "impl<NodeContext> TraversePartialTree for TaffyTree<NodeContext> {}",
      "methods": {
        "child_count": {
          "signature": "fn child_count(&self, parent_node_id: NodeId) -> usize",
          "disposition": "implement:API-TREE-019"
        },
        "child_ids": {
          "signature": "fn child_ids(&self, parent_node_id: NodeId) -> Self::ChildIter<'_>",
          "disposition": "absorbed:API-TREE-022"
        },
        "get_child_id": {
          "signature": "fn get_child_id(&self, parent_node_id: NodeId, id: usize) -> NodeId",
          "disposition": "absorbed:API-TREE-018"
        }
      }
    },
    "adjacentRoots": [
      {
        "kind": "traitImpl",
        "trait": "Default",
        "for": "TaffyTree",
        "source": "src/tree/taffy_tree.rs",
        "cfg": { "feature": "taffy_tree" },
        "disposition": "absorbed:API-TREE-001"
      },
      {
        "kind": "derivedTraitImpl",
        "trait": "Clone",
        "for": "TaffyTree<NodeContext>",
        "source": "src/tree/taffy_tree.rs",
        "cfg": { "feature": "taffy_tree" },
        "disposition": "exclude:identity-context-semantics"
      },
      {
        "kind": "derivedTraitImpl",
        "trait": "Debug",
        "for": "TaffyTree<NodeContext>",
        "source": "src/tree/taffy_tree.rs",
        "cfg": { "feature": "taffy_tree" },
        "disposition": "exclude:private-state"
      },
      {
        "kind": "struct",
        "rustPath": "crate::tree::taffy_tree::TaffyTreeChildIter<'a>",
        "source": "src/tree/taffy_tree.rs",
        "cfg": { "feature": "taffy_tree" },
        "publicFields": [],
        "iteratorItem": "NodeId",
        "disposition": "exclude:owned-array-covers"
      }
    ],
    "nonRootConveniences": {
      "includedInU": false,
      "items": [
        {
          "rust": "NodeId::new",
          "source": "src/tree/node.rs",
          "cfg": true,
          "disposition": "exclude:binding-issued-only"
        },
        {
          "rust": "From<u64> for NodeId",
          "source": "src/tree/node.rs",
          "cfg": true,
          "disposition": "exclude:binding-issued-only"
        },
        {
          "rust": "From<NodeId> for u64",
          "source": "src/tree/node.rs",
          "cfg": true,
          "disposition": "exclude:binding-issued-only"
        },
        {
          "rust": "From<usize> for NodeId",
          "source": "src/tree/node.rs",
          "cfg": true,
          "disposition": "exclude:binding-issued-only"
        },
        {
          "rust": "From<NodeId> for usize",
          "source": "src/tree/node.rs",
          "cfg": true,
          "disposition": "exclude:binding-issued-only"
        },
        {
          "rust": "Style::DEFAULT",
          "source": "src/style/mod.rs",
          "cfg": true,
          "disposition": "absorbed:TYPE-STYLE-001"
        },
        {
          "rust": "Default for Style",
          "source": "src/style/mod.rs",
          "cfg": true,
          "disposition": "absorbed:TYPE-STYLE-001"
        },
        {
          "rust": "evenly_sized_tracks",
          "source": "src/style_helpers.rs",
          "cfg": { "feature": "grid" },
          "disposition": "exclude:composable-helper"
        },
        {
          "rust": "Layout::new",
          "source": "src/tree/layout.rs",
          "cfg": true,
          "disposition": "exclude:output-data-only"
        },
        {
          "rust": "Layout::with_order",
          "source": "src/tree/layout.rs",
          "cfg": true,
          "disposition": "exclude:output-data-only"
        },
        {
          "rust": "Layout::content_box_width",
          "source": "src/tree/layout.rs",
          "cfg": true,
          "disposition": "exclude:output-data-only"
        },
        {
          "rust": "Layout::content_box_height",
          "source": "src/tree/layout.rs",
          "cfg": true,
          "disposition": "exclude:output-data-only"
        },
        {
          "rust": "Layout::content_box_size",
          "source": "src/tree/layout.rs",
          "cfg": true,
          "disposition": "exclude:output-data-only"
        },
        {
          "rust": "Layout::content_box_x",
          "source": "src/tree/layout.rs",
          "cfg": true,
          "disposition": "exclude:output-data-only"
        },
        {
          "rust": "Layout::content_box_y",
          "source": "src/tree/layout.rs",
          "cfg": true,
          "disposition": "exclude:output-data-only"
        },
        {
          "rust": "Layout::scroll_width",
          "source": "src/tree/layout.rs",
          "cfg": { "feature": "content_size" },
          "disposition": "exclude:output-data-only"
        },
        {
          "rust": "Layout::scroll_height",
          "source": "src/tree/layout.rs",
          "cfg": { "feature": "content_size" },
          "disposition": "exclude:output-data-only"
        }
      ]
    },
    "valueTypeAssociatedItems": {
      "includedInU": false,
      "reason": "rust-convenience-only"
    },
    "exclusionReasons": {
      "capacity-only": "Preallocation adds no layout capability and exposes uncontrolled native allocation.",
      "unstable-stdout-debug": "The method writes unstable output with raw Rust NodeIds directly to process stdout.",
      "identity-context-semantics": "Clone would require new public tree identity, NodeId, and JavaScript-context semantics.",
      "private-state": "Rust Debug would expose unsupported private representation.",
      "owned-array-covers": "An owned JavaScript array already covers iteration.",
      "binding-issued-only": "Public NodeIds are issued only by their owning wrapper.",
      "composable-helper": "The selected public helpers compose the same value without another vocabulary.",
      "output-data-only": "Layout is an output-only detached data snapshot.",
      "rust-convenience-only": "Value-type associated items and trait implementations add no high-level Node capability beyond the selected data shapes and are outside U.",
      "phantom-generic-marker": "The public PhantomData field carries Rust generic type information and has no JavaScript layout semantics."
    }
  },
  "namedDataGroups": [
    {
      "source": "src/tree/node.rs",
      "features": [],
      "disposition": "covered-by:TYPE-NODEID-001",
      "items": ["NodeId"]
    },
    {
      "source": "src/tree/taffy_tree.rs",
      "features": ["taffy_tree"],
      "disposition": "absorbed-by:INFRA-004",
      "items": ["TaffyResult", "TaffyError"]
    },
    {
      "source": "src/style/mod.rs",
      "features": [],
      "disposition": "covered-by:TYPE-STYLE-001",
      "items": ["Style"]
    },
    {
      "source": "src/tree/layout.rs",
      "features": [],
      "disposition": "covered-by:TYPE-LAYOUT-001",
      "items": ["Layout"]
    },
    {
      "source": "src/tree/layout.rs",
      "features": ["detailed_layout_info"],
      "disposition": "covered-by:TYPE-DETAIL-001",
      "items": ["DetailedLayoutInfo"]
    },
    {
      "source": "src/compute/grid/mod.rs",
      "features": ["grid", "detailed_layout_info"],
      "disposition": "covered-by:TYPE-DETAIL-001",
      "items": ["DetailedGridInfo", "DetailedGridTracksInfo", "DetailedGridItemsInfo"]
    },
    {
      "source": "src/style/available_space.rs",
      "features": [],
      "disposition": "covered-by:TYPE-AVAILABLE-001",
      "items": ["AvailableSpace"]
    },
    {
      "source": "src/geometry.rs",
      "features": [],
      "disposition": "covered-by:TYPE-GEOMETRY-001",
      "items": ["Point", "Size", "Rect", "Line"]
    },
    {
      "source": "src/geometry.rs",
      "features": [],
      "disposition": "absorbed-by:TYPE-GRID-001",
      "items": ["MinMax"]
    },
    {
      "source": "src/style/dimension.rs",
      "features": [],
      "disposition": "covered-by:TYPE-LENGTH-001",
      "items": ["LengthPercentage", "LengthPercentageAuto", "Dimension"]
    },
    {
      "source": "src/style/mod.rs",
      "features": [],
      "disposition": "covered-by:INFRA-003",
      "items": ["Display", "BoxSizing", "Direction", "Overflow", "Position"]
    },
    {
      "source": "src/style/float.rs",
      "features": ["float_layout"],
      "disposition": "covered-by:INFRA-003",
      "items": ["Float", "Clear"]
    },
    {
      "source": "src/style/block.rs",
      "features": ["block_layout"],
      "disposition": "covered-by:INFRA-003",
      "items": ["TextAlign"]
    },
    {
      "source": "src/style/flex.rs",
      "features": ["flexbox"],
      "disposition": "covered-by:INFRA-003",
      "items": ["FlexDirection", "FlexWrap"]
    },
    {
      "source": "src/style/alignment.rs",
      "features": [],
      "disposition": "covered-by:INFRA-003",
      "items": [
        "AlignItems",
        "AlignItemsKeyword",
        "AlignSelf",
        "JustifyItems",
        "JustifySelf",
        "AlignContent",
        "AlignContentKeyword",
        "AlignmentSafety",
        "JustifyContent"
      ]
    },
    {
      "source": "src/style/grid.rs",
      "features": ["grid"],
      "disposition": "covered-by:TYPE-GRID-001",
      "items": [
        "GridPlacement",
        "MinTrackSizingFunction",
        "MaxTrackSizingFunction",
        "TrackSizingFunction",
        "RepetitionCount",
        "GridTemplateRepetition",
        "GridTemplateComponent",
        "GridTemplateAreas",
        "GridTemplateArea"
      ]
    },
    {
      "source": "src/style/grid.rs",
      "features": ["grid"],
      "disposition": "covered-by:INFRA-003",
      "items": ["GridAutoFlow"]
    },
    {
      "source": "src/compute/grid/types/coordinates.rs",
      "features": ["grid"],
      "disposition": "absorbed-by:TYPE-GRID-001",
      "items": ["GridLine"]
    }
  ],
  "namedDataShapes": {
    "NodeId": {
      "kind": "opaqueTupleStruct",
      "publicFields": []
    },
    "TaffyResult": {
      "kind": "typeAlias",
      "generics": ["T"],
      "target": "Result<T, TaffyError>"
    },
    "TaffyError": {
      "kind": "enum",
      "variants": {
        "ChildIndexOutOfBounds": {
          "parent": "NodeId",
          "child_index": "usize",
          "child_count": "usize"
        },
        "InvalidParentNode": ["NodeId"],
        "InvalidChildNode": ["NodeId"],
        "InvalidInputNode": ["NodeId"]
      }
    },
    "Style": {
      "kind": "struct",
      "generics": ["S: CheapCloneStr = DefaultCheapStr"],
      "fields": {
        "dummy": "core::marker::PhantomData<S>",
        "display": "Display",
        "item_is_table": "bool",
        "item_is_replaced": "bool",
        "box_sizing": "BoxSizing",
        "direction": "Direction",
        "overflow": "Point<Overflow>",
        "scrollbar_width": "f32",
        "float": "Float",
        "clear": "Clear",
        "position": "Position",
        "inset": "Rect<LengthPercentageAuto>",
        "size": "Size<Dimension>",
        "min_size": "Size<Dimension>",
        "max_size": "Size<Dimension>",
        "aspect_ratio": "Option<f32>",
        "margin": "Rect<LengthPercentageAuto>",
        "padding": "Rect<LengthPercentage>",
        "border": "Rect<LengthPercentage>",
        "align_items": "Option<AlignItems>",
        "align_self": "Option<AlignSelf>",
        "justify_items": "Option<AlignItems>",
        "justify_self": "Option<AlignSelf>",
        "align_content": "Option<AlignContent>",
        "justify_content": "Option<JustifyContent>",
        "gap": "Size<LengthPercentage>",
        "text_align": "TextAlign",
        "flex_direction": "FlexDirection",
        "flex_wrap": "FlexWrap",
        "flex_basis": "Dimension",
        "flex_grow": "f32",
        "flex_shrink": "f32",
        "grid_template_rows": "GridTrackVec<GridTemplateComponent<S>>",
        "grid_template_columns": "GridTrackVec<GridTemplateComponent<S>>",
        "grid_auto_rows": "GridTrackVec<TrackSizingFunction>",
        "grid_auto_columns": "GridTrackVec<TrackSizingFunction>",
        "grid_auto_flow": "GridAutoFlow",
        "grid_template_areas": "Option<GridTemplateAreas<S>>",
        "grid_template_column_names": "GridTrackVec<GridTrackVec<S>>",
        "grid_template_row_names": "GridTrackVec<GridTrackVec<S>>",
        "grid_row": "Line<GridPlacement<S>>",
        "grid_column": "Line<GridPlacement<S>>"
      },
      "fieldCfg": {
        "float": { "feature": "float_layout" },
        "clear": { "feature": "float_layout" },
        "align_items": {
          "any": [{ "feature": "flexbox" }, { "feature": "grid" }]
        },
        "align_self": {
          "any": [{ "feature": "flexbox" }, { "feature": "grid" }]
        },
        "justify_items": { "feature": "grid" },
        "justify_self": { "feature": "grid" },
        "align_content": {
          "any": [{ "feature": "flexbox" }, { "feature": "grid" }, { "feature": "block_layout" }]
        },
        "justify_content": {
          "any": [{ "feature": "flexbox" }, { "feature": "grid" }]
        },
        "gap": {
          "any": [{ "feature": "flexbox" }, { "feature": "grid" }]
        },
        "text_align": { "feature": "block_layout" },
        "flex_direction": { "feature": "flexbox" },
        "flex_wrap": { "feature": "flexbox" },
        "flex_basis": { "feature": "flexbox" },
        "flex_grow": { "feature": "flexbox" },
        "flex_shrink": { "feature": "flexbox" },
        "grid_template_rows": { "feature": "grid" },
        "grid_template_columns": { "feature": "grid" },
        "grid_auto_rows": { "feature": "grid" },
        "grid_auto_columns": { "feature": "grid" },
        "grid_auto_flow": { "feature": "grid" },
        "grid_template_areas": { "feature": "grid" },
        "grid_template_column_names": { "feature": "grid" },
        "grid_template_row_names": { "feature": "grid" },
        "grid_row": { "feature": "grid" },
        "grid_column": { "feature": "grid" }
      },
      "fieldDispositions": {
        "dummy": "exclude:phantom-generic-marker"
      }
    },
    "Layout": {
      "kind": "struct",
      "fields": {
        "order": "u32",
        "location": "Point<f32>",
        "size": "Size<f32>",
        "content_size": "Size<f32>",
        "scrollbar_size": "Size<f32>",
        "border": "Rect<f32>",
        "padding": "Rect<f32>",
        "margin": "Rect<f32>"
      },
      "fieldCfg": {
        "content_size": { "feature": "content_size" }
      }
    },
    "DetailedLayoutInfo": {
      "kind": "enum",
      "variants": {
        "Grid": ["Box<DetailedGridInfo>"],
        "None": null
      },
      "variantCfg": {
        "Grid": { "feature": "grid" }
      }
    },
    "DetailedGridInfo": {
      "kind": "struct",
      "fields": {
        "rows": "DetailedGridTracksInfo",
        "columns": "DetailedGridTracksInfo",
        "items": "Vec<DetailedGridItemsInfo>"
      }
    },
    "DetailedGridTracksInfo": {
      "kind": "struct",
      "fields": {
        "negative_implicit_tracks": "u16",
        "explicit_tracks": "u16",
        "positive_implicit_tracks": "u16",
        "gutters": "Vec<f32>",
        "sizes": "Vec<f32>"
      }
    },
    "DetailedGridItemsInfo": {
      "kind": "struct",
      "fields": {
        "row_start": "u16",
        "row_end": "u16",
        "column_start": "u16",
        "column_end": "u16"
      }
    },
    "AvailableSpace": {
      "kind": "enum",
      "variants": {
        "Definite": ["f32"],
        "MinContent": null,
        "MaxContent": null
      }
    },
    "Point": {
      "kind": "struct",
      "generics": ["T"],
      "fields": { "x": "T", "y": "T" }
    },
    "Size": {
      "kind": "struct",
      "generics": ["T"],
      "fields": { "width": "T", "height": "T" }
    },
    "Rect": {
      "kind": "struct",
      "generics": ["T"],
      "fields": {
        "left": "T",
        "right": "T",
        "top": "T",
        "bottom": "T"
      }
    },
    "Line": {
      "kind": "struct",
      "generics": ["T"],
      "fields": { "start": "T", "end": "T" }
    },
    "MinMax": {
      "kind": "struct",
      "generics": ["Min", "Max"],
      "fields": { "min": "Min", "max": "Max" }
    },
    "LengthPercentage": {
      "kind": "opaqueTupleStruct",
      "publicFields": []
    },
    "LengthPercentageAuto": {
      "kind": "opaqueTupleStruct",
      "publicFields": []
    },
    "Dimension": {
      "kind": "opaqueTupleStruct",
      "publicFields": []
    },
    "Display": {
      "kind": "enum",
      "variants": {
        "Block": null,
        "FlowRoot": null,
        "Flex": null,
        "Grid": null,
        "None": null
      },
      "variantCfg": {
        "Block": { "feature": "block_layout" },
        "FlowRoot": { "feature": "block_layout" },
        "Flex": { "feature": "flexbox" },
        "Grid": { "feature": "grid" }
      }
    },
    "BoxSizing": {
      "kind": "enum",
      "variants": { "BorderBox": null, "ContentBox": null }
    },
    "Direction": {
      "kind": "enum",
      "variants": { "Ltr": null, "Rtl": null }
    },
    "Overflow": {
      "kind": "enum",
      "variants": {
        "Visible": null,
        "Clip": null,
        "Hidden": null,
        "Scroll": null
      }
    },
    "Position": {
      "kind": "enum",
      "variants": { "Relative": null, "Absolute": null }
    },
    "Float": {
      "kind": "enum",
      "variants": { "Left": null, "Right": null, "None": null }
    },
    "Clear": {
      "kind": "enum",
      "variants": {
        "Left": null,
        "Right": null,
        "Both": null,
        "None": null
      }
    },
    "TextAlign": {
      "kind": "enum",
      "variants": {
        "Auto": null,
        "LegacyLeft": null,
        "LegacyRight": null,
        "LegacyCenter": null
      }
    },
    "FlexDirection": {
      "kind": "enum",
      "variants": {
        "Row": null,
        "Column": null,
        "RowReverse": null,
        "ColumnReverse": null
      }
    },
    "FlexWrap": {
      "kind": "enum",
      "variants": { "NoWrap": null, "Wrap": null, "WrapReverse": null }
    },
    "AlignItems": {
      "kind": "struct",
      "fields": {
        "keyword": "AlignItemsKeyword",
        "safety": "AlignmentSafety"
      }
    },
    "AlignItemsKeyword": {
      "kind": "enum",
      "variants": {
        "Start": null,
        "End": null,
        "FlexStart": null,
        "FlexEnd": null,
        "SelfStart": null,
        "SelfEnd": null,
        "Center": null,
        "Baseline": null,
        "Stretch": null
      }
    },
    "AlignSelf": {
      "kind": "typeAlias",
      "target": "AlignItems"
    },
    "JustifyItems": {
      "kind": "typeAlias",
      "target": "AlignItems"
    },
    "JustifySelf": {
      "kind": "typeAlias",
      "target": "AlignItems"
    },
    "AlignContent": {
      "kind": "struct",
      "fields": {
        "keyword": "AlignContentKeyword",
        "safety": "AlignmentSafety"
      }
    },
    "AlignContentKeyword": {
      "kind": "enum",
      "variants": {
        "Start": null,
        "End": null,
        "FlexStart": null,
        "FlexEnd": null,
        "Center": null,
        "Stretch": null,
        "SpaceBetween": null,
        "SpaceEvenly": null,
        "SpaceAround": null
      }
    },
    "AlignmentSafety": {
      "kind": "enum",
      "variants": { "Unsafe": null, "Safe": null }
    },
    "JustifyContent": {
      "kind": "typeAlias",
      "target": "AlignContent"
    },
    "GridPlacement": {
      "kind": "enum",
      "generics": ["S: CheapCloneStr = DefaultCheapStr"],
      "variants": {
        "Auto": null,
        "Line": ["GridLine"],
        "NamedLine": ["S", "i16"],
        "Span": ["u16"],
        "NamedSpan": ["S", "u16"]
      }
    },
    "MinTrackSizingFunction": {
      "kind": "opaqueTupleStruct",
      "publicFields": []
    },
    "MaxTrackSizingFunction": {
      "kind": "opaqueTupleStruct",
      "publicFields": []
    },
    "TrackSizingFunction": {
      "kind": "typeAlias",
      "target": "MinMax<MinTrackSizingFunction, MaxTrackSizingFunction>"
    },
    "RepetitionCount": {
      "kind": "enum",
      "variants": {
        "AutoFill": null,
        "AutoFit": null,
        "Count": ["u16"]
      }
    },
    "GridTemplateRepetition": {
      "kind": "struct",
      "generics": ["S: CheapCloneStr"],
      "fields": {
        "count": "RepetitionCount",
        "tracks": "Vec<TrackSizingFunction>",
        "line_names": "Vec<Vec<S>>"
      }
    },
    "GridTemplateComponent": {
      "kind": "enum",
      "generics": ["S: CheapCloneStr"],
      "variants": {
        "Single": ["TrackSizingFunction"],
        "Repeat": ["GridTemplateRepetition<S>"]
      }
    },
    "GridTemplateAreas": {
      "kind": "struct",
      "generics": ["CustomIdent: CheapCloneStr"],
      "fields": {
        "areas": "crate::util::sys::GridTrackVec<GridTemplateArea<CustomIdent>>",
        "row_count": "u16",
        "column_count": "u16"
      }
    },
    "GridTemplateArea": {
      "kind": "struct",
      "generics": ["CustomIdent: CheapCloneStr"],
      "fields": {
        "name": "CustomIdent",
        "row_start": "u16",
        "row_end": "u16",
        "column_start": "u16",
        "column_end": "u16"
      }
    },
    "GridAutoFlow": {
      "kind": "enum",
      "variants": {
        "Row": null,
        "Column": null,
        "RowDense": null,
        "ColumnDense": null
      }
    },
    "GridLine": {
      "kind": "opaqueTupleStruct",
      "publicFields": []
    }
  },
  "errors": {
    "wrong-type-or-shape": { "class": "TypeError", "code": null },
    "discrete-range-or-enum": { "class": "RangeError", "code": null },
    "child-index-out-of-bounds": {
      "class": "RangeError",
      "code": "ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS"
    },
    "node-id-not-bigint": { "class": "TypeError", "code": null },
    "malformed-node-id": { "class": "Error", "code": "ERR_TAFFY_INVALID_NODE_ID" },
    "foreign-node-id": { "class": "Error", "code": "ERR_TAFFY_FOREIGN_NODE_ID" },
    "stale-node-id": { "class": "Error", "code": "ERR_TAFFY_STALE_NODE_ID" },
    "random-source-failure": { "class": "Error", "code": null },
    "node-id-serial-exhaustion": { "class": "RangeError", "code": null },
    "invalid-topology": { "class": "Error", "code": "ERR_TAFFY_INVALID_TOPOLOGY" },
    "tree-busy": {
      "class": "Error",
      "code": "ERR_TAFFY_TREE_BUSY",
      "messageTemplate": "Cannot call <publicMethod> on this TaffyTree while it is computing layout from a measure callback"
    },
    "internal": { "class": "Error", "code": "ERR_TAFFY_INTERNAL" },
    "tree-poisoned": { "class": "Error", "code": "ERR_TAFFY_TREE_POISONED" },
    "callback-throw": { "class": "identity", "code": "unchanged" }
  },
  "secondaryRustTestNameRule": "contract__<TASK-ID-lower-snake>__<SLUG-lower-snake>",
  "javascriptConveniencesByOwner": {
    "API-TREE-016": ["ChildRangeInput half-open range"],
    "TYPE-LENGTH-001": ["Dimension"],
    "TYPE-AVAILABLE-001": ["AvailableSpace"],
    "TYPE-GRID-001": [
      "GridPlacement",
      "TrackSizingFunction",
      "RepetitionCount",
      "GridTemplateComponent"
    ]
  }
}
```

<!-- taffy-contract-json:end -->

## Universal boundary rules

All record-shaped inputs follow the vouched ordinary-data-object rule. Conversion uses normal property access and does not add copies, repeated NodeId checks, or special Proxy/getter defenses solely for adversarial property access. The binding still enforces the selected shape, required payloads, explicit unknown-field policies, NodeId ownership, complete conversion before mutation, and known panic-safety boundaries. Unknown own enumerable string keys are rejected only for Style and geometry records, where that policy was explicitly selected; symbol keys, nonenumerable keys, and inherited unrelated properties are ignored. Outer option records, tagged branches, ranges, and other payload records read their required fields and ignore unrelated properties unless this file states a concrete safety exception. Atomicity promises cover changes performed by the binding, native owner, and wrapper registries; they do not roll back arbitrary caller side effects caused by ordinary property access, accessors, or Proxy traps.

Every JavaScript number mapped to Taffy `f32` accepts only the JavaScript number type, converts with ordinary `f64 as f32` behavior, preserves negative and non-finite values, and returns the actual stored `f32` widened to a JavaScript number. No property-domain clamp, normalization, finite-value rule, or exact-f32 rule may be added. Integer payloads, indices, ranges, collection lengths, enum codes, and allocation sizes retain exact representability checks because they construct discrete Rust values rather than layout-semantic floats.

JavaScript strings mapped to Taffy's Rust string storage preserve every well-formed Unicode string exactly. An isolated UTF-16 surrogate is not a Rust string value and follows the production Node-API UTF-8 conversion rather than gaining a second encoding layer: each representative isolated surrogate such as `"\uD800"` reads back as the replacement character `"\uFFFD"`. The native-string acceptance must exercise this through the production converter. The binding does not reject, pre-scan, or promise JavaScript code-unit fidelity for ill-formed UTF-16 solely to defend this uncommon input.

Every binding-created tree or callback output record and array is an eagerly materialized detached ordinary JavaScript value with recursively readonly TypeScript declarations. Those output runtime values are not frozen, sealed, proxied, cached, or native-backed. The caller-owned context is the deliberate exception to snapshot semantics: `getNodeContext` returns the exact registered value, and a detached `MeasureArgs` record carries that same value in its `context` property, including exact object identity and mutability. The binding neither copies nor freezes that caller-owned value. The frozen namespace objects and fieldless helper constants specified below are the only binding-created record-valued freeze exception; payload-helper results and every direct record-shaped input remain mutable. No live Rust borrow or retained `Env`-bound view crosses the call.

Every mutating call follows the vouched two-layer sequence. The authored JavaScript wrapper resolves every NodeId exactly once against its current registry immediately before making one synchronous native call; it does not preconvert another ordinary value or repeat the lookup after native argument conversion. Inside that call, the native boundary completely converts every remaining non-identity input and validates all native-owned integer, allocation, and known-panic preconditions before the first Taffy mutation. Wrapper-owned topology checks may use the already resolved registry data before the call. The wrapper updates JavaScript registries only after native success, then returns. Conversion failure, binding-owned validation failure, `ERR_TAFFY_TREE_BUSY`, and an ordinary Taffy error before a supported operation succeeds leave no partial mutation attributable to that attempted operation. Deliberate getter- or Proxy-driven re-entry after the NodeId lookup remains outside the initial contract rather than causing a second lookup or normalization pass. `computeLayoutWithMeasure` is the explicit exception after native computation begins: a callback-thrown value or malformed measure result may retain Layout/cache work already performed before zero-drain and subtree invalidation, exactly as its `nontransactional` failure contract states, while wrapper registries remain consistent and the tree remains reusable. Fatal process allocation failure is outside this recoverability promise.

All JavaScript-controlled native entry points use the vouched `RefCell` checked-borrow boundary. Expected callback failure uses the vouched zero-drain and subtree-cache invalidation path and never panic. Unexpected Rust panic is a defensive backstop only: catch unwind at the public native boundary, mark the private native owner poisoned because partial native state cannot be trusted, throw an `Error` with code `ERR_TAFFY_INTERNAL`, and make later native entries throw `ERR_TAFFY_TREE_POISONED`. This poisoning rule never applies to a callback-thrown value, malformed measure result, `ERR_TAFFY_TREE_BUSY`, ordinary conversion failure, or ordinary Taffy error.

Exact messages are not compatibility promises except for the vouched busy diagnostic. Its exact template is `Cannot call <publicMethod> on this TaffyTree while it is computing layout from a measure callback`, where `<publicMethod>` is replaced by the attempted camelCase public method name. Error class and code are fixed by this table; a dash means no stable `code` property is required.

| Condition                                                                                                                                                            | JavaScript class                  | Stable code                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------- |
| Wrong JavaScript type, missing required record payload, unknown Style or geometry key, malformed measure result                                                      | `TypeError`                       | —                                     |
| Non-finite or fractional discrete integer, out-of-range integer, unknown numeric enum member, invalid safe index or range, pinned unsafe Grid collection cardinality | `RangeError`                      | —                                     |
| Child index is a valid safe integer but is outside the current child list                                                                                            | `RangeError`                      | `ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS` |
| NodeId argument is not a bigint                                                                                                                                      | `TypeError`                       | —                                     |
| Bigint has no valid private NodeId encoding                                                                                                                          | `Error`                           | `ERR_TAFFY_INVALID_NODE_ID`           |
| Well-formed NodeId belongs to another tree                                                                                                                           | `Error`                           | `ERR_TAFFY_FOREIGN_NODE_ID`           |
| Well-formed local NodeId no longer names its registered node                                                                                                         | `Error`                           | `ERR_TAFFY_STALE_NODE_ID`             |
| Secure random provider fails while constructing a tree                                                                                                               | `Error`                           | —                                     |
| Per-tree NodeId serial is exhausted before native creation                                                                                                           | `RangeError`                      | —                                     |
| Duplicate, attached-child, self, cycle, nonchild-removal, or other fixed topology violation                                                                          | `Error`                           | `ERR_TAFFY_INVALID_TOPOLOGY`          |
| Same-tree native entry during measurement                                                                                                                            | `Error`                           | `ERR_TAFFY_TREE_BUSY`                 |
| Unexpected panic or wrapper/native divergence                                                                                                                        | `Error`                           | `ERR_TAFFY_INTERNAL`                  |
| Native entry after an unexpected internal failure poisoned the owner                                                                                                 | `Error`                           | `ERR_TAFFY_TREE_POISONED`             |
| User callback throws                                                                                                                                                 | The exact thrown JavaScript value | unchanged                             |

## Public type and value contract

The authored public entry is `packages/taffyjs-node/src/index.ts`. napi-rs generates a private `packages/taffyjs-node/native.js` and `native.d.ts`; `vp pack` produces the public `index.js` and `index.d.ts`. The package exports only `.` and `./package.json`. The raw native class, raw Taffy NodeId, generated raw operations, and `__bootstrap` are not public exports or reachable supported package subpaths. Absolute filesystem access to an installed package's internal files is unsupported and is not a security boundary this package claims to prevent.

The root package's optional dependencies are exactly the four `@taffyjs/binding-<platform>` names and target binaries in the canonical JSON, all at the same placeholder version `0.0.0` during this run. All five manifests remain `private: true` and `UNLICENSED`. As part of `INFRA-002`, the authored workspace must resolve `@types/node` exactly `22.18.0`, matching the minimum runtime family rather than the current host; this makes ordinary typed uses of newer Node APIs fail before runtime evidence without treating the preimplementation dependency as an initialization blocker. The same task authors the packed root manifest's `engines.node` exactly equal to both `pins.node` and `tarballContents.rootManifest.engines.node`, namely `>=22.18.0`; the workspace root's engine declaration cannot substitute for the packed package field, and the target does not become a preimplementation initialization requirement. The root tarball contains exactly `package.json`, `README.md`, the built public `index.js`, public `index.d.ts`, and private runtime loader `native.js`; it contains no root `.node` binary, private `native.d.ts`, source, tests, or generated raw declaration. Each platform tarball contains exactly its `package.json`, `README.md`, and one named `.node` binary. One local empty-consumer test packs the root and current-host platform packages, installs both tarballs without registry fallback under the current runtime, imports only `@taffyjs/node`, and proves the loader selected that platform package. A second empty consumer installs the same tarballs without registry fallback and runs the canonical minimum-Node compatibility projection through Vite+'s exact managed Node `22.18.0`; it asserts the runtime version before import, reexecutes all 816 package-facing API/type/test public-js acceptance bodies from the same registered sources, and collects the 58 generated public-surface probes. Remote CI may prove the other declared tarballs, but an unexecuted target remains reported rather than inferred.

The canonical JSON's `publicDeclarationContract` is the sole machine authority for the complete packed declaration: it contains every fixed declaration statement, exact class member, numeric-family and geometry generation template, all 41 Style input/output property types, the required nullable-field JSDoc, assembly order, and one pinned formatting command. The checker synthesizes the expected source directly from this data, projects it by owner during incremental work, lexically removes JSDoc from expected and actual sources, formats both, and requires those declaration skeletons to match byte-for-byte. It separately requires the exact nullable-property comment and the complete JSDoc coverage owned by `MATURITY-001`. The pinned TypeScript CLI then checks both full sources under strict mode and `exactOptionalPropertyTypes`. This rejects any missing, additional, reordered, or changed export, declaration, member, overload, optional marker, readonly marker, generic, parameter type, or return type without preventing useful public documentation and without depending on an unavailable JavaScript compiler API. The code and prose below are its human-readable mirror; they are not a second source from which an implementation agent may invent signatures.

The public declarations must include the following class surface exactly; type aliases and interfaces named later in this file mirror the canonical fixed statements and generation rules:

```ts
declare const phantomMarker: unique symbol;

export type NodeId = bigint & { readonly [phantomMarker]: never };

export interface ChildRangeInput {
  start: number;
  end: number;
}

export class TaffyTree<TContext = unknown> {
  constructor();
  enableRounding(): void;
  disableRounding(): void;
  newLeaf(style: StyleInput): NodeId;
  newLeafWithContext(style: StyleInput, context: TContext | undefined): NodeId;
  newWithChildren(style: StyleInput, children: readonly NodeId[]): NodeId;
  clear(): void;
  remove(node: NodeId): void;
  setNodeContext(node: NodeId, context: TContext | undefined): void;
  getNodeContext(node: NodeId): TContext | undefined;
  addChild(parent: NodeId, child: NodeId): void;
  insertChildAtIndex(parent: NodeId, index: number, child: NodeId): void;
  setChildren(parent: NodeId, children: readonly NodeId[]): void;
  removeChild(parent: NodeId, child: NodeId): void;
  removeChildAtIndex(parent: NodeId, index: number): NodeId;
  removeChildrenRange(parent: NodeId, range: ChildRangeInput): void;
  replaceChildAtIndex(parent: NodeId, index: number, newChild: NodeId): NodeId;
  getChildAtIndex(parent: NodeId, index: number): NodeId;
  getChildCount(parent: NodeId): number;
  getNodeCount(): number;
  getParent(node: NodeId): NodeId | null;
  getChildren(parent: NodeId): readonly NodeId[];
  setStyle(node: NodeId, style: StyleInput): void;
  getStyle(node: NodeId): Style;
  getLayout(node: NodeId): Layout;
  getUnroundedLayout(node: NodeId): Layout;
  getDetailedLayoutInfo(node: NodeId): DetailedLayoutInfo;
  markDirty(node: NodeId): void;
  isDirty(node: NodeId): boolean;
  computeLayout(options: ComputeLayoutOptions): void;
  computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void;
}
```

`remove` and `removeChild` intentionally return `void`: the Rust return repeats the input identifier, and `remove` would return an identifier that has already become stale. `removeChildAtIndex` and `replaceChildAtIndex` retain their informative removed identifier. `getParent` maps Rust `None` to `null`; context absence remains the separately vouched `undefined` special case.

The native context is exactly `TaffyTree<()>`; the JavaScript registry is the sole owner of user values. `getNodeContext` validates and reads only the wrapper's public-ID and context registries, never probes the native owner, and therefore remains available inside a measure callback; setters and all native-backed reads remain governed by the busy boundary. Taffy 0.13 leaves stale unit-only `node_context_data` entries behind in `remove` and `clear`. The binding must delete the corresponding JavaScript registry entries, prove that old markers cannot reach a reused public ID or retain a JavaScript value, and otherwise preserve this pinned Taffy behavior. It must not call `set_node_context(None)` before removal merely to erase `()`, because that would introduce dirtying that Taffy's `remove` does not perform.

The public NodeId encoding is a private unsigned 256-bit composition: bits 128 through 255 contain a cryptographically random per-tree 128-bit token, bits 64 through 127 contain a monotonically increasing nonzero per-tree `u64` creation serial, and bits 0 through 63 contain Taffy's raw `u64` NodeId. Secure token generation failure rejects construction. The serial never resets on `clear`; exhaustion rejects creation before native mutation. The wrapper keeps `raw NodeId -> current serial` and exact public-ID registries, so raw slot reuse never revives a stale public ID. The encoding remains opaque: parsing, arithmetic, persistence, cross-worker transfer, and construction by users are unsupported even though the runtime representation is bigint.

The shared geometry declarations are exactly `PointInput<T>`, `SizeInput<T>`, `RectInput<T>`, and `LineInput<T>` with mutable required Taffy-named components; Style-only `PartialPointInput<T>`, `PartialSizeInput<T>`, `PartialRectInput<T>`, and `PartialLineInput<T>` with mutable optional `| undefined` components; and complete readonly `Point<T>`, `Size<T>`, `Rect<T>`, and `Line<T>` outputs. Arrays and tuples are not geometry records. The exact declarations and semantics are the selected ones in [Case 2](binding-cases.md#selected-geometry-record-representation).

The shared enum helper is `export type EnumValue<Family extends Readonly<Record<string, number>>> = Family[keyof Family]`. Each runtime family is an `Object.freeze`d ordinary object; its same-named type is `EnumValue<typeof Family>`. Codes are the binding's public codes, not Rust discriminants. Every family assigns `0`, `1`, and onward in the exact member order listed below, and one neutral checked-in schema generates the TypeScript constants and types, Rust validation and conversion matches, and code fixtures. Named members are the documented and repository-wide form. Equivalent raw numeric literals remain supported but explicitly not recommended. These assignments are fixed for this contract; compatibility guarantees for a later released version remain part of the separate versioning decision that this run does not make.

| Family                      | Members in exact code order                                                                                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Display`                   | `Block`, `FlowRoot`, `Flex`, `Grid`, `None`                                                                                                                                                           |
| `BoxSizing`                 | `BorderBox`, `ContentBox`                                                                                                                                                                             |
| `Direction`                 | `Ltr`, `Rtl`                                                                                                                                                                                          |
| `Overflow`                  | `Visible`, `Clip`, `Hidden`, `Scroll`                                                                                                                                                                 |
| `Float`                     | `Left`, `Right`, `None`                                                                                                                                                                               |
| `Clear`                     | `Left`, `Right`, `Both`, `None`                                                                                                                                                                       |
| `Position`                  | `Relative`, `Absolute`                                                                                                                                                                                |
| `TextAlign`                 | `Auto`, `LegacyLeft`, `LegacyRight`, `LegacyCenter`                                                                                                                                                   |
| `FlexDirection`             | `Row`, `Column`, `RowReverse`, `ColumnReverse`                                                                                                                                                        |
| `FlexWrap`                  | `NoWrap`, `Wrap`, `WrapReverse`                                                                                                                                                                       |
| `GridAutoFlow`              | `Row`, `Column`, `RowDense`, `ColumnDense`                                                                                                                                                            |
| `AlignItems`                | `Start`, `End`, `FlexStart`, `FlexEnd`, `SelfStart`, `SelfEnd`, `Center`, `Baseline`, `Stretch`, `SafeStart`, `SafeEnd`, `SafeFlexStart`, `SafeFlexEnd`, `SafeSelfStart`, `SafeSelfEnd`, `SafeCenter` |
| `AlignContent`              | `Start`, `End`, `FlexStart`, `FlexEnd`, `Center`, `Stretch`, `SpaceBetween`, `SpaceEvenly`, `SpaceAround`, `SafeStart`, `SafeEnd`, `SafeFlexStart`, `SafeFlexEnd`, `SafeCenter`                       |
| `LengthUnit`                | `Length`, `Percent`, `Auto`                                                                                                                                                                           |
| `AvailableSpaceKind`        | `Definite`, `MinContent`, `MaxContent`                                                                                                                                                                |
| `GridPlacementKind`         | `Auto`, `Line`, `NamedLine`, `Span`, `NamedSpan`                                                                                                                                                      |
| `TrackSizingKind`           | `Length`, `Percent`, `Auto`, `MinContent`, `MaxContent`, `FitContent`, `Fr`                                                                                                                           |
| `RepetitionCountKind`       | `Count`, `AutoFill`, `AutoFit`                                                                                                                                                                        |
| `GridTemplateComponentKind` | `Single`, `Repeat`                                                                                                                                                                                    |
| `DetailedLayoutInfoKind`    | `None`, `Grid`                                                                                                                                                                                        |

Semantic lengths use the exact numeric-tagged input and readonly output unions selected in [Case 2](binding-cases.md#selected-tagged-semantic-length-representation). `Dimension.Length(value)`, `Dimension.Percent(value)`, and `Dimension.Auto` construct ordinary canonical records. Percentages use user-facing magnitudes, so `50` maps to Taffy's `0.5` and reads back as `50`. `Dimension`, `LengthPercentage`, and `LengthPercentageAuto` output types preserve the numeric `LengthUnit` vocabulary and may be reused as inputs.

Available space uses the exact numeric-tagged input and output unions selected in [Case 2](binding-cases.md#selected-availablespace-representation). `AvailableSpace.Definite(value)`, `AvailableSpace.MinContent`, and `AvailableSpace.MaxContent` construct ordinary canonical records. A whole bare number, string, symbol, or reserved number is never another representation.

Grid uses the exact `GridPlacementInput`, `MinTrackSizingFunctionInput`, `MaxTrackSizingFunctionInput`, `TrackSizingFunctionInput`, `RepetitionCountInput`, `GridTemplateRepetitionInput`, `GridTemplateComponentInput`, `GridTemplateAreasInput`, and `GridTemplateAreaInput` declarations selected in [Case 2](binding-cases.md#selected-grid-representation), with complete recursively readonly unsuffixed mirrors. Runtime helpers are `GridPlacement.Auto`, `Line(index)`, `NamedLine(name, index)`, `Span(span)`, and `NamedSpan(name, span)`; `TrackSizingFunction.Length(value)`, `Percent(value)`, `Auto`, `MinContent`, `MaxContent`, `FitContent(value)`, `Fr(value)`, and `MinMax(min, max)`; `RepetitionCount.Count(value)`, `AutoFill`, and `AutoFit`; and `GridTemplateComponent.Single(value)` and `Repeat(count, tracks, lineNames = [])`. Ordinary tagged branches ignore unrelated extra properties, while required payloads remain required. Style and geometry retain their explicit unknown-field rejection.

All six value-helper namespace objects are frozen. Each fieldless property convenience (`Dimension.Auto`, the two content-sized `AvailableSpace` values, `GridPlacement.Auto`, the intrinsic fieldless track values, and the two automatic repetition counts) is a recursively frozen shared canonical record and has the corresponding recursively readonly canonical-output branch type. Every payload-taking helper returns a fresh mutable ordinary input record and fresh nested records that the helper itself constructs; caller-supplied payload objects and arrays may remain referenced until the later complete native conversion copies them. Readonly fieldless constants remain structurally valid input values. These helper-only constants do not freeze direct caller input or any tree or callback output, and callers must not rely on whole-record identity.

`i16` grid line indices and `u16` spans, repetition counts, dimensions, and coordinates accept only finite exact integers in range. They are not semantically clamped. The converter must reject with an uncoded `RangeError` the pinned combination in which the corresponding top-level line-name traversal can reach a positive resolved repeat whose internal `lineNames` array is empty; it must test both axes and must not rewrite the stored Style. All other safely representable edge cases pass to Taffy.

The computation types are exact:

```ts
export type MeasureArgs<TContext> = Readonly<{
  knownDimensions: Size<number | undefined>;
  availableSpace: Size<AvailableSpace>;
  node: NodeId;
  context: TContext | undefined;
  style: Style;
}>;

export type MeasureFunction<TContext> = (args: MeasureArgs<TContext>) => SizeInput<number>;

export interface ComputeLayoutOptions {
  root: NodeId;
  availableSpace: SizeInput<AvailableSpaceInput>;
}

export interface ComputeLayoutWithMeasureOptions<TContext> {
  root: NodeId;
  availableSpace: SizeInput<AvailableSpaceInput>;
  measure: MeasureFunction<TContext>;
}
```

`Layout` is one complete readonly snapshot with exactly eight fields under the active features: `order: number`, `location: Point<number>`, `size: Size<number>`, `contentSize: Size<number>`, `scrollbarSize: Size<number>`, `border: Rect<number>`, `padding: Rect<number>`, and `margin: Rect<number>`. Layout has no public constructors or prototype helpers.

`DetailedLayoutInfo` is the readonly union `{ readonly kind: typeof DetailedLayoutInfoKind.None } | { readonly kind: typeof DetailedLayoutInfoKind.Grid; readonly value: DetailedGridInfo }`. `DetailedGridInfo` has readonly `rows`, `columns`, and `items`; each tracks value has readonly `negativeImplicitTracks`, `explicitTracks`, `positiveImplicitTracks`, `gutters`, and `sizes`; each item has readonly `rowStart`, `rowEnd`, `columnStart`, and `columnEnd`. Arrays and all nested records are detached snapshots.

The exact public runtime named-export set is the following 27 symbols, with no default export: `TaffyTree`; the 20 numeric family objects `Display`, `BoxSizing`, `Direction`, `Overflow`, `Float`, `Clear`, `Position`, `TextAlign`, `FlexDirection`, `FlexWrap`, `GridAutoFlow`, `AlignItems`, `AlignContent`, `LengthUnit`, `AvailableSpaceKind`, `GridPlacementKind`, `TrackSizingKind`, `RepetitionCountKind`, `GridTemplateComponentKind`, and `DetailedLayoutInfoKind`; and the six value-helper objects `Dimension`, `AvailableSpace`, `GridPlacement`, `TrackSizingFunction`, `RepetitionCount`, and `GridTemplateComponent`. Ownership is exact: `API-TREE-001` owns `TaffyTree`; `INFRA-003` owns all 20 numeric families; `TYPE-LENGTH-001` owns `Dimension`; `TYPE-AVAILABLE-001` owns `AvailableSpace`; and `TYPE-GRID-001` owns the four Grid helpers.

The exact public declaration export set is closed by the following ownership table. A name that merges a type with a runtime value appears once in each applicable inventory; that is not duplicate ownership. There are no additional aliases such as `AlignSelf` or `JustifyContent`, no constructor classes for records, and no raw native declaration exports.

| Sole owner           | Exact declaration exports                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `API-TREE-001`       | `TaffyTree`                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `TYPE-NODEID-001`    | `NodeId`                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `API-TREE-016`       | `ChildRangeInput`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `INFRA-003`          | `EnumValue` and the 20 same-named numeric family types listed in the runtime inventory                                                                                                                                                                                                                                                                                                                                                                            |
| `TYPE-GEOMETRY-001`  | `PointInput`, `PartialPointInput`, `Point`, `SizeInput`, `PartialSizeInput`, `Size`, `RectInput`, `PartialRectInput`, `Rect`, `LineInput`, `PartialLineInput`, `Line`                                                                                                                                                                                                                                                                                             |
| `TYPE-LENGTH-001`    | `LengthInput`, `PercentInput`, `AutoInput`, `LengthPercentageInput`, `LengthPercentageAutoInput`, `DimensionInput`, `LengthPercentage`, `LengthPercentageAuto`, `Dimension`                                                                                                                                                                                                                                                                                       |
| `TYPE-AVAILABLE-001` | `AvailableSpaceInput`, `AvailableSpace`                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `TYPE-GRID-001`      | `GridPlacementInput`, `GridPlacement`, `MinTrackSizingFunctionInput`, `MinTrackSizingFunction`, `MaxTrackSizingFunctionInput`, `MaxTrackSizingFunction`, `TrackSizingFunctionInput`, `TrackSizingFunction`, `RepetitionCountInput`, `RepetitionCount`, `GridTemplateRepetitionInput`, `GridTemplateRepetition`, `GridTemplateComponentInput`, `GridTemplateComponent`, `GridTemplateAreasInput`, `GridTemplateAreas`, `GridTemplateAreaInput`, `GridTemplateArea` |
| `TYPE-STYLE-001`     | `StyleInput`, `Style`                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `TYPE-LAYOUT-001`    | `Layout`                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `TYPE-DETAIL-001`    | `DetailedLayoutInfo`, `DetailedGridInfo`, `DetailedGridTracksInfo`, `DetailedGridItemInfo`                                                                                                                                                                                                                                                                                                                                                                        |
| `TYPE-MEASURE-001`   | `MeasureArgs`, `MeasureFunction`                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `API-TREE-030`       | `ComputeLayoutWithMeasureOptions`                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `API-TREE-031`       | `ComputeLayoutOptions`                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Topology contract

The supported wrapper always maintains a rooted forest: a node has at most one parent, a parent's child list contains no duplicate, and no self-edge or cycle exists. All topology inputs are validated before native mutation. `addChild`, `insertChildAtIndex`, `newWithChildren`, and `replaceChildAtIndex` require the new child to be unattached. `setChildren` is the sole reparenting operation: it may atomically detach listed children from other parents, detaches omitted current children, preserves the supplied order, and rejects duplicates, self, or an ancestor that would create a cycle.

`replaceChildAtIndex(parent, index, existingChildAtThatIndex)` is a successful no-op that returns the same child and does not dirty the tree; this avoids Taffy 0.13's inconsistent same-child parent update. Any other already-attached replacement is rejected. `removeChild` accepts only a direct child. `removeChildrenRange` uses the complete ordinary `{ start, end }` record and a half-open `[start, end)` range with `0 <= start <= end <= childCount`; unrelated extra properties are ignored. Indices and range bounds are nonnegative JavaScript safe integers; no truncation or coercion occurs.

Every failed topology operation leaves node count, parent links, child order, dirty state, Style, Layout, NodeId liveness, and context registry unchanged. Ordinary successful topology calls inherit Taffy's dirtying behavior rather than adding automatic computation. Taffy 0.13's `remove(node)` is the deliberate exception among successful relationship mutations: it removes the node and relation without dirtying the former parent. The binding preserves that pinned behavior; a caller that needs a recomputation after removing a child must retain the parent ID and call `markDirty(parent)` explicitly.

## API task catalog

The checkboxes below are immutable required task declarations, not mutable progress markers. `loop-status.md` records their state. Every bracketed slug after `Acceptance:` is one ordinary acceptance ID named `<TASK-ID>/<slug>`; prose, a range such as `A1..A6`, or one check standing in for several slugs is not evidence. `primaryEvidenceRules` resolves that ID to exactly one public-JS, native-JS, wrapper-JS, minimum-Node-JS, TypeScript, Rust-contract, machine-check, or command-attestation modality with a fixed runner, path, and collected identity. Runtime behavior remains runtime evidence, declaration-only properties remain TypeScript evidence, Rust ownership and auto-trait properties remain Rust evidence, checker integrity remains machine evidence, and a whole-run outcome that cannot test itself uses a post-command attestation. Every primary identity must independently fail when its assertion is broken; evidence in another modality may strengthen it but never replace it. The three canonical generated expansions—Style fields, NodeId roles, and mutation failures—add their exact IDs under their sole owning common task and are equally mandatory. Every NodeId role also participates in `TEST-COMMON-NODEID`, and every failing mutation participates in `TEST-COMMON-ATOMICITY`.

### Construction, configuration, lifecycle, and context

- [ ] **API-TREE-001 — `TaffyTree::new` and `Default` → `new TaffyTree<TContext>()`.** Expect an empty independently tokenized tree with rounding enabled and no public native escape. Acceptance: [`construct`] construction succeeds with the pinned default; [`rng-failure`] secure-random failure rejects synchronously before any tree, registry, or native owner becomes reachable to caller code, without prescribing whether an unreachable temporary native owner was constructed and dropped; [`generic`] declaration inference preserves `TContext`; [`export-boundary`] only the authored class is reachable. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-001.test.mts`.
- [ ] **API-TREE-002 — `enable_rounding` → `enableRounding(): void`.** Expect only Taffy's rounding configuration to change; do not compute or invent freshness. Acceptance: [`select-rounded`] a fractional fixture selects the rounded stored result; [`reenable`] re-enabling after an unrounded compute, including across `clear`, follows pinned Taffy; [`no-compute`] the call itself performs no computation. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-002.test.mts`.
- [ ] **API-TREE-003 — `disable_rounding` → `disableRounding(): void`.** Expect default-on rounding to become disabled and `getLayout` to select stored unrounded output without computing. Acceptance: [`select-unrounded`] a fractional fixture selects the unrounded stored result; [`repeat-toggle`] repeated toggles, including across `clear`, follow pinned Taffy; [`no-compute`] the call itself performs no computation. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-003.test.mts`.
- [ ] **API-TREE-004 — `new_leaf` → `newLeaf(style): NodeId`.** Expect complete Style conversion before creation, one atomic public registration, and no node on conversion failure. Acceptance: [`default-style`] `{}` creates exactly one node whose Style is default; [`nondefault-style`] a representative complete conversion is stored; [`stable-id`] count and Style reads use the same public ID; [`conversion-atomic`] failed Style conversion creates and registers nothing. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-004.test.mts`. Root, child, dirty, and zero-Layout observations belong to their respective getter tasks rather than creating forward dependencies here.
- [ ] **API-TREE-005 — `new_leaf_with_context` → `newLeafWithContext(style, context): NodeId`.** Expect the same creation guarantees plus, for a present context, a native `Some(())` presence marker and exact JS-registry value; `undefined` is absence and `null` is present. Acceptance: [`identity`] an object is returned and measured by exact identity; [`primitive-null-undefined`] primitives and `null` are present while `undefined` is absent; [`removal-cleanup`] remove and clear release the registry value; [`callback-delivery`] measurement receives the selected value; [`conversion-atomic`] failed Style conversion creates neither node nor context entry. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-005.test.mts`.
- [ ] **API-TREE-006 — `new_with_children` → `newWithChildren(style, children): NodeId`.** Expect complete Style, ID, uniqueness, unattached-child, and allocation checks before native creation; success preserves order and assigns all parents. Acceptance: [`empty`] an empty list creates a root; [`ordered-children`] a nonempty list is stored in order with parent links; [`duplicate`] duplicate children reject; [`attached`] an attached child rejects; [`invalid-id`] foreign and stale children reject; [`failure-atomic`] every failure preserves counts and relations. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-006.test.mts`.
- [ ] **API-TREE-007 — `clear` → `clear(): void`.** Expect native nodes and the public-ID registry to clear together while the per-tree serial remains monotonic. Acceptance: [`empty-tree`] clearing an empty tree succeeds; [`leaf-tree`] a leaf-only tree becomes empty; [`ids-stale`] every old ID is stale; [`serial-monotonic`] raw-slot reuse yields a different public ID. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-007.test.mts`. Topology and context tasks separately own their clear-integration assertions after those registries exist; `API-TREE-002/reenable` and `API-TREE-003/repeat-toggle` include clear when proving Taffy's retained rounding configuration.
- [ ] **API-TREE-008 — `remove` → `remove(node): void`.** Expect detachment from a parent, direct children becoming roots, native deletion, registry deletion, and count decrement; the input ID becomes stale. Taffy's deliberate no-dirty behavior from the topology contract remains visible. Acceptance: [`remove-root`] a root is deleted; [`remove-child`] a child is detached and its own children become roots as pinned; [`id-stale`] repeat use fails and raw-slot reuse does not revive the ID; [`parent-not-dirtied`] the former parent remains clean and cached until explicitly marked dirty; [`invalid-atomic`] invalid-ID failure changes nothing. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-008.test.mts`. `API-TREE-005/removal-cleanup` separately owns context-registry cleanup after context support exists.
- [ ] **API-TREE-009 — `set_node_context` → `setNodeContext(node, context): void`.** Expect exact value replacement, `undefined` clearing, `null` presence, synchronized unit marker and registry, and unconditional Taffy dirtying even for an equal value. Acceptance: [`replace-identity`] an object is stored by exact identity; [`undefined-clears`] `undefined` removes presence; [`null-present`] `null` remains present; [`always-dirty`] equal replacement dirties the node and ancestors; [`measure-delivery`] later measurement receives the replacement; [`invalid-atomic`] invalid ID changes neither registry nor dirty state. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-009.test.mts`.
- [ ] **API-TREE-010 — `get_node_context` plus mutable-context helpers → `getNodeContext(node): TContext | undefined`.** Expect exact caller-owned identity with no copy or readonly wrapper; in-place mutation is visible and does not dirty automatically. Acceptance: [`absence`] absent context returns `undefined`; [`identity`] object, primitive, and `null` values preserve exact identity/value; [`manual-dirty`] in-place mutation is visible and requires explicit `markDirty`; [`generic`] the declaration returns `TContext | undefined`; [`invalid-id`] invalid IDs follow the fixed error table. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-010.test.mts`.

### Topology and metadata

- [ ] **API-TREE-011 — `add_child` → `addChild(parent, child): void`.** Expect append of one unattached child, parent update, and Taffy dirtying; reject duplicate, attached, self, cycle, or invalid ID before mutation. Acceptance: [`append`] order and parent update; [`dirty`] node and ancestors follow Taffy dirtying; [`topology-reject`] duplicate, attached, self, and cycle reject; [`id-roles`] every NodeId argument role uses the shared matrix; [`failure-atomic`] every rejected call preserves the complete snapshot. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-011.test.mts`.
- [ ] **API-TREE-012 — `insert_child_at_index` → `insertChildAtIndex(parent, index, child): void`.** Expect insertion at start, middle, or end with `index === childCount` allowed and the topology contract applied. Acceptance: [`positions`] all three positions preserve order; [`end-bound`] the inclusive end insertion succeeds; [`index-errors`] non-safe and out-of-range indices follow the fixed errors; [`id-roles`] every NodeId role uses the shared matrix; [`failure-atomic`] every rejected call preserves the complete snapshot. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-012.test.mts`.
- [ ] **API-TREE-013 — `set_children` → `setChildren(parent, children): void`.** Expect the sole atomic reparent operation defined above. Acceptance: [`replace-order`] empty, replace, reorder, and idempotent lists have exact order; [`reparent`] children move atomically from multiple old parents; [`detach-omitted`] omitted old children become roots; [`dirty`] affected paths follow Taffy dirtying; [`topology-reject`] duplicate, self, and cycle reject; [`invalid-middle`] one invalid middle element changes nothing; [`failure-atomic`] all observable pre-failure state is equal. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-013.test.mts`.
- [ ] **API-TREE-014 — `remove_child` → `removeChild(parent, child): void`.** Expect only a direct relation to detach while both nodes remain live. Acceptance: [`detach`] order contracts and child becomes a root; [`nonchild`] nonchild and repeat removal reject before Taffy's panic-capable path; [`dirty`] affected paths follow Taffy dirtying; [`id-roles`] both roles use the shared matrix; [`failure-atomic`] every rejected call preserves the complete snapshot. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-014.test.mts`.
- [ ] **API-TREE-015 — `remove_child_at_index` → `removeChildAtIndex(parent, index): NodeId`.** Expect the removed live child ID, parent clearing, and order contraction. Acceptance: [`positions`] first, middle, and last removals preserve remaining order; [`returned-id`] the exact stable child ID remains live; [`bounds`] empty and out-of-bounds use the coded RangeError; [`integer`] non-safe indices reject; [`failure-atomic`] every rejected call preserves the complete snapshot. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-015.test.mts`.
- [ ] **API-TREE-016 — `remove_children_range` → `removeChildrenRange(parent, { start, end }): void`.** Expect the half-open range contract and complete range validation before the upstream panic-capable drain. Acceptance: [`ranges`] empty, middle, and full ranges behave exactly; [`detached-live`] removed children remain live roots; [`range-errors`] reversed, out-of-bounds, noninteger, and unsafe bounds reject; [`extra-properties`] unrelated properties are ignored; [`failure-atomic`] every rejected call preserves the complete snapshot. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-016.test.mts`.
- [ ] **API-TREE-017 — `replace_child_at_index` → `replaceChildAtIndex(parent, index, newChild): NodeId`.** Expect an unattached replacement and return of the old live child; same-child is the defined no-op. Acceptance: [`replace`] order and both parent links update; [`returned-id`] the old stable child remains live; [`dirty`] a real replacement follows Taffy dirtying; [`same-noop`] same-child returns itself and changes no state; [`reject`] attached, cycle, and invalid index reject; [`id-roles`] every NodeId role uses the shared matrix; [`failure-atomic`] every rejected call preserves the complete snapshot. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-017.test.mts`.
- [ ] **API-TREE-018 — `child_at_index` and unchecked trait `get_child_id` → `getChildAtIndex(parent, index): NodeId`.** Expect the stable public child ID and controlled bounds handling before unchecked trait access. Acceptance: [`positions`] every current position returns the exact public ID; [`bounds`] empty and out-of-range use the coded RangeError; [`integer`] non-safe indices reject; [`invalid-parent`] all invalid parent forms reject before native access; [`declaration`] the result is `NodeId`. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-018.test.mts`.
- [ ] **API-TREE-019 — `TraversePartialTree::child_count` → `getChildCount(parent): number`.** Expect the exact current direct-child count as a nonnegative JavaScript safe integer. Acceptance: [`empty`] an empty parent returns zero; [`topology-sequence`] add, insert, set, remove, range, and clear transitions return exact counts; [`number-result`] observed counts are exact nonnegative safe integers; [`invalid-parent`] invalid parents follow the fixed errors. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-019.test.mts`.
- [ ] **API-TREE-020 — `total_node_count` → `getNodeCount(): number`.** Expect exactly the native nodes still stored, independent of attachment, as a nonnegative JavaScript safe integer. Acceptance: [`initial`] a new tree reports zero; [`leaf-clear`] newLeaf and clear report exact counts; [`number-result`] observed counts are exact nonnegative safe integers. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-020.test.mts`. Every later creator and remover owns one count assertion in its own task, and `TEST-ALGORITHMS-001` proves their combined sequence.
- [ ] **API-TREE-021 — `parent` → `getParent(node): NodeId | null`.** Expect `null` for a root and the stable current public parent otherwise. Acceptance: [`root-null`] every root reads as `null`; [`attached`] attached child returns the exact parent ID; [`transitions`] reparent and detach transitions are exact; [`slot-reuse`] raw-slot reuse never aliases a prior parent; [`invalid-id`] invalid nodes follow the fixed errors; [`declaration`] ordinary null narrowing works. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-021.test.mts`. `API-TREE-008/remove-child` owns the later remove-parent observation.
- [ ] **API-TREE-022 — `children` and trait `child_ids` → `getChildren(parent): readonly NodeId[]`.** Expect an ordered detached runtime array of stable public IDs. Acceptance: [`empty`] an empty parent returns an empty array; [`ordered`] nonempty, reparented, and detached states preserve exact order; [`stable-ids`] elements are the registered public IDs; [`detached-array`] mutating the returned runtime array does not mutate the tree; [`readonly`] declarations recursively prevent mutation intent; [`invalid-parent`] invalid parents follow the fixed errors. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-022.test.mts`.

### Style, layout, dirty state, and computation

- [ ] **API-TREE-023 — `set_style` → `setStyle(node, style): void`.** Expect one synchronous wrapper-to-native entry, complete default-filled Style conversion inside that entry before one Taffy `set_style` mutation, Taffy dirtying, no merge, and no semantic normalization beyond the universal rules. Acceptance: [`complete-replace`] `{}` resets all prior fields to defaults; [`undefined-null`] missing, `undefined`, and nullable `null` follow the matrix; [`unknown-calc`] unknown fields and calc reject; [`conversion-families`] every selected converter is reachable; [`dirty`] successful replacement follows Taffy dirtying; [`failure-atomic`] old Style and dirty state survive conversion failure; [`invalid-id`] every NodeId case follows the shared matrix. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-023.test.mts`; the field-by-field proof is separately owned by `TEST-STYLE-001`.
- [ ] **API-TREE-024 — `style` → `getStyle(node): Style`.** Expect a complete detached eager ordinary object with all 41 fields, canonical stored values, readonly declarations, and no runtime freeze. Acceptance: [`exact-keys`] defaults and nondefaults have exactly 41 keys; [`null-output`] nullable `None` reads as `null`; [`stored-f32`] numbers reflect actual f32 storage; [`deep-detached`] nested runtime mutation cannot affect native state; [`reusable-input`] output is accepted where its declared input mirror permits; [`independent-snapshots`] repeated reads share no mutable record or array; [`readonly`] recursive declaration mutation fails; [`invalid-id`] invalid IDs follow the fixed errors. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-024.test.mts`; the field-by-field proof is separately owned by `TEST-STYLE-001`.
- [ ] **API-TREE-025 — `layout` → `getLayout(node): Layout`.** Expect the currently stored rounded or unrounded snapshot selected by Taffy's current config, without computation. Acceptance: [`exact-zero`] a new node has exactly the eight zero/default fields; [`rounding-selection`] computed fractional values follow current configuration; [`stale-stored`] mutation does not trigger computation and the prior stored value remains; [`detached`] runtime mutation cannot affect native state; [`readonly`] recursive declaration mutation fails; [`numeric-widening`] f32 and u32 conversions preserve stored values; [`invalid-id`] invalid IDs follow the fixed errors. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-025.test.mts`.
- [ ] **API-TREE-026 — `unrounded_layout` → `getUnroundedLayout(node): Layout`.** Expect the currently stored unrounded snapshot regardless of rounding config, without computation. Acceptance: [`exact-zero`] a new node has the exact zero snapshot; [`fractional`] output stays unrounded under either configuration; [`stale-stored`] mutation does not trigger computation; [`detached`] runtime mutation cannot affect native state; [`readonly`] recursive declaration mutation fails; [`invalid-id`] invalid IDs follow the fixed errors. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-026.test.mts`.
- [ ] **API-TREE-027 — `detailed_layout_info` → `getDetailedLayoutInfo(node): DetailedLayoutInfo`.** Expect a complete detached readonly numeric-tagged snapshot. Acceptance: [`new-none`] an uncomputed node is `None`; [`empty-grid`] a computed empty Grid is `Grid`, not `None`; [`grid-payload`] a fixed nonempty 2x2 Grid reports all tracks, gutters, items, and 1-based coordinates; [`deep-detached`] nested runtime mutation cannot affect native state; [`narrowing`] the numeric tag narrows declarations; [`invalid-id`] invalid IDs follow the fixed errors; [`stale-upstream`] Grid then Flex recomputation preserves the prior Grid details exactly as pinned Taffy 0.13 does. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-027.test.mts`.
- [ ] **API-TREE-028 — `mark_dirty` → `markDirty(node): void`.** Expect Taffy's node-and-ancestor cache invalidation with no measured-leaf restriction and no Layout clearing. Acceptance: [`propagation`] leaf, root, and ancestors follow Taffy invalidation; [`idempotent`] repeated calls are stable; [`layout-retained`] stored Layout is unchanged; [`child-nuance`] unaffected child cache state follows Taffy; [`any-node`] measured and unmeasured nodes are accepted; [`invalid-id`] invalid IDs follow the fixed errors. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-028.test.mts`.
- [ ] **API-TREE-029 — `dirty` → `isDirty(node): boolean`.** Expect only Taffy's cache-empty query, not a promise that stored Layout is current. Acceptance: [`lifecycle`] new and post-compute states match Taffy; [`style`] Style replacement transition is exact; [`context`] context replacement transition is exact; [`topology`] every topology mutation, including remove's pinned exception, is exact; [`explicit`] explicit invalidation transition is exact; [`child-nuance`] a parent change may leave a child false until recomputation changes its position; [`invalid-id`] invalid IDs follow the fixed errors. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-029.test.mts`.
- [ ] **API-TREE-030 — `compute_layout_with_measure` → `computeLayoutWithMeasure(options): void`.** Expect the exact synchronous callback contract, public NodeId/context reconstruction, eager complete Style snapshot per actual callback, Taffy-controlled invocation/cache behavior, checked same-tree borrow, first-failure zero drain, requested-subtree invalidation, unchanged thrown value, and reusable unpoisoned tree. Acceptance: [`callback-args`] every callback field and absence representation is exact; [`result-f32`] complete Size results preserve f32 behavior including non-finite values; [`cache-calls`] zero, one, or multiple calls remain Taffy-controlled; [`same-tree-busy`] every native-backed read, mutation, removal, and nested compute on the same tree throws busy; [`js-only-reentry`] `getNodeContext`, NodeId primitive operations, and pure value helpers remain usable because they do not enter the native owner; [`different-tree`] another tree remains usable; [`throw-identity`] a callback-thrown value is rethrown unchanged; [`malformed-result`] wrong shapes and Promise results throw TypeError; [`zero-drain`] no later callback occurs after first failure; [`layout-nontransactional`] stored Layout follows the vouched nontransactional rule; [`context-identity`] context identity and in-place mutation are exact; [`recovery`] expected failure leaves the tree reusable and unpoisoned. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-030.test.mts`. `childIsolationRules` requires the `same-tree-busy` parent to run its scenario through one non-test child fixture; that child has no independent evidence ID or test-runner registration.
- [ ] **API-TREE-031 — `compute_layout` → `computeLayout(options): void`.** Expect explicit synchronous Taffy computation with zero intrinsic measure, validated complete available space, stored output update, cache reuse, and current rounding config. Acceptance: [`algorithms`] Flex, Grid, Block, Float, FlowRoot, and `Display.None` match direct Taffy fixtures; [`percentage-content`] percentage and content-size behavior match direct fixtures; [`stored-output`] public getters expose the completed result; [`cache`] unchanged input reuses Taffy's cache; [`rounding`] current rounding configuration controls the selected stored result; [`invalid-root`] invalid root fails before computation; [`invalid-space`] incomplete or malformed available space fails before computation; [`no-measure`] no user callback is invoked; [`wrapper-atomic`] failure changes no wrapper-owned state. Task evidence path: `tests/taffyjs-node/tests/api/API-TREE-031.test.mts`.

## Style field TODO matrix

`StyleInput` is a mutable camelCase ordinary object whose 41 outer properties are optional and explicitly include `| undefined`. Missing and `undefined` use the corresponding `Style::DEFAULT` field; fixed Style geometry may be partial and fills each omitted component from that enclosing field's default. `null` is accepted only by the eight rows marked nullable and maps to Taffy `None`; all eight properties carry the exact canonical `nullableInputJSDoc` text so `undefined` versus `null` is explicit at the declaration site. Unknown own enumerable string keys on Style and geometry records are rejected. `Style` output contains every field as a recursively readonly canonical value.

Each row is an immutable sub-TODO owned only by `TEST-STYLE-001`; `TYPE-STYLE-001`, `API-TREE-023`, and `API-TREE-024` consume its evidence but do not share ownership. `STYLE-Fxx` rows are not members of the top-level task set `T`, do not have independent state-machine rows or milestone entries, and inherit the state and three review verdicts of `TEST-STYLE-001`. For each row, the exact acceptance and primary test IDs are `STYLE-Fxx/default`, `STYLE-Fxx/missing`, `STYLE-Fxx/undefined`, `STYLE-Fxx/native`, `STYLE-Fxx/roundtrip`, `STYLE-Fxx/invalid`, `STYLE-Fxx/atomic`, and `STYLE-Fxx/semantic`, all registered in `tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts`. The `semantic` test is the last-column fixture or pinned native-field assertion, so a self-consistent but wrong input/output field swap cannot pass. `native` enumerates every member for an enum-like row. `invalid` covers wrong type and the row's null policy. The other IDs have their literal names' meaning.

| ID          | JS field                  | Input when present                                                           | Taffy default            | Required semantic fixture                                                                                   |
| ----------- | ------------------------- | ---------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `STYLE-F01` | `display`                 | `Display`                                                                    | `Display.Flex`           | Block, FlowRoot, Flex, Grid dispatch and None hidden layout                                                 |
| `STYLE-F02` | `itemIsTable`             | `boolean`                                                                    | `false`                  | strict boolean and block table-child parity                                                                 |
| `STYLE-F03` | `itemIsReplaced`          | `boolean`                                                                    | `false`                  | strict boolean and replaced intrinsic-size parity                                                           |
| `STYLE-F04` | `boxSizing`               | `BoxSizing`                                                                  | `BoxSizing.BorderBox`    | padding plus explicit size distinguishes both members                                                       |
| `STYLE-F05` | `direction`               | `Direction`                                                                  | `Direction.Ltr`          | RTL and LTR Grid or Flex parity                                                                             |
| `STYLE-F06` | `overflow`                | `PartialPointInput<Overflow>`                                                | `Visible` on both axes   | partial non-symmetric axes and Scroll behavior                                                              |
| `STYLE-F07` | `scrollbarWidth`          | `number`                                                                     | `0`                      | f32/non-finite storage and Scroll `scrollbarSize`                                                           |
| `STYLE-F08` | `float`                   | `Float`                                                                      | `Float.None`             | Left and Right block float parity                                                                           |
| `STYLE-F09` | `clear`                   | `Clear`                                                                      | `Clear.None`             | Left, Right, and Both after floats                                                                          |
| `STYLE-F10` | `position`                | `Position`                                                                   | `Position.Relative`      | relative and absolute layout                                                                                |
| `STYLE-F11` | `inset`                   | `LengthPercentageAutoInput` or `PartialRectInput<LengthPercentageAutoInput>` | `Auto` on all sides      | scalar expansion, partial side, and absolute inset                                                          |
| `STYLE-F12` | `size`                    | `DimensionInput` or `PartialSizeInput<DimensionInput>`                       | `Auto` on both axes      | scalar/partial and fixed/percent layout                                                                     |
| `STYLE-F13` | `minSize`                 | `DimensionInput` or `PartialSizeInput<DimensionInput>`                       | `Auto` on both axes      | minimum clamp                                                                                               |
| `STYLE-F14` | `maxSize`                 | `DimensionInput` or `PartialSizeInput<DimensionInput>`                       | `Auto` on both axes      | maximum clamp                                                                                               |
| `STYLE-F15` | `aspectRatio`             | `number \| null`                                                             | `null`                   | null versus NaN and single-known-axis derivation                                                            |
| `STYLE-F16` | `margin`                  | `LengthPercentageAutoInput` or `PartialRectInput<LengthPercentageAutoInput>` | `Length(0)` on all sides | scalar/partial/Auto and block margin behavior                                                               |
| `STYLE-F17` | `padding`                 | `LengthPercentageInput` or `PartialRectInput<LengthPercentageInput>`         | `Length(0)` on all sides | content/border box parity                                                                                   |
| `STYLE-F18` | `border`                  | `LengthPercentageInput` or `PartialRectInput<LengthPercentageInput>`         | `Length(0)` on all sides | all Layout border sides                                                                                     |
| `STYLE-F19` | `alignItems`              | `AlignItems \| null`                                                         | `null`                   | all 16 members and SafeCenter                                                                               |
| `STYLE-F20` | `alignSelf`               | `AlignItems \| null`                                                         | `null`                   | child override of parent alignment                                                                          |
| `STYLE-F21` | `justifyItems`            | `AlignItems \| null`                                                         | `null`                   | Grid inline-axis placement                                                                                  |
| `STYLE-F22` | `justifySelf`             | `AlignItems \| null`                                                         | `null`                   | Grid child override                                                                                         |
| `STYLE-F23` | `alignContent`            | `AlignContent \| null`                                                       | `null`                   | all 14 members and space distribution                                                                       |
| `STYLE-F24` | `justifyContent`          | `AlignContent \| null`                                                       | `null`                   | Flex main axis and Grid inline axis                                                                         |
| `STYLE-F25` | `gap`                     | `LengthPercentageInput` or `PartialSizeInput<LengthPercentageInput>`         | `Length(0)` on both axes | scalar/non-symmetric Flex and Grid gaps                                                                     |
| `STYLE-F26` | `textAlign`               | `TextAlign`                                                                  | `TextAlign.Auto`         | all four members and block legacy alignment                                                                 |
| `STYLE-F27` | `flexDirection`           | `FlexDirection`                                                              | `FlexDirection.Row`      | all four axis/order variants                                                                                |
| `STYLE-F28` | `flexWrap`                | `FlexWrap`                                                                   | `FlexWrap.NoWrap`        | all three constrained-container variants                                                                    |
| `STYLE-F29` | `flexBasis`               | `DimensionInput`                                                             | `Dimension.Auto`         | Length/Percent/Auto interaction with size                                                                   |
| `STYLE-F30` | `flexGrow`                | `number`                                                                     | `0`                      | f32 edge storage and multi-child grow                                                                       |
| `STYLE-F31` | `flexShrink`              | `number`                                                                     | `1`                      | f32 edge storage and constrained shrink                                                                     |
| `STYLE-F32` | `gridTemplateRows`        | `GridTemplateComponentInput[]`                                               | `[]`                     | every component and row-axis nested-copy behavior                                                           |
| `STYLE-F33` | `gridTemplateColumns`     | `GridTemplateComponentInput[]`                                               | `[]`                     | every component and column-axis nested-copy behavior                                                        |
| `STYLE-F34` | `gridAutoRows`            | `TrackSizingFunctionInput[]`                                                 | `[]`                     | every track variant and implicit rows                                                                       |
| `STYLE-F35` | `gridAutoColumns`         | `TrackSizingFunctionInput[]`                                                 | `[]`                     | every track variant and implicit columns                                                                    |
| `STYLE-F36` | `gridAutoFlow`            | `GridAutoFlow`                                                               | `GridAutoFlow.Row`       | all four flow variants including dense placement                                                            |
| `STYLE-F37` | `gridTemplateAreas`       | `GridTemplateAreasInput \| null`                                             | `null`                   | null/empty/full areas, u16 bounds, and named placement                                                      |
| `STYLE-F38` | `gridTemplateColumnNames` | `string[][]`                                                                 | `[]`                     | well-formed Unicode fidelity, surrogate replacement, deep copy, resolution, and column underflow regression |
| `STYLE-F39` | `gridTemplateRowNames`    | `string[][]`                                                                 | `[]`                     | well-formed Unicode fidelity, surrogate replacement, deep copy, resolution, and row underflow regression    |
| `STYLE-F40` | `gridRow`                 | `PartialLineInput<GridPlacementInput>`                                       | `Auto` on both sides     | both components, all five variants, and integer bounds                                                      |
| `STYLE-F41` | `gridColumn`              | `PartialLineInput<GridPlacementInput>`                                       | `Auto` on both sides     | independent column-axis coverage of both components and all variants                                        |

Taffy's `dummy: PhantomData` field is a nonsemantic implementation field and is the only excluded `Style` struct field. The checker must extract 42 public Rust fields, classify `dummy` as excluded, and prove that exactly the 41 semantic fields above remain.

## Shared type, infrastructure, and maturity TODOs

The same acceptance-ID and canonical evidence-resolution rules apply here. A task's prose may name its common runtime file for readability, but an acceptance-level override in `primaryEvidenceRules` is authoritative for compile-time or machine-only properties.

- [ ] **INFRA-001 — source and traceability checker.** Create the machine contract and source parser; verify all executable pins, source inventories and exact signatures, exact generated public declaration source, public exports, task ownership, acceptance links, and actual evidence collection; wire it before tests in both readiness graphs. Acceptance: [`generate`] `contract.json` and the expected declaration source are reproduced byte-for-byte from the canonical JSON block without parsing the Markdown mirror; [`pin-drift`] a changed exact Cargo requirement, lock version, checksum, active feature, Node runtime range, exact minimum-test runtime, TypeScript version, or declaration formatter version fails; once `INFRA-002` is implemented, a changed exact `@types/node` target or packed root `engines.node` also fails and `pins.node`, `tarballContents.rootManifest.engines.node`, the authored root-package manifest, and packed root-package manifest must be equal, while the provenance commit is recorded without a false verification claim; [`source-drift`] a missing, added, renamed, retyped, or re-gated method, field, type, variant, or variant payload fixture fails, including fixtures that change only a primitive method argument or return type while preserving the name and gate; [`task-drift`] a missing or duplicate canonical task, owner, acceptance, generated ID, minimum-Node secondary acceptance or surface probe, artifact projection, status entry, evidence entry, declaration signature, optional marker, readonly marker, overload count, or NodeId role binding fails, including a collection-valid NodeId ID with a position or a collection-invalid ID without one, and the eight public helper acceptances each fail independently if their exact path override is removed and their native owner path wins; [`collection-drift`] skipped, todo, conditional, duplicate, uncollected, retried, zero-test, wrong-runtime, workspace-resolved, collection-root-mismatched, or non-packed evidence in any primary modality or the minimum-Node projection fails; [`incremental-all`] every stated task-state, commit-attestation, projected, final `--all`, completion, and post-review enforcement mode behaves exactly, with false-green fixtures for a wrong review hash or candidate, an M0–M3 status and an M4 status whose `reviewerSlots` is independently missing, additional, duplicated, or reordered, an otherwise complete M0–M3 status and an otherwise complete M4 status in which one subagent identity occupies two canonical slots, a missing or duplicate per-task verdict cell, an aggregate-only milestone verdict, an M0–M3 status and an M4 status whose `currentTaskIds` is independently missing, additional, duplicated, or reordered despite an otherwise complete submatrix, an omitted earlier-impact verdict, an unresolved blocker or major finding, an unconfirmed rejection, a missing public helper constant or corrupted helper tag/payload in the packed minimum-Node fixture, and an invalid accepted or complete transition. Primary machine evidence: `tools/taffy-api/tests/INFRA-001.test.mts` through `vp run check:contract:self-test`.
- [ ] **INFRA-002 — authored public/private native package split.** Make `src/index.ts` the authored public owner, generate private `native.js`/`native.d.ts`, pack public `index.js`/`index.d.ts`, export no native subpath, remove `__bootstrap`, and author the exact minimum-runtime dependency and manifest targets. Acceptance: [`source-entry`] the foundation package imports only through its authored entry, authored dependency declarations plus the lockfile resolve `@types/node` exactly `22.18.0`, and the authored public package declares `engines.node` exactly `>=22.18.0`; [`private-native`] raw generated exports and subpaths are unreachable; [`pack-entry`] source, workspace, tarball, and empty-consumer entry resolve consistently and the packed root manifest preserves that engine field; [`foundation-exports`] the M0 foundation export list is exact and later contract-owned exports are the only permitted additions. Task evidence path: `tests/taffyjs-node/tests/package/INFRA-002.test.mts`.
- [ ] **INFRA-003 — generated value-family authority.** Use `contract.json.numericFamilies` as the sole neutral member schema and deterministically derive all TypeScript declarations/constants, Rust conversion matches, and fixtures from it; no second enum schema is allowed, and generated-file drift fails both readiness graphs. Acceptance: [`generate-check`] `generate --check` is clean; [`codes`] exact members and codes match the inventory; [`frozen`] runtime family objects are frozen; [`narrowing`] declaration members narrow tagged unions; [`raw-literal`] valid raw literals work but documentation marks them not recommended; [`invalid-code`] every nonmember runtime value rejects before mutation. Task evidence path: `packages/taffyjs-node/tests/native/INFRA-003.test.mts`.
- [ ] **INFRA-004 — native owner, error, and panic foundation.** Before any public tree API, implement the private `RefCell<TaffyTree<()>>` owner, shared-receiver checked access helper, complete error taxonomy, panic backstop, poison state, and child-process hostile harness. Callback-specific zero-drain and thrown-value behavior remain owned by `TYPE-MEASURE-001` and `API-TREE-030`, which must use this foundation rather than retrofit another boundary. Acceptance: [`owner-shape`] compile-time and Rust tests prove all future native operations go through one checked owner helper and no generated `&mut self` receiver exposes tree state; [`taxonomy`] every condition has the exact class and code; [`busy-unit`] the reusable checked-borrow failure constructs the exact vouched busy diagnostic without panicking; [`expected-reuse`] ordinary expected failure leaves the owner reusable; [`panic-poisons`] injected unexpected panic returns internal then poisoned errors; [`process-survives`] no hostile child process aborts or accesses poisoned native state. Task evidence path: `packages/taffyjs-node/tests/native/INFRA-004.test.mts`.
- [ ] **TYPE-NODEID-001 — NodeId encoding and registry.** Implement the exact 256-bit private format, secure token, monotonic serial, raw mapping, expected O(1) current lookup, and declaration marker. Acceptance: [`js-identity`] equality, Map, Set, and includes use primitive bigint identity; [`malformed`] wrong type and malformed bigint use fixed errors; [`foreign`] cross-tree use is rejected; [`stale-clear`] cleared IDs are rejected; [`slot-reuse`] raw reuse after clear never revives an ID; [`realm-copy`] worker clone and separate installed package copies remain safely classified; [`rng`] random failure injection is atomic; [`serial-boundary`] internal boundary tests reject before overflow; [`opaque`] no parser or persistence API is exported. Task evidence path: `tests/taffyjs-node/tests/contract/TYPE-NODEID-001.test.mts`. `API-TREE-008/id-stale` owns removal invalidation and reuse; `TEST-COMMON-NODEID` later proves the complete role matrix.
- [ ] **TYPE-NUMBER-001 — scalar and reusable integer converters.** Implement strict JavaScript-number `f64 -> f32` pass-through and the exact finite-integer primitive used by enum, `i16`, and `u16` inputs. NodeId's private `u64` components belong only to the bigint codec in `TYPE-NODEID-001`; topology tasks own safe `usize` indices and counts, and Layout/Detailed tasks own integer output widening. Acceptance: [`number-only`] string, boolean, bigint, and objects reject on number inputs; [`f32-truth`] output equals `Math.fround` of input; [`f32-special`] negative values, NaN, infinities, and f32 overflow pass through; [`integer-bounds`] enum, i16, and u16 conversions accept exact boundaries and reject unrepresentable input; [`no-coercion`] no converter coerces, clamps, or silently defaults. Task evidence path: `packages/taffyjs-node/tests/native/TYPE-NUMBER-001.test.mts`.
- [ ] **TYPE-GEOMETRY-001 — geometry records.** Implement every concrete required Point, Size, Rect, and Line conversion primitive behind the truthful generic declarations. Acceptance: [`declarations`] complete inputs require all components, Style partial inputs make components optional, and outputs are complete; [`style-partial`] omitted Style components use their enclosing defaults; [`components`] exact Taffy component names map correctly; [`style-shape-errors`] arrays and unknown Style-geometry keys reject; [`scalar-scope`] scalar expansion exists only for selected homogeneous semantic-length Style fields; [`readonly`] output declarations are recursively readonly; [`detached-reuse`] outputs are detached and reusable where their input mirror allows. Task evidence path: `packages/taffyjs-node/tests/native/TYPE-GEOMETRY-001.test.mts`. `API-TREE-030/malformed-result`, `API-TREE-031/invalid-space`, and `TYPE-AVAILABLE-001/axis-record` own complete runtime Size validation at its actual consumers.
- [ ] **TYPE-LENGTH-001 — semantic lengths.** Implement Length, Percent, and Auto records, percentage scaling, readonly outputs, and Dimension conveniences. Acceptance: [`forms`] every direct and helper form has the exact own keys, numeric unit, and payload from the declaration contract; [`helper-conversion`] every Dimension constant or constructor result imported through the authored public entry and its structurally equivalent direct record pass through the same production Style converter and produce equal native and canonical output, without a parallel test-only converter; [`narrowing`] unit comparison and switch narrow correctly; [`percent-scale`] 50 maps to 0.5 and reads back as 50; [`f32-special`] all scalar edges pass through; [`invalid-shape`] bare values, unknown tags, and missing payloads reject; [`auto-extra`] unrelated input payloads on Auto are ignored and omitted from output; [`canonical`] output has one canonical shape and no helper history; [`aggregate`] only selected Rect and Size fields expand a scalar; [`helper-materialization`] the namespace and exact shared Auto record exist and are frozen while every payload constructor returns an independent mutable record. Task evidence path: native-js IDs, including `helper-conversion`, use `packages/taffyjs-node/tests/native/TYPE-LENGTH-001.test.mts`; the `forms` and `helper-materialization` public-js overrides use `tests/taffyjs-node/tests/contract/TYPE-LENGTH-001.test.mts`.
- [ ] **TYPE-AVAILABLE-001 — available space.** Implement all three tagged variants and conveniences. Acceptance: [`axis-record`] callers provide a complete two-axis Size; [`variants`] every direct and helper variant has the exact own keys, numeric kind, and payload from the declaration contract; [`helper-conversion`] every AvailableSpace constant or constructor result imported through the authored public entry and its structurally equivalent direct record pass through the same production compute-available-space path on equivalent raw trees and produce equal native Layout, without a parallel test-only converter; [`definite-value`] Definite requires its number; [`content-extra`] content variants ignore unrelated value input and omit it from output; [`f32-special`] Definite preserves scalar edges; [`narrowing`] kind checks narrow correctly; [`readonly-reuse`] callback output is readonly and reusable as input; [`whole-value-errors`] bare and malformed whole values reject; [`helper-materialization`] the namespace and exact MinContent and MaxContent constants exist and are frozen while Definite returns independent mutable records. Task evidence path: native-js IDs, including `helper-conversion`, use `packages/taffyjs-node/tests/native/TYPE-AVAILABLE-001.test.mts`; the `variants` and `helper-materialization` public-js overrides use `tests/taffyjs-node/tests/contract/TYPE-AVAILABLE-001.test.mts`.
- [ ] **TYPE-GRID-001 — Grid values.** Implement every selected Grid declaration, convenience, converter, nested copy, exact integer boundary, and known panic guard. Acceptance: [`families`] every declared Grid helper member exists and every direct and helper form has the exact own keys, numeric discriminator, and nested payload from the declaration contract; [`helper-conversion`] every Grid helper constant or constructor result imported through the authored public entry and its structurally equivalent direct record pass through the same production Style converter and produce equal native and canonical output, without a parallel test-only converter; [`minmax`] every TrackSizingFunction helper, including MinMax, returns the exact nested min/max record for fixed canonical arguments; [`repeat-lines`] RepetitionCount and GridTemplateComponent helpers preserve exact counts, tracks, line names, and the omitted-line-name default; [`panic-guard`] both-axis empty-line-name underflow regressions reject before native use; [`integers`] i16 and u16 boundaries are exact; [`strings`] every string-bearing Grid position preserves well-formed Unicode exactly and a representative isolated surrogate maps to `U+FFFD` through the production Node-API converter; [`ownership`] all nested input/output values are detached; [`areas-null`] nullable areas distinguish null from values; [`canonical`] output loses helper history; [`extra-fields`] unrelated tagged payloads are ignored; [`no-css-validation`] no additional CSS-domain validation appears; [`helper-materialization`] all four namespaces and every exact fieldless constant exist and are frozen, payload helpers return fresh mutable outer records with caller payload identity preserved until conversion, and separate calls do not share mutable outer records. Task evidence path: native-js IDs, including `helper-conversion`, use `packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts`; the `families`, `minmax`, `repeat-lines`, and `helper-materialization` public-js overrides use `tests/taffyjs-node/tests/contract/TYPE-GRID-001.test.mts`.
- [ ] **TYPE-STYLE-001 — Style converter core.** Implement exact field-name/default dispatch, complete replacement conversion, null/undefined policy, unknown-field rejection, calc exclusion, eager output conversion, and native field access without yet claiming the field matrix. Acceptance: [`field-set`] converter source contains exactly the 41 semantic names; [`default-dispatch`] absent and undefined fields read the pinned native defaults; [`nullable-dispatch`] exactly eight null inputs map to None; [`container-shape`] non-null non-array objects, including ordinary instances and Proxies, are accepted by properties while primitives, functions, and arrays reject; [`unknown-calc`] unknown fields and calc reject; [`complete-before-native`] complete conversion succeeds or fails before a mutation call; [`eager-output`] conversion produces an independent complete object. Task evidence path: `packages/taffyjs-node/tests/native/TYPE-STYLE-001.test.mts`.
- [ ] **TEST-STYLE-001 — exhaustive Style field matrix.** Own all 41 Style sub-TODOs and their exact eight acceptance IDs, proving input, native storage, output, failure, and a semantic fixture for each row through `setStyle` and `getStyle`. Acceptance: [`bijection`] 41 rows times eight IDs are generated, collected, and passed exactly once; [`enum-members`] every applicable enum member is included; [`callback-equivalence`] callback Style is deeply equal to direct `getStyle` at the same stored state; [`no-freeze-cache`] outputs are independent, unfrozen, eager snapshots. Task evidence path: `tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts`.
- [ ] **TYPE-LAYOUT-001 — Layout output.** Implement the exact eight-field converter. Acceptance: [`zero`] default Layout maps exactly; [`f32-special`] converter units preserve non-finite f32 values; [`order-u32`] `u32::MAX` widens exactly; [`exact-keys`] no field is missing or added; [`detached`] nested snapshots are independent; [`readonly`] declarations are recursively readonly; [`shared-converter`] both Layout getters use the same proven converter. Task evidence path: `tests/taffyjs-node/tests/contract/TYPE-LAYOUT-001.test.mts`.
- [ ] **TYPE-DETAIL-001 — DetailedLayoutInfo output.** Implement None, Grid, and every nested field. Acceptance: [`variants`] both variants have canonical exact keys; [`narrowing`] numeric tags narrow correctly; [`numeric-widening`] u16 and f32 values widen exactly; [`detached`] nested arrays and records are independent; [`lifecycle`] the API-TREE-027 lifecycle cases match pinned Taffy. Task evidence path: `tests/taffyjs-node/tests/contract/TYPE-DETAIL-001.test.mts`.
- [ ] **TYPE-MEASURE-001 — callback bridge.** Implement owned callback arguments, public-ID/context reconstruction, complete Style delivery, synchronous complete Size result conversion, failure state, and environment lifetime. Acceptance: [`args-owned`] callback records survive no Rust borrow and have exact public identities; [`result-sync`] only a synchronous complete Size is accepted; [`failure-state`] first failure prevents later JS calls and invalidates the requested subtree cache; [`env-lifetime`] GC and worker child processes prove no retained invalid environment; [`non-send`] compile-time proof prevents sending environment-bound state; [`no-retention`] the callback is unreachable after return. Task evidence path: `tests/taffyjs-node/tests/contract/TYPE-MEASURE-001.test.mts`.
- [ ] **TEST-COMMON-NODEID — exhaustive NodeId role matrix.** Generate the exact 29 canonical input roles from `nodeIdRolesByOwner` and its owner-to-class-member bindings: 27 scalar roles each have all seven case kinds, while each of the two collection roles has one valid ID named `NODEID/<OWNER>/<ROLE-ID>/valid` with no position and each of the six invalid case kinds at first, middle, and last positions named `NODEID/<OWNER>/<ROLE-ID>/<CASE-ID>/<POSITION>`, for exactly 227 `NODEID/...` IDs. Every other argument is valid. Acceptance: [`role-bijection`] canonical roles, exact declaration member/option paths, generated fixtures, and collected IDs have an exact bijection; [`controlled-errors`] each case observes the canonical error key; [`no-panic`] no case panics or poisons native state, and every invalid case on a mutation also executes the canonical before/after atomicity snapshot. Task evidence path: `tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts`.
- [ ] **TEST-COMMON-ATOMICITY — exhaustive failing-mutation matrix.** Generate exactly one `ATOMICITY/...` case for each of the 54 canonical owner/failure-kind pairs across all 19 public mutations. `before-after` compares the complete `stateComparisonRules.normalizedCompletePublicState` on one tree. `control-compute` compares that same complete state after two equivalent completed computations, one whose callback attempts and catches the selected busy operation and one that does not; distinct NodeIds and contexts are normalized only through deterministic fixture labels. `nontransactional` asserts the exact zero-drain, subtree invalidation, wrapper-registry consistency, error, poison, and recovery contract without requiring Layout/cache rollback. The 138 invalid mutating NodeId cases reuse their `NODEID/...` identities and before/after snapshots rather than registering duplicate atomicity IDs. Acceptance: [`mutation-bijection`] canonical public mutations, failure kinds, generated fixtures, and collected IDs have an exact bijection; [`state-equality`] every `before-after` and `control-compute` case preserves its specified complete comparison; [`callback-exception`] both nontransactional failure kinds satisfy their exact state contract. Task evidence path: `tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts`.
- [ ] **TEST-TYPES-001 — declaration contract.** Use the public packed declarations with strict mode and `exactOptionalPropertyTypes`. Acceptance: [`exports-signatures`] every runtime export and public signature is exact; [`valid-invalid`] every valid form compiles and every invalid form retains an effective `@ts-expect-error`; [`node-enum`] NodeId phantom, enum literals, and tagged narrowing behave exactly; [`mutability`] inputs are mutable and outputs recursively readonly; [`context-nullish`] the context generic and null/undefined Style cases are exact and documented; [`private-absent`] no raw native surface is declared. Task evidence path: one canonical-ID file per slug under `tests/taffyjs-node/tests/types/TEST-TYPES-001/`, executed by `vp run check:test:types`.
- [ ] **TEST-ALGORITHMS-001 — real consumer layouts.** Through the package entry only, run complete consumer flows. Acceptance: [`block-float`] Block, FlowRoot, Float, and positioning match direct Taffy fixtures; [`flex`] Flexbox and rounding match direct fixtures; [`grid`] Grid, detailed output, content size, and scrollbars match direct fixtures; [`measure-context`] measurement, context mutation, and explicit dirtying form one complete flow; [`topology-cache`] topology changes and cache invalidation form one complete flow; [`public-only`] no fixture imports the raw binding. Task evidence path: `tests/taffyjs-node/tests/contract/TEST-ALGORITHMS-001.test.mts`.
- [ ] **MATURITY-001 — documentation and JSDoc.** Document installation from the local package, every public symbol and method, direct Taffy semantics, lifetime and invalidation rules, errors, unsupported surfaces, and complete examples. Acceptance: [`symbol-bijection`] every public declaration maps to JSDoc and reference documentation; [`semantic-rules`] NodeId, computation, stored Layout, context, callback, enum-literal, and null/undefined rules are explicit; [`examples`] Block, Flex, Grid, and measure examples typecheck and execute; [`raw-literal-doc`] no normal example uses a raw enum literal and one labeled boundary example calls it not recommended. Task evidence path: `tests/taffyjs-node/tests/docs/MATURITY-001.test.mts`.
- [ ] **MATURITY-002 — package and environment lifecycle.** Verify ESM import, package exports, native selection, wrapper/native/context cleanup, GC, worker isolation, separately installed copies, the exact minimum Node runtime, and unsupported-platform diagnostics. Acceptance: [`workspace-import`] workspace entry works; [`tarball-consumer`] freshly packed root and current-host platform tarballs install together into an empty offline temporary consumer under the current host runtime, whose code imports only `@taffyjs/node`; [`minimum-node`] `vp run check:test:node-minimum` uses `vp env exec --node 22.18.0` to assert `process.version === "v22.18.0"`, install the same fresh root and current-host platform tarballs without registry fallback into a second empty consumer, and execute the canonical projection of all 816 package-facing API/type/test public-js acceptance bodies plus all 58 generated public-surface probes through the packed public ESM entry, with the exact secondary identities and one result document required by `minimumNodeCompatibility`; [`contents`] both tarball file lists, five private manifests, exact root `engines.node`, optional dependency names/version, and selected binary match the canonical package contract; [`cleanup`] wrapper, native, and context values become collectible; [`isolation`] workers and separate copies cannot confuse ownership; [`unsupported-platform`] loading fails with an intentional diagnostic; [`private-path`] `import("@taffyjs/node/native.js")` and every other undeclared package subpath fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`, while absolute internal-file access is explicitly unsupported rather than claimed impossible. Task evidence path: `tests/taffyjs-node/tests/package/MATURITY-002.test.mts`; the exact override for `minimum-node` is `tests/taffyjs-node/minimum-node/MATURITY-002.test.mjs`.
- [ ] **MATURITY-003 — repository and CI readiness.** Make root `vp run ready` execute every required check and add nonpublishing CI jobs for all four declared targets. Acceptance: [`ready-graph`] contract, format, lint, Rust fmt/clippy/test, native-private, wrapper-private, build, package, integration, declaration, hostile-child, minimum-Node, pack, and docs checks are all reachable once; [`no-empty-suite`] no required suite can pass with zero tests; [`local-green`] the exact final commit is green locally; [`ci-targets`] workflow and package target metadata agree and one nonpublishing job executes the complete canonical compatibility projection against the packed consumer with exact Node 22.18.0; [`handover-truth`] unavailable remote evidence is explicitly named and never fabricated. Task evidence path: `tests/taffyjs-node/tests/package/MATURITY-003.test.mts`.

## Upstream disposition inventory

The checker derives `U` from the pinned source, not from this prose alone. Its roots are the public inherent methods on `TaffyTree<NodeContext>`, the three adjacent operations in the tree's `TraversePartialTree` implementation, the public named Taffy data types recursively reachable through supported signatures and public fields or variants, and the four exact adjacent roots explicitly classified below. Recursion stops at Rust primitives, `Option`, `Result`, `Vec` or Taffy's vector aliases, `Box`, slices, ranges, callbacks, and the selected cheap-string carrier; those are representation carriers, not additional domain APIs. Associated methods and trait implementations on value types are not individually in `U`: their value semantics are owned by the field, member, variant, and selected JavaScript-helper inventories in this file. Any new root method, reachable public named Taffy type, public field, enum variant, payload type, or effective feature gate is an inventory diff and blocks the run.

The executable authority is the checksum-pinned crates.io source located through Cargo metadata. The provenance commit supplies stable reviewer links for the [`TaffyTree` implementation](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/tree/taffy_tree.rs), [`Style` and core style values](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/style/mod.rs), [Grid values](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/style/grid.rs), [geometry](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/geometry.rs), [Layout and detailed-layout union](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/tree/layout.rs), and [detailed Grid records](https://github.com/DioxusLabs/taffy/blob/45a56299d366ddb383e593a1f0372158d00e8530/src/compute/grid/mod.rs); those links do not replace the Cargo source check or independently prove archive identity.

The source checker must extract exactly these 34 public inherent methods and exact dispositions:

|   # | Rust inherent method            | Disposition                                                                                                    |
| --: | ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
|   1 | `new`                           | implement `API-TREE-001`                                                                                       |
|   2 | `with_capacity`                 | exclude: preallocation only and an ordinary safe integer could request uncontrolled native allocation          |
|   3 | `enable_rounding`               | implement `API-TREE-002`                                                                                       |
|   4 | `disable_rounding`              | implement `API-TREE-003`                                                                                       |
|   5 | `new_leaf`                      | implement `API-TREE-004`                                                                                       |
|   6 | `new_leaf_with_context`         | implement `API-TREE-005`                                                                                       |
|   7 | `new_with_children`             | implement `API-TREE-006`                                                                                       |
|   8 | `clear`                         | implement `API-TREE-007`                                                                                       |
|   9 | `remove`                        | implement `API-TREE-008`                                                                                       |
|  10 | `set_node_context`              | implement `API-TREE-009`                                                                                       |
|  11 | `get_node_context`              | implement `API-TREE-010`                                                                                       |
|  12 | `get_node_context_mut`          | absorbed and solely owned by `API-TREE-010`; callers separately use `API-TREE-028` when invalidation is needed |
|  13 | `get_disjoint_node_context_mut` | absorbed and solely owned by `API-TREE-010`; callers separately use `API-TREE-028` when invalidation is needed |
|  14 | `add_child`                     | implement `API-TREE-011`                                                                                       |
|  15 | `insert_child_at_index`         | implement `API-TREE-012`                                                                                       |
|  16 | `set_children`                  | implement `API-TREE-013`                                                                                       |
|  17 | `remove_child`                  | implement `API-TREE-014`                                                                                       |
|  18 | `remove_child_at_index`         | implement `API-TREE-015`                                                                                       |
|  19 | `remove_children_range`         | implement `API-TREE-016`                                                                                       |
|  20 | `replace_child_at_index`        | implement `API-TREE-017`                                                                                       |
|  21 | `child_at_index`                | implement `API-TREE-018`                                                                                       |
|  22 | `total_node_count`              | implement `API-TREE-020`                                                                                       |
|  23 | `parent`                        | implement `API-TREE-021`                                                                                       |
|  24 | `children`                      | implement `API-TREE-022`                                                                                       |
|  25 | `set_style`                     | implement `API-TREE-023`                                                                                       |
|  26 | `style`                         | implement `API-TREE-024`                                                                                       |
|  27 | `layout`                        | implement `API-TREE-025`                                                                                       |
|  28 | `unrounded_layout`              | implement `API-TREE-026`                                                                                       |
|  29 | `detailed_layout_info`          | implement `API-TREE-027`                                                                                       |
|  30 | `mark_dirty`                    | implement `API-TREE-028`                                                                                       |
|  31 | `dirty`                         | implement `API-TREE-029`                                                                                       |
|  32 | `compute_layout_with_measure`   | implement `API-TREE-030`                                                                                       |
|  33 | `compute_layout`                | implement `API-TREE-031`                                                                                       |
|  34 | `print_tree`                    | exclude: writes unstable debug output with raw Rust NodeIds directly to process stdout                         |

This table abbreviates the source inventory for readers. The canonical object records and checks the parsed `impl<NodeContext> TaffyTree<NodeContext>` header plus the complete normalized signature of all 34 methods, including excluded methods, so unchanged names with changed receivers, generics, arguments, returns, or where clauses still fail source drift.

The adjacent concrete `impl<NodeContext> TraversePartialTree for TaffyTree<NodeContext>` inventory is exact and comes from `src/tree/taffy_tree.rs`; `src/tree/traits.rs` is recorded separately as the trait declaration source. Its parsed signatures are canonical: `child_count` is implemented by `API-TREE-019`, `child_ids` is absorbed by `API-TREE-022`, and unchecked `get_child_id` is absorbed by the checked `API-TREE-018`. The four adjacent roots are exact: the `Default` implementation is absorbed by `API-TREE-001`; derived `Clone` and `Debug` plus `TaffyTreeChildIter` are excluded because clone requires new public identity/context semantics, debug exposes private state, and the iterator adds no capability beyond an owned array. A future capacity option or binding-owned `getDebugTree(): string` requires a new decision.

The exact recursively reachable named-data inventory is: `NodeId`, `TaffyResult`, `TaffyError`, `Style`, `Layout`, `DetailedLayoutInfo`, `DetailedGridInfo`, `DetailedGridTracksInfo`, `DetailedGridItemsInfo`, `AvailableSpace`, `Point`, `Size`, `Rect`, `Line`, `MinMax`, `Display`, `BoxSizing`, `Direction`, `Overflow`, `Float`, `Clear`, `Position`, `TextAlign`, `FlexDirection`, `FlexWrap`, `AlignItems`, `AlignItemsKeyword`, `AlignSelf`, `JustifyItems`, `JustifySelf`, `AlignContent`, `AlignContentKeyword`, `AlignmentSafety`, `JustifyContent`, `LengthPercentage`, `LengthPercentageAuto`, `Dimension`, `GridAutoFlow`, `GridPlacement`, `GridLine`, `MinTrackSizingFunction`, `MaxTrackSizingFunction`, `TrackSizingFunction`, `RepetitionCount`, `GridTemplateRepetition`, `GridTemplateComponent`, `GridTemplateAreas`, and `GridTemplateArea`. Six aliases and seven opaque newtypes remain explicit inventory entries even when they add no independent public members. `namedDataShapes` is the machine source for every struct field, enum variant and payload, alias target, and zero-public-field assertion, including the 42/41 Style classification.

The exact selected non-root conveniences are explanatory decisions outside `U`: `NodeId::new` and its four raw-integer conversion implementations are excluded from the public boundary; `Style::DEFAULT` and its `Default` implementation are absorbed by `{}` plus missing/undefined defaulting; `evenly_sized_tracks` is excluded because the same value is expressible as a repeat of `Fr(1)`; and the nine named Layout methods are excluded by the output-only data representation. Alignment keyword/safety parts and aliases inside `U` are absorbed by the complete `AlignItems` and `AlignContent` public code families. `GridLine` and `MinMax` are absorbed by `GridPlacement` and complete track-pair records.

`Layout::new`, `Layout::with_order`, the five `content_box_*` methods, `scroll_width`, and `scroll_height` are the exact Layout convenience list; the pinned source has no separate Layout arithmetic helper to inventory. Layout remains output-only, and JavaScript consumers receive its complete data rather than Rust-oriented constructor or derived-method wrappers. All other value-type associated items and trait implementations—including AvailableSpace helpers, generic and extension geometry methods, Grid resolver helpers, compact-length accessors, and Detailed constructors—are outside `U` under the canonical `valueTypeAssociatedItems` rule rather than represented by an invented grouped Rust item.

Taffy errors are absorbed by synchronous return/throw. `ChildIndexOutOfBounds` maps to `ERR_TAFFY_CHILD_INDEX_OUT_OF_BOUNDS`; an upstream invalid-node variant after successful wrapper validation indicates wrapper/native divergence and enters the unexpected internal failure boundary. Low-level traversal, caching, printing, layout-algorithm, rounding, and custom-tree traits; internal layout input/output and cache types; per-algorithm compute functions; parsing; serde; calc pointers; and JavaScript-owned custom trees are excluded by the high-level scope.

## Test evidence rules

Public observable behavior is tested from `tests/taffyjs-node` through `@taffyjs/node`; those public integration tests must not import relative package source or the raw native loader. Canonical tests under `packages/taffyjs-node/tests/native/` import the production-private `native.js` by a package-relative path and exercise the same private class, raw operations, owner, and converters that the authored public wrapper consumes. They may not add a second converter, round-trip probe, alternate owner, public export, or implementation. This gives every converter a real JavaScript/Node-API/Rust boundary. A separately built native `test-hooks` artifact may call the exact production panic helper or feed a synthetic `Layout { order: u32::MAX, ..Default::default() }` into the exact production Layout output converter; it defines no alternate converter, and the release artifact and both package entries contain no hook symbol.

The `wrapper-js` modality is the only other non-public runtime path. Tests under `packages/taffyjs-node/tests/wrapper/` import the authored production-private wrapper module and use its non-package-exported construction seam to select only a deterministic secure-random failure or the next public-ID serial. The ordinary public constructor always supplies the production random source and serial start. These tests then call the same wrapper methods and release native owner as production, so random failure and `u64` serial exhaustion are reachable without creating `2^64` nodes. No other private state setter, alternate registry, raw native call, test-only converter, declaration export, package subpath, or release hook is permitted. `API-TREE-001/rng-failure`, `TYPE-NODEID-001/rng`, `TYPE-NODEID-001/serial-boundary`, and the three generated `node-id-serial-exhaustion` mutation cases are the complete closed set assigned to this modality.

The canonical modality may instead make a Rust contract test primary for a property that JavaScript cannot prove, such as native ownership shape or `!Send`, or a TypeScript fixture primary for declaration behavior. Other Rust unit tests independently strengthen source checking, conversion internals, encoding, errors, panic, and callback-bridge logic; thin Taffy forwarding is not reimplemented in Rust tests.

The runner inventory is closed and uses these exact root tasks, which M0 and M4 must add to the Vite+ graph: `vp run check:contract:generate` regenerates and diffs `tools/taffy-api/contract.json`; `vp run check:contract:self-test` runs deliberate false-green fixtures; `vp run check:test:native` builds the production-private addon plus the separate native test-hooks artifact and runs every currently required test below `packages/taffyjs-node/tests/native`; `vp run check:test:wrapper` builds the release addon and runs the closed wrapper-seam IDs below `packages/taffyjs-node/tests/wrapper`; `vp run check:test:integration` builds the release addon and runs every currently required `.test.mts` below `tests/taffyjs-node` with the machine-readable contract reporter; `vp run check:test:types` runs currently required strict declaration fixtures with `exactOptionalPropertyTypes`; `vp run check:test:node-minimum` uses `vp env exec --node 22.18.0` for the second offline packed consumer and fails unless that consumer observes exact `process.version`, executes the same bundled bodies for all 816 package-facing API/type/test public-js acceptances, executes the 58 generated surface probes, and emits the one exact result document; `cargo test -p taffyjs_binding --lib -- --list` proves collection of the primary private Rust-contract identities and `cargo test -p taffyjs_binding --lib` compiles and runs them; `cargo test --workspace --all-features -- --list` proves complete Rust collection and `cargo test --workspace --all-features` proves complete Rust results; `vp run ready:loop` runs the complete status-projected graph through the current milestone; `vp run ready` runs final `--all` generation, source checks, format, lint, Rust, native-private, wrapper-private, build, integration, declaration, hostile-child, minimum-Node, pack, and documentation evidence; `vp run check:completion` validates nonrecursive whole-command attestations after their commands have finished and status records them; and `vp run check:review-completion` nonrecursively validates the complete review record and proposed milestone or final transition after all review outcomes exist. JavaScript tests never shell out to `cargo test`. `contract.json` expands every ordinary and generated acceptance into exactly one primary evidence record. Public, native, wrapper, and minimum-Node JS records use an exact `contractTest` identity; TypeScript records use one strict fixture per ID; Rust records use one exact collected private unit-test name whose compilation itself proves any owner or auto-trait property; machine records use one exact self-test reporter identity; command records require the exact successful command and candidate hash. The only required secondary evidence is the minimum-Node projection: its identities, source primary IDs, generated surface probes, counts, runner, packed-package resolution, and one-document result are fixed by `minimumNodeCompatibility`; it cannot substitute for any primary evidence. Any later additional evidence must map back to an existing acceptance through an equally explicit canonical rule and cannot use an unlisted command or ad hoc identity.

Each API task must have at least one success assertion, one boundary/failure assertion when a failure exists, its complete declaration assertions, and its NodeId/atomicity matrix links where applicable. A task may share a fixture, but its own canonical evidence identity must name the exact assertion. Every modality's collector reports the canonical ID and exactly one pass or fail result; for JS that identity is the exact `contractTest` title, while TypeScript, Rust, and machine collectors use their canonical mappings. Display prose follows the ID but is not identity. The checker binds each `nodeIdRolesByOwner` owner to its sole `publicClassMembersByOwner` member, follows only the explicitly named option-record and collection-element paths in `publicDeclarationContract`, and proves the exact 29-role bijection; declaration byte equality makes this canonical projection identical to the packed surface. Self-tests remove, add, and retype a scalar, nested, and collection NodeId position and require failure. It also proves that the 19 public mutations have an exact bijection with `publicMutationFailuresByOwner`. The generated contract expands 227 NodeId cases and 54 non-NodeId mutation-failure cases. Every non-valid NodeId case whose owner is a mutation uses the same complete before/after snapshot assertion; it is not duplicated under a second evidence ID.

Dedicated hostile child-process isolation is not an implementer choice. `childIsolationRules` expands exactly 228 parent IDs: its 11 named ordinary IDs, all 198 invalid generated NodeId IDs, and the 19 generated `tree-busy` atomicity IDs. Every other ID has no dedicated hostile child fixture; normal compiler, packager, consumer, and runner subprocesses remain internal implementation details and never gain evidence identities. Each listed parent remains the sole evidence identity and executes exactly once with retries disabled. Its child fixture does not match a test glob, does not call `contractTest`, does not start a test runner, and has no `/child` or other secondary ID; it returns a fixed structured result that the parent validates. A child ending by signal, abort, timeout, nonzero status, missing result, or mismatched case makes that one parent ID fail.

Every required test suite must fail when its collected tests are absent. Root `ready` must not use `--passWithNoTests` for a required suite. Test selection, skipped tests, snapshots awaiting update, and platform conditions must be visible in the command output recorded in `loop-status.md`.

Every layout value asserted as Taffy parity must cite a stable upstream Taffy 0.13 test/source location or include a direct Rust Taffy fixture in the repository that computes the expected value without using binding conversion code. Round-trip alone is insufficient where the same mistaken field mapping could be made in both directions.

## Iteration protocol and task state machine

The first run iteration must verify a whole-file vouch immediately below this title and a clean committed worktree containing this file and all referenced supporting records. That exact commit becomes the immutable contract-base commit. A missing vouch, uncommitted contract, dirty supporting record, pin mismatch, or inability to record the base commit blocks initialization; the agent must not infer a baseline from working-tree content.

Only `loop-status.md` is mutable loop memory. It must contain the exact contract-base commit; `candidateCommit`; active milestone; `phase = build | verify | review | review-fix | blocked | complete`; one active task when the phase permits one; task-state table; `prefixEvidenceCommit`; `milestoneReviewCommit`; the previous accepted milestone commit; red/green evidence; `commandEvidence` with exact command, candidate, timestamps, exit, complete retained output bytes, and SHA-256; final command outputs or artifact paths; review-round ID, reviewer slots, reviewed commits, inspection commands, and current task IDs; `reviewInputStatusHash`; every report's start and end hashes, `earlier-impact` task list, and verdicts; accepted findings and fixes; rejected findings with originating-reviewer confirmation; blockers; and the deterministic next action. Before review state can be hashed, its `currentTaskIds` must equal `milestones[activeMilestone]` exactly in canonical order, and its `reviewerSlots` must exactly equal the ordinary or final canonical slot source selected by that milestone; a missing, additional, duplicate, or reordered ID or slot is invalid rather than defining a smaller review scope. The checker reads this state from one JSON block between exact `<!-- loop-status-json:start -->` and `<!-- loop-status-json:end -->` markers, rejects duplicate or unknown machine fields, and ignores no other prose as state. The file is overwritten in place each iteration rather than accumulated as a diary. During the run it is intentionally left uncommitted and is the sole permitted related worktree delta; every candidate, reviewed, and final hash names the clean implementation commit obtained by excluding this status file. Commands that assert cleanliness must use that explicit exclusion.

Before a review round starts, status records every `reviewPolicy.reviewInputStatusHash.projectionKeys` value, clears prior-round outcomes, computes the exact projection serialization and hash defined there, stores that value as `reviewInputStatusHash`, and is frozen. The implementing agent also freezes all implementation, test, declaration, documentation, and generated-file writes through the all-reviewers-complete barrier. Every reviewer receives the identical projection bytes and hash, even when concurrency requires waves, reads implementation bytes only from the immutable candidate commit or a clean worktree detached at it, and records both the candidate and recomputed projection hash at review start and end. No report, verdict, finding, or report-derived next action is written to status until all reviewers in the round have completed. The outcomes are then written together, required follow-ups are resolved, and the proposed milestone transition is written before the nonrecursive `vp run check:review-completion`. A pass is the machine gate for that review and transition; a failure invalidates it. This write barrier prevents a later reviewer from observing an earlier report, while the dedicated projection avoids a self-referential whole-file hash. The final handover leaves the status file as the same explicit uncommitted exception for Yunfei rather than silently committing or deleting it.

Task states are `pending`, `active`, `tests-authored`, `implemented`, `verified`, `under-review`, `accepted`, or `blocked`. The ordinary build transition is `pending -> active -> tests-authored -> implemented`; the current milestone's verification sweep advances its tasks to `verified`, and review advances them through `under-review -> accepted`. `blocked` requires the blocker rules below. An accepted state records scheduling completion and never regresses merely because a later milestone exposes and fixes an earlier implementation defect. Current-commit validity is instead carried only by the commit attestations. A verification-only command and edits to the uncommitted status file do not change `candidateCommit` or invalidate an attestation.

The process deliberately does not ask a checker to infer semantic call graphs or force an impossible cross-milestone state rollback. Every commit that changes code, declarations, tests, generated artifacts, package/build files, or public documentation becomes the new `candidateCommit` and clears `prefixEvidenceCommit`, `milestoneReviewCommit`, and every command-evidence record. `vp run ready:loop` then reruns the complete evidence prefix from M0 through the active milestone; only one all-green execution on the exact candidate may set `prefixEvidenceCommit`. This rule catches a later edit to a converter, registry, native owner, generator, boundary, shared harness, or earlier implementation without semantic dependency metadata. Previously accepted task states remain scheduling history, while the cleared commit attestations prevent them from being mistaken for current evidence.

At the start of every iteration, continue the single active task. If none exists during a milestone's build pass, select the first pending task in the milestone's written order; every earlier task in that milestone must be at least `implemented` and every prior milestone must be `accepted`. Tasks in one milestone may use one another only because their complete set is reviewed and accepted together. After the last task is implemented, enter `verify`. For M0 through M3, run the complete M0-through-current evidence prefix and set `prefixEvidenceCommit` only after every exact ordinary and generated ID in that prefix is collected once and green on `candidateCommit`; then mark the current milestone's tasks `verified`. M4 instead follows its explicit nonrecursive `ready -> commandEvidence -> check:completion` sequence below, and only then sets `prefixEvidenceCommit` and marks its tasks `verified`. Do not skip a harder task, verify a task with missing IDs, or begin a later milestone before the current milestone's evidence and review attest the same candidate.

For each task, first reread its upstream source items, its contract entry, and relevant vouched rules. Add every named acceptance test and record at least one expected red result against the preimplementation state when behavior is new. Then implement the smallest vertical slice containing runtime behavior, public declarations, JSDoc, generation changes, and tests together. A test that needs a later task in the same milestone remains collected and red until the verification sweep; it may not be deleted, skipped, weakened, or pointed at a later milestone. Run targeted checks, the contract checker, and the affected package checks. Self-review the diff for unrelated changes, unsupported API, hidden state, panic paths, and duplication before committing one logical task slice.

If verification or review in a later milestone exposes an earlier defect, fix it as the current milestone's next deterministic action, record the earlier task ID and evidence in status, and do not reopen an earlier scheduling pass. The fix clears the commit attestations, the full prefix reruns, and the current milestone reviewers inspect the complete fix delta. This is the only recovery algorithm; rolling task states backward, inventing a dependency DAG, or ignoring the stale attestation is forbidden.

The agent may choose reversible private code organization within the fixed architecture, but it may not create, remove, rename, overload, or change a public API; change numeric codes; weaken an assertion; convert a required task to deferred or excluded; invent new semantic validation; or add a public optimization. When evidence exposes a missing public decision, contract contradiction, or unsafe requirement that cannot be satisfied inside this file, the agent must block rather than improvise.

## Milestones and mandatory independent review

Tasks execute in the exact canonical JSON order inside these dependency-closed milestones; this prose is a readable mirror rather than a second machine source:

1. **M0 — Evidence and package foundation:** `INFRA-001`, `INFRA-002`. `INFRA-002/foundation-exports` permits no runtime named exports in the scaffold.
2. **M1 — Value conversion and native safety foundation:** `INFRA-004`, `INFRA-003`, `TYPE-NUMBER-001`, `TYPE-GEOMETRY-001`, `TYPE-LENGTH-001`, `TYPE-AVAILABLE-001`, `TYPE-GRID-001`, `TYPE-STYLE-001`. The checked owner and panic boundary precede every public native tree entry. This milestone adds only its owned value exports and declarations; the public tree class remains absent. Its package-local native tests may use only the final production-private owner and raw operations that M2's authored wrapper will consume, including real raw leaf/style, compute/available-space, and layout conversion paths. Those private operations do not satisfy an `API-TREE-*` task early and may not be reimplemented when the public wrapper is added.
3. **M2 — Complete public tree API:** `TYPE-NODEID-001`, `TYPE-LAYOUT-001`, `TYPE-DETAIL-001`, `TYPE-MEASURE-001`, then every `API-TREE-001` through `API-TREE-031` in the exact canonical order. The expanded order intentionally places creators and direct state before topology, context, computation, outputs, configuration, dirty observations, and removal. All public APIs are in this single review unit because their dirty, cache, callback, context, output, and lifecycle acceptance observations depend on one another; tests may remain red during its build pass but must all be green in its sweep.
4. **M3 — Exhaustive cross-cutting proof:** `TEST-STYLE-001`, `TEST-COMMON-NODEID`, `TEST-COMMON-ATOMICITY`, `TEST-TYPES-001`, `TEST-ALGORITHMS-001`.
5. **M4 — Consumer maturity:** `MATURITY-001`, `MATURITY-002`, `MATURITY-003`.

After M0, M1, M2, and M3 each reaches `verified` on one candidate implementation commit clean except for the explicit status-file delta, three fresh read-only subagents must independently review the same previous-accepted-milestone-to-candidate diff and every current milestone task's exact implementation. This means three independent reviews of each task, not three aggregate reviews of the milestone: the checker forms the exact `currentTaskIds × reviewerSlots` matrix in `reviewPolicy.perTaskVerdictMatrix`, and every one of its cells is required. The reviewers must also inspect any earlier implementation changed by that diff and may inspect complete files from the committed candidate tree where a patch lacks sufficient context. Freeze the pre-review state as specified above and provide every reviewer only the contract path, immutable review-input projection bytes and hash, previous and candidate commits, role, current task list, and commands needed to inspect evidence; if concurrency requires waves, do not expose or record completed reports before the final reviewer finishes. Spawn each with no inherited conversation turns. Reviewers must not edit files, delegate, call agent-status tools that may expose reports, see another review, or receive a summary of another review before submitting their own report. Two reviewers are broad adversarial reviewers free to inspect correctness, source omissions, semantic mismatch, panic/state safety, declarations, tests, documentation, and scope drift. The third is a dedicated code-cleanliness, quality, and elegance reviewer focused on Rust/JavaScript boundary shape, duplication, naming, generated versus handwritten ownership, control flow, error paths, maintainability, unnecessary frameworks or abstractions, and whether simpler code would preserve the contract. M4 uses the five final reviewers below instead of starting a redundant ordinary trio; each of its five reviewers must likewise give an explicit verdict for each M4 task, so M4 exceeds the three-reviewer requirement.

Each ordinary report must identify both diff endpoints and the reviewed candidate at start and end, record the same recomputed `reviewInputStatusHash` at start and end, give every current-milestone task an explicit `PASS` or `FAIL`, state `earlier-impact: none` or list every earlier task whose implementation or contract evidence is affected by the diff with a renewed `PASS` or `FAIL`, state what evidence was inspected even when no finding exists, and classify each finding as `blocker`, `major`, or `minor` with file/line evidence and a concrete failure mode. “LGTM”, a vote, or test-green restatement is not a review. The three reports do not need to repeat verdicts for untouched earlier tasks; current validity of their behavior comes from the full-prefix evidence attestation, review of every new delta, and final base-to-final review.

Every blocker and major finding must be resolved before the milestone is accepted. The implementing agent may not dismiss one unilaterally: a claimed false positive must be returned with evidence to the same reviewer for confirmation. A remaining disagreement requires a fresh independent adjudicator; any unresolved public-contract, completeness, or safety disagreement blocks. Any implementation-affecting review fix creates a new candidate, clears both attestations and command evidence, returns the current milestone tasks to `implemented`, and requires the complete prefix evidence again. All original milestone reviewers then inspect the exact fix delta and renew their role verdict on the same final candidate; the originating reviewer explicitly closes its finding. A focused follow-up may be concise. If the fix changes architecture, public behavior, a shared owner/converter/generator/harness, or materially broadens the reviewed delta, all reviewers rerun their full milestone review. If an original reviewer becomes unavailable or reports that independence was contaminated, a fresh replacement receives no other reports and reruns that entire role against the final candidate; a partial inherited verdict does not count. Minor findings are either fixed or recorded with a concrete reason in `loop-status.md`; accumulated quality debt that contradicts maturity is material regardless of individual labels.

M0 through M3 become `accepted` only when the exact candidate passes targeted checks and full `vp run ready:loop`, `prefixEvidenceCommit` and all three final reviewer verdicts name that candidate, every current task has three explicit PASS verdicts, every listed earlier impact has three renewed verdicts, no material finding remains, and `vp run check:review-completion` accepts the proposed `milestoneReviewCommit`, accepted task states, and current-milestone review-boundary state. Only after that pass may the next milestone become active. M4 first runs full `vp run ready` in `--all` mode, writes its exact successful result under `commandEvidence`, and then runs `vp run check:completion`; only that nonrecursive second command may report `MATURITY-003/local-green` green. M4 then uses the analogous five-reviewer gate below and must pass `vp run check:review-completion` after its five outcomes, closures, identical commit attestations, accepted tasks, and proposed `phase = complete` are present. A milestone-level PASS cannot silently cover an omitted current or impacted task.

## Blocker rules

Compilation errors, failing tests, implementation difficulty, a review finding, unfamiliar upstream code, or a private design choice within the fixed contract are not blockers. Investigate and continue.

A task may become blocked only when the vouched contract conflicts with pinned source or safety evidence; satisfying it requires a public API, dependency, feature, target, publication, or scope change not authorized here; an upstream defect cannot be safely contained within the selected semantics; a material reviewer finding cannot be resolved without changing the contract; or the same external/tool barrier remains after three distinct evidence-producing attempts.

A blocked task does not permit deletion, deferral, assertion weakening, fake evidence, or skipping ahead. Because task order is exact and the protocol intentionally has no hidden dependency DAG, entering `blocked` halts the current milestone and unattended run immediately; no later task starts. Write the exact evidence, all three attempts when the cause is an external/tool barrier, and the smallest human decision or external-state change needed into the final `loop-status.md` handover.

## Final maturity gate

The run is complete only when all of the following are simultaneously true on one exact implementation commit whose worktree is clean under the explicit `loop-status.md` exclusion:

- The Taffy source checker reports the exact parsed impl roots and signatures of all 34 inherent methods and three concrete trait operations, four adjacent roots, 48 named-data shapes, every active public field/variant/payload and gate, 42 Style struct fields with exactly 41 semantic fields, all eight Layout fields, and every DetailedLayoutInfo field with no diff or `decision-required` entry.
- Every top-level API, type, infrastructure, test, and maturity task in `T` is `accepted`; all 41 Style sub-TODOs inherit accepted `TEST-STYLE-001` state; all 317 ordinary, 328 Style-field, 227 NodeId-role, and 54 mutation-failure IDs resolve to one primary modality and have collected green evidence on the final commit; all 816 package-facing API/type/test public-js primary IDs also have their exact minimum-Node secondary result, all 58 generated public-surface probes pass, and neither set contains a missing, duplicate, additional, skipped, or wrong-runtime result; the exact 228 child-isolated parents passed through their non-test fixtures; every public symbol has declaration, runtime, export, JSDoc, and documentation evidence.
- Every API task was explicitly covered by three valid milestone reviews, every blocker/major finding is resolved and reconfirmed, and no unresolved finding contradicts correctness, safety, completeness, code quality, or maturity.
- Supported malformed values, stale and foreign NodeIds, raw-slot reuse, every invalid index/range/topology, callback failure, same-tree re-entry, worker/GC interaction, and an injected unexpected panic produce their contracted controlled result without process crash, native corruption, or wrapper/native divergence.
- Complete real consumer flows for Block, FlowRoot, Flexbox, Grid, Float, positioning, hidden layout, measurement, context, topology, dirty state, rounding, content size, and detailed Grid information pass through the public packed ESM entry.
- `getStyle`, callback Style, Layout, DetailedLayoutInfo, geometry, tagged records, and arrays are complete detached snapshots with recursively readonly declarations and no runtime freeze, cache, lazy, selective, batch, or live-native behavior.
- The runtime export set matches the canonical runtime inventory; the packed declaration's JSDoc-stripped formatted skeleton matches `publicDeclarationContract` byte-for-byte, its required JSDoc is present, and its full source passes the pinned TypeScript CLI; `__bootstrap`, raw native operations, raw NodeIds, unsupported helpers, and raw-loader package subpaths are absent; the `@taffyjs/node/native.js` package subpath specifically fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`; absolute internal-file access remains unsupported rather than falsely claimed impossible; all public examples compile and execute.
- Root `vp run ready` passes in final `--all` mode without skipped required suites or pass-with-no-tests loopholes, its exact-candidate success is recorded, the subsequent nonrecursive `vp run check:completion` passes, and the terminal nonrecursive `vp run check:review-completion` validates all five reviews and `phase = complete`; the locally packed tarballs install and work from separate empty consumers under both the current runtime and exact managed Node `22.18.0`, and the latter records the complete canonical compatibility projection rather than an aggregate smoke; generated output is clean; `git diff --check` passes; the worktree contains no unrelated or generated drift beyond the explicit uncommitted status file.
- Nonpublishing CI definitions cover the four declared targets and an exact Node `22.18.0` packed-consumer job that runs the complete canonical compatibility projection, and the handover states exactly which target evidence was actually executed. The workspace typechecks against exact `@types/node` `22.18.0`, and the packed root manifest declares `engines.node` exactly `>=22.18.0`. The package remains unpublished, private, placeholder-versioned, and unlicensed until separate human decisions.

## Final strong adversarial review

After M4 evidence is green and before declaring either M4 or the run complete, run five fresh independent read-only reviews against the same final candidate in as many waves as concurrency requires. Freeze one review-input projection, give all five its identical bytes and `reviewInputStatusHash`, require each report's matching start and end hashes and candidate, and apply the same all-reviewers-complete write barrier across every wave. They replace the ordinary M4 trio and therefore each give an explicit `PASS` or `FAIL` for `MATURITY-001`, `MATURITY-002`, and `MATURITY-003`, as well as a role-scoped final-goal verdict over the contract-base-to-final diff. Their bounded roles are: upstream/API/source completeness; runtime safety and hostile state transitions; TypeScript soundness and consumer usability; code cleanliness, quality, and elegance; and package/build/reproducibility plus false-green paths. They use the same no-inherited-turns and no-agent-status-tool isolation rule, must not see one another's reports, and must explicitly evaluate whether a new agent could reproduce the finish judgment from this file and `loop-status.md` without inventing product design. They need not emit 53 repetitive task verdicts: M0–M3 already gave every task three explicit independent verdicts, while the final role verdicts attack the complete integrated result.

Resolve and reconfirm every final blocker or major finding under the same follow-up rules. After any code, declaration, test, generated artifact, package/build file, or public-documentation fix, clear both attestations and stale command evidence, rerun full `vp run ready`, record its exact-candidate success, rerun `vp run check:completion`, and make all five original final reviewers inspect the exact final commit and its delta and renew their role-specific verdict; the originating reviewer also closes its finding. If a fix changes architecture, public behavior, or broad shared code, all five rerun their full base-to-final reviews rather than only a targeted delta. Completion is based on resolved evidence, not reviewer vote count, and all five final verdicts, `prefixEvidenceCommit`, and `milestoneReviewCommit` must name one identical commit. After the outcomes and complete-state proposal are written together, `vp run check:review-completion` is the terminal machine validation.

Before that terminal validation, the proposed final `loop-status.md` overwrite must identify the final commit, every accepted task and evidence location, the M0–M3 review trios, the five M4/final reviewers and follow-ups, exact `vp run ready`, current-runtime package smoke, and the exact Node `22.18.0` compatibility result document with all 816 secondary acceptance and 58 surface-probe results, locally tested platform, remote-platform caveats, remaining minor findings, confirmation that nothing was published or pushed, and `phase = complete`. After `vp run check:review-completion` passes, neither the status nor implementation tree may change. The agent may then report that the contract is satisfied; it must not add a vouch, delete either loop file, or perform the later human distillation.
