# Taffy-to-Node Binding Mapping

This is the working reference for mapping Taffy's high-level Rust layout API into @taffyjs/node. It describes repeatable mapping and safety rules, not a frozen JavaScript API. Each mapping separates the boundary semantics that must be preserved from the JavaScript representation that remains a design choice. Vouched product direction remains in [@taffyjs/node decisions](taffyjs-node-decisions.md), while [binding mapping cases](binding-cases.md) explain the rules through observed Rust behavior and candidate JavaScript boundaries.

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

## Lessons from the first mapping case

The first completed mapping case covers TaffyTree layout state and node identity. It supports these reusable rules:

- Start with observable Rust behavior and normal operation sequences, then choose the JavaScript representation. A public Rust declaration or syntax shape is not by itself an API requirement.
- Preserve state ownership while distinguishing required binding metadata from copied Taffy state. Taffy owns tree structure, Style, Layout, caches, and computation; the NodeId registry records only identity and validity, and a JavaScript cache of Taffy-owned data would be a separate optimization.
- Choose representations for ordinary JavaScript use while preserving Rust semantics. A Rust newtype does not automatically require a native JavaScript object; NodeId is a bigint because JavaScript identity comparison and keyed collections are normal node operations that should not require a native call.
- Add private boundary information when the Rust identifier lacks a guarantee required by JavaScript. Taffy's NodeId does not identify its tree, so the public value also records the issuing tree and the binding-issued identity of that node creation without exposing those fields as a persistence or arithmetic format.
- Treat TypeScript markers and readonly declarations as compile-time guidance rather than runtime validation. The wrapper still checks the form, owner, and current validity of every NodeId that a tree consumes.
- Separate identity equality from current validity. Equal NodeId bigints name the same binding-issued node identity, but a tree operation still rejects that value after removal.
- Do not turn a borrowed Rust result into a live JavaScript view. `layout(node)` returns an independent snapshot of the value Taffy currently stores and does not compute a new layout.
- Keep optional convenience and optimization separate from the direct path. Automatic layout and JavaScript caches require their own semantics and evidence; they must not replace Taffy's direct behavior.

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

