# @taffyjs/node Maturity Loop Status

<!-- loop-status-json:start -->

```json
{
  "schemaVersion": 1,
  "contractBaseCommit": "d1966aac42d90a11fa477598de5fd24838c1a9e7",
  "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
  "activeMilestone": "M3",
  "phase": "review-fix",
  "activeTaskId": "TEST-STYLE-001",
  "taskStates": {
    "INFRA-001": "accepted",
    "INFRA-002": "accepted",
    "INFRA-004": "accepted",
    "INFRA-003": "accepted",
    "TYPE-NUMBER-001": "accepted",
    "TYPE-GEOMETRY-001": "accepted",
    "TYPE-LENGTH-001": "accepted",
    "TYPE-AVAILABLE-001": "accepted",
    "TYPE-GRID-001": "accepted",
    "TYPE-STYLE-001": "accepted",
    "TYPE-NODEID-001": "accepted",
    "TYPE-LAYOUT-001": "accepted",
    "TYPE-DETAIL-001": "accepted",
    "TYPE-MEASURE-001": "accepted",
    "API-TREE-001": "accepted",
    "API-TREE-020": "accepted",
    "API-TREE-004": "accepted",
    "API-TREE-023": "accepted",
    "API-TREE-024": "accepted",
    "API-TREE-007": "accepted",
    "API-TREE-006": "accepted",
    "API-TREE-019": "accepted",
    "API-TREE-021": "accepted",
    "API-TREE-022": "accepted",
    "API-TREE-018": "accepted",
    "API-TREE-011": "accepted",
    "API-TREE-012": "accepted",
    "API-TREE-013": "accepted",
    "API-TREE-014": "accepted",
    "API-TREE-015": "accepted",
    "API-TREE-016": "accepted",
    "API-TREE-017": "accepted",
    "API-TREE-005": "accepted",
    "API-TREE-010": "accepted",
    "API-TREE-009": "accepted",
    "API-TREE-031": "accepted",
    "API-TREE-030": "accepted",
    "API-TREE-025": "accepted",
    "API-TREE-026": "accepted",
    "API-TREE-002": "accepted",
    "API-TREE-003": "accepted",
    "API-TREE-027": "accepted",
    "API-TREE-028": "accepted",
    "API-TREE-029": "accepted",
    "API-TREE-008": "accepted",
    "TEST-STYLE-001": "implemented",
    "TEST-COMMON-NODEID": "implemented",
    "TEST-COMMON-ATOMICITY": "implemented",
    "TEST-TYPES-001": "implemented",
    "TEST-ALGORITHMS-001": "implemented",
    "MATURITY-001": "pending",
    "MATURITY-002": "pending",
    "MATURITY-003": "pending"
  },
  "prefixEvidenceCommit": null,
  "milestoneReviewCommit": null,
  "previousAcceptedMilestoneCommit": "a51e27ee8c757fc8a45110f17c837080e9873d2d",
  "redEvidence": [
    {
      "taskId": "INFRA-001",
      "candidateCommit": "d1966aac42d90a11fa477598de5fd24838c1a9e7",
      "command": "vp run check:contract:self-test",
      "exitCode": 1,
      "result": "All six statically registered INFRA-001 machine-check acceptances were collected once and failed because tools/taffy-api/src/index.mjs did not yet exist.",
      "acceptanceIds": [
        "INFRA-001/generate",
        "INFRA-001/pin-drift",
        "INFRA-001/source-drift",
        "INFRA-001/task-drift",
        "INFRA-001/collection-drift",
        "INFRA-001/incremental-all"
      ]
    },
    {
      "taskId": "INFRA-002",
      "candidateCommit": "f4344091f55d6b98494dfeb48300dfe2917aa3ce",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=default tests/taffyjs-node/tests/package/INFRA-002.test.mts",
      "exitCode": 1,
      "result": "All four statically registered INFRA-002 acceptances were collected once and failed: the authored src/index.ts and private native.d.ts were absent, and the preimplementation package lacked the packed platform-consumer foundation.",
      "acceptanceIds": [
        "INFRA-002/source-entry",
        "INFRA-002/private-native",
        "INFRA-002/pack-entry",
        "INFRA-002/foundation-exports"
      ]
    },
    {
      "taskId": "INFRA-004",
      "candidateCommit": "894450fdbce2792406b4ae9854101650c5692011",
      "command": "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/native/INFRA-004.test.mts",
      "exitCode": 1,
      "result": "All five native-JavaScript acceptances were collected once and failed because NativeTaffyTree and its test-hook artifact did not yet exist.",
      "acceptanceIds": [
        "INFRA-004/taxonomy",
        "INFRA-004/busy-unit",
        "INFRA-004/expected-reuse",
        "INFRA-004/panic-poisons",
        "INFRA-004/process-survives"
      ]
    },
    {
      "taskId": "INFRA-004",
      "candidateCommit": "894450fdbce2792406b4ae9854101650c5692011",
      "command": "cargo test -p taffyjs_binding --lib -- --exact contract_tests::contract__infra_004__owner_shape",
      "exitCode": 101,
      "result": "The exact Rust owner-shape test failed to compile because NativeTaffyTree did not yet exist.",
      "acceptanceIds": ["INFRA-004/owner-shape"]
    },
    {
      "taskId": "INFRA-003",
      "candidateCommit": "97c726a80723ee61f80921440c6236325d83ef3e",
      "command": "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/native/INFRA-003.test.mts",
      "exitCode": 1,
      "result": "All five native-JavaScript acceptances were collected once and failed because the generated numeric-family artifacts, runtime constants, and real raw style operations did not yet exist.",
      "acceptanceIds": [
        "INFRA-003/generate-check",
        "INFRA-003/codes",
        "INFRA-003/frozen",
        "INFRA-003/raw-literal",
        "INFRA-003/invalid-code"
      ]
    },
    {
      "taskId": "INFRA-003",
      "candidateCommit": "97c726a80723ee61f80921440c6236325d83ef3e",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "The exact INFRA-003/narrowing fixture was collected once and failed because the public Display value and type did not yet exist.",
      "acceptanceIds": ["INFRA-003/narrowing"]
    },
    {
      "taskId": "TYPE-NUMBER-001",
      "candidateCommit": "e3fddb4e7ad376ae97e0b91d71d4e49ff13c35f4",
      "command": "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/native/TYPE-NUMBER-001.test.mts",
      "exitCode": 1,
      "result": "All five native-JavaScript acceptances were collected once and failed because the real raw Style operations that consume the shared number converters did not yet exist.",
      "acceptanceIds": [
        "TYPE-NUMBER-001/number-only",
        "TYPE-NUMBER-001/f32-truth",
        "TYPE-NUMBER-001/f32-special",
        "TYPE-NUMBER-001/integer-bounds",
        "TYPE-NUMBER-001/no-coercion"
      ]
    },
    {
      "taskId": "TYPE-GEOMETRY-001",
      "candidateCommit": "d10fbd69e33766622155b8050071ceb946fc1674",
      "command": "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/native/TYPE-GEOMETRY-001.test.mts",
      "exitCode": 1,
      "result": "All five native-JavaScript acceptances were collected once and failed because the real raw Style operations and geometry converters did not yet exist.",
      "acceptanceIds": [
        "TYPE-GEOMETRY-001/style-partial",
        "TYPE-GEOMETRY-001/components",
        "TYPE-GEOMETRY-001/style-shape-errors",
        "TYPE-GEOMETRY-001/scalar-scope",
        "TYPE-GEOMETRY-001/detached-reuse"
      ]
    },
    {
      "taskId": "TYPE-GEOMETRY-001",
      "candidateCommit": "d10fbd69e33766622155b8050071ceb946fc1674",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "Both TYPE-GEOMETRY-001 declaration fixtures were collected once and failed because the public geometry declarations did not yet exist.",
      "acceptanceIds": ["TYPE-GEOMETRY-001/declarations", "TYPE-GEOMETRY-001/readonly"]
    },
    {
      "taskId": "TYPE-LENGTH-001",
      "candidateCommit": "802bf61fb8b37dfcb1972ce8fcd78713be6db53a",
      "command": "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/native/TYPE-LENGTH-001.test.mts",
      "exitCode": 1,
      "result": "All seven native-JavaScript acceptances were collected once and failed because the public helper and real raw Style operations did not yet exist.",
      "acceptanceIds": [
        "TYPE-LENGTH-001/helper-conversion",
        "TYPE-LENGTH-001/percent-scale",
        "TYPE-LENGTH-001/f32-special",
        "TYPE-LENGTH-001/invalid-shape",
        "TYPE-LENGTH-001/auto-extra",
        "TYPE-LENGTH-001/canonical",
        "TYPE-LENGTH-001/aggregate"
      ]
    },
    {
      "taskId": "TYPE-LENGTH-001",
      "candidateCommit": "802bf61fb8b37dfcb1972ce8fcd78713be6db53a",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/contract/TYPE-LENGTH-001.test.mts",
      "exitCode": 1,
      "result": "Both public-JavaScript acceptances were collected once and failed because Dimension was not yet exported.",
      "acceptanceIds": ["TYPE-LENGTH-001/forms", "TYPE-LENGTH-001/helper-materialization"]
    },
    {
      "taskId": "TYPE-LENGTH-001",
      "candidateCommit": "802bf61fb8b37dfcb1972ce8fcd78713be6db53a",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "The TYPE-LENGTH-001/narrowing fixture was collected once and failed because the public length declarations did not yet exist.",
      "acceptanceIds": ["TYPE-LENGTH-001/narrowing"]
    },
    {
      "taskId": "TYPE-AVAILABLE-001",
      "candidateCommit": "1f9e22330da851776386eb526b359e25ac458dd5",
      "command": "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/native/TYPE-AVAILABLE-001.test.mts",
      "exitCode": 1,
      "result": "All six native-JavaScript acceptances were collected once and failed because the public helper and real raw compute operations did not yet exist.",
      "acceptanceIds": [
        "TYPE-AVAILABLE-001/axis-record",
        "TYPE-AVAILABLE-001/helper-conversion",
        "TYPE-AVAILABLE-001/definite-value",
        "TYPE-AVAILABLE-001/content-extra",
        "TYPE-AVAILABLE-001/f32-special",
        "TYPE-AVAILABLE-001/whole-value-errors"
      ]
    },
    {
      "taskId": "TYPE-AVAILABLE-001",
      "candidateCommit": "1f9e22330da851776386eb526b359e25ac458dd5",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/contract/TYPE-AVAILABLE-001.test.mts",
      "exitCode": 1,
      "result": "Both public-JavaScript acceptances were collected once and failed because AvailableSpace was not yet exported.",
      "acceptanceIds": ["TYPE-AVAILABLE-001/variants", "TYPE-AVAILABLE-001/helper-materialization"]
    },
    {
      "taskId": "TYPE-AVAILABLE-001",
      "candidateCommit": "1f9e22330da851776386eb526b359e25ac458dd5",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "Both TYPE-AVAILABLE-001 declaration fixtures were collected once and failed because the public available-space declarations did not yet exist.",
      "acceptanceIds": ["TYPE-AVAILABLE-001/narrowing", "TYPE-AVAILABLE-001/readonly-reuse"]
    },
    {
      "taskId": "TYPE-GRID-001",
      "candidateCommit": "daf5b54b26b1a0b2c42e4865885c084a7f9440d1",
      "command": "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts",
      "exitCode": 1,
      "result": "All nine native-JavaScript acceptances were collected once and failed because the four public helpers and real raw Style operations did not yet exist.",
      "acceptanceIds": [
        "TYPE-GRID-001/helper-conversion",
        "TYPE-GRID-001/panic-guard",
        "TYPE-GRID-001/integers",
        "TYPE-GRID-001/strings",
        "TYPE-GRID-001/ownership",
        "TYPE-GRID-001/areas-null",
        "TYPE-GRID-001/canonical",
        "TYPE-GRID-001/extra-fields",
        "TYPE-GRID-001/no-css-validation"
      ]
    },
    {
      "taskId": "TYPE-GRID-001",
      "candidateCommit": "daf5b54b26b1a0b2c42e4865885c084a7f9440d1",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/contract/TYPE-GRID-001.test.mts",
      "exitCode": 1,
      "result": "All four public-JavaScript acceptances were collected once and failed because the Grid helper objects were not yet exported.",
      "acceptanceIds": [
        "TYPE-GRID-001/families",
        "TYPE-GRID-001/minmax",
        "TYPE-GRID-001/repeat-lines",
        "TYPE-GRID-001/helper-materialization"
      ]
    },
    {
      "taskId": "TYPE-STYLE-001",
      "candidateCommit": "022f913d7acea98de3976dfa63f292f1ab47a900",
      "command": "vp test --config packages/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs packages/taffyjs-node/tests/native/TYPE-STYLE-001.test.mts",
      "exitCode": 1,
      "result": "All seven native-JavaScript acceptances were collected once and failed because the Style converter source and real raw Style operations did not yet exist.",
      "acceptanceIds": [
        "TYPE-STYLE-001/field-set",
        "TYPE-STYLE-001/default-dispatch",
        "TYPE-STYLE-001/nullable-dispatch",
        "TYPE-STYLE-001/container-shape",
        "TYPE-STYLE-001/unknown-calc",
        "TYPE-STYLE-001/complete-before-native",
        "TYPE-STYLE-001/eager-output"
      ]
    },
    {
      "taskId": "TYPE-NODEID-001",
      "candidateCommit": "f3ccbac54015562ecd0744ce21d98f8f64b6a809",
      "command": "vp run check:test:integration",
      "exitCode": 1,
      "result": "All six public JavaScript acceptances were collected once and failed because TaffyTree was not yet exported.",
      "acceptanceIds": [
        "TYPE-NODEID-001/js-identity",
        "TYPE-NODEID-001/malformed",
        "TYPE-NODEID-001/foreign",
        "TYPE-NODEID-001/stale-clear",
        "TYPE-NODEID-001/slot-reuse",
        "TYPE-NODEID-001/realm-copy"
      ]
    },
    {
      "taskId": "TYPE-NODEID-001",
      "candidateCommit": "f3ccbac54015562ecd0744ce21d98f8f64b6a809",
      "command": "vp run check:test:wrapper",
      "exitCode": 1,
      "result": "The wrapper test file was collected but could not load because the production-private tree module did not yet exist.",
      "acceptanceIds": ["TYPE-NODEID-001/rng", "TYPE-NODEID-001/serial-boundary"]
    },
    {
      "taskId": "TYPE-NODEID-001",
      "candidateCommit": "f3ccbac54015562ecd0744ce21d98f8f64b6a809",
      "command": "vp run check:test:types",
      "exitCode": 1,
      "result": "The opaque NodeId type fixture was collected once and failed because NodeId was not yet declared.",
      "acceptanceIds": ["TYPE-NODEID-001/opaque"]
    },
    {
      "taskId": "TYPE-LAYOUT-001",
      "candidateCommit": "6d91802c4758a1efe227a52a18849d052733f6ce",
      "command": "vp run check:test:integration",
      "exitCode": 1,
      "result": "All five public JavaScript acceptances were collected once and failed because the public TaffyTree and Layout getters did not yet exist.",
      "acceptanceIds": [
        "TYPE-LAYOUT-001/zero",
        "TYPE-LAYOUT-001/f32-special",
        "TYPE-LAYOUT-001/exact-keys",
        "TYPE-LAYOUT-001/detached",
        "TYPE-LAYOUT-001/shared-converter"
      ]
    },
    {
      "taskId": "TYPE-LAYOUT-001",
      "candidateCommit": "6d91802c4758a1efe227a52a18849d052733f6ce",
      "command": "vp run check:test:native",
      "exitCode": 1,
      "result": "The u32 widening acceptance was collected once and failed because the production Layout converter test hook did not yet exist.",
      "acceptanceIds": ["TYPE-LAYOUT-001/order-u32"]
    },
    {
      "taskId": "TYPE-LAYOUT-001",
      "candidateCommit": "6d91802c4758a1efe227a52a18849d052733f6ce",
      "command": "vp run check:test:types",
      "exitCode": 1,
      "result": "The readonly Layout fixture was collected once and failed because Layout was not yet declared.",
      "acceptanceIds": ["TYPE-LAYOUT-001/readonly"]
    },
    {
      "taskId": "TYPE-DETAIL-001",
      "candidateCommit": "8e16d8de41979bb03f19f9f55f55dccf3756b33d",
      "command": "vp run check:test:integration",
      "exitCode": 1,
      "result": "All four public JavaScript acceptances were collected once and failed because the detailed-layout public method and native converter did not yet exist.",
      "acceptanceIds": [
        "TYPE-DETAIL-001/variants",
        "TYPE-DETAIL-001/numeric-widening",
        "TYPE-DETAIL-001/detached",
        "TYPE-DETAIL-001/lifecycle"
      ]
    },
    {
      "taskId": "TYPE-DETAIL-001",
      "candidateCommit": "8e16d8de41979bb03f19f9f55f55dccf3756b33d",
      "command": "vp run check:test:types",
      "exitCode": 1,
      "result": "The narrowing fixture was collected once and failed because DetailedLayoutInfo was not yet declared.",
      "acceptanceIds": ["TYPE-DETAIL-001/narrowing"]
    },
    {
      "taskId": "TYPE-MEASURE-001",
      "candidateCommit": "7c8e54a37c0628842431434f5c655c53bd3c7425",
      "command": "vp run check:test:integration",
      "exitCode": 1,
      "result": "All five public JavaScript acceptances were collected once and failed because the public tree and measure callback bridge did not yet exist.",
      "acceptanceIds": [
        "TYPE-MEASURE-001/args-owned",
        "TYPE-MEASURE-001/result-sync",
        "TYPE-MEASURE-001/failure-state",
        "TYPE-MEASURE-001/env-lifetime",
        "TYPE-MEASURE-001/no-retention"
      ]
    },
    {
      "taskId": "TYPE-MEASURE-001",
      "candidateCommit": "7c8e54a37c0628842431434f5c655c53bd3c7425",
      "command": "cargo test -p taffyjs_binding --lib -- --exact contract_tests::contract__type_measure_001__non_send",
      "exitCode": 101,
      "result": "The exact Rust compile-time test failed because the environment-bound MeasureSession type did not yet exist.",
      "acceptanceIds": ["TYPE-MEASURE-001/non-send"]
    },
    {
      "taskId": "API-TREE-001",
      "candidateCommit": "30c024f7018a8d1736e882a6e39d437798421a96",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-001.test.mts",
      "exitCode": 1,
      "result": "Both public JavaScript acceptances were collected once and failed because TaffyTree was not yet exported.",
      "acceptanceIds": ["API-TREE-001/construct", "API-TREE-001/export-boundary"]
    },
    {
      "taskId": "API-TREE-001",
      "candidateCommit": "30c024f7018a8d1736e882a6e39d437798421a96",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "The generic declaration fixture was collected once and failed because TaffyTree was not yet declared.",
      "acceptanceIds": ["API-TREE-001/generic"]
    },
    {
      "taskId": "API-TREE-020",
      "candidateCommit": "f5cbe5c70ba2a0ae3b1763d261ce7abffc4e2bd0",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-020.test.mts",
      "exitCode": 1,
      "result": "All three public JavaScript acceptances were collected once and failed because getNodeCount was not yet public.",
      "acceptanceIds": [
        "API-TREE-020/initial",
        "API-TREE-020/leaf-clear",
        "API-TREE-020/number-result"
      ]
    },
    {
      "taskId": "API-TREE-004",
      "candidateCommit": "7cb2529eb77ec1b2812a4501ea7819cd94962b7d",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-004.test.mts",
      "exitCode": 1,
      "result": "All four public JavaScript acceptances were collected once and failed because newLeaf was not yet public.",
      "acceptanceIds": [
        "API-TREE-004/default-style",
        "API-TREE-004/nondefault-style",
        "API-TREE-004/stable-id",
        "API-TREE-004/conversion-atomic"
      ]
    },
    {
      "taskId": "API-TREE-023",
      "candidateCommit": "27c95ad5f7534ed75eb29e6a259cb9f0f53d1a76",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-023.test.mts",
      "exitCode": 1,
      "result": "All seven public JavaScript acceptances were collected once and failed because setStyle was not yet public.",
      "acceptanceIds": [
        "API-TREE-023/complete-replace",
        "API-TREE-023/undefined-null",
        "API-TREE-023/unknown-calc",
        "API-TREE-023/conversion-families",
        "API-TREE-023/dirty",
        "API-TREE-023/failure-atomic",
        "API-TREE-023/invalid-id"
      ]
    },
    {
      "taskId": "API-TREE-024",
      "candidateCommit": "aab5585bf0c5b7c216a0f69d0a68b0f3c1198670",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-024.test.mts",
      "exitCode": 1,
      "result": "All six runtime acceptances were collected once and failed because getStyle was not yet public.",
      "acceptanceIds": [
        "API-TREE-024/exact-keys",
        "API-TREE-024/null-output",
        "API-TREE-024/stored-f32",
        "API-TREE-024/deep-detached",
        "API-TREE-024/independent-snapshots",
        "API-TREE-024/invalid-id"
      ]
    },
    {
      "taskId": "API-TREE-024",
      "candidateCommit": "aab5585bf0c5b7c216a0f69d0a68b0f3c1198670",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "Both declaration acceptances were collected once and failed because getStyle was not yet declared.",
      "acceptanceIds": ["API-TREE-024/reusable-input", "API-TREE-024/readonly"]
    },
    {
      "taskId": "API-TREE-007",
      "candidateCommit": "203d824928d728a63b56abef6cafab00a70997c9",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-007.test.mts",
      "exitCode": 1,
      "result": "All four public JavaScript acceptances were collected once and failed because clear was not yet public.",
      "acceptanceIds": [
        "API-TREE-007/empty-tree",
        "API-TREE-007/leaf-tree",
        "API-TREE-007/ids-stale",
        "API-TREE-007/serial-monotonic"
      ]
    },
    {
      "taskId": "API-TREE-006",
      "candidateCommit": "7f9728ce30a66d4c6a70059fef0d8ea5053440e4",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-006.test.mts",
      "exitCode": 1,
      "result": "All six public JavaScript acceptances were collected once and failed because newWithChildren was not yet public.",
      "acceptanceIds": [
        "API-TREE-006/empty",
        "API-TREE-006/ordered-children",
        "API-TREE-006/duplicate",
        "API-TREE-006/attached",
        "API-TREE-006/invalid-id",
        "API-TREE-006/failure-atomic"
      ]
    },
    {
      "taskId": "API-TREE-019",
      "candidateCommit": "f02a93d175f3690844f41205fa311fdcdb8ddd1f",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-019.test.mts",
      "exitCode": 1,
      "result": "All four public JavaScript acceptances were collected once and failed because getChildCount was not yet public.",
      "acceptanceIds": [
        "API-TREE-019/empty",
        "API-TREE-019/topology-sequence",
        "API-TREE-019/number-result",
        "API-TREE-019/invalid-parent"
      ]
    },
    {
      "taskId": "API-TREE-021",
      "candidateCommit": "ee5a0db22c832ea79b1f95f319d22ae2e8e4be3a",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-021.test.mts",
      "exitCode": 1,
      "result": "All five public JavaScript acceptances were collected once and failed because getParent was not yet public.",
      "acceptanceIds": [
        "API-TREE-021/root-null",
        "API-TREE-021/attached",
        "API-TREE-021/transitions",
        "API-TREE-021/slot-reuse",
        "API-TREE-021/invalid-id"
      ]
    },
    {
      "taskId": "API-TREE-021",
      "candidateCommit": "ee5a0db22c832ea79b1f95f319d22ae2e8e4be3a",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "The declaration acceptance was collected once and failed because getParent was not yet declared.",
      "acceptanceIds": ["API-TREE-021/declaration"]
    },
    {
      "taskId": "API-TREE-022",
      "candidateCommit": "c4f6584200cef1ec0e06f6e886fa766b53f3297f",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-022.test.mts",
      "exitCode": 1,
      "result": "All five public JavaScript acceptances were collected once and failed because getChildren was not yet public.",
      "acceptanceIds": [
        "API-TREE-022/empty",
        "API-TREE-022/ordered",
        "API-TREE-022/stable-ids",
        "API-TREE-022/detached-array",
        "API-TREE-022/invalid-parent"
      ]
    },
    {
      "taskId": "API-TREE-022",
      "candidateCommit": "c4f6584200cef1ec0e06f6e886fa766b53f3297f",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "The readonly declaration acceptance was collected once and failed because getChildren was not yet declared.",
      "acceptanceIds": ["API-TREE-022/readonly"]
    },
    {
      "taskId": "API-TREE-018",
      "candidateCommit": "882ca8deb0cd492d7631f3ffd6300ff8e5943d4a",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-018.test.mts",
      "exitCode": 1,
      "result": "All four public JavaScript acceptances were collected once and failed because getChildAtIndex was not yet public.",
      "acceptanceIds": [
        "API-TREE-018/positions",
        "API-TREE-018/bounds",
        "API-TREE-018/integer",
        "API-TREE-018/invalid-parent"
      ]
    },
    {
      "taskId": "API-TREE-018",
      "candidateCommit": "882ca8deb0cd492d7631f3ffd6300ff8e5943d4a",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "The declaration acceptance was collected once and failed because getChildAtIndex was not yet declared.",
      "acceptanceIds": ["API-TREE-018/declaration"]
    },
    {
      "taskId": "API-TREE-011",
      "candidateCommit": "97f77adb51c1e84ff639be646bd865b779d572fb",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-011.test.mts",
      "exitCode": 1,
      "result": "All five public JavaScript acceptances were collected once and failed because addChild was not yet public.",
      "acceptanceIds": [
        "API-TREE-011/append",
        "API-TREE-011/dirty",
        "API-TREE-011/topology-reject",
        "API-TREE-011/id-roles",
        "API-TREE-011/failure-atomic"
      ]
    },
    {
      "taskId": "API-TREE-012",
      "candidateCommit": "8c6e5d299a9fe3c3b211ab041ad83c8216ea60b3",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-012.test.mts",
      "exitCode": 1,
      "result": "All five public JavaScript acceptances were collected once and failed because insertChildAtIndex was not yet public.",
      "acceptanceIds": [
        "API-TREE-012/positions",
        "API-TREE-012/end-bound",
        "API-TREE-012/index-errors",
        "API-TREE-012/id-roles",
        "API-TREE-012/failure-atomic"
      ]
    },
    {
      "taskId": "API-TREE-013",
      "candidateCommit": "13e94c435c5d3a15b20779b7d65a600126945b3f",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-013.test.mts",
      "exitCode": 1,
      "result": "All seven public JavaScript acceptances were collected once and failed because setChildren was not yet public.",
      "acceptanceIds": [
        "API-TREE-013/replace-order",
        "API-TREE-013/reparent",
        "API-TREE-013/detach-omitted",
        "API-TREE-013/dirty",
        "API-TREE-013/topology-reject",
        "API-TREE-013/invalid-middle",
        "API-TREE-013/failure-atomic"
      ]
    },
    {
      "taskId": "API-TREE-014",
      "candidateCommit": "551f8bd52fb1b87d76f7a436198d93477c320fcf",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-014.test.mts",
      "exitCode": 1,
      "result": "All five public JavaScript acceptances were collected once and failed because removeChild was not yet public.",
      "acceptanceIds": [
        "API-TREE-014/detach",
        "API-TREE-014/nonchild",
        "API-TREE-014/dirty",
        "API-TREE-014/id-roles",
        "API-TREE-014/failure-atomic"
      ]
    },
    {
      "taskId": "API-TREE-015",
      "candidateCommit": "129374c8fe71bc99722489ff0732da597be9569b",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-015.test.mts",
      "exitCode": 1,
      "result": "All five public JavaScript acceptances were collected once and failed because removeChildAtIndex was not yet public.",
      "acceptanceIds": [
        "API-TREE-015/positions",
        "API-TREE-015/returned-id",
        "API-TREE-015/bounds",
        "API-TREE-015/integer",
        "API-TREE-015/failure-atomic"
      ]
    },
    {
      "taskId": "API-TREE-016",
      "candidateCommit": "f9fb1ba073cd09893922849cc7f82b0edf65b583",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-016.test.mts",
      "exitCode": 1,
      "result": "All five public JavaScript acceptances were collected once and failed because removeChildrenRange was not yet public.",
      "acceptanceIds": [
        "API-TREE-016/ranges",
        "API-TREE-016/detached-live",
        "API-TREE-016/range-errors",
        "API-TREE-016/extra-properties",
        "API-TREE-016/failure-atomic"
      ]
    },
    {
      "taskId": "API-TREE-017",
      "candidateCommit": "e9f379d4bf2db61d047ca21f8c50fbc385218dfc",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-017.test.mts",
      "exitCode": 1,
      "result": "All seven public JavaScript acceptances were collected once and failed because replaceChildAtIndex was not yet public.",
      "acceptanceIds": [
        "API-TREE-017/replace",
        "API-TREE-017/returned-id",
        "API-TREE-017/dirty",
        "API-TREE-017/same-noop",
        "API-TREE-017/reject",
        "API-TREE-017/id-roles",
        "API-TREE-017/failure-atomic"
      ]
    },
    {
      "taskId": "API-TREE-005",
      "candidateCommit": "267a6c8f014732e3428a5448e0ef7cdf2eb3adc6",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-005.test.mts",
      "exitCode": 1,
      "result": "All five public JavaScript acceptances were collected once and failed because newLeafWithContext was not yet public.",
      "acceptanceIds": [
        "API-TREE-005/identity",
        "API-TREE-005/primitive-null-undefined",
        "API-TREE-005/removal-cleanup",
        "API-TREE-005/callback-delivery",
        "API-TREE-005/conversion-atomic"
      ]
    },
    {
      "taskId": "API-TREE-010",
      "candidateCommit": "536cf0ebebda7bf0f316956bec1a0d64ccf1cc8f",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-010.test.mts",
      "exitCode": 1,
      "result": "All four runtime acceptances were collected once and failed because getNodeContext was not yet public.",
      "acceptanceIds": [
        "API-TREE-010/absence",
        "API-TREE-010/identity",
        "API-TREE-010/manual-dirty",
        "API-TREE-010/invalid-id"
      ]
    },
    {
      "taskId": "API-TREE-010",
      "candidateCommit": "536cf0ebebda7bf0f316956bec1a0d64ccf1cc8f",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "The generic declaration acceptance was collected once and failed because getNodeContext was not yet declared.",
      "acceptanceIds": ["API-TREE-010/generic"]
    },
    {
      "taskId": "API-TREE-009",
      "candidateCommit": "72d1ba3806f94104661a0d47da844d8e737b3c00",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-009.test.mts",
      "exitCode": 1,
      "result": "All six public JavaScript acceptances were collected once and failed because setNodeContext was not yet public.",
      "acceptanceIds": [
        "API-TREE-009/replace-identity",
        "API-TREE-009/undefined-clears",
        "API-TREE-009/null-present",
        "API-TREE-009/always-dirty",
        "API-TREE-009/measure-delivery",
        "API-TREE-009/invalid-atomic"
      ]
    },
    {
      "taskId": "API-TREE-031",
      "candidateCommit": "d203429d6f24819ec6c377f7c48a3faa72aa455b",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-031.test.mts",
      "exitCode": 1,
      "result": "All nine public JavaScript acceptances were collected once and failed because computeLayout was not yet public.",
      "acceptanceIds": [
        "API-TREE-031/algorithms",
        "API-TREE-031/percentage-content",
        "API-TREE-031/stored-output",
        "API-TREE-031/cache",
        "API-TREE-031/rounding",
        "API-TREE-031/invalid-root",
        "API-TREE-031/invalid-space",
        "API-TREE-031/no-measure",
        "API-TREE-031/wrapper-atomic"
      ]
    },
    {
      "taskId": "API-TREE-030",
      "candidateCommit": "4df6fb5612cee7822f2e9c1ba78f2639f2af6b31",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-030.test.mts",
      "exitCode": 1,
      "result": "All twelve public JavaScript acceptances were collected once and failed because computeLayoutWithMeasure was not yet public.",
      "acceptanceIds": [
        "API-TREE-030/callback-args",
        "API-TREE-030/result-f32",
        "API-TREE-030/cache-calls",
        "API-TREE-030/same-tree-busy",
        "API-TREE-030/js-only-reentry",
        "API-TREE-030/different-tree",
        "API-TREE-030/throw-identity",
        "API-TREE-030/malformed-result",
        "API-TREE-030/zero-drain",
        "API-TREE-030/layout-nontransactional",
        "API-TREE-030/context-identity",
        "API-TREE-030/recovery"
      ]
    },
    {
      "taskId": "API-TREE-025",
      "candidateCommit": "f92b0c6bf851904b8012360718fc0870b5d874d3",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-025.test.mts",
      "exitCode": 1,
      "result": "All six runtime acceptances were collected once and failed because getLayout was not yet public.",
      "acceptanceIds": [
        "API-TREE-025/exact-zero",
        "API-TREE-025/rounding-selection",
        "API-TREE-025/stale-stored",
        "API-TREE-025/detached",
        "API-TREE-025/numeric-widening",
        "API-TREE-025/invalid-id"
      ]
    },
    {
      "taskId": "API-TREE-025",
      "candidateCommit": "f92b0c6bf851904b8012360718fc0870b5d874d3",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "The readonly declaration acceptance was collected once and failed because getLayout was not yet declared.",
      "acceptanceIds": ["API-TREE-025/readonly"]
    },
    {
      "taskId": "API-TREE-026",
      "candidateCommit": "5470fd3877cfa50e9a24767b3694343a84dc5387",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-026.test.mts",
      "exitCode": 1,
      "result": "All five runtime acceptances were collected once and failed because getUnroundedLayout was not yet public.",
      "acceptanceIds": [
        "API-TREE-026/exact-zero",
        "API-TREE-026/fractional",
        "API-TREE-026/stale-stored",
        "API-TREE-026/detached",
        "API-TREE-026/invalid-id"
      ]
    },
    {
      "taskId": "API-TREE-026",
      "candidateCommit": "5470fd3877cfa50e9a24767b3694343a84dc5387",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "The readonly declaration acceptance was collected once and failed because getUnroundedLayout was not yet declared.",
      "acceptanceIds": ["API-TREE-026/readonly"]
    },
    {
      "taskId": "API-TREE-002",
      "candidateCommit": "20687c2a37f5c4ece904ccfce1b0e8600e12b736",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-002.test.mts",
      "exitCode": 1,
      "result": "All three public JavaScript acceptances were collected once and failed because enableRounding was not yet public.",
      "acceptanceIds": [
        "API-TREE-002/select-rounded",
        "API-TREE-002/reenable",
        "API-TREE-002/no-compute"
      ]
    },
    {
      "taskId": "API-TREE-003",
      "candidateCommit": "aabfbf41cb88a14ab8fa36c0472dc7e6673f1368",
      "command": "vp test --config tests/taffyjs-node/vite.config.ts --reporter=tools/taffy-api/src/contract-reporter.mjs tests/taffyjs-node/tests/api/API-TREE-003.test.mts",
      "exitCode": 1,
      "result": "All three public JavaScript acceptances were collected once and failed because disableRounding was not yet public.",
      "acceptanceIds": [
        "API-TREE-003/select-unrounded",
        "API-TREE-003/repeat-toggle",
        "API-TREE-003/no-compute"
      ]
    },
    {
      "taskId": "API-TREE-027",
      "candidateCommit": "9d313eb6ceb65a18ec06ecd0d3f21ccad978b0b3",
      "command": "vp test --config vite.config.ts tests/taffyjs-node/tests/api/API-TREE-027.test.mts",
      "exitCode": 1,
      "result": "All six runtime acceptances failed because getDetailedLayoutInfo was not yet public.",
      "acceptanceIds": [
        "API-TREE-027/new-none",
        "API-TREE-027/empty-grid",
        "API-TREE-027/grid-payload",
        "API-TREE-027/deep-detached",
        "API-TREE-027/invalid-id",
        "API-TREE-027/stale-upstream"
      ]
    },
    {
      "taskId": "API-TREE-027",
      "candidateCommit": "9d313eb6ceb65a18ec06ecd0d3f21ccad978b0b3",
      "command": "node tools/taffy-api/src/run-type-tests.mjs",
      "exitCode": 1,
      "result": "The narrowing acceptance failed because getDetailedLayoutInfo was not yet declared.",
      "acceptanceIds": ["API-TREE-027/narrowing"]
    },
    {
      "taskId": "API-TREE-028",
      "candidateCommit": "966ade5951fc8816ad5245eb2421b3eb6821dc30",
      "command": "vp test --config vite.config.ts tests/taffyjs-node/tests/api/API-TREE-028.test.mts",
      "exitCode": 1,
      "result": "All six runtime acceptances failed because markDirty was not yet public.",
      "acceptanceIds": [
        "API-TREE-028/propagation",
        "API-TREE-028/idempotent",
        "API-TREE-028/layout-retained",
        "API-TREE-028/child-nuance",
        "API-TREE-028/any-node",
        "API-TREE-028/invalid-id"
      ]
    },
    {
      "taskId": "API-TREE-029",
      "candidateCommit": "47f7476fdb3cd8ee7d6b327565a82615f40ac750",
      "command": "vp test --config vite.config.ts tests/taffyjs-node/tests/api/API-TREE-029.test.mts",
      "exitCode": 1,
      "result": "All seven runtime acceptances failed because isDirty was not yet public.",
      "acceptanceIds": [
        "API-TREE-029/lifecycle",
        "API-TREE-029/style",
        "API-TREE-029/context",
        "API-TREE-029/topology",
        "API-TREE-029/explicit",
        "API-TREE-029/child-nuance",
        "API-TREE-029/invalid-id"
      ]
    },
    {
      "taskId": "API-TREE-008",
      "candidateCommit": "6b5804aaa8bed3e74a35c2f995623e6a9504cd31",
      "command": "vp test --config vite.config.ts tests/taffyjs-node/tests/api/API-TREE-008.test.mts",
      "exitCode": 1,
      "result": "All five runtime acceptances failed because remove was not yet public.",
      "acceptanceIds": [
        "API-TREE-008/remove-root",
        "API-TREE-008/remove-child",
        "API-TREE-008/id-stale",
        "API-TREE-008/parent-not-dirtied",
        "API-TREE-008/invalid-atomic"
      ]
    },
    {
      "taskId": "TYPE-MEASURE-001",
      "candidateCommit": "1748799d288b9dadfd93927249259585b1acca16",
      "command": "cargo test -p taffyjs_binding --lib -- --exact measure::tests::invalidate_subtree_handles_deep_trees",
      "exitCode": 101,
      "result": "The committed deep-tree regression test aborted with a Rust stack overflow because callback-failure cleanup recursively traversed 16,384 descendants.",
      "acceptanceIds": ["TYPE-MEASURE-001/failure-state"]
    }
  ],
  "greenEvidence": [],
  "commandEvidence": {},
  "finalOutputs": {},
  "reviewRoundId": "M3-round-3-aca55f0",
  "reviewerSlots": ["broad-1", "broad-2", "quality"],
  "reviewedCommits": {
    "contractBaseCommit": "d1966aac42d90a11fa477598de5fd24838c1a9e7",
    "previousCommit": "a51e27ee8c757fc8a45110f17c837080e9873d2d",
    "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615"
  },
  "inspectionCommands": [
    "git cat-file -e aca55f06a3301843f37dace481304ef1275df615^{commit}",
    "git diff --check 7468b5092419324ea7b43b5d6e1ace06e7d71865 aca55f06a3301843f37dace481304ef1275df615",
    "git diff --stat 7468b5092419324ea7b43b5d6e1ace06e7d71865 aca55f06a3301843f37dace481304ef1275df615",
    "git diff --find-renames 7468b5092419324ea7b43b5d6e1ace06e7d71865 aca55f06a3301843f37dace481304ef1275df615",
    "git diff --check a51e27ee8c757fc8a45110f17c837080e9873d2d aca55f06a3301843f37dace481304ef1275df615",
    "git diff --stat a51e27ee8c757fc8a45110f17c837080e9873d2d aca55f06a3301843f37dace481304ef1275df615",
    "git diff --find-renames a51e27ee8c757fc8a45110f17c837080e9873d2d aca55f06a3301843f37dace481304ef1275df615",
    "git diff --check d1966aac42d90a11fa477598de5fd24838c1a9e7 aca55f06a3301843f37dace481304ef1275df615",
    "git show aca55f06a3301843f37dace481304ef1275df615:.agents/docs/loop-goal.md",
    "git show aca55f06a3301843f37dace481304ef1275df615:tools/taffy-api/contract.json",
    "git show aca55f06a3301843f37dace481304ef1275df615:tools/taffy-api/src/run-type-tests.mjs",
    "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts",
    "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts",
    "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts",
    "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/contract/TEST-ALGORITHMS-001.test.mts",
    "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/contract/fixtures/complete-public-state.mts",
    "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/exports-signatures.test-d.ts",
    "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/valid-invalid.test-d.ts",
    "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/node-enum.test-d.ts",
    "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/mutability.test-d.ts",
    "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/context-nullish.test-d.ts",
    "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/private-absent.test-d.ts",
    "git show aca55f06a3301843f37dace481304ef1275df615:packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts"
  ],
  "currentTaskIds": [
    "TEST-STYLE-001",
    "TEST-COMMON-NODEID",
    "TEST-COMMON-ATOMICITY",
    "TEST-TYPES-001",
    "TEST-ALGORITHMS-001"
  ],
  "reviewInputProjection": {
    "contractBaseCommit": "d1966aac42d90a11fa477598de5fd24838c1a9e7",
    "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
    "previousAcceptedMilestoneCommit": "a51e27ee8c757fc8a45110f17c837080e9873d2d",
    "activeMilestone": "M3",
    "reviewRoundId": "M3-round-3-aca55f0",
    "currentTaskIds": [
      "TEST-STYLE-001",
      "TEST-COMMON-NODEID",
      "TEST-COMMON-ATOMICITY",
      "TEST-TYPES-001",
      "TEST-ALGORITHMS-001"
    ],
    "reviewerSlots": ["broad-1", "broad-2", "quality"],
    "inspectionCommands": [
      "git cat-file -e aca55f06a3301843f37dace481304ef1275df615^{commit}",
      "git diff --check 7468b5092419324ea7b43b5d6e1ace06e7d71865 aca55f06a3301843f37dace481304ef1275df615",
      "git diff --stat 7468b5092419324ea7b43b5d6e1ace06e7d71865 aca55f06a3301843f37dace481304ef1275df615",
      "git diff --find-renames 7468b5092419324ea7b43b5d6e1ace06e7d71865 aca55f06a3301843f37dace481304ef1275df615",
      "git diff --check a51e27ee8c757fc8a45110f17c837080e9873d2d aca55f06a3301843f37dace481304ef1275df615",
      "git diff --stat a51e27ee8c757fc8a45110f17c837080e9873d2d aca55f06a3301843f37dace481304ef1275df615",
      "git diff --find-renames a51e27ee8c757fc8a45110f17c837080e9873d2d aca55f06a3301843f37dace481304ef1275df615",
      "git diff --check d1966aac42d90a11fa477598de5fd24838c1a9e7 aca55f06a3301843f37dace481304ef1275df615",
      "git show aca55f06a3301843f37dace481304ef1275df615:.agents/docs/loop-goal.md",
      "git show aca55f06a3301843f37dace481304ef1275df615:tools/taffy-api/contract.json",
      "git show aca55f06a3301843f37dace481304ef1275df615:tools/taffy-api/src/run-type-tests.mjs",
      "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts",
      "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts",
      "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts",
      "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/contract/TEST-ALGORITHMS-001.test.mts",
      "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/contract/fixtures/complete-public-state.mts",
      "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/exports-signatures.test-d.ts",
      "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/valid-invalid.test-d.ts",
      "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/node-enum.test-d.ts",
      "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/mutability.test-d.ts",
      "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/context-nullish.test-d.ts",
      "git show aca55f06a3301843f37dace481304ef1275df615:tests/taffyjs-node/tests/types/TEST-TYPES-001/private-absent.test-d.ts",
      "git show aca55f06a3301843f37dace481304ef1275df615:packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts"
    ]
  },
  "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca",
  "reports": [
    {
      "slot": "broad-1",
      "reviewerIdentity": "/root/m3_broad_1",
      "startCandidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "endCandidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "startReviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca",
      "endReviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca",
      "earlierImpact": [
        "INFRA-001",
        "INFRA-003",
        "TYPE-GEOMETRY-001",
        "TYPE-LENGTH-001",
        "TYPE-AVAILABLE-001",
        "TYPE-NODEID-001",
        "TYPE-LAYOUT-001",
        "TYPE-DETAIL-001",
        "API-TREE-001",
        "API-TREE-010",
        "API-TREE-018",
        "API-TREE-021",
        "API-TREE-022",
        "API-TREE-024",
        "API-TREE-025",
        "API-TREE-026",
        "API-TREE-027"
      ],
      "inspectedEvidence": [
        "Full committed M3 diff and final fix diff, with endpoint and whitespace checks.",
        "Canonical contract and goal plus every M3 test, fixture, declaration, runner, and relevant converter source.",
        "All 17 earlier tasks affected by the shared type runner."
      ]
    },
    {
      "slot": "broad-2",
      "reviewerIdentity": "/root/m3_broad_2",
      "startCandidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "endCandidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "startReviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca",
      "endReviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca",
      "earlierImpact": [
        "INFRA-001",
        "INFRA-003",
        "TYPE-GEOMETRY-001",
        "TYPE-LENGTH-001",
        "TYPE-AVAILABLE-001",
        "TYPE-NODEID-001",
        "TYPE-LAYOUT-001",
        "TYPE-DETAIL-001",
        "API-TREE-001",
        "API-TREE-010",
        "API-TREE-018",
        "API-TREE-021",
        "API-TREE-022",
        "API-TREE-024",
        "API-TREE-025",
        "API-TREE-026",
        "API-TREE-027"
      ],
      "inspectedEvidence": [
        "Full committed M3 diff and final fix diff, with endpoint and whitespace checks.",
        "Canonical contract and goal plus every M3 test, fixture, declaration generator, checker, and runner graph.",
        "All 17 earlier tasks affected by the shared type runner."
      ]
    },
    {
      "slot": "quality",
      "reviewerIdentity": "/root/m3_quality",
      "startCandidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "endCandidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "startReviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca",
      "endReviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca",
      "earlierImpact": [
        "INFRA-001",
        "INFRA-003",
        "TYPE-GEOMETRY-001",
        "TYPE-LENGTH-001",
        "TYPE-AVAILABLE-001",
        "TYPE-NODEID-001",
        "TYPE-LAYOUT-001",
        "TYPE-DETAIL-001",
        "API-TREE-001",
        "API-TREE-010",
        "API-TREE-018",
        "API-TREE-021",
        "API-TREE-022",
        "API-TREE-024",
        "API-TREE-025",
        "API-TREE-026",
        "API-TREE-027"
      ],
      "inspectedEvidence": [
        "Full committed M3 diff and final fix diff, with endpoint and whitespace checks.",
        "Canonical contract and goal plus every M3 test, fixture, declaration assembler, type runner, and wrapper boundary test.",
        "All 17 earlier tasks affected by the shared type runner."
      ]
    }
  ],
  "verdicts": [
    {
      "taskId": "TEST-STYLE-001",
      "slot": "broad-1",
      "verdict": "FAIL",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-COMMON-NODEID",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-COMMON-ATOMICITY",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-TYPES-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-ALGORITHMS-001",
      "slot": "broad-1",
      "verdict": "FAIL",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "INFRA-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "INFRA-003",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-GEOMETRY-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-LENGTH-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-AVAILABLE-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-NODEID-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-LAYOUT-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-DETAIL-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-010",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-018",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-021",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-022",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-024",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-025",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-026",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-027",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-STYLE-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-COMMON-NODEID",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-COMMON-ATOMICITY",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-TYPES-001",
      "slot": "broad-2",
      "verdict": "FAIL",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-ALGORITHMS-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "INFRA-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "INFRA-003",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-GEOMETRY-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-LENGTH-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-AVAILABLE-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-NODEID-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-LAYOUT-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-DETAIL-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-010",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-018",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-021",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-022",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-024",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-025",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-026",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-027",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-STYLE-001",
      "slot": "quality",
      "verdict": "FAIL",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-COMMON-NODEID",
      "slot": "quality",
      "verdict": "FAIL",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-COMMON-ATOMICITY",
      "slot": "quality",
      "verdict": "FAIL",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-TYPES-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TEST-ALGORITHMS-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "INFRA-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "INFRA-003",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-GEOMETRY-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-LENGTH-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-AVAILABLE-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-NODEID-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-LAYOUT-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "TYPE-DETAIL-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-010",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-018",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-021",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-022",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-024",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-025",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-026",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    },
    {
      "taskId": "API-TREE-027",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "reviewInputStatusHash": "aa032491e118eb5b9835ac6efcbf5b37969dd00968c2b4ab47cf96848770d3ca"
    }
  ],
  "findings": [
    {
      "id": "M3-R1-B1-1",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Style semantic fixtures can stay green when dense placement, Unicode conversion, deep copy, or row and column underflow behavior is wrong.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R1-B1-2",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The declaration fixture does not assert every public runtime helper signature.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R1-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Style semantic fixtures omit Right clearing, observable dense placement, Unicode and surrogate conversion, deep copy, underflow, and integer boundaries.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R1-B2-2",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Callback-failure atomicity does not prove that no later measure callback runs after the first failure.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R1-B2-3",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The declaration fixture does not reference the complete public type inventory and excludes a possible phantomMarker value export.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R1-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Style semantic fixtures do not independently distinguish all AlignItems and AlignContent members or dense placement.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R1-Q-2",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The declaration fixture samples helper signatures instead of asserting every public runtime helper signature.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R1-Q-3",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Tree-busy atomicity checks code and message but not the canonical Error class.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R2-B1-2",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Layout parity assertions do not cite a stable pinned Taffy source or use a direct Rust Taffy fixture.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R2-B1-3",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The gridTemplateAreas row does not prove its required u16 boundaries.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R2-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Several Style semantic fixtures omit required Grid, flex-basis, nested-copy, padding, and area-boundary behavior.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R2-B2-2",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Algorithm parity literals lack stable pinned Taffy source locations or direct Rust fixtures.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R2-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Style semantics omit Grid justifyContent and gap behavior plus Percent and Auto flexBasis interactions.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R2-Q-2",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The gridTemplateAreas row does not prove its required u16 boundaries.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R2-Q-3",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The declaration identity references type-only exports without independently checking their exact structures.",
      "fixCommit": "aca55f06a3301843f37dace481304ef1275df615"
    },
    {
      "id": "M3-R3-B1-1",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "pending",
      "summary": "The itemIsTable and itemIsReplaced Style rows use indistinguishable samples and semantic layouts, so swapping the two bindings can leave their evidence green."
    },
    {
      "id": "M3-R3-B1-2",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "pending",
      "summary": "The algorithm consumer test omits the required mixed create, attach, detach, remove, and getNodeCount sequence."
    },
    {
      "id": "M3-R3-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "pending",
      "summary": "The type runner compares declaration bytes including JSDoc, which would reject the additional public JSDoc required by M4."
    },
    {
      "id": "M3-R3-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "pending",
      "summary": "Style invalid-value evidence only requires some exception and does not verify the contractually fixed built-in error class and code."
    },
    {
      "id": "M3-R3-Q-2",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "pending",
      "summary": "Generated NodeId evidence compares constructor names instead of exact built-in error constructors."
    },
    {
      "id": "M3-R3-Q-3",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "pending",
      "summary": "Two atomicity paths use instanceof and therefore allow subclasses where the contract requires exact built-in error constructors."
    }
  ],
  "closures": [
    {
      "findingId": "M3-R1-B1-1",
      "reviewerIdentity": "/root/m3_broad_1",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-B1-2",
      "reviewerIdentity": "/root/m3_broad_1",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-B2-2",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-B2-3",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-Q-2",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-Q-3",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-B1-2",
      "reviewerIdentity": "/root/m3_broad_1",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-B1-3",
      "reviewerIdentity": "/root/m3_broad_1",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-B2-2",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-Q-2",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-Q-3",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "aca55f06a3301843f37dace481304ef1275df615",
      "confirmed": true
    }
  ],
  "earlierDefects": [
    {
      "taskId": "INFRA-001",
      "evidence": "The canonical root native-test command collected zero package-local tests because the package config only matched paths relative to the package working directory.",
      "resolutionCommit": "894450fdbce2792406b4ae9854101650c5692011"
    },
    {
      "taskId": "INFRA-001",
      "evidence": "The blocked-state self-test cloned the live milestone without resetting its milestone and task states, so it stopped being a valid blocked-state fixture after M0 was accepted.",
      "resolutionCommit": "11ca1f04ed975e388f4e333ba248ed319ad8f64e"
    },
    {
      "taskId": "API-TREE-005",
      "evidence": "The first test incorrectly assumed an absent native context suppresses Taffy's measure call. Taffy still calls the supplied measure function and passes no context, which the wrapper exposes as undefined.",
      "resolutionCommit": "42b3761a8db7e83398ea0feafbeaff34aeb6f48a"
    },
    {
      "taskId": "API-TREE-009",
      "evidence": "The first undefined-clearing test repeated the same incorrect callback-suppression assumption; it now checks that the callback receives undefined.",
      "resolutionCommit": "42b3761a8db7e83398ea0feafbeaff34aeb6f48a"
    },
    {
      "taskId": "API-TREE-002",
      "evidence": "The first re-enable test assumed enabling rounding would also create a rounded stored layout. Pinned Taffy only selects its rounded store, which stays zero until the next computation.",
      "resolutionCommit": "919985844127d0190d499de039b28e17adc495db"
    },
    {
      "taskId": "API-TREE-027",
      "evidence": "The first empty-grid fixtures used a node with no children, which pinned Taffy computes as a leaf. A hidden child now makes the Grid algorithm run while still producing no grid items.",
      "resolutionCommit": "966ade5951fc8816ad5245eb2421b3eb6821dc30"
    },
    {
      "taskId": "API-TREE-027",
      "evidence": "The first fixed-grid expectation counted only the inner gap. Pinned Taffy reports all three zero-width gutter tracks around two explicit tracks.",
      "resolutionCommit": "966ade5951fc8816ad5245eb2421b3eb6821dc30"
    },
    {
      "taskId": "API-TREE-005",
      "evidence": "The first lifetime loop dereferenced the weak reference before each forced collection, which itself kept the target alive through that collection. It now collects before checking and ends the check turn before trying again.",
      "resolutionCommit": "33a7cbbc319e672c4d9ac5e244bcd38883781187"
    },
    {
      "taskId": "TYPE-MEASURE-001",
      "evidence": "The callback lifetime fixture used the same incorrect weak-reference loop as the context fixture. The corrected order proves the callback is released.",
      "resolutionCommit": "33a7cbbc319e672c4d9ac5e244bcd38883781187"
    },
    {
      "taskId": "TYPE-LAYOUT-001",
      "evidence": "The first special-value fixture expected NaN border and padding output without supplying NaN inputs. It now sets those exact Style fields before checking that the layout converter preserves them.",
      "resolutionCommit": "2c5b9d05f70a3e08cb7e2bd9541680f7062ff3e9"
    },
    {
      "taskId": "TYPE-MEASURE-001",
      "evidence": "M2 review found recursive callback-failure cache invalidation could overflow the Rust stack on a deep valid tree; a committed 16,384-node regression reproduced the abort.",
      "resolutionCommit": "a51e27ee8c757fc8a45110f17c837080e9873d2d"
    },
    {
      "taskId": "API-TREE-031",
      "evidence": "M2 review found the cache acceptance compared equal outputs without distinguishing reuse, and parity values lacked a fixed upstream source citation.",
      "resolutionCommit": "a51e27ee8c757fc8a45110f17c837080e9873d2d"
    },
    {
      "taskId": "API-TREE-001",
      "evidence": "M2 quality review found the private wrapper test seam copied most public methods and had already omitted setStyle.",
      "resolutionCommit": "a51e27ee8c757fc8a45110f17c837080e9873d2d"
    }
  ],
  "blockers": [],
  "remainingMinorFindings": [],
  "nextAction": "Discuss the six M3 round-3 findings with Yunfei before making any further implementation change."
}
```

<!-- loop-status-json:end -->
