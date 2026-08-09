# @taffyjs/node Decisions

This ledger records only judgments that Yunfei explicitly expressed about @taffyjs/node. Implementation, passing tests, review, or silence do not constitute acceptance.

## Decided

### Direct Rust-aligned binding surface

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** @taffyjs/node must expose a direct Node.js binding modeled on Taffy's Rust API; APIs aimed at greater performance or JavaScript ergonomics may be added alongside this baseline but must not replace it or make it depend on a higher-level JavaScript abstraction.

**Limits:** This decides the package's role and API priority, not the exact JavaScript names, object shapes, call granularity, type representations, ownership model, error mapping, callbacks, validation, conversion, copying, or batching strategy. Rust alignment means preserving Taffy's capabilities, concepts, and semantics as directly as Node.js permits, not mechanically reproducing every Rust surface detail. Higher-level product and compatibility designs remain outside @taffyjs/node. Necessary Node-API interop costs do not conflict with this ruling. No exception or reopen condition was expressed; changing this direction requires a new explicit project decision.

**Why:** @taffyjs/node is the foundation that guarantees access to Taffy without requiring consumers to adopt an additional JavaScript-side design. Keeping this path direct follows a zero-cost-abstraction principle: consumers should not pay for an optional higher-level wrapper they do not use. A raw surface is intentional at this layer, while proven performance or experience improvements can still be offered as additions.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly confirmed and requested as a vouched project decision in the repository bootstrap discussion.

### JavaScript integration-first testing

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** @taffyjs/node must use JavaScript integration and end-to-end tests as its primary test flow; while crates/taffyjs_binding only exposes existing Taffy behavior and implements no independent functionality, binding tests must be written on the JavaScript side, and unit tests must be avoided except for very critical isolated behavior.

**Limits:** Rare unit tests live in packages/taffyjs-node/tests/ as part of the @taffyjs/node package, without a separate package manifest. Integration and end-to-end tests live in tests/taffyjs-node as an independent private JavaScript consumer package. Rust formatting, linting, and compilation checks are still required. If crates/taffyjs_binding gains independent Rust behavior, whether that behavior needs Rust tests must be decided from the new evidence; this ruling does not prohibit such a future decision.

**Why:** The Rust crate binds existing Taffy functionality rather than implementing new behavior, while the package's observable contract exists at the JavaScript and Node-API boundary. Integration and end-to-end tests exercise that contract as a consumer sees it. Yunfei specified that unit tests should be exceptional; no further rationale was given for that limit.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly approved the testing strategy, package boundary, and directory layout and requested that the decision be vouched in the repository bootstrap discussion.
