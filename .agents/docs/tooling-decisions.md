# Tooling Decisions

This ledger records only tooling judgments that Yunfei explicitly expressed for this repository. Implementation, passing checks, resemblance to another repository, or silence do not constitute acceptance.

## Decided

### Direct names for top-level test packages

[VOUCHED @hyfdev 2026-08-16]

**Ruling:** Every workspace package directly under the repository's top-level `tests/` directory must use an unscoped name formed by appending its corresponding identifier to `tests-taffy-`. Identifiers such as `node`, `wasm`, `yoga`, and `yoga-wasm` therefore produce names such as `tests-taffy-node`, `tests-taffy-wasm`, `tests-taffy-yoga`, and `tests-taffy-yoga-wasm`.

**Limits:** This governs test workspace package names and every task selector that refers to them. It does not rename their directories, public `@taffyjs/*` packages, or projects nested below a top-level test package.

**Why:** Yunfei preferred the direct `tests-taffy-<identifier>` convention over scoped names ending in `integration-tests`; no additional rationale was given.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; explicitly chose `tests-taffy-node`, extended that pattern to every package directly under top-level `tests/`, clarified that the suffix is the corresponding identifier rather than an abstract target, and asked to vouch the decision.

### Repository-wide TypeScript default

[VOUCHED @hyfdev 2026-08-16]

**Ruling:** Across the entire repository, maintained code that would otherwise be authored in JavaScript—including source, tests, fixtures, configuration, scripts, and tools—must be written in TypeScript unless a concrete execution or generated-output boundary requires JavaScript.

**Limits:** This chooses TypeScript over JavaScript; it does not turn Rust, JSON, Markdown, or other domain-appropriate files into TypeScript. Generated package files, napi-rs loader output, required final `.js` or `.cjs` package formats, and JavaScript text intentionally executed as an installed-consumer payload are not authored TypeScript source. Any maintained `.js`, `.mjs`, or `.cjs` file needs a specific present constraint; convenience, file size, or lack of existing annotations is not sufficient. This does not change the public package output format.

**Why:** Yunfei established TypeScript as the repository-wide default and required an actual special reason for any exception; no additional rationale was given.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; explicitly stated that everything should use TypeScript unless there is a special reason not to, then explicitly promoted and vouched this as a repository-wide PCR rule.

### Vite+ owns JavaScript package builds

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** Authored JavaScript and TypeScript library builds must use `vp pack`, and the repository must not add a direct tsdown dependency or a separate tsdown configuration.

**Limits:** This applies when a package has authored JavaScript or TypeScript source to package. It does not require repacking napi-rs-generated loader output that is already distributable. Package-specific `pack` options remain open and belong in Vite+ configuration when needed.

**Why:** `vp pack` already provides the tsdown-based library build as part of Vite+, so depending on or invoking tsdown directly would duplicate the chosen toolchain boundary.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly selected `vp pack` over a direct tsdown dependency. Vite+ documents this relationship in its [Pack guide](https://viteplus.dev/guide/pack).

### Explicit uncached repository task graph

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** Repository command orchestration must be defined as an explicit Vite+ task graph in the root vite.config.ts, following the dependency-oriented style used by vue-tui, and Vite+ task caching must be disabled with `run.cache: false`.

**Limits:** The reference establishes the orchestration style, not vue-tui's exact task names, concurrency heuristic, package filters, or test matrix. New tasks may be added within the explicit graph without reopening this ruling. Re-enabling caching requires a new explicit project decision.

**Why:** Yunfei selected vue-tui's command graph as the reference and explicitly required caching to remain disabled; no additional rationale was given.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly selected the [vue-tui Vite+ configuration](https://github.com/vuejs-ai/vue-tui/blob/main/vite.config.ts) as the orchestration reference and requested `run.cache: false`.

### Typed tools with scope-revealing ownership

[VOUCHED @hyfdev 2026-08-16]

**Ruling:** Maintained repository tools must be written in TypeScript and covered by repository type checking. Reusable tools belong at an appropriately shared `tools` scope; a tool coupled to one product or build belongs under `tools/<area>`, such as `tools/taffy-wasm`. Tool filenames must describe the transformation they actually perform rather than using a generic workflow-stage name.

**Limits:** This governs maintained code under `tools`; it does not require generated JavaScript, third-party output, or ephemeral local experiments to become TypeScript. Directory placement follows real ownership and reuse rather than anticipated reuse. A tool whose behavior expands must be split or renamed when its existing name no longer describes that behavior. Command ordering remains governed separately by the explicit Vite+ task-graph ruling.

**Why:** Yunfei required tool code to receive TypeScript validation and required generic and area-specific tools to be distinguishable from their location and behavior-based names. No additional rationale was given.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; explicitly required future tools to use TypeScript with type checking and asked to vouch the principle distilled from placing Taffy Wasm-specific behavior under `tools/taffy-wasm` with a behavior-describing filename.

### Code generation remains demand-driven

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** The repository API generator must retain one validated model and target-specific emitters, and it must not gain input fields, internal capabilities, or emitter behavior for a family or output that is not implemented in the same change.

**Limits:** This does not freeze file names or implementation details, prevent removal of demonstrated duplication, or prohibit a concrete new generated family. The generator may be extended when a current output needs a new fact and generation prevents actual drift between maintained outputs. Generated-file length and hypothetical reuse alone do not justify another abstraction or a rewrite.

**Why:** The current schema, input, compiler, and emitter stages respectively preserve editor guidance, generator-time structural validation, one-time reference and conflict resolution, and consistent Rust and TypeScript output. The reviewed shortcuts either made public shorthand acceptance implicit, weakened generation-time validation, or moved the same complexity into another dependency or framework. Repetitive generated code is cheaper to maintain than additional generator machinery.

**Source:** Yunfei (`@hyfdev`), 2026-08-15; asked whether the implemented generator was over-designed, accepted the reviewed conclusion that its present boundaries are justified, and explicitly asked to record and vouch the rule that future capabilities must follow concrete implemented demand. See [API code generation: Complexity boundary](api-codegen.md#complexity-boundary).
