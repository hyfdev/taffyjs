# Benchmarks

This workspace measures complete public JavaScript layout transactions in Node.js. Every scenario has an explicit TaffyTree implementation and an explicit Yoga Node implementation for the same semantic workload. It runs them through `@taffyjs/node`, `@taffyjs/wasm`, `@taffyjs/yoga`, `@taffyjs/yoga-wasm`, and `yoga-layout` without bypassing a public wrapper or removing API conversion, callback, output-read, or lifecycle costs.

Run `vp run benchmark` from the repository root for a local measurement. It writes the result to the ignored `benchmarks/results/local/latest.json`; `vp run benchmark --scenario=<id>` selects one or more exact scenario IDs for local research without adding more public tasks. Run `vp run benchmark:update-website` only for a complete publication run; it rejects scenario filters and atomically replaces `benchmarks/results/published.json` after every scenario and target succeeds.

Local runs use one quick isolated worker round per target and scenario. A website update uses one isolated round with longer warmup and sampling settings. Every publication result must stay at or below 30% relative margin of error; an unstable suite fails without replacing the retained result. The retained result includes every Tinybench sample from that round.

Each worker imports exactly one target before timing, completes the configured warmup, requests garbage collection, and then measures one scenario. Package initialization, fixture validation, and harness bookkeeping are excluded. Garbage collection during the named end-to-end transaction remains part of the result.

`run.ts` coordinates workers serially so targets do not compete for CPU or share heaps. Before accepting timings, it compares left, top, width, and height for every semantic node across all five implementations. The 0.001 px tolerance permits floating-point representation noise without hiding observable layout differences.

The suite contains two scales of the same nested UI family, one broad wrapping collection, initial-layout and persistent-resize transactions for a measured coding-agent chat model, and one styled-node-construction transaction that reports what creating many nodes from one reused Style costs. Each scenario directory owns its workload and documents its exact timed boundary. The result is scenario-first: `yoga-layout` is the explicit `1.00×` reference within each table, and unrelated scenarios are never combined into an overall score.
