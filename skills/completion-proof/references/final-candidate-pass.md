# Final-candidate pass and claim audit

Run this pass once the last intended mutation is made. If the pass leads to another change, the candidate changes too: repeat the affected steps on the new fingerprint.

## 1. Fingerprint

Record what the final candidate is: commit SHA plus a digest of uncommitted changes, content hashes for changed files, or a document/artifact version. Every receipt cited in the final report must carry this fingerprint or be shown unaffected by every change since its own.

## 2. Staleness sweep

For each `PROVEN` clause, compare the receipt's `TAKEN AFTER` point with the changes made since. If any later change touched something the probe depends on, mark it `STALE` and re-collect it. Prioritize:

- seam clauses and full builds/test runs, which almost any later edit can affect;
- generated outputs, lockfiles, snapshots, and indexes that derive from edited sources;
- counts and rosters, which drift with every edit.

When unsure whether a receipt is affected, re-collect it if the probe is safe and cheap; otherwise state the assumption in the report.

## 3. Closure check

Re-run every roster's discovery query on the final candidate. New members become `pending` and must be handled, blocked, or escalated before the verdict.

## 4. Gap hunt

Look deliberately for what the contract may have missed:

- re-read the original request phrase by phrase and confirm each maps to a clause or a stated exclusion;
- placeholders, stubs, debug output, commented-out code, or temporary files the task created;
- partially applied renames or format changes (old spelling still present in tests, docs, configs, fixtures, or generated files);
- tests that were skipped, deleted, loosened, or filtered to make a run pass;
- generated artifacts not regenerated after their sources changed;
- references between changed artifacts that no longer resolve.

New gaps become clauses only if they trace to a valid source; otherwise list them as found-not-done follow-ups.

## 5. Claim audit

Draft the final report, then examine every sentence that:

- asserts completion or success ("done", "fixed", "implemented", "passes", "verified", "works");
- states a number, size, duration, percentage, or total;
- asserts universality or absence ("all", "every", "none", "no remaining", "fully", "complete", "everywhere");
- compares ("faster", "smaller", "fewer warnings").

Each must cite a fresh receipt or closed roster. Recompute numbers with the recorded query; never copy them from earlier notes, subagent reports, or memory. If a claim cannot be bound, weaken it to what the evidence supports ("handled 41 of 43; 2 blocked") or remove it.

## Report shape

```text
Completion: COMPLETE | COMPLETE_WITH_WAIVERS | BLOCKED
Candidate: <fingerprint>

Proven:
- D-01 <outcome> — E-03 (run)
- D-04 <outcome> — R-1 closed: handled 41 of 43, blocked 1 (B-02), excluded 1 (X-1)

Waived:
- D-07 — W-02 granted by <authority>, scope <scope>

Blocked:
- D-05 — B-01 <cause>; owner <owner>; unblock: <step>

Found, not done (outside contract):
- <item and suggested owner>

Not a release decision: integrated ship/no-ship judgment belongs to verification-and-release.
```

Put the verdict first so a reader never mistakes a `BLOCKED` result for a finished one. Omit empty sections rather than writing "none" for every heading.
