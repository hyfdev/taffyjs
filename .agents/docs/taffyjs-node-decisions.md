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

[VOUCHED @hyfdev 2026-08-10]

**Ruling:** Safety and soundness are the binding's second design priority, immediately after preserving Taffy's high-level semantics. Every supported @taffyjs/node API path must validate values, node identities, ownership, lifetime, and operation preconditions before they can violate a Rust or Taffy invariant. Invalid use of @taffyjs/node and expected Taffy failures must produce controlled JavaScript errors rather than Rust panics, internal errors, invalid aliasing, or undefined behavior. Direct imports or calls to @taffyjs/binding-<platform> packages are unsupported implementation access and are outside this public safety contract.

**Limits:** This ruling does not choose the JavaScript error classes for cases not decided separately, validation for non-node values, or panic-containment mechanism. The platform packages remain loadable npm dependencies because the maintained napi-rs loader needs them, but their raw exports must not be re-exported as supported @taffyjs/node operations. This ruling does not claim that the binding can prevent process termination caused by allocation failure, an aborting dependency, direct unsupported platform-package use, or an unknown upstream defect. Panic containment may be a defensive backstop, but it must not replace validation and typed error handling on the supported @taffyjs/node paths.

**Why:** JavaScript callers can freely construct malformed values, retain stale NodeIds, mix NodeIds from different trees, and re-enter callbacks. The public boundary must make those cases safe and predictable before they reach native code whose invariants assume valid Rust values and relationships.

**Source:** Yunfei (`@hyfdev`), 2026-08-09 and 2026-08-10; explicitly made safe and sound JavaScript behavior the second design principle, required the supported @taffyjs/node API to prevent JavaScript misuse from producing panics or internal errors, and explicitly excluded direct @taffyjs/binding-<platform> use from that guarantee.

### High-level layout-engine scope

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** @taffyjs/node must bind Taffy's TaffyTree-centered high-level layout-engine usage surface. It must expose what JavaScript consumers need to construct and mutate layout trees, provide styles and measurements, compute layouts, and read results; it must not pursue symbol-for-symbol coverage of Taffy's Rust crate.

**Limits:** The comparison to yoga-layout describes the package boundary and intended completeness of normal layout usage, not a requirement to copy Yoga's API shape. A Yoga-compatible API remains the responsibility of @taffyjs/node-yoga. Taffy's low-level custom-tree traits, trait-dependent single-algorithm compute functions, cache internals, helper traits, and generic implementation infrastructure are outside the default binding scope. A JavaScript-owned custom tree or other low-level algorithm adapter requires a new explicit direction. The exact high-level methods and transitive value types still require systematic mapping.

**Why:** The package is a usable binding for performing layout from JavaScript, not a mirror of every Rust implementation and extension mechanism. Limiting the surface to Taffy's own high-level usage keeps the binding direct while avoiding APIs whose Rust abstraction and cost model do not carry across Node-API.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly confirmed that @taffyjs/node should resemble yoga-layout in binding the usable layout API rather than mapping every Rust detail, and approved this interpretation as a project decision.

### Binding design principles

[VOUCHED @hyfdev 2026-08-10]

**Ruling:** The binding must preserve Taffy's high-level Rust semantics and capabilities without mechanically copying Rust syntax; Rust and Taffy must remain the only source of tree, style, layout, and computation state, while JavaScript may keep private identity and validation metadata that does not mirror that state; implicit costs such as deep copies, object conversion, callbacks across the language boundary, and per-node calls must be treated deliberately; the direct baseline API must remain available when additive batch or higher-performance APIs are introduced; ownership, node validity, cross-tree misuse, and error behavior must be explicit; and Yoga compatibility, reactive objects, and other higher-level designs must live in @taffyjs/node-yoga or another package above @taffyjs/node.

**Limits:** Binding metadata may identify the tree that issued a NodeId, associate a current Taffy NodeId with a binding-issued serial, and reject stale or foreign NodeIds. It must not become an authoritative JavaScript copy of parent, children, Style, Layout, cache, or other Taffy state. These principles do not otherwise decide the concrete JavaScript API, names, value representations, callback interface, batching shape, or which optimizations are worthwhile. They also do not require eliminating unavoidable Node-API conversion costs. Those choices must be evaluated from the Rust model, napi-rs's available representations, and measured consumer needs.

