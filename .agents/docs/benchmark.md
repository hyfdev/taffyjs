# Benchmark Design

## Purpose and comparison boundary

The public benchmark measures TaffyJS as a JavaScript product in Node.js. Every timed operation starts at a public JavaScript API and includes the complete implementation cost beneath that call. JavaScript validation and conversion, wrapper and compatibility work, Node-API, emnapi, WASI, Wasm memory transfer, callbacks, output construction, redundant computation, and unnecessary data movement all remain part of the result. The benchmark must not bypass a public wrapper, call a private binding, substitute an internal Rust or C++ timer, preconvert data into a private representation, or subtract work in order to make implementations look more alike.

The benchmark has two comparison groups:

- The Taffy API group runs the same public benchmark source against `@taffyjs/node` and `@taffyjs/wasm`.
- The Yoga API group runs the same public Yoga-shaped benchmark source against `@taffyjs/yoga`, `yoga-layout@3.2.1`, and `@taffyjs/yoga-wasm`.

Only implementations completing a semantically equivalent user transaction receive a speed comparison. Validation happens outside the timed interval and must never normalize the measured path. An unsupported implementation is reported as unsupported rather than receiving a transformed workload. Different API groups do not produce a shared ranking, and the benchmark never combines unrelated scenarios into an overall score or winner.

All official results use one fixed Node.js environment. Browser benchmark execution, browser result switching, and comparisons between Node and browser environments are outside this design.

## Scenarios

Every benchmark case is a scenario with a named question, input and scale, public API operation sequence, timed boundary, required output reads, applicable comparison groups, and completion check. A captured application snapshot, a modeled user transaction, a wide tree, a deep tree, and the same structure at different node counts are equal kinds of scenario on the benchmark page. Each explains what it simulates and what operation is measured; the project does not introduce a separate primary, synthetic, or Diagnostics result hierarchy.

Scenario timing follows the transaction being investigated. An initial-layout scenario may create the public tree, compute layout, and read the outputs the consumer needs. A persistent-tree scenario may mutate an existing tree, recompute it, and read the affected outputs without rebuilding the tree. A batch scenario may create, compute, read or serialize, and finish one complete item. Fixture parsing, result validation, and harness bookkeeping stay outside the timed interval unless they are themselves the public operation named by the scenario. A total is measured directly rather than reconstructed by adding separately aggregated phase results.

The current suite covers a modeled coding-agent chat transaction plus one representative 1,000-leaf wide tree and 511-node deep tree for each public API group. Captured application trees may join later as ordinary scenarios when every target can execute the same supported public transaction. The suite must be fixed before the official run whose result will be published; scenarios must not be selected or modified in response to which implementation wins.

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

The benchmark page presents every scenario at the same level. Each applicable scenario shows either a Taffy API comparison or a Yoga API comparison without ranking unlike APIs together. It does not display browser results, a Diagnostics section, an overall score, an original-data download interface, or an empty column for a package that does not exist. Target columns come from each comparison group's target list.

The page footer shows only the concise environment and source identity needed by a reader, including the Node.js version, operating system and benchmark machine, and TaffyJS commit.

## Delivery sequence

First select and document the initial scenarios and their exact transactions. Then implement the top-level benchmark workspace and the two comparison groups, prove completion and semantic equivalence outside timing, run the complete suite on the fixed Node.js benchmark host, update the retained dataset, and let the website render it. Before publication, review the result for comparison validity, measurement stability, and avoidable harness complexity.

The current delivery implements the Taffy API comparison between `@taffyjs/node` and `@taffyjs/wasm` plus the Yoga API comparison between `@taffyjs/yoga`, Yoga 3.2.1, and `@taffyjs/yoga-wasm`. Captured Yoga application trees remain optional follow-up scenarios rather than a prerequisite for comparing the shipped public packages.
