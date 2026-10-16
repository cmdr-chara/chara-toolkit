---
name: review-and-refactor-code
description: Use for defined PR/diff reviews, verified defect findings, bounded review rounds, or behavior-preserving refactors.
---

# Review and Refactor Code

Find actionable regressions in a defined change and improve structure without smuggling in behavior changes. Favor trustworthy findings and review loops that converge.

## Trigger boundary

Use this skill for a defined PR/diff review, bounded maintainability assessment, cleanup, decomposition, or behavior-preserving refactor.

Do not trigger for general repository discovery, unknown runtime causes, proactive bug hunting unrelated to a diff, migrations, security-only review, measured performance, or final release approval.

## Required inputs

Resolve repository/scope, base and exact head or bounded area, intended behavior and PR acceptance criteria, affected consumers/contracts/tests, repository `AGENTS.md` and optional `REVIEW.md`, generated/vendor boundaries, working-tree state, approval, and protected user work.

## Safety baseline

- Begin read-only for reviews. Do not infer edit, merge, approval, or policy-change authority from a request to review.
- Preserve uncommitted work, author history, existing review decisions, and repository-specific instructions.
- Findings require a reachable contract failure and precise evidence, not stylistic preference or hypothetical problems.
- Pre-existing defects are not newly introduced regressions. Distinguish and deduplicate them.
- AI reviewer findings never count as required human approvals. Repository/host controls and release judgment remain separate.

## Workflow

1. **Freeze the changed surface.** Record base/head, PR purpose, changed files, impacted callers, state/data/permissions, contracts, tests and exclusions. Compare subsequent fix commits against the last reviewed head.
2. **For a PR or diff, load [pr-review-protocol.md](references/pr-review-protocol.md).** Select Quick, Standard, or Deep review from blast radius, consequence and reversibility, not diff length. Read a local `REVIEW.md` if present, without assuming automatic enforcement.
3. **Challenge candidate findings.** Apply [finding-contract.md](references/finding-contract.md). Trace reachable triggers, guards and counterexamples before admitting a claim. Use a genuinely fresh-context *read-only* reviewer on higher-risk changes if available and proportionate. Never call same-context analysis independent verification.
4. **Return a high-signal result.** Begin with `Actionable findings: N`, including `0` when justified. Cite precise introduced defects, separate pre-existing issues, identify checked SHAs, list *observed* test/CI evidence, risk and coverage gaps.
5. **Make approved fixes converge.** Fix the defect class, test affected invariants, and re-review only the new delta plus possible repair regressions. Preserve finding IDs and don't repeat old nits. After three substantive review rounds, stop automatic fix/review cycling and escalate approach decisions to the owner.
6. **For refactors, first define parity.** Use [behavior-parity.md](references/behavior-parity.md). Load [characterization-testing.md](references/characterization-testing.md) when material behavior is untested; load [module-seams.md](references/module-seams.md) for responsibility redesign. Propose the smallest safe slice, invariants, checks and risks. Stop at `AWAITING_APPROVAL` if broad edits are not authorized.
7. **Implement only approved refactor slices.** Preserve interfaces, characterize legacy behavior where needed, check relevant consumers and test parity, and inspect the final diff for unintended changes.
8. **Improve project policy only if asked.** Use [review-policy-template.md](references/review-policy-template.md) for opting into team review policy. When repeated *proven* agent errors demand prevention, read [recurring-errors.md](references/recurring-errors.md) and prefer bounded mechanical checks over more generic prose.

## Handoffs and interaction boundaries

`security-review` owns exploitability when security is the main concern, `debugging-investigator` owns unexplained runtime symptoms, evolution owns compatibility transitions, performance owns measured bottlenecks, builders own implementation, and `verification-and-release` owns the integrated ship/no-ship decision. Independent readers are optional and read-only; the primary reviewer owns synthesis and evidence.

## Failure handling

If files or candidate revisions are inaccessible, narrow coverage and state the gap. Retire claims that fail falsification instead of inflating confidence. Do not perform more than three automatic review/fix rounds without a fresh owner decision.

## Stop conditions

Stop a review with counted, evidence-backed findings (including explicit zero) and remaining coverage limits, without unauthorized edits or approvals. Stop a broad refactor at `AWAITING_APPROVAL` unless the approved slices and parity evidence are complete. Never silently merge or deploy.
