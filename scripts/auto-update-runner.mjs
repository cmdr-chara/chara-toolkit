#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const stateRoot = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(await readFile(join(stateRoot, "auto-update.json"), "utf8"));
const statePath = join(stateRoot, "state.json");
const state = JSON.parse(await readFile(statePath, "utf8").catch(() => "{}"));
const dryRun = process.argv.includes("--dry-run");
const tagIndex = process.argv.indexOf("--tag");
const commitIndex = process.argv.indexOf("--commit");
const forcedTag = tagIndex >= 0 ? process.argv[tagIndex + 1] : undefined;
const forcedCommit = commitIndex >= 0 ? process.argv[commitIndex + 1] : undefined;

const TAG_PATTERN = /^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

if ((forcedTag || forcedCommit) && !dryRun) {
  throw new Error("--tag and --commit are dry-run/test overrides only");
}
if ((forcedTag && !forcedCommit) || (!forcedTag && forcedCommit)) {
  throw new Error("--tag and --commit must be supplied together");
}
if (!config.repository || !config.codex_home || !config.npx_path) {
  throw new Error("auto-update.json is incomplete");
}
if (!REPOSITORY_PATTERN.test(config.repository)) {
  throw new Error(`auto-update.json has an invalid repository: ${String(config.repository)}`);
}

async function githubJson(path) {
  const response = await fetch(
    `https://api.github.com/repos/${config.repository}${path}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "codex-toolkit-auto-update",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitHub request ${path} failed: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

async function resolveTagCommit(tag) {
  const ref = await githubJson(`/git/ref/tags/${encodeURIComponent(tag)}`);
  let object = ref?.object;
  const seen = new Set();

  for (let depth = 0; depth < 8; depth += 1) {
    if (!object || typeof object.type !== "string" || typeof object.sha !== "string") {
      throw new Error(`GitHub returned an invalid object for release tag ${tag}`);
    }
    const sha = object.sha.toLowerCase();
    if (!COMMIT_PATTERN.test(sha)) {
      throw new Error(`GitHub returned an invalid SHA for release tag ${tag}: ${object.sha}`);
    }
    if (object.type === "commit") return sha;
    if (object.type !== "tag") {
      throw new Error(`Release tag ${tag} resolved to unsupported object type ${object.type}`);
    }
    if (seen.has(sha)) {
      throw new Error(`Release tag ${tag} contains a tag-object cycle`);
    }
    seen.add(sha);
    const annotatedTag = await githubJson(`/git/tags/${sha}`);
    object = annotatedTag?.object;
  }

  throw new Error(`Release tag ${tag} exceeded the tag resolution depth limit`);
}

let tag = forcedTag;
let commit = forcedCommit?.toLowerCase();
if (!tag) {
  const release = await githubJson("/releases/latest");
  tag = release.tag_name;
  if (typeof tag !== "string" || !TAG_PATTERN.test(tag)) {
    throw new Error(`GitHub returned an unexpected release tag: ${String(tag)}`);
  }
  commit = await resolveTagCommit(tag);
}

if (typeof tag !== "string" || !TAG_PATTERN.test(tag)) {
  throw new Error(`GitHub returned an unexpected release tag: ${String(tag)}`);
}
if (typeof commit !== "string" || !COMMIT_PATTERN.test(commit)) {
  throw new Error(`GitHub returned an unexpected release commit: ${String(commit)}`);
}

if (state.release === tag && state.commit === commit) {
  console.log(`Codex Toolkit is already current at ${tag} (${commit.slice(0, 12)}).`);
  process.exit(0);
}

const packageSpec = `github:${config.repository}#${commit}`;
const args = [
  "--yes",
  packageSpec,
  "setup",
  "--scheduled",
  "--source-release",
  tag,
  "--codex-home",
  config.codex_home,
];

if (dryRun) {
  console.log(JSON.stringify({ executable: config.npx_path, args, release: tag, commit }, null, 2));
  process.exit(0);
}

let result;
if (process.platform === "win32") {
  const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const command = [quote(config.npx_path), ...args.map(quote)].join(" ");
  result = spawnSync("cmd.exe", ["/d", "/s", "/c", command], { stdio: "inherit" });
} else {
  result = spawnSync(config.npx_path, args, { stdio: "inherit" });
}

if (result.error) throw result.error;
if (result.status !== 0) {
  throw new Error(`Codex Toolkit update failed with exit ${result.status}`);
}

const installedState = JSON.parse(await readFile(statePath, "utf8").catch(() => "{}"));
await writeFile(
  statePath,
  `${JSON.stringify({ ...installedState, release: tag, commit }, null, 2)}\n`,
  "utf8",
);

console.log(`Codex Toolkit updated to ${tag} (${commit.slice(0, 12)}).`);
