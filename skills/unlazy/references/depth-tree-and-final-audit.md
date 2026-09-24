# Depth Tree and final audit

Use this reference only when one completion ledger would hide multiple independently verifiable deliverables.

## Depth Tree

Split at natural joints, not arbitrary depth:
- each leaf owns one coherent deliverable and its acceptance evidence;
- write ownership must remain exclusive when work is parallelized;
- shared interfaces and generated artifacts are agreed before fan-out;
- internal branches need integration gates, because passing leaves do not prove composition.

Prefer the smallest tree that makes completion observable. Hand multi-agent ownership and integration order to `multi-agent-work-coordinator`.

## Final-candidate audit

After all required gates appear satisfied:
1. re-read the accepted scope against the ledger;
2. look for omitted deliverables, placeholders, integration gaps, and unsupported claims;
3. rerun only checks that later changes could have invalidated;
4. re-measure counts, totals, coverage, warnings, errors, or file inventories from the final state;
5. reopen a gate when contradictory evidence appears.

The audit is for detecting real incompleteness, not endless polishing. Stop expanding once requested outcomes are proven and no material gap remains.
