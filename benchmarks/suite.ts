import { codingAgentChatScenario } from "./coding-agent-chat/benchmark.ts";
import { deepTreeScenarios } from "./deep-tree/benchmark.ts";
import type {
  BenchmarkComparisonGroup,
  BenchmarkProfile,
  TaffyBenchmarkComparisonGroup,
  YogaBenchmarkComparisonGroup,
} from "./scenario.ts";
import { wideTreeScenarios } from "./wide-tree/benchmark.ts";
import { yogaCodingAgentChatScenario } from "./yoga-coding-agent-chat/benchmark.ts";
import { yogaDeepTreeScenarios } from "./yoga-deep-tree/benchmark.ts";
import { yogaWideTreeScenarios } from "./yoga-wide-tree/benchmark.ts";

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

export const taffyComparisonGroup: TaffyBenchmarkComparisonGroup = {
  id: "taffy-api",
  name: "Taffy API",
  scenarios: [codingAgentChatScenario, ...wideTreeScenarios, ...deepTreeScenarios],
  targets: [
    {
      id: "node",
      label: "Native Node",
      packageName: "@taffyjs/node",
    },
    {
      id: "wasm",
      label: "WASI Wasm",
      packageName: "@taffyjs/wasm",
    },
  ],
};

export const yogaComparisonGroup: YogaBenchmarkComparisonGroup = {
  id: "yoga-api",
  name: "Yoga API",
  scenarios: [yogaCodingAgentChatScenario, ...yogaWideTreeScenarios, ...yogaDeepTreeScenarios],
  targets: [
    {
      id: "taffy-yoga",
      label: "Taffy Yoga",
      packageName: "@taffyjs/yoga",
    },
    {
      id: "yoga-layout",
      label: "Yoga 3.2.1",
      packageName: "yoga-layout",
    },
    {
      id: "taffy-yoga-wasm",
      label: "Taffy Yoga Wasm",
      packageName: "@taffyjs/yoga-wasm",
    },
  ],
};

export const benchmarkComparisonGroups: readonly BenchmarkComparisonGroup[] = [
  taffyComparisonGroup,
  yogaComparisonGroup,
];
