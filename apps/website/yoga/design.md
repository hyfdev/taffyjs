# Design

A migration is not successful merely because the new package exports the same method names. Existing source should keep compiling where the behavior is supported, and unsupported behavior should become visible before it turns into a layout bug.

`@taffyjs/yoga` treats Yoga compatibility as that larger problem.

## Preserve the model applications already use

The package keeps Yoga's root and `/load` entries, factories, numeric enums, node methods, declaration values, callbacks, and computed result shapes. A package-manager alias can keep existing `yoga-layout` imports unchanged.

This requires more than forwarding method calls. Yoga remembers declarations that cannot be reconstructed from a final Taffy style, such as logical edge precedence, unset values, shorthand state, and Config-sensitive defaults. The TypeScript facade retains that bounded Yoga-facing state, translates it into Taffy inputs, and projects Taffy's results back into Yoga's public shapes.

Taffy still owns the topology and performs every layout calculation. The facade does not implement a second Flexbox algorithm or patch Taffy to imitate Yoga.

## Make unsupported behavior visible

Some Yoga features do not have credible Taffy semantics. Pretending to accept them would make migration look successful until a particular layout path runs.

When TypeScript can identify such a value from one call, `@taffyjs/yoga` removes or narrows it in the public type. That compile error is a migration checklist: the application has found a place that needs a decision. JavaScript, `any`, and other dynamic inputs receive the matching runtime check before node or Config state changes.

This rule is intentionally limited. It does not try to encode relationships between an entire tree in TypeScript, and it does not reject a supported call merely because Taffy and Yoga can produce different geometry for a documented edge case.

## Be precise about compatibility

The compatibility target is Yoga 3.2.1, and each evaluated capability is classified in one of three ways:

- **Compatible** means the supported call and the behavior an application relies on match within the documented input boundary.
- **Different** means the call is available, but a named case keeps Taffy's stable result instead of reproducing Yoga's result.
- **Unsupported** means the package cannot provide defensible behavior within the facade and rejects the capability.

This is more useful than a compatibility percentage. It tells a migrating application which calls are unchanged, which results need attention, and which features require another plan. The complete list lives in the [compatibility guide](https://github.com/hyfdev/taffyjs/blob/main/packages/taffyjs-yoga/COMPATIBILITY.md).

The package also avoids copying incidental behavior that would make applications less safe, such as dangling objects after `free()`, Config pointers whose lifetime has ended, or exact internal callback traces. Compatibility follows the useful public contract, not every artifact of Yoga's current wrapper implementation.
