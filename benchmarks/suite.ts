import { coldStartScenario } from "./cold-start/benchmark.ts";
import { dashboardFlexScenario, dashboardGridScenario } from "./dashboard/benchmark.ts";
import { incrementalFrameScenarios } from "./incremental-frame/benchmark.ts";
import { nestingDepthScenarios } from "./nesting-depth/benchmark.ts";
import { measuredRenderScenario, oneShotRenderScenarios } from "./one-shot-render/benchmark.ts";
import type { BenchmarkProfile, BenchmarkScenario, BenchmarkTarget } from "./scenario.ts";

export const benchmarkProfiles: readonly BenchmarkProfile[] = [
  {
    id: "local",
    rounds: 1,
    settings: { time: 500, iterations: 10, warmupTime: 100, warmupIterations: 5 },
    maxRelativeMarginOfError: null,
    maxRoundMedianSpread: null,
  },
  {
    id: "publication",
    rounds: 2,
    settings: { time: 2_500, iterations: 25, warmupTime: 400, warmupIterations: 10 },
    maxRelativeMarginOfError: 10,
    maxRoundMedianSpread: 0.25,
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

export const benchmarkScenarios: readonly BenchmarkScenario[] = [
  ...incrementalFrameScenarios,
  ...oneShotRenderScenarios,
  measuredRenderScenario,
  ...nestingDepthScenarios,
  dashboardGridScenario,
  dashboardFlexScenario,
  coldStartScenario,
];
