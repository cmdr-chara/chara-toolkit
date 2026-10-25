# Coverage accounting

Use a roster whenever a clause covers a population: files, call sites, endpoints, locales, tickets, records, rows, pages, or follow-ups. The roster answers "how do we know nothing was skipped?" with arithmetic instead of confidence.

## Roster record

```text
ROSTER: R-1
CLAUSE: D-04
POPULATION: <what counts as a member, in one sentence>
DISCOVERY: <reproducible query: search pattern + paths, API listing, test collection, manifest>
DISCOVERY CHECK: <known member the query must find, or comparison with a second method>
EXCLUSIONS: <members out of scope, each with the contract reason>

MEMBER                         DISPOSITION   RECEIPT / NOTE
src/api/users.ts:41            handled       E-14
src/api/admin.ts:88            handled       E-15
scripts/legacy/export.ts:12    excluded      vendored; contract exclusion X-1
src/jobs/sync.ts:203           blocked       B-02 (owner decision needed)

BALANCE: discovered 4 = handled 2 + blocked 1 + waived 0 + excluded 1 + pending 0
```

Dispositions:

- `pending` — discovered, not yet handled; allowed only before the final-candidate pass;
- `handled` — the outcome holds for this member, with a receipt (a shared receipt is fine when one probe covers many members);
- `blocked` — cannot be handled now; links a blocker record;
- `waived` — excused by recorded authority; links a waiver record;
- `excluded` — outside the contract, with the reason stated before work began rather than after.

## Rules

- **Discover with a query, not with memory.** The discovery method must be rerunnable by someone else and must be checked for blind spots: case variants, generated files, alternate spellings, other file types, dynamic references, non-default directories.
- **Use two methods when misses are costly.** For example, a text search plus a compiler/type error list, or a manifest plus a directory listing. Disagreement between methods is a finding, not noise.
- **The balance must close.** On the final candidate, `pending` is zero and discovered equals the sum of the other dispositions. If it does not close, the clause is not proven.
- **Re-run discovery at the end.** Work often creates or reveals new members. Running the original query on the final candidate (the closure check) catches members introduced or missed during the task.
- **Exclusions are decided early.** Adding an exclusion late to make the balance close is scope change; it needs the same authority as a waiver.
- **Report counts from the roster.** Any "N files updated" or "all call sites" statement in the final report is computed from the closed roster on the final candidate, as handled-of-discovered with blocked, waived, and excluded shown separately.

## Sampling

When a population is too large to inspect member by member, prove it with an exhaustive mechanical probe (a query that returns zero offending members) rather than sampling. If only sampling is possible, say so, state the sample size and method, and do not phrase the result as "all".
