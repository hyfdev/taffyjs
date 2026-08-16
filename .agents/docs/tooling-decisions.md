# Tooling Decisions

This ledger records only tooling judgments that Yunfei explicitly expressed for this repository. Implementation, passing checks, resemblance to another repository, or silence do not constitute acceptance.

## Decided

### Main branch commit and merge convention

[VOUCHED @hyfdev 2026-08-17]

**Ruling:** Every commit retained on `main` must follow Conventional Commits 1.0.0, and pull requests targeting `main` must use squash merge.

**Limits:** This governs commits retained on `main` and normal pull request integration. Topic-branch commits need not individually follow the convention because they are squashed. It does not choose release automation, require a scope, or govern pull requests targeting another branch. Direct pushes do not use pull request integration, but any resulting commit retained on `main` remains subject to the commit convention.

**Why:** Yunfei selected these conventions while requesting a one-time cleanup of the repository's pre-release `main` history; no additional rationale was given.

**Source:** Yunfei (`@hyfdev`), 2026-08-16 and 2026-08-17; explicitly required Conventional Commits, strengthened squash merge from the default to the only permitted pull request integration method for `main`, and asked to vouch the decision.

### Third-party license filename

[VOUCHED @hyfdev 2026-08-16]

**Ruling:** A package or distributable artifact that ships third-party license text must collect it in a root-level file named exactly `THIRD-PARTY-LICENSES`, without a filename extension. Do not use `THIRD_PARTY_NOTICES.md` or another naming variant.

**Limits:** This establishes the repository filename and consolidation convention. It does not decide whether a particular dependency or derived implementation requires attribution, alter the required license text, or replace package-specific verification that the file is included in the published artifact.

**Why:** Yunfei selected one explicit filename for this repository's third-party license bundles; no additional rationale was given.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; explicitly required `THIRD-PARTY-LICENSES` instead of `THIRD_PARTY_NOTICES.md`, extended the convention to future analogous cases, and asked to vouch it.

### @taffyjs scope boundary

**Ruling:** A package name may use the `@taffyjs` npm scope only when that package is intended to be published separately under the organization, with one explicit build-only exception: the napi-rs generated Wasm target used to assemble inline `@taffyjs/wasm` output also retains the scope. Other repository-only workspaces and generated or staged packages must use unscoped names.

**Limits:** Separately published implementation artifacts qualify even when consumers should not import them directly. The native platform packages used as `@taffyjs/node` optional dependencies therefore remain scoped because they must be published with the public package. The Wasm exception applies only to its generated staging identity: the scoped package fallback appears in napi-rs template source but is removed when the binary is inlined, so the final package must retain neither `require.resolve` nor a binding package dependency. A temporary `private` field or missing publication automation during repository bootstrap does not by itself override the intended distribution boundary.

**Why:** Yunfei reserved the organization scope for packages that will actually be published, then explicitly kept the inline Wasm staging target scoped as a special case; no additional rationale was given.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; asked to generalize the test-package correction so every package that is not truly published avoids the `@taffyjs` scope, then corrected the Wasm staging target as an explicit scoped exception because the public Wasm package is inline.

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

### Node builtin module protocol

[VOUCHED @hyfdev 2026-08-16]

**Ruling:** Every reference to a Node.js builtin module in repository code must use the explicit `node:` protocol by default, including imports, exports, dynamic imports, and `require` calls in authored source and generated or distributed JavaScript controlled by the repository build.

**Limits:** This does not modify third-party packages or their source templates in place. When an upstream generator emits bare builtin specifiers for an older Node.js compatibility floor that TaffyJS does not support, the repository must normalize its generated artifact at the owned build boundary. Only a concrete supported-runtime requirement that cannot resolve `node:` may reopen this default.

**Why:** A Deno compatibility check exposed the generated public entry's bare `from "module"` specifier, after which Yunfei required every Node builtin module reference to default to the `node:` protocol; no additional rationale was given.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; explicitly required repository code to default every Node builtin module reference to the `node:` protocol, asked to vouch the rule, and requested the implementation and pull request.

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

### Benchmark ownership and command surface

[VOUCHED @hyfdev 2026-08-16]

**Ruling:** Maintained benchmark cases and results must belong to the top-level `benchmarks/` workspace, and the root Vite+ task graph must expose `vp run benchmark` for non-mutating local runs and `vp run benchmark:update-website` for a complete run that updates the retained website data.

**Limits:** This ruling fixes ownership and the two public commands, not the internal coordinator API, exact scenario set, sampling library, result schema, fixed benchmark machine, or Node.js version. Internal selection remains an argument to the local command rather than a larger public command family. Updating benchmark data does not deploy the website.

**Why:** Yunfei wanted benchmark examples to be first-class top-level cases rather than unrelated scripts, distinguished ordinary measurement from measurement that updates documentation data, and explicitly corrected the updating command to `benchmark:update-website`; no additional rationale was stated.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; accepted and vouched the complete benchmark design and explicitly named the two public commands. See [Benchmark Design](benchmark.md).

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
