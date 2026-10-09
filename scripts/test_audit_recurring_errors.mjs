import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { audit, validateLedger } from './audit-recurring-errors.mjs';

const ledger = { schema: 1, failures: [
  { id: 'missing-authorization-check', occurrences: ['PR #7: incorrect tenant', 'PR #21: wrong scope'],
    control: { layer: 'lint', files: ['authorization-rule.mjs'], proof: 'Fixture failed without rule, passed with rule' } },
  { id: 'one-off-error', occurrences: ['PR #31: off-by-one'],
    control: { layer: 'instructions', files: [] } },
] };
test('classify recurring mistakes and warn against instruction-only fixes', async t => {
  const root = await mkdtemp(join(tmpdir(), 'agent-failures-'));
  t.after(() => rm(root, { force: true, recursive: true }));
  await writeFile(join(root, 'authorization-rule.mjs'), 'export const rule = true;');
  const out = await audit(ledger, root);
  assert.equal(out[0].repeated, true);
  assert.equal(out[0].state, 'proof-requires-review');
  assert.equal(out[1].state, 'not-recurrent');
  const missing = { ...ledger, failures: [{ ...ledger.failures[0], control: { layer: 'tests', files: ['missing.js'] } }] };
  assert.equal((await audit(missing, root))[0].state, 'requires-enforceable-control');
});
test('reject escaping control paths and malformed ledgers', () => {
  assert.throws(() => validateLedger({ schema: 1, failures: [] }), /Invalid/);
  assert.throws(() => validateLedger({ ...ledger, failures: [ledger.failures[0], ledger.failures[0]] }), /Invalid/);
  assert.throws(() => validateLedger({ schema: 1, failures: [{ ...ledger.failures[0],
    control: { layer: 'lint', files: ['../secret'] } }] }), /scope/);
});
