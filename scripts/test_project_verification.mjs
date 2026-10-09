import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validateProfile, renderProfile } from './project-verification.mjs';

const script = fileURLToPath(new URL('./project-verification.mjs', import.meta.url));
const profile = {
  schema: 1, app: { id: 'billing-app', name: 'Billing app' },
  launch: { argv: ['node', 'scripts/start-test-server.mjs'] },
  doctor: { argv: ['node', 'scripts/healthcheck.mjs'] },
  features: [
    { id: 'purchase', title: 'Complete purchase', entry: 'Checkout route with a test account',
      drive: { argv: ['node', 'tests/checkout-smoke.mjs'] }, sources: ['routes/checkout.mjs'], expected: 'Payment persisted and confirmation visible' },
    { id: 'cancel', title: 'Cancel payment', entry: 'Purchase details page',
      drive: { argv: ['node', 'tests/cancel-smoke.mjs'] }, sources: ['routes/cancel.mjs'], expected: 'Cancellation visible and durable' },
  ],
};
function run(home, action, extra = []) {
  return spawnSync(process.execPath, [script, action, '--workspace', home,
    '--manifest', 'verification-profile.json', '--out', '.agents/skills/verify-billing-app', ...extra],
  { encoding: 'utf8', timeout: 15000 });
}
test('generator validates grounded feature recipes, not placeholder IDs', () => {
  assert.equal(validateProfile(profile).features.length, 2);
  assert.equal(renderProfile(profile).size, 5);
  assert.throws(() => validateProfile({ ...profile, features: [profile.features[0], profile.features[0]] }), /duplicate/);
  assert.throws(() => validateProfile({ ...profile, launch: { argv: [] } }), /Invalid verification/);
  assert.throws(() => validateProfile({ ...profile, features: [{ ...profile.features[0], title: 'Unsafe\n# injected' }] }), /Invalid or duplicate/);
});

test('generate is opt-in and checks feature map drift without changes', async t => {
  const home = await mkdtemp(join(tmpdir(), 'toolkit-verify-project-'));
  t.after(() => rm(home, { force: true, recursive: true }));
  await writeFile(join(home, 'verification-profile.json'), JSON.stringify(profile));
  await mkdir(join(home, 'routes'));
  await writeFile(join(home, 'routes', 'checkout.mjs'), 'export const checkout = true;');
  await writeFile(join(home, 'routes', 'cancel.mjs'), 'export const cancel = true;');
  let result = run(home, 'generate');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Preview/);
  result = run(home, 'check');
  assert.notEqual(result.status, 0, 'preview cannot create files');
  result = run(home, 'generate', ['--write']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(await readFile(join(home, '.agents', 'skills', 'verify-billing-app', 'features', 'purchase.md'), 'utf8'), /checkout-smoke/);
  assert.equal(run(home, 'check').status, 0);
  await writeFile(join(home, 'routes', 'checkout.mjs'), 'export const checkout = false;');
  assert.match(run(home, 'check').stderr, /drift/);
  await writeFile(join(home, 'routes', 'checkout.mjs'), 'export const checkout = true;');
  assert.equal(run(home, 'check').status, 0);
  assert.notEqual(run(home, 'generate', ['--write']).status, 0, 'do not overwrite existing user files');
  await writeFile(join(home, '.agents', 'skills', 'verify-billing-app', 'features', 'purchase.md'), 'drift');
  const stale = run(home, 'check');
  assert.notEqual(stale.status, 0);
  assert.match(stale.stderr, /drift/);
});
test('symlink outputs and out-of-workspace paths fail closed', async t => {
  const home = await mkdtemp(join(tmpdir(), 'toolkit-verification-links-'));
  t.after(() => rm(home, { recursive: true, force: true }));
  await writeFile(join(home, 'verification-profile.json'), JSON.stringify(profile));
  let result = spawnSync(process.execPath, [script, 'generate',
    '--workspace', home, '--manifest', '../outside.json',
    '--out', '.agents/skills/verify-billing-app'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Manifest must be within/);
  await mkdir(join(home, '.agents'));
  try {
    await symlink(home, join(home, '.agents', 'skills'), process.platform === 'win32' ? 'junction' : 'dir');
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) return;
    throw error;
  }
  result = run(home, 'generate', ['--write']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Symlink/);
});
