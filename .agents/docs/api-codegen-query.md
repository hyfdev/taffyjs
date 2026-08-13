# API Query Code Generation

## Purpose and status

This document records the query-specific extension of the repository's [API code generation](api-codegen.md) design. The public API shape and selector semantics that would apply if selective query ships are defined by [Selective query design notes](query-api-design.md); this document preserves how a future implementation would fit the shared generator without making query-specific machinery part of every generated API family.

The selective-query implementation and its release are not approved or scheduled. Query-specific input formats, private operation numbering, protocol fingerprint, and packed representations remain implementation proposals. Shipping the API still requires performance evidence and a separate implementation decision. Any implementation must use the common `tools/api-codegen` input, compiler, emitter, output, command, and verification boundaries.

## Possible maintained inputs

A query implementation may need two inputs because public value shapes and query entry points change for different reasons:

```text
api/
├── public-output.json
├── query.json
└── schemas/
    ├── public-output.schema.json
    └── query.schema.json
```

`public-output.json` would describe the finite JavaScript values exposed by the binding: records, tagged unions, arrays, nullable values, scalars, public field names, Rust field mappings, and named conversion rules. It should distinguish values that can be followed field by field from values that can only be returned whole.

`query.json` would describe each native source and public root type that supports queries. It would reference public output types by stable names instead of repeating fields or conversions. Conceptually:

```json
{
  "$schema": "./schemas/query.schema.json",
  "formatVersion": 1,
  "domains": [
    {
      "method": "queryStyle",
      "source": "style",
      "rootType": "Style",
      "selectorFamily": "Style"
    },
    {
      "method": "queryLayout",
      "source": "layout",
      "rootType": "Layout",
      "selectorFamily": "Layout"
    },
    {
      "method": "queryUnroundedLayout",
      "source": "unroundedLayout",
      "rootType": "Layout",
      "selectorFamily": "Layout"
    },
    {
      "method": "queryDetailedLayoutInfo",
      "source": "detailedLayoutInfo",
      "rootType": "DetailedLayoutInfo",
      "selectorFamily": "DetailedLayoutInfo"
    }
  ]
}
```

The four conceptual entries reflect the decided public surface if selective query ships. `queryLayout` and `queryUnroundedLayout` expose the same selector and result contract over different native values, so they reference the same Layout family without requiring the generator to represent them with one particular internal model.

Adding a public Style field would change the public value description. Adding another query method over an existing value would change only the entry-point description. Complete getters or another output transport could reuse the value description only after their own design is approved; they would not depend on `query.json`.

Every input format would have an explicit version. Validation would reject unknown properties, invalid references, conflicting public names, unsupported converters, selector collisions, and recursive descent that has no explicit stopping rule.

## Query compilation

The query family would extend the shared compilation flow:

```text
validated public values and query roots
  -> resolved public type graph
  -> selector expansion
  -> normalized query operations
  -> Rust and TypeScript query emitters
```

Selector and absence semantics are fixed by [Selective query design notes](query-api-design.md), not per-domain configuration. Public field names are joined with `.`, each `[]` consumes one separately supplied index from left to right, and `.length` selects a collection length. An out-of-bounds index, inactive tagged variant, or null ancestor produces `undefined`, while an invalid index value is a malformed call. The generator must implement those rules rather than define another selector contract.

The compiler layer alone would resolve types, expand selectors, assign index positions, derive optional results, detect recursion or collisions, and assign private operation IDs. A normalized operation may resemble:

```ts
interface QueryOperation {
  readonly family: "Style" | "Layout" | "DetailedLayoutInfo";
  readonly selector: string;
  readonly operationId: number;
  readonly indices: readonly IndexSlot[];
  readonly result: ResultType;
  readonly access: readonly AccessStep[];
  readonly absence: readonly AbsenceReason[];
}
```

For example, one operation could record that `gridTemplateRows[].value.tracks[].max` belongs to Style, consumes two indices from left to right, returns `MaxTrackSizingFunction | undefined`, enters a Repeat variant, and is absent for an out-of-bounds index or inactive variant. Rust and TypeScript emitters would receive that completed operation rather than repeat selector traversal rules.

If a later public value contains a recursive expression tree, generation must stop unless the design explicitly returns that value whole, returns a reference, or defines a separate bounded data shape. The generator must not silently expand an unbounded selector set.

## Possible generated outputs

Query source would live beside its owner and remain separate from handwritten public wrappers:

```text
crates/taffyjs_binding/src/generated/query/
├── mod.rs
├── protocol.rs
├── style.rs
├── layout.rs
└── detailed_layout_info.rs

packages/taffyjs-node/src/generated/query/
├── index.ts
├── protocol.ts
├── style.ts
├── layout.ts
└── detailed-layout-info.ts
```

The TypeScript emitter would own runtime lookup data and exported source types, then the normal package build would produce JavaScript and declarations. A separate declaration emitter would duplicate TypeScript meaning. Files should split by stable query family only when needed, not one file per selector.

## Private IDs and protocol compatibility

If performance evidence justifies private numeric operation IDs, they would be assigned from one deterministic ordering of normalized selectors within each family. People would not maintain them, and adding a selector could renumber later IDs because JavaScript and Rust output would always be regenerated together.

If the JavaScript wrapper and native addon can be installed from mismatched builds, both sides would expose and compare one protocol fingerprint when the addon loads. That fingerprint would cover the normalized selector-to-ID mappings, index counts, result conversions, native access paths, and any approved packed representation.

The fingerprint would be based on a canonical serialization of protocol meaning plus an explicit protocol version, not just the input file bytes. It would exclude source locations and output formatting so file movement or formatting alone would not change it.

These mechanisms are query-specific safeguards, not requirements for numeric families or every generated API.

## Query verification

Compiler tests would cover selector expansion, nested arrays, nullable values, tagged variants, result optionality, recursion rejection, collisions, deterministic ordering, ID assignment, and fingerprint stability. Small valid and invalid inputs should assert the normalized operations and useful diagnostics rather than copy every generated source file into test fixtures.

Target checks would still run rustfmt, Cargo check, Clippy, Rust tests, TypeScript type checking, and the normal package build on generated source.

Behavioral parity would compare query results with values independently read from complete getters. It should cover every generated selector where practical and retain hand-authored examples for variants, nullable ancestors, strings, arrays, nested indices, invalid index values, out-of-bounds indices, and inactive variants.

The complete-getter comparison must not reuse generated query access steps. It may reuse canonical value converters, but those converters need separate hand-authored fixtures; otherwise a wrong converter could make both paths agree on the same wrong value. A fingerprint mismatch should fail immediately with a controlled load error.

## Changes that require a public decision

- Changing selector syntax, absence behavior, or result types changes the public query contract.
- Adding a recursive public value requires an explicit bounded representation.
- Reusing the public value model for complete-output transport requires separate performance evidence, generated backend design, and parity tests.
- Introducing packed input or output requires its own boundary and compatibility decision; sharing the generator does not make packed transport automatically useful.

## Deliberate exclusions

This possible query design would not use runtime code generation, runtime selector parsing, separate Rust and TypeScript selector expansion, one generated file per selector, or user-configurable switches for fixed selector rules.
