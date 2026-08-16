#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const stateRoot = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(await readFile(join(stateRoot, "auto-update.json"), "utf8"));
const state = JSON.parse(await readFile(join(stateRoot, "state.json"), "utf8").catch(() => "{}"));
const dryRun = process.argv.includes("--dry-run");
const tagIndex = process.argv.indexOf("--tag");
const forcedTag = tagIndex >= 0 ? process.argv[tagIndex + 1] : undefined;

if (forcedTag && !dryRun) {
  throw new Error("--tag is a dry-run/test override only");
}
if (!config.repository || !config.codex_home || !config.npx_path) {
  throw new Error("auto-update.json is incomplete");
}

let tag = forcedTag;
if (!tag) {
  const response = await fetch(
    `https://api.github.com/repos/${config.repository}/releases/latest`,
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
      `GitHub latest-release lookup failed: ${response.status} ${response.statusText}`,
    );
  }

  const release = await response.json();
  tag = release.tag_name;
}

if (typeof tag !== "string" || !/^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(tag)) {
  throw new Error(`GitHub returned an unexpected release tag: ${String(tag)}`);
}

if (state.release === tag) {
  console.log(`Codex Toolkit is already current at ${tag}.`);
  process.exit(0);
}

const packageSpec = `github:${config.repository}#${tag}`;
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
  console.log(JSON.stringify({ executable: config.npx_path, args }, null, 2));
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

console.log(`Codex Toolkit updated to ${tag}.`);