Layout reads and computation remain separate operations. A newly created node stores a zero Layout, and `layout(node)` returns it without computing. `set_style` changes the Style and marks the affected cache state dirty, but `layout(node)` continues to return the previously stored result until the caller computes again. If the dirty-state query is exposed, it reports Taffy's cache state; it does not prove that a node's stored layout is current. An API that computes automatically may be added only as a separate convenience. [Case 1](binding-cases.md#case-1-taffytree-layout-state-and-node-identities) shows the observed behavior.

Taffy's expected measurement flow treats the callback as a synchronous intrinsic-size function for leaf nodes. One closure is supplied for a compute call; Taffy passes the current node identity, optional per-node context, constraints, and style. The official example stores text or image data in node context and lets the closure borrow an external font registry. A real Taffy-based terminal UI, iocraft, stores a per-component measure function in node context and uses one compute-time closure as the dispatcher. A Yoga-style callback retained directly on each node is therefore a plausible convenience mapping, but it is not the literal shape of Taffy's high-level method.

### Selected layout-computation signatures

The direct JavaScript API keeps Taffy's separate computation methods and changes their positional Rust inputs into named JavaScript objects:

```ts
type Size<T> = Readonly<{
  width: T;
  height: T;
}>;

type MeasureInput<TContext> = Readonly<{
  knownDimensions: Size<number | undefined>;
  availableSpace: Size<AvailableSpace>;
  node: NodeId;
  context: TContext | undefined;
  style: ReadonlyStyle;
}>;

type MeasureFunction<TContext> = (input: MeasureInput<TContext>) => Size<number>;

interface ComputeLayoutOptions {
  root: NodeId;
  availableSpace: Size<AvailableSpace>;
}

interface ComputeLayoutWithMeasureOptions<TContext> {
  root: NodeId;
  availableSpace: Size<AvailableSpace>;
  measure: MeasureFunction<TContext>;
}

class TaffyTree<TContext = unknown> {
  computeLayout(options: ComputeLayoutOptions): void;

  computeLayoutWithMeasure(options: ComputeLayoutWithMeasureOptions<TContext>): void;
}
```

Both methods compute explicitly; neither reads layout, computes automatically, stores a per-node callback, or adds a second layout abstraction. A successful Rust `Result<(), TaffyError>` maps to `void`, while failure maps to a controlled JavaScript exception. The callback is synchronous, and a Promise is not a valid measured size. `knownDimensions`, `availableSpace`, `node`, `context`, and `style` correspond directly to Taffy's five callback inputs, but every Rust borrow becomes an owned JavaScript boundary value. `ReadonlyStyle` records that callback mutation cannot alter Taffy; its concrete representation and any runtime freezing cost remain open.

`TaffyTree<TContext>` is only a TypeScript relationship between a tree and the JavaScript values in its context registry. The native tree remains `TaffyTree<()>`. In `context: TContext | undefined`, `undefined` always means absence: creating or setting an undefined context clears both the registry entry and Taffy's unit presence marker. `null` and other values remain present. Whether callback code may replace a context value remains open.

## Rust modeling categories

### Stateful structs

An owned Rust aggregate with identity and mutable state maps to one private napi-rs class backed by one Rust value. The public JavaScript `TaffyTree` wrapper owns that private native class and the binding-only NodeId registry. JavaScript garbage collection may own the lifetime of the wrappers, but tree, style, layout, topology, and computation state remain native Rust and Taffy state.

Do not expose the private native class, its fields, raw Taffy NodeIds, or raw methods through the supported @taffyjs/node API. Mutations go through validated public methods so the wrapper can preserve the JavaScript and Taffy invariants together.

Methods may map directly to native TaffyTree operations when the JavaScript boundary can preserve their semantics and safety. The class representation must not force lower-level tree traits, internal storage, or Rust borrowing syntax into the public API. Synchronous same-tree callback re-entry uses the vouched checked-borrow boundary; callback failure containment remains a separate design question and does not determine the public abstraction level.

### Value structs

Value semantics do not imply one shared JavaScript representation. `Style`, concrete instantiations of generic geometry types, and `Layout` have different directions, costs, and ownership obligations even though none is the native tree owner.

`Style<DefaultCheapStr>` is a large owned input value stored in the tree. A JavaScript input must be converted and validated completely before mutation begins. If style reading is exposed, the result is an independent snapshot, never a live view. A plain object is a natural baseline candidate, while an additive native or preconverted style representation may be considered if repeated nested conversion is measured as material.

`Size<T>`, `Rect<T>`, `Point<T>`, and `Line<T>` are generic Rust shapes rather than single runtime Node-API types. The binding must define concrete conversion types for each required instantiation, such as `Size<AvailableSpace>`, `Size<Option<f32>>`, `Size<f32>`, and `Size<Dimension>`. TypeScript may use truthful generic helper declarations even though the native converters are concrete. Object, tuple, positional-argument, and specialized hot-path representations remain separate choices.

`Layout` is output state stored in the tree. Taffy returns the currently stored value by reference, including zero before the first computation and an earlier result after inputs change. The JavaScript API must return an owned snapshot or an explicitly designed batch output. Mutating a returned JavaScript layout must not mutate the tree. Readonly TypeScript fields and runtime sealing or freezing remain open API and cost choices.

A binding-local `#[napi(object)]`, `#[napi(array)]`, `#[napi(transparent)]`, or manually converted wrapper may transport value types across Node-API. The choice follows the concrete direction and cost rather than the Rust declaration kind alone.

Choose conversion direction explicitly. Input-only shapes may disable Rust-to-JavaScript conversion, and output-only snapshots may disable JavaScript-to-Rust conversion. napi-rs object conversion owns and copies the fields; it does not create a live view of the Rust value.

A borrowed Rust return such as `&Style` or `&Layout` must not escape as a JavaScript borrow. Return an owned snapshot or another explicitly owned native value. Mutating that JavaScript result must not mutate the tree.

### Closed enums

Fieldless enums such as `Display`, `Position`, `Overflow`, `FlexDirection`, and `GridAutoFlow` map through binding-local closed values with exhaustive runtime validation. napi-rs supports numeric and string enums, but that support does not choose the public representation. The mapping must define a stable JavaScript vocabulary deliberately; never expose an incidental Rust discriminant as an accidental compatibility contract. String versus explicitly numbered values remains an API choice.

### Data-carrying enums and semantic newtypes

Data-carrying enums such as `AvailableSpace` and grid placement or repetition values map by their semantic variants and payloads. napi-rs structured enums can represent them as discriminated object unions, but a tagged object is not mandatory when another representation is unambiguous and cheaper. For example, a definite available space is distinguishable from min-content and max-content using a number and two explicit keywords, while numeric line and span grid placements require an explicit distinction.

Taffy also represents several semantic variants as compact newtypes rather than Rust enums. `Dimension`, `LengthPercentage`, `LengthPercentageAuto`, and track sizing types wrap `CompactLength`. Preserve their length, percent, auto, track, and other supported meanings at the binding boundary; do not expose their packed bits, private tags, raw values, raw pointers, or unsafe constructors. Tagged unions, disjoint primitive unions, and other explicit semantic shapes remain representation candidates rather than a uniform rule.

The `calc` feature's opaque pointer representation must never cross from JavaScript. Supporting calc requires a separate owned representation and resolver design that preserves lifetime and error invariants.

### Generic structs and aliases

Node-API conversion is concrete at runtime. Instantiate each Rust bridge type for the exact nested Taffy value it converts. TypeScript may still use generic helper interfaces or aliases when they truthfully describe several concrete runtime conversions; a TypeScript generic declaration does not create runtime conversion or validation.

Rust aliases such as `AlignSelf = AlignItems` normally need one runtime representation and may retain separate TypeScript aliases when the semantic names are useful.

### Options, collections, and ranges

Specify missing, `undefined`, and `null` behavior for every optional field instead of accepting napi-rs defaults accidentally. Specify whether a collection is copied, borrowed during one synchronous call, or retained. Validate every element before mutation begins.

Rust `usize` and generic range bounds do not define a safe JavaScript input contract. Accept JavaScript safe integers through a checked bridge representation, convert with `TryFrom`, and validate complete ranges before calling Taffy.

### Results and panics

Expected Rust failures map to `napi::Result<T>` and controlled JavaScript errors. Preserve a stable binding-level error category and useful Taffy context without exposing internal panic text as an API.

Do not assume a `TaffyResult` signature makes the call panic-safe. Validate all JavaScript-controlled preconditions before invoking Taffy. Panic containment can be a final defensive boundary, but it is not normal control flow and cannot replace validation.

### Callbacks and retained JavaScript values

Taffy's measure function is synchronous and requires an immediate `Size<f32>` result. A callback used only during one compute call maps to a scoped napi-rs `Function`. Use `FunctionRef` only if a JavaScript function must survive beyond the current native call. `ThreadsafeFunction` is for genuine cross-thread invocation and is not a transparent replacement for Taffy's synchronous `FnMut`.

Keep node context and the measure function separate in the model. The binding may eventually choose per-node callbacks, shared callbacks plus per-node data, or another concrete context, but that is an API decision rather than a consequence of Taffy's generic parameter.

Actual JavaScript node-context values remain entirely in a wrapper-owned JavaScript registry keyed by the current public NodeId. The native tree uses `TaffyTree<()>`; its optional unit context records presence only and does not own an identifier or the JavaScript value. Context changes on a live node must keep the JavaScript registry and Taffy's presence marker consistent, while node removal and tree clearing must delete the corresponding JavaScript registry entries. Taffy 0.13 leaves `node_context_data` entries behind in `remove` and `clear`, but those native entries contain only `()` under this design and cannot retain a JavaScript value.

Measurement state and Taffy's cache need an explicit invalidation contract. Taffy 0.13's layout cache key does not include the identity or contents of the measure callback or node context. `set_node_context` marks its node dirty, mutable context access does not do so automatically, and changing a callback supplied per compute does not invalidate an existing cache entry. The JavaScript design must decide where dirtying responsibility belongs: binding-owned setters can dirty affected nodes, while a direct per-compute callback may preserve Taffy's caller responsibility for marking nodes dirty when captured measurement inputs change. Supplying a different function must not imply that Taffy will call it during that compute.

#### Measurement boundary questions

Taffy's measure closure returns `Size<f32>`, not `Result<Size<f32>, _>`, while a napi-rs `Function` call can fail because JavaScript throws or because its return value cannot be converted. A callback error therefore cannot propagate directly through Taffy's closure with `?`.

Safe Rust also holds an exclusive borrow of the TaffyTree throughout `compute_layout_with_measure`. The closure receives the current node's inputs and context but no tree reference, so Taffy does not provide an inherited high-level capability for same-tree re-entry. JavaScript can still capture the wrapper and attempt access. The public callback type therefore exposes only allowed owned inputs, its documentation states that the same native tree is unavailable until it returns, and actual same-tree re-entry is rejected at the native boundary.

The pinned napi-rs receiver code generation does not add a dynamic borrow check for synchronous `&mut self` methods. It unwraps the native pointer and constructs an `&mut` receiver for each call. Ordinary synchronous JavaScript cannot run concurrently with that method, but `compute_layout_with_measure` deliberately calls JavaScript before its mutable borrow ends. If that callback reaches another `&mut self` or `&self` method on the same private native tree, napi-rs can construct another Rust reference while the first exclusive reference is still active. The binding must therefore avoid napi-rs `&mut self` receivers for this state rather than treating documentation as sufficient protection.

The selected private native representation owns `RefCell<TaffyTree<()>>` and every future native field governed by the same access rule, exposes shared `&self` napi-rs receivers, and uses `try_borrow` or `try_borrow_mut` once per native operation. A same-tree callback entry must turn a failed borrow into an ordinary JavaScript `Error` with stable code `ERR_TAFFY_TREE_BUSY`; the diagnostic message names the attempted operation and explains that the tree cannot be accessed while it is computing layout from a measure callback. The failed operation must not silently do nothing or return `undefined`. A different tree has independent borrow state and remains usable. This checked borrow does not require a duplicate JavaScript busy flag and protects a different invariant from NodeId validation.

An operation that changes both native state and a JavaScript registry must define an order that does not report success with the two sides inconsistent. The exact ordering and failure recovery belong to that operation's implementation. `UnsafeCell` alone is not an alternative to the checked borrow because it permits interior mutation without detecting overlapping access.

The callback is not necessarily pure: `FnMut` may update captured external state, and Taffy deliberately passes mutable node context. The binding must preserve those intended effects while defining what happens to native layout and cache state after a callback exception or invalid result. The mapping rule records this required behavior without selecting an implementation mechanism before the measurement API and its supported behavior are decided.

### Traits

Rust traits are not mapped to JavaScript interfaces by default. Taffy's high-level `TaffyTree` already implements its internal tree and style traits. The low-level traits exist for Rust hosts that own another tree implementation, so they are outside this package's agreed scope.

## napi-rs mapping constraints

The binding crate must define local bridge types and explicit `From`, `TryFrom`, or conversion functions around upstream Taffy types. The external Taffy declarations cannot simply receive `#[napi]`, and the runtime direction and validation rules must remain visible in binding code.

| Rust boundary need               | napi-rs tool                                   | Required caution                                                                                                                                                             |
| -------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native state                     | Private `#[napi]` class with Rust fields       | Keep the native TaffyTree as the sole layout-state owner behind an authored public JavaScript wrapper; do not export raw node operations as supported API.                   |
| Node identity                    | Branded JavaScript bigint and private JS `Map` | Encode tree identity, binding-issued node identity, and raw Taffy NodeId privately; validate against the current-node registry before the immediate synchronous native call. |
| Owned input or output record     | `#[napi(object)]`                              | Conversion copies nested values. Optional-field and conversion-direction behavior must be explicit.                                                                          |
| Positional record                | `#[napi(array)]`                               | Use only when index meaning is stable and clearer than named fields.                                                                                                         |
| Semantically transparent newtype | `#[napi(transparent)]`                         | Use only when the inner JavaScript value preserves the full semantic distinction.                                                                                            |
| Fieldless enum                   | numeric or string `#[napi]` enum               | Pick stable values deliberately and validate unknown values.                                                                                                                 |
| Payload enum                     | structured `#[napi]` enum or manual conversion | Preserve every variant and payload; if a discriminated object is chosen, use a stable discriminator and validate every field before mutation.                                |
| Synchronous callback             | `Function<Args, Return>`                       | Scope-bound leaf measurement; expose only permitted owned inputs and reject same-tree native re-entry through the checked `RefCell` boundary.                                |
| Retained callback                | `FunctionRef`                                  | Keep it tied to the owning Node environment and release it according to napi-rs's reference contract.                                                                        |
| Cross-thread callback            | `ThreadsafeFunction`                           | Different scheduling and failure semantics; use only for a separately designed off-thread API.                                                                               |
| Expected failure                 | `napi::Result<T>`                              | Convert validation and Taffy failures into stable JavaScript errors.                                                                                                         |

## Numeric rules

JavaScript numbers are `f64`, while Taffy's layout values are predominantly `f32`. napi-rs 3 directly converts `f32` only from Rust to JavaScript, not from JavaScript to Rust. Accept `f64` in input bridge types and perform a checked, property-aware conversion to `f32`; define whether ordinary representable values use normal rounding, and never use an unchecked `as f32` cast on JavaScript input.

Each numeric field must define whether it permits negative values, zero, infinity, or NaN. Reject values outside the Taffy property's semantic domain and conversions that overflow or otherwise violate the chosen `f32` range and precision policy. Widening a finite output `f32` to a JavaScript number is safe, but non-finite layout output must follow an explicit output policy.

JavaScript indices, counts, and capacities must be safe integers within the supported Rust and practical allocation range. Perform checked arithmetic before allocation, indexing, or range construction.

`NodeId` wraps a `u64`, but that raw value alone is not the JavaScript identity. The public type is a bigint with a private TypeScript phantom marker and a private composite encoding that includes the issuing tree, a binding-issued serial for that node creation, and the raw Taffy NodeId. The phantom marker prevents accidental type compatibility but cannot validate a runtime bigint. Each public TaffyTree wrapper therefore keeps a private `raw NodeId -> current serial` map, checks every incoming NodeId against it in expected constant time, and only then extracts the raw value for an immediate synchronous native call. The initial native layer trusts that supported wrapper path and does not keep a duplicate serial registry.

A bigint can be cloned through Node worker messaging even though its TaffyTree cannot be transferred with it, while Node may evaluate the same ESM source more than once when it resolves to distinct URLs and may install multiple physical copies of one package. A counter stored only in one module evaluation therefore cannot reliably distinguish these unrelated trees. A NodeId is valid only for the exact TaffyTree that issued it and is not a persistent or transferable identity across workers or separately evaluated or installed package copies. Each tree independently generates a cryptographically secure token of at least 128 bits, and tree construction fails if secure generation fails. This avoids shared cross-module coordination and provides collision resistance rather than mathematical uniqueness. A target tree still applies its normal runtime check to a copied or foreign bigint and should reject it rather than accidentally treating unsupported transfer as a local node.

## Safety and soundness invariants

For this binding, safe means misuse of the supported @taffyjs/node API produces a documented value or controlled error without crashing or corrupting native state. Sound means no supported @taffyjs/node call sequence, callback, garbage-collection event, or worker interaction can violate Rust aliasing, lifetime, thread, or memory invariants. Direct use of @taffyjs/binding-<platform> is outside this contract.

### Node identities

- JavaScript receives a bigint NodeId with a private TypeScript phantom marker; its private encoding is not an API for serialization, arithmetic, tree access, or extracting Taffy's raw `u64`.
- A runtime NodeId validator must first require a bigint with the complete supported format, then decode its tree identity, binding-issued serial, and raw Taffy NodeId.
- The target public TaffyTree must reject a different tree identity and reject any raw NodeId whose current private registry entry does not equal the decoded serial.
- Validation must happen before any supported call reaches a Taffy method that indexes node, parent, child, style, layout, or cache storage. The implementation must normalize other caller-supplied inputs before the final current-node lookup and then make the synchronous native call with already-normalized values; otherwise the JS-only validity check is not sufficient.
- Removing a node deletes its registry entry, and clearing a tree clears the registry. If Taffy later reuses an internal ID, the replacement node receives a new serial, so the old public NodeId remains invalid.
- Keeping a NodeId in JavaScript after removal keeps only a bigint. Dropping a NodeId without removing its node does not remove native state; the TaffyTree and registry retain that node until explicit removal, clearing, or collection of the whole tree.
- Repeated retrieval of one current node returns the same bigint value. Callers may rely on `===`, `Map`, `Set`, and `includes` for identity, but equality alone does not establish that the node is still present.
- The JavaScript registry is the supported API's sole NodeId-validity registry. Native code does not repeat the same serial lookup, so a supported path must not permit the tree to change between the final registry lookup and the synchronous native operation. An implementation that cannot maintain that ordering must revisit JS-only validation.

### Tree topology and indices

- Validate that every parent, child, and replacement node is live and belongs to the same tree before mutation.
- Validate child membership before removal and validate indices and complete ranges before forwarding them.
- Prevent self-parenting, cycles, duplicate child entries, and inconsistent multiple-parent relationships unless Taffy explicitly defines a safe semantic for the operation.
- Finish all validation before the first mutation so a rejected JavaScript call cannot leave a partially changed tree.
- Define reparenting as one validated atomic operation rather than relying on an order of Taffy calls that can fail halfway through.

### Values

- Validate the complete nested value shape and all enum tags before changing tree state.
- If an input shape permits omitted fields, apply its documented defaults in native conversion code so the resulting Rust value is explicit; do not rely on mutable JavaScript shadow objects.
- Reject unsupported raw representations, including `CompactLength` bits and calc pointers.
- Use checked numeric conversions and checked allocation arithmetic throughout the boundary.

### Callbacks and reentrancy

- A measure callback must return synchronously with a fully validated size.
- Materialize JavaScript callback arguments as owned boundary values; do not expose a Rust borrow or raw owner pointer as callback data.
- Define how a JavaScript throw or invalid callback result becomes a controlled error and whether the affected tree, layout, and cache remain readable or reusable; do not assume rollback, poisoning, or rebuilding before that failure policy is decided.
- Keep same-tree native operations unavailable during a measure callback and turn checked-borrow failure into `ERR_TAFFY_TREE_BUSY`; NodeId value operations and independent trees remain usable.
- Define dirtying responsibility for every binding-owned measurement or context change and document when callers must mark nodes dirty after external captured state changes; do not imply that a newly supplied callback will run when Taffy can reuse a prior cache entry.
- Retained JavaScript references must not outlive their Node environment, run on an arbitrary thread, or keep the process alive accidentally without an explicit policy.
- Release binding-owned node-context resources as part of node removal, tree clearing, and owner destruction; do not delegate that lifetime to Taffy's context storage.
- Any future off-thread layout API requires a separate contract for callbacks, context ownership, cancellation, and result delivery.

### Error and panic boundary

- Binding code must not use unchecked indexing, `unwrap`, `expect`, unchecked narrowing, or raw pointer construction on JavaScript-controlled data.
- Convert malformed input, stale or foreign-tree NodeIds, invalid relationships, invalid indices, callback failures, and ordinary Taffy errors into stable JavaScript errors.
- Treat a caught panic as an unexpected internal failure, not as a substitute for an expected validation error.
- Do not expose a tree for further mutation after an unexpected failure unless the binding can establish that all native invariants still hold.

Taffy 0.13 makes these checks necessary: several public TaffyTree methods index slotmaps directly, `remove_child` unwraps child membership, range removal documents a panic for invalid ranges, and `NodeId` carries no tree identity. Although `TaffyError` declares invalid-node variants, this version's implementation explicitly constructs only `ChildIndexOutOfBounds`; invalid node keys generally do not become a typed error. The bridge must not forward untrusted JavaScript values into those paths unchecked.

## Initial mapping inventory

This inventory fixes categories and obligations, not final JavaScript spellings.

| Taffy type family                                       | Binding role                       | Direction                                        | Required rule before API design                                                                                                                             |
| ------------------------------------------------------- | ---------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TaffyTree<()>`                                         | Stateful native owner              | Private native class behind a public JS wrapper  | Sole layout-state owner behind TaffyTree-centered high-level operations; optional unit context records only the presence of JavaScript-owned context.       |
| `NodeId`                                                | Value-based node identity          | Branded JavaScript bigint                        | Private composite encoding, stable value equality, and JavaScript validation against the target tree's current-node registry before synchronous native use. |
| `Style<DefaultCheapStr>`                                | Node input and observable snapshot | Both directions may be useful                    | Complete semantic conversion, explicit defaults, no live JavaScript view; object versus native value wrapper remains open.                                  |
| `Size<T>`, `Rect<T>`, `Point<T>`, `Line<T>`             | Geometry value families            | Depends on concrete `T`                          | Concrete Rust wrappers; TypeScript generics allowed only as truthful declarations; checked nested conversion.                                               |
| `Layout`                                                | Stored output snapshot             | Rust to JavaScript                               | Return an owned copy of Taffy's currently stored value without computing; no mutable view into tree storage.                                                |
| `AvailableSpace`                                        | Layout constraint variant          | JavaScript to Rust, possibly output in callbacks | Unambiguous semantic variants with a checked definite length; exact JavaScript shape remains open.                                                          |
| `Dimension`, `LengthPercentage`, `LengthPercentageAuto` | Semantic length variants           | Primarily JavaScript to Rust                     | Preserve length, percent, auto, and supported variants without exposing compact storage.                                                                    |
| Fieldless style enums                                   | Closed semantic values             | Usually both                                     | Stable chosen representation and unknown-value rejection.                                                                                                   |
| Alignment and grid compound types                       | Nested style values                | Primarily JavaScript to Rust                     | Preserve semantic variants and names; validate complete nested arrays and identifiers.                                                                      |
| Unit context `()`                                       | Per-node native context            | Rust-internal presence marker                    | Preserve optional context and dirtying; use Taffy's raw NodeId to recover the public NodeId that keys the JavaScript-owned value.                           |
| Measure closure                                         | Leaf intrinsic-size extension      | JavaScript function called by Rust               | Use the selected synchronous compute-time callback object; retained-callback additions and failure containment remain open.                                 |
| `TaffyError` and binding validation failures            | Controlled failure                 | Rust to JavaScript throw                         | Stable error category and message context; never rely on panic text.                                                                                        |
| `DetailedLayoutInfo`                                    | Optional high-level output         | Rust to JavaScript                               | Output-only snapshot if included; feature and completeness policy remain open.                                                                              |

## Per-type mapping record

Before implementing any new public type, record answers to these questions in the relevant design work or code review:

1. Which agreed high-level layout flow requires the type?
2. Is it a native owner, node identity, input value, output snapshot, callback, or error?
3. Which concrete Taffy instantiation is used at runtime?
4. Is conversion JavaScript-to-Rust, Rust-to-JavaScript, or both?
5. What is copied, borrowed for one call, or retained across calls?
6. Which defaults and semantic variants must be preserved?
7. Which malformed values, stale states, ownership errors, and numeric edge cases must be rejected?
8. Can any callback re-enter or outlive the native operation?
9. What controlled JavaScript error represents each expected failure?
10. What integration and end-to-end cases demonstrate valid behavior and hostile misuse?
11. What conversion or callback cost is paid per node, field, or collection element?
12. Does the generated TypeScript declaration exactly describe runtime validation and direction?
13. Can argument conversion, manual property access, return conversion, cleanup, or another Node-API operation execute JavaScript, and is native inner state unborrowed at that point?

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

## Open representation choices

This reference intentionally does not decide JavaScript class and method names outside the selected layout-computation methods, the private NodeId bit layout and allocation mechanisms, Style representation, geometry representation, enum spelling or numeric values, payload-value shape outside the decided node-context semantics, readonly or runtime-frozen output objects, retained or additional measure APIs, context replacement semantics, callback-failure propagation, error classes outside the vouched re-entry error, batching API, detailed-layout support, or panic-containment implementation. These choices use the rules above and become decisions only when Yunfei explicitly approves them.
