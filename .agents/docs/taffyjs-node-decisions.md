# @taffyjs/node Decisions

This ledger records only judgments that Yunfei explicitly expressed about @taffyjs/node. Implementation, passing tests, review, or silence do not constitute acceptance.

## Decided

### Thin high-level TaffyTree binding

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** @taffyjs/node must be a thin native binding to Taffy's high-level TaffyTree usage model. Thin means that layout state and implementation remain in Rust and Taffy, with no JavaScript shadow tree or reimplemented layout abstraction; it does not mean exposing Taffy's low-level traits, internal types, or every public Rust symbol. APIs aimed at greater performance or JavaScript ergonomics may be added alongside this baseline but must not replace it or make it depend on a higher-level JavaScript abstraction.

**Limits:** This decides the package's role and API priority, not the exact JavaScript names, object shapes, call granularity, type representations, ownership model, error mapping, callbacks, validation, conversion, copying, or batching strategy. Rust alignment means preserving the capabilities, concepts, semantics, and visible costs of Taffy's TaffyTree-centered layout usage as directly as Node.js permits. It does not mean reproducing every public symbol in the Rust crate. Higher-level product and compatibility designs remain outside @taffyjs/node. Necessary Node-API interop costs do not conflict with this ruling. Changing this direction requires a new explicit project decision.

**Why:** @taffyjs/node is the foundation that guarantees access to Taffy without requiring consumers to adopt an additional JavaScript-side design. Keeping this path direct follows a zero-cost-abstraction principle: consumers should not pay for an optional higher-level wrapper they do not use. A direct surface is intentional at this layer, while proven performance or experience improvements can still be offered as additions.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly confirmed the direct binding direction, clarified that Rust alignment applies to Taffy's high-level layout usage rather than complete crate symbol coverage, and vouched the thin high-level native binding wording.

### Safe and sound JavaScript boundary

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** Safety and soundness are the binding's second design priority, immediately after preserving Taffy's high-level semantics. Every JavaScript-reachable path must validate values, handles, ownership, lifetime, and operation preconditions before they can violate a Rust or Taffy invariant. Invalid JavaScript usage and expected Taffy failures must produce controlled JavaScript errors rather than Rust panics, internal errors, invalid aliasing, or undefined behavior.

**Limits:** This ruling does not choose the JavaScript error classes, handle representation, validation implementation, callback reentrancy policy, or panic-containment mechanism. It does not claim that the binding can prevent process termination caused by allocation failure, an aborting dependency, or an unknown upstream defect. Panic containment may be a defensive backstop, but it must not replace validation and typed error handling for expected inputs and operations.

**Why:** JavaScript callers can freely construct malformed values, retain stale handles, mix values from different owners, and re-enter callbacks. The public boundary must make those cases safe and predictable before they reach native code whose invariants assume valid Rust values and relationships.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly made safe and sound JavaScript behavior the second design principle and required the API to prevent JavaScript misuse from producing panics or internal errors.

### High-level layout-engine scope

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** @taffyjs/node must bind Taffy's TaffyTree-centered high-level layout-engine usage surface. It must expose what JavaScript consumers need to construct and mutate layout trees, provide styles and measurements, compute layouts, and read results; it must not pursue symbol-for-symbol coverage of Taffy's Rust crate.

**Limits:** The comparison to yoga-layout describes the package boundary and intended completeness of normal layout usage, not a requirement to copy Yoga's API shape. A Yoga-compatible API remains the responsibility of @taffyjs/node-yoga. Taffy's low-level custom-tree traits, trait-dependent single-algorithm compute functions, cache internals, helper traits, and generic implementation infrastructure are outside the default binding scope. A JavaScript-owned custom tree or other low-level algorithm adapter requires a new explicit direction. The exact high-level methods and transitive value types still require systematic mapping.

