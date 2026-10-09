import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { evaluate, traceUsage, validatePlan } from './evaluate-task-outcomes.mjs';

const script = fileURLToPath(new URL('./evaluate-task-outcomes.mjs', import.meta.url));
const plan = { schema: 1, model: 'fixture-model', cases: [
  { id: 'real-user-path', folder: 'app', commands: [[process.execPath, 'verify.mjs']], trace: 'trace.jsonl' },
] };
const events = [
  { type: 'item.started', item: { type: 'command_execution' } },
  { type: 'turn.completed', usage: { input_tokens: 30, cached_input_tokens: 10, output_tokens: 12 } },
];
test('count actual trace token usage, not guessed numbers', () => {
  assert.deepEqual(traceUsage(events), { input_tokens: 30, cached_input_tokens: 10, output_tokens: 12, tool_calls: 1 });
  assert.equal(traceUsage([{ type: 'turn.completed' }]), null);
  assert.equal(traceUsage([{ type: 'turn.completed', usage: { input_tokens: 30 } }]), null);
  assert.throws(() => validatePlan({ ...plan, cases: [{ ...plan.cases[0], folder: '../home' }] }), /folder/);
  assert.throws(() => validatePlan({ ...plan, cases: [{ ...plan.cases[0], commands: ['npm test'] }] }), /argv/);
});
test('independent acceptance command differentiates broken and working artifacts', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'codex-outcome-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const A = join(root, 'baseline'), B = join(root, 'candidate');
  for (const arm of [A, B]) {
    await mkdir(join(arm, 'app'), { recursive: true });
    await writeFile(join(arm, 'app', 'verify.mjs'), [
      "import { readFile } from 'node:fs/promises';",
      "const actual = await readFile(new URL('./result.txt', import.meta.url), 'utf8');",
      "if (actual.trim() !== 'accepted') process.exit(1);",
    ].join('\n'));
    await writeFile(join(arm, 'app', 'trace.jsonl'), events.map(e=>JSON.stringify(e)).join('\n')+'\n');
  }
  await writeFile(join(A, 'app', 'result.txt'), 'broken');
  await writeFile(join(B, 'app', 'result.txt'), 'accepted');
  const result = await evaluate(plan, A, B);
  assert.equal(result.totals.improved, 1);
  assert.equal(result.cases[0].A.pass, false);
  assert.equal(result.cases[0].B.usage.input_tokens, 30);
  const path = join(root, 'plan.json');
  await writeFile(path, JSON.stringify(plan));
  const cli = spawnSync(process.execPath, [script, '--plan', path, '--baseline', A,
    '--candidate', B, '--acknowledge-execution', '--json'], { encoding: 'utf8' });
  assert.equal(cli.status, 0, cli.stderr);
  assert.equal(JSON.parse(cli.stdout).totals.improved, 1);
  await writeFile(join(A, 'app', 'result.txt'), 'accepted');
  await writeFile(join(B, 'app', 'result.txt'), 'broken');
  assert.equal((await evaluate(plan, A, B)).totals.regressed, 1);
  const regressed = spawnSync(process.execPath, [script, '--plan', path, '--baseline', A,
    '--candidate', B, '--acknowledge-execution'], { encoding: 'utf8' });
  assert.equal(regressed.status, 1);
  assert.equal(spawnSync(process.execPath, [script, '--plan', path, '--baseline', A,
    '--candidate', B], { encoding: 'utf8' }).status, 2);
});
test('nested and overlapping workspace arms are forbidden', async t => {
  const root = await mkdtemp(join(tmpdir(), 'outcome-scope-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await assert.rejects(evaluate(plan, root, root), /distinct/);
  await mkdir(join(root, 'child'));
  await assert.rejects(evaluate(plan, root, join(root,'child')), /non-nested/);
});
