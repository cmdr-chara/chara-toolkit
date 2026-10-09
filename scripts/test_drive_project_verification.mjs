import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { runProfile } from './drive-project-verification.mjs';

const script = fileURLToPath(new URL('./drive-project-verification.mjs', import.meta.url));
const make = (root, expected) => ({
  schema: 1, app: { id: 'demo-app', name: 'Demo app' },
  launch: { argv: [process.execPath, 'server.mjs'] },
  doctor: { argv: [process.execPath, 'doctor.mjs'] },
  features: [{ id: 'user-flow', title: 'User feature', entry: 'Local test API',
    sources: ['driver.mjs'], drive: { argv: [process.execPath, 'driver.mjs'] },
    expected }],
});

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'project-driving-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'server.mjs'), [
    "import {writeFileSync} from 'node:fs';",
    "writeFileSync('ready.flag','started');",
    "setInterval(() => {}, 1000);",
  ].join('\n'));
  await writeFile(join(root, 'doctor.mjs'), [
    "import {existsSync} from 'node:fs';",
    "if (!existsSync('ready.flag')) process.exit(1);",
  ].join('\n'));
  await writeFile(join(root, 'driver.mjs'), [
    "import {readFileSync,existsSync} from 'node:fs';",
    "if (!existsSync('ready.flag') || readFileSync('ready.flag','utf8') !== 'started') process.exit(1);",
  ].join('\n'));
  return root;
}

test('drive real launched process and health-checked user feature', async t => {
  const root = await fixture(t);
  const plan = make(root, 'Health check and feature succeeded');
  await writeFile(join(root, 'verification-profile.json'), JSON.stringify(plan));
  const report = await runProfile(plan, root, { timeoutMs: 8000 });
  assert.equal(report.status, 'CHECKS_PASSED');
  assert.equal(report.features[0].exit_code, 0);
  const cli = spawnSync(process.execPath, [script, '--workspace', root, '--manifest',
    'verification-profile.json', '--acknowledge-live-execution'], { encoding: 'utf8', timeout: 20000 });
  assert.equal(cli.status, 0, cli.stderr);
  assert.equal(JSON.parse(cli.stdout).status, 'CHECKS_PASSED');
  assert.equal((await readFile(join(root, 'ready.flag'), 'utf8')), 'started');
});

test('does not accept a cleanly exited launch with stale readiness', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'server.mjs'), [
    "import {writeFileSync} from 'node:fs';",
    "writeFileSync('ready.flag','started');",
  ].join('\n'));
  const plan = make(root, 'Must not pass');
  await assert.rejects(runProfile(plan, root), /exited before readiness/);
});

test('failed feature, missing approval, and dangerous command cannot be passed', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'driver.mjs'), 'process.exit(3);');
  const plan = make(root, 'Should fail');
  await writeFile(join(root, 'verification-profile.json'), JSON.stringify(plan));
  const result = await runProfile(plan, root, { timeoutMs: 8000 });
  assert.equal(result.status, 'CHECKS_FAILED');
  const refused = spawnSync(process.execPath, [script, '--workspace', root,
    '--manifest', 'verification-profile.json'], { encoding: 'utf8' });
  assert.equal(refused.status, 2);
  await assert.rejects(runProfile({ ...plan, launch: { argv: ['rm', '-rf', '/'] } }, root),
    /Unsafe launch command/);
});
