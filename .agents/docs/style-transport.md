# Compact Style Input Transport

## Scope and public contract

The five public Style-taking operations accept ordinary JavaScript values: `newLeaf(style?)`, `newLeafWithContext(context, style?)`, `newWithChildren(children, style?)`, `setStyle(node, style)`, and `updateStyle(node, update)`. Node creation defaults an omitted or explicit-`undefined` style, while required context or children precede the optional style. The compact bytes are a private wrapper-to-binding representation and are not exported.

Creation and `setStyle` decode into `Style::default()`. `updateStyle` clones the current Style, applies only present fields and nested components, and calls Taffy's setter only when the decoded candidate differs. Missing and explicit-`undefined` fields are absent, accepted `null` values carry an explicit marker, and present arrays carry a count even when empty. Complete arrays, strings, tagged values, and Grid records replace their corresponding value. Unknown top-level Style properties are ignored; invalid values of known properties and unknown components of the public partial geometry records remain errors.

The generated encoder reads each known top-level property once through ordinary property access and never enumerates the outer Style object. The wrapper holds the encoded storage through the one synchronous private call, so getter, Proxy, and recursive Style operations cannot change bytes already handed to Rust. Operations that consume NodeIds resolve them before encoding, preserving stale and foreign ID error precedence. Encoding and Rust decoding finish before tree mutation; a failure drops the local candidate and leaves the tree unchanged.

## Generated ownership

`api/style-transport.json` is the canonical versioned inventory for all 41 fields, their order, encoding categories, referenced numeric families, and public descriptions; `api/schemas/style-transport.schema.json` closes that vocabulary. `tools/api-codegen` validates and compiles the model, then generates `packages/taffyjs-node/src/style-input.ts` and `crates/taffyjs_binding/src/style_input.rs`. The TypeScript output owns `StyleInput`, `StyleUpdate`, and the straight-line property encoder. The Rust output owns the matching straight-line `decode_into(target, encoded) -> Result<bool>` field application. Handwritten transport modules implement the finite encoding categories rather than interpreting schema metadata at runtime.

## Wire version 1

Every encoded value begins with two magic bytes (`0x54`, `0x53`), one wire-version byte, one presence-width byte, and the fixed-width presence bitmap. Version 1 has 41 fields and therefore six presence bytes. Set bits identify payloads that follow in the canonical model order; unset bits carry no payload. The decoder rejects bad magic, a different version or presence width, bits beyond the known field count, truncation, and trailing data.

Payload integers and IEEE-754 values are little-endian. Booleans, enum discriminators, nullable markers, tagged-union discriminators, and nested component masks use bytes; all public discriminator assignments are consumed through the TypeScript constants and Rust code enums generated from `api/numeric-families.json`, rather than repeated as transport literals. Ordinary numbers use `f64` and undergo the existing Rust `f64`-to-`f32` conversion; Grid indexes and counts use their checked `i16`, `u16`, or `u32` widths. Lengths carry a unit byte and a number only for branches that need one. Strings carry a `u32` UTF-8 byte length followed by bytes, and collections carry a `u32` element count followed by recursively encoded complete elements. Partial geometry carries a component mask, with a reserved scalar-expansion marker where the public shorthand permits it.

The decoder borrows the byte slice and reserves fallible Rust collection capacity from validated counts. It applies values to a local default or cloned candidate while preserving bitwise change detection for `NaN`, `+0`, and `-0`, validates the complete candidate, and exposes it to the tree only after successful completion. There is no retained `StylePatch`, fallback rich-object parser, general serialization layer, or runtime schema interpreter.

## Buffer and target behavior

The authored wrapper is shared by Node and Wasm. It reuses one guarded encoder, its DataView, and a fixed 1 KiB `Uint8Array` for the common synchronous path and marks them busy until the private call returns. A recursive call receives an independent encoder and temporary storage. If a payload exceeds 1 KiB, its encoder switches to temporary storage starting at 64 KiB and doubles locally only when necessary; `finally` restores the shared encoder to its original buffer after the private call, so oversized storage is released and global capacity never grows. There is no buffer pool.

The encoder object is part of the reuse boundary because measurement showed that constructing one encoder and DataView per call made the ordinary-Grid benchmark bimodal: two short-sample diagnostic runs had 5.3–6.1 µs interquartile ranges, and a fuller run reached 8.8 µs. Reusing the guarded encoder reduced two repeat runs to 0.41–0.55 µs while also lowering the median. The reentrancy guard and `finally` restoration retain the simpler fixed-owner lifetime rather than introducing pooling.

The native napi-rs methods accept `Uint8ArraySlice<'_>`, so Native decodes a borrowed JavaScript typed-array view without first creating a Rust `Vec<u8>`. Emnapi/WASI must copy the view into Wasm memory, making the compact byte count part of the end-to-end cost. Both targets then call the same Rust decoder in `taffyjs_binding`.

## Format choice and evidence

A bounded prototype compared the versioned fixed bitmap with a per-field tag stream and JSON across representative empty, Flex, ordinary Grid, and oversized Grid values. The measurements below include JavaScript encoding but were used only to choose the private format; acceptance performance uses the complete public API through the tree operation.

| Representative input | Bitmap bytes | Tag-stream bytes | JSON bytes | Bitmap median | Tag-stream median | JSON median |
| -------------------- | -----------: | ---------------: | ---------: | ------------: | ----------------: | ----------: |
| Empty                |           10 |                1 |          2 |      0.363 µs |          0.349 µs |    0.388 µs |
| Common Flex          |          338 |              345 |        333 |      2.138 µs |          2.099 µs |    1.094 µs |
| Ordinary Grid        |        2,462 |            2,461 |      1,650 |     17.162 µs |         16.859 µs |    3.986 µs |
| Oversized Grid       |      159,615 |          159,614 |    101,119 |  1,015.637 µs |      1,015.048 µs |  203.567 µs |

JSON was smaller and faster for string-heavy data but is not semantically valid: it converts `NaN` to `null`, loses negative zero, and cannot represent the required absent-versus-present distinctions directly. The tag stream saves nine bytes only for the empty value and is otherwise effectively the same size and speed as the bitmap, while requiring field-tag dispatch and termination rules. The fixed bitmap was selected because its constant header is negligible at the measured boundary, its payload order matches generated straight-line code in both languages, and it has fewer decoding states to validate.

## Verification boundary

Shared public behavior tests run unchanged against `@taffyjs/node` and `@taffyjs/wasm` and cover all five operations, defaults, replacement, partial update, absence, null, empty collections, every Grid/string family, unknown and invalid fields, atomic failure, unchanged updates, floating-point edge cases, NodeId precedence, getters, Proxies, reentrancy, children, and context. Rust safety tests exercise malformed headers, versions, bitmaps, lengths, counts, UTF-8, truncation, and trailing bytes without freezing a particular byte snapshot. Generated freshness is enforced by `vp run check:codegen` in a clean checkout.
