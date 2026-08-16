# Design Philosophy

Choosing WebAssembly should change where Taffy runs, not how an application describes layout.

That is the central rule behind `@taffyjs/wasm`. It exposes the same public API as `@taffyjs/node`, built from the same authored JavaScript and TypeScript source. A program can choose the native or WebAssembly package without learning a second tree, style, or measurement model.

## Change the runtime, not the program

The two direct packages are not separate implementations kept similar by convention. The Wasm build compiles the source owned by `@taffyjs/node` against a different private binding. The public type and behavior suites then run against both packages.

In ordinary code, the runtime choice is visible in one place:

```ts
import { TaffyTree } from "@taffyjs/wasm";
```

The rest of the direct TaffyJS API stays the same. This is why the Guide and the detailed API pages can use `@taffyjs/node` without maintaining a second Wasm edition of every example.

## Make the choice explicit

`@taffyjs/node` is the native-addon choice on supported platforms. `@taffyjs/wasm` is the WebAssembly choice for bundled browsers and other supported runtimes. The package name records which one the application selected.

There is no automatic fallback from native code to WebAssembly. A silent fallback would make deployment failures harder to see and make performance depend on the machine that happened to load the package. An explicit import keeps the runtime predictable and lets applications make the tradeoff deliberately.

Comparative performance claims should come from end-to-end benchmarks that include JavaScript conversion costs. The architecture makes that comparison useful: either result can guide a package choice without requiring an API rewrite.

## Package the binary with the code

The Wasm binary is stored once inside a private JavaScript module. A bundled browser application does not need to copy a `.wasm` asset, construct its URL, or fetch it at runtime. This is especially useful when the output must be one self-contained JavaScript file or executable.

Initialization belongs to module loading rather than a second TaffyJS lifecycle. That keeps layout code independent of the runtime choice and lets applications use JavaScript's existing loading controls. The [Overview](./index.md#loading) shows the static and lazy forms.

Inlining increases the uncompressed JavaScript payload, and bundled browsers must support the package's module requirements. Those are visible deployment tradeoffs, not costs hidden behind a second public API.
