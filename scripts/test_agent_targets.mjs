// Agent-neutral setup: target resolution, per-agent skill folders, the Codex-only
// integration, and migration away from the deprecated $CODEX_HOME/skills.
// Every case runs against a temporary home; the real user home is never read.
import assert from "node:assert/strict";
import { copyFile, mkdir, mkdtemp, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { resolveTargets } from "../bin/agent-targets.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillCount = (await readdir(join(root, "skills"), { withFileTypes: true })).filter((entry) => entry.isDirectory()).length;

function toolkit(home, ...args) {
  return spawnSync(process.execPath, [join(root, "bin/toolkit.mjs"), ...args, "--home", home], {
    cwd: root,
    encoding: "utf8",
    timeout: 60000,
    env: { ...process.env, CODEX_HOME: "" },
  });
}

async function exists(path) {
  return stat(path).then(() => true, () => false);
}

async function freshHome(...agentDirs) {
  const home = await mkdtemp(join(tmpdir(), "charas-toolkit-agents-"));
  for (const dir of agentDirs) await mkdir(join(home, dir), { recursive: true });
  return home;
}

async function countSkills(skillsRoot) {
  return (await readdir(skillsRoot).catch(() => [])).length;
}

test("auto resolves the standard folder plus detected agents", async () => {
  const home = await freshHome(".claude", ".cursor", ".config/opencode");
  const { targets, codex } = await resolveTargets({ spec: "auto", home, codexHome: join(home, ".codex") });
  assert.deepEqual(targets.map((target) => target.id), ["agents", "claude-code", "cursor", "opencode"]);
  assert.equal(targets[0].skillsRoot, join(home, ".agents", "skills"));
  assert.equal(codex, false, "no Codex home and other agents present: no Codex integration");
});

test("auto keeps the Codex integration when Codex is present or nothing else is", async () => {
  const withCodex = await freshHome(".codex/sessions", ".claude");
  assert.equal((await resolveTargets({ home: withCodex, codexHome: join(withCodex, ".codex") })).codex, true);
  const onlyToolkitState = await freshHome(".codex/codex-toolkit", ".claude");
  assert.equal((await resolveTargets({ home: onlyToolkitState, codexHome: join(onlyToolkitState, ".codex") })).codex, false);
  const empty = await freshHome();
  assert.equal((await resolveTargets({ home: empty, codexHome: join(empty, ".codex") })).codex, true);
});

test("explicit lists, aliases, and unknown ids", async () => {
  const home = await freshHome();
  const codexHome = join(home, ".codex");
  const explicit = await resolveTargets({ spec: "claude-code,gemini-cli", home, codexHome });
  assert.deepEqual(explicit.targets.map((target) => target.id), ["claude-code", "gemini-cli"]);
  assert.equal(explicit.codex, false);
  const codex = await resolveTargets({ spec: "codex", home, codexHome });
  assert.deepEqual(codex.targets.map((target) => target.id), ["agents"]);
  assert.equal(codex.codex, true);
  await assert.rejects(resolveTargets({ spec: "vim", home, codexHome }), /unknown agent "vim"/);
});

test("setup installs every skill into each detected agent and skips Codex extras without Codex", async (t) => {
  const home = await freshHome(".claude", ".cursor");
  const result = toolkit(home, "setup", "--no-auto-update");
  if (result.error?.code === "EPERM") return t.skip("nested Node execution is unavailable in this sandbox");
  assert.equal(result.status, 0, result.stderr);
  for (const dir of [".agents/skills", ".claude/skills", ".cursor/skills"]) {
    assert.equal(await countSkills(join(home, dir)), skillCount, dir);
  }
  assert.equal(await exists(join(home, ".codex", "agents")), false);
  assert.equal(await exists(join(home, ".codex", "AGENTS.md")), false);

  const rerun = toolkit(home, "setup", "--no-auto-update");
  assert.equal(rerun.status, 0, rerun.stderr);
  assert.match(rerun.stdout, /Everything was already current/);
});

test("setup migrates toolkit skills out of the deprecated Codex folder and keeps user skills", async (t) => {
  const home = await freshHome(".codex/sessions");
  const legacy = join(home, ".codex", "skills");
  // A previous toolkit install: state file plus toolkit-named skill folders.
  await mkdir(join(home, ".codex", "codex-toolkit"), { recursive: true });
  await writeFile(join(home, ".codex", "codex-toolkit", "state.json"), '{"schema_version":1,"release":"v0.9.6"}\n');
  await mkdir(join(legacy, "bug-finder"), { recursive: true });
  await writeFile(join(legacy, "bug-finder", "SKILL.md"), "older toolkit copy\n");
  await mkdir(join(legacy, "my-own-skill"), { recursive: true });
  await writeFile(join(legacy, "my-own-skill", "SKILL.md"), "# mine\n");

  const result = toolkit(home, "setup", "--no-auto-update");
  if (result.error?.code === "EPERM") return t.skip("nested Node execution is unavailable in this sandbox");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Moved 1 toolkit skill/);
  assert.deepEqual(await readdir(legacy), ["my-own-skill"]);
  assert.equal(await countSkills(join(home, ".agents", "skills")), skillCount);
  assert.equal(await exists(join(home, ".codex", "AGENTS.md")), true, "Codex present: routing installed");
  assert.equal((await readdir(join(home, ".codex", "agents"))).length, 6);

  const check = toolkit(home, "mission-control", "check");
  assert.equal(check.status, 0, check.stdout + check.stderr);
});