**Why:** @taffyjs/node is the direct foundation for other JavaScript APIs. Its state ownership, costs, and failure boundaries therefore need to remain visible and predictable, while optional convenience and performance paths must not make the direct binding unavailable.

**Source:** Yunfei (`@hyfdev`), 2026-08-09 and 2026-08-10; explicitly approved these binding principles before concrete API design and later approved a private JavaScript NodeId registry while keeping Taffy's actual tree and layout state native.

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

### Direct layout-state behavior

[VOUCHED @hyfdev 2026-08-09]

**Ruling:** The baseline JavaScript API must preserve Taffy's explicit computation and stored-layout behavior: reading layout returns the value currently stored by Taffy, including zero values before the first computation and previous results after inputs change; changing style or tree state must not compute layout automatically; returned Layout values must be owned snapshots rather than live views into the tree; and, if Taffy's dirty-state query is exposed, it must retain Taffy's cache-state meaning without being presented as a guarantee that a node's stored layout is current. APIs that compute automatically or otherwise guarantee a current result may be added only as optional sugar.

**Limits:** This ruling does not decide whether the dirty-state query belongs in the public API, the names of any methods, the shape of Layout values, or whether TypeScript marks snapshots readonly. Runtime sealing or freezing is an open representation and cost choice, not part of this decision. Failure-state layout validity and batch layout reads also remain open.

**Why:** @taffyjs/node is the direct Taffy binding and must not add automatic work or reinterpret Taffy's state by default. Yunfei explicitly accepted Taffy's zero-before-compute, old-value-until-recompute, borrowed-to-owned-copy, and cache-state semantics, while allowing separate sugar APIs when useful.

**Source:** Yunfei (`@hyfdev`), 2026-08-09; explicitly vouched the conclusions from the first four outer-layer mapping experiments.

### Direct layout-computation signatures

[VOUCHED @hyfdev 2026-08-10]

**Ruling:** The direct API must expose separate `computeLayout(options)` and `computeLayoutWithMeasure(options)` methods that preserve Taffy's `compute_layout` and `compute_layout_with_measure` semantics, use named option objects for their Rust-equivalent inputs, return `void` on success and throw controlled JavaScript errors on failure; the synchronous measure function must receive one owned readonly object containing `knownDimensions`, `availableSpace`, `node`, `context`, and `style`, and return a width-and-height size object. The selected TypeScript shape is recorded in [Taffy-to-Node binding mapping](binding-mapping.md#selected-layout-computation-signatures).

**Limits:** This decision fixes the two baseline methods, their named-object structure, and their direct semantic correspondence to Taffy. It does not yet fix the concrete `AvailableSpace` or full Style representation, runtime freeze or seal behavior, numeric validation policy, whether a callback may replace context, callback-exception containment, or the native tree's reusable state after callback failure. `TaffyTree<TContext>` is a TypeScript-only context type and does not make Rust aware of the JavaScript value. A measured need may add a positional, batch, retained-callback, or other performance or convenience API, but it must not replace or silently change this direct path.

**Why:** These signatures retain the capabilities and explicit computation model of Taffy's two high-level methods. Named objects make the outer inputs and the five callback values harder to reorder or misread without adding automatic computation, tree access inside measurement, or another layout abstraction. Rust borrows become owned JavaScript boundary values, and Rust `Result<(), TaffyError>` becomes JavaScript's ordinary `void`-or-throw convention.

**Source:** Yunfei (`@hyfdev`), 2026-08-10; explicitly accepted the proposed `computeLayout` and `computeLayoutWithMeasure` TypeScript signatures as the direct Rust API mapping with named-object JavaScript ergonomics and asked that they be vouched.

### Value-based NodeId identity

[VOUCHED @hyfdev 2026-08-10]

