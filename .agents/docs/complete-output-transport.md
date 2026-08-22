# Complete-output Transport Optimization

## Direction

When a consumer needs a complete Style, Layout, DetailedLayoutInfo, or another complete native value, TaffyJS may reduce Node-API object-construction overhead by transferring a compact private representation from Rust and reconstructing the ordinary public JavaScript value with generated JavaScript code.

This is a data-transfer optimization, not selective query. Selective query reduces how much native data is read and converted. Complete-output transport keeps the complete result and changes how that result crosses the native boundary and where its JavaScript objects are created. Neither mechanism replaces the other, although both may use the same canonical description of public output values.

## Reference mechanism

- A canonical output description generates a Rust encoder, a fixed JavaScript decoder, and parity checks. The decoder should contain ordinary type-specific object and array construction rather than interpret a schema at runtime.
- Fixed scalar records may use a flat numeric buffer. Tagged variants, nullable values, variable-length arrays, nested arrays, and strings may use generated tags, presence markers, offsets, lengths, and separate data regions.
- The encoded representation is a private contract between the JavaScript wrapper and its native addon. It is not a public result format or a consumer-facing serialization API.
- Reconstructed values must preserve the complete getter's observable value, prototype, property order and descriptors, ownership, and error behavior.

## Adoption rule

General generation makes the mechanism maintainable; it does not prove that every generated codec is faster. Encoding, decoding, temporary buffers, string conversion, retained memory, and garbage collection can outweigh avoided Node-API property construction. Each data kind and workload therefore requires escaped-result latency, retained-memory, and sustained-GC measurements before this transport replaces its existing internal conversion path.

Layout is the first candidate because its complete output is a fixed numeric record. Style and DetailedLayoutInfo should use the same direction only after representative default, nested collection, tagged-variant, string-heavy, single-value, and batch workloads demonstrate a material end-to-end benefit.

The public complete getter remains the semantic baseline regardless of its private transport. This direction does not add a new public API by itself and does not weaken the need for selective query when a consumer wants only part of a value.

## Implemented Layout transport

`getLayout()` and `getUnroundedLayout()` use one private caller-owned 21-slot `Float64Array` whose order is generated from `api/layout-codec.json`. Rust validates the exact length, synchronously writes all slots through a borrowed view, and retains neither the view nor its pointer. TypeScript immediately reconstructs a fresh complete ordinary `Layout` object, preserving the public API and detached-snapshot semantics.

Native targets write into the JavaScript buffer through the borrowed Node-API view. The scratch buffer is allocated over an explicit `ArrayBuffer` rather than by length: JavaScriptCore materializes the backing buffer of a length-constructed typed array lazily, and Bun loses the first pointer write into any such buffer, so an eagerly allocated buffer keeps one shared path correct on Node, Deno, and Bun alike.

The Wasm target fills the same buffer through `napi_set_element` instead. Node-API promises that `napi_get_typedarray_info` yields a pointer into the array's own storage, and a Wasm module cannot be given such a pointer, because its linear memory cannot address the JavaScript heap; Emnapi can only hand back a copy. Writing the elements keeps the Wasm binding inside portable Node-API and leaves the generated loaders untouched, at the cost of 21 calls per read instead of one.
