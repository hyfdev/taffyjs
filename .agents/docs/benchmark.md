# Benchmark Design

## Purpose and comparison boundary

[VOUCHED @hyfdev 2026-08-17]

In one fixed Node.js environment, the public benchmark measures the real cost for a user to complete the same semantically equivalent layout transaction through the JavaScript APIs of the packages that are actually published. Its purpose is to explain the performance tradeoffs among packages, public API abstractions, and runtimes, and to provide a stable baseline for future optimization and regression detection.

Proving that `@taffyjs/node` is necessarily the fastest is not a benchmark objective and must not influence scenario selection. Any native performance advantage is a measured result rather than an assumption built into the workloads.

The public benchmark measures TaffyJS as a JavaScript product. Every timed operation starts at a public JavaScript API and includes the complete implementation cost beneath that call. JavaScript validation and conversion, wrapper and compatibility work, Node-API, emnapi, WASI, Wasm memory transfer, callbacks, output construction, redundant computation, and unnecessary data movement all remain part of the result. The benchmark must not bypass a public wrapper, call a private binding, substitute an internal Rust or C++ timer, preconvert data into a private representation, or subtract work in order to make implementations look more alike.

The public page and retained result are scenario-first. One semantic user scenario appears once rather than being duplicated under Taffy API and Yoga API headings. A scenario may provide separate explicit TaffyTree and Yoga Node transaction builders because their public calls differ, but both builders must complete the same named user transaction and produce equivalent required output. The benchmark does not introduce a universal adapter that hides either public API.

Every applicable implementation appears as a row of that scenario's comparison table. A common scenario therefore supports both product-level comparison across public abstractions and same-Yoga-API comparison without publishing the scenario or `yoga-layout` measurement twice.

Only implementations completing a semantically equivalent user transaction receive a speed comparison. Validation happens outside the timed interval and must never normalize the measured path. Different APIs may be ranked inside one named scenario when their required observable result is equivalent; the result is an end-to-end product comparison and must not be attributed to one internal layer alone. An unsupported implementation is omitted from that scenario rather than receiving a transformed workload. A shared scenario uses `yoga-layout` as the explicit `1.00x` relative-throughput reference while retaining absolute throughput and latency; a scenario without Yoga uses its stated applicable baseline. The benchmark never combines unrelated scenarios into an overall score or winner.

All official results use one fixed Node.js environment. Browser benchmark execution, browser result switching, and comparisons between Node and browser environments are outside this design.

## Scenarios

Every benchmark case is a scenario with a named question, input and scale, public API operation sequence, timed boundary, required output reads, applicable implementations, and completion check. A captured application snapshot, a modeled user transaction, a wide tree, a deep tree, and the same structure at different node counts are equal kinds of scenario on the benchmark page. Each explains what it simulates and what operation is measured; the project does not introduce a separate primary, synthetic, or Diagnostics result hierarchy.

Scenario timing follows the transaction being investigated. An initial-layout scenario may create the public tree, compute layout, and read the outputs the consumer needs. A persistent-tree scenario may mutate an existing tree, recompute it, and read the affected outputs without rebuilding the tree. A batch scenario may create, compute, read or serialize, and finish one complete item. Fixture parsing, result validation, and harness bookkeeping stay outside the timed interval unless they are themselves the public operation named by the scenario. A total is measured directly rather than reconstructed by adding separately aggregated phase results.

The public suite is indexed by transaction rather than by tree shape. Five transactions carry it, each varied along a single axis, for twelve published rows; a sixth adds the thirteenth:

1. **Incremental frame**, at one dirty text node, a tenth of them, and all of them. A screen that stays in memory between frames: mark the changed nodes dirty, compute, and read every box. Dirty-set size is the axis because relayout cost tracks it, not node count.
2. **One-shot render**, at a small, medium, and large screen. Build every node from nothing, compute once, read the complete box model, and release the tree. This is the shape a document or image renderer repeats per page.
3. **Measured render**, on the medium screen. The one-shot render's tree with its text sized through the public Measure callback instead of fixed sizes. Node count and structure are identical, but measured text wraps, so it carries both the callback crossings and the layout work wrapping creates.
4. **Nesting depth**, at two, six, and ten wrapper levels. One node budget rearranged: content wrapped in a chain of column containers whose width comes from the parent rather than an explicit value. The node budget is held within a few nodes across the three depths so depth is the variable.
5. **Dashboard**, as a Grid and as the nested flex that reaches the same picture. The Grid form needs no row containers, so its node count is lower and that difference is part of the answer. Yoga has no Grid, so the Grid row runs only the packages that do.

