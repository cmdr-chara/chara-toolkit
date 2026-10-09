#!/usr/bin/env node
// Offline scoring and explicitly opt-in, read-only Codex trace capture. No dependencies.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const digest = (value) => createHash('sha256').update(value).digest('hex');
const contains = (text, word) => text.toLowerCase().includes(word.toLowerCase());

export function validateSuite(suite) {
  if (suite?.schema !== 1 || !Array.isArray(suite.cases) || !suite.cases.length) throw Error('Invalid suite schema');
  const ids = new Set();
  for (const c of suite.cases) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(c?.id || '') || ids.has(c.id)) throw Error('Invalid or duplicate case id');
    ids.add(c.id);
    if (typeof c.skill !== 'string' || typeof c.prompt !== 'string' || c.prompt.length < 20) throw Error('Missing skill or prompt: ' + c.id);
    if (!Array.isArray(c.checks) || !c.checks.length) throw Error('Missing checks: ' + c.id);
    for (const check of c.checks) {
      if (['final_contains', 'final_not_contains', 'command_contains', 'command_not_contains'].includes(check.kind)) {
        if (typeof check.value !== 'string' || check.value.length < 3) throw Error('Invalid text check: ' + c.id);
      } else if (check.kind === 'max_file_changes') {
        if (!Number.isInteger(check.value) || check.value < 0) throw Error('Invalid file change check: ' + c.id);
      } else throw Error('Unknown check: ' + check.kind);
    }
  }
  return suite;
}

export function parseEvents(raw) {
  return raw.split(/\r?\n/).filter((s) => s.trim()).map((line, index) => {
    let event;
    try { event = JSON.parse(line); } catch { throw Error('Invalid trace JSON at line ' + (index + 1)); }
    if (!event || typeof event.type !== 'string') throw Error('Missing trace event type');
    return event;
  });
}

export function grade(c, events, exitCode) {
  const completed = events.some((e) => e.type === 'turn.completed');
  const failure = events.some((e) => e.type === 'turn.failed' || e.type === 'error');
  const messages = events.filter((e) => e.type === 'item.completed' && e.item?.type === 'agent_message');
  const final = String(messages.at(-1)?.item?.text || '');
  const commands = events.filter((e) => e.type === 'item.completed' && e.item?.type === 'command_execution')
    .map((e) => String(e.item?.command || '')).join('\n');
  const changes = events.filter((e) => e.type === 'item.completed' && e.item?.type === 'file_change').length;
  const checks = [{ kind: 'complete', pass: exitCode === 0 && completed && !failure && !!final }];
  for (const check of c.checks) {
    const pass = check.kind === 'final_contains' ? contains(final, check.value)
      : check.kind === 'final_not_contains' ? !contains(final, check.value)
        : check.kind === 'command_contains' ? contains(commands, check.value)
          : check.kind === 'command_not_contains' ? !contains(commands, check.value)
            : changes <= check.value;
    checks.push({ kind: check.kind, value: check.value, pass });
  }
  return { pass: checks.every((c) => c.pass), checks, file_changes: changes };
}

function argsFrom(argv) {
  const o = { suite: 'evaluations/behavioral-cases.json' };
  const switches = new Set(['capture', 'json', 'acknowledge-live-cost']);
  const args = new Set(['suite', 'records', 'model', 'baseline-home', 'candidate-home', 'case', 'codex-bin', 'out', 'timeout-ms']);
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i];
    if (!name.startsWith('--')) throw Error('Unexpected argument: ' + name);
    const key = name.slice(2);
    if (switches.has(key)) o[key] = true;
    else if (args.has(key) && argv[i + 1] && !argv[i + 1].startsWith('--')) o[key] = argv[++i];
    else throw Error('Unknown option or missing value: ' + name);
  }
  return o;
}

function safeTrace(root, path) {
  if (typeof path !== 'string' || !path || isAbsolute(path)) throw Error('Trace path must be relative');
  const result = resolve(root, path);
  const part = relative(root, result);
  if (!part || part === '..' || part.startsWith('..' + sep)) throw Error('Trace escapes records directory');
  return result;
}

