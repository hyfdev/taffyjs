# Benchmark Design

## Purpose and comparison boundary

[VOUCHED @hyfdev 2026-08-17]

In one fixed Node.js environment, the public benchmark measures the real cost for a user to complete the same semantically equivalent layout transaction through the JavaScript APIs of the packages that are actually published. Its purpose is to explain the performance tradeoffs among packages, public API abstractions, and runtimes, and to provide a stable baseline for future optimization and regression detection.

Proving that `@taffyjs/node` is necessarily the fastest is not a benchmark objective and must not influence scenario selection. Any native performance advantage is a measured result rather than an assumption built into the workloads.

The public benchmark measures TaffyJS as a JavaScript product. Every timed operation starts at a public JavaScript API and includes the complete implementation cost beneath that call. JavaScript validation and conversion, wrapper and compatibility work, Node-API, emnapi, WASI, Wasm memory transfer, callbacks, output construction, redundant computation, and unnecessary data movement all remain part of the result. The benchmark must not bypass a public wrapper, call a private binding, substitute an internal Rust or C++ timer, preconvert data into a private representation, or subtract work in order to make implementations look more alike.

[VOUCHED @hyfdev 2026-08-17]

The public page and retained result are scenario-first. One semantic user scenario appears once rather than being duplicated under Taffy API and Yoga API headings. A scenario may provide separate explicit TaffyTree and Yoga Node transaction builders because their public calls differ, but both builders must complete the same named user transaction and produce equivalent required output. The benchmark does not introduce a universal adapter that hides either public API.

Every applicable implementation appears as a row of that scenario's comparison table. The row identifies package, public API, and runtime so readers can distinguish `@taffyjs/node` through TaffyTree on native Node-API, `@taffyjs/wasm` through TaffyTree on WASI Wasm, `@taffyjs/yoga` through Yoga Node on native Taffy, `@taffyjs/yoga-wasm` through Yoga Node on WASI Taffy, and `yoga-layout@3.2.1` through Yoga Node on Yoga's WebAssembly binding. A common scenario therefore supports both product-level comparison across public abstractions and same-Yoga-API comparison without publishing the scenario or `yoga-layout` measurement twice.

Only implementations completing a semantically equivalent user transaction receive a speed comparison. Validation happens outside the timed interval and must never normalize the measured path. Different APIs may be ranked inside one named scenario when their required observable result is equivalent; the result is an end-to-end product comparison and must not be attributed to one internal layer alone. An unsupported implementation is omitted from that scenario rather than receiving a transformed workload. A shared scenario uses `yoga-layout` as the explicit `1.00x` relative-throughput reference while retaining absolute throughput and latency; a scenario without Yoga uses its stated applicable baseline. The benchmark never combines unrelated scenarios into an overall score or winner.

All official results use one fixed Node.js environment. Browser benchmark execution, browser result switching, and comparisons between Node and browser environments are outside this design.

## Scenarios

Every benchmark case is a scenario with a named question, input and scale, public API operation sequence, timed boundary, required output reads, applicable implementations, and completion check. A captured application snapshot, a modeled user transaction, a wide tree, a deep tree, and the same structure at different node counts are equal kinds of scenario on the benchmark page. Each explains what it simulates and what operation is measured; the project does not introduce a separate primary, synthetic, or Diagnostics result hierarchy.

Scenario timing follows the transaction being investigated. An initial-layout scenario may create the public tree, compute layout, and read the outputs the consumer needs. A persistent-tree scenario may mutate an existing tree, recompute it, and read the affected outputs without rebuilding the tree. A batch scenario may create, compute, read or serialize, and finish one complete item. Fixture parsing, result validation, and harness bookkeeping stay outside the timed interval unless they are themselves the public operation named by the scenario. A total is measured directly rather than reconstructed by adding separately aggregated phase results.

The public suite contains six scenarios:

1. **Small nested UI: 50 nodes.** Create the deterministic nested public tree, compute its initial layout, read every required layout result, and complete the package's applicable public lifecycle. This exposes fixed package and API costs for a small layout transaction.
2. **Nested UI: 500 nodes.** Run the same transaction and deterministic structure family at ten times the node count. This exposes how the package and runtime tradeoff changes with scale.
3. **Wide wrapping collection: 500 items.** Create one wrapping container with 500 direct items, compute its initial layout, read every required result, and complete the applicable lifecycle. The root makes 501 total nodes; the public parameter remains the user-facing item count. This distinguishes a wide, batched topology from the similarly sized nested transaction.
4. **Coding-agent chat: initial layout.** Create the modeled application tree and JavaScript measurement contexts, compute through the public Measure callback, read every required result, and complete the applicable lifecycle. This exposes synchronous JavaScript callback crossings in a complete application transaction.
5. **Coding-agent chat: viewport resize.** Prepare and initially lay out the persistent public tree outside timing. Each timed transaction changes the root between two fixed viewport sizes through the public API, recomputes layout, and reads every required result. Persistent-tree disposal happens after measurement rather than inside each resize transaction.
6. **Styled node construction: 500 leaves.** Create the root and 500 leaves from one shared fifteen-field Style value, attach every leaf, compute layout, and read every required result. Tree shape and layout work stay small so the transaction reports what public Style input conversion and node creation cost.

