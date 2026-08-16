import { codingAgentChatScenario } from "./coding-agent-chat/benchmark.ts";
import { deepTreeScenarios } from "./deep-tree/benchmark.ts";
import type { BenchmarkProfile, TaffyBenchmarkScenario } from "./scenario.ts";
import { wideTreeScenarios } from "./wide-tree/benchmark.ts";

export interface TaffyBenchmarkTarget {
  readonly id: string;
  readonly label: string;
  readonly packageName: string;
}

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
    rounds: 4,
    settings: {
      time: 1_000,
      iterations: 20,
      warmupTime: 250,
      warmupIterations: 10,
    },
    maxRelativeMarginOfError: 5,
    maxRoundMedianSpread: 0.1,
  },
];

export const taffyScenarios: readonly TaffyBenchmarkScenario[] = [
  codingAgentChatScenario,
  ...wideTreeScenarios,
  ...deepTreeScenarios,
];

export const taffyTargets: readonly TaffyBenchmarkTarget[] = [
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
];
