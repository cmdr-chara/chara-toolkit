#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  chmod,
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repository = "cmdr-chara/codex-toolkit";
const stateDirectoryName = "codex-toolkit";
const windowsDailyTask = "Codex Toolkit Auto Update";
const windowsLogonTask = "Codex Toolkit Auto Update Logon";
const macLabel = "dev.cmdr-chara.codex-toolkit-update";
const linuxUnit = "codex-toolkit-update";

const argv = process.argv.slice(2);
const commands = new Set(["setup", "mission-control", "auto-update", "help"]);
const command = argv[0] && commands.has(argv[0]) ? argv.shift() : "mission-control";

function option(name) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

function flag(name) {
  return argv.includes(name);
}

const codexHomeArg = option("--codex-home");
const codexHome = codexHomeArg || process.env.CODEX_HOME || join(homedir(), ".codex");
const dryRun = flag("--dry-run");
const scheduled = flag("--scheduled");
const noAutoUpdate = flag("--no-auto-update");
const sourceRelease = option("--source-release");

if (argv.includes("--codex-home") && !codexHomeArg) {
  throw new Error("--codex-home requires a path");
}
if (argv.includes("--source-release") && !sourceRelease) {
  throw new Error("--source-release requires a tag");
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupRoot = join(codexHome, "backups", `codex-toolkit-${stamp}`);
const toolkitStateRoot = join(codexHome, stateDirectoryName);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function readPackageVersion() {
  const data = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
  if (!data.version || typeof data.version !== "string") {
    throw new Error("package.json has no version");
  }
  return data.version;
}

async function walkFiles(root, relative = "") {
  const current = relative ? join(root, relative) : root;
  const info = await stat(current);
  if (info.isFile()) return [relative];
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const child = relative ? join(relative, entry.name) : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(root, child)));
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      files.push(child);
    }
  }
  return files;
}

