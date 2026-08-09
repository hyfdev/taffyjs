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

### ESM-only package entry

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** @taffyjs/node must publish ESM as its only JavaScript module format and must not emit a dedicated CommonJS build.

**Limits:** The napi-rs ESM loader may use createRequire internally to load native addons and optional platform packages; that implementation detail is not a CommonJS public entry. Node.js 22.18 can synchronously require this ESM graph because it has no top-level await, but require(esm) remains release-candidate functionality in that Node release and is not a supported @taffyjs/node contract. This ruling does not decide the broader runtime support matrix. Adding a dedicated CommonJS output requires a new explicit project decision based on a concrete supported-consumer need.

**Why:** ESM is the first-class module system for this package, while CommonJS is secondary and does not justify a separate output. Modern Node.js can already load a synchronous ESM module from require(), so another build would add package and test complexity without changing the primary API.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; requested first-class ESM and no dedicated CommonJS output if modern require(esm) was viable. The verified implementation uses napi-rs's documented [ESM build option](https://napi.rs/docs/cli/build), and the minimum workspace runtime behavior is documented by [Node.js 22.18](https://nodejs.org/download/release/v22.18.0/docs/api/modules.html#loading-ecmascript-modules-using-require).

### napi-rs platform package distribution

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** @taffyjs/node must use napi-rs's maintained root-loader distribution model with optional @taffyjs/binding-<platform> packages and must not introduce a generic intermediate binding package or an additional custom loader build without a concrete need.

**Limits:** This ruling does not freeze the target matrix, package versions, release automation, or support policy. It also does not prevent authored JavaScript packages above @taffyjs/node or a future browser or WASI design. Evidence that the generated loader cannot support a required runtime or package boundary would reopen the custom-loader part of the ruling.

**Why:** The generated root loader plus one optional package per platform is napi-rs's current maintained release model. It already gives @taffyjs/node the required package boundary; another binding package or loader build would add machinery for requirements that TaffyJS does not currently have.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; accepted the current model if it remained the official napi-rs recommendation and preferred avoiding an additional custom packaging layer without a concrete need. The maintained model is described in napi-rs's [native package release documentation](https://napi.rs/docs/deep-dive/release).
