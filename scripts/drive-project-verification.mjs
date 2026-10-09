#!/usr/bin/env node
/**
 * Explicitly opt-in execution of a source-grounded project verification profile.
 * Launches only the configured test process, checks readiness, drives each test,
 * and terminates the process it started. This is NOT a sandbox.
 */
import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { readFile, realpath } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProfile } from './project-verification.mjs';
import { classifyDestructiveCommand } from './guard-destructive-command.mjs';

const within = (root, candidate) => {
  const r = relative(root, candidate);
  return r === '' || (r !== '..' && !r.startsWith('..' + sep) && !isAbsolute(r));
};
const hash = x => createHash('sha256').update(x).digest('hex');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function runStep(argv, cwd, timeoutMs) {
  const unsafe = classifyDestructiveCommand(argv.join(' '));
  if (unsafe) throw Error('Verification command requires separate approval: ' + unsafe);
  const result = spawnSync(argv[0], argv.slice(1), {
    cwd, shell: false, encoding: 'utf8', timeout: timeoutMs,
    maxBuffer: 2 * 1024 * 1024, env: { ...process.env, CODEX_TOOLKIT_VERIFY: '1' },
  });
  return { success: result.status === 0 && !result.error,
    exit_code: result.status ?? -1, error: result.error?.code || null,
    output_sha256: hash((result.stdout || '') + (result.stderr || '')) };
}

export async function runProfile(profile, cwd, { featureId, timeoutMs = 15000 } = {}) {
  validateProfile(profile);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 120000) throw Error('Invalid timeout');
  const features = featureId ? profile.features.filter(f => f.id === featureId) : profile.features;
  if (!features.length) throw Error('Unknown feature');
  const unsafeLaunch = classifyDestructiveCommand(profile.launch.argv.join(' '));
  if (unsafeLaunch) throw Error('Unsafe launch command: ' + unsafeLaunch);
  const child = spawn(profile.launch.argv[0], profile.launch.argv.slice(1), {
    cwd, shell: false, stdio: 'ignore',
    env: { ...process.env, CODEX_TOOLKIT_VERIFY: '1' },
  });
  let launchError = null;
  child.on('error', error => { launchError = error; });
  const report = { status: 'INCOMPLETE', app: profile.app.id, features: [], doctor: null };
  try {
    let ready = false;
    for (let attempt = 0; attempt < 8; attempt++) {
      await sleep(120);
      if (launchError) throw launchError;
      if (child.exitCode !== null || child.signalCode !== null)
        throw Error('Test application exited before readiness');
      report.doctor = runStep(profile.doctor.argv, cwd, timeoutMs);
      if (report.doctor.success) { ready = true; break; }
    }
    if (!ready) throw Error('Health check did not confirm a ready test instance');
    for (const feature of features) {
      const step = runStep(feature.drive.argv, cwd, timeoutMs);
      report.features.push({ id: feature.id, ...step,
        expected: feature.expected });
      if (!step.success) break;
    }
    report.status = report.features.length === features.length
      && report.features.every(f => f.success) ? 'CHECKS_PASSED' : 'CHECKS_FAILED';
    return report;
  } finally {
    // Terminate only the direct child process that this run started. Child
    // processes spawned by that program may require project-specific teardown.
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise(resolve => child.once('exit', resolve));
      child.kill('SIGTERM');
      await Promise.race([exited, sleep(1500)]);
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    }
  }
}

async function main(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === '--acknowledge-live-execution') opts.ack = true;
    else if (['--workspace', '--manifest', '--feature', '--timeout-ms'].includes(key) && argv[i + 1])
      opts[key] = argv[++i];
    else throw Error('Unknown or incomplete option: ' + key);
  }
  if (!opts.ack) throw Error('Requires --acknowledge-live-execution and an OS-isolated test environment');
  if (!opts['--workspace'] || !opts['--manifest']) throw Error('Workspace and manifest required');
  const cwd = await realpath(resolve(opts['--workspace']));
  const home = await realpath(homedir()).catch(() => resolve(homedir()));
  if (cwd === home || within(cwd, home)) throw Error('Refusing home directory or its parent as test workspace');
  const manifest = await realpath(resolve(cwd, opts['--manifest']));
  if (!within(cwd, manifest)) throw Error('Manifest escapes test workspace');
  const profile = validateProfile(JSON.parse(await readFile(manifest, 'utf8')));
  const report = await runProfile(profile, cwd, {
    featureId: opts['--feature'],
    timeoutMs: opts['--timeout-ms'] === undefined ? 15000 : Number(opts['--timeout-ms']),
  });
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'CHECKS_PASSED') process.exitCode = 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main(process.argv.slice(2)).catch(e => {
    console.error('Project verification execution: ' + e.message);
    process.exitCode = 2;
  });
