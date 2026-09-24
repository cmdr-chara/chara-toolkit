---
name: verification-and-release
description: Design risk-based verification and judge release readiness from traceable evidence. Use when deciding what must be proven or whether an integrated change can ship.
---

# Verification and Release

Decide release readiness from evidence proportional to consequence, novelty, blast radius, and reversibility.

## Trigger boundary

Use this skill for verification strategy, CI/test evidence review, operational release controls, rollout/rollback planning, or a final `READY` / `CONDITIONAL` / `BLOCKED` decision.

Do not trigger to implement the feature, diagnose an unknown failure, or treat a green unit suite as sufficient release evidence.

## Required inputs

Resolve the frozen candidate/ref, intended behavior, affected consumers, risk-sensitive surfaces, local/CI results, deployment topology, migrations, observability, rollback/forward-recovery, release scope, and protected user work.

## Safety baseline

- Preserve the working tree and candidate identity.
- Do not mark skipped, stale, flaky, filtered, or wrong-revision checks as passing evidence.
- Do not expose secrets in logs or evidence bundles.
- Do not deploy or roll back production merely because this skill recommends it.

## Workflow

1. **Freeze the candidate and claims.** Every check must prove or challenge a specific behavioral or nonfunctional claim.
2. **Map risk.** Use `references/risk-test-matrix.md`; risk comes from failure modes and reversibility, not line count.
3. **Choose minimum sufficient evidence.** Static, unit/component, contract/schema, integration, end-to-end, nonfunctional, and operational layers are options, not a mandatory checklist.
4. **Review CI architecture when needed.** For GitHub Actions speed, trust boundaries, permissions, caching, or deploy gates, read `references/github-actions.md`.
5. **Collect exact results.** Where JUnit/LCOV reports exist, use:

```sh
python skills/verification-and-release/scripts/summarize_test_reports.py --junit build/test-results --lcov coverage/lcov.info --format markdown
```

Record command, candidate, environment, pass/fail/skip/flaky state, and relevant artifacts.
6. **Evaluate evidence quality.** Classify material evidence as current pass, fail, gap, stale, flaky, or not applicable with reason.
7. **Verify operational readiness.** Check applicable build artifact, configuration, migration ordering, health, flags, observability, support/runbooks, and rollback/forward-recovery.
8. **Define rollout.** State cohort/staging, kill/rollback trigger, monitoring window, and post-release verification.
9. **Issue the decision.** Use `references/release-evidence-schema.md`. Residual risk acceptance belongs to the authorized owner, not the skill.

## Handoffs and interaction boundaries

Return missing feature checks to the owning builder, unknown failures to `debugging-investigator`, migration/rollback gaps to evolution, security-first code questions to `security-review`, and documentation gaps to documentation synchronization.

## Failure handling

If evidence is stale or tied to another revision, mark it stale. If CI is flaky, investigate or explicitly gap the affected claim rather than retrying until green. A critical failure stays blocking unless an authorized owner accepts a bounded residual risk with containment.

## Stop conditions

Stop with `READY` only when material claims have sufficient current evidence and rollout/rollback controls fit the risk. Otherwise return `CONDITIONAL` or `BLOCKED` with concrete missing evidence.
