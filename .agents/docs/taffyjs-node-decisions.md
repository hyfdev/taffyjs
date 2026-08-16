# @taffyjs/node Decisions

This ledger keeps only judgments Yunfei explicitly expressed; an implementation, passing test or review, resemblance to another project, or silence is not acceptance. Current conversion details belong in [binding mapping](binding-mapping.md), and public behavior belongs in source declarations, JSDoc, README examples, and tests.

## Direct high-level binding

[VOUCHED @hyfdev 2026-08-14]

`@taffyjs/node` is the thin native foundation for Taffy's high-level `TaffyTree` workflow. Rust and Taffy own layout state and behavior; JavaScript must not maintain a shadow tree or reimplement layout. Thin does not mean exposing every public Rust symbol: low-level custom-tree traits, cache internals, CSS parsing, and Yoga compatibility stay outside this package.

Additive convenience or measured performance APIs may coexist with the direct methods, but they must not replace them or require callers to adopt a higher-level JavaScript abstraction.

## Safe boundary with Taffy-owned semantics

[VOUCHED @hyfdev 2026-08-14]

Supported `@taffyjs/node` calls must prevent JavaScript-controlled values, ownership mistakes, callback re-entry, and known Taffy panic paths from violating Rust or native state. Expected misuse produces controlled JavaScript errors. Direct platform-package use is an unsupported implementation path and does not receive this guarantee.

After the binding has produced a complete representable Rust value and satisfied its explicit identity, absence, ownership, lifetime, and safety rules, Taffy owns the semantic result. The direct binding does not add JavaScript-side clamping, CSS policy, Yoga normalization, or defensive defaults merely because a safely representable value is unusual.

## Public data model

[VOUCHED @hyfdev 2026-08-15]

Readable ordinary JavaScript values are the public contract. Inputs are designed to be natural to write, while outputs are designed to make their complete meaning visible. Input and output do not need to use the same runtime representation. Input records remain mutable. Collection-valued inputs accept readonly arrays because the binding only reads them; ordinary mutable arrays remain valid inputs. Binding-produced snapshots are detached and recursively readonly in TypeScript, but runtime objects are not frozen, sealed, proxied, cached, or backed by a live Rust borrow.

Closed choices without associated data use singular PascalCase frozen objects with stable numeric literal members, such as `Display.Flex`. When a numeric input has one clear common meaning, callers may use a number as an additive shorthand: a length number means an absolute length, and an available-space number means `Definite`. The complete forms remain supported, including `Dimension.Length(20)` and `AvailableSpace.Definite(640)`; the shorthand does not replace them. Other meanings remain explicit through values such as `Dimension.Percent(50)`, `Dimension.Auto`, `AvailableSpace.MinContent`, and `AvailableSpace.MaxContent`. Values returned by the binding keep complete numeric-tagged records, and those returned values remain valid as later inputs. Other values that carry data, including Grid values, continue to use ordinary tagged records. Public values do not use CSS strings, packed numbers, buffers, or native owner objects.

The private representation passed from JavaScript to Rust is a separate implementation choice. Small fixed values may use primitive parameters, and larger values may use a compact buffer when measurements show that it is beneficial. Changing this private representation must not change the public input or output API.

`StyleInput` uses defaults for missing or `undefined` fields, explicit `null` only for publicly nullable fields, strict top-level and partial-geometry field names, and complete replacement in `setStyle`. `getStyle` and measure callbacks receive complete eager snapshots. A measured future optimization may be additive; no selector, query, lazy object, or output cache belongs to the baseline.

## Value-based NodeId

[VOUCHED @hyfdev 2026-08-14]

Public `NodeId` is an opaque bigint with a TypeScript marker and a private per-tree encoding, not Taffy's raw `u64` and not a JavaScript node object. Stable bigint equality must work in ordinary JavaScript collections without a native call.

The public wrapper keeps one current-node registry and validates owner, creation serial, and raw ID before native access. Native code does not duplicate that registry. IDs are not persistent or transferable across trees, workers, module evaluations, or separately installed package copies.

## Explicit layout and JavaScript context

[VOUCHED @hyfdev 2026-08-14]

Layout computation stays explicit through separate `computeLayout` and `computeLayoutWithMeasure` methods. Layout getters return Taffy's stored value without computing, and `isDirty` keeps Taffy's cache-state meaning rather than promising current output.