async function capture(spec, raw, opts) {
  if (!opts['acknowledge-live-cost']) throw Error('Capture requires --acknowledge-live-cost');
  if (!opts.model || !opts['baseline-home'] || !opts['candidate-home']) throw Error('Capture needs --model and two CODEX_HOME paths');
  const homes = [resolve(opts['baseline-home']), resolve(opts['candidate-home'])];
  for (const home of homes) if (!(await stat(home).catch(() => null))?.isDirectory()) throw Error('Missing CODEX_HOME directory: ' + home);
  const canonicalHomes = await Promise.all(homes.map((home) => realpath(home)));
  if (canonicalHomes[0] === canonicalHomes[1]) throw Error('Baseline and candidate homes must be different');
  const timeout = opts['timeout-ms'] === undefined ? 180000 : Number(opts['timeout-ms']);
  if (!Number.isInteger(timeout) || timeout < 1000 || timeout > 900000) throw Error('Invalid --timeout-ms');
  const rootPath = resolve(opts.out || 'evaluations/.behavioral-runs');
  await mkdir(rootPath, { recursive: true });
  const root = await realpath(rootPath);
  const directory = await mkdtemp(join(root, 'run-'));
  const binary = opts['codex-bin'] || 'codex';
  const version = spawnSync(binary, ['--version'], { encoding: 'utf8', timeout: 10000 });
  if (version.error || version.status !== 0) throw Error('Codex CLI not available: ' + (version.error?.message || version.stderr));
  const runtime = (version.stdout || version.stderr).trim();
  const runs = [];
  for (const c of spec.cases) for (const [arm, home] of [['baseline', canonicalHomes[0]], ['candidate', canonicalHomes[1]]]) {
    const work = await mkdtemp(join(tmpdir(), 'toolkit-eval-'));
    let response;
    try {
      response = spawnSync(binary, ['exec', '--json', '--ephemeral', '--skip-git-repo-check',
        '--sandbox', 'read-only', '--model', opts.model, '--cd', work, '-'], {
        encoding: 'utf8', input: c.prompt, timeout, maxBuffer: 20 * 1024 * 1024,
        env: { ...process.env, CODEX_HOME: home },
      });
    } finally {
      await rm(work, { recursive: true, force: true });
    }
    const trace = c.id + '.' + arm + '.jsonl';
    await writeFile(join(directory, trace), response.stdout || '', { flag: 'wx', mode: 0o600 });
    runs.push({ case_id: c.id, arm, trace, exit_code: response.status ?? -1,
      model: opts.model, runtime, prompt_sha256: digest(c.prompt), error: response.error?.message || null });
    process.stderr.write(c.id + ' ' + arm + ': ' + (response.status === 0 ? 'completed' : 'failed') + '\n');
  }
  const record = join(directory, 'records.json');
  await writeFile(record, JSON.stringify({ schema: 1, suite_sha256: digest(raw), runs }, null, 2) + '\n',
    { flag: 'wx', mode: 0o600 });
  return record;
}

export async function score(spec, suiteRaw, recordPath) {
  const data = JSON.parse(await readFile(recordPath, 'utf8'));
  if (data.schema !== 1 || data.suite_sha256 !== digest(suiteRaw) || !Array.isArray(data.runs)) throw Error('Records mismatch suite');
  const root = await realpath(dirname(resolve(recordPath)));
  const index = new Map();
  for (const run of data.runs) {
    if (!['baseline', 'candidate'].includes(run.arm)) throw Error('Unknown arm');
    const id = run.case_id + ':' + run.arm;
    if (index.has(id)) throw Error('Duplicate run: ' + id);
    index.set(id, run);
  }
  const rows = [];
  for (const c of spec.cases) {
    const base = index.get(c.id + ':baseline'), next = index.get(c.id + ':candidate');
    if (!base || !next) throw Error('Missing paired traces: ' + c.id);
    if (!base.model || base.model !== next.model || !base.runtime || base.runtime !== next.runtime
      || base.prompt_sha256 !== digest(c.prompt) || next.prompt_sha256 !== digest(c.prompt))
      throw Error('Incomparable model/runtime/prompt: ' + c.id);
    async function evaluate(record) {
      const file = safeTrace(root, record.trace);
      const actual = relative(root, await realpath(file));
      if (actual === '..' || actual.startsWith('..' + sep)) throw Error('Trace symlink escapes results');
      return grade(c, parseEvents(await readFile(file, 'utf8')), record.exit_code);
    }
    const baseline = await evaluate(base), candidate = await evaluate(next);
    const outcome = candidate.pass && !baseline.pass ? 'improved'
      : baseline.pass && !candidate.pass ? 'regressed' : candidate.pass ? 'unchanged_pass' : 'unchanged_fail';
    rows.push({ id: c.id, skill: c.skill, baseline, candidate, outcome });
  }
  return { rows, summary: { cases: rows.length, baseline_pass: rows.filter((x) => x.baseline.pass).length,
    candidate_pass: rows.filter((x) => x.candidate.pass).length,
    improved: rows.filter((x) => x.outcome === 'improved').length,
    regressed: rows.filter((x) => x.outcome === 'regressed').length } };
}

async function main() {
  const opts = argsFrom(process.argv.slice(2));
  const suiteRaw = await readFile(resolve(opts.suite), 'utf8');
  const suite = validateSuite(JSON.parse(suiteRaw));
  if (opts.case) {
    suite.cases = suite.cases.filter((c) => c.id === opts.case);
    if (suite.cases.length !== 1) throw Error('Unknown case: ' + opts.case);
  }
  const path = opts.capture ? await capture(suite, suiteRaw, opts) : opts.records;
  if (!path) throw Error('Use --records, or opt in to --capture');
  const result = await score(suite, suiteRaw, resolve(path));
  if (opts.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log('| Case | Baseline | Candidate | Outcome |\n| --- | --- | --- | --- |');
    for (const row of result.rows) console.log('| ' + row.id + ' | ' +
      (row.baseline.pass ? 'PASS' : 'FAIL') + ' | ' + (row.candidate.pass ? 'PASS' : 'FAIL') +
      ' | ' + row.outcome + ' |');
    console.log('Improved: ' + result.summary.improved + '; regressed: ' + result.summary.regressed);
    console.log('These are observable proxy checks, not proof of correctness or skill invocation.');
  }
  if (result.summary.regressed) process.exitCode = 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error('Behavioral evaluations: ' + error.message); process.exitCode = 2; });
}
