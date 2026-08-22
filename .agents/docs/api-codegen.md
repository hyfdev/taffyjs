# API Code Generation

## Purpose and status

`tools/api-codegen` is the repository's long-term home for generators that keep one API description aligned across Rust and TypeScript. New API generators should extend this tool instead of adding isolated scripts with their own parsing, writing, and checking rules.

This document defines the shared organization and safety rules. It does not require every repetitive source file to become generated, and it does not approve a public API merely because that API could be generated. The implemented families are the numeric constants shared by the Node wrapper and Rust binding, the accepted absolute-length and definite-available-space input shorthands, and the compact Style codec. The future query design is recorded separately in [API query code generation](api-codegen-query.md).

## One maintained input

Each shared fact has exactly one human-maintained home in versioned input files under `api/`. A family may use more than one file when the files describe independently changing concerns, but it must not repeat the same fact in separate Rust and TypeScript inputs. Both targets are derived from the same validated and normalized data so numeric values, names, and other shared facts cannot drift between languages.

Inputs use a small, explicit vocabulary. They may name known Rust or TypeScript concepts, but they must not contain arbitrary target-language source snippets. Each format has a version and a schema for its basic shape; code performs checks that a schema cannot express, such as duplicate numeric values, invalid references, or conflicting public names.

Generation is appropriate when the same finite facts must agree in more than one output. Ordinary handwritten logic stays handwritten when sharing an input would not remove a real drift risk.

## Complexity boundary

Keep the generator's input fields, normalized data, and emitter capabilities closed until a concrete output in the same change needs an extension. Do not add machinery for a hypothetical family, payload type, target, or output. A new generated family belongs here only when a finite fact must stay aligned across maintained outputs; target-specific behavior otherwise stays handwritten.

Judge complexity by the rules people maintain, not by the length of generated files. Straight-line generated Rust or TypeScript may repeat itself. Do not replace that repetition with a macro layer, template language, syntax-tree framework, plugin mechanism, runtime metadata system, or general binding description unless a current implementation demonstrates that the replacement removes more maintained concepts than it adds.

The existing stages remain separate because they answer different questions: schemas describe the basic input shape, input code validates what the generator actually reads, compilers resolve references and conflicts once, and emitters render one already-decided model. A simplification must preserve those guarantees instead of making an API boundary implicit, delaying errors until target compilation, or moving the same rules into a new dependency. Concrete duplication may still be removed when it appears; these boundaries do not require keeping an implementation merely because it already exists.

## Generated tagged inputs

The mapping from a primitive shorthand to a complete tagged branch is one shared API fact. A focused versioned input under `api/` must describe the tagged value name, tag field, referenced numeric family, branches, payload fields, public input aliases, and the optional input-only number shorthand. The compiler resolves every family and branch reference against the numeric-family model and rejects an unknown branch, incompatible payload, duplicate public name, or ambiguous shorthand before either target is emitted. This is a separate input family within `tools/api-codegen`, not a property added to `numeric-families.json`: numbers in that file are discriminator codes, while shorthand numbers are payload values.

The initial generated family covers only semantic lengths and available space. It records that a number accepted by `LengthPercentageInput`, `LengthPercentageAutoInput`, or `DimensionInput` maps to the complete `Length(value)` branch, and that a number accepted by `AvailableSpaceInput` maps to `Definite(value)`. `Percent`, `Auto`, `MinContent`, and `MaxContent` remain explicit. Complete tagged inputs remain valid, output types remain complete tagged values, and the generator must not infer the same shorthand for track sizing, Grid values, or another family.

The TypeScript emitter owns the affected public input and output declarations, their JSDoc, and the `Dimension` and `AvailableSpace` complete-form helpers so their names, fields, tags, payloads, and shorthand descriptions come from the same model. Handwritten public entry modules may re-export generated values and types but must not restate their shapes.

The Rust emitter owns direct boundary parsing for tagged inputs that still cross as JavaScript values, currently available space. A JavaScript number and its equivalent tagged object converge in that parser. Style lengths instead converge in the generated Style encoder and shared compact decoder described below, without allocating replacement tagged objects. Handwritten Rust continues to map decoded values to Taffy, including percentage scaling and the exact Taffy constructors.

Verification follows the repository-wide rule below: `check:codegen` detects stale generated files, while focused public type and behavior tests prove that each shorthand is accepted only in its declared input types, matches the complete form, and still produces complete tagged output. Ordinary behavior tests and examples use the shorthand once it exists; focused coverage keeps the complete form. Do not add tests of the generator itself or use generated data as the only behavioral oracle.

## Generated Style codec

`api/style-codec.json` and `api/schemas/style-codec.schema.json` are the maintained versioned model for the 41 public Style input fields, their canonical order, their encoding categories, their referenced numeric families, and their public descriptions. The compiler resolves numeric-family references and derives field indexes and the presence-map width once. Neither target keeps a handwritten second field inventory.

The TypeScript emitter writes `packages/taffyjs-node/src/style-input.ts`, which owns the public `StyleInput` and `StyleUpdate` declarations and a straight-line encoder that reads each known property once in canonical order. The Rust emitter writes `crates/taffyjs_binding/src/style_input.rs`, which applies the matching fields in the same order through `decode_into`. Handwritten `style-codec.ts` and `style_codec.rs` own only the closed category encodings, validation primitives, buffer mechanics, and Taffy-specific conversion used by those generated call sites.

The wire version is distinct from the maintained input format version. A change that only extends generator metadata without changing bytes need not change the wire version; a change that reinterprets existing private bytes must. The current format, buffer lifetime, format choice, and mutation rules are recorded in [Compact Style codec](style-codec.md).