Arbitrary node context remains owned by JavaScript; native `TaffyTree<()>` stores only presence. `undefined` means absence, `setNodeContext` marks the node dirty, and in-place context or captured-data changes require caller-managed `markDirty` when they affect measurement. The initial implementation has no JavaScript cache of Taffy-owned data.

## Measurement boundary

[VOUCHED @hyfdev 2026-08-14]

The direct measure callback is synchronous, scoped to one compute, and receives owned boundary values. Taffy and its cache control invocation count, ordering, and constraints. Same-tree native access while it runs fails with `ERR_TAFFY_TREE_BUSY`; an independent tree remains usable.

The callback returns a complete numeric size. The first thrown value or invalid result stops later JavaScript callbacks, lets Taffy's infallible stack finish, invalidates the requested subtree, and is thrown synchronously. The tree remains reusable, but JavaScript side effects and Layout work completed before failure are not rolled back.

Retained, asynchronous, off-thread, cancellable, or transactionally rolled-back measurement would be a different API with its own ownership and failure contract.

## Selective query

### Complete bounded per-node selective reads

[VOUCHED @hyfdev 2026-08-14]

**Ruling:** An additive @taffyjs/node API for reading only part of a node's Style, Layout, or DetailedLayoutInfo must make every value reachable through that public JavaScript shape queryable, including complete intermediate values, nested fields, collection lengths, individual elements, and values below nested collections. The complete finite selector set must be derived from the public shape rather than selected through a separate allowlist. JavaScript must resolve a public selector through generated static metadata before the native call, and native code must directly read and convert the selected Rust value rather than interpret a general query language or construct unrequested parent values. A valid query whose value is absent because an index is out of bounds, a tagged variant is inactive, or a parent value is null returns `undefined`; a malformed selector, index count, or index produces a controlled JavaScript error.

**Limits:** This ruling establishes a reference design; it does not require that the API ship, replace complete getters, or fix its canonical public-shape representation, private operation numbering, native method shape, exact error classes, supported index range, or performance acceptance thresholds. Complete coverage stops at scalar values, IDs, references, and any future recursive value; selectors must not implicitly traverse the node tree or recursively enter data managed outside Style, Layout, or DetailedLayoutInfo. Querying a nullable field itself still returns its actual null value, while attempting to continue below null returns `undefined`. If a future public value is recursive, the existing query may return that value or a reference to it as a whole, or the project may design a separate API for it.

**Why:** Consumers may need any one field or nested collection value without paying to convert the complete native object; omitting an otherwise valid reachable value would leave the capability incomplete. The three current per-node values have finite, non-recursive public shapes even though the Taffy node tree and CSS calculation expressions are themselves recursive. Complete generated coverage keeps the API predictable and type-checkable, while generated cross-language metadata prevents JavaScript and Rust contracts from drifting. Complete getters remain the better path when a consumer needs most of a value.

**Source:** Yunfei (`@hyfdev`), 2026-08-13 and 2026-08-14; accepted this constrained design as sound for the current and foreseeable Style and layout data, chose `undefined` for valid queries whose current data has no value, required complete coverage of the bounded public shape unless evidence showed a material problem, requested that the high-level design be recorded for later implementation, and explicitly vouched the complete accumulated design. See [Selective query design notes](query-api-design.md).

### Fixed selective-query entry points

[VOUCHED @hyfdev 2026-08-14]

**Ruling:** If the selective-query API ships, `TaffyTree` must expose it through four public method names: `queryStyle`, `queryLayout`, `queryUnroundedLayout`, and `queryDetailedLayoutInfo`. Each method must provide both the single-request and batch overload under that same name. `queryLayout` and `queryUnroundedLayout` must expose the same Layout selector set and selector-to-result type mapping while reading the rounded and unrounded stored Layout values respectively.

**Limits:** This fixes the public method names, their source values, their shared single-and-batch naming, and the observable equality of the two Layout selector contracts. It does not require the API to ship or fix whether the generator represents those two contracts with one internal model, the generated overload implementation, private native method names or signatures, private operation IDs, or batch allocation strategy. The four entry points remain additive to `getStyle`, `getLayout`, `getUnroundedLayout`, and `getDetailedLayoutInfo`; they do not replace the complete getters.

