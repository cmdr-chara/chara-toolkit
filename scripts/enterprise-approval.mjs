import { createHash, createPublicKey, verify } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const ROOTS = ['agents', 'bin', 'orchestration', 'scripts', 'skills', 'package.json'];
const SHA = /^[a-f0-9]{40}$/;
const DIGEST = /^[a-f0-9]{64}$/;
const RELEASE = /^v\d+\.\d+\.\d+$/;
const POLICY_KEYS = ['bundle_sha256', 'expires_at', 'release', 'repository', 'revision', 'schema'];

async function filesUnder(root, subpath) {
  const path = join(root, subpath);
  const info = await lstat(path);
  if (info.isSymbolicLink()) throw Error('Refusing symbolic link: ' + subpath);
  if (info.isFile()) return [subpath];
  if (!info.isDirectory()) throw Error('Refusing non-file: ' + subpath);
  const names = (await readdir(path)).sort();
  const files = [];
  for (const name of names) files.push(...await filesUnder(root, join(subpath, name)));
  return files;
}

export async function digestPaths(root, paths = ROOTS) {
  const hash = createHash('sha256');
  const all = [];
  for (const path of paths) all.push(...await filesUnder(root, path));
  all.sort();
  for (const path of all) {
    hash.update(path.replaceAll('\\', '/'));
    hash.update('\0');
    hash.update(await readFile(join(root, path)));
    hash.update('\0');
  }
  return hash.digest('hex');
}

export async function verifyBundleApproval({ root, policyPath, signaturePath, trustedKeyPath }) {
  if (!policyPath || !signaturePath || !trustedKeyPath) throw Error('Policy, detached signature, and external trusted key are required');
  const [policyBytes, signature, keyBytes] = await Promise.all([
    readFile(policyPath), readFile(signaturePath), readFile(trustedKeyPath),
  ]);
  const key = createPublicKey(keyBytes);
  if (key.asymmetricKeyType !== 'ed25519' || signature.length !== 64) throw Error('Expected Ed25519 key and detached 64-byte signature');
  if (!verify(null, policyBytes, key, signature)) throw Error('Policy signature verification failed');
  const policy = JSON.parse(policyBytes.toString('utf8'));
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)
    || Object.keys(policy).sort().join(',') !== POLICY_KEYS.join(',') || policy.schema !== 1
    || policy.repository !== 'cmdr-chara/codex-toolkit'
    || !RELEASE.test(policy.release) || !SHA.test(policy.revision)
    || !DIGEST.test(policy.bundle_sha256)
    || typeof policy.expires_at !== 'string'
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(policy.expires_at)
    || !Number.isFinite(Date.parse(policy.expires_at))) throw Error('Unsupported enterprise approval policy');
  if (Date.parse(policy.expires_at) <= Date.now()) throw Error('Enterprise approval expired');
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  if (pkg.name !== '@cmdr-chara/codex-toolkit' || policy.release !== 'v' + pkg.version)
    throw Error('Approved release does not match package metadata');
  const actual = await digestPaths(root);
  if (actual !== policy.bundle_sha256) throw Error('Package does not match approved bundle digest');
  return { ...policy, policy_sha256: createHash('sha256').update(policyBytes).digest('hex'),
    trusted_key_sha256: createHash('sha256').update(key.export({ type: 'spki', format: 'der' })).digest('hex') };
}

export async function verifyInstalled({ root, codexHome }) {
  const names = (await readdir(join(root, 'skills'), { withFileTypes: true }))
    .filter((x) => x.isDirectory()).map((x) => x.name).sort();
  let skills = 0;
  for (const name of names) {
    const path = join(root, 'skills', name, 'SKILL.md');
    try { await lstat(path); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    const original = await digestPaths(root, ['skills/' + name]);
    const installed = await digestPaths(codexHome, ['skills/' + name]);
    if (installed !== original) throw Error('Installed skill differs: ' + name);
    skills++;
  }
  const roles = (await readdir(join(root, 'agents', 'mission-control'))).sort();
  for (const name of roles) {
    const a = await readFile(join(root, 'agents', 'mission-control', name));
    const b = await readFile(join(codexHome, 'agents', name));
    if (!a.equals(b)) throw Error('Installed role differs: ' + name);
  }
  const from = (await readFile(join(root, 'orchestration', 'managed-agents.md'), 'utf8')).trim();
  const target = await readFile(join(codexHome, 'AGENTS.md'), 'utf8');
  const start = '<!-- codex-toolkit:start -->', end = '<!-- codex-toolkit:end -->';
  if (target.split(start).length !== 2 || target.split(end).length !== 2
    || target.indexOf(start) > target.indexOf(end)
    || target.slice(target.indexOf(start) + start.length, target.indexOf(end)).trim() !== from)
    throw Error('Installed managed routing differs');
  const wf = await readFile(join(root, 'orchestration', 'workflows.md'));
  const installedWf = await readFile(join(codexHome, 'codex-toolkit', 'workflows.md'));
  if (!wf.equals(installedWf)) throw Error('Installed workflow catalog differs');
  return { skills, roles: roles.length };
}
