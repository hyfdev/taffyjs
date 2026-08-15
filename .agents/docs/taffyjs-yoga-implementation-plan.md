# @taffyjs/yoga Implementation Plan

This is the operational plan for implementing the Yoga 3.2.1 compatibility package. Product commitments live in [the decision ledger](taffyjs-yoga-decisions.md), while the evidence and exact compatibility inventory live in [the implementation reference](taffyjs-yoga-reference.md). If this plan conflicts with a vouched decision, the decision wins.

## Outcome

Add an ESM-only `@taffyjs/yoga` package for Node.js `>=22.18` that is implemented entirely in TypeScript over `@taffyjs/node`, exposes the supported Yoga 3.2.1 root and `/load` entry shapes, and lets a supported consumer keep imports such as `import Yoga from "yoga-layout"` after replacing only the dependency.

The implementation is successful when every evaluated Yoga 3.2.1 capability is represented in the public types and runtime as Compatible, Different, or Unsupported; the supported surface has package-boundary tests; every documented Difference and Unsupported case has a durable regression fixture; and the repository's normal checks pass on the supported native platforms.

## Boundaries

- Do not modify, fork, or patch Taffy core or add Yoga-specific Rust behavior.
- Do not add public or private `@taffyjs/node` APIs for this implementation. If the current binding cannot support credible Yoga semantics through bounded TypeScript, classify the behavior as Different or Unsupported.
- Do not implement Flex layout, sibling distribution, Yoga cache behavior, or parent-dependent layout correction in JavaScript.
- Do not add browser or WASM support. A possible future `@taffyjs/yoga-wasm` is a separate project.
- Do not promise callback count, callback order, exact internal recomputation, post-free artifacts, or pixel equality for cases already classified as Different.
- Do not make selective query, batch reads, or compact Layout transport a prerequisite. They are later transport optimizations that must not change Yoga semantics.
- Do not add a Yoga-specific code generator in the first implementation. The authored TypeScript source is the single source for runtime values and emitted declarations. Add generation only if one maintained fact later has to agree across independent outputs and ordinary TypeScript cannot keep it single-sourced.
- Do not publish packages or add release automation in this implementation PR. The repository currently has no publication workflow; registry publication and changing package privacy are separate release decisions.

## Runtime design

### Facade

The root module creates one default Yoga facade. Every call to `loadYoga()` from `@taffyjs/yoga/load` asynchronously returns a new facade. Each facade owns one hidden `TaffyTree`, disables Taffy's tree-wide rounding, owns its default Config state, and rejects Nodes or Config handles created by another facade.

The default facade is a module singleton. The asynchronous `/load` shape is preserved even though creating the native-backed facade does not itself require asynchronous work.

### Node and Config state

Each live Node has a stable NodeId and one normalized Yoga declaration record. The facade also retains the Node's Config state, callbacks, measure marker, Yoga-visible dirty and new-layout flags, last applied translation revision, and last committed Yoga-shaped output. Taffy remains the only owner of topology and geometry.

A public Config handle may be freed while Nodes retain the underlying Config state they were created with. Freeing invalidates the public handle but does not leave dangling state. Node and Config handles use facade and lifetime brands so cross-facade, stale, and freed values fail before native mutation.

The first implementation uses explicit Yoga lifetime operations rather than `FinalizationRegistry` behavior. A facade may retain Node records and their canonical wrappers until `free()`, `freeRecursive()`, or facade collection; this preserves stable identity and matches Yoga's explicit-lifetime model without making garbage-collection timing observable.

### Declaration translation

Yoga setters normalize their input into the Node's declaration record. Getters read that record or a Yoga-defined default, never reverse-engineer the current Taffy Style. The record preserves information that Taffy cannot: unset versus Auto, logical and shorthand edges, `Direction.Inherit`, numeric `flex`, independent flex longhands, and Config-sensitive defaults.

Translation from the declaration record plus Config and resolved direction produces a complete Taffy Style. Translation is deterministic and side-effect free. It may be applied lazily before calculation so inherited direction and related context are correct. Invalid or unsupported mutations are rejected before any JavaScript or native state changes.

