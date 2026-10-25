// Runs every chara-lint fixture through a real Oxlint binary, one rule at a time.
// Set OXLINT_BIN to the oxlint executable, or install oxlint so that
// node_modules/.bin/oxlint exists at the repository root.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import cases from "./chara_lint_cases.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginEntry = join(root, "skills/typescript-quality-enforcer/assets/chara-lint/index.mjs");
const explicitBinary = process.env.OXLINT_BIN;
const oxlint = explicitBinary ?? join(root, "node_modules/.bin/oxlint");
const plugin = (await import(pluginEntry)).default;

test("the plugin exposes one documented rule per behavior", () => {
  assert.equal(plugin.meta.name, "chara-lint");
  assert.equal(Object.keys(plugin.rules).length, 15);
  for (const [name, rule] of Object.entries(plugin.rules)) {
    assert.ok(rule.meta?.docs?.description, `${name} has a description`);
    assert.ok(Object.keys(rule.meta.messages ?? {}).length > 0, `${name} has messages`);
    assert.ok(Array.isArray(rule.meta.schema), `${name} declares its options schema`);
    assert.ok(cases.some((item) => item.rule === name), `${name} has fixture cases`);
  }
});

// Lints all cases that share a rule and options in one Oxlint run.
async function lintGroup(group) {
  const directory = await mkdtemp(join(tmpdir(), "chara-lint-"));
  const ruleId = `chara-lint/${group[0].rule}`;
  const config = {
    plugins: [],
    categories: {},
    jsPlugins: [pluginEntry],
    rules: { [ruleId]: group[0].options ? ["error", group[0].options] : "error" },
  };
  await writeFile(join(directory, ".oxlintrc.json"), JSON.stringify(config));
  const files = [];
  for (const [index, item] of group.entries()) {
    const file = `case-${index}-${item.file ?? "sample.ts"}`;
    await mkdir(dirname(join(directory, file)), { recursive: true });
    await writeFile(join(directory, file), `${item.code}\n`);
    files.push(file);
  }
  const run = spawnSync(oxlint, ["-c", ".oxlintrc.json", "--format", "json", ...files], {
    cwd: directory,
    encoding: "utf8",
    timeout: 60000,
  });
  assert.ok(run.stdout, `oxlint produced no output: ${run.stderr || run.error}`);
  const { diagnostics } = JSON.parse(run.stdout);
  return group.map((item, index) => {
    const source = `${item.code}\n`;
    return diagnostics
      .filter((diagnostic) => diagnostic.filename === files[index] && diagnostic.code === `chara-lint(${item.rule})`)
      .map(({ labels: [{ span }] }) => Buffer.from(source).subarray(span.offset, span.offset + span.length).toString())
      .sort();
  });
}

const groups = new Map();
for (const item of cases) {
  const key = `${item.rule} ${JSON.stringify(item.options ?? null)}`;
  groups.set(key, [...(groups.get(key) ?? []), item]);
}

for (const [key, group] of groups) {
  test(`fixtures: ${key}`, async (t) => {
    if (!existsSync(oxlint)) {
      // An explicitly configured binary that is missing is a failure, not a skip.
      assert.ok(!explicitBinary, `OXLINT_BIN points to a missing file: ${oxlint}`);
      t.skip(`oxlint not found at ${oxlint}; set OXLINT_BIN to run the fixture suite`);
      return;
    }
    const results = await lintGroup(group);
    for (const [index, item] of group.entries()) {
      assert.deepEqual(results[index], [...item.report].sort(), `${item.rule}: ${item.code}`);
    }
  });
}
