# @taffyjs/yoga Implementation Loop Status

Updated: 2026-08-15

## State

Milestone 5 is complete, reviewed, and ready in its milestone commit. Milestone 6 is next.

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
- Added canonical Node identity backed by the facade's single native `TaffyTree`, native-authoritative child and parent reads, strict insertion and removal validation, arbitrary selected-subtree calculation, cross-facade rejection, one-parent and acyclic constraints, and measured-leaf topology restrictions without a JavaScript child tree.
- Added deterministic `free`, iterative `freeRecursive`, factory destruction, detached-leaf `reset`, retained Config ownership, single-node free with preserved detached child subtrees, and facade poisoning after an unexpected partial multi-step native failure.
- Added Yoga-visible dirty and new-layout state, layout-seen transitions, canonical dirtied-callback arguments, post-commit callback errors, measurement markers, manual dirty restrictions, supported containing-block state, and type/runtime rejection for unsupported reference-baseline selection.
- Added one pre-calculation subtree pass that resolves inherited direction and each Node's Config revision, prepares all translated Styles before native mutation, synchronizes every stale Style, and reuses the same selected-subtree snapshot for Yoga-visible state commits.
- Added durable topology, lifecycle, state, callback, fault-injection, independent-Config, and public-type fixtures while keeping Taffy as the sole topology and layout authority.
- Added arbitrary-node calculation with exact finite root constraints, selected-root Display.None handling, guaranteed ordinary-Style restoration, facade poisoning on an unexpected restoration failure, and atomic selected-subtree output commits.
- Added Yoga-shaped output projection for root and descendant positions, right and bottom semantics, effective direction, relative and absolute insets, absolute containing-direction translation, display-none suppression, computed physical and logical edges, auto-margin masking, and per-Node point-grid rounding across mixed Configs.
- Added bounded Yoga-compatible float32 percentage resolution, explicit Taffy-offset removal for relative projection, the documented 0.0001 compatibility boundary for equivalent unrounded percentage arithmetic, and durable exact and tolerance-bound oracle fixtures.
- Added differential fixtures and public compatibility entries for every researched non-measurement Difference, including live Config cache behavior, callback artifacts, max/shrink, aspect ratio, WebFlexBasis cache behavior, attached-subtree cache behavior, overlapping physical and logical margins, oversized and ordinary WrapReverse placement, reversed overflow distribution, zero cross-size lines, and auto margins under justification or reversed axes.
- Added Yoga 3.2.1 PixelGrid source attribution, a complete packaged MIT third-party notice, and package-file coverage for the notice.
- Added one facade-level synchronous Measure bridge that dispatches retained callbacks by NodeId, keeps measured Nodes as leaves, maps known, finite, min-content, and max-content constraints to Yoga modes, preserves content-box values, normalizes callback results, and rethrows callback failures with identity preserved.
- Added selected-root exact-axis context for measured calculations, zero clamping for exhausted content-box constraints, Yoga measured-text point-grid rounding, native-only cache invalidation when callbacks are replaced or removed, and hidden measurement/output revisions that preserve public dirty state while making failure retry and arbitrary-subtree output commits correct.
- Added the ordinary-compute fast path for selected subtrees without measured Nodes, controlled same-facade native tree-busy behavior during callbacks, and durable callback registration, external-data dirtying, result coercion, failure atomicity, temporary root-Style restoration, retry, Config-refresh retry, and path-selection fixtures.
- Added exact dual-oracle Difference fixtures and public documentation for callback count/order/mode traces, MeasureMode-sensitive results, measured flex-basis interaction, and Yoga's stale cache after callback replacement or removal.

## Evidence and review

