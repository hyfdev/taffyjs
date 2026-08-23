# Taffy-to-Node Binding Mapping

This is the current reference for Rust/JavaScript conversion and safety in `@taffyjs/node`. It describes the implemented Taffy boundary. Product choices that should constrain future work are recorded in [@taffyjs/node decisions](taffyjs-node-decisions.md).

Recheck version-sensitive behavior whenever Taffy, napi-rs, Node.js, or TypeScript changes. The primary upstream references are [TaffyTree](https://github.com/DioxusLabs/taffy/blob/55cda62a5df9a5d04c0023be6f6dd607b1474fe9/src/tree/taffy_tree.rs), [Style](https://github.com/DioxusLabs/taffy/blob/55cda62a5df9a5d04c0023be6f6dd607b1474fe9/src/style/mod.rs), [geometry](https://github.com/DioxusLabs/taffy/blob/55cda62a5df9a5d04c0023be6f6dd607b1474fe9/src/geometry.rs), and [napi-rs conversions](https://napi.rs/docs/concepts/type-conversions).

## Scope and ownership

`@taffyjs/node` exposes Taffy's high-level `TaffyTree` workflow: create nodes, mutate topology and style, attach JavaScript context, compute layout, and read stored results. Low-level custom-tree traits, cache internals, CSS parsing, Yoga compatibility, and Rust implementation helpers are outside this package.

Taffy remains the only owner of topology, Style, Layout, cache, and computation state. The authored JavaScript wrapper owns only data that Taffy cannot retain safely for JavaScript: arbitrary JavaScript context values and per-node JavaScript measure functions. There is no JavaScript shadow tree, NodeId registry, or cache of Taffy-owned data.

The napi-rs class and generated loader are private implementation modules. `packages/taffyjs-node/src/binding.ts` is the only maintained TypeScript file that imports the generated loader; the wrapper and private native tests use that entry. Public consumers import only `@taffyjs/node`; direct platform-package access bypasses the wrapper's guarantees.

## Public and native calls

The public `TaffyTree<TContext>` is implemented in TypeScript and owns one private native tree. Public methods validate representability and wrapper-owned callback or context state, then synchronously call a small raw native operation. Public method names are not sent through Node-API; the native busy diagnostic is selected inside each Rust method.

Layout remains explicit. `getLayout` and `getUnroundedLayout` return what Taffy currently stores, including zero before the first compute and an older value after a mutation. Only `computeLayout` performs layout work; its options may include a call-scoped global measurement fallback.

## NodeId

`NodeId` is an opaque TypeScript-branded `bigint` whose runtime value is exactly Taffy's raw `u64` NodeId. The TypeScript marker prevents accidental mixing with general bigints in checked code but has no runtime representation. The wrapper checks only that a consumed value is a bigint within the `u64` range; the native boundary repeats the lossless conversion check.

Taffy's raw NodeId is the `u64` representation of its SlotMap key. SlotMap normally changes the key generation when a removed slot is reused, so a replacement receives a different raw value without wrapper bookkeeping. Repeated reads of the same live node return the same bigint, so `===`, `Map`, `Set`, and `includes` work normally within one tree.

The wrapper and native layer maintain no owner, serial, or liveness table. A live NodeId from the receiving tree is a caller precondition. Independent trees can issue equal values; using one tree's value with another can operate on a numerically matching target-tree node. Forged, foreign, and stale in-range keys are unsupported and receive no stable classification.

The pinned Taffy revision directly indexes its SlotMaps in several high-level methods, so a non-live in-range key can panic instead of returning `TaffyError`. Every native tree operation runs inside `TreeOwner::access`, whose unwind boundary converts an unexpected panic to an internal failure and poisons that tree before it can be used again. This preserves native process safety without recreating a node registry; it does not make the invalid call supported. A copied bigint is not a transferable native tree handle across workers or separate package instances.

## Input conversion

Public inputs use readable JavaScript values. Ordinary records and tagged unions remain the complete forms, while direct numbers are additive shorthand for an absolute length or definite available space. The binding does not expose a private buffer format, packed Rust representation, raw pointer, or calc handle.

The public input and output representations do not constrain the private representation passed from JavaScript to Rust. That private representation may change without changing public behavior, but any performance-driven change still requires the evidence described below.

Ordinary input objects are read through normal JavaScript property access. Accessors and Proxies are caller-controlled behavior and do not receive a second defensive object model. Conversion must still finish before the corresponding tree mutation begins.

### Style and geometry

`StyleInput` is a partial object used to construct one complete Rust `Style`. A missing field or explicit `undefined` uses `Style::DEFAULT`. `null` maps to `None` only for `aspectRatio`, the six nullable alignment fields, and `gridTemplateAreas`; other fields reject it. `setStyle` replaces the complete Style rather than merging with the old value.

`StyleUpdate` has the same structural field types but different presence semantics. `updateStyle` preserves a missing or explicit-`undefined` field, and a partial `Point`, `Size`, `Rect`, or `Line` preserves each missing component. Supplied arrays, tagged unions, and other complete records replace their stored values as a whole; an empty array clears the collection, and accepted `null` still maps to `None`. This is not a recursive `Partial` operation.

The outer Style object ignores unknown properties and reads each known property once without enumeration. Style geometry fields use partial named records; missing components use the matching enclosing Style default during construction or replacement and preserve the matching stored component during update. Unknown geometry components are rejected. Complete inputs such as layout available space and a measure result require every component.

Named geometry uses `x/y`, `width/height`, `left/right/top/bottom`, or `start/end`. Input records are mutable in TypeScript. Homogeneous semantic-length `Size` and `Rect` Style fields also accept one contained value and expand it to every component for both replacement and update.

All five Style-taking public methods use the generated Style codec. The shared TypeScript wrapper encodes the supplied Style exactly once and makes one private call with a `Uint8Array`; Native borrows that view and WASI copies only those bytes into Wasm memory. Creation and `setStyle` decode into a local default Style. `updateStyle` resolves the NodeId first, clones the stored Style once, applies and compares present values directly through generated `decode_into`, validates the candidate, and calls `set_style` only if a value changed. The local candidate is dropped on any error, so decoding cannot partially mutate the tree. [Compact Style codec](style-codec.md) records the wire and buffer rules.

### Numbers and closed families

JavaScript floating-point input must be a `number`. The binding converts `f64` to Taffy's `f32` with normal Rust cast behavior and returns the stored `f32` widened to a JavaScript number. Negative values, `NaN`, infinities, and finite overflow are passed through unless a concrete shape is known to panic or violate native safety.

Indices and Rust integer payloads must be finite exact integers in their public range. Allocation arithmetic and child ranges are checked before use.

`usize` remains Taffy's internal collection-index type rather than a public-width promise. Public child indices and range endpoints are first validated as non-negative JavaScript safe integers and represented as `u64` on every target. The binding compares them with the actual collection length before converting a proven-in-bounds value to `usize`. An impossible large index therefore receives the same public bounds error on x64 Node and wasm32 instead of exposing the host width at a conversion step.

Fieldless families such as `Display`, `Overflow`, and `AlignItems` use stable numeric literal members exposed through frozen PascalCase objects. Public code should use the names, while an exact valid raw code remains accepted. Rust conversion checks exact family membership and does not derive codes from Rust declaration order.

### Lengths, available space, and other tagged values

Length inputs accept a direct number as shorthand for an absolute length. The complete tagged form remains supported through values such as `Dimension.Length(20)`, `Dimension.Percent(50)`, and `Dimension.Auto`, and tagged length outputs remain valid later inputs. Percent helpers use user-facing percentages, so `50` maps to Taffy's `0.5`. CSS strings are not length values.

Available-space inputs accept a direct number as shorthand for `Definite`. The complete forms remain supported through `AvailableSpace.Definite(value)`, `AvailableSpace.MinContent`, and `AvailableSpace.MaxContent`, and tagged available-space outputs remain valid later inputs. Every JavaScript number, including negative values, `NaN`, and infinities, retains the existing definite-value conversion behavior; no number is reserved for a special variant.

Maintained examples and ordinary behavior tests use these numeric shorthands by default. Focused tests and explanations retain the complete forms where those forms are the subject. Public JSDoc names the corresponding `Dimension.Length(value)` or `AvailableSpace.Definite(value)` form whenever it documents a numeric shorthand.

The accepted implementation makes these mappings part of the repository generator contract. Generated TypeScript declarations, JSDoc, and complete-form helpers share one tagged-input model. Available-space values still converge in generated Rust boundary parsing; Style length values converge in the generated Style encoder and compact Rust decoder without allocating replacement tagged objects. Taffy-specific percentage scaling and constructors remain in the handwritten codec primitives. [API code generation](api-codegen.md#generated-tagged-inputs) records the boundary in detail.

Other values that carry data, including Grid placement, track sizing, repetition counts, and template components, use ordinary records with numeric discriminators. A branch requires its own payload fields; unrelated structural properties do not become part of complete output.

Grid integers use checked `i16` or `u16` conversion, strings remain ordinary identifiers rather than a CSS grammar, and nested collections are copied completely before mutation. The binding enforces Taffy's line-name count contract for Grid repetitions but otherwise leaves safely representable Grid semantics to Taffy.

### napi-rs types and remaining `Unknown`

Non-Style scalar and fixed-object inputs use concrete napi-rs types where their boundary is already small. Local `#[napi(object)]` bridges copy fields and then convert to Taffy types; TypeScript generics describe shared shapes but do not create generic native converters.

`Unknown` remains only where a non-Style JavaScript shape is genuinely dynamic: available-space tagged input, callback return conversion, and arbitrary JavaScript thrown values. Style tagged unions, collections, and partial geometry are validated by the authored TypeScript codec primitives and revalidated structurally by the borrowed Rust decoder; they no longer use napi-rs rich-object conversion.

## Output conversion

Borrowed Rust values never escape. Direct Style reads, Layout, child arrays, detailed Grid data, available space, and nested records are copied into complete detached JavaScript values. A measure callback's Style is first cloned into an owned Rust snapshot and is converted into a complete detached JavaScript value only when its `getStyle()` function is called.

Binding-produced records and arrays are recursively readonly in TypeScript because mutation cannot update Taffy. Runtime objects remain ordinary mutable, unfrozen objects, and each read or callback `getStyle()` call returns an independent snapshot. There are no live native views, output caches, lazy properties, selectors, prepared queries, or batch snapshots; the callback function is an explicit on-demand operation rather than a property that hides an already materialized object.

Public TypeScript declarations and JSDoc live in `packages/taffyjs-node/src` and are emitted by `vp pack` into `index.d.ts`. The private native declarations remain napi-rs-generated.

## Context and measurement

Arbitrary context and per-node measure functions stay in separate JavaScript maps keyed by current public NodeId. Native `TaffyTree<NodeMetadata>` stores only independent `hasContext` and `hasMeasure` booleans in its context storage; it never retains a Node-API function, callback slot, or JavaScript value. `undefined` means no context or no per-node measure at the corresponding setter, while `null` remains an ordinary context value when allowed by `TContext`. Removing or clearing nodes releases the corresponding JavaScript references and makes their native metadata unreachable.

`setNodeContext` and `setMeasure` update native metadata first and commit their JavaScript map only after native success, so a busy-tree or other native error cannot split the two representations. Both preserve the other flag. Every setter call marks the node dirty, including replacing context or a measure with the same JavaScript identity and clearing a measure. In-place context changes and callback-captured data cannot be observed automatically; callers use `markDirty` when those changes affect later measurement. Adding, removing, or changing a call-scoped global fallback or its captured data does not invalidate Taffy's cache by itself; callers must dirty every potentially affected leaf because `markDirty(root)` does not clear descendants.

`computeLayout` calls the direct native unmeasured entry while no per-node measure exists anywhere in the wrapper map and the call has no global fallback. Once either source exists, it uses native measured layout, but without a global fallback the Rust closure checks the current leaf's `hasMeasure` marker before writing the constraint record, cloning a Style snapshot, constructing a `getStyle` provider, or entering Node-API or WASI. An unmarked leaf therefore follows the same native zero-intrinsic fallback as Taffy's ordinary compute when no global fallback exists, even when another node in the tree is measured; no selected-root topology mirror is maintained.

`computeLayout` accepts an optional call-scoped callback as a global fallback. Dispatch priority is the node's per-node measure, then this global fallback, then ordinary native leaf sizing. Existing callers that configure no per-node measures therefore keep the previous all-eligible-leaves behavior. Both callback sources use the same public `MeasureFunction<TContext>` and synchronous argument and result contract.

A selected measure callback runs synchronously and receives owned `knownDimensions`, `availableSpace`, public NodeId, the original JavaScript context, and `getStyle()`. Calling `getStyle()` returns a fresh complete normalized detached Style snapshot; not calling it performs no `style::output` conversion and creates no JavaScript Style object. Taffy controls the requested nodes, constraints, and ordering, subject to the exact-repeat reuse below. The callback must return a complete `{ width, height }` number record; Promises, missing axes, and invalid values throw `TypeError`.

The tree is busy while the callback runs, so `getStyle()` does not re-enter `TaffyTree::style`. On the first admitted callback request for a node in one compute, `MeasureSession` clones the borrowed Rust Style into an owned snapshot and creates one native function that captures it. Later requests for that node reuse the same function. The native reference is released when the compute returns, while JavaScript retention keeps the function and its captured snapshot alive until ordinary garbage collection. Every call converts the owned snapshot again, so mutating one returned object cannot change the tree or a later result. A new compute creates a new provider from the Style visible at that compute, including completed prior updates. This safe lifetime costs one Rust Style clone and one provider per callback-reached node per compute; it deliberately avoids callback-scoped pointers or borrows.

The native owner uses checked `RefCell` access. A native-backed call on the same tree during measurement throws `ERR_TAFFY_TREE_BUSY`; JavaScript-only value operations and another tree remain usable.

On the first callback throw or invalid result, the bridge retains that failure, stops further JavaScript callbacks, lets Taffy's infallible stack finish with internal zero sizes, invalidates the requested subtree, and throws synchronously. A thrown JavaScript value keeps its identity. The tree remains usable, but already completed JavaScript side effects and stored Layout work are not rolled back.

Each native measured `computeLayout` creates one Rust `MeasureSession` that reuses a successful result when Taffy repeats the exact same request during that compute. The key contains the raw NodeId, both optional known dimensions, and both available-space variants and definite values; every `f32` uses its exact bit representation. The per-node/global selection occurs inside the one JavaScript dispatcher after Rust has admitted the node, while node identity in the key prevents results for different callbacks from combining. Cache lookup happens before writing the constraint record or creating a Style provider, and callback throws or binding conversion failures are never stored. The session, exact-result cache, and native provider references are dropped when the compute returns, so caller-managed dirtying and Taffy's persistent cache semantics remain unchanged across computes.

## Mutation, errors, and panic containment

Validate complete input, every involved NodeId's bigint/`u64` representation, topology, index, and range before the first ordinary mutation. Failed single-value and collection mutations must not leave partial wrapper or native state. Measured computation is the documented exception because callback failure happens after computation has started.

Shape failures use `TypeError`, numeric range failures use `RangeError`, and ordinary Taffy operation failures use `Error`. The documented topology, child-index, and busy codes are part of the public contract; exact prose is not.

Known JavaScript-controlled panic paths are prevented before Taffy. On native targets, the Rust owner catches unexpected panics as a final boundary and prevents later access to a possibly inconsistent tree; panic handling is not normal error control flow. `wasm32-wasip1` is compiled with aborting panics, so `@taffyjs/wasm` does not promise that this final unexpected-panic containment is recoverable. Expected validation and callback errors are still controlled before any abort path and are tested to leave the tree reusable.

## Changes and optimization

When dependencies change, diff the high-level Taffy methods and all transitive value types, recheck napi-rs conversion and callback behavior, re-audit every panic and lifetime boundary, rebuild public declarations from source, and update JavaScript integration tests with the converters.

Do not change the public API or private JavaScript-to-Rust representation for assumed speed. The two representations are separate decisions, and the only active performance work is listed in [API alignment TODOs](api-alignment-todos.md) and requires a real consumer workload plus retained end-to-end measurements.
