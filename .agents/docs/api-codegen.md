# API Code Generation

## Purpose and status

`tools/api-codegen` is the repository's long-term home for generators that keep one API description aligned across Rust and TypeScript. New API generators should extend this tool instead of adding isolated scripts with their own parsing, writing, and checking rules.

This document defines the shared organization and safety rules. It does not require every repetitive source file to become generated, and it does not approve a public API merely because that API could be generated. The first planned use is the numeric families shared by the Node wrapper and Rust binding; the future query design is recorded separately in [API query code generation](api-codegen-query.md).

## One maintained input

Each shared fact has exactly one human-maintained home in versioned input files under `api/`. A family may use more than one file when the files describe independently changing concerns, but it must not repeat the same fact in separate Rust and TypeScript inputs. Both targets are derived from the same validated and normalized data so numeric values, names, and other shared facts cannot drift between languages.

Inputs use a small, explicit vocabulary. They may name known Rust or TypeScript concepts, but they must not contain arbitrary target-language source snippets. Each format has a version and a schema for its basic shape; code performs checks that a schema cannot express, such as duplicate numeric values, invalid references, or conflicting public names.

Generation is appropriate when the same finite facts must agree in more than one output. Ordinary handwritten logic stays handwritten when sharing an input would not remove a real drift risk.

## Tool organization

The first implementation should establish the permanent boundaries instead of starting as a single numeric-specific script:

```text
api/
├── numeric-families.json
└── schemas/
    └── numeric-families.schema.json

tools/api-codegen/src/
├── generate.ts
├── check.ts
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
    ├── check.ts
    └── write.ts
```

These directories separate work that changes for different reasons:

- `input/` reads and validates maintained files. It reports file and field locations when input is invalid.
- `compiler/` resolves the validated input into one complete in-memory model. It assigns any derived values and rejects ambiguity before output begins.
- `emit/` turns that model into complete Rust or TypeScript file contents. Emitters do not read inputs or write files.
- `output/` formats, compares, and writes declared outputs. It is the only layer allowed to change generated files.
- `generate.ts` and `check.ts` are small direct entry points. `index.ts` coordinates the registered API families without adding a command parser.

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

Package authors use only these repository tasks:

```text
vp run codegen
vp run check:codegen
```

The root Vite+ task graph runs the TypeScript entry files directly on the pinned Node.js version:

```text
codegen        -> node tools/api-codegen/src/generate.ts
check:codegen  -> node tools/api-codegen/src/check.ts
```

There is no internal CLI or separate command vocabulary. If direct Node.js execution is used, generator source stays within Node's supported erasable TypeScript syntax and is still type-checked by the repository's normal checks.

`check:codegen` belongs in the root `check` and `ready` dependency graph. Normal builds may verify generated output, but they must never regenerate or modify source files. Regeneration is an explicit author action.

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

`check` runs the same input, compiler, emitter, and formatting path without changing files. It fails on missing, stale, or byte-different committed output and tells the author to run `vp run codegen`.

Output is deterministic: sorting is explicit, line endings are LF, files end with one newline, and output contains no machine-dependent data. Tool and formatter versions come from the repository's pinned toolchain.

## Verification

The drift check proves that committed files match their maintained inputs. Normal Rust and TypeScript compilation then proves that generated source is valid in its real owner modules.

Generator tests should cover rules that can silently change meaning: invalid input, duplicate values or names, deterministic ordering, escaping, and target-specific identifiers. Small focused expected-output cases are useful for rendering edges; do not keep a second full copy of every generated tree as test data.

Behavior tests remain hand-authored and independent of the generator. They verify representative public values at the Rust/JavaScript boundary rather than accepting generated expectations as their only proof. When a generator or input change alters generated results, the corresponding output is committed in the same change. When results do not change, `vp run check:codegen` proves that the committed output still matches.

## Deliberate exclusions

This design does not introduce:

- a separate generator for each API family;
- a general third-party plugin protocol;
- arbitrary Rust or TypeScript source embedded in input data;
- generated edits inside handwritten files;
- source-tree mutation during an ordinary build; or
- generated expectations as the only behavioral test oracle.

## External precedents

- [LLVM TableGen](https://www.llvm.org/docs/TableGen/index.html) separates maintained records, one resolved model, and target-specific backends.
- [Go code generation](https://go.dev/blog/generate) treats generation as an explicit author action and standardizes generated-file ownership notices.
- [Cargo build scripts](https://doc.rust-lang.org/cargo/reference/build-scripts.html#outputs-of-the-build-script) write generated build artifacts to `OUT_DIR`; a cross-language source generator therefore should not use `build.rs` to rewrite repository source.
