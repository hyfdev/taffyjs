# @taffyjs/yoga Implementation Loop Status

Updated: 2026-08-15

## State

Milestone 2 is complete, reviewed, and ready in its milestone commit. Milestone 3 is next.

## Done

- Recorded the vouched Yoga product decisions.
- Completed the Yoga 3.2.1 API and behavior reference.
- Drafted the repository implementation plan, milestone gates, PR protocol, Goal prompt, and unattended-run contract.
- Ran formatting, local-link checks, and an independent adversarial review of the plan and prompt.
- Resolved the review findings about the unattended-run contract, multi-entry shared output, untracked-output freshness, and failure ownership; the targeted follow-up found no remaining issue outside the freshness command, which was then corrected and verified against the repository's existing intent-to-add pattern.
- Committed and pushed the reviewed Milestone 0 baseline to the draft implementation PR.
- Recorded Yunfei's explicit whole-file vouch of `loop-goal.md` on 2026-08-15; the file is immutable for the implementation run.
- Added the Node-only ESM `@taffyjs/yoga` package, root and `/load` entries, every supported Yoga 3.2.1 enum and legacy constant, facade factories, private per-facade runtime ownership, and the fixed-leaf create-set-calculate-read path.
- Added the `tests/taffyjs-yoga/` consumer package with unchanged `yoga-layout` imports, a separately aliased Yoga 3.2.1 oracle, runtime and declaration coverage, facade isolation, lifetime, and hidden-state fixtures.
- Wired the package build, test, type-check, lockfile, complete `dist/` freshness check, and format-before-build aggregate-check ordering into the repository.
- Added retained Config state and lifetime behavior, Yoga and web defaults, live Config-sensitive flex defaults, experimental-feature and point-scale state, and runtime rejection for malformed or unsupported Config inputs.
- Added the complete normalized Yoga Style declaration model, all 26 classified Style getters and 43 setters, strict declared-input normalization, fresh Yoga-shaped Value records, Yoga's deliberate gap declaration/runtime mismatch, `copyStyle`, and type-level narrowing for invalid Align contexts.
- Added deterministic full-Style translation for dimensions, min/max constraints, box sizing, display, overflow, aspect ratio, direction, logical and shorthand edges, position, margin, padding, border, gaps, alignment, flex direction and wrapping, and Config-sensitive flex shorthand and longhands. Setters validate and build a candidate first, apply native Style second, and only then commit the public declaration state.
- Added differential Config and Style fixtures, invalid-input atomicity checks, retained-Config and facade-isolation checks, fixed-leaf translation cases, and a table-driven 345-case numeric boundary corpus against the pinned Yoga 3.2.1 oracle.

## Evidence and review

- `vp run check` passes after the aggregate task waits for formatting before starting the build-backed tests: 9 Rust tests, 45 native tests, 194 `@taffyjs/node` integration tests, 6 Yoga tests, both declaration checks, formatting, linting, and Clippy pass.
- Direct Node imports of `yoga-layout` and `yoga-layout/load` resolve the built workspace package; `pnpm pack --dry-run --json` includes both JavaScript entries, both entry declarations, and both emitted shared chunks; built JavaScript has no `yoga-layout` runtime import.
- A temporary untracked file under `packages/taffyjs-yoga/dist` is detected by the exact intent-to-add freshness pattern with `git diff` exit 1.
- The fresh adversarial reviewer found one material issue: Node and Config instances exposed writable runtime, tree, NodeId, and Config fields. The implementation moved all handle state into module-private WeakMap records and added a runtime fixture proving fake same-named properties cannot affect native operations. The same reviewer returned PASS on the targeted follow-up.
- The Milestone 2 full `vp run check` passes: 9 Rust tests, 45 native tests, 194 `@taffyjs/node` integration tests, 17 Yoga tests, both declaration checks, formatting, linting, and Clippy pass.
- The Milestone 2 adversarial reviewer found one numeric boundary error: finite JavaScript numbers such as `1e39` can overflow only after f32 conversion, and length-like or aspect-ratio declarations must then clear to Undefined while flex numbers retain Infinity. The normalization was corrected after independent reproduction, `±1e39`, `1e-50`, and `±1e39%` were added to the oracle fixture, and the same reviewer returned PASS on the targeted follow-up.
- A bounded calculation probe found that Yoga and Taffy differ when `Display.None` is applied to the selected calculation root with declared dimensions. Style storage and direct display translation remain complete in Milestone 2; the calculated-output trigger is retained for Milestone 4 classification and regression coverage rather than being hidden in the declaration layer.

## In flight

- None.

## Next

- Implement Milestone 3: topology and lifecycle operations, canonical identity, reset, callbacks, measurement markers, and Yoga-visible dirty and new-layout state.

## Blocked

- None.