test("a same-named skill the toolkit did not install is not migrated", async (t) => {
  const home = await freshHome(".codex/sessions");
  const legacy = join(home, ".codex", "skills");
  await mkdir(join(legacy, "bug-finder"), { recursive: true });
  await writeFile(join(legacy, "bug-finder", "SKILL.md"), "# a different bug-finder\n");
  const result = toolkit(home, "setup", "--no-auto-update");
  if (result.error?.code === "EPERM") return t.skip("nested Node execution is unavailable in this sandbox");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Left .*bug-finder untouched/);
  assert.equal(await readFile(join(legacy, "bug-finder", "SKILL.md"), "utf8"), "# a different bug-finder\n");
});

test("dry-run writes nothing and unknown agents are rejected", async (t) => {
  const home = await freshHome(".claude");
  const dry = toolkit(home, "setup", "--no-auto-update", "--dry-run");
  if (dry.error?.code === "EPERM") return t.skip("nested Node execution is unavailable in this sandbox");
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(await exists(join(home, ".agents")), false);
  assert.equal(await exists(join(home, ".claude", "skills")), false);

  const bad = toolkit(home, "setup", "--no-auto-update", "--agents", "notepad");
  assert.notEqual(bad.status, 0);
  assert.match(bad.stderr, /unknown agent "notepad"/);
});

test("scheduled updates pass the saved home and agents, and old configs still work", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "charas-toolkit-runner-"));
  const runner = join(directory, "update-runner.mjs");
  await copyFile(join(root, "scripts", "auto-update-runner.mjs"), runner);
  await writeFile(join(directory, "state.json"), '{"schema_version":1,"release":"v0.9.6"}\n');
  const commit = "0123456789abcdef0123456789abcdef01234567";
  const plan = (config) => {
    return writeFile(join(directory, "auto-update.json"), JSON.stringify(config)).then(() =>
      spawnSync(process.execPath, [runner, "--dry-run", "--tag", "v0.9.7", "--commit", commit], { encoding: "utf8" }));
  };
  const base = { schema_version: 1, repository: "cmdr-chara/codex-toolkit", codex_home: "/tmp/codex-home", npx_path: "/usr/bin/npx" };

  const current = await plan({ ...base, home: "/tmp/user-home", agents: "auto" });
  if (current.error?.code === "EPERM") return t.skip("nested Node execution is unavailable in this sandbox");
  assert.equal(current.status, 0, current.stderr);
  const { args } = JSON.parse(current.stdout);
  assert.deepEqual(args.slice(args.indexOf("--home"), args.indexOf("--home") + 2), ["--home", "/tmp/user-home"]);
  assert.deepEqual(args.slice(args.indexOf("--agents"), args.indexOf("--agents") + 2), ["--agents", "auto"]);

  const legacy = await plan(base);
  assert.equal(legacy.status, 0, legacy.stderr);
  const legacyArgs = JSON.parse(legacy.stdout).args;
  assert.ok(!legacyArgs.includes("--home") && !legacyArgs.includes("--agents"));
});