### Topology and lifecycle

All parent and child questions go through Taffy; there is no authoritative JavaScript child array. A small cache is permitted only when it can be rebuilt from or checked against Taffy and cannot affect correctness.

Every single-step topology operation follows the same order: validate all handles, facade ownership, indices, cycle and measured-leaf constraints; perform the native mutation once; commit JavaScript state; then invoke user callbacks. Validation and expected native failures before commit leave declarations, topology, callbacks, public flags, and computed output unchanged. A user callback that throws does so after the mutation is committed and is not rollback-safe; internal state must already be consistent before the callback runs.

Destructive multi-step operations such as `freeRecursive()` first snapshot and validate the complete target subtree, then remove it in postorder without invoking user callbacks between native steps. There is no native transaction with which to promise rollback after an unexpected mid-operation binding failure. If such an internal invariant failure occurs after a partial native commit, mark the facade unusable and reject later calls rather than exposing a facade whose JavaScript state may disagree with Taffy. This poison path is defensive handling for an unexpected internal failure, not a normal public error case.

### Calculation and output

`calculateLayout()` accepts any live Node, including an attached subtree. Before calculation, traverse only the selected subtree, resolve effective declarations, and synchronize stale Taffy Styles. Use ordinary `computeLayout` when the subtree has no measured Node and `computeLayoutWithMeasure` only when measurement is needed.

A finite calculation width or height is an exact outer constraint on the selected Yoga calculation root. Apply the already researched temporary root-Style adjustment, calculate with Taffy, read all required unrounded Layout values, and restore the declaration-derived Style in a `finally` path. The temporary Style is calculation context and never becomes Yoga declaration state.

After native calculation succeeds, project the selected subtree into Yoga-shaped outputs in a temporary map. Geometry always comes from Taffy. The projection reconstructs Yoga's right and bottom values, root positions, resolved computed edges, auto-margin reporting, and per-Node point-scale rounding. Commit every Node's output and public flags only after the entire projection succeeds; a measurement or projection failure preserves the previous public outputs and dirty state.

If Yoga's pixel-grid formula is ported from Yoga source, retain the MIT permission notice and clear source attribution in a packaged third-party notice and beside the implementation. Do not copy the upstream wrapper wholesale.

### Measurement

One facade-level Taffy measure closure dispatches a request by NodeId to the Yoga callback stored for that Node. Known dimensions map to `MeasureMode.Exactly`, finite available space to `AtMost`, max-content to `Undefined` with NaN, and min-content to `AtMost` with zero. Callback results follow the normalization and thrown-value rules in the implementation reference.

Measured Nodes must remain leaves. Same-tree native calls made reentrantly from a measure callback may use `@taffyjs/node`'s existing controlled tree-busy failure; exact reentrant behavior and callback traces are not compatibility promises. A callback failure must leave public output atomic and allow a later calculation to retry.

## Repository changes

The implementation adds these package boundaries:

```text
packages/taffyjs-yoga/
  package.json
  vite.config.ts
  tsconfig.json
  README.md
  COMPATIBILITY.md
  THIRD_PARTY_NOTICES.md
  dist/
    index.js
    index.d.ts
    load.js
    load.d.ts
    <shared chunks when emitted>
  src/
    index.ts
    load.ts
    facade.ts
    config.ts
    node.ts
    declarations.ts
    enums.ts
    values.ts
    translate.ts
    measurement.ts
    output.ts
    errors.ts

tests/taffyjs-yoga/
  package.json
  vite.config.ts
  tsconfig.json
  exports.test.mts
  config.test.mts
  style.test.mts
  topology.test.mts
  lifecycle.test.mts
  state.test.mts
  layout.test.mts
  measurement.test.mts
  differences.test.mts
  unsupported.test.mts
  types/
    tsconfig.json
    public-api.test-d.ts
```