Every scenario runs all five applicable implementations: `@taffyjs/node`, `@taffyjs/wasm`, `@taffyjs/yoga`, `@taffyjs/yoga-wasm`, and `yoga-layout`. The two API-specific implementations of a scenario must use equivalent styles, measurement behavior, viewport state, and required output while retaining the real call structure of each public API.

The round parameters `50` and `500` are intentional public workload descriptions rather than powers of two inherited from an upstream stress benchmark. The suite does not include captured Yoga applications, Grid, Block, super-deep trees, additional scale points, cold start, or browser measurements. A scenario or scale may be added only when it answers a concrete product question the existing scenarios do not answer; it must never be selected or modified in response to which implementation wins.

## Repository ownership

Benchmark source and retained results belong in the top-level `benchmarks/` workspace rather than under `tests/`, `tools/`, or `apps/website`. Each benchmark case that cannot be combined with another owns a direct child directory. The benchmark workspace owns one private package, one Vite+ configuration, and one explicit TypeScript coordinator; individual scenarios do not receive package manifests or Vite configurations without a concrete execution requirement.

The intended shape is:

```text
benchmarks/
  package.json
  vite.config.ts
  run.ts             # serial coordinator and result writer
  worker.ts          # one isolated target and scenario measurement
  suite.ts           # explicit settings, scenario registry, and target list
  scenario.ts        # shared scenario and result contract
  <scenario>/
    benchmark.ts
    fixtures.ts       # only when the scenario needs maintained fixture data
  results/
    local/            # ignored local runs
    published.json    # retained public result
```

Maintained benchmark code follows the repository-wide TypeScript default. Shared code is introduced only for behavior that scenarios genuinely share; the benchmark must not grow a plugin system or a universal adapter that changes workloads merely to force unlike APIs into one implementation.

## Commands and execution

The root Vite+ task graph exposes two public commands:

- `vp run benchmark` runs local research benchmarks, may accept target or scenario filters, writes only ignored local output, and never changes tracked website data.
- `vp run benchmark:update-website` builds and measures the complete official suite, validates every result, and replaces the retained website dataset only after the complete run succeeds. It does not deploy the website and does not accept a partial suite as a public update.

Both commands use the same TypeScript coordinator and benchmark implementations. Package metadata does not duplicate their orchestration as compound scripts. Timing runs serially because concurrent benchmark processes would interfere with one another. Official measurements use actual release artifacts, a fixed benchmark machine and Node.js version, repeated independent samples, and recorded repository and package revisions. The exact sampling and summary statistic remain open until the runner design is selected.

## Results and website

Local measurements belong under ignored `benchmarks/results/local/`. The website reads the tracked `benchmarks/results/published.json` directly at build time; it does not run benchmarks, copy a second canonical result into `apps/website`, or combine an old measurement with the current scenario source.

The published dataset is a self-contained snapshot of the facts needed to interpret its numbers, including the scenario name and parameters, measured transaction, targets, results, environment, and TaffyJS revision. It retains enough sample evidence to support the displayed comparison. Its concrete schema and file encoding remain implementation details. The dataset is committed because it is evidence for a public performance claim, not a distributable build artifact.

The benchmark page presents every scenario once and at the same level. Its result table contains the applicable implementation rows and the columns `Package`, `API`, `Runtime`, `ops/s`, `Median`, and `vs yoga-layout` when Yoga is applicable. A common layout scenario includes both TaffyTree and Yoga Node implementations when the required output is equivalent; a Taffy-specific Grid or Block scenario may contain only the applicable TaffyJS rows and uses an explicitly stated applicable baseline instead. The page does not display browser results, a Diagnostics section, an overall score, an original-data download interface, or empty rows for unsupported implementations.

The page footer shows only the concise environment and source identity needed by a reader, including the Node.js version, operating system and benchmark machine, and TaffyJS commit.

## Delivery sequence

First select and document the initial scenarios and their exact transactions. Then implement the top-level benchmark workspace and each scenario's applicable implementations, prove completion and semantic equivalence outside timing, run the complete suite on the fixed Node.js benchmark host, update the retained dataset, and let the website render it. Before publication, review the result for comparison validity, measurement stability, and avoidable harness complexity.

Captured or capture-derived application trees remain subject to the same supported-input and semantic-equivalence requirements as every other scenario.
