# Tooling Decisions

This ledger records only tooling judgments that Yunfei explicitly expressed for this repository. Implementation, passing checks, resemblance to another repository, or silence do not constitute acceptance.

## Decided

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