**Ruling:** @taffyjs/node must expose node identity as an opaque-encoded JavaScript bigint named NodeId with a private TypeScript phantom marker named `phantomMarker` rather than as Taffy's raw `u64` or a JavaScript object. The value must combine enough private binding information to identify the issuing tree, the binding-issued identity of that node creation, and the corresponding raw Taffy NodeId. Repeated retrieval of the same current node must return the same bigint value, so `===`, `Map`, `Set`, and `includes` work without a native call. Each public TaffyTree wrapper must store its private native tree in `#inner` and use a private JavaScript current-node registry to check the bigint's form, tree identity, current binding-issued identity, and raw Taffy NodeId in expected constant time before synchronously calling native code. Each tree must generate an independent, cryptographically secure tree token of at least 128 bits; tree construction must fail if secure generation fails rather than falling back to a module-local counter. A NodeId is valid only for the exact TaffyTree that issued it and is not a persistent or transferable identity across workers or separately evaluated or installed package copies. This JavaScript registry is the sole NodeId-validity registry for the supported API; the initial native layer must not duplicate it or repeat the same owner and liveness check.

**Limits:** The TypeScript phantom marker only helps type checking; JavaScript can still construct arbitrary bigints, so every supported operation must perform the private runtime check. The exact bit layout, field widths, serial allocation, and error classes remain implementation choices, but the encoding must not expose the raw Taffy NodeId as the complete public identity or allow an old NodeId to become valid for a later node when Taffy reuses internal storage. The random tree token provides collision resistance rather than mathematical uniqueness; unsupported transfer does not gain persistence or interoperability semantics, but a target tree should reject a copied or foreign value through its ordinary runtime check. Removing a node deletes its registry entry, clearing a tree clears the registry, and collecting the tree collects the registry. Merely dropping a JavaScript NodeId does not remove its Taffy node or registry entry; explicit `remove`, `clear`, or collection of the whole tree owns that lifetime. A NodeId is a primitive and does not keep its tree alive. The validity guarantee applies to @taffyjs/node, not direct platform-package calls. The tree must not change between the wrapper's final registry check and the native operation obtaining access to that tree; an implementation that cannot guarantee this must reopen the JS-only validation part of this ruling.

**Why:** JavaScript's built-in collections and strict equality can compare bigint values directly, while object-based node handles would require canonical object retention or a separate comparison API. Common tree operations need returned parents and children to work naturally in `Map`, `Set`, and `includes` without crossing the JavaScript-to-native boundary just to compare identity. The tree identity prevents cross-tree confusion, and the binding-issued identity ensures that reuse of a Taffy internal ID does not revive an old JavaScript NodeId. Keeping this check in the public JavaScript wrapper avoids a duplicate native registry while preserving controlled errors on every supported path.

**Source:** Yunfei (`@hyfdev`), 2026-08-10; explicitly replaced the earlier External design after identifying ordinary `Map`, `Set`, `includes`, and `===` usage as a core requirement, chose a private composite bigint NodeId with JavaScript-side constant-time validation, required internal Taffy ID reuse not to change JavaScript identity guarantees, approved JS-only validation for the supported @taffyjs/node API, vouched the resulting first-case model and soundness conditions, named the TypeScript marker `phantomMarker`, named the wrapper's private native field `#inner`, and approved an at-least-128-bit secure random per-tree token with tree-local, nonpersistent, and nontransferable NodeId semantics.

### Initial JavaScript data caching

[VOUCHED @hyfdev 2026-08-10]

**Ruling:** The initial @taffyjs/node implementation must not add JavaScript caches for Style, Layout, parent, children, or other Taffy-owned data. The private NodeId registry is required identity metadata, not a data cache.

**Limits:** This does not prohibit a later JavaScript cache. This decision does not choose that cache's representation, population, invalidation, lifetime, or acceptance evidence; those require a separate design decision before adoption.

**Why:** Node identity needs local JavaScript value semantics now, while caching Taffy data is a separable optimization with additional invalidation obligations and no current evidence that it is needed.

**Source:** Yunfei (`@hyfdev`), 2026-08-10; explicitly separated node identity from possible JavaScript data caching and chose not to implement the cache initially.

