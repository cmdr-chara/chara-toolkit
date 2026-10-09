import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(script, args = [], env = {}) {
  return spawnSync(process.execPath, [join(root, script), ...args], {
    cwd: root,
    encoding: "utf8",
    timeout: 10000,
    env: { ...process.env, ...env },
  });
}

test("new public identity and CLI keep the legacy command available", async (t) => {
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
  assert.equal(pkg.name, "@cmdr-chara/charas-toolkit");
  assert.equal(pkg.bin.chara, "bin/toolkit.mjs");
  assert.equal(pkg.bin["codex-toolkit"], pkg.bin.chara);
  const result = run("bin/install.mjs", ["help"]);
  if (result.error?.code === "EPERM") {
    t.skip("nested Node execution is unavailable in this sandbox");
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Chara's Toolkit installer/);
  assert.match(result.stdout, /chara setup/);
  assert.match(result.stdout, /codex-toolkit remains a compatibility alias/);
});

test("README and generated artwork use the public brand", async () => {
  const readme = await readFile(join(root, "README.md"), "utf8");
  assert.match(readme, /^# Chara's Toolkit/m);
  assert.match(readme, /Better engineering, any agent\./);
  assert.match(readme, /Full toolkit/);
  assert.match(readme, /codex-toolkit.*compatibility alias/);
  assert.doesNotMatch(readme, /codex-toolkit-readme-hero/);
  assert.match(readme, /charas-toolkit-readme-hero/);
  assert.match(await readFile(join(root, ".github/render_social_preview.py"), "utf8"), /CHARA'S TOOLKIT/);
});

test("persistent managed markers and updater identities are not silently renamed", async () => {
  const installer = await readFile(join(root, "bin/install.mjs"), "utf8");
  const router = await readFile(join(root, "bin/toolkit.mjs"), "utf8");
  assert.match(installer, /const stateDirectoryName = "codex-toolkit"/);
  assert.match(installer, /const repository = "cmdr-chara\/codex-toolkit"/);
  assert.match(installer, /Codex Toolkit Auto Update/);
  assert.match(router, /codex-toolkit:start/);
  assert.match(router, /codex-toolkit.*workflows\.md/);
});

test("both CLI entrypoints show the same branded help without touching the real home", async (t) => {
  const isolatedHome = await mkdtemp(join(tmpdir(), "charas-toolkit-branding-"));
  const result = run("bin/toolkit.mjs", ["help"], { CODEX_HOME: isolatedHome });
  if (result.error?.code === "EPERM") {
    t.skip("nested Node execution is unavailable in this sandbox");
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Chara's Toolkit installer/);
});