**Why:** The package is a usable binding for performing layout from JavaScript, not a mirror of every Rust implementation and extension mechanism. Limiting the surface to Taffy's own high-level usage keeps the binding direct while avoiding APIs whose Rust abstraction and cost model do not carry across Node-API.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly confirmed that @taffyjs/node should resemble yoga-layout in binding the usable layout API rather than mapping every Rust detail, and approved this interpretation as a project decision.

### Binding design principles

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** The binding must preserve Taffy's high-level Rust semantics and capabilities without mechanically copying Rust syntax; Rust must remain the only source of binding state, with no JavaScript shadow state; implicit costs such as deep copies, object conversion, callbacks across the language boundary, and per-node calls must be treated deliberately; the direct baseline API must remain available when additive batch or higher-performance APIs are introduced; ownership, handle validity, cross-tree misuse, and error behavior must be explicit; and Yoga compatibility, reactive objects, and other higher-level designs must live in @taffyjs/node-yoga or another package above @taffyjs/node.

**Limits:** These principles do not decide the concrete JavaScript API, names, object representations, handle encoding, validation mechanism, callback interface, batching shape, or which optimizations are worthwhile. They also do not require eliminating unavoidable Node-API conversion costs. Those choices must be evaluated from the Rust model, napi-rs's available representations, and measured consumer needs.

**Why:** @taffyjs/node is the direct foundation for other JavaScript APIs. Its state ownership, costs, and failure boundaries therefore need to remain visible and predictable, while optional convenience and performance paths must not make the direct binding unavailable.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly approved these six binding principles and requested that they be vouched before concrete API design.

### Direct layout-state behavior

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** The baseline JavaScript API must preserve Taffy's explicit computation and stored-layout behavior: reading layout returns the value currently stored by Taffy, including zero values before the first computation and previous results after inputs change; changing style or tree state must not compute layout automatically; returned Layout values must be owned snapshots rather than live views into the tree; and, if Taffy's dirty-state query is exposed, it must retain Taffy's cache-state meaning without being presented as a guarantee that a node's stored layout is current. APIs that compute automatically or otherwise guarantee a current result may be added only as optional sugar.

**Limits:** This ruling does not decide whether the dirty-state query belongs in the public API, the names of any methods, the shape of Layout values, or whether TypeScript marks snapshots readonly. Runtime sealing or freezing is an open representation and cost choice, not part of this decision. Failure-state layout validity and batch layout reads also remain open.

**Why:** @taffyjs/node is the direct Taffy binding and must not add automatic work or reinterpret Taffy's state by default. Yunfei explicitly accepted Taffy's zero-before-compute, old-value-until-recompute, borrowed-to-owned-copy, and cache-state semantics, while allowing separate sugar APIs when useful.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly vouched the conclusions from the first four outer-layer mapping experiments.

### Opaque External node handles

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** JavaScript node handles must be binding-created Node-API External values with an opaque branded TypeScript type, while the raw Taffy NodeId remains private; before any handle reaches Taffy, the binding must verify that it is the expected native value, came from the target tree, and still names an existing node, and it must turn ordinary objects, foreign-tree handles, and removed-node handles into catchable JavaScript errors rather than wrong-node access or Rust panics. Repeated retrieval of the same Taffy node is not required to return JavaScript values that compare equal with `===`; an explicit node-comparison API may be added if needed.

**Limits:** The TypeScript brand only distinguishes the declared node-handle type from ordinary values at compile time; it cannot prove tree ownership or continued existence. This ruling does not choose how Rust records the issuing tree or live nodes, the error classes and messages, whether handles keep a tree alive, the placement or exact semantics of a future node-comparison API, or whether two removed handles may still compare as representing the same former node.

**Why:** Taffy's NodeId equality compares only its stored number and does not identify a TaffyTree. A foreign NodeId can silently address a different node with the same number, while a removed NodeId can panic when used. Yunfei required those cases to become catchable JavaScript errors, accepted the opaque External behavior, and chose not to require canonical JavaScript object identity.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly vouched the fifth outer-layer mapping experiment and the External handle behavior, and chose no `===` guarantee with an explicit comparison API available if needed.

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