### JavaScript-owned node-context values

[VOUCHED @hyfdev 2026-08-10]

**Ruling:** Arbitrary JavaScript node-context values must remain entirely in JavaScript. Rust and the native binding must not inspect, convert, retain, or otherwise become aware of those values. The native tree must use `TaffyTree<()>`: `Some(())` records only that a node has context, while the public wrapper owns the authoritative JavaScript value in a registry keyed by the current public NodeId. During measurement, the native dispatcher must use the raw NodeId already supplied by Taffy to reconstruct the public NodeId, and the JavaScript dispatcher must use that value to look up the context. No binding-local context ID or custom `NodeContext` struct is needed.

**Limits:** This ruling does not decide the public context method names or whether a measure callback may replace context. A JavaScript context registry is authoritative user-supplied data rather than a cache or shadow copy of Taffy's Style, Layout, topology, or computation state. Context insertion, replacement, removal, node removal, and tree clearing must still keep the JavaScript registry and Taffy's `Some(())` presence marker and dirty state logically consistent. Native `UnknownRef` or equivalent retention of the actual JavaScript value is outside this ruling. A native lookup key may be reconsidered only if a later measured or semantic need cannot be met by the existing public NodeId identity.

**Why:** Rust must not perceive or own the JavaScript context value. `TaffyTree<()>` is sufficient to preserve whether context is present, while Taffy's raw NodeId and the existing NodeId registry are sufficient to find the JavaScript value during measurement. Another native context identifier would duplicate existing identity without enabling a new behavior.

**Source:** Yunfei (`@hyfdev`), 2026-08-10; explicitly required Rust to have no awareness of the existence or representation of JavaScript-side context values, then vouched `TaffyTree<()>` with NodeId-based JavaScript lookup and no additional context identifier.

### Undefined node-context semantics

[VOUCHED @hyfdev 2026-08-10]

**Ruling:** At the JavaScript boundary, `undefined` must mean that a node has no context and must not be preserved as a distinct present context value; creating or setting context to `undefined` must omit or clear the JavaScript registry entry and Taffy's `Some(())` presence marker, while context reads and measure inputs must return `undefined` for absence. `null` and other JavaScript values remain present context values.

**Limits:** This decision governs presence only. It does not choose the public context method names, whether callback code may replace a context value, the dirtying contract for in-place mutation of a context object, or whether a convenience `hasNodeContext` query is useful. Applications that need an explicit third state may store `null`, a symbol, or an object sentinel as the context value.

**Why:** Taffy invokes the measure function whether node context is present or absent; its presence marker only determines whether the callback receives `Some(context)` or `None`. A present JavaScript `undefined` would therefore add no measurement capability unless the entire API also carried a separate presence flag. Treating `undefined` as absence keeps `context: TContext | undefined` direct and lets applications represent a meaningful extra state explicitly when needed.

**Source:** Yunfei (`@hyfdev`), 2026-08-10; concluded that the binding does not need to distinguish missing context from a context value of `undefined`, accepted `undefined` as absence and `null` as an ordinary context value, and explicitly asked that this behavior be vouched.

### Synchronous measurement re-entry

[VOUCHED @hyfdev 2026-08-10]

**Ruling:** A JavaScript measure callback's type must expose only the owned measurement inputs that the callback is allowed to use, and its API documentation must state that native operations on the same TaffyTree are unavailable until the callback returns. If a callback captures that tree and synchronously attempts another native operation, a call that reaches the native access check must throw an ordinary JavaScript `Error` with the stable code `ERR_TAFFY_TREE_BUSY`; it must not silently do nothing or return `undefined`. Its diagnostic message must identify the attempted operation and explain that the same tree cannot be accessed while it is computing layout from a measure callback. The private native class must store `TaffyTree<()>` and any future native state governed by the same access rule behind one `RefCell`, expose shared `&self` napi-rs receivers, and use `try_borrow` or `try_borrow_mut` for every operation instead of relying on napi-rs to protect `&mut self` re-entry. The failed checked borrow must become the controlled JavaScript error rather than a panic. No duplicate JavaScript busy flag is required.

