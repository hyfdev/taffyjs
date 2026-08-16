# Benchmarks

This workspace measures complete public JavaScript transactions in Node.js. The current comparison uses the same Taffy API scenarios for `@taffyjs/node` and `@taffyjs/wasm`; it does not bypass either package's public wrapper or remove conversion and output costs.

Run `vp run benchmark` from the repository root for a local measurement. It writes the result to the ignored `benchmarks/results/local/latest.json`; `vp run benchmark --scenario=<id>` selects one or more exact scenario IDs for local research without adding more public tasks. Run `vp run benchmark:update-website` only for a complete publication run; it rejects scenario filters and atomically replaces `benchmarks/results/published.json` after every scenario and target succeeds.

Local runs use one quick isolated worker round per target and scenario. A website update requires a clean worktree and uses four independent rounds, alternating target order so each target runs first twice. Every round must stay at or below 30% relative margin of error, and the range of its four median latencies must stay within 10% of their median; an unstable suite fails without replacing the retained result. The stored target value is the median of the four independent round summaries, and every round retains its Tinybench samples.

Each worker completes the configured warmup and requests garbage collection before timed sampling starts, giving independent rounds the same initial heap condition. Garbage collection that occurs during the timed end-to-end transactions remains part of the measured cost.

Each scenario directory owns its workload and states the user transaction it measures. `run.ts` coordinates serial, isolated worker processes, validates equivalent output, captures the environment, and persists the complete result. Each worker imports exactly one target before timing and uses Tinybench for one scenario, so package initialization is excluded without letting target heaps or garbage collection contaminate one another. Yoga-shaped scenarios and targets will be added after their package work merges rather than appearing as placeholders now.

The wide and deep categories follow the questions asked by [Taffy's upstream large-tree benchmarks](https://github.com/DioxusLabs/taffy/blob/3ce6bef173028b1cb33d782de8c262e6dd8edd39/benches/benches/flexbox.rs), but their boundary is intentionally different: Taffy upstream measures layout computation with a prepared tree, while this workspace measures public JavaScript tree construction, layout, and result reads as one transaction. The coding-agent chat case is explicitly a maintained model, not a captured production application.

The current suite keeps one representative scale for each wide-tree and deep-tree question. The retained 1,000-leaf wide tree and 500-node deep tree already distinguish the target behavior, so larger versions of the same structures would add measurement cost without answering another question.

## Delivery status

- The current phase implements and validates the Taffy API comparison for native Node and WASI Wasm.
- Before publishing the benchmark page, choose the official machine and Node.js version, review the sampling settings against repeated runs, generate the complete retained result, and render that self-contained result in the website.
- After the Yoga package work merges, add the Yoga API comparison and captured application trees through its own public transactions. Add a Yoga Wasm target only when that package exists.
