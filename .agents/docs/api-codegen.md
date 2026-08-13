# API Code Generation Reference

## Purpose and status

This document is a reference architecture for future repository-local code generation that must keep public TypeScript APIs and Rust binding operations aligned. A selective per-field query API is the initial motivating case, while complete-output conversion and other representations may later reuse the same public data description when independently justified.

This is design guidance, not an implementation contract. It does not add a public API, start query implementation, require migration of the current tooling, or make generated transport an accepted optimization. Exact schema keys and output file splits remain implementation choices. The durable architectural boundary is that people maintain declarative API facts, one compiler expands those facts into one normalized model, and language-specific emitters translate that model without re-deriving its meaning.

## Recommended organization

Treat the generator as a small compiler rather than a collection of templates. Its logical organization should be:

```text
api/
├── public-output.json
├── query.json
└── schemas/
    ├── public-output.schema.json
    └── query.schema.json

tools/
└── api-codegen/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── cli.ts
    │   ├── index.ts
    │   ├── diagnostics.ts
    │   ├── input/
    │   │   ├── load.ts
    │   │   ├── raw-types.ts
    │   │   └── validate.ts
    │   ├── compiler/
    │   │   ├── model.ts
    │   │   ├── compile.ts
    │   │   ├── selectors.ts
    │   │   ├── operation-ids.ts
    │   │   └── fingerprint.ts
    │   ├── emit/
    │   │   ├── rust.ts
    │   │   └── typescript.ts
    │   └── output/
    │       ├── format.ts
    │       ├── check.ts
    │       └── write.ts
    └── test/
        ├── compiler.test.ts
        ├── emitter.test.ts
        └── fixtures/
            ├── valid/
            └── invalid/
```

The exact paths may be adapted to the repository, but the ownership boundaries should remain visible. `api/` contains human-maintained product facts. `tools/api-codegen/` contains replaceable tooling. Generated source lives with the Rust or TypeScript module that compiles and owns it.

Use the broader name `api-codegen`, not `query-codegen`, because the public output description is not query-specific. Query should be one fixed generation pipeline within this tool. A general third-party plugin system is unnecessary.

Avoid catch-all modules such as `utils.ts`. A function that resolves types, assigns operation IDs, emits Rust, or writes output belongs in the correspondingly named module. Avoid a single large generator file whose parsing, semantics, rendering, and filesystem effects cannot be tested independently.

## Human-maintained inputs

### Public output model

`public-output.json` describes the finite JavaScript values exposed by the binding. It is the shared description of records, tagged unions, arrays, nullable values, scalars, public field names, Rust field mappings, and named conversion rules.

It should use a small closed vocabulary rather than embedding arbitrary Rust or TypeScript expressions. A field mapping may name a Rust field, a tagged variant, or a registered converter, but executable source snippets should remain in ordinary reviewed source code. This preserves type checking, searchability, and meaningful diagnostics.

The model should distinguish values that can be followed structurally from values that can only be returned as a whole. If a later API exposes a recursive expression tree or another recursive value, generation must fail until the model explicitly stops descending at that point or assigns the recursive value to a separately designed data domain.

### Query entry points

`query.json` describes which native source and public root type each query method uses. It should reference the public output model by stable symbolic names rather than repeating fields or conversion rules. Conceptually:

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
    }
  ]
}
```

The two inputs remain separate because they change for different reasons. Adding a public Style field changes the value model. Adding another operation over an existing value changes the API entry-point model. Complete getters or a future complete-output transport can reuse the value model without depending on query configuration.

Selector syntax is a generator rule, not a collection of user-configurable switches. For example, field separators, array markers, and length selectors should have one implementation and one compatibility policy rather than per-domain configuration.

### Input validation

Every input format has an explicit `formatVersion`. Validation rejects unknown properties, duplicate object keys, invalid references, conflicting public names, unsupported converter names, and recursive descent. Diagnostics identify the input file and location and explain the required correction.

JSON Schema can check the raw structure, but semantic validation remains code: it must resolve named types, prove references exist, detect cycles and selector collisions, and verify that every configured native access has a corresponding public result conversion.

## Compilation pipeline

The generator should perform one semantic compilation before emitting any language:

```text
raw JSON
  -> structural validation
  -> resolved public type graph
  -> selector and operation expansion
  -> normalized API model
  -> Rust and TypeScript emitters