**Why:** The four entry points align selective reads with the four existing complete getter sources. Rounded and unrounded Layout have the same public value shape, so their public selector and result contracts must remain identical, while merging the entry points would make the selected native source ambiguous.

**Source:** Yunfei (`@hyfdev`), 2026-08-14; explicitly accepted the four proposed selective-query entry points and asked that they and the preceding design be vouched.

### Fixed selector and TypeScript behavior

[VOUCHED @hyfdev 2026-08-14]

**Ruling:** Selectors must use the public JavaScript field names joined by `.`, append `[]` at every collection element step, and use `.length` to select a collection length. Each `[]` must consume one separate trailing numeric index from left to right; numeric indices, wildcards, filters, slices, callbacks, optional chaining, and arbitrary expressions must not appear in the selector string. Selecting a record or collection path returns that complete intermediate value, while the complete root value has no selector and remains the responsibility of its getter. Generated TypeScript must autocomplete the finite selector set, reject statically known unknown selectors and wrong index counts, and infer the exact single-request result including `undefined` where the selected path can be absent. A request literal written directly as an inline batch must infer the positionally corresponding result tuple without requiring `as const`, a helper, or a query builder.

**Limits:** This fixes observable selector spelling and TypeScript behavior, not the internal declaration-generation technique. TypeScript checks the number and `number` type of indices but cannot prove that an arbitrary runtime number is an integer, within the supported numeric range, or in bounds; runtime validation remains required, and a valid out-of-bounds index still returns `undefined`. If a caller first assigns requests to an ordinarily inferred variable, TypeScript may widen the literal before the query call and cannot recover its original positions; retaining a known tuple may therefore require `as const` or an explicit positional tuple annotation that retains each selector literal. A dynamically assembled request collection has no fixed positional result and may return an array of the possible result types. Neither case violates the inline-literal guarantee or justifies requiring a builder.

**Why:** A deliberately tiny selector notation is sufficient to cover the finite public value shapes without becoming a runtime path language. Exact generated relationships preserve autocomplete, index arity, tagged-union absence, and return types across both single and batch calls, while keeping indices out of strings avoids parsing and an unbounded selector key space.

**Source:** Yunfei (`@hyfdev`), 2026-08-14; explicitly confirmed the proposed selector spelling and TypeScript inference requirements, accepted ordinary TypeScript widening and legitimate `as const` use outside direct inline literals as the intended boundary, and asked that this behavior and all preceding selective-query decisions be vouched.

### Single-source selective query batching

[VOUCHED @hyfdev 2026-08-14]

**Ruling:** The single selective-query request must be the only generated query model. Each public entry point's single and batch forms must use overloads of the same method name, such as `queryStyle` rather than separate `queryStyle` and `queryStyleBatch` methods. The batch form must accept an ordered collection of ordinary single requests and return positionally corresponding results. Its TypeScript types, JavaScript selector metadata and validation, and Rust per-request dispatch must all derive from or reuse the single-request definitions; native code may add one private batch entry to execute the collection across the JavaScript-to-native boundary once, but JavaScript must not implement the batch overload by repeatedly invoking the native single operation.

**Limits:** This decides the shared public naming pattern, single-source generation, result ordering, and one-boundary execution model. The four public method names and required observable TypeScript inference are fixed separately; their concrete generated declaration structure, maximum batch size, private native method shape, and allocation strategy remain open. It governs batches of selective queries only; complete-object batch reads and compact transfer of complete Layout values are separate mechanisms that require their own evidence and design.

**Why:** Batch execution should amortize the JavaScript-to-native boundary without introducing a second selector contract or a second generated API. Deriving the batch form from the single form preserves the same autocomplete, index-count checking, selector result types, runtime validation, and native field access as the individual request while preventing the two forms from drifting.

**Source:** Yunfei (`@hyfdev`), 2026-08-13 and 2026-08-14; required the single and batch forms to share one public method name through overloads, used `queryStyle` as the example, required the batch form to be derived from the single form rather than generated independently, and vouched the accumulated design after the four entry points were fixed. See [Selective query design notes](query-api-design.md).

### Domain-local multi-node query batches

[VOUCHED @hyfdev 2026-08-14]

