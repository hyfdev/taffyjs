# Compact Style Codec

## Scope and public contract

The five public Style-taking operations accept ordinary JavaScript values: `newLeaf(style?)`, `newLeafWithContext(context, style?)`, `newWithChildren(children, style?)`, `setStyle(node, style)`, and `updateStyle(node, update)`. Node creation defaults an omitted or explicit-`undefined` style, while required context or children precede the optional style. The compact bytes are a private wrapper-to-binding representation and are not exported.

Creation and `setStyle` decode into `Style::default()`. `updateStyle` clones the current Style, applies only present fields and nested components, and calls Taffy's setter only when the decoded candidate differs. Missing and explicit-`undefined` fields are absent, accepted `null` values carry an explicit marker, and present arrays carry a count even when empty. Complete arrays, strings, tagged values, and Grid records replace their corresponding value. Unknown top-level Style properties are ignored, so a misspelled field name selects that field's default. Invalid values of known properties and unknown components of the public partial geometry records are errors.

The generated encoder reads each known top-level property once through ordinary property access and never enumerates the outer Style object. The wrapper holds the encoded storage through the one synchronous private call, so getter, Proxy, and recursive Style operations cannot change bytes already handed to Rust. Operations that consume NodeIds resolve them before encoding, preserving stale and foreign ID error precedence. Encoding and Rust decoding finish before tree mutation; a failure drops the local candidate and leaves the tree unchanged.

## Generated ownership

`api/style-codec.json` is the canonical versioned inventory for all 41 fields, their order, encoding categories, referenced numeric families, and public descriptions; `api/schemas/style-codec.schema.json` closes that vocabulary. `tools/api-codegen` validates and compiles the model, then generates `packages/taffyjs-node/src/style-input.ts` and `crates/taffyjs_binding/src/style_input.rs`. The TypeScript output owns `StyleInput`, `StyleUpdate`, and the straight-line property encoder. The Rust output owns the matching straight-line `decode_into(target, encoded) -> Result<bool>` field application. Handwritten codec modules implement the finite encoding categories rather than interpreting schema metadata at runtime.

## Wire version 1

Every encoded value begins with two magic bytes (`0x54`, `0x53`), one wire-version byte, one presence-width byte, and the fixed-width presence bitmap. Version 1 has 41 fields and therefore six presence bytes. Set bits identify payloads that follow in the canonical model order; unset bits carry no payload. The decoder rejects bad magic, a different version or presence width, bits beyond the known field count, truncation, and trailing data.

Payload integers and IEEE-754 values are little-endian. Booleans, enum discriminators, nullable markers, tagged-union discriminators, and nested component masks use bytes; all public discriminator assignments are consumed through the TypeScript constants and Rust code enums generated from `api/numeric-families.json`, rather than repeated as codec literals. Ordinary numbers use `f64` and undergo the existing Rust `f64`-to-`f32` conversion; Grid indexes and counts use their checked `i16`, `u16`, or `u32` widths. Lengths carry a unit byte and a number only for branches that need one. Strings carry a `u32` UTF-8 byte length followed by bytes, and collections carry a `u32` element count followed by recursively encoded complete elements. Partial geometry carries a component mask, with a reserved scalar-expansion marker where the public shorthand permits it.

The decoder borrows the byte slice and reserves fallible Rust collection capacity from validated counts. It applies values to a local default or cloned candidate while preserving bitwise change detection for `NaN`, `+0`, and `-0`, validates the complete candidate, and exposes it to the tree only after successful completion. Both sides are generated straight-line code over one fixed field order: neither interprets schema metadata at runtime, and no decoded Style value is retained between calls.

## Buffer and target behavior

The authored wrapper is shared by Node and Wasm. It reuses one guarded encoder, its DataView, and a fixed 1 KiB `Uint8Array` for the common synchronous path and marks them busy until the private call returns. A recursive call receives an independent encoder and temporary storage. If a payload exceeds 1 KiB, its encoder switches to temporary storage starting at 64 KiB and doubles locally only when necessary; `finally` restores the shared encoder to its original buffer after the private call, so oversized storage is released and global capacity never grows. There is no buffer pool.

The encoder object is part of the reuse boundary: constructing one encoder and its DataView per call made Grid-heavy timings bimodal, because that per-call allocation pair is large enough to change garbage-collection behavior at this call rate. Reusing one guarded encoder removes that variance and lowers the median. The reentrancy guard and `finally` restoration keep a fixed-owner lifetime instead of a pool.

The native napi-rs methods accept `Uint8ArraySlice<'_>`, so Native decodes a borrowed JavaScript typed-array view without first creating a Rust `Vec<u8>`. Emnapi/WASI must copy the view into Wasm memory, making the compact byte count part of the end-to-end cost. Both targets then call the same Rust decoder in `taffyjs_binding`.

## Format choice

A bounded prototype compared the versioned fixed bitmap with a per-field tag stream and JSON across representative empty, Flex, ordinary Grid, and oversized Grid values.

JSON is smaller and faster for string-heavy data but cannot carry these semantics: it converts `NaN` to `null`, loses negative zero, and has no direct absent-versus-present distinction. The tag stream saves nine bytes on an empty value and is otherwise the same size and speed as the bitmap, while requiring field-tag dispatch and termination rules. The fixed bitmap is selected because its constant ten-byte header is negligible at this boundary, its payload order matches generated straight-line code in both languages, and it has fewer decoding states to validate.

Acceptance performance is measured through the complete public API rather than by encoding alone, by the `styled-node-construction-500-leaves` scenario in [the benchmark suite](../../benchmarks/styled-node-construction/benchmark.ts).

## Verification boundary

Shared public behavior tests run against both `@taffyjs/node` and `@taffyjs/wasm` and cover all five operations, defaults, replacement, partial update, absence, null, empty collections, every Grid/string family, unknown and invalid fields, atomic failure, unchanged updates, floating-point edge cases, NodeId precedence, getters, Proxies, reentrancy, children, and context. Rust safety tests exercise malformed headers, versions, bitmaps, lengths, counts, UTF-8, truncation, and trailing bytes without freezing a particular byte snapshot. Two guards run over the complete public field list rather than over a sample: every field accepts explicit `undefined` as absence, and exactly the eight publicly nullable fields accept `null` while the other thirty-three reject it. Generated freshness is enforced by `vp run check:codegen` in a clean checkout.
