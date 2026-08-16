# Yoga official tests

`tests/` is an unmodified snapshot of Yoga's official JavaScript test sources. TaffyJS runs the snapshot through the public `yoga-layout` alias against both `@taffyjs/yoga` and `@taffyjs/yoga-wasm`.

- Source repository: [react/yoga](https://github.com/react/yoga)
- Tag: [`v3.2.1`](https://github.com/react/yoga/tree/v3.2.1)
- Commit: [`042f5013152eb81c1552dec945b88f7b95ca350f`](https://github.com/react/yoga/commit/042f5013152eb81c1552dec945b88f7b95ca350f)
- Included upstream paths: the ten handwritten `javascript/tests/*.test.ts` files, all twenty-five `javascript/tests/generated/*.test.ts` files, and their two required helpers
- Excluded upstream paths: benchmarks, the benchmark runner, and the unused benchmark-global helper

The snapshot contains 570 cases. Yoga 3.2.1 marks 17 of them skipped. `expected-failures.ts` classifies the 85 remaining cases that intentionally cannot pass under the published TaffyJS compatibility boundary: 77 exercise Unsupported capabilities and 8 exercise Known Differences. Vitest treats those cases as required failures, so an unexpected failure or an expected failure that starts passing both stop the suite and require a compatibility review. The maintained TaffyJS tests remain responsible for asserting the exact replacement behavior of Different and Unsupported cases.

Do not edit files under `tests/` by hand. A Yoga baseline update replaces this snapshot from one reviewed upstream commit, updates the source metadata and expected-failure classifications together, and reruns both backends. Do not copy Yoga's Chrome/Selenium generator into the normal test path; committed generated tests are the stable input.

The copied sources retain their Meta copyright headers. Yoga's complete MIT license is in [LICENSE](LICENSE).