A sixth transaction, **cold start to first layout**, is measured as one whole process per sample rather than a sampled loop, because module load and runtime instantiation are its subject.

A scenario names its own applicable implementations and its own `1.00x` reference. A workload every package can express uses `yoga-layout`; a workload built on a capability Yoga does not have uses `@taffyjs/node`, and the packages that cannot express it are shown as inapplicable rather than as a number. Demand decides whether a Taffy-only capability enters the suite; whether Yoga can express it does not.

Every fixture is one API-neutral description of a tree that each public API builds natively, so both sides always lay out the same tree and neither builder can be quietly cleverer than the other. Fixture depth, single-child wrapper chains, and text density follow the production trees Yoga publishes under [`benchmark/captures`](https://github.com/facebook/yoga/tree/main/benchmark/captures) rather than a balanced binary tree: those four trees hold 101 to 1,516 nodes, place their leaves seven to twenty-nine levels below the root, and measure nine to twenty percent of their nodes. Both engines run at their default rounding, which is the configuration their consumers ship.

Publication does not compare geometry across engines. A scenario asks for its own requirement to be completed, and two engines legitimately reach different pixels; forcing them to agree would constrain every fixture to a lowest common denominator. Each result is instead checked for a finite, non-empty layout, the node count the scenario declares, and the same checksum across two runs of that implementation. The four TaffyJS packages are two builders and two runtimes over one engine, so a scenario must reach the same geometry through all of them. Every published result carries how many times the package called the Measure callback and how many output values it read, so a difference in time can be attributed to a difference in work rather than argued about.

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

Both commands use the same TypeScript coordinator and benchmark implementations. Package metadata does not duplicate their orchestration as compound scripts. Timing runs serially because concurrent benchmark processes would interfere with one another. Official measurements use repeated independent samples and recorded repository, host, and Node.js revisions. A publication may run on a different machine than the one before it, so every dataset carries its own environment. A publication runs two rounds with the target order reversed between them, reports the median, and is rejected when any round exceeds ten percent relative margin of error or when the round medians differ by more than a quarter.

## Results and website

Local measurements belong under ignored `benchmarks/results/local/`. The website reads the tracked `benchmarks/results/published.json` directly at build time; it does not run benchmarks, copy a second canonical result into `apps/website`, or combine an old measurement with the current scenario source.

The published dataset is a self-contained snapshot of the facts needed to interpret its numbers, including the scenario name and parameters, measured transaction, targets, results, environment, and TaffyJS revision. Numbers are comparable inside one dataset, where every target ran on one machine; absolute numbers from datasets with different environments are not comparable with each other. It retains enough sample evidence to support the displayed comparison. Its concrete schema and file encoding remain implementation details. The dataset is committed because it is evidence for a public performance claim, not a distributable build artifact.

The benchmark page presents every scenario once and at the same level. It opens with one overview table whose rows are the scenarios and whose columns are the packages; every cell carries the relative time against that scenario's own reference with the median time under it, and a dash where the package cannot express the workload. Each scenario then owns a table with the columns `vs <its reference>`, `Median`, `p99`, `Measure calls`, `Values read`, `± RME`, and `Samples`, ranked fastest first. Relative time is signed against the reference: `+2.0x` is twice as fast and `-2.0x` takes twice as long. Each scenario table is introduced by the scenario name, its scale, and the one-sentence `description` the suite already stores, so the page never keeps a second copy of that text. The page renders without the right-hand outline because the overview table needs the full content column. A common layout scenario includes both TaffyTree and Yoga Node implementations when the required output is equivalent; a Taffy-specific Grid or Block scenario may contain only the applicable TaffyJS rows and uses an explicitly stated applicable baseline instead. The page does not display browser results, a Diagnostics section, an overall score, an original-data download interface, or empty rows for unsupported implementations.

The page footer shows only the concise environment and source identity needed by a reader, including the Node.js version, operating system and benchmark machine, and TaffyJS commit.

## Delivery sequence

First select and document the initial scenarios and their exact transactions. Then implement the top-level benchmark workspace and each scenario's applicable implementations, prove completion and semantic equivalence outside timing, run the complete suite on the fixed Node.js benchmark host, update the retained dataset, and let the website render it. Before publication, review the result for comparison validity, measurement stability, and avoidable harness complexity.

Captured or capture-derived application trees remain subject to the same supported-input and semantic-equivalence requirements as every other scenario.
