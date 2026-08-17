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

export type LayoutObservation = Float64Array;

export interface BenchmarkTransaction {
  run(): LayoutObservation;
  dispose?(): void;
}

export interface BenchmarkScenario extends BenchmarkScenarioMetadata {
  readonly validationRuns?: number;
  createTaffyTransaction(api: TaffyApi): BenchmarkTransaction;
  createYogaTransaction(api: YogaApi): BenchmarkTransaction;
}

export type BenchmarkApiKind = "taffy" | "yoga";

export interface BenchmarkTarget {
  readonly id: string;
  readonly packageName: string;
  readonly apiKind: BenchmarkApiKind;
  readonly apiLabel: string;
  readonly runtimeLabel: string;
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
  readonly observations: readonly (readonly number[])[];
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

export function createLayoutObservation(nodeCount: number): LayoutObservation {
  return new Float64Array(nodeCount * 4);
}

export function readTaffyLayouts<TContext>(
  tree: TaffyTree<TContext>,
  nodes: readonly NodeId[],
  observation: LayoutObservation,
): LayoutObservation {
  assertObservationSize(nodes.length, observation);
  for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
    const layout = tree.getUnroundedLayout(nodes[nodeIndex]);
    const offset = nodeIndex * 4;
    observation[offset] = layout.location.x;
    observation[offset + 1] = layout.location.y;
    observation[offset + 2] = layout.size.width;
    observation[offset + 3] = layout.size.height;
  }
  return observation;
}

export function readYogaLayouts(
  nodes: readonly YogaNode[],
  observation: LayoutObservation,
): LayoutObservation {
  assertObservationSize(nodes.length, observation);
  for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
    const layout = nodes[nodeIndex].getComputedLayout();
    const offset = nodeIndex * 4;
    observation[offset] = layout.left;
    observation[offset + 1] = layout.top;
    observation[offset + 2] = layout.width;
    observation[offset + 3] = layout.height;
  }
  return observation;
}

function assertObservationSize(nodeCount: number, observation: LayoutObservation): void {
  const expectedLength = nodeCount * 4;
  if (observation.length !== expectedLength) {
    throw new Error(
      `Layout observation has ${observation.length} values, expected ${expectedLength}`,
    );
  }
}