**Limits:** This restriction covers operations that read or mutate the same native tree, including layout reads, style and topology changes, removal, and nested layout computation. NodeId value comparison and use in JavaScript collections do not access the native tree, and a different TaffyTree has independent borrow state and remains usable. JavaScript evaluates argument expressions before entering a method, and wrapper validation or conversion may reject malformed input before the call reaches the native checked borrow; this decision does not add a JavaScript busy precheck or give the re-entry error priority over those earlier failures. This ruling does not decide retained versus per-compute callbacks beyond the selected direct method, callback-result validation, how an exception thrown by the measure callback itself stops an infallible Taffy measure closure, or the native tree's reusable state after such callback failure. A public state getter, `asMutTree`-style access object, or nonthrowing try-access API is not part of the baseline; a later concrete use case may propose one additively without weakening the checked native boundary.

**Why:** Taffy holds exclusive access to its tree throughout `compute_layout_with_measure`, while JavaScript closures can capture the public wrapper and attempt same-tree re-entry. Type declarations and documentation make the intended callback boundary visible but cannot enforce Rust-style borrowing across JavaScript aliases. A single native `RefCell` preserves Rust's access invariant on every actual native entry without duplicating state in JavaScript. Rejecting the invalid call preserves Taffy's semantics. Returning `undefined` from a value-returning method would violate its TypeScript contract, while silently ignoring a void mutation would let layout continue after the caller incorrectly assumes that mutation succeeded; queuing the mutation would instead make the completed layout immediately stale. `ERR_TAFFY_TREE_BUSY` describes the user-visible temporary state without exposing Rust borrowing or re-entry terminology, follows Node.js's stable `error.code` convention, and distinguishes this programming error from unrelated invalid tree states.

**Source:** Yunfei (`@hyfdev`), 2026-08-10; explicitly vouched the restricted callback type, documented same-tree unavailability, controlled synchronous re-entry error rather than silent no-op behavior, native `RefCell` implementation direction, and the `ERR_TAFFY_TREE_BUSY` spelling. The selected code follows Node.js's documented [`error.code` stability convention](https://nodejs.org/api/errors.html#errorcode) and subsystem-specific `ERR_*` naming.

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

[VOUCHED @hyfdev 2026-08-10]

**Ruling:** @taffyjs/node must use napi-rs's maintained root-loader distribution model with optional @taffyjs/binding-<platform> packages and must not introduce a generic intermediate binding package or an additional custom loader build without a concrete need.

**Limits:** This ruling does not freeze the target matrix, package versions, release automation, or support policy. The platform packages are implementation dependencies loaded by @taffyjs/node, not supported direct-use APIs, even though npm installation makes them importable. It also does not prevent an authored JavaScript public entry inside @taffyjs/node, packages above it, or a future browser or WASI design. Evidence that the generated loader cannot support a required runtime or package boundary would reopen the custom-loader part of the ruling.

**Why:** The generated root loader plus one optional package per platform is napi-rs's current maintained release model. It already gives @taffyjs/node the required package boundary; another binding package or loader build would add machinery for requirements that TaffyJS does not currently have.

**Source:** Yunfei (`@hyfdev`), 2026-08-09 and 2026-08-10; accepted the current model if it remained the official napi-rs recommendation, preferred avoiding an additional custom packaging layer without a concrete need, and explicitly excluded direct platform-package use from @taffyjs/node's API and safety contract. The maintained model is described in napi-rs's [native package release documentation](https://napi.rs/docs/deep-dive/release).

## Open

### Selective query implementation details

Repository-wide generator ownership, normalization, emitter, output, command, and verification boundaries are decided in [API code generation](api-codegen.md). The canonical public-shape representation, concrete generated declaration structure, private dispatch shape, exact malformed-call error classes, supported index range, batch size limits, and performance acceptance thresholds remain open within those boundaries. The public method names, selector spelling, overload behavior, and required TypeScript inference are decided. The settled public boundary and query-specific generation guidance are recorded in [Selective query design notes](query-api-design.md) and [API query code generation](api-codegen-query.md).
