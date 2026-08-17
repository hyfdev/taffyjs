import { codingAgentChatScenarios } from "./coding-agent-chat/benchmark.ts";
import { nestedUiScenarios } from "./nested-ui/benchmark.ts";
import type { BenchmarkProfile, BenchmarkScenario, BenchmarkTarget } from "./scenario.ts";
import { wideWrappingCollectionScenario } from "./wide-wrapping-collection/benchmark.ts";

export const benchmarkProfiles: readonly BenchmarkProfile[] = [
  {
    id: "local",
    rounds: 1,
    settings: {
      time: 500,
      iterations: 10,
      warmupTime: 100,
      warmupIterations: 5,
    },
    maxRelativeMarginOfError: null,
    maxRoundMedianSpread: null,
  },
  {
    id: "publication",
    rounds: 1,
    settings: {
      time: 1_000,
      iterations: 20,
      warmupTime: 250,
      warmupIterations: 10,
    },
    maxRelativeMarginOfError: 30,
    maxRoundMedianSpread: null,
  },
];

export const benchmarkTargets: readonly BenchmarkTarget[] = [
  {
    id: "node",
    packageName: "@taffyjs/node",
    apiKind: "taffy",
    apiLabel: "TaffyTree",
    runtimeLabel: "Native Node-API",
  },
  {
    id: "wasm",
    packageName: "@taffyjs/wasm",
    apiKind: "taffy",
    apiLabel: "TaffyTree",
    runtimeLabel: "WASI Wasm",
  },
  {
    id: "taffy-yoga",
    packageName: "@taffyjs/yoga",
    apiKind: "yoga",
    apiLabel: "Yoga Node",
    runtimeLabel: "Native Taffy",
  },
  {
    id: "taffy-yoga-wasm",
    packageName: "@taffyjs/yoga-wasm",
    apiKind: "yoga",
    apiLabel: "Yoga Node",
    runtimeLabel: "WASI Taffy",
  },
  {
    id: "yoga-layout",
    packageName: "yoga-layout",
    apiKind: "yoga",
    apiLabel: "Yoga Node",
    runtimeLabel: "Yoga Wasm",
  },
];

export const benchmarkBaselineTargetId = "yoga-layout";

export const benchmarkScenarios: readonly BenchmarkScenario[] = [
  ...nestedUiScenarios,
  wideWrappingCollectionScenario,
  ...codingAgentChatScenarios,
];
