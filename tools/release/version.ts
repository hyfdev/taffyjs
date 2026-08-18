import type { ReleaseGroupName } from "./config.ts";
import { isReleasePath } from "./config.ts";

export type VersionBump = "patch" | "minor";

export interface ConventionalCommit {
  readonly hash: string;
  readonly subject: string;
  readonly body: string;
  readonly paths: readonly string[];
}

export interface ParsedCommit extends ConventionalCommit {
  readonly type: string;
  readonly scope?: string;
  readonly description: string;
  readonly breaking: boolean;
}

const stableVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const conventionalSubjectPattern =
  /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<description>.+)$/;

export function parseStableVersion(version: string): readonly [number, number, number] {
  const match = stableVersionPattern.exec(version);
  if (!match) throw new Error(`Expected a stable semantic version, received ${version}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function incrementVersion(version: string, bump: VersionBump): string {
  const [major, minor, patch] = parseStableVersion(version);
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function parseConventionalCommit(commit: ConventionalCommit): ParsedCommit {
  const match = conventionalSubjectPattern.exec(commit.subject);
  if (!match?.groups) {
    throw new Error(`Commit ${commit.hash.slice(0, 8)} is not Conventional: ${commit.subject}`);
  }
  const scope = match.groups.scope;
  return {
    ...commit,
    type: match.groups.type ?? "",
    ...(scope === undefined ? {} : { scope }),
    description: match.groups.description ?? "",
    breaking:
      match.groups.breaking === "!" || /^(?:BREAKING CHANGE|BREAKING-CHANGE):/m.test(commit.body),
  };
}

function parseReleaseCommit(commit: ConventionalCommit): ParsedCommit {
  try {
    return parseConventionalCommit(commit);
  } catch {
    return {
      ...commit,
      type: "",
      description: commit.subject,
      breaking: /^(?:BREAKING CHANGE|BREAKING-CHANGE):/m.test(commit.body),
    };
  }
}

export function commitBump(commit: ParsedCommit): VersionBump | undefined {
  if (commit.breaking || commit.type === "feat") return "minor";
  if (commit.type === "fix" || commit.type === "perf" || commit.type === "revert") {
    return "patch";
  }
  return undefined;
}

export function relevantCommits(
  group: ReleaseGroupName,
  commits: readonly ConventionalCommit[],
): readonly ParsedCommit[] {
  return commits
    .filter((commit) => commit.paths.some((path) => isReleasePath(group, path)))
    .map(parseReleaseCommit);
}

export function automaticBump(commits: readonly ParsedCommit[]): VersionBump | undefined {
  let bump: VersionBump | undefined;
  for (const commit of commits) {
    const candidate = commitBump(commit);
    if (candidate === "minor") return "minor";
    if (candidate === "patch") bump = "patch";
  }
  return bump;
}
