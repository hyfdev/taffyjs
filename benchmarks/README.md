# Benchmarks

This workspace measures complete public JavaScript transactions in Node.js. The Taffy API scenarios run unchanged against `@taffyjs/node` and `@taffyjs/wasm`. The Yoga API scenarios likewise run unchanged against `@taffyjs/yoga`, `yoga-layout@3.2.1`, and `@taffyjs/yoga-wasm`. Neither group bypasses a public wrapper or removes conversion and output costs.

Run `vp run benchmark` from the repository root for a local measurement. It writes the result to the ignored `benchmarks/results/local/latest.json`; `vp run benchmark --scenario=<id>` selects one or more exact scenario IDs for local research without adding more public tasks. Run `vp run benchmark:update-website` only for a complete publication run; it rejects scenario filters and atomically replaces `benchmarks/results/published.json` after every scenario and target succeeds.

Local runs use one quick isolated worker round per target and scenario. A website update also uses one isolated round per target and scenario with longer warmup and sampling settings. Every publication result must stay at or below 30% relative margin of error; an unstable suite fails without replacing the retained result. The retained result includes every Tinybench sample from that round.

Each worker completes the configured warmup and requests garbage collection before timed sampling starts, giving each measurement the same initial heap condition. Garbage collection that occurs during the timed end-to-end transactions remains part of the measured cost.

Each scenario directory owns its workload and states the user transaction it measures. `run.ts` coordinates serial, isolated worker processes, validates equivalent output within each API group, captures the environment, and persists the complete result. Each worker imports exactly one target before timing and uses Tinybench for one scenario, so package initialization is excluded without letting target heaps or garbage collection contaminate one another. Yoga scenarios include public Node creation, style setters, topology construction, layout calculation, computed-layout reads, and explicit release.

The wide and deep categories follow the questions asked by [Taffy's upstream large-tree benchmarks](https://github.com/DioxusLabs/taffy/blob/3ce6bef173028b1cb33d782de8c262e6dd8edd39/benches/benches/flexbox.rs), but their boundary is intentionally different: Taffy upstream measures layout computation with a prepared tree, while this workspace measures public JavaScript tree construction, layout, and result reads as one transaction. The coding-agent chat case is explicitly a maintained model, not a captured production application.

The current suite keeps one representative scale for each wide-tree and deep-tree question. The retained 1,000-leaf wide tree and 511-node deep tree already distinguish the target behavior, so larger versions of the same structures would add measurement cost without answering another question.

## Delivery status

- The current phase implements and validates both comparison groups: native Node versus WASI Wasm through the Taffy API, and Taffy Yoga versus Yoga 3.2.1 versus Taffy Yoga Wasm through the Yoga API.
- Before publishing the benchmark page, choose the official machine and Node.js version, review the sampling settings against repeated runs, generate the complete retained result, and render that self-contained result in the website.
- Captured application trees may be added later as ordinary scenarios when they can run the same supported public transaction across every target; they are not a prerequisite for the current comparison.