## Tool organization

The first implementation should establish the permanent boundaries instead of starting as a single numeric-specific script:

```text
api/
├── numeric-families.json
└── schemas/
    └── numeric-families.schema.json

tools/api-codegen/src/
├── generate.ts
├── index.ts
├── diagnostics.ts
├── input/
│   ├── load.ts
│   └── numeric-families.ts
├── compiler/
│   └── numeric-families.ts
├── emit/
│   └── numeric-families/
│       ├── rust.ts
│       └── typescript.ts
└── output/
    ├── format.ts
    └── write.ts
```

These directories separate work that changes for different reasons:

- `input/` reads and validates maintained files. It reports file and field locations when input is invalid.
- `compiler/` resolves the validated input into one complete in-memory model. It assigns any derived values and rejects ambiguity before output begins.
- `emit/` turns that model into complete Rust or TypeScript file contents. Emitters do not read inputs or write files.
- `output/` formats and writes declared outputs. It is the only layer allowed to change generated files.
- `generate.ts` is the direct entry point. `index.ts` coordinates the registered API families without adding a command parser.

When another API family needs generation, add its maintained input and focused modules within these boundaries. Do not create a second repository generator, a plugin system, a catch-all `utils.ts`, or a large file that combines parsing, decisions, rendering, and writes.

## Compilation flow

Every family follows the same flow:

```text
maintained data
  -> structural and semantic validation
  -> normalized model
  -> target emitters
  -> formatted output files
```

The normalized model contains every fact required by all targets. Rust and TypeScript emitters must not independently interpret raw input or recreate shared numeric assignments. Derived values are calculated once by the compiler layer and passed to each emitter.

Expose emitters as transformations without filesystem effects where practical:

```ts
emitRust(model): readonly OutputFile[];
emitTypeScript(model): readonly OutputFile[];
```

Each `OutputFile` contains a repository-relative owned path and its complete contents. Small target-aware writers are preferable to large template files; target-specific branching should remain visible and type-checked.

## Repository commands

The repository exposes only these generation tasks:

```text
vp run codegen
vp run check:codegen
```

The root Vite+ task graph runs the generator directly on the pinned Node.js version:

```text
codegen        -> node tools/api-codegen/src/generate.ts
check:codegen  -> node tools/api-codegen/src/generate.ts && git add --intent-to-add --all && git diff --exit-code
```

There is no internal CLI or separate command vocabulary. If direct Node.js execution is used, generator source stays within Node's supported erasable TypeScript syntax and is still type-checked by the repository's normal checks.

`check:codegen` is a CI task for a clean checkout. It is not part of the default local `check` or `ready` graph because it regenerates source before checking the Git diff. Authors run `vp run codegen` explicitly after changing maintained inputs; ordinary builds and local checks do not run generation.

## Output ownership and writes

Generated Rust and TypeScript source lives beside the component that compiles and owns it, normally under that component's `generated/` directory. Generated files are committed so a clean checkout, Cargo build, package build, and source archive do not require the development generator.

Every generated file begins with the target-language equivalent of:

```text
Code generated by tools/api-codegen. DO NOT EDIT.
Sources: api/<input-file>
Regenerate: vp run codegen
```

Headers contain repository-relative paths and no timestamps, absolute paths, hostnames, or other machine-dependent values. Do not mix generated and handwritten code through marker-delimited sections; handwritten wrappers import generated modules instead.

`generate` validates and renders all registered families before changing the source tree. It formats complete output, writes only declared paths, and replaces changed files safely. It may remove a stale file only when the path is within a declared generated root and the existing file carries this generator's ownership header.

In CI, `check:codegen` runs generation, marks untracked files as intent-to-add so Git can include newly created outputs, and then runs `git diff --exit-code`. Changed, missing, and newly generated output all fail the job and show what was not committed.

Output is deterministic: sorting is explicit, line endings are LF, files end with one newline, and output contains no machine-dependent data. Tool and formatter versions come from the repository's pinned toolchain.

## Verification

[VOUCHED @hyfdev 2026-08-14]

Do not add tests whose subject is the generator itself. CI tests generation by running it in a clean checkout, making new files visible to Git, and failing on `git diff`; this is the required proof that committed generated files are current. The default local `check` and `ready` tasks do not run generation or this diff check.

Generated code is covered through meaningful unit, integration, or end-to-end tests of its observable behavior, chosen at the layer that owns that behavior. Do not add tests that merely repeat the maintained input, enumerate generated declarations again, or otherwise prove only that the generator printed what it was told. When a generator or input change alters results, commit the regenerated output in the same change.

## Deliberate exclusions

This design does not introduce:

- a separate generator for each API family;
- a general third-party plugin protocol;
- arbitrary Rust or TypeScript source embedded in input data;
- tests of the generator itself or complete test copies of generated data;
- generated edits inside handwritten files;
- source-tree mutation during an ordinary build; or
- generated expectations as the only behavioral test oracle.

## External precedents

- [LLVM TableGen](https://www.llvm.org/docs/TableGen/index.html) separates maintained records, one resolved model, and target-specific backends.
- [Go code generation](https://go.dev/blog/generate) treats generation as an explicit author action and standardizes generated-file ownership notices.
- [Cargo build scripts](https://doc.rust-lang.org/cargo/reference/build-scripts.html#outputs-of-the-build-script) write generated build artifacts to `OUT_DIR`; a cross-language source generator therefore should not use `build.rs` to rewrite repository source.
