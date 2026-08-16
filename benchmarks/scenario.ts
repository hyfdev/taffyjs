import type { NodeId, TaffyTree } from "@taffyjs/node";
import type { Node as YogaNode } from "@taffyjs/yoga";

export type TaffyApi = typeof import("@taffyjs/node");
export type YogaApi = typeof import("@taffyjs/yoga");

export interface BenchmarkScenarioMetadata {
  readonly id: string;
  readonly name: string;
  readonly question: string;
  readonly description: string;
  readonly transaction: string;
  readonly parameters: Readonly<Record<string, string | number | boolean>>;
}

export interface BenchmarkScenario<TApi> extends BenchmarkScenarioMetadata {
  createTransaction(api: TApi): () => number;
}

export type TaffyBenchmarkScenario = BenchmarkScenario<TaffyApi>;
export type YogaBenchmarkScenario = BenchmarkScenario<YogaApi>;

export interface BenchmarkTarget {
  readonly id: string;
  readonly label: string;
  readonly packageName: string;
}

interface BenchmarkComparisonGroupBase {
  readonly name: string;
  readonly targets: readonly BenchmarkTarget[];
}

export interface TaffyBenchmarkComparisonGroup extends BenchmarkComparisonGroupBase {
  readonly id: "taffy-api";
  readonly scenarios: readonly TaffyBenchmarkScenario[];
}

export interface YogaBenchmarkComparisonGroup extends BenchmarkComparisonGroupBase {
  readonly id: "yoga-api";
  readonly scenarios: readonly YogaBenchmarkScenario[];
}

export type BenchmarkComparisonGroup = TaffyBenchmarkComparisonGroup | YogaBenchmarkComparisonGroup;

export interface SampledBenchmarkResult {
  readonly hz: number;
  readonly meanMs: number;
  readonly medianMs: number;
  readonly minMs: number;
  readonly maxMs: number;
  readonly p75Ms: number;
  readonly p99Ms: number;
  readonly relativeMarginOfError: number;
  readonly sampleCount: number;
  readonly samplesMs: readonly number[];
}

export interface BenchmarkWorkerResult {
  readonly groupId: BenchmarkComparisonGroup["id"];
  readonly targetId: string;
  readonly scenarioId: string;
  readonly checksum: number;
  readonly result: SampledBenchmarkResult;
}

export interface BenchmarkProfile {
  readonly id: string;
  readonly rounds: number;
  readonly settings: {
    readonly time: number;
    readonly iterations: number;
    readonly warmupTime: number;
    readonly warmupIterations: number;
  };
  readonly maxRelativeMarginOfError: number | null;
  readonly maxRoundMedianSpread: number | null;
}

export function readLayoutChecksum<TContext>(
  tree: TaffyTree<TContext>,
  nodes: readonly NodeId[],
): number {
  let checksum = tree.getNodeCount() * 17;

  for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
    const layout = tree.getUnroundedLayout(nodes[nodeIndex]);
    const values = [
      layout.order,
      layout.location.x,
      layout.location.y,
      layout.size.width,
      layout.size.height,
      layout.contentSize.width,
      layout.contentSize.height,
      layout.scrollbarSize.width,
      layout.scrollbarSize.height,
      layout.border.left,
      layout.border.right,
      layout.border.top,
      layout.border.bottom,
      layout.padding.left,
      layout.padding.right,
      layout.padding.top,
      layout.padding.bottom,
      layout.margin.left,
      layout.margin.right,
      layout.margin.top,
      layout.margin.bottom,
    ];

    for (let valueIndex = 0; valueIndex < values.length; valueIndex += 1) {
      checksum += values[valueIndex] * (nodeIndex + 1) * (valueIndex + 1);
    }
  }

  return checksum;
}

export function readYogaLayoutChecksum(nodes: readonly YogaNode[]): number {
  let checksum = nodes.length * 17;

  for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
    const layout = nodes[nodeIndex].getComputedLayout();
    const values = [
      layout.left,
      layout.right,
      layout.top,
      layout.bottom,
      layout.width,
      layout.height,
    ];

    for (let valueIndex = 0; valueIndex < values.length; valueIndex += 1) {
      checksum += values[valueIndex] * (nodeIndex + 1) * (valueIndex + 1);
    }
  }

  return checksum;
}