async function treeDigest(path) {
  const hash = createHash("sha256");
  const files = await walkFiles(path);
  for (const relative of files) {
    hash.update(relative.replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(await readFile(join(path, relative)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

async function backup(path, relativeTarget) {
  if (!(await exists(path))) return false;
  const destination = join(backupRoot, relativeTarget);
  if (dryRun) {
    console.log(`[dry-run] backup ${path} -> ${destination}`);
    return true;
  }
  await mkdir(dirname(destination), { recursive: true });
  await rename(path, destination);
  return true;
}

async function syncDirectory(source, target, relativeTarget) {
  if (await exists(target)) {
    const [sourceDigest, targetDigest] = await Promise.all([
      treeDigest(source),
      treeDigest(target),
    ]);
    if (sourceDigest === targetDigest) return false;
    await backup(target, relativeTarget);
  }
  if (dryRun) {
    console.log(`[dry-run] install ${source} -> ${target}`);
    return true;
  }
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
  return true;
}

async function syncFile(source, target, relativeTarget) {
  if (await exists(target)) {
    const [sourceBytes, targetBytes] = await Promise.all([
      readFile(source),
      readFile(target),
    ]);
    if (sourceBytes.equals(targetBytes)) return false;
    await backup(target, relativeTarget);
  }
  if (dryRun) {
    console.log(`[dry-run] install ${source} -> ${target}`);
    return true;
  }
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target);
  return true;
}

async function toolkitSkillNames() {
  const skillsRoot = join(packageRoot, "skills");
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const names = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
    if (await exists(join(skillsRoot, entry.name, "SKILL.md"))) names.push(entry.name);
  }
  return names.sort();
}

async function installAllSkills() {
  const names = await toolkitSkillNames();
  let changed = 0;
  for (const name of names) {
    const didChange = await syncDirectory(
      join(packageRoot, "skills", name),
      join(codexHome, "skills", name),
      join("skills", name),
    );
    if (didChange) changed += 1;
  }
  return { names, changed };
}

async function installMissionControl({ includeSkill = true } = {}) {
  let changed = 0;
  const skillName = "delegate-with-mission-cards";
  if (includeSkill) {
    if (
      await syncDirectory(
        join(packageRoot, "skills", skillName),
        join(codexHome, "skills", skillName),
        join("skills", skillName),
      )
    ) {
      changed += 1;
    }
  }

  const agentNames = [
    "pathfinder-reader.toml",
    "patcher-writer.toml",
    "investigator-reader.toml",
    "builder-writer.toml",
    "sentinel-reader.toml",
    "architect-writer.toml",
  ];
  for (const name of agentNames) {
    if (
      await syncFile(
        join(packageRoot, "agents", "mission-control", name),
        join(codexHome, "agents", name),
        join("agents", name),
      )
    ) {
      changed += 1;
    }
  }
  return changed;
}

function run(commandName, args, { allowFailure = false, input } = {}) {
  const result = spawnSync(commandName, args, {
    encoding: "utf8",
    input,
    stdio: input === undefined ? ["ignore", "pipe", "pipe"] : ["pipe", "pipe", "pipe"],
    shell: false,
  });
  if (result.error && !allowFailure) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(
      `${commandName} ${args.join(" ")} failed with ${result.status}${detail ? `: ${detail}` : ""}`,
    );
  }
  return result;
}

function resolveNpx() {
  const isWindows = process.platform === "win32";
  const lookup = run(
    isWindows ? "where.exe" : "which",
    [isWindows ? "npx.cmd" : "npx"],
    { allowFailure: true },
  );
  const first = (lookup.stdout || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  return first || (isWindows ? "npx.cmd" : "npx");
}

function shQuote(value) {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function writeUpdaterFiles() {
  const runnerTarget = join(toolkitStateRoot, "update-runner.mjs");
  const configTarget = join(toolkitStateRoot, "auto-update.json");
  const logTarget = join(toolkitStateRoot, "auto-update.log");
  const launcherTarget =
    process.platform === "win32"
      ? join(toolkitStateRoot, "update.cmd")
      : join(toolkitStateRoot, "update.sh");

  const config = {
    schema_version: 1,
    repository,
    codex_home: codexHome,
    npx_path: resolveNpx(),
  };

  if (dryRun) {
    console.log(`[dry-run] write updater runner to ${runnerTarget}`);
    console.log(`[dry-run] write updater config to ${configTarget}`);
  } else {
    await mkdir(toolkitStateRoot, { recursive: true });
    await cp(join(packageRoot, "scripts", "auto-update-runner.mjs"), runnerTarget);
    await writeFile(configTarget, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  }

  const launcher =
    process.platform === "win32"
      ? `@echo off\r\n"${process.execPath}" "${runnerTarget}" >> "${logTarget}" 2>&1\r\nexit /b %ERRORLEVEL%\r\n`
      : `#!/bin/sh\n${shQuote(process.execPath)} ${shQuote(runnerTarget)} >> ${shQuote(logTarget)} 2>&1\n`;

  if (dryRun) {
    console.log(`[dry-run] write updater launcher to ${launcherTarget}`);
  } else {
    await writeFile(launcherTarget, launcher, "utf8");
    if (process.platform !== "win32") await chmod(launcherTarget, 0o755);
  }
  return launcherTarget;
}

function systemdAvailable() {
  const probe = run("systemctl", ["--user", "--version"], { allowFailure: true });
  return probe.status === 0;
}

async function installWindowsScheduler(launcher) {
  const taskRun = `cmd.exe /d /c ""${launcher}""`;
  const definitions = [
    ["/Create", "/F", "/SC", "DAILY", "/ST", "09:00", "/TN", windowsDailyTask, "/TR", taskRun],
    ["/Create", "/F", "/SC", "ONLOGON", "/TN", windowsLogonTask, "/TR", taskRun],
  ];
  if (dryRun) {
    for (const args of definitions) console.log(`[dry-run] schtasks.exe ${args.join(" ")}`);
    return;
  }
  for (const args of definitions) run("schtasks.exe", args);
}

async function removeWindowsScheduler() {
  for (const name of [windowsDailyTask, windowsLogonTask]) {
    if (dryRun) {
      console.log(`[dry-run] schtasks.exe /Delete /F /TN "${name}"`);
    } else {
      run("schtasks.exe", ["/Delete", "/F", "/TN", name], { allowFailure: true });
    }
  }
}

function windowsSchedulerEnabled() {
  return [windowsDailyTask, windowsLogonTask].every(
    (name) => run("schtasks.exe", ["/Query", "/TN", name], { allowFailure: true }).status === 0,
  );
}

async function installMacScheduler(launcher) {
  const launchAgents = join(homedir(), "Library", "LaunchAgents");
  const plist = join(launchAgents, `${macLabel}.plist`);
  const log = join(toolkitStateRoot, "launchd.log");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${macLabel}</string>
  <key>ProgramArguments</key>
  <array><string>/bin/sh</string><string>${xmlEscape(launcher)}</string></array>
  <key>RunAtLoad</key><true/>
  <key>StartInterval</key><integer>86400</integer>
  <key>StandardOutPath</key><string>${xmlEscape(log)}</string>
  <key>StandardErrorPath</key><string>${xmlEscape(log)}</string>
</dict>
</plist>
`;
  if (dryRun) {
    console.log(`[dry-run] write LaunchAgent ${plist}`);
    return;
  }
  await mkdir(launchAgents, { recursive: true });
  await writeFile(plist, body, "utf8");
  const domain = `gui/${process.getuid()}`;
  run("launchctl", ["bootout", domain, plist], { allowFailure: true });
  run("launchctl", ["bootstrap", domain, plist]);
}

async function removeMacScheduler() {
  const plist = join(homedir(), "Library", "LaunchAgents", `${macLabel}.plist`);
  if (dryRun) {
    console.log(`[dry-run] remove LaunchAgent ${plist}`);
    return;
  }
  const domain = `gui/${process.getuid()}`;
  run("launchctl", ["bootout", domain, plist], { allowFailure: true });
  await rm(plist, { force: true });
}

async function macSchedulerEnabled() {
  const domain = `gui/${process.getuid()}/${macLabel}`;
  return run("launchctl", ["print", domain], { allowFailure: true }).status === 0;
}

const cronMarker = "# codex-toolkit-auto-update";

function currentCrontab() {
  const result = run("crontab", ["-l"], { allowFailure: true });
  return result.status === 0 ? result.stdout : "";
}

async function installCronScheduler(launcher) {
  const current = currentCrontab()
    .split(/\r?\n/)
    .filter((line) => !line.includes(cronMarker) && line.trim());
  current.push(`@reboot /bin/sh ${shQuote(launcher)} ${cronMarker}`);
  current.push(`17 9 * * * /bin/sh ${shQuote(launcher)} ${cronMarker}`);
  const next = `${current.join("\n")}\n`;
  if (dryRun) {
    console.log("[dry-run] install user crontab entries:");
    console.log(next);
    return;
  }
  run("crontab", ["-"], { input: next });
}

async function removeCronScheduler() {
  const current = currentCrontab()
    .split(/\r?\n/)
    .filter((line) => !line.includes(cronMarker) && line.trim());
  const next = current.length ? `${current.join("\n")}\n` : "";
  if (dryRun) {
    console.log("[dry-run] remove codex-toolkit entries from user crontab");
    return;
  }
  run("crontab", ["-"], { input: next, allowFailure: true });
}

function cronSchedulerEnabled() {
  return currentCrontab().includes(cronMarker);
}

async function installLinuxScheduler(launcher) {
  if (systemdAvailable()) {
    const userDir = join(homedir(), ".config", "systemd", "user");
    const service = join(userDir, `${linuxUnit}.service`);
    const timer = join(userDir, `${linuxUnit}.timer`);
    const serviceBody = `[Unit]
Description=Update Codex Toolkit from the latest published release

[Service]
Type=oneshot
ExecStart=/bin/sh ${shQuote(launcher)}
`;
    const timerBody = `[Unit]
Description=Periodically update Codex Toolkit

[Timer]
OnBootSec=5min
OnUnitActiveSec=24h
Persistent=true

[Install]
WantedBy=timers.target
`;
    if (dryRun) {
      console.log(`[dry-run] write ${service}`);
      console.log(`[dry-run] write ${timer}`);
      return;
    }
    await mkdir(userDir, { recursive: true });
    await writeFile(service, serviceBody, "utf8");
    await writeFile(timer, timerBody, "utf8");
    const enabled = run(
      "systemctl",
      ["--user", "enable", "--now", `${linuxUnit}.timer`],
      { allowFailure: true },
    );
    if (enabled.status === 0) return;
    console.warn("systemd user timer was unavailable; falling back to crontab.");
  }
  await installCronScheduler(launcher);
}

async function removeLinuxScheduler() {
  const userDir = join(homedir(), ".config", "systemd", "user");
  if (dryRun) {
    console.log(`[dry-run] disable ${linuxUnit}.timer and remove user unit files`);
  } else {
    run("systemctl", ["--user", "disable", "--now", `${linuxUnit}.timer`], {
      allowFailure: true,
    });
    await rm(join(userDir, `${linuxUnit}.service`), { force: true });
    await rm(join(userDir, `${linuxUnit}.timer`), { force: true });
    run("systemctl", ["--user", "daemon-reload"], { allowFailure: true });
  }
  await removeCronScheduler();
}

function linuxSchedulerEnabled() {
  const systemd = run(
    "systemctl",
    ["--user", "is-enabled", `${linuxUnit}.timer`],
    { allowFailure: true },
  );
  return systemd.status === 0 || cronSchedulerEnabled();
}

async function installScheduler(launcher) {
  if (process.platform === "win32") return installWindowsScheduler(launcher);
  if (process.platform === "darwin") return installMacScheduler(launcher);
  if (process.platform === "linux") return installLinuxScheduler(launcher);
  throw new Error(`automatic updates are not supported on ${process.platform}`);
}

async function removeScheduler() {
  if (process.platform === "win32") return removeWindowsScheduler();
  if (process.platform === "darwin") return removeMacScheduler();
  if (process.platform === "linux") return removeLinuxScheduler();
}

async function schedulerEnabled() {
  if (process.platform === "win32") return windowsSchedulerEnabled();
  if (process.platform === "darwin") return macSchedulerEnabled();
  if (process.platform === "linux") return linuxSchedulerEnabled();
  return false;
}

async function writeInstallState(skillCount, releaseTag) {
  if (dryRun) return;
  await mkdir(toolkitStateRoot, { recursive: true });
  await writeFile(
    join(toolkitStateRoot, "state.json"),
    `${JSON.stringify(
      {
        schema_version: 1,
        release: releaseTag,
        skill_count: skillCount,
        updated_at: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

async function enableAutoUpdate() {
  const launcher = await writeUpdaterFiles();
  await installScheduler(launcher);
  if (!dryRun) {
    console.log("Automatic updates enabled (latest published GitHub Release).");
  }
}

async function removeAutoUpdate() {
  await removeScheduler();
  if (dryRun) {
    console.log(`[dry-run] remove ${toolkitStateRoot}`);
    return;
  }
  await rm(toolkitStateRoot, { recursive: true, force: true });
  console.log("Automatic updates disabled. Installed skills and agents were left untouched.");
}

async function showAutoUpdateStatus() {
  const configPath = join(toolkitStateRoot, "auto-update.json");
  const statePath = join(toolkitStateRoot, "state.json");
  let release = "unknown";
  if (await exists(statePath)) {
    try {
      const state = JSON.parse(await readFile(statePath, "utf8"));
      if (typeof state.release === "string") release = state.release;
    } catch {
      release = "invalid-state";
    }
  }
  const enabled = (await exists(configPath)) && (await schedulerEnabled());
  console.log(`Automatic updates: ${enabled ? "enabled" : "disabled"}`);
  console.log(`Installed release: ${release}`);
  console.log(`State directory: ${toolkitStateRoot}`);
}

async function setup() {
  const version = await readPackageVersion();
  const releaseTag = sourceRelease || `v${version}`;
  const skills = await installAllSkills();
  const agentChanges = await installMissionControl({ includeSkill: false });
  await writeInstallState(skills.names.length, releaseTag);

  if (!noAutoUpdate) {
    if (scheduled) {
      await writeUpdaterFiles();
    } else {
      await enableAutoUpdate();
    }
  }

  console.log(
    `Codex Toolkit ${releaseTag} synchronized: ${skills.names.length} skills and 6 Mission Control agents.`,
  );
  if (skills.changed || agentChanges) {
    console.log(`Changed surfaces: ${skills.changed + agentChanges}`);
  } else {
    console.log("Everything was already current.");
  }
  if (!dryRun && (skills.changed || agentChanges) && (await exists(backupRoot))) {
    console.log(`Previous files backed up to ${backupRoot}`);
  }
  console.log("Start a fresh Codex task to load updated skills and agents.");
}

function help() {
  console.log(`Codex Toolkit installer

Usage:
  npx --yes github:cmdr-chara/codex-toolkit
      Install/update Mission Control only (legacy behavior).

  npx --yes github:cmdr-chara/codex-toolkit setup
      Install all toolkit skills + Mission Control and enable automatic updates.

  npx --yes github:cmdr-chara/codex-toolkit auto-update status
  npx --yes github:cmdr-chara/codex-toolkit auto-update install
  npx --yes github:cmdr-chara/codex-toolkit auto-update remove

Options:
  --codex-home <path>   Override CODEX_HOME / ~/.codex.
  --no-auto-update      Setup without registering the updater.
  --dry-run             Show intended writes/scheduler actions without changing anything.

Automatic updates are release-pinned: the updater checks the latest published GitHub
Release and never installs an unreleased main-branch commit.
`);
}

if (command === "help" || flag("--help") || flag("-h")) {
  help();
} else if (command === "setup") {
  await setup();
} else if (command === "auto-update") {
  const action = argv.find((arg) => !arg.startsWith("-")) || "status";
  if (action === "install") await enableAutoUpdate();
  else if (action === "remove") await removeAutoUpdate();
  else if (action === "status") await showAutoUpdateStatus();
  else throw new Error(`unknown auto-update action: ${action}`);
} else {
  const changed = await installMissionControl({ includeSkill: true });
  console.log(`Mission Control synchronized in ${codexHome}`);
  if (changed) {
    console.log(`Changed surfaces: ${changed}`);
    if (!dryRun && (await exists(backupRoot))) {
      console.log(`Previous files backed up to ${backupRoot}`);
    }
  } else {
    console.log("Mission Control was already current.");
  }
  console.log("Start a fresh Codex task to load the skill and agents.");
}
