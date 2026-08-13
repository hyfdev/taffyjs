# Binding Cleanup Handover

## Landed

- Ordinary JavaScript records now use local input-only or output-only napi-rs objects for field conversion before the binding maps them to or from Taffy types.
- Handwritten conversion remains only where the public contract needs exact numeric checks, tagged-value rules, null and undefined distinctions, unknown-field rejection, callback error forwarding, or tree safety timing.
- Plain `Style` booleans and line-name matrices are converted directly by napi-rs; the remaining `Unknown` fields need later semantic conversion.
- Native tests and fixtures describe observable behavior instead of implementation-plan identifiers, and duplicate tree-owner cases were combined without removing distinct coverage.
- The binding mapping and remaining-work records match the implementation. Compact input buffers remain a performance experiment that requires measurement and are not part of this change.

## Validation

- `vp run ready` passed on the final code and this handover, including Rust formatting, Clippy, Rust tests, generated files, native builds, packaging, integration tests, native tests, wrapper tests, type tests, lint, formatting, and the Node 22.18.0 packed-consumer check.
- Rust tests: 8 passed.
- Native boundary tests: 47 passed.
- JavaScript wrapper tests: 5 passed.
- Integration tests: 825 passed.
- GitHub Actions previously passed for all four declared native targets and the Node 22.18.0 packed consumer. The current CI has since been reduced to complete Ubuntu x64 checks and a Windows x64 native build; macOS and publication workflows are deferred.

## Review and Handover

- One independent final review found one remaining group of plain `Style` fields using `Unknown`; commit `c8b05b6` moved those fields to generated napi-rs conversion, and the same reviewer confirmed the fix.
- Draft PR: https://github.com/hyfdev/taffyjs/pull/1
- No package or release was published.
- Human follow-up: vouch the binding cleanup and retained handwritten exceptions, distill any durable conclusion into the maintained binding records, then remove the temporary loop files when they are no longer needed.