**Ruling:** Each selective-query batch must stay within one of `queryStyle`, `queryLayout`, `queryUnroundedLayout`, or `queryDetailedLayoutInfo`, while each request in that batch may name a different NodeId owned by the receiving tree. The only batch input shape must be an ordered array of complete single-request argument tuples, each containing its own NodeId, selector, and required indices. The API must not add a same-node shorthand or a general batch that mixes those four public entry points.

**Limits:** This fixes the entry-point boundary, multi-node capability, and batch container model, not the maximum batch size, internal flattening, or native representation. A future cross-entry-point batch requires a measured workload showing that reducing already-batched per-method native calls is material enough to justify its additional public and generated type model.

**Why:** Allowing a different node in every ordinary request lets one batch replace a number of native calls that grows with the number of nodes, and it follows directly from the single-request model. Once requests are already batched within each entry point, mixing entry points can remove only the small fixed number of remaining per-method native calls without reducing field access or result conversion; no current workload justifies the additional general API and mixed result model. Requiring one complete request tuple per item avoids a second same-node-only signature and keeps TypeScript inference, runtime validation, and code generation aligned with the single form.

**Source:** Yunfei (`@hyfdev`), 2026-08-13 and 2026-08-14; accepted entry-point-local batches, different NodeIds per request, and the ordered array of complete single-request argument tuples as the only batch form, while rejecting a cross-entry-point batch without evidence that its fixed call-overhead saving is material, then vouched the complete accumulated design.

### All-or-nothing selective batch errors

[VOUCHED @hyfdev 2026-08-13]

**Ruling:** A selective-query batch must return positionally corresponding values only when every request is well formed and every NodeId is valid. Any unknown selector, wrong index count, invalid index, or invalid, stale, or foreign NodeId makes the complete batch throw a controlled JavaScript error without returning partial results. An out-of-bounds index, inactive tagged variant, or null parent remains a valid absent value and produces `undefined` only at that request's result position. The wrapper must first copy all caller-controlled batch entries and request arguments into an ordinary internal snapshot, then validate the entire snapshot, and immediately enter one native operation without consulting the caller's original values again.

**Limits:** This decides whole-batch failure versus per-request error results and the required snapshot-before-validation safety order. It does not fix exact error classes, batch size limits, the private native input representation, or which malformed request is reported when several are present. The batch is read-only, so this ruling does not define rollback or partial mutation behavior.

**Why:** Per-request error values would complicate every batch result type and let callers accidentally consume partial output. Snapshotting before validation prevents a later array accessor or Proxy trap from mutating the tree and making a NodeId that was validated earlier stale before native code uses it.

**Source:** Yunfei (`@hyfdev`), 2026-08-13; accepted whole-batch failure for malformed requests while retaining per-position `undefined` for valid absent values and asked that the decision be recorded.

### Detached selective-query results

[VOUCHED @hyfdev 2026-08-13]

**Ruling:** Every object or array returned by selective query must be an ordinary detached owned snapshot and recursively readonly in TypeScript, never a live view, Proxy, or Rust-backed borrow. Separate query results must not promise shared JavaScript object identity, including duplicate requests and overlapping parent and child selections.

**Limits:** Scalar results retain their ordinary primitive semantics. An implementation may internally reuse conversion code or compact transport, but it must not expose mutable native state or make correctness depend on result identity. This ruling does not require runtime freezing, prohibit internal allocation optimizations, or require separate identity when an immutable singleton is already part of the established public value contract.

**Why:** Query changes how much of the native value is copied, not the binding's ownership model. Detached results preserve the complete getters' safety and snapshot behavior without adding lifetimes, aliasing, hidden native access, or identity contracts that would constrain later optimizations.

**Source:** Yunfei (`@hyfdev`), 2026-08-13; accepted detached owned snapshots with no promised identity sharing for object and array query results and asked that the decision be recorded.

### Complete-output transport is separate from selective query

[VOUCHED @hyfdev 2026-08-14]

**Ruling:** Compact native transfer followed by generated JavaScript reconstruction may be evaluated as an internal optimization for complete output values, but it must remain conceptually and contractually separate from selective query. Complete-output transport changes how all requested data crosses Node-API and where ordinary JavaScript objects are created; selective query changes which data is requested and avoids converting unrequested values. The mechanisms may share one canonical public-output description, but one must not be treated as a replacement for the other.

