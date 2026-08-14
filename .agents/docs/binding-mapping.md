# Taffy-to-Node Binding Mapping

This is the current reference for Rust/JavaScript conversion and safety in `@taffyjs/node`. It describes the implemented Taffy 0.13 boundary. Product choices that should constrain future work are recorded in [@taffyjs/node decisions](taffyjs-node-decisions.md).

Recheck version-sensitive behavior whenever Taffy, napi-rs, Node.js, or TypeScript changes. The primary upstream references are [TaffyTree](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/taffy_tree.rs), [Style](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/style/mod.rs), [geometry](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/geometry.rs), and [napi-rs conversions](https://napi.rs/docs/concepts/type-conversions).

## Scope and ownership

`@taffyjs/node` exposes Taffy's high-level `TaffyTree` workflow: create nodes, mutate topology and style, attach JavaScript context, compute layout, and read stored results. Low-level custom-tree traits, cache internals, CSS parsing, Yoga compatibility, and Rust implementation helpers are outside this package.

Taffy remains the only owner of topology, Style, Layout, cache, and computation state. The authored JavaScript wrapper owns only data that Taffy cannot represent safely for JavaScript: public NodeId validity metadata and arbitrary JavaScript context values. There is no JavaScript shadow tree or cache of Taffy-owned data.

The napi-rs class and generated loader are private implementation modules. `packages/taffyjs-node/src/binding.ts` is the only maintained TypeScript file that imports the generated loader; the wrapper and private native tests use that entry. Public consumers import only `@taffyjs/node`; direct platform-package access bypasses the wrapper's guarantees.

## Public and native calls

The public `TaffyTree<TContext>` is implemented in TypeScript and owns one private native tree. Public methods validate wrapper-owned state, then synchronously call a small raw native operation. Public method names are not sent through Node-API; the native busy diagnostic is selected inside each Rust method.

Layout remains explicit. `getLayout` and `getUnroundedLayout` return what Taffy currently stores, including zero before the first compute and an older value after a mutation. Only `computeLayout` or `computeLayoutWithMeasure` performs layout work.

## NodeId

`NodeId` is an opaque TypeScript-branded `bigint`. Its private encoding contains a per-tree random token, a binding-issued creation serial, and Taffy's raw NodeId. The bit layout is not a persistence or arithmetic format.

Each public tree keeps one `raw NodeId -> current serial` map. Every consumed ID must be a well-formed bigint, belong to that tree, and match the current serial. Removal deletes its entry; clear deletes all entries; reuse of a native slot receives a new serial. Repeated reads of the same live node recreate the same bigint, so `===`, `Map`, `Set`, and `includes` work normally.

NodeId arrays are fully checked before native mutation. The native layer trusts the supported wrapper path and does not maintain a second owner or serial table.

Malformed, foreign, and stale IDs use `ERR_TAFFY_INVALID_NODE_ID`, `ERR_TAFFY_FOREIGN_NODE_ID`, and `ERR_TAFFY_STALE_NODE_ID`. A copied bigint is not transferable with its tree across workers or separate package instances.

## Input conversion

Public inputs use readable JavaScript values. Ordinary records and tagged unions remain the complete forms, while direct numbers are additive shorthand for an absolute length or definite available space. The binding does not expose a private buffer format, packed Rust representation, raw pointer, or calc handle.

The public input and output representations do not constrain the private representation passed from JavaScript to Rust. That private representation may change without changing public behavior, but any performance-driven change still requires the evidence described below.

The direct-number shorthand described here is accepted direction but is not implemented yet; [API alignment TODOs](api-alignment-todos.md#public-input-alignment) tracks that code change. The complete tagged forms describe both current behavior and the form that remains supported afterward.

Ordinary input objects are read through normal JavaScript property access. Accessors and Proxies are caller-controlled behavior and do not receive a second defensive object model. Conversion must still finish before the corresponding tree mutation begins.

### Style and geometry

`StyleInput` is a partial object used to construct one complete Rust `Style`. A missing field or explicit `undefined` uses `Style::DEFAULT`. `null` maps to `None` only for `aspectRatio`, the six nullable alignment fields, and `gridTemplateAreas`; other fields reject it. `setStyle` replaces the complete Style rather than merging with the old value.

The outer Style object rejects unknown enumerable string fields. Style geometry fields use partial named records; missing components use the matching component of the enclosing Style default, and unknown components are rejected. Complete inputs such as layout available space and a measure result require every component.

Named geometry uses `x/y`, `width/height`, `left/right/top/bottom`, or `start/end`. Input records are mutable in TypeScript. Homogeneous semantic-length `Size` and `Rect` Style fields also accept one contained value and expand it to every component.

### Numbers and closed families

JavaScript floating-point input must be a `number`. The binding converts `f64` to Taffy's `f32` with normal Rust cast behavior and returns the stored `f32` widened to a JavaScript number. Negative values, `NaN`, infinities, and finite overflow are passed through unless a concrete shape is known to panic or violate native safety.

Indices and Rust integer payloads must be finite exact integers in the target range. Allocation arithmetic and child ranges are checked before use.

Fieldless families such as `Display`, `Overflow`, and `AlignItems` use stable numeric literal members exposed through frozen PascalCase objects. Public code should use the names, while an exact valid raw code remains accepted. Rust conversion checks exact family membership and does not derive codes from Rust declaration order.

### Lengths, available space, and other tagged values

Length inputs accept a direct number as shorthand for an absolute length. The complete tagged form remains supported through values such as `Dimension.Length(20)`, `Dimension.Percent(50)`, and `Dimension.Auto`, and tagged length outputs remain valid later inputs. Percent helpers use user-facing percentages, so `50` maps to Taffy's `0.5`. CSS strings are not length values.

Available-space inputs accept a direct number as shorthand for `Definite`. The complete forms remain supported through `AvailableSpace.Definite(value)`, `AvailableSpace.MinContent`, and `AvailableSpace.MaxContent`, and tagged available-space outputs remain valid later inputs. Every JavaScript number, including negative values, `NaN`, and infinities, retains the existing definite-value conversion behavior; no number is reserved for a special variant.

Other values that carry data, including Grid placement, track sizing, repetition counts, and template components, use ordinary records with numeric discriminators. A branch requires its own payload fields; unrelated structural properties do not become part of complete output.

Grid integers use checked `i16` or `u16` conversion, strings remain ordinary identifiers rather than a CSS grammar, and nested collections are copied completely before mutation. The binding prevents the known Taffy 0.13 named-line underflow shape but otherwise leaves safely representable Grid semantics to Taffy.

### napi-rs types and remaining `Unknown`

Simple scalar and fixed-object fields use concrete napi-rs types. Local `#[napi(object)]` bridges copy fields and then convert to Taffy types; TypeScript generics describe shared shapes but do not create generic native converters.

`Unknown` remains only where JavaScript shape is genuinely dynamic: tagged unions, containers whose elements are tagged values, callback return conversion, and arbitrary JavaScript thrown values. `StyleInput.overflow` is one narrow fixed-object exception: napi-rs nested object conversion does not reject arrays, primitives, or extra keys, so the binding first performs the selected strict shape check and then converts to the existing typed point object. This exception does not justify another general parser.

## Output conversion

Borrowed Rust values never escape. Style, Layout, child arrays, detailed Grid data, available space, and nested records are copied into complete detached JavaScript values.

Binding-produced records and arrays are recursively readonly in TypeScript because mutation cannot update Taffy. Runtime objects remain ordinary mutable, unfrozen objects, and each read returns an independent snapshot. There are no live native views, output caches, lazy properties, selectors, prepared queries, or batch snapshots.

Public TypeScript declarations and JSDoc live in `packages/taffyjs-node/src` and are emitted by `vp pack` into `index.d.ts`. The private native declarations remain napi-rs-generated.

## Context and measurement

Arbitrary context stays in a JavaScript map keyed by current public NodeId. Native `TaffyTree<()>` stores only presence. `undefined` means no context; `null` is an ordinary value when allowed by `TContext`. Removing or clearing nodes releases the corresponding JavaScript references.

`setNodeContext` updates native presence and the JavaScript map and marks the node dirty. In-place context changes and callback-captured data cannot be observed automatically; callers use `markDirty` when those changes affect later measurement. Supplying a different callback does not invalidate Taffy's cache by itself.

The measure callback runs synchronously and receives owned `knownDimensions`, `availableSpace`, public NodeId, the original JavaScript context, and a detached Style snapshot. Taffy controls whether, when, and how often it runs. It must return a complete `{ width, height }` number record; Promises, missing axes, and invalid values throw `TypeError`.

The native owner uses checked `RefCell` access. A native-backed call on the same tree during measurement throws `ERR_TAFFY_TREE_BUSY`; JavaScript-only value operations and another tree remain usable.

On the first callback throw or invalid result, the bridge retains that failure, stops further JavaScript callbacks, lets Taffy's infallible stack finish with internal zero sizes, invalidates the requested subtree, and throws synchronously. A thrown JavaScript value keeps its identity. The tree remains usable, but already completed JavaScript side effects and stored Layout work are not rolled back.

## Mutation, errors, and panic containment

Validate complete input, every involved NodeId, topology, index, and range before the first ordinary mutation. Failed single-value and collection mutations must not leave partial wrapper or native state. Measured computation is the documented exception because callback failure happens after computation has started.

Shape failures use `TypeError`, numeric range failures use `RangeError`, and ordinary Taffy operation failures use `Error`. Stable NodeId and busy codes are part of the public contract; exact prose is not.

Known JavaScript-controlled panic paths are prevented before Taffy. The Rust owner catches unexpected panics as a final boundary and prevents later access to a possibly inconsistent native tree; panic handling is not normal error control flow.

## Changes and optimization

When dependencies change, diff the high-level Taffy methods and all transitive value types, recheck napi-rs conversion and callback behavior, re-audit every panic and lifetime boundary, rebuild public declarations from source, and update JavaScript integration tests with the converters.

Do not change the public API or private JavaScript-to-Rust representation for assumed speed. The two representations are separate decisions, and the only active performance work is listed in [API alignment TODOs](api-alignment-todos.md) and requires a real consumer workload plus retained end-to-end measurements.
