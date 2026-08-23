import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineLoader } from "vitepress";

const publishedResultPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../benchmarks/results/published.json",
);

interface PublishedTarget {
  readonly id: string;
  readonly packageName: string;
  readonly apiLabel: string;
  readonly runtimeLabel: string;
}

interface PublishedResult {
  readonly targetId: string;
  readonly medianMs: number;
  readonly p99Ms: number;
  readonly maxRelativeMarginOfError: number;
  readonly sampleCount: number;
  readonly measureCalls: number;
  readonly readCount: number;
}

interface PublishedScenario {
  readonly id: string;
  readonly name: string;
  readonly question: string;
  readonly description: string;
  readonly baselineTargetId: string;
  readonly targetIds: readonly string[];
  readonly results: readonly PublishedResult[];
}

interface PublishedReport {
  readonly schemaVersion: number;
  readonly generatedAt: string;
  readonly source: { readonly commit: string; readonly dirty: boolean };
  readonly environment: {
    readonly node: string;
    readonly platform: string;
    readonly release: string;
    readonly arch: string;
    readonly cpu: string;
  };
  readonly targets: readonly PublishedTarget[];
  readonly scenarios: readonly PublishedScenario[];
}

export interface BenchmarkRow {
  readonly targetId: string;
  readonly packageName: string;
  readonly isBaseline: boolean;
  readonly relativeTime: number;
  readonly medianMs: number;
  readonly p99Ms: number;
  readonly relativeMarginOfError: number;
  readonly sampleCount: number;
  readonly measureCalls: number;
  readonly readCount: number;
}

export interface BenchmarkScenarioView {
  readonly id: string;
  readonly title: string;
  readonly scale: string;
  readonly question: string;
  readonly description: string;
  readonly baselinePackageName: string;
  readonly rows: readonly BenchmarkRow[];
}

export interface BenchmarkView {
  readonly generatedAt: string;
  readonly commit: string;
  readonly environment: PublishedReport["environment"];
  readonly scenarios: readonly BenchmarkScenarioView[];
}

declare const data: BenchmarkView;
export { data };

function splitName(name: string): { title: string; scale: string } {
  const separator = name.indexOf(": ");
  if (separator === -1) return { title: name, scale: "" };
  return { title: name.slice(0, separator), scale: name.slice(separator + 2) };
}

export default defineLoader({
  watch: ["../../../benchmarks/results/published.json"],
  load(): BenchmarkView {
    const report = JSON.parse(readFileSync(publishedResultPath, "utf8")) as PublishedReport;
    if (report.schemaVersion !== 3) {
      throw new Error(`Unsupported benchmark result schema ${report.schemaVersion}`);
    }
    if (report.scenarios.length === 0) {
      throw new Error("Published benchmark results contain no scenarios");
    }

    const targetById = new Map(report.targets.map((target) => [target.id, target]));

    return {
      generatedAt: report.generatedAt,
      commit: report.source.commit,
      environment: report.environment,
      scenarios: report.scenarios.map((scenario) => {
        const baseline = scenario.results.find(
          ({ targetId }) => targetId === scenario.baselineTargetId,
        );
        if (!baseline) {
          throw new Error(`${scenario.id} is missing its ${scenario.baselineTargetId} result`);
        }
        const baselineTarget = targetById.get(scenario.baselineTargetId);
        if (!baselineTarget) {
          throw new Error(`${scenario.id} names an unknown baseline ${scenario.baselineTargetId}`);
        }
        const ordered = [
          scenario.baselineTargetId,
          ...scenario.targetIds.filter((id) => id !== scenario.baselineTargetId),
        ];
        return {
          id: scenario.id,
          ...splitName(scenario.name),
          question: scenario.question,
          description: scenario.description,
          baselinePackageName: baselineTarget.packageName,
          rows: ordered.map((targetId) => {
            const target = targetById.get(targetId);
            const result = scenario.results.find((row) => row.targetId === targetId);
            if (!target || !result) {
              throw new Error(`${scenario.id} is missing its ${targetId} result`);
            }
            return {
              targetId,
              packageName: target.packageName,
              isBaseline: targetId === scenario.baselineTargetId,
              relativeTime: result.medianMs / baseline.medianMs,
              medianMs: result.medianMs,
              p99Ms: result.p99Ms,
              relativeMarginOfError: result.maxRelativeMarginOfError,
              sampleCount: result.sampleCount,
              measureCalls: result.measureCalls,
              readCount: result.readCount,
            };
          }),
        };
      }),
    };
  },
});
