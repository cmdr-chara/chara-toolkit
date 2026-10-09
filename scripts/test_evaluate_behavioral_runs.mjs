import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { chmod, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { grade, parseEvents, validateSuite } from './evaluate_behavioral_runs.mjs';

const script = fileURLToPath(new URL('./evaluate_behavioral_runs.mjs', import.meta.url));
const sha = (v) => createHash('sha256').update(v).digest('hex');
const spec = { id: 'release-check', skill: 'verification-and-release',
  prompt: 'A release passed on an old revision; the new revision is untested. Is it safe?',
  checks: [{ kind: 'final_contains', value: 'BLOCKED' }, { kind: 'max_file_changes', value: 0 }] };
const jsonl = (text, finish = true, change = false) => [
  { type: 'thread.started' },
  ...(change ? [{ type: 'item.completed', item: { type: 'file_change' } }] : []),
  { type: 'item.completed', item: { type: 'agent_message', text } },
  ...(finish ? [{ type: 'turn.completed' }] : []),
].map((e) => JSON.stringify(e)).join('\n') + '\n';

test('completion, exit state, and changes affect grade', () => {
  assert.equal(grade(spec, parseEvents(jsonl('BLOCKED')), 0).pass, true);
  assert.equal(grade(spec, parseEvents(jsonl('BLOCKED', false)), 0).pass, false);
  assert.equal(grade(spec, parseEvents(jsonl('BLOCKED')), 1).pass, false);
  assert.equal(grade(spec, parseEvents(jsonl('BLOCKED', true, true)), 0).pass, false);
  assert.equal(grade(spec, parseEvents(jsonl('READY')), 0).pass, false);
});
test('suite and event parser fail closed', () => {
  assert.throws(() => parseEvents('{not-json}'), /Invalid trace/);
  assert.throws(() => parseEvents('{}'), /Missing trace event type/);
  assert.throws(() => validateSuite({ schema: 1, cases: [spec, spec] }), /duplicate/);
  assert.throws(() => validateSuite({ schema: 1, cases: [{ ...spec, checks: [{ kind: 'arbitrary' }] }] }), /Unknown check/);
});
test('paired scoring detects improvement and regression', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'toolkit-eval-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const raw = JSON.stringify({ schema: 1, cases: [spec] });
  await writeFile(join(dir, 'suite.json'), raw);
  const runs = ['baseline', 'candidate'].map((arm) => ({ case_id: spec.id, arm, trace: arm + '.jsonl',
    exit_code: 0, model: 'test', runtime: 'codex-test', prompt_sha256: sha(spec.prompt) }));
  const path = join(dir, 'records.json');
  await writeFile(path, JSON.stringify({ schema: 1, suite_sha256: sha(raw), runs }));
  const run = () => spawnSync(process.execPath, [script, '--suite', join(dir, 'suite.json'), '--records', path, '--json'], { encoding: 'utf8' });
  await writeFile(join(dir, 'baseline.jsonl'), jsonl('READY'));
  await writeFile(join(dir, 'candidate.jsonl'), jsonl('BLOCKED'));
  let result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).summary.improved, 1);
  await writeFile(join(dir, 'baseline.jsonl'), jsonl('BLOCKED'));
  await writeFile(join(dir, 'candidate.jsonl'), jsonl('READY'));
  result = run();
  assert.equal(result.status, 1, result.stderr);
  assert.equal(JSON.parse(result.stdout).summary.regressed, 1);
  runs[1].prompt_sha256 = '0'.repeat(64);
  await writeFile(path, JSON.stringify({ schema: 1, suite_sha256: sha(raw), runs }));
  result = run();
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Incomparable/);
});
test('trace traversal and non-isolated homes are rejected', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'toolkit-eval-safety-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const raw = JSON.stringify({ schema: 1, cases: [spec] });
  await writeFile(join(dir, 'suite.json'), raw);
  await writeFile(join(dir, 'base.jsonl'), jsonl('BLOCKED'));
  const runs = ['baseline', 'candidate'].map((arm) => ({ case_id: spec.id, arm,
    trace: arm === 'baseline' ? 'base.jsonl' : '../outside.jsonl', exit_code: 0,
    model: 'test', runtime: 'codex-test', prompt_sha256: sha(spec.prompt) }));
  await writeFile(join(dir, 'records.json'), JSON.stringify({ schema: 1, suite_sha256: sha(raw), runs }));
  let result = spawnSync(process.execPath, [script, '--suite', join(dir, 'suite.json'), '--records', join(dir, 'records.json')], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /escapes records/);
  result = spawnSync(process.execPath, [script, '--suite', join(dir, 'suite.json'),
    '--capture', '--acknowledge-live-cost', '--model', 'test', '--baseline-home', dir, '--candidate-home', dir],
    { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /must be different/);
});
test('capture only requests fresh read-only Codex sessions', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'toolkit-eval-capture-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const raw = JSON.stringify({ schema: 1, cases: [spec] });
  await writeFile(join(dir, 'suite.json'), raw);
  for (const home of ['baseline', 'candidate']) await mkdir(join(dir, home));
  const fake = join(dir, 'fake-codex.mjs');
  const program = [
    '#!/usr/bin/env node',
    "if (process.argv.includes('--version')) { console.log('codex-test'); process.exit(0); }",
    "if (!process.argv.includes('--ephemeral') || !process.argv.includes('read-only') || !process.argv.includes('--json')) process.exit(4);",
    "console.log(JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'BLOCKED' } }));",
    "console.log(JSON.stringify({ type: 'turn.completed' }));",
  ].join('\n') + '\n';
  await writeFile(fake, program);
  await chmod(fake, 0o755);
  const result = spawnSync(process.execPath, [script, '--capture', '--acknowledge-live-cost',
    '--suite', join(dir, 'suite.json'), '--model', 'test', '--baseline-home', join(dir, 'baseline'),
    '--candidate-home', join(dir, 'candidate'), '--out', join(dir, 'result'),
    '--codex-bin', fake, '--json'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).summary.candidate_pass, 1);
});