The source split is a starting ownership map, not a requirement to keep empty or one-function files. Merge files when that produces a clearer implementation. `tests/taffyjs-yoga/` is itself the downstream consumer package: do not add another `tests/` directory or an unexplained `e2e/` directory inside it.

`packages/taffyjs-yoga` uses `vp pack` with `src/index.ts` and `src/load.ts` as ESM entries and a cleaned `dist/` output directory. The package exports point to `dist/index.js`, `dist/index.d.ts`, `dist/load.js`, and `dist/load.d.ts`; every shared JavaScript chunk emitted by the pinned packer is also included through the packaged `dist/` directory. Its runtime dependency is only `@taffyjs/node` through `workspace:*`; `yoga-layout` is never a runtime dependency of the published package.

`tests/taffyjs-yoga` installs the implementation under Yoga's original name with the pnpm workspace alias `"yoga-layout": "workspace:@taffyjs/yoga@*"`, so test source imports the unchanged consumer specifiers `yoga-layout` and `yoga-layout/load`. It installs the official oracle separately as `"yoga-layout-oracle": "npm:yoga-layout@3.2.1"`. The package README gives published consumers the standard npm alias `"yoga-layout": "npm:@taffyjs/yoga@<version>"`. The workspace form follows [pnpm's documented workspace aliases](https://pnpm.io/workspaces#referencing-workspace-packages-through-aliases), while the published form follows [npm package aliases](https://docs.npmjs.com/cli/using-npm/package-spec#aliases) and [pnpm aliases](https://pnpm.io/aliases). Because publication is out of scope and the repository deliberately has no tarball-install test path, CI proves the built workspace alias and all exported entry files; installing the registry alias remains a post-publication smoke check.

The root Vite+ task graph gains a Yoga package build after `build:binding`, Yoga runtime integration tests, and Yoga declaration checks. The normal root `build`, `check:test`, `check`, and `ready` tasks include them. After building on Ubuntu, CI runs `git add --intent-to-add --all -- packages/taffyjs-yoga/dist` before diffing the complete committed output directory, so a new untracked shared chunk as well as changed or deleted entry output, chunks, and declarations fails freshness; Windows runs the same runtime and type tests through the normal task graph. `pnpm-lock.yaml`, workspace metadata, root documentation, and package metadata change in the same milestone that introduces the package.

## Verification strategy

The official `yoga-layout@3.2.1` package is the behavior oracle, but tests must remain small enough to explain and maintain.

- Compatible fixtures run the same supported source operations against both implementations and compare the relevant public result. They cover representative equivalence classes rather than copying Yoga's complete upstream suite.
- Different fixtures pin both the Yoga result and the TaffyJS result for the exact documented trigger. They prove that the difference remains understood; they do not assert equality.
- Unsupported fixtures prove both boundaries where possible: statically known use fails the TaffyJS declaration check, and dynamic JavaScript or `any` input throws before any observable state changes.
- Package-entry fixtures inspect root and `/load` exports, enum reverse lookup, legacy constants, facade isolation, and the unchanged-import alias. Public surface comparison uses real Yoga reflection plus the explicit unsupported exclusions instead of a second duplicated 100-method list.
- State fixtures prove declaration getters versus last calculated output, dirty and new-layout transitions, callback argument correction, arbitrary attached-subtree calculation, retained Config state, canonical Node identity, pre-commit mutation failure atomicity, and post-commit callback-error behavior.
- Layout fixtures cover ordinary fixed and flex cases plus the explicit Difference classes. Computed-output fixtures separately cover root and trailing positions, logical edges under LTR and RTL, auto margins, detached output reset, and mixed point-scale factors.
- Measurement fixtures cover constraint-insensitive callbacks, mode mapping, normalization, thrown-value identity, retry, measured-leaf restrictions, ordinary-compute fast selection, and the documented MeasureMode-sensitive Difference.

Tests run concurrently by default. Add a separate-process fixture only when process containment is itself necessary, such as proving that a native panic, abort, or deadlock cannot escape the test. Do not add runtime tests that read documentation or source files, generator tests, or duplicate fixtures that differ only in setup wording.

Performance work in this PR is diagnostic rather than contractual. Keep a small local benchmark or profile for creation, style mutation, calculation, measured calculation, and computed-output reads, but do not add a timing threshold to CI or claim that the package is faster than Yoga. Optimize only after a representative workload identifies a material cost; batch/query/compact transport remains separate work.

## Milestones

### Milestone 0: reviewed implementation baseline and draft PR

Deliver the decision ledger, implementation reference, this plan, the repository-level intent and architecture links, and the repository-required `loop-goal.md` plus initial `loop-status.md`. Resolve factual contradictions, run formatting and link checks, obtain an independent adversarial review of the plan and Goal contract, and open one draft implementation PR from the existing task branch. The unattended implementation run must not start until Yunfei has vouched the exact `loop-goal.md`; that file then remains immutable for the run.

Exit gate: the review finds no unresolved material blocker; the documents distinguish vouched decisions from derived implementation guidance; the branch is pushed; the draft PR is visible; and Yunfei has explicitly vouched the exact `loop-goal.md` before unattended implementation starts. No implementation claim is made yet.

### Milestone 1: package, entries, facade, and thin vertical slice

Add the package and test-consumer scaffolding, both public entries, all supported enum objects and legacy constants, factory shapes, facade isolation, lifetime brands, a hidden rounded-disabled TaffyTree, and one minimal create-set-calculate-read path. Wire the package into the workspace, Vite+ build graph, type checking, runtime tests, CI output freshness, and lockfile.

Exit gate: unchanged `yoga-layout` and `yoga-layout/load` imports resolve through the workspace alias; a clean build produces working exported entries and declarations plus every required shared chunk under `dist/`; the package metadata includes that complete directory, the freshness command detects a deliberately untracked probe output during implementation verification, and the built code contains no runtime `yoga-layout` dependency; two loaded facades reject each other's handles; the thin layout slice passes on the current host; relevant root checks pass; adversarial review findings are resolved; one milestone commit is pushed to the draft PR.

### Milestone 2: Config, declaration model, and Style API

Implement Config state and lifetime, complete normalized declarations, Yoga input normalization, Yoga defaults and `useWebDefaults`, all supported Style getters and setters, edge and logical precedence, gaps, direction, flex shorthand and longhands, deterministic translation, `copyStyle`, unsupported enum/value narrowing, and runtime validation with pre-commit failure atomicity.

Exit gate: the public Style and Config surface matches the classified Yoga 3.2.1 contract; representative round trips and oracle cases pass; Unsupported inputs are absent or narrowed in declarations and throw dynamically without mutation; relevant and full repository checks pass; adversarial review findings are resolved; one milestone commit is pushed.

### Milestone 3: topology, lifecycle, callbacks, and public state

Implement Node creation and destruction, insert/remove/lookup, canonical identity, one-parent and acyclic constraints, `free`, `freeRecursive`, `reset`, retained Config state, declaration copying, measured-leaf topology checks, Yoga-visible dirty and new-layout transitions, and the deliberately corrected dirtied callback behavior.

Exit gate: lifecycle, attached and detached topology, cross-facade rejection, state transitions, retained Config behavior, callback argument and null handling have durable fixtures; validation and expected pre-commit native failures preserve observable state; callback exceptions are pinned as post-commit behavior; multi-step destructive operations prevalidate their snapshot and have an explicit poisoned-facade path for an unexpected partial internal failure; no JavaScript child tree or layout algorithm exists; relevant and full checks pass; adversarial review findings are resolved; one milestone commit is pushed.

### Milestone 4: complete calculation and computed output

Implement arbitrary-node calculation, declaration synchronization, effective direction, temporary exact root constraints with guaranteed restoration, subtree output collection, Yoga right and bottom semantics, root positions, computed edges, auto-margin reporting, per-Node point-grid rounding, output commit atomicity, and all computed getters.

Exit gate: the ordinary Compatible geometry corpus matches Yoga; every current non-measurement Difference has a fixture that pins both results and a matching `COMPATIBILITY.md` entry; failed calculation or projection retains prior public output; mixed Config rounding passes; relevant and full checks pass; adversarial review findings are resolved; one milestone commit is pushed.

### Milestone 5: Measure API

Implement callback registration and removal, measured-leaf enforcement, Taffy request to Yoga MeasureMode mapping, result normalization, thrown-value identity, retry, measured output rounding, ordinary-compute selection for subtrees without measured Nodes, and controlled same-tree callback reentrancy behavior.

Exit gate: normal measurement behavior matches the accepted contract; callback-trace and mode-sensitive limits are documented and pinned as Differences; failure and retry are atomic; a profile confirms that unmeasured trees do not enter the measure bridge; relevant and full checks pass; adversarial review findings are resolved; one milestone commit is pushed.

### Milestone 6: compatibility closure and package evidence

Audit the exact Yoga 3.2.1 surface against the inventory, finish root and `/load` export parity, verify the workspace alias and clean `dist/` package contents, complete `README.md`, `COMPATIBILITY.md`, and third-party notices, remove obsolete research TODOs, and run the complete repository verification on the supported local host.

Exit gate: no public capability remains unclassified; documentation names Yoga 3.2.1 and every known Difference and Unsupported trigger; package output is current; `vp run ready` and `vp run check:codegen` pass; the final implementation receives adversarial review and targeted follow-up if needed; the last milestone commit is pushed. The PR stays draft and unmerged for Yunfei's decision.

## Review and PR protocol

Use one long-lived draft PR for the complete implementation. Stacked milestone PRs would add branch and merge-order overhead without improving observability; milestone commits and checks already expose progress clearly.

For every milestone:

1. Implement only that milestone's scope and preserve unrelated user work.
2. Run the smallest relevant checks while iterating, then the milestone's full gate before review.
3. Give one fresh independent reviewer a self-contained, bounded packet containing the milestone objective, changed files, test evidence, governing decisions, and the highest-cost assumption to attack. The reviewer must not delegate and returns a pass or at most three material findings.
4. Verify each finding against source or a focused reproduction. Fix evidence-backed findings. If a finding materially changes the result, ask the same reviewer for one targeted follow-up covering that finding and regressions, then stop the review loop.
5. Commit the reviewed milestone as one coherent named commit and push it to the existing draft PR. Do not hide unfinished work in an unpushed local commit.
6. Update `loop-status.md` with completed work, evidence, next work, blockers, and any vouched-direction conflict, and include that state in the milestone push.
7. Continue to the next milestone autonomously unless a genuine product choice, authority boundary, or external blocker requires Yunfei. Do not merge, mark the PR ready, publish, or post GitHub comments on Yunfei's behalf.

Milestone review is a completion gate, not a request to review every routine edit. A pushed milestone may contain several local work-in-progress commits only if they are squashed or otherwise made coherent before the milestone is declared complete.

## Risks to watch during implementation

- Temporary root-Style restoration and public output commit must preserve the previous public state when a measure callback throws; an unexpected failure to restore native Style poisons the facade because native rollback cannot be promised.
- Direction, logical edges, Config changes, and attached-subtree calculation can invalidate translation without a corresponding Yoga-visible dirty transition; revisions must keep those concepts separate.
- A strong canonical-wrapper registry is deliberately simple but requires explicit lifetime tests so `free`, `freeRecursive`, and facade collection do not retain native state accidentally.
- User callback errors are post-commit errors. Never invoke a user callback while JavaScript and native state disagree, and never pretend that an external side effect can be rolled back.
- Yoga declarations and useful runtime behavior sometimes disagree. Preserve the published declaration for supported APIs while pinning the selected runtime behavior; do not silently “correct” types during implementation.
- The official oracle is a test-only dependency under an alias. Any accidental runtime import from it would invalidate the package architecture.
- The compatibility matrix is version-specific. Do not update the Yoga baseline opportunistically during implementation.
- A local performance observation is not a release claim. Measure before adding caches, batch calls, queries, or compact transport.
