#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { cp, lstat, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { verifyBundleApproval, verifyInstalled } from "../scripts/enterprise-approval.mjs";
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

// Existing managed markers remain stable across the public name change.
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
      `Refusing to edit ${targetPath}: expected zero or one complete Chara's Toolkit managed block, found ${starts} start marker(s) and ${ends} end marker(s).`,
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
    console.log(`[dry-run] update managed Chara's Toolkit block in ${targetPath}`);
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
    console.log(`Chara's Toolkit routing synchronized: ${changed} managed surface(s) changed.`);
    if (!dryRun && (await exists(backupRoot))) {
      console.log(`Previous orchestration files backed up to ${backupRoot}`);
    }
  } else {
    console.log("Chara's Toolkit routing was already current.");
  }
}

function runLegacy(legacyArgs = args) {
  const result = spawnSync(process.execPath, [legacyInstaller, ...legacyArgs], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const command = args[0] || "mission-control";
const marker = join(codexHome, ".codex-toolkit-managed.json");

async function assertNoSymlinks(paths) {
  for (const path of paths) {
    try {
      if ((await lstat(path)).isSymbolicLink()) throw Error("Enterprise install refuses symlink: " + path);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

async function preflightEnterpriseHome() {
  const paths = [codexHome, join(codexHome, "skills"), join(codexHome, "agents"),
    join(codexHome, "codex-toolkit"), join(codexHome, "AGENTS.md"), marker];
  const skillsPath = join(codexHome, "skills");
  if (await exists(skillsPath)) {
    for (const entry of await readdir(join(packageRoot, "skills"), { withFileTypes: true })) {
      if (entry.isDirectory()) paths.push(join(skillsPath, entry.name));
    }
  }
  for (const name of await readdir(join(packageRoot, "agents", "mission-control")))
    paths.push(join(codexHome, "agents", name));
  await assertNoSymlinks(paths);
  const agentsFile = join(codexHome, "AGENTS.md");
  if (await exists(agentsFile)) {
    const content = await readFile(agentsFile, "utf8");
    const starts = markerCount(content, managedStart), ends = markerCount(content, managedEnd);
    if (!((starts === 0 && ends === 0) || (starts === 1 && ends === 1))
      || (starts === 1 && content.indexOf(managedEnd) < content.indexOf(managedStart))) {
      throw Error("Enterprise install refuses malformed managed AGENTS.md markers");
    }
  }
}

function parseEnterpriseArgs() {
  const values = {}, opts = new Set(["--policy", "--signature", "--trusted-key", "--codex-home"]);
  const seen = new Set();
  for (let i = 1; i < args.length; i++) {
    const key = args[i];
    if (key === "--dry-run") {
      if (seen.has(key)) throw Error("Duplicate enterprise option: " + key);
      seen.add(key);
    } else if (opts.has(key)) {
      if (seen.has(key) || !args[i + 1] || args[i + 1].startsWith("--")) throw Error("Missing/duplicate enterprise option: " + key);
      seen.add(key);
      values[key] = args[++i];
    } else throw Error("Unsupported enterprise option: " + key);
  }
  for (const required of ["--policy", "--signature", "--trusted-key"])
    if (!values[required]) throw Error("Enterprise mode requires " + required);
  return values;
}

async function enterpriseCommand() {
  const options = parseEnterpriseArgs();
  const approval = await verifyBundleApproval({
    root: packageRoot, policyPath: options["--policy"], signaturePath: options["--signature"],
    trustedKeyPath: options["--trusted-key"],
  });
  await preflightEnterpriseHome();
  if (await exists(marker)) {
    const previous = JSON.parse(await readFile(marker, "utf8"));
    if (previous.trusted_key_sha256 !== approval.trusted_key_sha256) {
      throw Error("Trusted signing key changed; rotate it through endpoint management");
    }
  }
  if (await exists(join(codexHome, "codex-toolkit", "auto-update.json")))
    throw Error("Managed installation forbids scheduled auto-updates; disable existing updater explicitly first");
  if (command === "enterprise-check") {
    const state = JSON.parse(await readFile(marker, "utf8"));
    if (state.schema !== 1 || state.policy_sha256 !== approval.policy_sha256
      || state.bundle_sha256 !== approval.bundle_sha256 || state.trusted_key_sha256 !== approval.trusted_key_sha256)
      throw Error("Installed managed approval does not match supplied signed policy");
    const checked = await verifyInstalled({ root: packageRoot, codexHome });
    console.log("Managed installation verified: " + checked.skills + " skills, " + checked.roles + " roles");
    return;
  }
  const legacyArgs = ["setup", "--no-auto-update", "--codex-home", codexHome];
  if (dryRun) legacyArgs.push("--dry-run");
  runLegacy(legacyArgs);
  await installOrchestration();
  if (dryRun) {
    console.log("Enterprise dry-run: signed approval verified; no files changed");
    return;
  }
  const checked = await verifyInstalled({ root: packageRoot, codexHome });
  const stampState = { schema: 1, release: approval.release, revision: approval.revision,
    bundle_sha256: approval.bundle_sha256, policy_sha256: approval.policy_sha256,
    trusted_key_sha256: approval.trusted_key_sha256, installed_at: new Date().toISOString() };
  await backupFile(marker, ".codex-toolkit-managed.json");
  const temp = marker + ".tmp-" + process.pid;
  try {
    await writeFile(temp, JSON.stringify(stampState, null, 2) + "\n", { mode: 0o600, flag: "wx" });
    await rename(temp, marker);
  } finally {
    await rm(temp, { force: true });
  }
  console.log("Managed installation verified: " + checked.skills + " skills, " + checked.roles + " roles");
  console.log("Scheduled updates disabled; promotion requires a new signed approval");
}

if (command === "enterprise-setup" || command === "enterprise-check") {
  await enterpriseCommand();
} else {
  const managed = await exists(marker);
  const modifying = command === "setup"
    || (command === "mission-control" && args[1] !== "check")
    || (command === "auto-update" && args[1] !== "status");
  if (managed && modifying) {
    throw Error("This CODEX_HOME has a managed installation; use enterprise-setup with a signed approval");
  }
  runLegacy();

  if (command === "setup") {
    await installOrchestration();
    console.log("Start a fresh Codex task to load updated skills, agents, and routing instructions.");
  } else if (command === "auto-update" && args[1] === "remove") {
    await installOrchestration();
    console.log("Toolkit routing remains installed; only automatic updates were disabled.");
  }
}
