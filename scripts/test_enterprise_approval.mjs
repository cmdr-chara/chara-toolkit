import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { digestPaths, verifyBundleApproval, verifyInstalled } from './enterprise-approval.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const toolkit = join(root, 'bin', 'toolkit.mjs');

async function fixture(t, modifications = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'codex-managed-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const policy = { schema: 1, repository: 'cmdr-chara/codex-toolkit',
    release: 'v' + pkg.version, revision: 'a'.repeat(40),
    bundle_sha256: await digestPaths(root),
    expires_at: '2099-01-01T00:00:00Z', ...modifications };
  const policyPath = join(directory, 'approval.json');
  const signaturePath = join(directory, 'approval.sig');
  const trustedKeyPath = join(directory, 'trusted.pem');
  const raw = Buffer.from(JSON.stringify(policy));
  await writeFile(policyPath, raw);
  await writeFile(signaturePath, sign(null, raw, privateKey));
  await writeFile(trustedKeyPath, publicKey.export({ type: 'spki', format: 'pem' }));
  const args = ['--policy', policyPath, '--signature', signaturePath, '--trusted-key', trustedKeyPath];
  const home = join(directory, 'codex-home');
  return { policy, directory, home, args, policyPath, signaturePath, trustedKeyPath };
}

function run(command, f, extra = []) {
  return spawnSync(process.execPath, [toolkit, command, ...f.args, '--codex-home', f.home, ...extra],
    { encoding: 'utf8', timeout: 40000 });
}

test('signed approvals reject tampering, expiry, and malformed metadata', async (t) => {
  const f = await fixture(t);
  assert.equal((await verifyBundleApproval({ root, policyPath: f.policyPath, signaturePath: f.signaturePath, trustedKeyPath: f.trustedKeyPath })).revision, f.policy.revision);
  await writeFile(f.policyPath, JSON.stringify({ ...f.policy, bundle_sha256: '0'.repeat(64) }));
  await assert.rejects(verifyBundleApproval({ root, policyPath: f.policyPath, signaturePath: f.signaturePath, trustedKeyPath: f.trustedKeyPath }), /signature/);
  const stale = await fixture(t, { expires_at: '2020-01-01T00:00:00Z' });
  await assert.rejects(verifyBundleApproval({ root, policyPath: stale.policyPath, signaturePath: stale.signaturePath, trustedKeyPath: stale.trustedKeyPath }), /expired/);
  const wrong = await fixture(t, { bundle_sha256: '0'.repeat(64) });
  await assert.rejects(verifyBundleApproval({ root, policyPath: wrong.policyPath, signaturePath: wrong.signaturePath, trustedKeyPath: wrong.trustedKeyPath }), /bundle digest/);
});

test('managed install is signed, update-disabled, verifiable, and resistant to regular setup', async (t) => {
  const f = await fixture(t);
  await mkdir(f.home);
  await writeFile(join(f.home, 'AGENTS.md'), '# Existing user instructions\n\nKeep the original rule.\n');
  let result = run('enterprise-setup', f, ['--dry-run']);
  assert.equal(result.status, 0, result.stderr);
  await assert.rejects(readFile(join(f.home, '.codex-toolkit-managed.json')), { code: 'ENOENT' });
  result = run('enterprise-setup', f);
  assert.equal(result.status, 0, result.stderr);
  assert.match(await readFile(join(f.home, 'AGENTS.md'), 'utf8'), /Keep the original rule/);
  assert.equal((await verifyInstalled({ root, codexHome: f.home })).skills, 22);
  result = run('enterprise-check', f);
  assert.equal(result.status, 0, result.stderr);
  const unauthorized = spawnSync(process.execPath, [toolkit, 'setup', '--no-auto-update',
    '--codex-home', f.home], { encoding: 'utf8' });
  assert.notEqual(unauthorized.status, 0);
  assert.match(unauthorized.stderr, /managed installation/);
  const marker = JSON.parse(await readFile(join(f.home, '.codex-toolkit-managed.json')));
  assert.equal(marker.policy_sha256.length, 64);
  assert.equal(marker.release, f.policy.release);
  await writeFile(join(f.home, 'skills', 'security-review', 'SKILL.md'), 'corrupt');
  result = run('enterprise-check', f);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Installed skill differs/);
  result = run('enterprise-setup', f);
  assert.equal(result.status, 0, result.stderr);
  result = run('enterprise-check', f);
  assert.equal(result.status, 0, result.stderr);
});

test('managed install refuses active updater, incomplete markers, and arbitrary options', async (t) => {
  const f = await fixture(t);
  await mkdir(join(f.home, 'codex-toolkit'), { recursive: true });
  await writeFile(join(f.home, 'codex-toolkit', 'auto-update.json'), '{}');
  let result = run('enterprise-setup', f);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /auto-updates/);
  await rm(join(f.home, 'codex-toolkit', 'auto-update.json'));
  await writeFile(join(f.home, 'AGENTS.md'), '<!-- codex-toolkit:start --> broken');
  result = run('enterprise-setup', f);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /malformed/);
  await rm(join(f.home, 'AGENTS.md'));
  result = run('enterprise-setup', f, ['--scheduled']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unsupported enterprise option/);
});
