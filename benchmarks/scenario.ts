import type { NodeId, TaffyTree } from "@taffyjs/node";

export type TaffyApi = typeof import("@taffyjs/node");

export interface TaffyBenchmarkScenario {
  readonly id: string;
  readonly name: string;
  readonly question: string;
  readonly description: string;
  readonly transaction: string;
  readonly parameters: Readonly<Record<string, string | number | boolean>>;
  createTransaction(api: TaffyApi): () => number;
}

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