**Limits:** This records an optimization direction, not a requirement to ship it, expose its private buffer format, use one encoding for every data kind, change the complete getter's public result, or build the generator before a representative prototype demonstrates value. Adoption must be decided separately for each data kind from escaped-result latency, retained-memory, and sustained-GC evidence. Layout is the first candidate; applying the direction to Style or DetailedLayoutInfo remains benchmark-gated. Exact buffer layout, schema representation, decoder implementation, version checks, and public complete-object batch APIs remain open.

**Why:** Moving object construction from repeated Node-API property operations into generated JavaScript can reduce complete-value conversion cost, especially for fixed numeric records, but it still processes the entire value and can add encoding, decoding, temporary-buffer, and memory costs. Selective query instead avoids work proportional to unrequested fields and collection elements, so the two optimizations act at different layers.

**Source:** Yunfei (`@hyfdev`), 2026-08-13 and 2026-08-14; asked to record generated compact transfer as a data-transfer optimization direction, explicitly distinguished it from selective query over only requested data, and vouched the complete accumulated design. See [Complete-output transport optimization](complete-output-transport.md).

## Package and testing boundaries

The public package is ESM-only. napi-rs supplies the private root loader and optional platform packages; do not add a generic intermediate binding package, a dedicated CommonJS build, or a custom loader without a concrete supported-consumer need.

JavaScript integration tests are the primary proof of public behavior. The repository does not maintain a tarball-install path or packed-consumer test while installing packed tarballs directly from this repository is not a supported scenario. Rust unit tests are reserved for small critical behavior that is clearer below Node-API, including panic containment and measurement internals. Test volume is not a goal; preserve distinct behavior without multiplying methods by every equivalent error case.

## Parallel test scheduling

[VOUCHED @hyfdev 2026-08-14]

Test tasks, test files, and independent tests within a file run in parallel by default. Serial execution is allowed only for a demonstrated shared-state or exclusive-resource dependency that cannot cheaply be removed. Keep that exception in its own `*.sequential.test.mts` file, and make the file explicitly opt out of concurrent execution; do not slow a general test command to accommodate one serial case.

## Reopen only with evidence

[VOUCHED @hyfdev 2026-08-14]

New public state owners, compatibility layers, retained JavaScript values, callback models, private transports, batching, caches, or output representations require a concrete consumer need. Performance changes additionally require retained end-to-end measurements that include JavaScript conversion cost. Open work is tracked in [API alignment TODOs](api-alignment-todos.md).

## Decided

### napi-rs native target parity

**Ruling:** `@taffyjs/node` must track napi-rs's own officially supported native platform set instead of limiting its binaries to a small hand-selected subset.

**Limits:** This governs native target coverage. It does not change the public JavaScript API, runtime-version policy, explicit `@taffyjs/wasm` package boundary, or the rule against a custom loader. The concrete target list must be derived from current upstream support evidence rather than from every target triple the CLI can parse.

**Why:** No rationale was given beyond requiring parity with napi-rs's official platform support and rejecting the existing narrow target set.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; asked to inspect both projects' platform coverage and align TaffyJS with napi-rs's official support instead of retaining only the current few targets.

### Generated numeric input shorthand

[VOUCHED @hyfdev 2026-08-15]

**Ruling:** The direct-number mappings for absolute lengths and definite available space must be maintained once in the repository API generator rather than repeated by hand across TypeScript and Rust. The generated public TypeScript types, JSDoc, and complete-form helpers and the generated Rust input parser must agree that a number maps to the `Length(value)` or `Definite(value)` branch. Both the number and its complete tagged form must reach the same Rust boundary value without first allocating a replacement tagged object in JavaScript. After the shorthand is implemented, maintained JavaScript and TypeScript examples and ordinary behavior tests must use it by default wherever it expresses the same value.

**Limits:** `Dimension.Length(value)`, `AvailableSpace.Definite(value)`, direct tagged records, and tagged outputs passed back as input remain supported. Output remains a complete tagged value. Focused examples and tests retain complete forms when explaining, exercising, narrowing, or round-tripping them, and documentation must not imply that they are deprecated. The generator owns the public boundary shape and input normalization for these two accepted shorthands, not Taffy-specific conversion such as percentage scaling, Style traversal, private transport choices, Grid values, or query generation. This decision does not create a general binding-description language or approve additional primitive shorthands.

