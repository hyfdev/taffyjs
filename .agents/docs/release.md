# Release

TaffyJS has two independently dispatched release groups. Core publishes `@taffyjs/node`, `@taffyjs/wasm`, and all 13 exact-version native binding packages. Yoga publishes `@taffyjs/yoga` and `@taffyjs/yoga-wasm` at one version while retaining exact dependencies on the latest complete Core release. Source manifests stay private at `0.0.0`; release versions exist only in verified staging manifests, npm, and the group-specific `core-v*` or `yoga-v*` tag.

## Ordinary release

Dispatch `Publish Core` or `Publish Yoga` from `main`. The default `auto` bump reads Conventional Commits that changed the selected group's owned paths since its previous tag. A feature or breaking change selects a minor bump; a fix, performance change, or revert selects a patch bump. An explicit patch or minor override exists for an intentional release whose commit type does not carry a bump. A group's first stable plan is always `0.0.1`.

The dispatch is the sole human authorization. Build jobs have read-only repository access and no npm identity. The Core workflow is the only place that builds all 13 supported native release targets; ordinary pull requests retain the three blocking native runtime jobs instead of paying for the full distribution matrix. The assembly job downloads every required build artifact, requires the exact target or package set, writes final metadata, packs the public packages, records each tarball integrity, and installs those same tarballs in a fresh consumer. Only the final job receives `id-token: write`; it publishes the verified tarballs in dependency order, verifies registry integrity and installed behavior, then creates the group-specific GitHub Release from automatically generated notes.

Publishing is not transactional. A retry uses the retained bundle: a package version already present with the same integrity is skipped, a different integrity stops the release, and missing packages continue in dependency order. GitHub tags and releases are created only after the complete npm group and its registry smoke check pass. Workflow concurrency never cancels an in-progress publication.

## One-time npm bootstrap

Trusted publishing can be configured only after a package exists. After the publication workflows reach `main`, run `vp run release:bootstrap-npm` once from a clean, current `main` checkout authenticated to npm. The tool preflights all 17 names, publishes only missing MIT-licensed `0.0.0-bootstrap.0` placeholders under the non-default `bootstrap` tag, binds the 15 Core packages to `publish-core.yml` and the two Yoga packages to `publish-yoga.yml`, and verifies every result. The command is resumable after a partial failure. `vp run release:bootstrap-npm:dry-run` builds the placeholder tarballs without changing npm.

The bootstrap command deliberately leaves npm authentication to the operator and never reads, prints, creates, retains, or revokes a token. Any temporary token must be removed after the command. The account must have 2FA enabled; npm's first bulk trust request opens the proof-of-presence flow, after which npm can suppress repeated prompts during its short bulk-configuration window.
