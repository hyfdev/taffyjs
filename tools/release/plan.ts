import { appendFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  firstReleaseVersion,
  parseReleaseGroup,
  releaseGroups,
  repository,
  type ReleaseGroupName,
} from "./config.ts";
import { capture, root, writeJson } from "./lib.ts";
import {
  automaticBump,
  incrementVersion,
  parseStableVersion,
  relevantCommits,
  type ConventionalCommit,
  type ParsedCommit,
  type VersionBump,
} from "./version.ts";

export interface ReleasePlan {
  readonly group: ReleaseGroupName;
  readonly version: string;
  readonly tag: string;
  readonly previousTag: string | null;
  readonly commit: string;
  readonly bump: "initial" | VersionBump;
  readonly notes: string;
  readonly commits: readonly {
    readonly hash: string;
    readonly subject: string;
  }[];
}

const options = parseOptions(process.argv.slice(2));
const plan = await createReleasePlan(options.group, options.bump);
await writeJson(resolve(root, options.output), plan);

if (process.env.GITHUB_OUTPUT) {
  await appendFile(
    process.env.GITHUB_OUTPUT,
    `version=${plan.version}\ntag=${plan.tag}\nprevious_tag=${plan.previousTag ?? ""}\n`,
  );
}

console.log(JSON.stringify(plan, undefined, 2));

export async function createReleasePlan(
  groupName: ReleaseGroupName,
  requestedBump: "auto" | VersionBump,
): Promise<ReleasePlan> {
  const group = releaseGroups[groupName];
  const commit = await capture("git", ["rev-parse", "HEAD"]);
  const previousTag = await latestTag(groupName);
  const commits = relevantCommits(groupName, await commitsSince(previousTag));

  let version: string;
  let bump: "initial" | VersionBump;
  if (previousTag === null) {
    version = firstReleaseVersion;
    bump = "initial";
  } else {
    const previousVersion = previousTag.slice(group.tagPrefix.length);
    parseStableVersion(previousVersion);
    const selectedBump = requestedBump === "auto" ? automaticBump(commits) : requestedBump;
    if (selectedBump === undefined) {
      throw new Error(
        `No releasable ${groupName} commit exists after ${previousTag}; use an explicit patch or minor override only when a release is intentional`,
      );
    }
    version = incrementVersion(previousVersion, selectedBump);
    bump = selectedBump;
  }

  const tag = `${group.tagPrefix}${version}`;
  const existingTag = await capture("git", ["tag", "--list", tag]);
  if (existingTag !== "") throw new Error(`Release tag ${tag} already exists`);

  return {
    group: groupName,
    version,
    tag,
    previousTag,
    commit,
    bump,
    notes: releaseNotes(groupName, version, previousTag, commit, commits),
    commits: commits.map(({ hash, subject }) => ({ hash, subject })),
  };
}

async function latestTag(groupName: ReleaseGroupName): Promise<string | null> {
  const { tagPrefix } = releaseGroups[groupName];
  const output = await capture("git", [
    "tag",
    "--list",
    `${tagPrefix}[0-9]*`,
    "--sort=-version:refname",
  ]);
  if (output === "") return null;
  const tags = output.split("\n");
  for (const tag of tags) parseStableVersion(tag.slice(tagPrefix.length));
  return tags[0] ?? null;
}

async function commitsSince(previousTag: string | null): Promise<readonly ConventionalCommit[]> {
  const range = previousTag === null ? "HEAD" : `${previousTag}..HEAD`;
  const output = await capture("git", ["log", "--format=%H", range]);
  if (output === "") return [];

  const commits: ConventionalCommit[] = [];
  for (const hash of output.split("\n")) {
    const [subject, body, paths] = await Promise.all([
      capture("git", ["show", "--no-patch", "--format=%s", hash]),
      capture("git", ["show", "--no-patch", "--format=%b", hash]),
      capture("git", ["diff-tree", "--root", "--no-commit-id", "--name-only", "-r", hash]),
    ]);
    commits.push({
      hash,
      subject,
      body,
      paths: paths === "" ? [] : paths.split("\n"),
    });
  }
  return commits;
}

function releaseNotes(
  groupName: ReleaseGroupName,
  version: string,
  previousTag: string | null,
  commit: string,
  commits: readonly ParsedCommit[],
): string {
  const lines = [`## ${releaseGroups[groupName].displayName} ${version}`, ""];
  if (commits.length === 0) {
    lines.push("Initial release.");
  } else {
    lines.push(
      ...commits.map(
        ({ hash, subject }) =>
          `- ${subject} ([${hash.slice(0, 8)}](https://github.com/${repository}/commit/${hash}))`,
      ),
    );
  }
  lines.push("");
  const compareStart = previousTag ?? commit;
  if (previousTag !== null) {
    lines.push(
      `**Full diff:** [${previousTag}...${releaseGroups[groupName].tagPrefix}${version}](https://github.com/${repository}/compare/${previousTag}...${releaseGroups[groupName].tagPrefix}${version})`,
    );
  } else {
    lines.push(
      `Source commit: [${commit.slice(0, 8)}](https://github.com/${repository}/commit/${compareStart})`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function parseOptions(args: readonly string[]): {
  readonly group: ReleaseGroupName;
  readonly bump: "auto" | VersionBump;
  readonly output: string;
} {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error(
        "Usage: plan.ts --group <core|yoga> --bump <auto|patch|minor> --output <path>",
      );
    }
    values.set(key.slice(2), value);
  }
  const bump = values.get("bump") ?? "auto";
  if (bump !== "auto" && bump !== "patch" && bump !== "minor") {
    throw new Error(`Unknown release bump ${bump}`);
  }
  return {
    group: parseReleaseGroup(values.get("group")),
    bump,
    output: values.get("output") ?? "release-plan.json",
  };
}
