# `@taffyjs/node`

`@taffyjs/node` is the ESM-only Node-API entry point for TaffyJS. Its authored public wrapper keeps raw native operations private, and its napi-rs-generated internal loader selects an optional `@taffyjs/binding-<platform>` implementation package without an intermediate generic binding package. The package is private while the binding API and supported release targets are being designed.