```

The normalized API model is an ordinary in-memory structure that records everything the targets need. It is often called an intermediate representation, but its purpose here is simply to prevent Rust and TypeScript generation from interpreting the input independently.

A query operation in that model may conceptually resemble:

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

For example, one normalized operation records that `gridTemplateRows[].value.tracks[].max` belongs to Style, consumes two indices from left to right, returns `MaxTrackSizingFunction | undefined`, enters the Repeat variant, and can be absent because an index is out of bounds or the tagged variant is inactive.

Only the compiler may resolve public types, expand selectors, assign indices, derive result optionality, detect recursion, or assign operation IDs. Emitters receive the completed model and must not traverse the raw input again. This is the central defense against Rust and TypeScript silently implementing different protocols.

## Generator implementation language

Use TypeScript running on the repository's pinned Node.js version for the main generator. The most complex outputs are TypeScript selector/result relationships, batch tuple inference, and JavaScript lookup metadata, while Rust output is a mechanical translation into enums and direct match arms. Rust correctness is still enforced by rustfmt, the Rust compiler, Clippy, tests, and independent runtime parity checks.

The generator may use the existing command runner as a thin entry point while the compiler is developed as typed modules. If TypeScript is executed directly by Node.js, keep it within Node's erasable TypeScript syntax and type-check it independently; direct execution does not replace `tsc --noEmit`.

Do not run this cross-language generator from Cargo `build.rs`. Cargo build scripts should write generated artifacts to `OUT_DIR`, not mutate source owned by JavaScript and Rust packages. A build-script-owned generator would also make ordinary Cargo builds and cross-compilation depend on the Node toolchain while forcing the JavaScript build to discover target-local Cargo output.

A Rust source parser may independently verify upstream Taffy types and field mappings. It should return facts to the API generator or a validation step; it should not own a second selector-expansion implementation.

## Emitters

Expose target emitters as pure transformations where practical:

```ts
emitRust(model): readonly OutputFile[];
emitTypeScript(model): readonly OutputFile[];
```

An `OutputFile` contains a repository-relative owned path and complete contents. Emitters do not read or write the filesystem, run formatters, assign IDs, or decide which selectors exist.

Use small target-aware writers for indentation and language syntax. Short fixed headers can use template strings, but semantic branching should remain visible in TypeScript code rather than being hidden in Handlebars, EJS, or large text templates.

The TypeScript emitter owns both runtime lookup metadata and exported source-level types. It should generate TypeScript source and let the ordinary TypeScript or Vite+ pipeline produce JavaScript and declarations. A separate declaration emitter would duplicate TypeScript meaning and create another place for drift.

## Generated source placement and naming

Place generated source beside the component that compiles it rather than in a repository-wide `gen` directory. A future split could look like:

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

Use each target language's normal filename convention. Split by stable protocol family only when one file becomes difficult to review or compile; do not create one file per selector.

Prefer a `generated/` directory with ordinary filenames over simultaneously adding `.generated` to every filename. The whole file is generated. Do not mix handwritten and generated code through marker-delimited regions. A handwritten wrapper should import generated internals and remain a normal reviewable source file.

Every generated source file starts with a target-language equivalent of:

```text
Code generated by tools/api-codegen. DO NOT EDIT.
Sources: api/public-output.json, api/query.json
Protocol fingerprint: sha256:<value>
Regenerate: vp run codegen
```

The header contains repository-relative inputs and the regeneration command. It must not contain timestamps, absolute paths, hostnames, temporary directories, or other machine-dependent values. Generated paths may additionally be marked `linguist-generated` in `.gitattributes` so GitHub identifies and folds them appropriately.

## Operation IDs and protocol fingerprint

Private operation IDs are derived automatically from a deterministic canonical ordering of the normalized selectors within each protocol family. They are not written by people and are not a public compatibility surface. Adding a selector may renumber later private IDs because the JavaScript and Rust artifacts are generated together.

The wrapper and native addon must expose and compare a protocol fingerprint once when the addon loads. The fingerprint is computed from a canonical serialization of the final normalized protocol model plus an explicit generator protocol version. It includes at least selector-to-ID mappings, index arity, result conversion, direct native access mapping, and any private packed representation that later shares the protocol.

Hashing only the source JSON is insufficient: a generator change could alter the private protocol while leaving the input bytes unchanged. The fingerprint also excludes irrelevant source locations and output formatting so it changes for protocol semantics, not for file movement or formatter updates.

## Commands and file writes

Expose a small author-facing command surface:

```text
api-codegen generate
api-codegen check
api-codegen print-model
```

`generate` loads and validates every input, builds the complete normalized model, renders every output into a temporary location, formats all outputs, and only then updates the source tree. Each changed file is replaced atomically where the filesystem permits. The writer is restricted to declared generated roots and deletes only stale files that it can prove belong to this generator.

`check` runs the same compiler and emitters without changing the working tree, compares the formatted bytes with committed outputs, detects missing and stale files, and reports exact regeneration instructions.

`print-model` emits the canonical normalized model for debugging ID assignment, selector expansion, and fingerprint changes. It is not a committed second source of truth.

The generator does not recreate a second Cargo or TypeScript build environment before writing. Real compilation remains in the ordinary repository checks after generation. Tool versions, including formatters, are pinned, and outputs use deterministic sorting, LF line endings, and one final newline.

Normal package builds must never silently update source files. The repository task graph may require `api-codegen check` before or alongside compilation, but regeneration is an explicit package-author operation.

## Committed outputs

Commit the generated Rust and TypeScript source for this repository. A clean checkout, standalone Cargo build, package build, and source archive should not require the development-time generator merely to consume already-generated APIs. The committed diff also makes the consequence of an input change reviewable.

The API generator should stop at source-level Rust and TypeScript. Whether distribution artifacts produced by the normal package build are tracked is a separate packaging policy.

Generated output is reviewed primarily through the human-maintained schema and generator changes, but it is still compiled and tested. A drift check guarantees that committed output is exactly reproducible from its declared inputs and pinned tools.

## Verification strategy

Use independent layers rather than letting one generator prove itself entirely through expectations it also generated.

### Compiler unit tests

Test type resolution, selector expansion, nested arrays, nullable values, tagged variants, result optionality, recursion rejection, collisions, deterministic ordering, ID assignment, and fingerprint stability directly against the normalized model.

### Input fixtures

Keep small valid and invalid schemas for cases such as nested arrays, shared named types, recursive values, unknown references, unsupported converters, duplicate public names, and selector collisions. Invalid fixtures assert stable diagnostic codes and relevant locations. Valid fixtures generally assert the normalized model rather than a complete copy of all emitted source.

### Emitter text tests

Keep a small number of focused expected-output files for escaping, identifiers, comments, imports, and other target-language rendering edges. Do not maintain a second complete golden copy of generated Rust and TypeScript; the committed generated tree plus `api-codegen check` already serves that role.

### Target compilation

Run rustfmt, Cargo check, Clippy, Rust tests, TypeScript type checking, and the normal package build. These checks validate the generated files in their real module environments rather than a simulated environment inside the generator.

### Independent behavioral parity

Compare query results with values independently read from complete getters. Cover every generated selector where practical and retain hand-authored representative cases for tagged variants, nullable ancestors, strings, arrays, nested indices, out-of-bounds indices, and inactive variants. Test protocol-fingerprint mismatch as an immediate controlled load failure.

The complete-getter oracle must not reuse the query's generated access steps. It may and normally should reuse the same canonical value converters; this comparison independently verifies selector traversal, field wiring, tagged-variant branches, and absence behavior rather than duplicating conversion logic.

Verify the converters themselves with separate hand-authored fixtures that map known Rust values to expected JavaScript values. Otherwise one incorrect converter could make both the query and complete getter agree on the same wrong representation.

## Evolution rules

- Adding or changing a public output field starts in `public-output.json`; all consumers of that value model are regenerated together.
- Adding another query source starts in `query.json` and refers to an existing public root type when possible.
- A Taffy upgrade first updates independently extracted upstream facts, then requires the human-maintained public mapping to reconcile every change before generation succeeds.
- A new recursive public value blocks automatic descent until the project explicitly returns it as a whole, returns a reference, or gives it a separately designed API.
- A future complete-output transport may reuse the public output model and converters, but it requires its own generated backend, protocol mapping, parity tests, and performance evidence. Sharing a schema does not make one transport universally beneficial.
- A change to selector grammar, absence semantics, or another public rule requires an API compatibility decision; it is not an incidental generator refactor.

## Deliberate exclusions

This design does not introduce:

- a custom schema language and parser when strict JSON plus semantic validation is enough;
- a protoc-style third-party plugin protocol;
- separate Rust and TypeScript implementations of selector expansion;
- arbitrary target-language source embedded in schema values;
- runtime code generation or runtime selector parsing;
- one generated file per selector;
- marker-based edits inside handwritten files;
- automatic source-tree mutation during an ordinary build;
- a generated complete expected implementation used as the only test oracle; or
- configuration switches for fixed public rules that should have one implementation.

## External precedents

- [LLVM TableGen](https://www.llvm.org/docs/TableGen/index.html) separates declarative records, one internal record model, and domain-specific backends that emit different targets.
- [Go code generation](https://go.dev/blog/generate) treats generation as an explicit package-author step rather than an implicit consumer build step and records a standard generated-file warning.
- [Cargo build scripts](https://doc.rust-lang.org/cargo/reference/build-scripts.html#outputs-of-the-build-script) constrain build-generated files to `OUT_DIR`, which is why a cross-language source generator should not use `build.rs` to rewrite repository files.
- [Bazel hermeticity guidance](https://bazel.build/concepts/hermeticity) identifies undeclared tools, nondeterministic data, and writes back into the source tree as causes of irreproducible builds.
- [Protocol Buffers version guidance](https://protobuf.dev/support/cross-version-runtime-guarantee/) documents the risk of generated-code/runtime skew and motivates an explicit JS/native protocol compatibility check.
