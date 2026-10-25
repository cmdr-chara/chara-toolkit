import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function setup(home) {
  return spawnSync(
    process.execPath,
    [join(root, "bin/toolkit.mjs"), "setup", "--no-auto-update", "--home", home, "--agents", "codex"],
    { cwd: root, encoding: "utf8", timeout: 30000, env: { ...process.env, CODEX_HOME: "" } },
  );
}

async function writeSkill(skillsRoot, name, files) {
  for (const [relative, text] of Object.entries(files)) {
    const path = join(skillsRoot, name, relative);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, text);
  }
}

async function backedUp(codexHome, name) {
  const found = [];
  const backups = join(codexHome, "backups");
  for (const run of await readdir(backups).catch(() => [])) {
    for (const target of await readdir(join(backups, run, "skills")).catch(() => [])) {
      if ((await readdir(join(backups, run, "skills", target)).catch(() => [])).includes(name)) found.push(target);
    }
  }
  return found.sort();
}

const managedUnlazy = {
  "SKILL.md": "---\nname: unlazy\n---\n",
  "references/upstream-provenance.md": "Chara's Toolkit adapts the following ideas.\n",
};

test("setup retires a toolkit-managed unlazy copy from new and legacy skill folders", async (t) => {
  const home = await mkdtemp(join(tmpdir(), "charas-toolkit-retire-"));
  const codexHome = join(home, ".codex");
  await writeSkill(join(home, ".agents", "skills"), "unlazy", managedUnlazy);
  await writeSkill(join(codexHome, "skills"), "unlazy", managedUnlazy);
  const result = setup(home);
  if (result.error?.code === "EPERM") {
    t.skip("nested Node execution is unavailable in this sandbox");
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Retired unlazy .*replaced by completion-proof/);
  const installed = await readdir(join(home, ".agents", "skills"));
  assert.ok(!installed.includes("unlazy"));
  assert.ok(installed.includes("completion-proof"));
  assert.deepEqual(await backedUp(codexHome, "unlazy"), ["agents", "codex-legacy"]);

  const rerun = setup(home);
  assert.equal(rerun.status, 0, rerun.stderr);
  assert.doesNotMatch(rerun.stdout, /Retired unlazy/);
});

test("setup leaves a user-owned skill named unlazy untouched", async (t) => {
  const home = await mkdtemp(join(tmpdir(), "charas-toolkit-retire-user-"));
  await writeSkill(join(home, ".agents", "skills"), "unlazy", { "SKILL.md": "# my own skill\n" });
  const result = setup(home);
  if (result.error?.code === "EPERM") {
    t.skip("nested Node execution is unavailable in this sandbox");
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Left .* untouched/);
  assert.equal(await readFile(join(home, ".agents", "skills", "unlazy", "SKILL.md"), "utf8"), "# my own skill\n");
  assert.deepEqual(await backedUp(join(home, ".codex"), "unlazy"), []);
});
