import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('new public identity and CLI keep the legacy command available', async () => {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.name, '@cmdr-chara/charas-toolkit');
  assert.equal(pkg.bin.chara, 'bin/toolkit.mjs');
  assert.equal(pkg.bin['codex-toolkit'], pkg.bin.chara);
  const result = spawnSync(process.execPath, [join(root, pkg.bin.chara), 'help'], {
    encoding: 'utf8', timeout: 10000
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Chara's Toolkit installer/);
  assert.match(result.stdout, /--no-auto-update/);
  assert.match(result.stdout, /chara setup/);
});

test('README states the real portable/host integration boundary', async () => {
  const readme = await readFile(join(root, 'README.md'), 'utf8');
  assert.match(readme, /^# Chara's Toolkit/m);
  assert.match(readme, /Better engineering, any agent\./);
  assert.match(readme, /Codex \(fully integrated\)/);
  assert.match(readme, /codex-toolkit.*compatibility alias/);
  assert.doesNotMatch(readme, /<img[^>]+codex-toolkit-readme-hero/);
});

test('persistent managed markers and updater identities are not silently renamed', async () => {
  const installer = await readFile(join(root, 'bin/install.mjs'), 'utf8');
  const router = await readFile(join(root, 'bin/toolkit.mjs'), 'utf8');
  assert.match(installer, /const stateDirectoryName = "codex-toolkit"/);
  assert.match(installer, /const repository = "cmdr-chara\/codex-toolkit"/);
  assert.match(installer, /Codex Toolkit Auto Update/);
  assert.match(router, /codex-toolkit:start/);
  assert.match(router, /\.codex-toolkit-managed\.json/);
});
