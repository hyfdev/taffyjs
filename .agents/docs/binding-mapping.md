# Taffy-to-Node Binding Mapping

This is the working reference for mapping Taffy's high-level Rust layout API into @taffyjs/node. It describes repeatable mapping and safety rules, not a frozen JavaScript API. Vouched product direction remains in [@taffyjs/node decisions](taffyjs-node-decisions.md).

The current evidence baseline is Taffy 0.13.0, napi 3.12.0, and napi-derive 3.6.2 as pinned by this repository. Re-evaluate version-sensitive facts when any of those dependencies changes.

Primary upstream references:

- [Taffy architecture and high-level API](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/lib.rs)
- [TaffyTree implementation](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/tree/taffy_tree.rs)
- [Taffy style model](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/style/mod.rs)
- [Taffy geometry types](https://github.com/DioxusLabs/taffy/blob/v0.13.0/src/geometry.rs)
- [napi-rs type conversions](https://napi.rs/docs/concepts/type-conversions)
- [napi-rs classes and value shapes](https://napi.rs/docs/concepts/class)
- [napi-rs enum mappings](https://napi.rs/docs/concepts/enum)
- [napi-rs error handling](https://napi.rs/docs/concepts/error-handling)

## Scope rule

Select Rust items by their role in normal layout usage, not by whether they are public or by whether they are declared as a struct, enum, trait, or function.

The binding scope is the TaffyTree-centered flow:

1. Create and configure a tree.
2. Create nodes with styles and optional measurement context.
3. Read and mutate tree relationships and node styles.
4. Supply available space and, when needed, a synchronous measure function.
5. Compute layout.
6. Read layout results and observable tree state.
7. Receive controlled errors for invalid input or operations.

Taffy's low-level custom-tree traits, trait-dependent single-algorithm compute functions, cache implementation, helper traits, and generic implementation infrastructure are not binding targets. A new public use case and explicit project decision are required before that boundary expands.

## Rust usage model

Taffy's basic Rust flow constructs a `TaffyTree`, creates `Style` values, inserts nodes, calls `compute_layout` or `compute_layout_with_measure`, and reads `Layout` snapshots by `NodeId`.

| Role               | Taffy model                                                                                             | How Rust uses it                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stateful owner     | `TaffyTree<NodeContext>`                                                                                | Owns node data, parent and child relationships, styles, rounded and unrounded layouts, caches, configuration, and optional per-node context.                                                           |
| Node identity      | `NodeId`                                                                                                | A copyable wrapper around the `u64` slotmap key. It contains slot generation data but no identity for the owning `TaffyTree`.                                                                          |
| Input state        | `Style<DefaultCheapStr>`                                                                                | An owned value copied into a node when it is created or when `set_style` runs. Its nested fields contain geometry records, closed enums, optional values, vectors, and semantic length or grid values. |
| Layout constraints | `Size<AvailableSpace>`                                                                                  | An owned width and height pair whose axes are definite lengths, min-content, or max-content constraints.                                                                                               |
| Output state       | `Layout`                                                                                                | Stored inside the tree and returned by Rust as a borrowed reference tied to that tree. It contains owned numeric geometry values.                                                                      |
| Node context       | Generic `NodeContext`                                                                                   | Optional owned data stored per node and passed as `Option<&mut NodeContext>` to the measure closure. The binding must choose a concrete bridge context.                                                |
| Measurement        | `FnMut(Size<Option<f32>>, Size<AvailableSpace>, NodeId, Option<&mut NodeContext>, &Style) -> Size<f32>` | A separate synchronous callback supplied to `compute_layout_with_measure`; it is not inherently the per-node context.                                                                                  |
| Failure            | `TaffyResult<T>` and `TaffyError`                                                                       | Declares invalid-node variants, but Taffy 0.13 explicitly returns only child-index errors; invalid, stale, or foreign `NodeId` paths generally index storage and may panic.                            |

The public high-level method families are constructors and rounding configuration; node creation and removal; node context access; parent and child mutation; style mutation; layout and dirty-state reads; layout computation; and optional debug or detailed-layout output. The JavaScript API does not have to reproduce every convenience method if the complete normal layout flow remains direct.

## Rust modeling categories

### Stateful structs

An owned Rust aggregate with identity and mutable state maps to a napi-rs class backed by one private Rust value. `TaffyTree` belongs to this category. JavaScript garbage collection may own the lifetime of the wrapper, but the tree state remains native Rust state.

Do not expose native-only fields as writable JavaScript class properties. Mutations go through validated methods so the wrapper can preserve tree invariants.

A guard inside an exported `&mut self` method is too late to make synchronous callback re-entry sound: napi-rs may already have formed the mutable receiver before the method body runs. Any operation that can call JavaScript while native state is borrowed must use a boundary that can reject re-entry before another mutable Rust reference is formed, such as an exported `&self` receiver with a fallible interior borrow or an equivalent ownership pattern. The exact mechanism remains an API and implementation choice.

### Value structs

Plain records such as concrete instantiations of `Size<T>`, `Rect<T>`, `Point<T>`, `Line<T>`, `Style`, and `Layout` are value types. A binding-local `#[napi(object)]`, `#[napi(array)]`, `#[napi(transparent)]`, or manually converted wrapper may transport them across Node-API.

Choose conversion direction explicitly. Input-only shapes may disable Rust-to-JavaScript conversion, and output-only snapshots may disable JavaScript-to-Rust conversion. napi-rs object conversion owns and copies the fields; it does not create a live view of the Rust value.

A borrowed Rust return such as `&Style` or `&Layout` must not escape as a JavaScript borrow. Return an owned snapshot or another explicitly owned native value. Mutating that JavaScript result must not mutate the tree.

### Closed enums

Fieldless enums such as `Display`, `Position`, `Overflow`, `FlexDirection`, and `GridAutoFlow` map through binding-local closed values. napi-rs supports numeric and string enums. The mapping must choose a stable JavaScript representation deliberately; never expose an incidental Rust discriminant as an accidental compatibility contract.

### Data-carrying enums and semantic newtypes

Data-carrying enums such as `AvailableSpace` and grid placement or repetition values map by their semantic variants. napi-rs structured enums can represent them as discriminated object unions.

Taffy also represents several semantic variants as compact newtypes rather than Rust enums. `Dimension`, `LengthPercentage`, `LengthPercentageAuto`, and track sizing types wrap `CompactLength`. Treat them as semantic tagged values at the binding boundary; do not expose their packed bits, private tags, raw pointers, or unsafe constructors.

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

The binding owns the lifetime of any JavaScript references stored in its concrete node context. Node removal, tree clearing, and owner destruction must explicitly release or unreference those resources. Taffy 0.13 does not remove entries from `node_context_data` in `remove` or `clear`, so the binding must not assume that Taffy releases bridge-owned context for it.

### Traits

Rust traits are not mapped to JavaScript interfaces by default. Taffy's high-level `TaffyTree` already implements its internal tree and style traits. The low-level traits exist for Rust hosts that own another tree implementation, so they are outside this package's agreed scope.

## napi-rs mapping constraints

The binding crate must define local bridge types and explicit `From`, `TryFrom`, or conversion functions around upstream Taffy types. The external Taffy declarations cannot simply receive `#[napi]`, and the runtime direction and validation rules must remain visible in binding code.

| Rust boundary need               | napi-rs tool                             | Required caution                                                                                                                                                                    |
| -------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native state and identity        | `#[napi]` class with private Rust fields | Public methods must validate owner, liveness, and operation state; callback-capable operations must reject re-entry before napi-rs forms another mutable receiver or native borrow. |
| Owned input or output record     | `#[napi(object)]`                        | Conversion copies nested values. Optional-field and conversion-direction behavior must be explicit.                                                                                 |
| Positional record                | `#[napi(array)]`                         | Use only when index meaning is stable and clearer than named fields.                                                                                                                |
| Semantically transparent newtype | `#[napi(transparent)]`                   | Use only when the inner JavaScript value preserves the full semantic distinction.                                                                                                   |
| Fieldless enum                   | numeric or string `#[napi]` enum         | Pick stable values deliberately and validate unknown values.                                                                                                                        |
| Payload enum                     | structured `#[napi]` enum                | Use a stable discriminator and validate every payload field before mutation.                                                                                                        |
| Synchronous callback             | `Function<Args, Return>`                 | Scope-bound; propagate JavaScript exceptions and forbid unsafe reentrancy.                                                                                                          |
| Retained callback                | `FunctionRef`                            | Keep it tied to the owning Node environment and release it according to napi-rs's reference contract.                                                                               |
| Cross-thread callback            | `ThreadsafeFunction`                     | Different scheduling and failure semantics; use only for a separately designed off-thread API.                                                                                      |
| Expected failure                 | `napi::Result<T>`                        | Convert validation and Taffy failures into stable JavaScript errors.                                                                                                                |

## Numeric rules

JavaScript numbers are `f64`, while Taffy's layout values are predominantly `f32`. napi-rs 3 directly converts `f32` only from Rust to JavaScript, not from JavaScript to Rust. Accept `f64` in input bridge types and perform a checked, property-aware conversion to `f32`; never use an unchecked `as f32` cast on JavaScript input.

Each numeric field must define whether it permits negative values, zero, infinity, or NaN. Reject values outside the Taffy property's semantic domain and values that cannot be represented safely as `f32`. Widening a finite output `f32` to a JavaScript number is safe, but non-finite layout output must follow an explicit output policy.

JavaScript indices, counts, and capacities must be safe integers within the supported Rust and practical allocation range. Perform checked arithmetic before allocation, indexing, or range construction.

`NodeId` wraps a `u64`. napi-rs emits Rust `u64` as JavaScript `bigint` but does not directly accept arbitrary JavaScript BigInts as `u64`; accepting a BigInt requires explicit lossless narrowing. More importantly, the raw value does not identify its owning tree. Do not expose a JavaScript number as an unvalidated node identity. The exact public encoding remains open.

## Safety and soundness invariants

For this binding, safe means JavaScript misuse produces a documented value or controlled error without crashing or corrupting the native state. Sound means no JavaScript call sequence, callback, garbage-collection event, or worker interaction can violate Rust aliasing, lifetime, thread, or memory invariants.

### Handles

- JavaScript must not be able to construct an arbitrary valid-looking node handle through the normal public API.
- Every node operation must establish the expected handle type, owning tree, and current liveness before calling Taffy.
- Handles become stale after their node is removed and all handles become stale when the tree is cleared or destroyed; stale use must return a controlled error.
- If cross-tree use is rejected, the bridge must carry or verify owner identity in addition to the raw `NodeId`; Taffy's key alone cannot provide this guarantee.
- Validation must happen before any Taffy method that indexes node, parent, child, style, layout, or cache storage.

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
- Convert a JavaScript throw or invalid callback result into a controlled error without leaving reusable partial layout or cache state behind.
- Do not hold a napi-rs-generated `&mut self` receiver across a JavaScript callback. Reject re-entry before a second mutable reference or incompatible native borrow can be formed.
- Retained JavaScript references must not outlive their Node environment, run on an arbitrary thread, or keep the process alive accidentally without an explicit policy.
- Release binding-owned node-context resources as part of node removal, tree clearing, and owner destruction; do not delegate that lifetime to Taffy's context storage.
- Any future off-thread layout API requires a separate contract for callbacks, context ownership, cancellation, and result delivery.

### Error and panic boundary

- Binding code must not use unchecked indexing, `unwrap`, `expect`, unchecked narrowing, or raw pointer construction on JavaScript-controlled data.
- Convert malformed input, stale or foreign handles, invalid relationships, invalid indices, callback failures, and ordinary Taffy errors into stable JavaScript errors.
- Treat a caught panic as an unexpected internal failure, not as a substitute for an expected validation error.
- Do not expose a tree for further mutation after an unexpected failure unless the binding can establish that all native invariants still hold.

Taffy 0.13 makes these checks necessary: several public TaffyTree methods index slotmaps directly, `remove_child` unwraps child membership, range removal documents a panic for invalid ranges, and `NodeId` carries no tree identity. Although `TaffyError` declares invalid-node variants, this version's implementation explicitly constructs only `ChildIndexOutOfBounds`; invalid node keys generally do not become a typed error. The bridge must not forward untrusted JavaScript values into those paths unchecked.

## Initial mapping inventory

This inventory fixes categories and obligations, not final JavaScript spellings.

| Taffy type family                                       | Binding role                       | Direction                                        | Required rule before API design                                                                                                                                   |
| ------------------------------------------------------- | ---------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TaffyTree<BridgeNodeContext>`                          | Stateful native owner              | JavaScript holds native class                    | Private Rust state, explicit reentrancy state, controlled destruction, no writable raw fields.                                                                    |
| `NodeId`                                                | Opaque node identity               | Produced and consumed by tree operations         | Owner and liveness validation; no arbitrary construction; exact representation open.                                                                              |
| `Style<DefaultCheapStr>`                                | Node input and observable snapshot | Both directions may be useful                    | Complete semantic conversion, explicit defaults, no live JavaScript view; object versus native value wrapper remains open.                                        |
| `Size<T>`, `Rect<T>`, `Point<T>`, `Line<T>`             | Geometry value families            | Depends on concrete `T`                          | Concrete Rust wrappers; TypeScript generics allowed only as truthful declarations; checked nested conversion.                                                     |
| `Layout`                                                | Computed output snapshot           | Rust to JavaScript                               | Owned output; no mutable view into tree storage.                                                                                                                  |
| `AvailableSpace`                                        | Layout constraint variant          | JavaScript to Rust, possibly output in callbacks | Semantic tagged value with checked definite length.                                                                                                               |
| `Dimension`, `LengthPercentage`, `LengthPercentageAuto` | Semantic length variants           | Primarily JavaScript to Rust                     | Preserve length, percent, auto, and supported variants without exposing compact storage.                                                                          |
| Fieldless style enums                                   | Closed semantic values             | Usually both                                     | Stable chosen representation and unknown-value rejection.                                                                                                         |
| Alignment and grid compound types                       | Nested style values                | Primarily JavaScript to Rust                     | Preserve semantic variants and names; validate complete nested arrays and identifiers.                                                                            |
| `BridgeNodeContext`                                     | Per-node native context            | API-dependent                                    | Concrete owned representation, independent from measure callback; explicitly release retained JS resources on node removal, tree clearing, and owner destruction. |
| Measure closure                                         | Synchronous compute extension      | JavaScript function called by Rust               | Synchronous result, exception propagation, result validation, and reentrancy guard.                                                                               |
| `TaffyError` and binding validation failures            | Controlled failure                 | Rust to JavaScript throw                         | Stable error category and message context; never rely on panic text.                                                                                              |
| `DetailedLayoutInfo`                                    | Optional high-level output         | Rust to JavaScript                               | Output-only snapshot if included; feature and completeness policy remain open.                                                                                    |

## Per-type mapping record

Before implementing any new public type, record answers to these questions in the relevant design work or code review:

1. Which agreed high-level layout flow requires the type?
2. Is it a native owner, opaque handle, input value, output snapshot, callback, or error?
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

## Dependency upgrade procedure

When Taffy or napi-rs changes:

1. Pin and identify the exact new versions before reviewing documentation.
2. Diff TaffyTree's high-level method families and the transitive input, output, callback, and error types used by the agreed layout flows.
3. Ignore unrelated new public low-level symbols unless a new product requirement expands scope.
4. Reclassify every changed type using this document rather than preserving an old JavaScript representation automatically.
5. Recheck napi-rs conversion directions, lifetime rules, enum behavior, generated declarations, and Node-API feature requirements.
6. Re-audit every handle, topology, numeric, callback, and panic precondition affected by the change.
7. Update binding-local conversions and JavaScript integration tests together.
8. Measure any proposed representation change whose justification is lower overhead.
9. Require a new vouched decision for a scope expansion, new state owner, new public compatibility layer, or weakened safety invariant.

## Open representation choices

This reference intentionally does not decide the JavaScript class and method names, node-handle encoding, Style object shape, enum spelling, nullability conventions, measure and context API, error classes, batching API, detailed-layout support, or panic-containment implementation. Those choices use the rules above and become decisions only when Yunfei explicitly approves them.
