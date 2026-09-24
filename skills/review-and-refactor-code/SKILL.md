---
name: review-and-refactor-code
description: Review a defined code area for actionable defects and perform behavior-preserving refactors. Use for bounded code review, maintainability cleanup, decomposition, or refactoring.
---

# Review and Refactor Code

Find evidence-backed problems in a defined scope and improve structure without smuggling in behavior changes.

## Trigger boundary

Use this skill for a PR/diff review, a bounded maintainability assessment, cleanup, decomposition, or behavior-preserving refactor.

Do not trigger for broad repository discovery, an unknown runtime cause, proactive bug hunting, migrations, security-only review, measured performance work, or final release approval.

## Required inputs

Resolve repository/scope, base/head or bounded area, intended behavior, public/internal contracts, relevant tests, generated/vendor boundaries, constraints, approval state, and protected user work.

## Safety baseline

- Preserve the working tree and uncommitted work.
- Start read-only for review/refactor assessment.
- Findings require an observable failure mode or concrete maintenance risk, not style preference.
- Do not mix feature behavior into a refactor unless explicitly requested.
- Broad edits stop at a concrete proposal unless already authorized.

## Workflow

1. **Map the change surface.** Trace changed files, callers/callees, contracts, configuration, data shape, side effects, and relevant tests.
2. **Admit findings.** Use `references/finding-contract.md`. Separate correctness/integration findings from optional structural improvements.
3. **Define parity.** Before refactoring, state behavior that must remain stable using `references/behavior-parity.md`.
4. **Characterize legacy behavior when needed.** If important untested code must change, read `references/characterization-testing.md` and pin observed behavior before structural edits.
5. **Propose the smallest useful slice.** State files, invariants, expected complexity reduction, risks, and focused verification. Stop at `AWAITING_APPROVAL` if broad changes were not authorized.
6. **Refactor incrementally.** Keep interfaces explicit, preserve compatibility, avoid speculative abstraction, and remove old paths only after replacements are wired.
7. **Verify the final slice.** Run targeted parity/correctness checks and inspect the final diff for accidental behavior changes.

## Handoffs and interaction boundaries

Use `security-review` when security is the primary decision, `debugging-investigator` for a concrete unexplained symptom, evolution for compatibility transitions, performance for measured bottlenecks, platform builders for product behavior, and `verification-and-release` for final ship judgment.

## Failure handling

If behavior is undocumented and cannot be safely inferred, characterize it or narrow the refactor. If a proposed cleanup changes contracts, reclassify it as a migration or feature instead of calling it behavior-preserving.

## Stop conditions

Stop after the review/proposal when approval is absent. After approval, stop when the bounded refactor is integrated, parity evidence passes, and remaining risks are explicit.
