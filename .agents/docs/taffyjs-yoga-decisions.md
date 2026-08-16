# @taffyjs/yoga Decisions

This ledger records only judgments that Yunfei explicitly expressed about `@taffyjs/yoga`. Implementation, passing tests, resemblance to Yoga, review, or silence do not constitute acceptance.

## Decided

### Public package name

**Ruling:** The Yoga-compatible package must be named `@taffyjs/yoga`, not `@taffyjs/node-yoga`.

**Limits:** The name does not by itself promise Node-only, browser, or WASM runtime support. The implementation boundary is governed separately by [JavaScript-only compatibility boundary](#javascript-only-compatibility-boundary).

**Why:** Yunfei chose the shorter package name so that the public identity describes Yoga compatibility rather than encoding the current Node backend; no additional rationale was stated.

**Source:** Yunfei (`@hyfdev`), 2026-08-14; explicitly renamed the package from `@taffyjs/node-yoga` to `@taffyjs/yoga`.

### Drop-in source replacement

[VOUCHED @hyfdev 2026-08-14]

**Ruling:** After dependency substitution, a supported `yoga-layout` consumer must be able to use `@taffyjs/yoga` without changing its application source.

**Limits:** Source replacement applies only to the supported subset. It does not promise support for every Yoga API or pixel-identical layout: a supported call may have a published behavioral difference, while an unsupported call fails through the public TypeScript and runtime boundaries. The baseline version and runtime entries are governed by their separate decisions; the exact package-manager substitution mechanism and release criteria remain open. Replacing the dependency itself is outside application source and is necessarily part of selecting the compatibility package.

**Why:** Yunfei established unchanged consumer code as the basic design principle, then accepted explicit unsupported cases and documented layout differences instead of requiring universal Yoga parity.

**Source:** Yunfei (`@hyfdev`), 2026-08-14; explicitly required dependency-only replacement for supported consumers and vouched the clarified scope after the compatibility research.

### Initial Yoga compatibility baseline

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** The initial `@taffyjs/yoga` compatibility target is the latest stable `yoga-layout` release selected for the implementation and release; the current pinned research baseline is `yoga-layout@3.2.1`, which was the latest stable release when inventoried.

**Limits:** Compatibility claims, differential tests, and documentation must name the exact selected version. A later Yoga release is not covered automatically merely because it becomes latest; adopting it requires updating the inventory and rerunning the compatibility evidence. Supporting older Yoga versions or a multi-version range is not an initial requirement.

**Why:** A single current baseline keeps the API and behavior oracle unambiguous without adding legacy-version compatibility work before there is demand.

**Source:** Yunfei (`@hyfdev`), 2026-08-15; selected the latest Yoga release for the initial target and vouched the current `3.2.1` baseline.

### Node runtime and package entries

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** `@taffyjs/yoga` is permanently the Node.js compatibility package built over `@taffyjs/node`; it does not provide a browser or WASM backend. Its supported Node.js version follows `@taffyjs/node`, currently Node.js `>=22.18`. The package is ESM-only and reproduces both Yoga 3.2.1 public entry shapes at `@taffyjs/yoga` and `@taffyjs/yoga/load`.

**Limits:** The root entry provides the default Yoga facade plus the supported named enums and types; the `/load` entry provides `loadYoga()` plus the corresponding supported named enums and types. Exact unsupported exports remain governed by the compatibility classification. A possible future `@taffyjs/yoga-wasm` would be a separate package and is not promised or designed by this decision. The package-manager alias or dependency-substitution instructions remain to be verified.

**Why:** The implementation is intentionally a JavaScript compatibility layer over the native `@taffyjs/node` backend, while Yoga 3.2.1 itself is ESM and exposes both eager root and asynchronous `/load` entries. Keeping any future WASM backend under a distinct package avoids pretending that one package has interchangeable runtime implementations.

**Source:** Yunfei (`@hyfdev`), 2026-08-15; vouched Node-only support, the inherited Node.js version, ESM-only publication, and both public entries, and explicitly ruled out ever adding browser or WASM support to `@taffyjs/yoga` itself.

### Bun and Deno platform smoke coverage

**Ruling:** `@taffyjs/yoga` must run the same minimum-endpoint Bun and Deno platform smoke checks as its native `@taffyjs/node` backend, using the repository's current runtime versions and Deno native-loading requirements.

**Limits:** This is one minimal public-package layout smoke per runtime endpoint, not a copy of the Yoga compatibility suite. It does not add a browser or WASM backend to `@taffyjs/yoga`, implement `@taffyjs/yoga-wasm`, or independently choose runtime floors apart from the repository-wide Bun and Deno policy.

**Why:** No additional rationale was stated.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; stated that Yoga was implemented and asked to add the platform tests alongside the existing package coverage.

### Compatibility levels and behavior

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** Every evaluated Yoga capability must be classified as compatible, different, or unsupported: bounded and maintainable JavaScript alignment is preferred, a stable Taffy result may remain as a documented difference, and a capability without credible semantics must be rejected.

**Limits:** The classification is versioned and may improve as evidence supports maintainable JavaScript alignment. The initial concrete Different and Unsupported groups are governed by the entries below and detailed in the implementation reference. Exact measure-callback counts, order, and argument traces are not compatibility promises; the resulting layout follows the same three-way classification. A difference is not an unsupported capability and remains available in the public types. Compatibility targets the normal supported API and the core behavior consumers use, not total replication of wrapper identity, internal cache decisions, post-free access, double-free behavior, exact error text, internal recomputation, or other incidental implementation artifacts unless real consumer evidence makes one relevant.

**Why:** Yunfei initially treated strange Yoga behavior as contractual, then explicitly accepted differences when they are clearly documented and directed the project to align what is practical without overcomplicating the implementation.

**Source:** Yunfei (`@hyfdev`), 2026-08-14 and 2026-08-15; accepted documented Yoga/Taffy differences, retained the callback-trace exception, approved the three classifications and their initial examples, vouched the consolidated policy, and later clarified that 100% behavioral replication is meaningless compared with aligning core functionality and behavior.

### Initial measurement and computed-output scope

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** Yoga's Measure API and Yoga-shaped computed-output API must be supported as Compatible through bounded JavaScript mapping over `@taffyjs/node`; exact callback traces and MeasureMode-sensitive results remain governed by the Different classification below.

**Limits:** The Measure bridge may map each Taffy request to the closest meaningful Yoga constraint, normalize callback results, and preserve thrown-value identity, but it does not reconstruct Yoga's measurement phases or promise callback count, order, or exact argument provenance. Output projection may reconstruct Yoga fields, computed edges, and per-Node point-grid rounding from Taffy's unrounded Layout plus retained declaration and Config state, but it never replaces Taffy's geometry. A known Different Taffy layout remains Different after projection. Batch reads, selective queries, and compact transport are later performance work rather than compatibility semantics.

**Why:** The callback API and output shapes are important consumer capabilities and can be provided without modifying Taffy or implementing Flex in JavaScript. Yunfei accepted the bounded bridge and its explicit trace limitation after reviewing the feasibility evidence.

**Source:** Yunfei (`@hyfdev`), 2026-08-15; explicitly asked for Measure and output feasibility research, reviewed the resulting boundaries, and instructed that the proposed conclusions be recorded.

### Initial Different result groups

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** The initial Yoga 3.2.1 Different results include calculated `aspectRatio`; `min/max` combined with flex growth or shrinkage; MeasureMode-sensitive or flex-basis-sensitive measurement; Yoga-specific cache artifacts; and the evidenced main-axis auto-margin, reversed-axis overflow, oversized WrapReverse, and zero-cross-size line-distribution cases.

**Limits:** The same supported API calls remain available and return stable Taffy geometry under these documented triggers. The exact trigger and observed Yoga and Taffy results belong in [the implementation reference](taffyjs-yoga-reference.md#computed-layout-getters-and-cross-cutting-result-classes) and regression fixtures, not in this ledger. New evidence may add or narrow a Different trigger under the general classification policy; reclassifying a capability as Compatible or Unsupported requires corresponding documentation and verification.

**Why:** Aligning these results would require parent-dependent Flex state, Yoga cache replication, or sibling distribution logic in JavaScript, crossing the accepted implementation boundary. Yunfei preferred explicit stable differences over such complexity.

**Source:** Yunfei (`@hyfdev`), 2026-08-15; accepted the proposed Different groups and instructed that they be recorded after the independent adversarial review preserved the no-blocker conclusion and broadened the auto-margin trigger.

### Initial Unsupported capability groups

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** The initial Yoga 3.2.1 Unsupported capabilities are `Display.Contents`, `PositionType.Static`, non-`None` Errata values, `setIsReferenceBaseline(true)`, Align values used outside their valid property context, and undeclared broken generic-setter coercions or Value-like getter-to-setter inputs.

**Limits:** Omit a wholly unsupported method, enum member, or legacy constant where TypeScript can express the restriction, and reject every dynamic unsupported use at runtime before state changes. Supported portions of a split API remain available: Relative and Absolute positioning, `Errata.None`, valid Align contexts, and reference-baseline false state are not removed. Exact error classes and wording remain implementation choices.

**Why:** These capabilities cannot provide credible semantics within a bounded JavaScript layer over the current binding, while silently accepting them would make the compatibility claim misleading. Yunfei preferred type-level exclusion plus runtime rejection when support is not defensible.

**Source:** Yunfei (`@hyfdev`), 2026-08-15; accepted the proposed initial Unsupported list and instructed that it be recorded.

### Yoga declaration and runtime mismatch policy

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** For supported APIs, preserve Yoga 3.2.1's published TypeScript declarations even where they disagree with its working runtime behavior, and reproduce the useful runtime behavior; deliberately correct the dirtied callback so `null` unsets it and a real callback receives the declared canonical Node argument.

**Limits:** Unsupported values remain narrowed despite Yoga's broader declarations. This policy covers known mismatches such as `getGap`, the gap-setter return declarations, out-of-range `getChild`, and omitted `calculateLayout` arguments; it does not require accidental coercions or broken Value-like round trips. Exact callback counts and ordering remain excluded, and future Yoga baselines require the mismatch inventory to be rerun.

**Why:** Correcting published declarations would break otherwise unchanged TypeScript consumers, while the actual runtime shapes are finite and cheap to reproduce. Yoga's zero-argument dirtied callback and delayed failure after installing `null` contradict its own declared API and are not useful compatibility behavior.

**Source:** Yunfei (`@hyfdev`), 2026-08-15; accepted the proposed source-compatibility policy and deliberate dirtied-callback corrections and instructed that they be recorded.

### JavaScript-only compatibility boundary

[VOUCHED @hyfdev 2026-08-14]

**Ruling:** `@taffyjs/yoga` must never modify, fork, or patch Taffy core for Yoga compatibility and must never reimplement the Flex algorithm in JavaScript; all compatibility logic must remain a bounded JavaScript or TypeScript layer over `@taffyjs/node`.

**Limits:** Local input normalization, API and enum mapping, unit and edge conversion, numeric `flex` expansion, and independently implementable output processing such as rounding are allowed. If alignment requires Taffy-internal Flex state or reproducing the layout algorithm, the behavior must remain a documented difference when Taffy has credible semantics or become unsupported otherwise. This ruling does not choose unrelated `@taffyjs/node` or upstream Taffy evolution.

**Why:** Yunfei explicitly rejected core changes as unnecessary maintenance and limited compatibility work to JavaScript logic, with a documented difference or unsupported result when that boundary cannot align Yoga.

**Source:** Yunfei (`@hyfdev`), 2026-08-14; stated that core modification will never be used for this package, accepted only JavaScript-layer compatibility, and vouched the consolidated boundary.

### Facade runtime and ownership

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** Each loaded Yoga facade owns one hidden `TaffyTree`. Every live Node created by that facade has a stable NodeId in the tree; Taffy is the sole authority for topology and layout calculation. The JavaScript layer may own the bounded Yoga-facing state, Config data, callbacks, lifetime checks, and output conversion needed by the compatibility API, but it must not maintain a second authoritative node tree or layout implementation.

**Limits:** This fixes the logical ownership boundary, not private class names, file layout, registry data structures, garbage-collection mechanics, exact error types, or optional non-authoritative caches. Normal lifecycle behavior should be safe and deterministic; Yoga's dangling pointers, proxy aliasing, and other incidental post-free artifacts are not compatibility targets. Exact operation-level lifecycle transitions remain subject to implementation fixtures.

**Why:** One Yoga facade is one isolated object space that may contain many detached Nodes and unrelated layout roots. A `TaffyTree` already represents that whole forest, so this ownership follows the public object model directly while keeping topology and geometry in one native authority.

**Source:** Yunfei (`@hyfdev`), 2026-08-15; accepted and vouched the recommended high-level ownership model, while treating alternative per-root or per-Config partitioning as unnecessary research detail rather than a meaningful product choice.

### Yoga declaration state and derived native state

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** Every Node retains the current normalized Yoga declaration state for every supported Style capability. A successful Yoga setter updates that state synchronously. The Taffy Style applied to the NodeId and the most recently calculated Layout are derived states that may represent an older declaration revision: declared-style getters immediately return the current Yoga declaration, computed-layout getters continue to return the last calculated output until `calculateLayout()` runs, and Yoga-visible dirty state reports that separation. Taffy remains the sole topology authority and layout calculator.

**Limits:** Complete logical declaration state does not require an eagerly allocated full nested object. Shared defaults, sparse deviations, compact slots, concrete revision bookkeeping, and eager or lazy Taffy synchronization remain implementation and performance choices. Unsupported or invalid setters must fail without changing the declaration. Exact mutation failure atomicity and operation-level state transitions still require fixtures. The hidden TaffyTree is not exposed as a second public mutation path.

**Why:** Yoga preserves declaration distinctions that a final Taffy Style cannot reconstruct, including edge precedence, unset versus explicit values, flex shorthand fallback, `Direction.Inherit`, and Config-sensitive defaults. Keeping the current Yoga declaration as one logical owner also makes getters, `copyStyle()`, `reset()`, and dirty comparison consistent, while allowing native Style and Layout to be treated as ordinary derived results.

**Source:** Yunfei (`@hyfdev`), 2026-08-15; reviewed the declared-versus-computed getter behavior, accepted that dirty describes outdated derived state rather than an invalid declaration, and explicitly vouched the model.

### Type and runtime rejection

[VOUCHED @hyfdev 2026-08-16]

**Ruling:** An unsupported method or value that TypeScript can identify from one call must be rejected by the public declarations even when Yoga's published parameter type is broader, and every unsupported capability must also throw at runtime for JavaScript, `any`, and dynamic values.

**Limits:** A restriction is statically expressible when unsupported status depends only on that call's argument and the supported values form a finite union. A variable or generic whose type still permits any unsupported member must be narrowed before the call; this compile error is intentional migration feedback, not a defect in drop-in replacement. Use simple named unions rather than conditional types designed to special-case the exact broad upstream enum; named type-only aliases may expose those unions as migration aids without changing the runtime surface. Do not narrow an API merely because its result is Different, and do not try to encode combinations across multiple setters, tree state, or layout output. Exact error classes, messages, and the complete initial unsupported list remain implementation choices. Unsupported input must not be silently ignored or converted into a result with semantics the package cannot defend.

**Why:** Compile-time rejection helps migration find a potentially unsupported path before that path happens to execute. Preserving a broad upstream declaration would instead allow unsupported members to compile and leave discovery to runtime coverage. Simple finite unions keep the restriction predictable and maintainable, while runtime validation still protects untyped and dynamic calls.

**Source:** Yunfei (`@hyfdev`), 2026-08-14, 2026-08-15, and 2026-08-16; selected type-level rejection plus runtime checking, clarified that a broad Align variable or generic must be treated as a migration issue when it may carry an unsupported property value, accepted named type-only aliases as the friendlier migration path, and explicitly vouched this distilled rule.

### PositionType public shape

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** @taffyjs/yoga must preserve Yoga's numeric enum, default uppercase constants, and setPositionType/getPositionType method form for the supported Relative and Absolute values; it must omit PositionType.Static and POSITION_TYPE_STATIC and reject a dynamically supplied zero.

**Limits:** This ruling covers PositionType only. Other enums require the API inventory and compatibility classification before unsupported members are removed, and the exact runtime error class and message remain open.

**Why:** Yunfei required the compatibility API to use Yoga's own form, preferred unsupported capabilities not to be exposed, and accepted the narrowed enum after Yoga 3.2.1 was verified to use a TypeScript numeric enum rather than an as-const object.

**Source:** Yunfei (`@hyfdev`), 2026-08-14; confirmed that the corrected Yoga-shaped API had no issue.

### Published compatibility and verification

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** Published compatibility documentation must identify each evaluated capability as compatible, different, or unsupported, state the affected Yoga version and trigger, and describe the observable Yoga and TaffyJS behaviors; known differences and unsupported cases must have regression coverage.

**Limits:** Test counts must not be presented as a universal compatibility percentage. Verification should use real Yoga as an oracle. A specific unchanged external consumer may be added only after it is deliberately selected; none is part of the base reference. The exact fixture corpus, supported-version range, and release threshold remain open. A later JavaScript-only improvement may reclassify an entry if its documentation and tests change with it.

**Why:** Yunfei made clear documentation the condition for accepting behavioral differences and approved differential verification rather than hiding or overclaiming compatibility.

**Source:** Yunfei (`@hyfdev`), 2026-08-14; required differences to be documented, accepted explicit unsupported behavior, vouched the original consolidated verification rules, and later clarified that the base design must not preselect Ink or another external consumer.

### Official Yoga compatibility corpus

**Ruling:** Compatibility verification must run the official Yoga JavaScript test snapshot under `tests/taffyjs-yoga/yoga-official/` against every maintained Yoga backend. The directory name remains stable while the exact Yoga version, tag, and commit live in its README. Cases covered by a published Different or Unsupported classification must be registered as explicit expected failures; every other active upstream case must pass.

**Limits:** The snapshot is a bounded regression corpus, not a compatibility percentage and not a replacement for focused TaffyJS differential, rejection, type, state, or failure-atomicity tests. Yoga's benchmarks and Chrome/Selenium generator are not part of the normal suite. The copied upstream sources stay unchanged, retain their license, and are replaced from one reviewed commit when the compatibility baseline changes. An unexpected failure or an expected failure that begins passing requires reviewing the implementation, classification, focused tests, and documentation together rather than silently changing the expected-failure list.

**Why:** The official suite provides broad, maintained combinations of Yoga's JavaScript API and layout behavior, while the existing focused tests explain and enforce TaffyJS-specific compatibility boundaries. Keeping the version in the README avoids renaming the directory on a future baseline update.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; asked to migrate Yoga's official JavaScript tests as compatibility coverage, selected `tests/taffyjs-yoga/yoga-official/`, required the version to live in its README, and accepted the proposed pinned-snapshot and classified-failure approach.

### Upstream work and current compatibility

[VOUCHED @hyfdev 2026-08-16]

**Ruling:** Published compatibility classifications must describe only the behavior available through the Taffy version actually pinned by `@taffyjs/yoga`; relevant upstream implementation work must be shown separately as work in progress without changing the current Compatible, Different, or Unsupported classification.

**Limits:** An upstream issue or pull request is evidence of active work, not shipped support, a delivery promise, or an ETA. Reclassification requires the upstream capability to land in a released Taffy version, the required native API to be adopted and exposed by `@taffyjs/node`, and the affected Yoga behavior to pass differential verification with updated documentation and regression fixtures. Current upstream-work entries and statuses live only in the [public compatibility document](../../packages/taffyjs-yoga/COMPATIBILITY.md#upstream-work-in-progress) and must be refreshed when work merges, closes, or is replaced.

**Why:** Yunfei required active support work to appear in the compatibility documentation; no additional rationale was stated.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; explicitly required relevant work in progress to appear in the compatibility documentation, used [DioxusLabs/taffy#1009](https://github.com/DioxusLabs/taffy/pull/1009) as the concrete example, and instructed that direction to be recorded as vouched.

### Pre-1.0 versioning

[VOUCHED @hyfdev 2026-08-16]

**Ruling:** `@taffyjs/yoga` will remain on the `0.x` version line for the foreseeable future; before 1.0, every public breaking change, including a Yoga-alignment fix that changes supported observable behavior, must bump the minor version, while a fix that preserves the public behavior contract bumps the patch version.

**Limits:** This policy governs only pre-1.0 releases and does not promise that 1.0 will retain the same versioning convention or set a timetable for 1.0. The required bump follows the observable effect of `@taffyjs/yoga`, not whether Taffy or Yoga labels an upstream change as a fix. Internal implementation, performance, cache, recomputation, exact error wording, and callback-trace changes may remain patch-level when they stay outside the compatibility contract and preserve supported results. The versioning of additive features is not decided by this ruling. A release containing both patch-level fixes and any breaking behavior change requires a minor bump.

**Why:** Correcting a Yoga mismatch is necessary, but consumers may depend on the package's previous layout or API behavior even when that behavior was a bug; a minor release makes that change explicit while keeping contract-preserving fixes available through patch upgrades.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; explicitly chose a long-lived `0.x` line, minor bumps for behavior-changing compatibility fixes and other breaking changes, patch bumps for other fixes, and deferred any guarantee about post-1.0 policy.

### Integration-test placement

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** Public compatibility, differential, and end-to-end tests for `@taffyjs/yoga` belong under the repository-level `tests/taffyjs-yoga/` consumer package, following the same package-boundary testing policy as `@taffyjs/node`.

**Limits:** Do not add a redundant `tests/taffyjs-yoga/tests/` directory. Exact fixture files and any purposeful behavior-based subdirectories remain an implementation-planning choice. Rare isolated package-internal unit tests remain governed by the repository-wide testing policy.

**Why:** These tests prove the public package as a downstream consumer sees it; package-boundary integration and end-to-end coverage already belong under the repository-level `tests/` collection.

**Source:** Yunfei (`@hyfdev`), 2026-08-15; explicitly required all `@taffyjs/yoga` compatibility tests to use the top-level `tests/taffyjs-yoga/` location and rejected a redundant nested `tests` directory.

### Calculation target and observable layout state

[VOUCHED @hyfdev 2026-08-14]

**Ruling:** `calculateLayout()` remains supported on any live Yoga Node, including a node that is still attached to a parent; it must not be restricted to detached roots. Taffy's native dirty and calculation-cache state are internal implementation details, while the JavaScript compatibility layer owns the Yoga-visible `isDirty()` and `hasNewLayout()` state. The layer must not reproduce Yoga's complete internal cache algorithm; an observable result that differs only because Yoga retained a stale cached ancestor or subtree after a separate attached-subtree calculation is classified and documented as different.

**Limits:** This ruling preserves the public calculation entry and state methods but does not promise identical internal recomputation, cache-hit behavior, performance, measure-callback traces, or every cache-derived stale geometry sequence. The exact JavaScript state transitions still require regression fixtures. Taffy remains the only layout calculator; JavaScript may retain finite flags and revisions but must not calculate geometry or duplicate the Flex algorithm.

**Why:** Calculating an attached subtree can require updating its translated Taffy Style, which propagates native dirty state into ancestors even though Yoga may leave those ancestors observably clean. Yunfei judged the underlying dirty/cache propagation to be an internal behavior and accepted a documented difference rather than restricting `calculateLayout()` or reproducing Yoga's cache implementation.

**Source:** Yunfei (`@hyfdev`), 2026-08-14; explicitly vouched the recommendation that native dirty/cache remain internal, Yoga-visible state be maintained in JavaScript, cache-derived differences be documented, and `calculateLayout()` remain available on arbitrary nodes.
