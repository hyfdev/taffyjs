# @taffyjs/node Maturity Loop Status

<!-- loop-status-json:start -->

```json
{
  "schemaVersion": 1,
  "contractBaseCommit": "d1966aac42d90a11fa477598de5fd24838c1a9e7",
  "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
  "activeMilestone": "M4",
  "phase": "build",
  "activeTaskId": "MATURITY-001",
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
    "TEST-STYLE-001": "accepted",
    "TEST-COMMON-NODEID": "accepted",
    "TEST-COMMON-ATOMICITY": "accepted",
    "TEST-TYPES-001": "accepted",
    "TEST-ALGORITHMS-001": "accepted",
    "MATURITY-001": "active",
    "MATURITY-002": "pending",
    "MATURITY-003": "pending"
  },
  "prefixEvidenceCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
  "milestoneReviewCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
  "previousAcceptedMilestoneCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
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
  "greenEvidence": [
    {
      "acceptanceId": "API-TREE-001/construct",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-001.test.mts"
    },
    {
      "acceptanceId": "API-TREE-001/export-boundary",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-001.test.mts"
    },
    {
      "acceptanceId": "API-TREE-001/generic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/API-TREE-001/generic.test-d.ts"
    },
    {
      "acceptanceId": "API-TREE-001/rng-failure",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:wrapper",
      "path": "packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts"
    },
    {
      "acceptanceId": "API-TREE-002/no-compute",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-002.test.mts"
    },
    {
      "acceptanceId": "API-TREE-002/reenable",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-002.test.mts"
    },
    {
      "acceptanceId": "API-TREE-002/select-rounded",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-002.test.mts"
    },
    {
      "acceptanceId": "API-TREE-003/no-compute",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-003.test.mts"
    },
    {
      "acceptanceId": "API-TREE-003/repeat-toggle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-003.test.mts"
    },
    {
      "acceptanceId": "API-TREE-003/select-unrounded",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-003.test.mts"
    },
    {
      "acceptanceId": "API-TREE-004/conversion-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-004.test.mts"
    },
    {
      "acceptanceId": "API-TREE-004/default-style",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-004.test.mts"
    },
    {
      "acceptanceId": "API-TREE-004/nondefault-style",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-004.test.mts"
    },
    {
      "acceptanceId": "API-TREE-004/stable-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-004.test.mts"
    },
    {
      "acceptanceId": "API-TREE-005/callback-delivery",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-005.test.mts"
    },
    {
      "acceptanceId": "API-TREE-005/conversion-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-005.test.mts"
    },
    {
      "acceptanceId": "API-TREE-005/identity",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-005.test.mts"
    },
    {
      "acceptanceId": "API-TREE-005/primitive-null-undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-005.test.mts"
    },
    {
      "acceptanceId": "API-TREE-005/removal-cleanup",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-005.test.mts"
    },
    {
      "acceptanceId": "API-TREE-006/attached",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-006.test.mts"
    },
    {
      "acceptanceId": "API-TREE-006/duplicate",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-006.test.mts"
    },
    {
      "acceptanceId": "API-TREE-006/empty",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-006.test.mts"
    },
    {
      "acceptanceId": "API-TREE-006/failure-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-006.test.mts"
    },
    {
      "acceptanceId": "API-TREE-006/invalid-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-006.test.mts"
    },
    {
      "acceptanceId": "API-TREE-006/ordered-children",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-006.test.mts"
    },
    {
      "acceptanceId": "API-TREE-007/empty-tree",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-007.test.mts"
    },
    {
      "acceptanceId": "API-TREE-007/ids-stale",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-007.test.mts"
    },
    {
      "acceptanceId": "API-TREE-007/leaf-tree",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-007.test.mts"
    },
    {
      "acceptanceId": "API-TREE-007/serial-monotonic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-007.test.mts"
    },
    {
      "acceptanceId": "API-TREE-008/id-stale",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-008.test.mts"
    },
    {
      "acceptanceId": "API-TREE-008/invalid-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-008.test.mts"
    },
    {
      "acceptanceId": "API-TREE-008/parent-not-dirtied",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-008.test.mts"
    },
    {
      "acceptanceId": "API-TREE-008/remove-child",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-008.test.mts"
    },
    {
      "acceptanceId": "API-TREE-008/remove-root",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-008.test.mts"
    },
    {
      "acceptanceId": "API-TREE-009/always-dirty",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-009.test.mts"
    },
    {
      "acceptanceId": "API-TREE-009/invalid-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-009.test.mts"
    },
    {
      "acceptanceId": "API-TREE-009/measure-delivery",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-009.test.mts"
    },
    {
      "acceptanceId": "API-TREE-009/null-present",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-009.test.mts"
    },
    {
      "acceptanceId": "API-TREE-009/replace-identity",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-009.test.mts"
    },
    {
      "acceptanceId": "API-TREE-009/undefined-clears",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-009.test.mts"
    },
    {
      "acceptanceId": "API-TREE-010/absence",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-010.test.mts"
    },
    {
      "acceptanceId": "API-TREE-010/generic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/API-TREE-010/generic.test-d.ts"
    },
    {
      "acceptanceId": "API-TREE-010/identity",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-010.test.mts"
    },
    {
      "acceptanceId": "API-TREE-010/invalid-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-010.test.mts"
    },
    {
      "acceptanceId": "API-TREE-010/manual-dirty",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-010.test.mts"
    },
    {
      "acceptanceId": "API-TREE-011/append",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-011.test.mts"
    },
    {
      "acceptanceId": "API-TREE-011/dirty",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-011.test.mts"
    },
    {
      "acceptanceId": "API-TREE-011/failure-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-011.test.mts"
    },
    {
      "acceptanceId": "API-TREE-011/id-roles",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-011.test.mts"
    },
    {
      "acceptanceId": "API-TREE-011/topology-reject",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-011.test.mts"
    },
    {
      "acceptanceId": "API-TREE-012/end-bound",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-012.test.mts"
    },
    {
      "acceptanceId": "API-TREE-012/failure-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-012.test.mts"
    },
    {
      "acceptanceId": "API-TREE-012/id-roles",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-012.test.mts"
    },
    {
      "acceptanceId": "API-TREE-012/index-errors",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-012.test.mts"
    },
    {
      "acceptanceId": "API-TREE-012/positions",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-012.test.mts"
    },
    {
      "acceptanceId": "API-TREE-013/detach-omitted",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-013.test.mts"
    },
    {
      "acceptanceId": "API-TREE-013/dirty",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-013.test.mts"
    },
    {
      "acceptanceId": "API-TREE-013/failure-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-013.test.mts"
    },
    {
      "acceptanceId": "API-TREE-013/invalid-middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-013.test.mts"
    },
    {
      "acceptanceId": "API-TREE-013/reparent",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-013.test.mts"
    },
    {
      "acceptanceId": "API-TREE-013/replace-order",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-013.test.mts"
    },
    {
      "acceptanceId": "API-TREE-013/topology-reject",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-013.test.mts"
    },
    {
      "acceptanceId": "API-TREE-014/detach",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-014.test.mts"
    },
    {
      "acceptanceId": "API-TREE-014/dirty",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-014.test.mts"
    },
    {
      "acceptanceId": "API-TREE-014/failure-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-014.test.mts"
    },
    {
      "acceptanceId": "API-TREE-014/id-roles",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-014.test.mts"
    },
    {
      "acceptanceId": "API-TREE-014/nonchild",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-014.test.mts"
    },
    {
      "acceptanceId": "API-TREE-015/bounds",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-015.test.mts"
    },
    {
      "acceptanceId": "API-TREE-015/failure-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-015.test.mts"
    },
    {
      "acceptanceId": "API-TREE-015/integer",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-015.test.mts"
    },
    {
      "acceptanceId": "API-TREE-015/positions",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-015.test.mts"
    },
    {
      "acceptanceId": "API-TREE-015/returned-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-015.test.mts"
    },
    {
      "acceptanceId": "API-TREE-016/detached-live",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-016.test.mts"
    },
    {
      "acceptanceId": "API-TREE-016/extra-properties",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-016.test.mts"
    },
    {
      "acceptanceId": "API-TREE-016/failure-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-016.test.mts"
    },
    {
      "acceptanceId": "API-TREE-016/range-errors",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-016.test.mts"
    },
    {
      "acceptanceId": "API-TREE-016/ranges",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-016.test.mts"
    },
    {
      "acceptanceId": "API-TREE-017/dirty",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-017.test.mts"
    },
    {
      "acceptanceId": "API-TREE-017/failure-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-017.test.mts"
    },
    {
      "acceptanceId": "API-TREE-017/id-roles",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-017.test.mts"
    },
    {
      "acceptanceId": "API-TREE-017/reject",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-017.test.mts"
    },
    {
      "acceptanceId": "API-TREE-017/replace",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-017.test.mts"
    },
    {
      "acceptanceId": "API-TREE-017/returned-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-017.test.mts"
    },
    {
      "acceptanceId": "API-TREE-017/same-noop",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-017.test.mts"
    },
    {
      "acceptanceId": "API-TREE-018/bounds",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-018.test.mts"
    },
    {
      "acceptanceId": "API-TREE-018/declaration",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/API-TREE-018/declaration.test-d.ts"
    },
    {
      "acceptanceId": "API-TREE-018/integer",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-018.test.mts"
    },
    {
      "acceptanceId": "API-TREE-018/invalid-parent",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-018.test.mts"
    },
    {
      "acceptanceId": "API-TREE-018/positions",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-018.test.mts"
    },
    {
      "acceptanceId": "API-TREE-019/empty",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-019.test.mts"
    },
    {
      "acceptanceId": "API-TREE-019/invalid-parent",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-019.test.mts"
    },
    {
      "acceptanceId": "API-TREE-019/number-result",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-019.test.mts"
    },
    {
      "acceptanceId": "API-TREE-019/topology-sequence",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-019.test.mts"
    },
    {
      "acceptanceId": "API-TREE-020/initial",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-020.test.mts"
    },
    {
      "acceptanceId": "API-TREE-020/leaf-clear",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-020.test.mts"
    },
    {
      "acceptanceId": "API-TREE-020/number-result",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-020.test.mts"
    },
    {
      "acceptanceId": "API-TREE-021/attached",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-021.test.mts"
    },
    {
      "acceptanceId": "API-TREE-021/declaration",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/API-TREE-021/declaration.test-d.ts"
    },
    {
      "acceptanceId": "API-TREE-021/invalid-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-021.test.mts"
    },
    {
      "acceptanceId": "API-TREE-021/root-null",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-021.test.mts"
    },
    {
      "acceptanceId": "API-TREE-021/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-021.test.mts"
    },
    {
      "acceptanceId": "API-TREE-021/transitions",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-021.test.mts"
    },
    {
      "acceptanceId": "API-TREE-022/detached-array",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-022.test.mts"
    },
    {
      "acceptanceId": "API-TREE-022/empty",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-022.test.mts"
    },
    {
      "acceptanceId": "API-TREE-022/invalid-parent",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-022.test.mts"
    },
    {
      "acceptanceId": "API-TREE-022/ordered",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-022.test.mts"
    },
    {
      "acceptanceId": "API-TREE-022/readonly",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/API-TREE-022/readonly.test-d.ts"
    },
    {
      "acceptanceId": "API-TREE-022/stable-ids",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-022.test.mts"
    },
    {
      "acceptanceId": "API-TREE-023/complete-replace",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-023.test.mts"
    },
    {
      "acceptanceId": "API-TREE-023/conversion-families",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-023.test.mts"
    },
    {
      "acceptanceId": "API-TREE-023/dirty",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-023.test.mts"
    },
    {
      "acceptanceId": "API-TREE-023/failure-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-023.test.mts"
    },
    {
      "acceptanceId": "API-TREE-023/invalid-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-023.test.mts"
    },
    {
      "acceptanceId": "API-TREE-023/undefined-null",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-023.test.mts"
    },
    {
      "acceptanceId": "API-TREE-023/unknown-calc",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-023.test.mts"
    },
    {
      "acceptanceId": "API-TREE-024/deep-detached",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-024.test.mts"
    },
    {
      "acceptanceId": "API-TREE-024/exact-keys",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-024.test.mts"
    },
    {
      "acceptanceId": "API-TREE-024/independent-snapshots",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-024.test.mts"
    },
    {
      "acceptanceId": "API-TREE-024/invalid-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-024.test.mts"
    },
    {
      "acceptanceId": "API-TREE-024/null-output",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-024.test.mts"
    },
    {
      "acceptanceId": "API-TREE-024/readonly",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/API-TREE-024/readonly.test-d.ts"
    },
    {
      "acceptanceId": "API-TREE-024/reusable-input",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/API-TREE-024/reusable-input.test-d.ts"
    },
    {
      "acceptanceId": "API-TREE-024/stored-f32",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-024.test.mts"
    },
    {
      "acceptanceId": "API-TREE-025/detached",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-025.test.mts"
    },
    {
      "acceptanceId": "API-TREE-025/exact-zero",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-025.test.mts"
    },
    {
      "acceptanceId": "API-TREE-025/invalid-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-025.test.mts"
    },
    {
      "acceptanceId": "API-TREE-025/numeric-widening",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-025.test.mts"
    },
    {
      "acceptanceId": "API-TREE-025/readonly",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/API-TREE-025/readonly.test-d.ts"
    },
    {
      "acceptanceId": "API-TREE-025/rounding-selection",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-025.test.mts"
    },
    {
      "acceptanceId": "API-TREE-025/stale-stored",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-025.test.mts"
    },
    {
      "acceptanceId": "API-TREE-026/detached",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-026.test.mts"
    },
    {
      "acceptanceId": "API-TREE-026/exact-zero",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-026.test.mts"
    },
    {
      "acceptanceId": "API-TREE-026/fractional",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-026.test.mts"
    },
    {
      "acceptanceId": "API-TREE-026/invalid-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-026.test.mts"
    },
    {
      "acceptanceId": "API-TREE-026/readonly",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/API-TREE-026/readonly.test-d.ts"
    },
    {
      "acceptanceId": "API-TREE-026/stale-stored",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-026.test.mts"
    },
    {
      "acceptanceId": "API-TREE-027/deep-detached",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-027.test.mts"
    },
    {
      "acceptanceId": "API-TREE-027/empty-grid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-027.test.mts"
    },
    {
      "acceptanceId": "API-TREE-027/grid-payload",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-027.test.mts"
    },
    {
      "acceptanceId": "API-TREE-027/invalid-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-027.test.mts"
    },
    {
      "acceptanceId": "API-TREE-027/narrowing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/API-TREE-027/narrowing.test-d.ts"
    },
    {
      "acceptanceId": "API-TREE-027/new-none",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-027.test.mts"
    },
    {
      "acceptanceId": "API-TREE-027/stale-upstream",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-027.test.mts"
    },
    {
      "acceptanceId": "API-TREE-028/any-node",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-028.test.mts"
    },
    {
      "acceptanceId": "API-TREE-028/child-nuance",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-028.test.mts"
    },
    {
      "acceptanceId": "API-TREE-028/idempotent",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-028.test.mts"
    },
    {
      "acceptanceId": "API-TREE-028/invalid-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-028.test.mts"
    },
    {
      "acceptanceId": "API-TREE-028/layout-retained",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-028.test.mts"
    },
    {
      "acceptanceId": "API-TREE-028/propagation",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-028.test.mts"
    },
    {
      "acceptanceId": "API-TREE-029/child-nuance",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-029.test.mts"
    },
    {
      "acceptanceId": "API-TREE-029/context",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-029.test.mts"
    },
    {
      "acceptanceId": "API-TREE-029/explicit",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-029.test.mts"
    },
    {
      "acceptanceId": "API-TREE-029/invalid-id",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-029.test.mts"
    },
    {
      "acceptanceId": "API-TREE-029/lifecycle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-029.test.mts"
    },
    {
      "acceptanceId": "API-TREE-029/style",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-029.test.mts"
    },
    {
      "acceptanceId": "API-TREE-029/topology",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-029.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/cache-calls",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/callback-args",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/context-identity",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/different-tree",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/js-only-reentry",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/layout-nontransactional",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/malformed-result",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/recovery",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/result-f32",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/same-tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/throw-identity",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-030/zero-drain",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-030.test.mts"
    },
    {
      "acceptanceId": "API-TREE-031/algorithms",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-031.test.mts"
    },
    {
      "acceptanceId": "API-TREE-031/cache",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-031.test.mts"
    },
    {
      "acceptanceId": "API-TREE-031/invalid-root",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-031.test.mts"
    },
    {
      "acceptanceId": "API-TREE-031/invalid-space",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-031.test.mts"
    },
    {
      "acceptanceId": "API-TREE-031/no-measure",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-031.test.mts"
    },
    {
      "acceptanceId": "API-TREE-031/percentage-content",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-031.test.mts"
    },
    {
      "acceptanceId": "API-TREE-031/rounding",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-031.test.mts"
    },
    {
      "acceptanceId": "API-TREE-031/stored-output",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-031.test.mts"
    },
    {
      "acceptanceId": "API-TREE-031/wrapper-atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/api/API-TREE-031.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-002/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-003/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-004/argument-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-004/discrete-value",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-004/node-id-serial-exhaustion",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:wrapper",
      "path": "packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-004/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-005/argument-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-005/discrete-value",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-005/node-id-serial-exhaustion",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:wrapper",
      "path": "packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-005/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-006/argument-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-006/discrete-value",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-006/invalid-topology",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-006/node-id-serial-exhaustion",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:wrapper",
      "path": "packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-006/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-007/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-008/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-009/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-011/invalid-topology",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-011/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-012/argument-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-012/child-index-out-of-bounds",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-012/discrete-value",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-012/invalid-topology",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-012/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-013/argument-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-013/invalid-topology",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-013/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-014/invalid-topology",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-014/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-015/argument-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-015/child-index-out-of-bounds",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-015/discrete-value",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-015/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-016/argument-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-016/discrete-value",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-016/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-017/argument-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-017/child-index-out-of-bounds",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-017/discrete-value",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-017/invalid-topology",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-017/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-023/argument-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-023/discrete-value",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-023/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-028/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-030/argument-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-030/callback-throw",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-030/discrete-value",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-030/measure-result-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-030/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-031/argument-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-031/discrete-value",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "ATOMICITY/API-TREE-031/tree-busy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "INFRA-001/collection-drift",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:contract:self-test",
      "path": "tools/taffy-api/tests/INFRA-001.test.mts"
    },
    {
      "acceptanceId": "INFRA-001/generate",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:contract:self-test",
      "path": "tools/taffy-api/tests/INFRA-001.test.mts"
    },
    {
      "acceptanceId": "INFRA-001/incremental-all",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:contract:self-test",
      "path": "tools/taffy-api/tests/INFRA-001.test.mts"
    },
    {
      "acceptanceId": "INFRA-001/pin-drift",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:contract:self-test",
      "path": "tools/taffy-api/tests/INFRA-001.test.mts"
    },
    {
      "acceptanceId": "INFRA-001/source-drift",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:contract:self-test",
      "path": "tools/taffy-api/tests/INFRA-001.test.mts"
    },
    {
      "acceptanceId": "INFRA-001/task-drift",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:contract:self-test",
      "path": "tools/taffy-api/tests/INFRA-001.test.mts"
    },
    {
      "acceptanceId": "INFRA-002/foundation-exports",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/package/INFRA-002.test.mts"
    },
    {
      "acceptanceId": "INFRA-002/pack-entry",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/package/INFRA-002.test.mts"
    },
    {
      "acceptanceId": "INFRA-002/private-native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/package/INFRA-002.test.mts"
    },
    {
      "acceptanceId": "INFRA-002/source-entry",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/package/INFRA-002.test.mts"
    },
    {
      "acceptanceId": "INFRA-003/codes",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/INFRA-003.test.mts"
    },
    {
      "acceptanceId": "INFRA-003/frozen",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/INFRA-003.test.mts"
    },
    {
      "acceptanceId": "INFRA-003/generate-check",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/INFRA-003.test.mts"
    },
    {
      "acceptanceId": "INFRA-003/invalid-code",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/INFRA-003.test.mts"
    },
    {
      "acceptanceId": "INFRA-003/narrowing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/INFRA-003/narrowing.test-d.ts"
    },
    {
      "acceptanceId": "INFRA-003/raw-literal",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/INFRA-003.test.mts"
    },
    {
      "acceptanceId": "INFRA-004/busy-unit",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/INFRA-004.test.mts"
    },
    {
      "acceptanceId": "INFRA-004/expected-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/INFRA-004.test.mts"
    },
    {
      "acceptanceId": "INFRA-004/owner-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "cargo test -p taffyjs_binding --lib",
      "path": "crates/taffyjs_binding/src/contract_tests.rs"
    },
    {
      "acceptanceId": "INFRA-004/panic-poisons",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/INFRA-004.test.mts"
    },
    {
      "acceptanceId": "INFRA-004/process-survives",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/INFRA-004.test.mts"
    },
    {
      "acceptanceId": "INFRA-004/taxonomy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/INFRA-004.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/foreign/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/foreign/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/foreign/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/malformed/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/malformed/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/malformed/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/slot-reuse/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/slot-reuse/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/slot-reuse/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/stale-cleared/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/stale-cleared/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/stale-cleared/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/stale-removed/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/stale-removed/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/stale-removed/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/wrong-type/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/wrong-type/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-006/children-element/wrong-type/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-008/node/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-008/node/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-008/node/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-008/node/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-008/node/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-008/node/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-008/node/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-009/node/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-009/node/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-009/node/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-009/node/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-009/node/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-009/node/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-009/node/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-010/node/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-010/node/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-010/node/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-010/node/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-010/node/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-010/node/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-010/node/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/child/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/child/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/child/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/child/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/child/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/child/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/child/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/parent/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/parent/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/parent/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/parent/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/parent/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/parent/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-011/parent/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/child/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/child/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/child/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/child/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/child/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/child/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/child/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/parent/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/parent/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/parent/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/parent/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/parent/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/parent/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-012/parent/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/foreign/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/foreign/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/foreign/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/malformed/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/malformed/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/malformed/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/slot-reuse/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/slot-reuse/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/slot-reuse/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/stale-cleared/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/stale-cleared/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/stale-cleared/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/stale-removed/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/stale-removed/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/stale-removed/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/wrong-type/first",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/wrong-type/last",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/children-element/wrong-type/middle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/parent/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/parent/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/parent/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/parent/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/parent/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/parent/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-013/parent/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/child/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/child/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/child/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/child/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/child/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/child/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/child/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/parent/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/parent/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/parent/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/parent/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/parent/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/parent/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-014/parent/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-015/parent/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-015/parent/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-015/parent/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-015/parent/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-015/parent/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-015/parent/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-015/parent/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-016/parent/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-016/parent/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-016/parent/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-016/parent/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-016/parent/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-016/parent/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-016/parent/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/new-child/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/new-child/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/new-child/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/new-child/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/new-child/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/new-child/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/new-child/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/parent/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/parent/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/parent/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/parent/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/parent/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/parent/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-017/parent/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-018/parent/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-018/parent/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-018/parent/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-018/parent/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-018/parent/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-018/parent/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-018/parent/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-019/parent/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-019/parent/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-019/parent/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-019/parent/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-019/parent/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-019/parent/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-019/parent/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-021/node/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-021/node/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-021/node/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-021/node/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-021/node/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-021/node/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-021/node/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-022/parent/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-022/parent/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-022/parent/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-022/parent/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-022/parent/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-022/parent/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-022/parent/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-023/node/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-023/node/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-023/node/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-023/node/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-023/node/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-023/node/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-023/node/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-024/node/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-024/node/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-024/node/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-024/node/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-024/node/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-024/node/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-024/node/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-025/node/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-025/node/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-025/node/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-025/node/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-025/node/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-025/node/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-025/node/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-026/node/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-026/node/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-026/node/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-026/node/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-026/node/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-026/node/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-026/node/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-027/node/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-027/node/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-027/node/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-027/node/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-027/node/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-027/node/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-027/node/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-028/node/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-028/node/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-028/node/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-028/node/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-028/node/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-028/node/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-028/node/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-029/node/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-029/node/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-029/node/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-029/node/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-029/node/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-029/node/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-029/node/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-030/root/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-030/root/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-030/root/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-030/root/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-030/root/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-030/root/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-030/root/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-031/root/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-031/root/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-031/root/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-031/root/stale-cleared",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-031/root/stale-removed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-031/root/valid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "NODEID/API-TREE-031/root/wrong-type",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "STYLE-F01/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F01/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F01/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F01/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F01/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F01/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F01/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F01/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F02/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F02/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F02/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F02/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F02/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F02/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F02/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F02/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F03/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F03/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F03/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F03/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F03/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F03/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F03/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F03/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F04/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F04/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F04/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F04/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F04/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F04/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F04/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F04/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F05/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F05/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F05/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F05/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F05/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F05/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F05/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F05/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F06/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F06/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F06/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F06/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F06/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F06/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F06/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F06/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F07/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F07/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F07/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F07/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F07/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F07/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F07/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F07/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F08/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F08/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F08/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F08/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F08/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F08/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F08/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F08/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F09/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F09/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F09/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F09/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F09/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F09/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F09/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F09/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F10/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F10/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F10/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F10/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F10/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F10/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F10/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F10/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F11/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F11/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F11/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F11/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F11/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F11/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F11/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F11/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F12/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F12/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F12/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F12/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F12/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F12/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F12/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F12/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F13/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F13/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F13/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F13/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F13/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F13/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F13/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F13/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F14/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F14/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F14/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F14/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F14/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F14/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F14/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F14/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F15/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F15/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F15/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F15/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F15/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F15/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F15/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F15/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F16/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F16/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F16/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F16/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F16/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F16/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F16/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F16/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F17/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F17/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F17/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F17/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F17/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F17/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F17/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F17/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F18/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F18/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F18/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F18/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F18/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F18/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F18/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F18/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F19/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F19/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F19/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F19/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F19/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F19/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F19/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F19/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F20/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F20/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F20/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F20/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F20/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F20/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F20/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F20/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F21/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F21/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F21/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F21/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F21/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F21/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F21/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F21/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F22/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F22/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F22/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F22/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F22/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F22/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F22/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F22/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F23/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F23/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F23/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F23/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F23/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F23/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F23/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F23/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F24/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F24/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F24/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F24/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F24/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F24/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F24/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F24/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F25/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F25/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F25/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F25/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F25/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F25/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F25/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F25/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F26/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F26/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F26/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F26/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F26/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F26/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F26/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F26/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F27/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F27/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F27/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F27/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F27/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F27/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F27/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F27/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F28/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F28/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F28/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F28/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F28/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F28/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F28/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F28/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F29/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F29/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F29/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F29/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F29/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F29/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F29/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F29/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F30/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F30/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F30/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F30/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F30/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F30/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F30/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F30/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F31/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F31/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F31/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F31/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F31/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F31/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F31/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F31/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F32/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F32/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F32/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F32/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F32/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F32/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F32/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F32/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F33/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F33/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F33/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F33/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F33/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F33/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F33/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F33/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F34/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F34/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F34/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F34/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F34/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F34/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F34/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F34/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F35/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F35/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F35/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F35/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F35/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F35/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F35/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F35/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F36/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F36/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F36/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F36/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F36/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F36/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F36/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F36/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F37/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F37/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F37/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F37/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F37/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F37/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F37/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F37/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F38/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F38/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F38/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F38/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F38/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F38/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F38/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F38/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F39/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F39/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F39/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F39/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F39/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F39/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F39/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F39/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F40/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F40/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F40/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F40/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F40/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F40/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F40/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F40/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F41/atomic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F41/default",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F41/invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F41/missing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F41/native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F41/roundtrip",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F41/semantic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "STYLE-F41/undefined",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "TEST-ALGORITHMS-001/block-float",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-ALGORITHMS-001.test.mts"
    },
    {
      "acceptanceId": "TEST-ALGORITHMS-001/flex",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-ALGORITHMS-001.test.mts"
    },
    {
      "acceptanceId": "TEST-ALGORITHMS-001/grid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-ALGORITHMS-001.test.mts"
    },
    {
      "acceptanceId": "TEST-ALGORITHMS-001/measure-context",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-ALGORITHMS-001.test.mts"
    },
    {
      "acceptanceId": "TEST-ALGORITHMS-001/public-only",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-ALGORITHMS-001.test.mts"
    },
    {
      "acceptanceId": "TEST-ALGORITHMS-001/topology-cache",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-ALGORITHMS-001.test.mts"
    },
    {
      "acceptanceId": "TEST-COMMON-ATOMICITY/callback-exception",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "TEST-COMMON-ATOMICITY/mutation-bijection",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "TEST-COMMON-ATOMICITY/state-equality",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts"
    },
    {
      "acceptanceId": "TEST-COMMON-NODEID/controlled-errors",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "TEST-COMMON-NODEID/no-panic",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "TEST-COMMON-NODEID/role-bijection",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts"
    },
    {
      "acceptanceId": "TEST-STYLE-001/bijection",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "TEST-STYLE-001/callback-equivalence",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "TEST-STYLE-001/enum-members",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "TEST-STYLE-001/no-freeze-cache",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "TEST-TYPES-001/context-nullish",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TEST-TYPES-001/context-nullish.test-d.ts"
    },
    {
      "acceptanceId": "TEST-TYPES-001/exports-signatures",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TEST-TYPES-001/exports-signatures.test-d.ts"
    },
    {
      "acceptanceId": "TEST-TYPES-001/mutability",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TEST-TYPES-001/mutability.test-d.ts"
    },
    {
      "acceptanceId": "TEST-TYPES-001/node-enum",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TEST-TYPES-001/node-enum.test-d.ts"
    },
    {
      "acceptanceId": "TEST-TYPES-001/private-absent",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TEST-TYPES-001/private-absent.test-d.ts"
    },
    {
      "acceptanceId": "TEST-TYPES-001/valid-invalid",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TEST-TYPES-001/valid-invalid.test-d.ts"
    },
    {
      "acceptanceId": "TYPE-AVAILABLE-001/axis-record",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-AVAILABLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-AVAILABLE-001/content-extra",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-AVAILABLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-AVAILABLE-001/definite-value",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-AVAILABLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-AVAILABLE-001/f32-special",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-AVAILABLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-AVAILABLE-001/helper-conversion",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-AVAILABLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-AVAILABLE-001/helper-materialization",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-AVAILABLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-AVAILABLE-001/narrowing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TYPE-AVAILABLE-001/narrowing.test-d.ts"
    },
    {
      "acceptanceId": "TYPE-AVAILABLE-001/readonly-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TYPE-AVAILABLE-001/readonly-reuse.test-d.ts"
    },
    {
      "acceptanceId": "TYPE-AVAILABLE-001/variants",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-AVAILABLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-AVAILABLE-001/whole-value-errors",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-AVAILABLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-DETAIL-001/detached",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-DETAIL-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-DETAIL-001/lifecycle",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-DETAIL-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-DETAIL-001/narrowing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TYPE-DETAIL-001/narrowing.test-d.ts"
    },
    {
      "acceptanceId": "TYPE-DETAIL-001/numeric-widening",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-DETAIL-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-DETAIL-001/variants",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-DETAIL-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GEOMETRY-001/components",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GEOMETRY-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GEOMETRY-001/declarations",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TYPE-GEOMETRY-001/declarations.test-d.ts"
    },
    {
      "acceptanceId": "TYPE-GEOMETRY-001/detached-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GEOMETRY-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GEOMETRY-001/readonly",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TYPE-GEOMETRY-001/readonly.test-d.ts"
    },
    {
      "acceptanceId": "TYPE-GEOMETRY-001/scalar-scope",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GEOMETRY-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GEOMETRY-001/style-partial",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GEOMETRY-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GEOMETRY-001/style-shape-errors",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GEOMETRY-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/areas-null",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/canonical",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/extra-fields",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/families",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/helper-conversion",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/helper-materialization",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/integers",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/minmax",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/no-css-validation",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/ownership",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/panic-guard",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/repeat-lines",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-GRID-001/strings",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-GRID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LAYOUT-001/detached",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-LAYOUT-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LAYOUT-001/exact-keys",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-LAYOUT-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LAYOUT-001/f32-special",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-LAYOUT-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LAYOUT-001/order-u32",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-LAYOUT-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LAYOUT-001/readonly",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TYPE-LAYOUT-001/readonly.test-d.ts"
    },
    {
      "acceptanceId": "TYPE-LAYOUT-001/shared-converter",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-LAYOUT-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LAYOUT-001/zero",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-LAYOUT-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LENGTH-001/aggregate",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-LENGTH-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LENGTH-001/auto-extra",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-LENGTH-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LENGTH-001/canonical",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-LENGTH-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LENGTH-001/f32-special",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-LENGTH-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LENGTH-001/forms",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-LENGTH-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LENGTH-001/helper-conversion",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-LENGTH-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LENGTH-001/helper-materialization",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-LENGTH-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LENGTH-001/invalid-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-LENGTH-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-LENGTH-001/narrowing",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TYPE-LENGTH-001/narrowing.test-d.ts"
    },
    {
      "acceptanceId": "TYPE-LENGTH-001/percent-scale",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-LENGTH-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-MEASURE-001/args-owned",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-MEASURE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-MEASURE-001/env-lifetime",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-MEASURE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-MEASURE-001/failure-state",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-MEASURE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-MEASURE-001/no-retention",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-MEASURE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-MEASURE-001/non-send",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "cargo test -p taffyjs_binding --lib",
      "path": "crates/taffyjs_binding/src/contract_tests.rs"
    },
    {
      "acceptanceId": "TYPE-MEASURE-001/result-sync",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-MEASURE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-NODEID-001/foreign",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-NODEID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-NODEID-001/js-identity",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-NODEID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-NODEID-001/malformed",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-NODEID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-NODEID-001/opaque",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:types",
      "path": "tests/taffyjs-node/tests/types/TYPE-NODEID-001/opaque.test-d.ts"
    },
    {
      "acceptanceId": "TYPE-NODEID-001/realm-copy",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-NODEID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-NODEID-001/rng",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:wrapper",
      "path": "packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts"
    },
    {
      "acceptanceId": "TYPE-NODEID-001/serial-boundary",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:wrapper",
      "path": "packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts"
    },
    {
      "acceptanceId": "TYPE-NODEID-001/slot-reuse",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-NODEID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-NODEID-001/stale-clear",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:integration",
      "path": "tests/taffyjs-node/tests/contract/TYPE-NODEID-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-NUMBER-001/f32-special",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-NUMBER-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-NUMBER-001/f32-truth",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-NUMBER-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-NUMBER-001/integer-bounds",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-NUMBER-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-NUMBER-001/no-coercion",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-NUMBER-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-NUMBER-001/number-only",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-NUMBER-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-STYLE-001/complete-before-native",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-STYLE-001/container-shape",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-STYLE-001/default-dispatch",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-STYLE-001/eager-output",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-STYLE-001/field-set",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-STYLE-001/nullable-dispatch",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-STYLE-001.test.mts"
    },
    {
      "acceptanceId": "TYPE-STYLE-001/unknown-calc",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "result": "pass",
      "runner": "vp run check:test:native",
      "path": "packages/taffyjs-node/tests/native/TYPE-STYLE-001.test.mts"
    }
  ],
  "commandEvidence": {},
  "finalOutputs": {},
  "reviewRoundId": "M3-round-5-f1f79e3",
  "reviewerSlots": ["broad-1", "broad-2", "quality"],
  "reviewedCommits": {
    "contractBaseCommit": "d1966aac42d90a11fa477598de5fd24838c1a9e7",
    "previousCommit": "a51e27ee8c757fc8a45110f17c837080e9873d2d",
    "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
  },
  "inspectionCommands": [
    "git cat-file -e f1f79e32dbde7a5546c3231471e6fdd4a70770e7^{commit}",
    "git diff --check 98db236db4969c60fb096e1f2cb71c2c8097ea96 f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
    "git diff --stat 98db236db4969c60fb096e1f2cb71c2c8097ea96 f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
    "git diff --find-renames 98db236db4969c60fb096e1f2cb71c2c8097ea96 f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
    "git diff --check a51e27ee8c757fc8a45110f17c837080e9873d2d f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
    "git diff --stat a51e27ee8c757fc8a45110f17c837080e9873d2d f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
    "git diff --find-renames a51e27ee8c757fc8a45110f17c837080e9873d2d f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
    "git diff --check d1966aac42d90a11fa477598de5fd24838c1a9e7 f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:.agents/docs/loop-goal.md",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:.agents/docs/binding-mapping.md",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tools/taffy-api/contract.json",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tools/taffy-api/src/index.mjs",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tools/taffy-api/src/index.d.mts",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tools/taffy-api/src/run-type-tests.mjs",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tools/taffy-api/tests/INFRA-001.test.mts",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tests/taffyjs-node/tests/contract/TEST-ALGORITHMS-001.test.mts",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tests/taffyjs-node/tests/contract/fixtures/complete-public-state.mts",
    "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts",
    "git ls-tree -r --name-only f1f79e32dbde7a5546c3231471e6fdd4a70770e7 tests/taffyjs-node/tests/types/TEST-TYPES-001"
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
    "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
    "previousAcceptedMilestoneCommit": "a51e27ee8c757fc8a45110f17c837080e9873d2d",
    "activeMilestone": "M3",
    "reviewRoundId": "M3-round-5-f1f79e3",
    "currentTaskIds": [
      "TEST-STYLE-001",
      "TEST-COMMON-NODEID",
      "TEST-COMMON-ATOMICITY",
      "TEST-TYPES-001",
      "TEST-ALGORITHMS-001"
    ],
    "reviewerSlots": ["broad-1", "broad-2", "quality"],
    "inspectionCommands": [
      "git cat-file -e f1f79e32dbde7a5546c3231471e6fdd4a70770e7^{commit}",
      "git diff --check 98db236db4969c60fb096e1f2cb71c2c8097ea96 f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
      "git diff --stat 98db236db4969c60fb096e1f2cb71c2c8097ea96 f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
      "git diff --find-renames 98db236db4969c60fb096e1f2cb71c2c8097ea96 f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
      "git diff --check a51e27ee8c757fc8a45110f17c837080e9873d2d f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
      "git diff --stat a51e27ee8c757fc8a45110f17c837080e9873d2d f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
      "git diff --find-renames a51e27ee8c757fc8a45110f17c837080e9873d2d f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
      "git diff --check d1966aac42d90a11fa477598de5fd24838c1a9e7 f1f79e32dbde7a5546c3231471e6fdd4a70770e7 -- . \":(exclude).agents/docs/loop-status.md\"",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:.agents/docs/loop-goal.md",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:.agents/docs/binding-mapping.md",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tools/taffy-api/contract.json",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tools/taffy-api/src/index.mjs",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tools/taffy-api/src/index.d.mts",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tools/taffy-api/src/run-type-tests.mjs",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tools/taffy-api/tests/INFRA-001.test.mts",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tests/taffyjs-node/tests/style/TEST-STYLE-001.test.mts",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tests/taffyjs-node/tests/contract/TEST-COMMON-NODEID.test.mts",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tests/taffyjs-node/tests/contract/TEST-COMMON-ATOMICITY.test.mts",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tests/taffyjs-node/tests/contract/TEST-ALGORITHMS-001.test.mts",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:tests/taffyjs-node/tests/contract/fixtures/complete-public-state.mts",
      "git show f1f79e32dbde7a5546c3231471e6fdd4a70770e7:packages/taffyjs-node/tests/wrapper/private-boundaries.test.mts",
      "git ls-tree -r --name-only f1f79e32dbde7a5546c3231471e6fdd4a70770e7 tests/taffyjs-node/tests/types/TEST-TYPES-001"
    ]
  },
  "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912",
  "reports": [
    {
      "slot": "broad-1",
      "reviewerIdentity": "/root/m3_broad_1",
      "startCandidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "endCandidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "startReviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912",
      "endReviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912",
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
        "The complete accepted-M2-to-candidate M3 diff and the final repair diff, including endpoint and whitespace checks.",
        "The frozen contract, mapping, checker, type runner, all five M3 evidence surfaces, declaration fixtures, full-state fixture, and private wrapper boundaries.",
        "All 17 earlier tasks affected by the shared checker and type runner."
      ]
    },
    {
      "slot": "broad-2",
      "reviewerIdentity": "/root/m3_broad_2",
      "startCandidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "endCandidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "startReviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912",
      "endReviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912",
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
        "The complete accepted-M2-to-candidate M3 diff and the final repair diff, including endpoint and whitespace checks.",
        "The frozen contract, mapping, checker, declaration projection, all five M3 evidence surfaces, full-state fixture, private wrapper boundaries, and all six type fixtures.",
        "All 17 earlier tasks affected by the shared checker and type runner."
      ]
    },
    {
      "slot": "quality",
      "reviewerIdentity": "/root/m3_quality",
      "startCandidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "endCandidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "startReviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912",
      "endReviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912",
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
        "The complete accepted-M2-to-candidate M3 diff and the final repair diff, including endpoint and whitespace checks.",
        "The frozen contract, mapping, checker, type runner and self-tests, all five M3 evidence surfaces, complete state fixture, wrapper tests, and type fixtures.",
        "All 17 earlier tasks affected by the shared checker and type runner, with focused checks for ownership, duplication, and exact error behavior."
      ]
    }
  ],
  "verdicts": [
    {
      "taskId": "TEST-STYLE-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-COMMON-NODEID",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-COMMON-ATOMICITY",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-TYPES-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-ALGORITHMS-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "INFRA-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "INFRA-003",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-GEOMETRY-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-LENGTH-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-AVAILABLE-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-NODEID-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-LAYOUT-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-DETAIL-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-001",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-010",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-018",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-021",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-022",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-024",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-025",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-026",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-027",
      "slot": "broad-1",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-STYLE-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-COMMON-NODEID",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-COMMON-ATOMICITY",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-TYPES-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-ALGORITHMS-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "INFRA-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "INFRA-003",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-GEOMETRY-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-LENGTH-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-AVAILABLE-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-NODEID-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-LAYOUT-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-DETAIL-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-001",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-010",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-018",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-021",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-022",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-024",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-025",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-026",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-027",
      "slot": "broad-2",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-STYLE-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-COMMON-NODEID",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-COMMON-ATOMICITY",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-TYPES-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TEST-ALGORITHMS-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "INFRA-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "INFRA-003",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-GEOMETRY-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-LENGTH-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-AVAILABLE-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-NODEID-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-LAYOUT-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "TYPE-DETAIL-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-001",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-010",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-018",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-021",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-022",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-024",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-025",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-026",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    },
    {
      "taskId": "API-TREE-027",
      "slot": "quality",
      "verdict": "PASS",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "reviewInputStatusHash": "4a57c17272181c033e954889795d7e3b3ac6ff84003eda90e3b1b7e577f4c912"
    }
  ],
  "findings": [
    {
      "id": "M3-R1-B1-1",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Style semantic fixtures can stay green when dense placement, Unicode conversion, deep copy, or row and column underflow behavior is wrong.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R1-B1-2",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The declaration fixture does not assert every public runtime helper signature.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R1-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Style semantic fixtures omit Right clearing, observable dense placement, Unicode and surrogate conversion, deep copy, underflow, and integer boundaries.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R1-B2-2",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Callback-failure atomicity does not prove that no later measure callback runs after the first failure.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R1-B2-3",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The declaration fixture does not reference the complete public type inventory and excludes a possible phantomMarker value export.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R1-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Style semantic fixtures do not independently distinguish all AlignItems and AlignContent members or dense placement.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R1-Q-2",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The declaration fixture samples helper signatures instead of asserting every public runtime helper signature.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R1-Q-3",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Tree-busy atomicity checks code and message but not the canonical Error class.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R2-B1-2",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Layout parity assertions do not cite a stable pinned Taffy source or use a direct Rust Taffy fixture.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R2-B1-3",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The gridTemplateAreas row does not prove its required u16 boundaries.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R2-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Several Style semantic fixtures omit required Grid, flex-basis, nested-copy, padding, and area-boundary behavior.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R2-B2-2",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Algorithm parity literals lack stable pinned Taffy source locations or direct Rust fixtures.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R2-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Style semantics omit Grid justifyContent and gap behavior plus Percent and Auto flexBasis interactions.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R2-Q-2",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The gridTemplateAreas row does not prove its required u16 boundaries.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R2-Q-3",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The declaration identity references type-only exports without independently checking their exact structures.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R3-B1-1",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The itemIsTable and itemIsReplaced Style rows use indistinguishable samples and semantic layouts, so swapping the two bindings can leave their evidence green.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R3-B1-2",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The algorithm consumer test omits the required mixed create, attach, detach, remove, and getNodeCount sequence.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R3-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The type runner compares declaration bytes including JSDoc, which would reject the additional public JSDoc required by M4.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R3-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Style invalid-value evidence only requires some exception and does not verify the contractually fixed built-in error class and code.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R3-Q-2",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Generated NodeId evidence compares constructor names instead of exact built-in error constructors.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R3-Q-3",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Two atomicity paths use instanceof and therefore allow subclasses where the contract requires exact built-in error constructors.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R4-B1-1",
      "reviewerIdentity": "/root/m3_broad_1",
      "severity": "major",
      "disposition": "fixed",
      "summary": "Nested Grid integer and line-name underflow checks do not require the exact uncoded RangeError taxonomy.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R4-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "severity": "major",
      "disposition": "fixed",
      "summary": "The context-nullish identity does not independently verify the eight canonical nullable Style JSDoc comments.",
      "fixCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7"
    },
    {
      "id": "M3-R4-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "severity": "minor",
      "disposition": "rejected",
      "summary": "The user-authorized input transport performance TODO was initially mistaken for candidate scope drift."
    }
  ],
  "closures": [
    {
      "findingId": "M3-R1-B1-1",
      "reviewerIdentity": "/root/m3_broad_1",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-B1-2",
      "reviewerIdentity": "/root/m3_broad_1",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-B2-2",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-B2-3",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-Q-2",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R1-Q-3",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-B1-2",
      "reviewerIdentity": "/root/m3_broad_1",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-B1-3",
      "reviewerIdentity": "/root/m3_broad_1",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-B2-2",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-Q-2",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R2-Q-3",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R3-B1-1",
      "reviewerIdentity": "/root/m3_broad_1",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R3-B1-2",
      "reviewerIdentity": "/root/m3_broad_1",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R3-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R3-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R3-Q-2",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R3-Q-3",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R4-B1-1",
      "reviewerIdentity": "/root/m3_broad_1",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R4-Q-1",
      "reviewerIdentity": "/root/m3_quality",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
      "confirmed": true
    },
    {
      "findingId": "M3-R4-B2-1",
      "reviewerIdentity": "/root/m3_broad_2",
      "candidateCommit": "f1f79e32dbde7a5546c3231471e6fdd4a70770e7",
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
  "nextAction": "Implement MATURITY-001, MATURITY-002, and MATURITY-003 as one M4 batch, then run the complete final verification before review."
}
```

<!-- loop-status-json:end -->
