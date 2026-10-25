// Mission Control on every agent: the neutral role cards, the generated native
// files for Codex, Claude Code, and Gemini CLI, and their installation.
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { loadRoles, renderAll } from "./build_mission_control.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const WRITE_TOOLS = { "claude-code": ["Edit", "Write", "Bash", "NotebookEdit"], "gemini-cli": ["write_file", "replace", "run_shell_command"] };

function frontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  assert.ok(match, "file starts with YAML frontmatter");
  return match[1];
}

test("the committed native role files match the role cards", async () => {
  for (const file of await renderAll()) {
    assert.equal(await readFile(join(root, file.path), "utf8"), file.content, `${file.path} is stale; run node scripts/build_mission_control.mjs`);
  }
});

test("every role card has a name, description, and an access rule its body states", async () => {
  const roles = await loadRoles();
  assert.equal(roles.length, 6);
  for (const role of roles) {
    const opening = role.access === "read-only" ? "Access: read-only." : "Access: write only inside";
    assert.ok(role.body.startsWith(opening), `${role.name} opens with its access rule`);
  }
});

test("read-only roles get a write-free tool allowlist; writers inherit tools", async () => {
  for (const role of await loadRoles()) {
    for (const agent of ["claude-code", "gemini-cli"]) {
      const meta = frontmatter(await readFile(join(root, "agents", agent, `${role.name}.md`), "utf8"));
      assert.match(meta, new RegExp(`^name: ${role.name}$`, "m"));
      assert.match(meta, /^description: ".+"$/m);
      const hasAllowlist = /^tools:/m.test(meta);
      assert.equal(hasAllowlist, role.access === "read-only", `${agent}/${role.name} allowlist matches access`);
      for (const tool of WRITE_TOOLS[agent]) {
        assert.ok(!new RegExp(`\\b${tool}\\b`).test(meta), `${agent}/${role.name} does not grant ${tool}`);
      }
    }
    const toml = await readFile(join(root, "agents", "mission-control", `${role.name}.toml`), "utf8");
    assert.doesNotMatch(toml, /^(sandbox_mode|model|model_reasoning_effort)\s*=/m, "Codex roles inherit sandbox and model");
  }
});

test("setup ships role cards to every agent and native roles where supported", async (t) => {
  const home = await mkdtemp(join(tmpdir(), "charas-toolkit-mission-"));
  for (const dir of [".claude", ".gemini", ".cursor"]) await mkdir(join(home, dir));
  const result = spawnSync(process.execPath, [join(root, "bin/toolkit.mjs"), "setup", "--no-auto-update", "--home", home], {
    encoding: "utf8",
    timeout: 60000,
    env: { ...process.env, CODEX_HOME: "" },
  });
  if (result.error?.code === "EPERM") return t.skip("nested Node execution is unavailable in this sandbox");
  assert.equal(result.status, 0, result.stderr);
  // Universal layer: the cards travel with the skill, so Cursor gets them too.
  for (const skills of [".agents/skills", ".cursor/skills", ".claude/skills"]) {
    const cards = await readdir(join(home, skills, "delegate-with-mission-cards", "references", "roles"));
    assert.equal(cards.length, 6, skills);
  }
  // Native layer: only agents with a documented subagent format.
  assert.equal((await readdir(join(home, ".claude", "agents"))).length, 6);
  assert.equal((await readdir(join(home, ".gemini", "agents"))).length, 6);
  await assert.rejects(readdir(join(home, ".cursor", "agents")), { code: "ENOENT" });
});
