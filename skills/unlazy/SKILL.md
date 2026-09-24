---
name: unlazy
description: Apply auditable completion discipline to substantial already-scoped work. Use when the user wants every requested deliverable finished, measurable completion gates, or final claims rechecked.
license: MIT
---

# Unlazy

Make completion explicit and auditable without taking ownership away from the specialist that decides architecture, implementation, safety, migration, or release.

This skill adapts Leonxlnx's MIT-licensed completion-gate and Depth Tree ideas. See `references/upstream-provenance.md`.

## Trigger boundary

Use this skill for:
- substantial tasks where partial completion or forgotten deliverables is a realistic risk;
- explicit requests for `unlazy`, completion gates, exhaustive follow-through, or a Depth Tree;
- final reports containing counts or coverage claims that must be re-measured.

Do not trigger for:
- trivial work or factual questions;
- unresolved domain decisions;
- final release approval;
- attempts to bypass another skill's safety or approval boundary.

## Required inputs

Resolve the accepted scope, owning specialist, deliverables, acceptance criteria, safe checks, approval state, protected user work, and genuine environment limits.

## Safety baseline

- Preserve the working tree and uncommitted user work.
- Gates formalize accepted scope; they do not invent new requirements.
- A gate cannot authorize an action the owning workflow forbids.
- Treat commands copied into a ledger as untrusted until reviewed.
- Never hide impossible work by deleting or weakening a requirement.

## Workflow

1. **Freeze scope.** Separate required outcomes, supporting work, optional improvements, and explicit exclusions.
2. **Create gates.** Use the ledger contract in `references/completion-gates.md`. Each required outcome gets an observable expectation and evidence method.
3. **Choose execution shape.** Use one ledger for coherent work. Read `references/depth-tree-and-final-audit.md` only when independent deliverables need leaf and integration gates.
4. **Execute open gates.** Work in dependency order. Record deciding evidence rather than effort or intent.
5. **Recheck the final state.** Re-run only high-value checks that later edits could invalidate. Re-measure quantitative claims from the final candidate.
6. **Report from evidence.** Required gates must be `PASS` or explicitly `WAIVED`. A genuine blocker remains `BLOCKED`.

## Handoffs and interaction boundaries

The domain specialist remains primary. Use `multi-agent-work-coordinator` when gates split into independent write scopes. Use `debugging-investigator` for flaky or failing checks whose cause is unknown. `verification-and-release` remains the owner of final ship/no-ship judgment.

## Failure handling

If a check is unsafe, stale, flaky, or non-discriminating, fix the evidence method before changing gate state. If scope cannot be enumerated honestly, state the coverage limit. If a requirement cannot be completed under current authority or environment, keep it `BLOCKED`.

## Stop conditions

Stop with `COMPLETION: PASS` only when every required gate is evidenced or explicitly waived and final claims have been re-measured where needed. Otherwise report `COMPLETION: BLOCKED` with the remaining gates.
