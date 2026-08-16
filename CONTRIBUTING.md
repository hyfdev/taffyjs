# Contributing to TaffyJS

## Commit and merge policy

Every commit retained on `main` must follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). Pull requests targeting `main` must use squash merge, and the pull request title becomes the subject of the resulting commit.

Use this format for pull request titles and direct commits to `main`:

```text
type(scope)!: description
```

The scope and breaking-change marker are optional. Use one of these types:

- `build`: build system or dependency changes
- `chore`: repository maintenance that does not fit another type
- `ci`: continuous integration changes
- `docs`: documentation-only changes
- `feat`: new user-facing behavior
- `fix`: user-facing bug fixes
- `perf`: performance improvements
- `refactor`: code changes that preserve behavior
- `revert`: reverts of earlier changes
- `style`: formatting changes that do not affect behavior
- `test`: test-only changes

Examples:

```text
feat(node): add partial style updates
fix(runtime): use node: prefixes for builtins
docs: explain package design trade-offs
```

Use a `BREAKING CHANGE:` footer, or `!` before the colon, when the change breaks a public contract. Add explanatory body text and issue references when they make the resulting `main` commit easier to understand.

Topic-branch commits do not need to follow this format individually because the pull request is squashed. Before merging, make the pull request title an accurate final summary of the complete change.
