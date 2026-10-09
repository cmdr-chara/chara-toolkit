#!/usr/bin/env node
/**
 * Read-only analysis of repeated agent failure evidence and actual control
 * locations. Does not auto-edit code, skills, project state, or CI.
 */
import { lstat, readFile, realpath } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const validId = s => typeof s === 'string' && /^[a-z][a-z0-9-]{1,60}$/.test(s);
const within = (root, candidate) => {
  const rel = relative(root, candidate);
  return rel !== '..' && !rel.startsWith('..' + sep) && !isAbsolute(rel);
};

export function validateLedger(ledger) {
  if (ledger?.schema !== 1 || !Array.isArray(ledger.failures) || !ledger.failures.length)
    throw Error('Invalid recurring-error ledger');
  const ids = new Set();
  for (const f of ledger.failures) {
    if (!validId(f?.id) || ids.has(f.id) || !Array.isArray(f.occurrences)
      || !f.occurrences.length || f.occurrences.some(s => typeof s !== 'string' || s.length < 5)
      || !['architecture', 'types', 'lint', 'tests', 'instructions'].includes(f.control?.layer)
      || !Array.isArray(f.control?.files)) throw Error('Invalid error-class record');
    ids.add(f.id);
    for (const p of f.control.files) {
      if (typeof p !== 'string' || !p || isAbsolute(p) || p.split(/[\\/]/).includes('..'))
        throw Error('Out-of-scope control file: ' + String(p));
    }
    if (f.control.proof !== undefined && (typeof f.control.proof !== 'string' || f.control.proof.length < 5))
      throw Error('Invalid proof pointer');
  }
  return ledger;
}

export async function audit(ledger, workspace) {
  validateLedger(ledger);
  const root = await realpath(workspace);
  const results = [];
  for (const record of ledger.failures) {
    const evidence = [...new Set(record.occurrences)];
    const exists = [];
    for (const p of record.control.files) {
      const target = resolve(root, p);
      if (!within(root, target)) throw Error('Control file escapes workspace');
      const info = await lstat(target).catch(e => { if (e.code === 'ENOENT') return null; throw e; });
      if (info?.isSymbolicLink()) throw Error('Control file cannot be a symlink');
      exists.push(info?.isFile() === true);
    }
    const repeated = evidence.length >= 2;
    const hasCheck = record.control.layer !== 'instructions' && exists.length > 0 && exists.every(Boolean);
    const hasProof = typeof record.control.proof === 'string';
    results.push({ id: record.id, occurrences: evidence.length, repeated,
      layer: record.control.layer, control_files_present: hasCheck,
      state: !repeated ? 'not-recurrent'
        : !hasCheck ? 'requires-enforceable-control'
          : !hasProof ? 'needs-negative-case-proof' : 'proof-requires-review' });
  }
  return results;
}

async function main() {
  const opts = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (key === '--json') opts.json = true;
    else if (['--ledger', '--workspace'].includes(key) && args[i + 1]) opts[key] = args[++i];
    else throw Error('Unknown option: ' + key);
  }
  if (!opts['--ledger'] || !opts['--workspace']) throw Error('Requires --ledger and --workspace');
  const root = await realpath(resolve(opts['--workspace']));
  const ledgerFile = await realpath(resolve(root, opts['--ledger']));
  if (!within(root, ledgerFile)) throw Error('Ledger escapes workspace');
  const results = await audit(JSON.parse(await readFile(ledgerFile, 'utf8')), root);
  if (opts.json) console.log(JSON.stringify(results, null, 2));
  else for (const result of results) console.log(result.id + ': ' + result.state);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch(error => { console.error('Regression review: ' + error.message); process.exitCode = 2; });