- `vp run check` passes after the aggregate task waits for formatting before starting the build-backed tests: 9 Rust tests, 45 native tests, 194 `@taffyjs/node` integration tests, 6 Yoga tests, both declaration checks, formatting, linting, and Clippy pass.
- Direct Node imports of `yoga-layout` and `yoga-layout/load` resolve the built workspace package; `pnpm pack --dry-run --json` includes both JavaScript entries, both entry declarations, and both emitted shared chunks; built JavaScript has no `yoga-layout` runtime import.
- A temporary untracked file under `packages/taffyjs-yoga/dist` is detected by the exact intent-to-add freshness pattern with `git diff` exit 1.
- The fresh adversarial reviewer found one material issue: Node and Config instances exposed writable runtime, tree, NodeId, and Config fields. The implementation moved all handle state into module-private WeakMap records and added a runtime fixture proving fake same-named properties cannot affect native operations. The same reviewer returned PASS on the targeted follow-up.
- The Milestone 2 full `vp run check` passes: 9 Rust tests, 45 native tests, 194 `@taffyjs/node` integration tests, 17 Yoga tests, both declaration checks, formatting, linting, and Clippy pass.
- The Milestone 2 adversarial reviewer found one numeric boundary error: finite JavaScript numbers such as `1e39` can overflow only after f32 conversion, and length-like or aspect-ratio declarations must then clear to Undefined while flex numbers retain Infinity. The normalization was corrected after independent reproduction, `±1e39`, `1e-50`, and `±1e39%` were added to the oracle fixture, and the same reviewer returned PASS on the targeted follow-up.
- A bounded calculation probe found that Yoga and Taffy differ when `Display.None` is applied to the selected calculation root with declared dimensions. Style storage and direct display translation remain complete in Milestone 2; the calculated-output trigger is retained for Milestone 4 classification and regression coverage rather than being hidden in the declaration layer.
- The Milestone 3 full `vp run check` passes: 9 Rust tests, 45 native tests, 194 `@taffyjs/node` integration tests, 36 Yoga tests, both declaration checks, formatting, linting, and Clippy pass.
- The Milestone 3 adversarial reviewer found two native-cache/state gaps. Single-node and recursive release marked only Yoga-visible surviving ancestors, so Taffy could reuse an obsolete parent layout; Config freshness was checked only on the selected Node, so an independently configured descendant could miss both Style synchronization and `hasNewLayout`. Release now invalidates the surviving native parent and direct detached child roots with post-commit poisoning on failure, while calculation uses one full selected-subtree Style plan. The exact 30-by-10 release and independent child-Config reproductions now pass, and the same reviewer returned PASS on the targeted follow-up.
- The Milestone 4 full `vp run check` passes after the final projection fixes: 9 Rust tests, 45 native tests, 194 `@taffyjs/node` integration tests, 64 Yoga tests, both declaration checks, formatting, linting, and Clippy pass.
- The fresh Milestone 4 adversarial reviewer found three material issues: absolute mixed-direction logical insets were translated too late to recover auto-sized width, two known Taffy/Yoga Difference triggers were documented too narrowly, and the ported PixelGrid code lacked its required MIT attribution. Native Style translation now tracks containing direction before calculation, both Difference classes have exact dual-oracle fixtures and expanded documentation, and the source plus packaged notice carry the attribution.
- The same reviewer’s single targeted follow-up confirmed those three repairs and found two residuals: Taffy's percentage conversion needed to divide before its float32 cast, and the authoritative implementation reference had not been synchronized with the expanded Difference evidence. The exact width-3/left-0.3% reproduction now matches Yoga bit-for-bit, the remaining equivalent absolute-margin arithmetic is pinned under Yoga's 0.0001 float tolerance, and the reference now contains all three added Difference triggers. Per the review protocol, the review loop stopped after that one follow-up and the residual fixes were verified locally and by the complete gate.
- A `pnpm pack --dry-run --json` preview includes both entries, both entry declarations, both shared chunks, `COMPATIBILITY.md`, and `THIRD_PARTY_NOTICES.md`; a 64-case percentage direction, axis, and position matrix has zero exact mismatches for the tested inset corpus.
- The Milestone 5 full `vp run check` passes after the final Measure fixes: 9 Rust tests, 45 native tests, 194 `@taffyjs/node` integration tests, 74 Yoga tests, both declaration checks, formatting, linting, and Clippy pass. The committed path-selection profile records one ordinary call and zero measured calls for an unmeasured calculation, then one measured call only after a callback is present.
- The fresh Milestone 5 adversarial reviewer found two material issues: a negative Taffy finite content-box remainder was exposed as `AtMost(-5)` instead of Yoga's `AtMost(0)`, and a failed Config refresh consumed native Style staleness before retry, allowing changed descendant geometry to remain `hasNewLayout() === false`. Finite content constraints now clamp to zero, and each selected subtree retains a private output-stale marker until a complete successful projection and state commit.
- The same reviewer's single targeted follow-up returned PASS after verifying both axes, positive and exact constraints, the original Config/point-scale retry, partial child-then-ancestor recovery, and clean cache-hit flags. The focused Measure suite passes 10 tests, including the exact 20-by-30 negative-space and 10.5-by-5.5 retry reproductions.

## In flight

- None.

## Next

- Complete Milestone 6: audit the exact Yoga 3.2.1 public surface and classifications, finish package and alias evidence, remove obsolete research TODOs, complete public documentation, and run the release-readiness gates while keeping the PR draft and unmerged.

## Blocked

- None.
