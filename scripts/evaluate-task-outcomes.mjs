#!/usr/bin/env node
/**
 * Run independent acceptance checks against two isolated, already-produced
 * code workspaces. No model calls, no shell strings, no implicit execution.
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFile, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sha = (text) => createHash('sha256').update(text).digest('hex');
const checkId = x => typeof x === 'string' && /^[a-z][a-z0-9-]{1,45}$/.test(x);
const pathWithin = (root, path) => {
  const r = relative(root, path);
  return r === '' || (r !== '..' && !r.startsWith('..' + sep) && !isAbsolute(r));
};

export function validatePlan(plan) {
  if (plan?.schema !== 1 || typeof plan.model !== 'string' || !plan.model
    || !Array.isArray(plan.cases) || !plan.cases.length) throw Error('Invalid outcome plan');
  const ids = new Set();
  for (const c of plan.cases) {
    if (!checkId(c?.id) || ids.has(c.id) || !Array.isArray(c.commands) || !c.commands.length)
      throw Error('Invalid or duplicate outcome case');
    ids.add(c.id);
    if (typeof c.folder !== 'string' || !c.folder || isAbsolute(c.folder)
      || c.folder.split(/[\\/]/).includes('..') || c.folder === '.')
      throw Error('Outcome folder must be a project subdirectory');
    for (const check of c.commands) {
      if (!Array.isArray(check) || !check.length
        || check.some(x => typeof x !== 'string' || !x || x.length > 4000))
        throw Error('Expected explicit command argv arrays, not shell strings');
    }
    if (c.trace !== undefined && (typeof c.trace !== 'string' || !c.trace
      || isAbsolute(c.trace) || c.trace.split(/[\\/]/).includes('..')))
      throw Error('Trace path must be a bounded relative file');
  }
  return plan;
}

export function traceUsage(events) {
  const totals = { input_tokens: 0, cached_input_tokens: 0, output_tokens: 0 };
  let observed = 0, tool_calls = 0;
  for (const event of events) {
    if (event.type === 'item.started' && event.item?.type === 'command_execution') tool_calls++;
    if (event.type !== 'turn.completed' || !event.usage) continue;
    const fields = Object.keys(totals);
    if (!fields.every((field) => Number.isInteger(event.usage[field]) && event.usage[field] >= 0)) return null;
    observed++;
    for (const field of fields) totals[field] += event.usage[field];
  }
  return observed ? { ...totals, tool_calls } : null;
}

export async function evaluate(plan, baselineRoot, candidateRoot, timeoutMs = 120000) {
  validatePlan(plan);
  const baseline = await realpath(baselineRoot), candidate = await realpath(candidateRoot);
  if (baseline === candidate || pathWithin(baseline, candidate) || pathWithin(candidate, baseline))
    throw Error('Arms must be distinct non-nested workspaces');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 900000) throw Error('Invalid timeout');
  const cases = [];
  for (const c of plan.cases) {
    const arms = {};
    for (const [name, root] of [['A', baseline], ['B', candidate]]) {
      const cwd = await realpath(resolve(root, c.folder));
      if (!pathWithin(root, cwd)) throw Error('Check folder escapes workspace');
      const steps = [];
      for (const argv of c.commands) {
        const started = process.hrtime.bigint();
        const result = spawnSync(argv[0], argv.slice(1), {
          cwd, shell: false, encoding: 'utf8', timeout: timeoutMs,
          maxBuffer: 2 * 1024 * 1024, env: { ...process.env, CI: 'true' },
        });
        steps.push({
          argv, exit_code: result.status ?? -1,
          duration_ms: Number((process.hrtime.bigint() - started) / 1_000_000n),
          passed: result.status === 0 && !result.error,
          output_sha256: sha((result.stdout || '') + (result.stderr || '')),
          error: result.error?.code || null,
        });
        if (!steps.at(-1).passed) break;
      }
      let usage = null;
      if (c.trace) {
        const trace = await realpath(join(cwd, c.trace));
        if (!pathWithin(cwd, trace)) throw Error('Trace escapes evaluated project');
        const text = await readFile(trace, 'utf8');
        const events = text.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
        usage = traceUsage(events);
      }
      arms[name] = { pass: steps.length === c.commands.length && steps.every(s => s.passed),
        steps, usage };
    }
    cases.push({ id: c.id, A: arms.A, B: arms.B, result: arms.B.pass && !arms.A.pass ? 'improved'
      : arms.A.pass && !arms.B.pass ? 'regressed' : arms.B.pass ? 'both_pass' : 'both_fail' });
  }
  const totals = { improved: cases.filter(x => x.result === 'improved').length,
    regressed: cases.filter(x => x.result === 'regressed').length,
    baseline_pass: cases.filter(x => x.A.pass).length,
    candidate_pass: cases.filter(x => x.B.pass).length };
  return { model: plan.model, cases, totals, note: 'Executed acceptance checks against independent workspaces; no model quality claim without matched runs and review.' };
}

async function main() {
  const opts = {};
  const args = process.argv.slice(2);
  const flags = new Set(['--acknowledge-execution', '--json']);
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (key in opts) throw Error('Duplicate option: ' + key);
    if (flags.has(key)) opts[key] = true;
    else if (['--plan', '--baseline', '--candidate', '--timeout-ms'].includes(key) && args[i + 1]
      && !args[i + 1].startsWith('--')) opts[key] = args[++i];
    else throw Error('Unsupported or incomplete option: ' + key);
  }
  if (!opts['--acknowledge-execution']) throw Error('Requires --acknowledge-execution');
  if (!opts['--plan'] || !opts['--baseline'] || !opts['--candidate']) throw Error('Missing plan or arms');
  const plan = validatePlan(JSON.parse(await readFile(resolve(opts['--plan']), 'utf8')));
  const result = await evaluate(plan, opts['--baseline'], opts['--candidate'],
    opts['--timeout-ms'] === undefined ? 120000 : Number(opts['--timeout-ms']));
  if (opts['--json']) console.log(JSON.stringify(result, null, 2));
  else {
    for (const c of result.cases) console.log(c.id + ': A=' + c.A.pass + ' B=' + c.B.pass + ' ' + c.result);
    console.log('Improved: ' + result.totals.improved + ', regressed: ' + result.totals.regressed);
  }
  if (result.totals.regressed) process.exitCode = 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch(error => { console.error('Outcome evaluation: ' + error.message); process.exitCode = 2; });
