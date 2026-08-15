# @taffyjs/yoga

`@taffyjs/yoga` is an ESM-only, Node.js `>=22.18` compatibility facade for `yoga-layout@3.2.1`, implemented in TypeScript over `@taffyjs/node`.

The package is under active development and is not published. Its root and `/load` entries are exercised through the repository's package-boundary consumer tests.

The current implementation includes Yoga-shaped Config, Style, topology, calculation, computed-output, and synchronous Measure APIs. Taffy remains the only layout engine; the compatibility layer maps Yoga declarations and callback constraints and documents the cases where Taffy's result intentionally differs.

See [COMPATIBILITY.md](COMPATIBILITY.md) for the current compatibility boundary.