**Why:** The shorthand's target branch is one cross-language fact currently represented by TypeScript types and helpers, JSDoc, and Rust parsing, so handwritten copies can drift. Converting the shorthand to an object in JavaScript would add allocation and eventually require an extra walk over nested Style input; direct generated Rust normalization preserves the separation between the ergonomic public input and the private native path.

**Source:** Yunfei (`@hyfdev`), 2026-08-15; required examples and ordinary tests to prefer available shorthand, required JSDoc to name the corresponding complete form, accepted generator ownership with direct Rust normalization instead of JavaScript object materialization, and explicitly asked for the resulting design to be vouched. See [Generated tagged inputs](api-codegen.md#generated-tagged-inputs).

### Partial style updates

[VOUCHED @hyfdev 2026-08-16]

**Ruling:** `TaffyTree.updateStyle` must preserve every omitted or `undefined` value and update only the supplied parts of a node's current Style, while `setStyle` continues to replace the complete Style from Taffy's defaults. A public partial `Point`, `Size`, `Rect`, or `Line` input, such as `size`, `margin`, or `padding`, updates only its supplied components. Every array, tagged union, and other input modeled as a complete value is replaced as a whole; an empty array clears that array, and `null` clears only a field whose public input already permits null. The public TypeScript update type must keep arrays, every tagged-union branch, and complete records complete; it must not use a general recursive `Partial`.

**Limits:** `updateStyle` does not update an array element or a tagged-union payload in place. A concrete future need may add a separate array-editing operation without changing these rules. This decision does not fix the private field numbering, transport shape, parsing strategy, generated type name, or whether a later Taffy API can avoid copying a complete Rust Style.

**Why:** Callers should be able to change an independently meaningful style part without reconstructing unrelated Style data, while values whose meaning depends on their complete variant or sequence remain predictable. Copying, combining, and validating the current and supplied values belongs in Rust rather than in a `getStyle()` to JavaScript merge to `setStyle()` round trip. The complete prospective Style must be validated before one write; an invalid update changes nothing, and an empty update or an update whose result is unchanged must leave the node's existing dirty state unchanged rather than making a clean node dirty. These rules keep the common API friendly without introducing recursive array merging, partial tagged variants, or a JavaScript-owned shadow Style.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; kept `setStyle` as the direct complete-replacement operation, chose an additive update operation for ergonomic partial changes, required Rust-owned copying rather than JavaScript object cloning, required invalid, empty, and unchanged updates not to produce mutation or new dirty state, accepted whole-array replacement, and explicitly confirmed that generated TypeScript must prevent partial tagged-union inputs before asking for this accumulated design to be vouched.

### Preferred style mutation operation

**Ruling:** Public documentation must recommend `updateStyle` as the default operation for changing an existing node. `setStyle` is the intentional complete-replacement operation and should be chosen when omitted fields must reset to Taffy's defaults, including a complete reset with `{}`.

**Limits:** This recommendation does not remove or deprecate `setStyle`, change whole-value replacement for supplied arrays and complete values, promise that every individual `updateStyle` call is faster, or fix the binding's private copying strategy. The exact cost depends on the input shape and runtime.

**Why:** Reconstructing preserved state for `setStyle` requires a caller-owned prior value or a `getStyle` snapshot and makes every retained supplied value cross the JavaScript-to-Rust conversion boundary again. `updateStyle` directly represents the incremental intent and generally avoids converting unrelated JavaScript values. Retained end-to-end measurements support this qualitative default while also showing that direct replacement of a large collection can make the operations converge, so the public claim must remain comparative rather than absolute.

**Source:** Yunfei (`@hyfdev`), 2026-08-16; explicitly requested a dedicated `@taffyjs/node` documentation page that explains the distinction and tells readers to prefer `updateStyle` unless they have a specific need for `setStyle`.

## Open

### Selective query implementation details

Repository-wide generator ownership, normalization, emitter, output, command, and verification boundaries are decided in [API code generation](api-codegen.md). The canonical public-shape representation, concrete generated declaration structure, private dispatch shape, exact malformed-call error classes, supported index range, batch size limits, and performance acceptance thresholds remain open within those boundaries. The public method names, selector spelling, overload behavior, and required TypeScript inference are decided. The settled public boundary and query-specific generation guidance are recorded in [Selective query design notes](query-api-design.md) and [API query code generation](api-codegen-query.md).
