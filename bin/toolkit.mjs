#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const legacyInstaller = join(packageRoot, "bin", "install.mjs");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const codexHomeIndex = args.indexOf("--codex-home");
const codexHomeArg = codexHomeIndex >= 0 ? args[codexHomeIndex + 1] : undefined;
const codexHome = codexHomeArg || process.env.CODEX_HOME || join(homedir(), ".codex");

if (codexHomeIndex >= 0 && !codexHomeArg) {
  throw new Error("--codex-home requires a path");
}

const managedStart = "<!-- codex-toolkit:start -->";
const managedEnd = "<!-- codex-toolkit:end -->";
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupRoot = join(codexHome, "backups", `codex-toolkit-orchestration-${stamp}`);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function markerCount(text, marker) {
  return text.split(marker).length - 1;
}

async function backupFile(path, relativeTarget) {
  if (!(await exists(path))) return false;
  const destination = join(backupRoot, relativeTarget);
  if (dryRun) {
    console.log(`[dry-run] backup ${path} -> ${destination}`);
    return true;
  }
  await mkdir(dirname(destination), { recursive: true });
  await cp(path, destination);
  return true;
}

async function installManagedAgentsBlock() {
  const sourcePath = join(packageRoot, "orchestration", "managed-agents.md");
  const targetPath = join(codexHome, "AGENTS.md");
  const body = (await readFile(sourcePath, "utf8")).trim();
  const block = `${managedStart}\n${body}\n${managedEnd}`;
  const current = (await exists(targetPath)) ? await readFile(targetPath, "utf8") : "";

  const starts = markerCount(current, managedStart);
  const ends = markerCount(current, managedEnd);
  if (!((starts === 0 && ends === 0) || (starts === 1 && ends === 1))) {
    throw new Error(
      `Refusing to edit ${targetPath}: expected zero or one complete Codex Toolkit managed block, found ${starts} start marker(s) and ${ends} end marker(s).`,
    );
  }

  let next;
  if (starts === 0) {
    next = current.trimEnd()
      ? `${current.trimEnd()}\n\n${block}\n`
      : `${block}\n`;
  } else {
    const startIndex = current.indexOf(managedStart);
    const endIndex = current.indexOf(managedEnd, startIndex + managedStart.length);
    if (endIndex < startIndex) {
      throw new Error(`Refusing to edit ${targetPath}: managed block markers are out of order.`);
    }
    const afterIndex = endIndex + managedEnd.length;
    next = `${current.slice(0, startIndex)}${block}${current.slice(afterIndex)}`;
  }

  if (next === current) return false;
  await backupFile(targetPath, "AGENTS.md");
  if (dryRun) {
    console.log(`[dry-run] update managed Codex Toolkit block in ${targetPath}`);
    return true;
  }
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, next, "utf8");
  return true;
}

async function installWorkflowCatalog() {
  const sourcePath = join(packageRoot, "orchestration", "workflows.md");
  const targetPath = join(codexHome, "codex-toolkit", "workflows.md");
  const source = await readFile(sourcePath);
  if (await exists(targetPath)) {
    const current = await readFile(targetPath);
    if (source.equals(current)) return false;
    await backupFile(targetPath, join("codex-toolkit", "workflows.md"));
  }
  if (dryRun) {
    console.log(`[dry-run] install ${sourcePath} -> ${targetPath}`);
    return true;
  }
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, source);
  return true;
}

async function installOrchestration() {
  const [agentsChanged, workflowsChanged] = await Promise.all([
    installManagedAgentsBlock(),
    installWorkflowCatalog(),
  ]);
  const changed = Number(agentsChanged) + Number(workflowsChanged);
  if (changed) {
    console.log(`Codex Toolkit routing synchronized: ${changed} managed surface(s) changed.`);
    if (!dryRun && (await exists(backupRoot))) {
      console.log(`Previous orchestration files backed up to ${backupRoot}`);
    }
  } else {
    console.log("Codex Toolkit routing was already current.");
  }
}

function runLegacy() {
  const result = spawnSync(process.execPath, [legacyInstaller, ...args], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const command = args[0] || "mission-control";
runLegacy();

if (command === "setup") {
  await installOrchestration();
  console.log("Start a fresh Codex task to load updated skills, agents, and routing instructions.");
} else if (command === "auto-update" && args[1] === "remove") {
  // The legacy updater removes its state directory. Restore only the routing catalog;
  // disabling updates must not silently uninstall global routing instructions.
  await installOrchestration();
  console.log("Toolkit routing remains installed; only automatic updates were disabled.");
}
