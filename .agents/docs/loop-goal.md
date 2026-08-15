# @taffyjs/yoga Implementation Loop Goal

## Goal

Implement the initial Node-only, ESM-only `@taffyjs/yoga` package over `@taffyjs/node`, targeting exactly `yoga-layout@3.2.1`, and deliver the complete reviewed implementation through one observable draft pull request.

## Authoritative direction

The run must follow `.agents/docs/taffyjs-yoga-decisions.md`, `.agents/docs/taffyjs-yoga-reference.md`, and `.agents/docs/taffyjs-yoga-implementation-plan.md`. Vouched decisions outrank derived reference and planning text. The run may resolve implementation details with evidence but may not reinterpret or silently expand the vouched product boundary.

## Boundaries

- Implement only in TypeScript over the existing `@taffyjs/node` API. Do not change Taffy core, Rust binding behavior, or public or private `@taffyjs/node` APIs for Yoga.
- Do not implement Flex, Yoga cache behavior, sibling distribution, or parent-dependent layout correction in JavaScript. Use documented Different or Unsupported classifications when bounded TypeScript cannot align behavior credibly.
- Do not add browser or WASM support, a Yoga-specific generator, selective query, batch reads, compact transport, publication, or release automation.
- Keep tests under `tests/taffyjs-yoga/` without a redundant nested `tests/` or unexplained `e2e/` directory. Use official `yoga-layout@3.2.1` only as a separately aliased test oracle.
- Preserve unrelated work. Do not post GitHub comments on Yunfei's behalf, mark the PR ready, merge, publish, or make a new product decision without Yunfei.

## Execution contract

Complete Milestones 1 through 6 from `.agents/docs/taffyjs-yoga-implementation-plan.md` in order. Each milestone must pass its relevant checks and one fresh bounded adversarial review with no unresolved material finding, then land as one coherent commit pushed immediately to the same draft PR. When a material review finding changes the result, use the same reviewer for one targeted follow-up and then stop that review loop.

Continue autonomously between milestones. Stop only for a genuine conflict with vouched direction, a product choice not settled by the records, a required expansion of authority, or an external blocker that focused evidence cannot resolve. Keep `.agents/docs/loop-status.md` current with completed work, evidence and review results, in-flight work, next work, blockers, and conflicts. Never edit this vouched file during the run.

## Finish criteria

- All six implementation milestones and their adversarial reviews are complete and pushed to the same draft PR.
- Both supported package entries and unchanged-import workspace alias work on the supported Node runtime, committed package output includes all entry files, declarations, and shared chunks, and freshness detects untracked new output as well as changed or deleted output.
- Every evaluated Yoga 3.2.1 capability is classified and represented in types, runtime, documentation, and durable evidence according to its Compatible, Different, or Unsupported status.
- No Yoga-specific core, Rust, `@taffyjs/node`, Flex, WASM, browser, generator, query, batch, compact-transport, publication, or release-automation scope was added.
- `vp run ready` and `vp run check:codegen` pass on the current supported host, and the final `loop-status.md` contains the human handover.
- The pull request remains draft and unmerged for Yunfei's decision.
