# Preventing recurring agent mistakes

Use when the same material failure has occurred at least twice in a repository. Do not add universal instructions for one-off events or mere reviewer preferences.

1. Group incidents by violated invariant, not by surface wording or who authored the change. Link separate commits, repros, or review findings. Check whether a new occurrence is the same mechanism.
2. Find the highest-value preventive seam. Prefer one source of truth, explicit ownership, removed unsafe pathways, typed contracts, deterministic lint/static checks, or meaningful regression tests. Write agent instructions only for judgment that cannot be enforced by tools.
3. Prove the control would catch the previous failure: run an isolated negative fixture/mutation that must fail and a corresponding valid case that must pass. Do not introduce a false passing test that merely imports a file.
4. Attach enforcement to the nearest repository check and confirm that the expected failed state actually blocks the change. Do not silence errors, snapshot unrelated outputs, or weaken existing assertions to make CI green.
5. Track the cost of the rule. Narrow it if it repeatedly flags legitimate code, and remove redundant instructions after stronger mechanical enforcement exists.
6. Ask for approval before broader architectural edits or changes to org-wide agent rules. No autonomous parsing of private conversations or cross-project history.

## Optional read-only triage

Store a small JSON ledger with schema 1, failures (id, distinct occurrences with evidence pointers, control.layer, control.files, optional control.proof). Use:

    node scripts/audit-recurring-errors.mjs --workspace . --ledger path/to/recurrences.json

The script classifies repeated mistakes and missing control files. A present path or written proof pointer is **not** execution evidence: independent checks must still establish the behavior. Keep the ledger under project control; do not infer that a rule exists because a prose document says so.
