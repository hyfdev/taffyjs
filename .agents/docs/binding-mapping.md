# Taffy-to-Node Binding Mapping

This is the working reference for mapping Taffy's high-level Rust layout API into @taffyjs/node. It describes repeatable mapping and safety rules, not a frozen JavaScript API. Each mapping separates the boundary semantics that must be preserved from the JavaScript representation that remains a design choice. Vouched product direction remains in [@taffyjs/node decisions](taffyjs-node-decisions.md), while [binding mapping cases](binding-cases.md) practically apply these rules to real APIs, preserve the corrections and decision points exposed by that practice, and feed reusable lessons back into this reference for later AI-driven iteration.

The current evidence baseline is Taffy 0.13.0, napi 3.12.0, and napi-derive 3.6.2 as pinned by this repository. Re-evaluate version-sensitive facts when any of those dependencies changes.

Primary upstream references:

- [Taffy architecture and high-level API](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/lib.rs)
- [TaffyTree implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/taffy_tree.rs)
- [Taffy style model](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/style/mod.rs)
- [Taffy geometry types](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/geometry.rs)
- [Taffy high-level measurement example](https://github.com/DioxusLabs/taffy/blob/v0.13.0/examples/measure.rs)
- [iocraft's per-node measurement context](https://github.com/ccbrown/iocraft/blob/ac7a7dd00fa9633becd43388eec4e5159545efb0/packages/iocraft/src/render.rs#L338-L348)
- [iocraft's compute-time measurement dispatcher](https://github.com/ccbrown/iocraft/blob/ac7a7dd00fa9633becd43388eec4e5159545efb0/packages/iocraft/src/render.rs#L423-L437)
- [Ink's per-node Yoga measurement callback](https://github.com/vadimdemedes/ink/blob/cdc18fa4942b580cda13304545cc2cf18fdde9b8/src/dom.ts#L76-L91)
- [Yoga 3.2.1 JavaScript wrapper](https://github.com/facebook/yoga/blob/v3.2.1/javascript/src/wrapAssembly.ts#L266-L329)
- [Yoga 3.2.1 measurement implementation](https://github.com/facebook/yoga/blob/v3.2.1/yoga/algorithm/CalculateLayout.cpp#L302-L348)
- [napi-rs type conversions](https://napi.rs/docs/concepts/type-conversions)
- [napi-rs classes and value shapes](https://napi.rs/docs/concepts/class)
- [napi-rs enum mappings](https://napi.rs/docs/concepts/enum)
- [napi-rs error handling](https://napi.rs/docs/concepts/error-handling)
- [napi-rs class receiver code generation](https://github.com/napi-rs/napi-rs/blob/napi-v3.12.0/crates/backend/src/codegen/fn.rs)
- [Node.js ESM cache behavior](https://nodejs.org/download/release/v22.18.0/docs/api/esm.html#file-urls)
- [Node.js worker cloning and identity](https://nodejs.org/download/release/v22.18.0/docs/api/worker_threads.html)

## Scope rule

Select Rust items by their role in normal layout usage, not by whether they are public or by whether they are declared as a struct, enum, trait, or function.

@taffyjs/node is foundational in the JavaScript package family but targets the high-level side of Taffy's own API boundary. Thin describes the implementation, not the abstraction level: the native binding keeps layout state and behavior in Rust and Taffy without a JavaScript shadow tree or reimplemented layout engine. It does not expose lower-level Rust machinery merely to make the binding more direct.

The binding scope is the TaffyTree-centered flow:

1. Create and configure a tree.
2. Create nodes with styles and optional measurement context.
3. Read and mutate tree relationships and node styles.
4. Supply available space and, when needed, a synchronous measure function.
5. Compute layout.
6. Read layout results and observable tree state.
7. Receive controlled errors for invalid input or operations.

Taffy's low-level custom-tree traits, trait-dependent single-algorithm compute functions, cache implementation, helper traits, and generic implementation infrastructure are not binding targets. A new public use case and explicit project decision are required before that boundary expands.

## Default semantic pass-through

The public wrapper owns JavaScript-to-Rust representability and the JavaScript-specific contracts that Taffy's Rust types do not express: selected input shapes and variants, absence semantics, binding-owned identities, ownership and lifetime, complete conversion before mutation, and prevention of known panics or native-safety violations. Once those obligations are satisfied, a Rust-representable value goes to Taffy without extra JavaScript-side semantic range validation, clamping, normalization, or default substitution. The resulting state, output, or typed error follows the pinned Taffy version.

This rule distinguishes safety from usefulness. A value that reaches a known indexing panic, invalid borrow, native-state disagreement, or other process-safety boundary must be stopped. A value that Taffy safely stores but later turns into a surprising layout remains Taffy behavior and caller responsibility. Taffy-provided typed errors should normally be translated rather than predicted through duplicate JavaScript validation. Exact results outside Taffy's documented semantic domain are not a separate @taffyjs/node compatibility promise.

Apply this default to later API mappings unless a concrete Rust invariant or explicitly selected JavaScript contract requires more. Yoga may provide evidence about responsibility boundaries or common vocabulary, but Yoga-specific normalization is not a reason to change Taffy behavior in this package.

## Lessons from the first mapping case

The first completed mapping case covers TaffyTree layout state and node identity. It supports these reusable rules:

- Start with observable Rust behavior and normal operation sequences, then choose the JavaScript representation. A public Rust declaration or syntax shape is not by itself an API requirement.
- Preserve state ownership while distinguishing required binding metadata from copied Taffy state. Taffy owns tree structure, Style, Layout, caches, and computation; the NodeId registry records only identity and validity, and a JavaScript cache of Taffy-owned data would be a separate optimization.
- Choose representations for ordinary JavaScript use while preserving Rust semantics. A Rust newtype does not automatically require a native JavaScript object; NodeId is a bigint because JavaScript identity comparison and keyed collections are normal node operations that should not require a native call.
- Add private boundary information when the Rust identifier lacks a guarantee required by JavaScript. Taffy's NodeId does not identify its tree, so the public value also records the issuing tree and the binding-issued identity of that node creation without exposing those fields as a persistence or arithmetic format.
- Treat TypeScript markers and readonly declarations as compile-time guidance rather than runtime validation. The wrapper still checks the form, owner, and current validity of every NodeId that a tree consumes.
- Separate identity equality from current validity. Equal NodeId bigints name the same binding-issued node identity, but a tree operation still rejects that value after removal.
- Do not turn a borrowed Rust result into a live JavaScript view. `getLayout(node)` returns an independent snapshot of the value Taffy currently stores and does not compute a new layout.
- Keep optional convenience and optimization separate from the direct path. Automatic layout and JavaScript caches require their own semantics and evidence; they must not replace Taffy's direct behavior.

## Lessons from the second mapping case

The completed Style case adds these reusable rules for later API mappings:

- Assume ordinary JavaScript data objects unless a concrete ownership, lifetime, callback, grammar, compatibility, measured-cost, or safety requirement demands another representation. Getter and Proxy behavior alone is not a reason to complicate the baseline.
- State absence semantics through observable examples before introducing type-theory terminology. Missing and `undefined` normally select an enclosing default, while `null` has meaning only when the public field explicitly maps it to Rust `None`.
- Classify closed values by whether they carry data. Fieldless closed families use binding-owned numeric literal members; data-carrying variants use ordinary numeric-tagged records with required semantic payloads. Derive each member union through the shared public `EnumValue` type, use named family constants throughout documentation and repository code, state explicitly that accepted raw literals are not recommended, and keep tagged-record discriminators unbranded so normal TypeScript control flow narrows them. Do not optimize a discriminator independently of the complete value.
- Keep input and output direction explicit. Caller records and arrays are mutable, binding-produced snapshots are readonly in TypeScript and independent from native state, and runtime freezing is a separate choice rather than an implication of `readonly`.
- Use the same public tag vocabulary in both directions when it keeps narrowing and reuse clear, but return canonical stored values rather than preserving helper names, input object identity, or original floating-point precision.
- Separate representability and safety from semantic usefulness. Reject a JavaScript value that cannot construct the selected Rust type or is known to reach a panic; otherwise pass it to Taffy without adding CSS, Yoga, or binding-specific layout policy.
- Compose established value families instead of reopening every field. A later agent maps fields mechanically and asks for another decision only when evidence introduces a genuinely new semantic category or an observably different public contract.
- Prefer the simplest truthful owned output as the direct baseline. If a measured consumer workload later shows that converting unneeded fields is material, evaluate the smallest additive optimization for that workload without replacing the complete snapshot; do not infer that a generic selector is required by default.
- Keep safety exceptions narrow and evidence-backed. The pinned Grid line-name underflow justifies treatment of that exact reachable shape, not general CSS grammar validation or defensive rejection of other unusual collections.
- Treat each mapping case as a reference example. It is complete when it has yielded reusable rules and stop conditions; do not infer a transition to implementation from its completion. Likewise, record selection and an explicit human vouch as separate states.

## Rust usage model

Taffy's basic Rust flow constructs a `TaffyTree`, creates `Style` values, inserts nodes, calls `compute_layout` or `compute_layout_with_measure`, and reads `Layout` snapshots by `NodeId`.

| Role               | Taffy model                                                                                             | How Rust uses it                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stateful owner     | `TaffyTree<NodeContext>`                                                                                | Owns node data, parent and child relationships, styles, rounded and unrounded layouts, caches, configuration, and optional per-node context.                                                          |
| Node identity      | `NodeId`                                                                                                | A copyable wrapper around the `u64` slotmap key. It contains slot generation data but no identity for the owning `TaffyTree`.                                                                         |
| Input state        | `Style<DefaultCheapStr>`                                                                                | An owned value moved into a node when it is created or when `set_style` runs. Its nested fields contain geometry records, closed enums, optional values, vectors, and semantic length or grid values. |
| Layout constraints | `Size<AvailableSpace>`                                                                                  | An owned width and height pair whose axes are definite lengths, min-content, or max-content constraints.                                                                                              |
| Output state       | `Layout`                                                                                                | Stored inside the tree and returned by Rust as a borrowed reference tied to that tree. It contains owned numeric geometry values.                                                                     |
| Node context       | Generic `NodeContext`                                                                                   | Optional owned data stored per node and passed as `Option<&mut NodeContext>` to the measure closure. The native binding uses `()` as a presence marker while JavaScript owns the actual value.        |
| Measurement        | `FnMut(Size<Option<f32>>, Size<AvailableSpace>, NodeId, Option<&mut NodeContext>, &Style) -> Size<f32>` | A separate synchronous callback supplied to `compute_layout_with_measure`; it is not inherently the per-node context.                                                                                 |
| Failure            | `TaffyResult<T>` and `TaffyError`                                                                       | Declares invalid-node variants, but Taffy 0.13 explicitly returns only child-index errors; invalid, stale, or foreign `NodeId` paths generally index storage and may panic.                           |

The public high-level method families are constructors and rounding configuration; node creation and removal; node context access; parent and child mutation; style mutation; layout and dirty-state reads; layout computation; and optional debug or detailed-layout output. The JavaScript API does not have to reproduce every convenience method if the complete normal layout flow remains direct.

Public JavaScript methods that retrieve values use a camelCase `get` prefix, including `getStyle`, `getLayout`, `getParent`, `getChildren`, `getChildCount`, `getChildAtIndex`, and `getNodeContext`. Boolean predicates keep `is` or `has`, such as `isDirty`; mutations and actions keep their own verb-led names. Callback argument properties such as `style` and `context` are not accessor methods and do not receive the prefix.

Layout reads and computation remain separate operations. A newly created node stores a zero Layout, and `getLayout(node)` returns it without computing. `set_style` changes the Style and marks the affected cache state dirty, but `getLayout(node)` continues to return the previously stored result until the caller computes again. If the dirty-state query is exposed, it reports Taffy's cache state; it does not prove that a node's stored layout is current. An API that computes automatically may be added only as a separate convenience. [Case 1](binding-cases.md#case-1-taffytree-layout-state-and-node-identities) shows the observed behavior.

Taffy's expected measurement flow treats the callback as a synchronous intrinsic-size function for leaf nodes. One closure is supplied for a compute call; Taffy passes the current node identity, optional per-node context, constraints, and style. The official example stores text or image data in node context and lets the closure borrow an external font registry. A real Taffy-based terminal UI, iocraft, stores a per-component measure function in node context and uses one compute-time closure as the dispatcher. A Yoga-style callback retained directly on each node is therefore a plausible convenience mapping, but it is not the literal shape of Taffy's high-level method.

### Selected layout-computation signatures

The direct JavaScript API keeps Taffy's separate computation methods and changes their positional Rust inputs into named JavaScript objects:

```ts
interface SizeInput<T> {
  width: T;
  height: T;
}

interface Size<T> {
  readonly width: T;
  readonly height: T;
}

type AvailableSpaceInput =
  | { kind: typeof AvailableSpaceKind.Definite; value: number }
  | { kind: typeof AvailableSpaceKind.MinContent }
  | { kind: typeof AvailableSpaceKind.MaxContent };

type AvailableSpace =
  | { readonly kind: typeof AvailableSpaceKind.Definite; readonly value: number }
  | { readonly kind: typeof AvailableSpaceKind.MinContent }
  | { readonly kind: typeof AvailableSpaceKind.MaxContent };

type MeasureArgs<TContext> = Readonly<{
  knownDimensions: Size<number | undefined>;
  availableSpace: Size<AvailableSpace>;
  node: NodeId;
  context: TContext | undefined;
  style: Style;
}>;

type MeasureFunction<TContext> = (args: MeasureArgs<TContext>) => SizeInput<number>;

interface ComputeLayoutOptions {
  root: NodeId;
  availableSpace: SizeInput<AvailableSpaceInput>;
}

interface ComputeLayoutWithMeasureOptions<TContext> {
  root: NodeId;
  availableSpace: SizeInput<AvailableSpaceInput>;
  measure: MeasureFunction<TContext>;
}

class TaffyTree<TContext = unknown> {
  computeLayout(options: ComputeLayoutOptions): void;

  computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void;
}
```

Both methods compute explicitly; neither reads layout, computes automatically, stores a per-node callback, or adds a second layout abstraction. A successful Rust `Result<(), TaffyError>` maps to `void`, while failure maps to a controlled JavaScript exception. The callback is synchronous, and a Promise is not a valid measured size. It is a Taffy-controlled query rather than an exactly-once event: cache reuse or traversal may skip a node or measure it multiple times under different constraints, and taffyjs does not promise a stable cross-node order or call count. `knownDimensions`, `availableSpace`, `node`, `context`, and `style` correspond directly to Taffy's five callback inputs, but every Rust borrow becomes an owned JavaScript boundary value. The callback therefore receives readonly unsuffixed geometry, while caller-supplied `availableSpace` and the callback's returned measured size use complete mutable `SizeInput<T>` declarations. `Style` uses recursively readonly TypeScript properties to record that callback mutation cannot alter Taffy; the initial callback value is a complete eager ordinary plain object without runtime freezing.

`TaffyTree<TContext>` is only a TypeScript relationship between a tree and the JavaScript values in its context registry. The native tree remains `TaffyTree<()>`. In `context: TContext | undefined`, `undefined` always means absence: creating or setting an undefined context clears both the registry entry and Taffy's unit presence marker. `null` and other values remain present. Direct mutation of a supplied JavaScript context during measurement remains an observable caller-owned side effect without automatic invalidation. Native same-tree operations such as `setNodeContext` and `markDirty` fail with `ERR_TAFFY_TREE_BUSY` while the compute is active; if a direct mutation changes future measurement semantics, the caller marks the affected node dirty after the compute returns.

## Rust modeling categories

### Stateful structs

An owned Rust aggregate with identity and mutable state maps to one private napi-rs class backed by one Rust value. The public JavaScript `TaffyTree` wrapper owns that private native class and the binding-only NodeId registry. JavaScript garbage collection may own the lifetime of the wrappers, but tree, style, layout, topology, and computation state remain native Rust and Taffy state.

Do not expose the private native class, its fields, raw Taffy NodeIds, or raw methods through the supported @taffyjs/node API. Mutations go through validated public methods so the wrapper can preserve the JavaScript and Taffy invariants together.

Methods may map directly to native TaffyTree operations when the JavaScript boundary can preserve their semantics and safety. The class representation must not force lower-level tree traits, internal storage, or Rust borrowing syntax into the public API. Synchronous same-tree callback re-entry uses the vouched checked-borrow boundary, while callback failure uses the separately selected first-failure, subtree-invalidation, and reusable-tree behavior; neither changes the public abstraction level.

### Value structs

Value semantics do not imply one shared JavaScript representation. `Style`, concrete instantiations of generic geometry types, and `Layout` have different directions, costs, and ownership obligations even though none is the native tree owner.

Record-shaped JavaScript inputs default to ordinary data-object assumptions. Do not add representation changes, repeated validation, or copies solely for side effects from getters or Proxy traps. A concrete ownership, lifetime, callback, grammar, compatibility, or measured-cost requirement may justify a special representation, but the mapping must name that reason and its boundary.

Input record properties remain mutable in TypeScript, and the binding does not promise to preserve or defend against mutations, accessors, or Proxy effects introduced by the caller. Binding-produced record snapshots use readonly TypeScript properties because changing a detached record cannot change native state. Readonly declarations do not by themselves require runtime freezing or sealing.

`Style<DefaultCheapStr>` is a large owned input value stored in the tree. A `StyleInput` must be converted completely and have its selected shape and variants validated before mutation begins; this does not imply extra semantic range validation for Rust-representable field values. `getStyle` and actual measure callbacks receive independent complete eagerly materialized ordinary plain-object `Style` snapshots, never live views. Their TypeScript fields and nested values are recursively readonly, but the runtime values are not frozen, sealed, or proxied. No JavaScript Style cache, lazy snapshot, selective query, prepared query, or batch snapshot facility is part of the initial implementation. The baseline assumes ordinary data-object inputs and does not add repeated NodeId validation or a dedicated defensive copy solely for accessor or Proxy re-entry. Completed optimization experiments and reopen conditions are recorded separately in [Output optimization research](output-optimization-research.md).

The geometry value families use ordinary named records with `width` and `height`; `left`, `right`, `top`, and `bottom`; `x` and `y`; and `start` and `end`, respectively. Complete caller-supplied `SizeInput<T>`, `RectInput<T>`, `PointInput<T>`, and `LineInput<T>` forms have required mutable properties; Style-specific `Partial*Input<T>` forms have optional mutable properties with the selected enclosing-default behavior; and binding-produced unsuffixed `Size<T>`, `Rect<T>`, `Point<T>`, and `Line<T>` forms have every property present and readonly. Style partiality does not apply to complete inputs such as `SizeInput<AvailableSpaceInput>` or a measure result. The input vocabulary does not add tuple, array, positional-constructor, native-owner, logical-edge-alias, or generic fill-all alternatives; only the separately selected semantic-length `PartialSizeInput` and `PartialRectInput` Style fields accept one contained value. These are generic Rust shapes rather than single runtime Node-API types, so the binding must still define concrete conversion types for every required instantiation, such as the Rust types `Size<AvailableSpace>`, `Size<Option<f32>>`, `Size<f32>`, and `Size<Dimension>`. TypeScript may reuse the truthful generic declarations even though native conversion remains concrete. Geometry nested in the initial Style output is eagerly materialized as nested plain records; other output contexts keep their own representation decisions.

`Layout` is output state stored in the tree. Taffy returns the currently stored value by reference, including zero before the first computation and an earlier result after inputs change. The JavaScript API must return an owned snapshot or an explicitly designed batch output. Mutating a returned JavaScript layout must not mutate the tree, and its TypeScript fields are readonly. Runtime sealing or freezing remains an open API and cost choice.

A binding-local `#[napi(object)]`, `#[napi(array)]`, `#[napi(transparent)]`, or manually converted wrapper may transport value types across Node-API. The choice follows the concrete direction and cost rather than the Rust declaration kind alone.

Choose conversion direction explicitly. Input-only shapes may disable Rust-to-JavaScript conversion, and output-only snapshots may disable JavaScript-to-Rust conversion. napi-rs object conversion owns and copies the fields; it does not create a live view of the Rust value.

### Private input transport performance TODO

Keep public inputs as readable records and tagged unions and keep user-observable outputs as readable owned values. Separately from maturity work, benchmark replacing direct Node-API object-field conversion with JavaScript-side input conversion: pass small fixed inputs to private native methods as positional primitive values, and encode large or deeply nested inputs such as `StyleInput` into a reusable compact `Buffer`. Choose the actual cutoff from retained end-to-end Taffy workloads, include JavaScript validation and buffer-writing cost, preserve the existing public errors and mutation behavior, and do not expose or retain the private transport format. Leave native-to-JavaScript output transport unchanged until it is measured as a separate problem.

A borrowed Rust return such as `&Style` or `&Layout` must not escape as a JavaScript borrow. Return an owned snapshot or another explicitly owned native value. Mutating that JavaScript result must not mutate the tree.

### Closed enums

Fieldless enums such as `Display`, `Position`, `Overflow`, `FlexDirection`, and `GridAutoFlow` map through explicit binding-owned integer codes with exhaustive runtime validation. Each family exposes an immutable namespace-like object of primitive numeric literal members; the object and literal-union type share one singular PascalCase family name, and every member uses PascalCase, as in `Display.None` and `Overflow.Hidden`. Analogous enum-like public families elsewhere in @taffyjs/node follow the same convention unless an explicit external compatibility contract fixes another spelling. The package exports `EnumValue<Family>` to derive the union. Documentation, JSDoc, examples, and repository code use the named constants as the recommended form and explicitly describe accepted raw literals as not recommended whenever that boundary is relevant. Ordinary checked code still accepts a valid raw member literal, rejects an unknown literal and a widened `number`, and structurally accepts a member from another family when the numeric code overlaps. Style reads, logs, and JSON expose numbers. Conversion must inspect the original value as a finite integer and match an exact family member before mutation rather than rely on coercive `i32` conversion. Codes must remain stable across Taffy changes and must never derive from Rust discriminants or declaration order. One small maintained definition generates the public runtime constants, Rust validation codes, and an exhaustive declaration test; the authored public declaration is checked by that generated type test. The assigned codes remain an observable binding contract rather than values derived from Taffy.

Taffy's alignment structs map as two flattened closed families rather than public keyword-safety records. `AlignItems` contains its ordinary positional, baseline, stretch, and CSS-safe positional constants and serves `alignItems`, `alignSelf`, `justifyItems`, and `justifySelf`; `AlignContent` contains its ordinary positional, stretch, space-distribution, and CSS-safe positional constants and serves `alignContent` and `justifyContent`. Input and output share each numeric literal family. Expose only Taffy's named public combinations: retain `SafeStart` even though its current fallback has the same layout as `Start`, but do not manufacture `SafeBaseline`, `SafeStretch`, `SafeSpace*`, or redundant `Unsafe*` members from the internal field product. Rust alignment aliases share one representation per family; optional TypeScript alias names do not define new runtime objects or code sets.

### Data-carrying enums and semantic newtypes

Data-carrying enums map by their semantic variants and payloads rather than mechanically exposing Rust discriminants. Each tagged-union branch declares only its discriminator and required payload fields; it does not add optional-`never` exclusions for payload names used by other branches. Conversion selects the discriminator and reads the selected variant's required fields, while extra structural properties that do not participate in that mapping remain caller responsibility and are omitted from canonical output. This does not weaken an explicit unknown-field policy selected for another boundary. `AvailableSpace` uses ordinary records tagged by the numeric-literal `AvailableSpaceKind` family: `Definite` carries a JavaScript-number payload, while `MinContent` and `MaxContent` carry none. Callers may use direct mutable records or `AvailableSpace.Definite(value)`, `AvailableSpace.MinContent`, and `AvailableSpace.MaxContent`; callback output uses the same kind vocabulary in readonly records. Layout options take `SizeInput<AvailableSpaceInput>`, and measure arguments expose `Size<AvailableSpace>`. Every number remains inside a definite payload, so the representation reserves no numeric value, accepts no bare number, and needs no string or symbol variant. Ordinary comparison with a family constant or equivalent raw literal narrows the complete tagged union.

Grid composes the same rule rather than introducing CSS strings or compact encodings. `GridPlacement` uses numeric-tagged `Auto`, `Line`, `NamedLine`, `Span`, and `NamedSpan` records with semantic `index`, `name`, and `span` payloads and matching conveniences; `gridRow` and `gridColumn` remain `PartialLineInput<GridPlacementInput>` with no scalar whole-line shorthand. Minimum and maximum track values share numeric `TrackSizingKind` tags for length, percent, auto, min-content, max-content, fit-content, and fractional variants, with fit-content and fractional values limited to the maximum side. `TrackSizingFunctionInput` is always a complete min/max pair; its conveniences follow Taffy's normalization and output is the stored pair. `RepetitionCount` uses numeric-tagged count, auto-fill, and auto-fit records. `GridTemplateComponent` always tags either one track pair or a complete `{ count, tracks, lineNames }` repetition. Template areas use a nullable normalized record with explicit dimensions and area coordinates, and template line names use nested string arrays. Mutable input and recursively readonly canonical output share each tag vocabulary. Rust `i16` and `u16` payloads require finite exact in-range JavaScript integers, strings are not CSS-grammar validated, floating payloads pass through under the scalar rule, nested collections are fully copied before mutation, Taffy's internal 10,000-track cap is not duplicated at the boundary, and safely representable semantic edge cases remain Taffy's responsibility unless the pinned implementation is known to panic. In particular, pinned Taffy 0.13 can underflow in its named-line resolver when the corresponding top-level line-name iteration reaches a positive repetition with empty internal `lineNames`; the complete Style converter must reject that combination or safely supply the expected semantically empty line-name sets without turning other CSS-invalid collection relationships into JavaScript validation policy.

Taffy also represents several semantic variants as compact newtypes rather than Rust enums. `Dimension`, `LengthPercentage`, and `LengthPercentageAuto` use selected ordinary tagged records with a numeric-literal `LengthUnit` discriminator: length and percent carry JavaScript-number payloads, auto carries no payload, `LengthPercentage` excludes auto, and the other two families include it. The value namespace exposes `Dimension.Length(value)`, `Dimension.Percent(value)`, and `Dimension.Auto`, while callers may provide the equivalent ordinary records directly. Percent magnitudes are user-facing, so 50 maps to Taffy's fractional 0.5 without range validation; all numeric payloads otherwise follow the selected `f64`-to-`f32` pass-through boundary. Strings and bare numbers are not semantic-length values. Complete output uses readonly tagged records derived from the actual stored value and retains the same numeric unit vocabulary for ordinary switch narrowing and direct output-to-input round-trip; whole-record identity is not meaningful. This shared vocabulary, rather than an assumed marginal speed advantage inside an allocated record, is the reason to keep the numeric output tag. Homogeneous semantic-length `Rect` and `Size` Style fields also accept one contained value that expands to every component, while output remains a complete aggregate. This does not add full CSS shorthand grammar. Track sizing types retain their separate grid-specific variants. Never expose packed bits, private tags, raw values, raw pointers, unsafe constructors, or calc handles.

The selected public high-level Style vocabulary does not support calc, and its opaque pointer representation must never cross from JavaScript. Adding calc later requires a separate owned representation and resolver design that preserves lifetime and error invariants.

### Generic structs and aliases

Node-API conversion is concrete at runtime. Instantiate each Rust bridge type for the exact nested Taffy value it converts. TypeScript may still use generic helper interfaces or aliases when they truthfully describe several concrete runtime conversions; a TypeScript generic declaration does not create runtime conversion or validation.

Rust aliases such as `AlignSelf = AlignItems` use the selected shared runtime representation while retaining separate TypeScript aliases only when the semantic names are useful.

### Options, collections, and ranges

Specify missing, `undefined`, and `null` behavior for every input property that can omit or clear a value instead of accepting napi-rs defaults accidentally. Specify whether a collection is copied, borrowed during one synchronous call, or retained. Validate every element before mutation begins.

For the selected Style input, a missing property and an explicit `undefined` both apply the corresponding `Style::DEFAULT` value. Fixed-shape `PartialPointInput`, `PartialSizeInput`, `PartialRectInput`, and `PartialLineInput` records used directly as Style fields follow the same rule per component, using the corresponding component of the enclosing field's Style default rather than stored state; their unknown enumerable string components are rejected. This is not a recursive rule for tagged variants or arbitrary nested payloads. `null` explicitly maps to `None` only when the field's public semantics allow no value, currently backed by Taffy `Option<T>`, and is rejected elsewhere. Conversion retains the resulting Style value rather than the caller's input form: a default `Some(value)` remains distinct from `null`-selected `None`, while inputs that all produce `None` converge. Input properties are mutable declarations. A complete `Style` keeps every readonly field and fixed-shape component present, represents `Some(value)` as the concrete value and `None` as `null`, and does not use missing or `undefined` nullable output fields. The baseline `getStyle(node)` returns that complete owned snapshot. TypeScript optional input properties that accept explicit `undefined` must include `| undefined` so the declaration remains correct under `exactOptionalPropertyTypes`; each property where `null` and `undefined` differ must also carry property-level JSDoc stating both meanings.

Rust `usize` and generic range bounds do not define a safe JavaScript input contract. Accept JavaScript safe integers through a checked bridge representation, convert with `TryFrom`, and validate complete ranges before calling Taffy.

### Results and panics

Expected Rust failures map to `napi::Result<T>` and controlled JavaScript errors. Preserve a stable binding-level error category and useful Taffy context without exposing internal panic text as an API.

Do not assume a `TaffyResult` signature makes the call panic-safe. Prevent JavaScript-controlled inputs from reaching known panic preconditions that Taffy does not report safely, while allowing Taffy itself to handle safe semantic behavior and typed errors. Panic containment can be a final defensive boundary, but it is not normal control flow and cannot replace a known required safety check.

### Callbacks and retained JavaScript values

Taffy's measure function is synchronous and requires an immediate `Size<f32>` result. A callback used only during one compute call maps to a scoped napi-rs `Function`. Use `FunctionRef` only if a JavaScript function must survive beyond the current native call. `ThreadsafeFunction` is for genuine cross-thread invocation and is not a transparent replacement for Taffy's synchronous `FnMut`.

Keep node context and the measure function separate in the model. The binding may eventually choose per-node callbacks, shared callbacks plus per-node data, or another concrete context, but that is an API decision rather than a consequence of Taffy's generic parameter.

Actual JavaScript node-context values remain entirely in a wrapper-owned JavaScript registry keyed by the current public NodeId. The native tree uses `TaffyTree<()>`; its optional unit context records presence only and does not own an identifier or the JavaScript value. Context changes on a live node must keep the JavaScript registry and Taffy's presence marker consistent, while node removal and tree clearing must delete the corresponding JavaScript registry entries. Taffy 0.13 leaves `node_context_data` entries behind in `remove` and `clear`, but those native entries contain only `()` under this design and cannot retain a JavaScript value.

Measurement state follows an explicit invalidation contract. Taffy 0.13's layout cache key does not include the identity or contents of the measure callback or node context. `setNodeContext` always marks its node dirty, while in-place context mutation and changes to callback-captured data require the caller to invoke `markDirty` on each affected node. A different callback supplied per compute does not invalidate an existing cache entry or imply that Taffy will call it during that compute. `markDirty` and `isDirty` preserve Taffy's behavior directly, including node-and-ancestor invalidation and the per-node cache query.

The measure callback is a Taffy-controlled query rather than an event. Cache reuse and traversal determine whether and how often a node is measured and which constraints each invocation receives; the binding promises neither a stable invocation count nor cross-node ordering. Direct mutation of the exact JavaScript context object remains visible but does not automatically dirty the node. Same-tree native invalidation is unavailable until the compute returns, after which the caller must mark a node dirty only when the mutation changes future measurement semantics.

#### Measurement result and failure boundary

The measure callback synchronously returns a complete `SizeInput<number>` with required `width` and `height`. Unsupported shapes and payload types produce `TypeError`; a Promise is not awaited. Numeric axes use the ordinary `f64`-to-`f32` pass-through, so negative and non-finite numbers remain successful values rather than callback failures.

Taffy's measure closure returns `Size<f32>`, not `Result<Size<f32>, _>`, while a napi-rs `Function` call can fail because JavaScript throws or because its return value cannot be converted. On the first such failure, the bridge retains the failure, stops invoking user JavaScript for that compute, and returns internal zero sizes for any remaining native measure calls only to let Taffy leave its infallible stack normally. After the native call returns, it invalidates every cache in the requested root's subtree and then throws synchronously. Callback-thrown values propagate without a new binding wrapper; invalid results use ordinary `TypeError` without a dedicated stable binding code.

The tree remains usable and unpoisoned, but callback failure does not provide transactional Layout rollback. Layout reads continue to expose the values Taffy currently stores, callback side effects and caller-owned context mutations remain observable, and a later successful compute reestablishes complete layout results. The direct path does not clone or snapshot the entire tree before every measured compute solely to restore old Layout after an exceptional callback, and it does not use Rust panic as ordinary error propagation.

Safe Rust also holds an exclusive borrow of the TaffyTree throughout `compute_layout_with_measure`. The closure receives the current node's inputs and context but no tree reference, so Taffy does not provide an inherited high-level capability for same-tree re-entry. JavaScript can still capture the wrapper and attempt access. The public callback type therefore exposes only allowed owned inputs, its documentation states that the same native tree is unavailable until it returns, and actual same-tree re-entry is rejected at the native boundary.

Yoga does not establish the behavior for this boundary. Its JavaScript wrapper and C++ layout path allow a measure function to call back into Yoga without an equivalent checked-borrow rule, but that C++ ownership model does not establish that overlapping Rust access is valid or that Taffy's cache state would remain consistent. The Yoga comparison informed the specific re-entry decision; it is not a separate API-alignment case or a precedent that @taffyjs/node must follow.

The pinned napi-rs receiver code generation does not add a dynamic borrow check for synchronous `&mut self` methods. It unwraps the native pointer and constructs an `&mut` receiver for each call. Ordinary synchronous JavaScript cannot run concurrently with that method, but `compute_layout_with_measure` deliberately calls JavaScript before its mutable borrow ends. If that callback reaches another `&mut self` or `&self` method on the same private native tree, napi-rs can construct another Rust reference while the first exclusive reference is still active. The binding must therefore avoid napi-rs `&mut self` receivers for this state rather than treating documentation as sufficient protection.

The selected private native representation owns `RefCell<TaffyTree<()>>` and every future native field governed by the same access rule, exposes shared `&self` napi-rs receivers, and uses `try_borrow` or `try_borrow_mut` once per native operation. A same-tree callback entry must turn a failed borrow into an ordinary JavaScript `Error` with stable code `ERR_TAFFY_TREE_BUSY`; the diagnostic message names the attempted operation and explains that the tree cannot be accessed while it is computing layout from a measure callback. The failed operation must not silently do nothing or return `undefined`. A different tree has independent borrow state and remains usable. This checked borrow does not require a duplicate JavaScript busy flag and protects a different invariant from NodeId validation.

An operation that changes both native state and a JavaScript registry must define an order that does not report success with the two sides inconsistent. The exact ordering and failure recovery belong to that operation's implementation. `UnsafeCell` alone is not an alternative to the checked borrow because it permits interior mutation without detecting overlapping access.

The callback is not necessarily pure: `FnMut` may update captured external state, and the binding passes the caller-owned mutable context value. Those JavaScript effects persist even if a later callback or result conversion fails; the binding rolls back neither arbitrary JavaScript state nor the stored Layout. Binding-owned cache state follows the selected subtree invalidation boundary so failure-derived measurement results cannot be reused.

### Traits

Rust traits are not mapped to JavaScript interfaces by default. Taffy's high-level `TaffyTree` already implements its internal tree and style traits. The low-level traits exist for Rust hosts that own another tree implementation, so they are outside this package's agreed scope.

## napi-rs mapping constraints

The binding crate must define local bridge types and explicit `From`, `TryFrom`, or conversion functions around upstream Taffy types. The external Taffy declarations cannot simply receive `#[napi]`, and the runtime direction and validation rules must remain visible in binding code.

| Rust boundary need               | napi-rs tool                                          | Required caution                                                                                                                                                                        |
| -------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native state                     | Private `#[napi]` class with Rust fields              | Keep the native TaffyTree as the sole layout-state owner behind an authored public JavaScript wrapper; do not export raw node operations as supported API.                              |
| Node identity                    | Branded JavaScript bigint and private JS `Map`        | Encode tree identity, binding-issued node identity, and raw Taffy NodeId privately; validate against the current-node registry before the immediate synchronous native call.            |
| Owned input or output record     | `#[napi(object)]`                                     | Conversion copies nested values. Optional-field and conversion-direction behavior must be explicit.                                                                                     |
| Positional record                | `#[napi(array)]`                                      | Use only when index meaning is stable and clearer than named fields.                                                                                                                    |
| Semantically transparent newtype | `#[napi(transparent)]`                                | Use only when the inner JavaScript value preserves the full semantic distinction.                                                                                                       |
| Fieldless enum                   | explicit numeric bridge plus literal public constants | Use binding-owned stable integer codes, exported `EnumValue` inference, exact finite-integer membership validation, recommended named constants, and one authoritative definition path. |
| Payload enum                     | structured `#[napi]` enum or manual conversion        | Preserve every variant and payload; if a discriminated object is chosen, use a stable discriminator and validate every field before mutation.                                           |
| Synchronous callback             | `Function<Args, Return>`                              | Scope-bound leaf measurement; expose only permitted owned inputs and reject same-tree native re-entry through the checked `RefCell` boundary.                                           |
| Retained callback                | `FunctionRef`                                         | Keep it tied to the owning Node environment and release it according to napi-rs's reference contract.                                                                                   |
| Cross-thread callback            | `ThreadsafeFunction`                                  | Different scheduling and failure semantics; use only for a separately designed off-thread API.                                                                                          |
| Expected failure                 | `napi::Result<T>`                                     | Convert validation and Taffy failures into stable JavaScript errors.                                                                                                                    |

## Numeric rules

JavaScript numbers are `f64`, while Taffy's layout values are predominantly `f32`. napi-rs 3 directly converts `f32` only from Rust to JavaScript, not from JavaScript to Rust. A concrete floating-point Style input accepts only a JavaScript `number`, without coercing strings, booleans, bigints, or other values. The bridge reads it as `f64` and explicitly converts it to `f32` using ordinary floating-point rounding; exact `f32` representability is not required. Output widens the actual stored `f32` to a JavaScript number and does not retain the original `f64` precision separately.

The scalar boundary accepts every JavaScript `number`, including negative values, `NaN`, positive and negative infinity, and finite `f64` values that become an infinite `f32`. It does not add property-domain checks, clamping, normalization, or default substitution. For a nullable floating-point field, `null` maps to Taffy `None`, while a concrete `NaN` remains `Some(NaN)`. Property JSDoc may describe normal semantic use without implying runtime enforcement. Stored Style and Layout output widens Taffy's actual finite or non-finite `f32`; it is not sanitized for JavaScript or JSON. A known Taffy panic or native-safety violation remains an exception to pass-through.

JavaScript indices, counts, and capacities must be safe integers within the supported Rust and practical allocation range. Perform checked arithmetic before allocation, indexing, or range construction.

`NodeId` wraps a `u64`, but that raw value alone is not the JavaScript identity. The public type is a bigint with a private TypeScript phantom marker and a private composite encoding that includes the issuing tree, a binding-issued serial for that node creation, and the raw Taffy NodeId. The phantom marker prevents accidental type compatibility but cannot validate a runtime bigint. Each public TaffyTree wrapper therefore keeps a private `raw NodeId -> current serial` map, checks every incoming NodeId against it in expected constant time, and only then extracts the raw value for an immediate synchronous native call. The initial native layer trusts that supported wrapper path and does not keep a duplicate serial registry.

A bigint can be cloned through Node worker messaging even though its TaffyTree cannot be transferred with it, while Node may evaluate the same ESM source more than once when it resolves to distinct URLs and may install multiple physical copies of one package. A counter stored only in one module evaluation therefore cannot reliably distinguish these unrelated trees. A NodeId is valid only for the exact TaffyTree that issued it and is not a persistent or transferable identity across workers or separately evaluated or installed package copies. Each tree independently generates a cryptographically secure token of at least 128 bits, and tree construction fails if secure generation fails. This avoids shared cross-module coordination and provides collision resistance rather than mathematical uniqueness. A target tree still applies its normal runtime check to a copied or foreign bigint and should reject it rather than accidentally treating unsupported transfer as a local node.

## Safety and soundness invariants

For this binding, safe means misuse of the supported @taffyjs/node API produces a documented value or controlled error without crashing or corrupting native state. Sound means no supported @taffyjs/node call sequence, callback, garbage-collection event, or worker interaction can violate Rust aliasing, lifetime, thread, or memory invariants. Direct use of @taffyjs/binding-<platform> is outside this contract.

### Node identities

- JavaScript receives a bigint NodeId with a private TypeScript phantom marker; its private encoding is not an API for serialization, arithmetic, tree access, or extracting Taffy's raw `u64`.
- A runtime NodeId validator must first require a bigint with the complete supported format, then decode its tree identity, binding-issued serial, and raw Taffy NodeId.
- The target public TaffyTree must reject a different tree identity and reject any raw NodeId whose current private registry entry does not equal the decoded serial.
- NodeId validation must happen before any supported call reaches a Taffy method that indexes node, parent, child, style, layout, or cache storage. Other ordinary input conversion must produce complete representable native values before the operation mutates tree state; its ordering relative to the single current-node lookup follows the value-object rule below.
- Removing a node deletes its registry entry, and clearing a tree clears the registry. If Taffy later reuses an internal ID, the replacement node receives a new serial, so the old public NodeId remains invalid.
- Keeping a NodeId in JavaScript after removal keeps only a bigint. Dropping a NodeId without removing its node does not remove native state; the TaffyTree and registry retain that node until explicit removal, clearing, or collection of the whole tree.
- Repeated retrieval of one current node returns the same bigint value. Callers may rely on `===`, `Map`, `Set`, and `includes` for identity, but equality alone does not establish that the node is still present.
- The JavaScript registry is the supported API's sole NodeId-validity registry. Native code does not repeat the same serial lookup. The ordinary value-object path performs one final registry lookup immediately before its synchronous native call and does not add a second lookup or a dedicated defensive copy solely for accessor or Proxy re-entry. A normal supported operation that executes application code after the lookup would reopen JS-only validation.

### Tree topology and indices

- Validate that every parent, child, and replacement node is live and belongs to the same tree before mutation.
- Validate child membership before removal and validate indices and complete ranges before forwarding them.
- Prevent self-parenting, cycles, duplicate child entries, and inconsistent multiple-parent relationships unless Taffy explicitly defines a safe semantic for the operation.
- Finish all validation available before the first mutation so an ordinary rejected JavaScript argument cannot leave a partially changed tree. A callback result is produced after computation has begun and therefore follows the separately selected callback-failure boundary rather than claiming prevalidation or Layout rollback.
- Define reparenting as one validated atomic operation rather than relying on an order of Taffy calls that can fail halfway through.

### Values

- Validate the complete nested value shape and all enum tags before changing tree state.
- If an input shape permits omitted fields, apply its documented defaults in native conversion code so the resulting Rust value is explicit; do not rely on mutable JavaScript shadow objects.
- Reject unsupported raw representations, including `CompactLength` bits and calc pointers.
- Use the explicitly selected numeric conversion for each Rust target and checked allocation arithmetic throughout the boundary; do not confuse integer representability and allocation safety with floating-point semantic range enforcement.

### Callbacks and reentrancy

- Design a callback as an observable sequence: identify its scheduler and invocation guarantees, argument ownership, allowed re-entry, success and failure carrier, cache invalidation, and post-failure state before treating its TypeScript signature as complete. Reuse Case 3's concrete zero-drain and subtree-invalidation protocol only when the upstream callback has the same synchronous infallible return and cache boundary.
- A measure callback must return synchronously with a complete representable size; floating-point payloads follow the default semantic pass-through unless evidence identifies a panic or native-safety exception.
- Materialize JavaScript callback arguments as owned boundary values; do not expose a Rust borrow or raw owner pointer as callback data.
- On the first JavaScript throw or invalid callback result, stop invoking user JavaScript, let Taffy's infallible stack finish with internal zero sizes, invalidate the requested root subtree's caches, and throw the first failure synchronously; keep the tree reusable without promising Layout rollback.
- Keep same-tree native operations unavailable during a measure callback and turn checked-borrow failure into `ERR_TAFFY_TREE_BUSY`; NodeId value operations and independent trees remain usable.
- Define dirtying responsibility for every binding-owned measurement or context change and document when callers must mark nodes dirty after external captured state changes; do not imply that a newly supplied callback will run when Taffy can reuse a prior cache entry.
- Retained JavaScript references must not outlive their Node environment, run on an arbitrary thread, or keep the process alive accidentally without an explicit policy.
- Release binding-owned node-context resources as part of node removal, tree clearing, and owner destruction; do not delegate that lifetime to Taffy's context storage.
- Any future off-thread layout API requires a separate contract for callbacks, context ownership, cancellation, and result delivery.

### Error and panic boundary

- Binding code must not use unchecked indexing, `unwrap`, `expect`, unchecked narrowing, or raw pointer construction on JavaScript-controlled data.
- Convert malformed input, stale or foreign-tree NodeIds, invalid relationships, invalid indices, and ordinary Taffy errors into stable JavaScript errors; propagate callback-thrown values and malformed measure results through their separately selected exception behavior.
- Treat a caught panic as an unexpected internal failure, not as a substitute for an expected validation error.
- Do not expose a tree for further mutation after an unexpected failure unless the binding can establish that all native invariants still hold.

Taffy 0.13 makes these checks necessary: several public TaffyTree methods index slotmaps directly, `remove_child` unwraps child membership, range removal documents a panic for invalid ranges, and `NodeId` carries no tree identity. Although `TaffyError` declares invalid-node variants, this version's implementation explicitly constructs only `ChildIndexOutOfBounds`; invalid node keys generally do not become a typed error. The bridge must not forward untrusted JavaScript values into those paths unchecked.

## Initial mapping inventory

This inventory fixes categories and obligations, not final JavaScript spellings.

| Taffy type family                                       | Binding role                       | Direction                                       | Required rule before API design                                                                                                                                                                                      |
| ------------------------------------------------------- | ---------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TaffyTree<()>`                                         | Stateful native owner              | Private native class behind a public JS wrapper | Sole layout-state owner behind TaffyTree-centered high-level operations; optional unit context records only the presence of JavaScript-owned context.                                                                |
| `NodeId`                                                | Value-based node identity          | Branded JavaScript bigint                       | Private composite encoding, stable value equality, and JavaScript validation against the target tree's current-node registry before synchronous native use.                                                          |
| `Style<DefaultCheapStr>`                                | Node input and observable snapshot | Both directions may be useful                   | Ordinary partial object input with selected default, absence, unknown-field, replacement, and calc rules; complete eager plain-object output with recursively readonly declarations and no runtime freeze.           |
| `Size<T>`, `Rect<T>`, `Point<T>`, `Line<T>`             | Geometry value families            | Depends on concrete `T`                         | Concrete Rust wrappers; truthful TypeScript generics; partial Style-field input filled from the enclosing default; homogeneous semantic-length `Size` and `Rect` input may expand one contained value.               |
| `Layout`                                                | Stored output snapshot             | Rust to JavaScript                              | Return an owned copy of Taffy's currently stored value without computing; no mutable view into tree storage.                                                                                                         |
| `AvailableSpace`                                        | Layout constraint variant          | Both                                            | Numeric-literal `AvailableSpaceKind` tagged records, JavaScript-number definite payload, `AvailableSpace` conveniences, mutable input, readonly callback output, and no bare-number, string, symbol, or packed form. |
| `Dimension`, `LengthPercentage`, `LengthPercentageAuto` | Semantic length variants           | Both                                            | Numeric `LengthUnit` tagged records, user-facing percent magnitudes, `Dimension` construction conveniences, readonly canonical output, and no string, bare-number, compact-storage, or calc form.                    |
| Fieldless style enums                                   | Closed semantic values             | Usually both                                    | Binding-owned numeric literal codes, exported `EnumValue` inference, singular PascalCase constant families and members, exact runtime membership validation, and one authoritative shared definition path.           |
| Alignment and grid compound types                       | Nested style values                | Both                                            | Selected flattened alignment values and numeric-tagged grid variants, exact Rust integer conversion, ordinary identifier strings, and fully copied nested arrays with recursively readonly output.                   |
| Unit context `()`                                       | Per-node native context            | Rust-internal presence marker                   | Preserve optional context and dirtying; use Taffy's raw NodeId to recover the public NodeId that keys the JavaScript-owned value.                                                                                    |
| Measure closure                                         | Leaf intrinsic-size extension      | JavaScript function called by Rust              | Use the selected synchronous compute-time callback, invocation, context-side-effect, result, and failure contracts; retained-callback additions remain open.                                                         |
| `TaffyError` and binding validation failures            | Controlled failure                 | Rust to JavaScript throw                        | Stable error category and message context; never rely on panic text.                                                                                                                                                 |
| `DetailedLayoutInfo`                                    | Optional high-level output         | Rust to JavaScript                              | Output-only snapshot if included; feature and completeness policy remain open.                                                                                                                                       |

## Per-type alignment record

Before settling the JavaScript design for a new public type, answer these questions in the relevant alignment case or design record:

1. Which agreed high-level layout flow requires the type?
2. Is it a native owner, node identity, input value, output snapshot, callback, or error?
3. Which concrete Taffy instantiation is used at runtime?
4. Is conversion JavaScript-to-Rust, Rust-to-JavaScript, or both?
5. What is copied, borrowed for one call, or retained across calls?
6. Which defaults and semantic variants must be preserved?
7. Which malformed values, stale states, ownership errors, and known panic cases must be rejected, and which Rust-representable semantic edge cases must pass through to Taffy?
8. Can any callback re-enter or outlive the native operation?
9. What controlled JavaScript error represents each expected failure?
10. What integration and end-to-end cases demonstrate valid behavior and hostile misuse?
11. What conversion or callback cost is paid per node, field, or collection element?
12. Does the generated TypeScript declaration exactly describe runtime validation and direction, and does property-level JSDoc explain every accepted `null` and `undefined` distinction?
13. Does the normal supported path deliberately invoke application code while native state is borrowed or after another validation has become stale? Account for explicit callbacks and other ordinary behavior, but do not make getter- or Proxy-driven re-entry a baseline use case.

## Dependency upgrade procedure

When Taffy or napi-rs changes:

1. Pin and identify the exact new versions before reviewing documentation.
2. Diff TaffyTree's high-level method families and the transitive input, output, callback, and error types used by the agreed layout flows.
3. Ignore unrelated new public low-level symbols unless a new product requirement expands scope.
4. Reclassify every changed type using this document rather than preserving an old JavaScript representation automatically.
5. Recheck napi-rs conversion directions, lifetime rules, enum behavior, generated declarations, Node-API feature requirements, and the generated order of argument conversion, receiver formation, native invocation, and return conversion.
6. Re-audit every handle, topology, numeric, callback, context-lifetime, and panic precondition affected by the change.
7. Update binding-local conversions and JavaScript integration tests together.
8. Measure any proposed representation change whose justification is lower overhead.
9. Require a new vouched decision for a scope expansion, new state owner, new public compatibility layer, or weakened safety invariant.

## Deferred choices and reopen conditions

This reference intentionally does not decide JavaScript class and method names outside the selected reads and layout-computation methods, the private NodeId bit layout and allocation mechanisms, the future mechanical Style field inventory, closed-enum concrete numeric codes and authoritative generation mechanism, payload-value shapes not explicitly selected here, runtime-frozen Layout or other undecided output objects, retained or additional measure APIs, error classes outside the vouched re-entry error and ordinary measure-result `TypeError`, output selection, batching, detailed-layout support, or panic-containment implementation. The mechanical Style items do not keep Case 2 open, and retained or additional callback APIs do not keep Case 3 open. Complete eager snapshots are recorded in architecture; output optimization research is preserved separately without creating implementation work. The API choices become separate decisions only when another API-alignment case needs them or Yunfei explicitly asks to settle them.
