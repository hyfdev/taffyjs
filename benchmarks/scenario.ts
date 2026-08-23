export type TaffyApi = typeof import("@taffyjs/node");
export type YogaApi = typeof import("@taffyjs/yoga");

export type BenchmarkApiKind = "taffy" | "yoga";

export interface BenchmarkTarget {
  readonly id: string;
  readonly packageName: string;
  readonly apiKind: BenchmarkApiKind;
  readonly apiLabel: string;
  readonly runtimeLabel: string;
}

/** What one transaction did, and what the completion check compares against a second run. */
export interface TransactionOutcome {
  readonly checksum: number;
  readonly readCount: number;
  readonly measureCalls: number;
  readonly nodeCount: number;
}

export interface BenchmarkTransaction {
  run(): TransactionOutcome;
  dispose?(): void;
}

export interface BenchmarkScenario {
  readonly id: string;
  readonly name: string;
  readonly question: string;
  readonly description: string;
  readonly transaction: string;
  readonly parameters: Readonly<Record<string, string | number | boolean>>;
  /** Implementations that can express this workload. */
  readonly targetIds: readonly string[];
  /** The 1.00x reference inside this scenario. */
  readonly baselineTargetId: string;
  /** Measures one fresh process per sample instead of a sampled loop. */
  readonly mode?: "process";
  /** Fresh processes per target, for a process-mode scenario. */
  readonly processesPerTarget?: number;
  createTaffyTransaction?(api: TaffyApi): BenchmarkTransaction;
  createYogaTransaction?(api: YogaApi): BenchmarkTransaction;
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
  readonly outcome: TransactionOutcome;
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
