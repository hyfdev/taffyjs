# Benchmarks

This workspace measures complete public JavaScript layout transactions in Node.js. It is indexed by transaction rather than by tree shape: an incremental frame on a tree that stays in memory, a one-shot render built and released per iteration, the same render with its text measured through the public callback, nesting depth at a fixed node budget, a dashboard written as a Grid and as the nested flex that reaches the same picture, and a fresh process to its first layout.

Each fixture is one API-neutral tree description in `fixtures/`, built natively by each public API, so both sides lay out the same tree and neither builder can be quietly cleverer than the other. Every scenario names the implementations that can express it and its own `1.00x` reference: a workload every package can express uses `yoga-layout`, and a workload built on a capability Yoga does not have uses `@taffyjs/node`. Both engines run at their default rounding.

Run `vp run benchmark` from the repository root for a local measurement. It writes the result to the ignored `benchmarks/results/local/latest.json`; `vp run benchmark --scenario=<id>` selects one or more exact scenario IDs for local research without adding more public tasks. Run `vp run benchmark:update-website` only for a complete publication run; it rejects scenario filters and atomically replaces `benchmarks/results/published.json` after every scenario and target succeeds.

A publication runs two rounds per target with the target order reversed between them. It is rejected when any round exceeds 10% relative margin of error or when the round medians differ by more than a quarter of their median. The retained result keeps each round's summary; the raw per-sample series stays in local runs.

Each worker imports exactly one target before timing, completes the configured warmup, requests garbage collection, and then measures one scenario. The cold-start scenario is the exception: it is one whole process per sample, because module load and runtime instantiation are its subject. Package initialization, fixture validation, and harness bookkeeping are excluded. Garbage collection during the named end-to-end transaction remains part of the result.

`run.ts` coordinates workers serially so targets do not compete for CPU or share heaps. It does not require the two engines to agree on geometry: a scenario asks for its own requirement to be completed, and Taffy and Yoga legitimately reach different pixels. Each result is checked for a finite, non-empty layout, the node count the scenario declares, and the same checksum across two runs. The four TaffyJS packages are two builders and two runtimes over one engine, so they must agree with each other exactly.

Every published result carries how many times the package called the measure callback and how many output values it read, so a difference in time can be attributed to a difference in work.
