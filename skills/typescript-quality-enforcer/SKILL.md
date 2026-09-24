---
name: typescript-quality-enforcer
description: Strengthen TypeScript/JavaScript type safety and deterministic lint discipline. Use for systematic type-safety cleanup, unsafe escape-hatch reduction, or anti-slop rule adoption.
---

# TypeScript Quality Enforcer

Strengthen type evidence and lint policy without hiding diagnostics or turning a quality audit into an uncontrolled rewrite.

## Trigger boundary

Use this skill for:
- TypeScript/JavaScript type-safety audits and staged strictness work;
- anti-slop Oxlint adoption;
- systematic cleanup of unsafe assertions, broad `any`/`unknown` contracts, suppressions, module mocking, or weak boundary parsing.

Do not trigger for a concrete runtime bug, measured performance bottleneck, ordinary bounded refactor, toolchain migration, non-TypeScript platform audit, or final release decision.

## Required inputs

Resolve scope, working-tree state, manifests/lockfiles, tsconfig/lint configuration, existing checks/CI enforcement, generated/vendor boundaries, and approval state.

For a breadth-first inventory, run:

```sh
python skills/typescript-quality-enforcer/scripts/typescript_quality_inventory.py . --format markdown
```

Treat heuristic matches as leads that require parser/manual confirmation.

## Safety baseline

- Preserve uncommitted user work.
- Audit first. Do not install the vendored runtime, change policy, or remediate broad source sets without an approved stage.
- Never make lint pass through laundering: replacing one unsafe cast with another, widening `any`, blanket suppressions, broader ignores, or weakened compiler options.
- Keep third-party provenance and `assets/anti-slop/LICENSE` intact.

## Workflow

1. **Establish the baseline.** Measure existing typecheck/lint state and enforcement. Separate pre-existing failures from target findings.
2. **Build the evidence ledger.** Confirm representative findings and classify them by invariant, boundary, and remediation cost.
3. **Choose a staged policy.** Read `references/adoption-strategy.md`. Prefer the smallest rule/strictness stage that creates durable signal without flooding the repository.
4. **Handle strictness deliberately.** For `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and related migration work, read `references/strictness-migration.md` instead of flipping every flag at once.
5. **Stop for approval.** Report the proposed stage and mark it `AWAITING_APPROVAL` before installation, policy changes, or broad remediation.
6. **Install only when approved.** Use `scripts/install.mjs`; never overwrite an existing anti-slop/plugin directory.
7. **Remediate by invariant.** Use `references/violation-remediation.md`. Prefer narrowing, explicit boundaries, and contract repair over silencing.
8. **Verify recurrence prevention.** Re-run targeted typecheck/lint/tests and confirm CI or repository policy will catch the same class again.
9. **Refresh volatile claims.** Use current primary sources before version-, runtime-, or ecosystem-sensitive recommendations. Upstream details live in `references/upstream-provenance.md`.

## Handoffs and interaction boundaries

Hand structural dependency-seam work to `review-and-refactor-code`, migrations to `codebase-evolution-controller`, runtime failures to `debugging-investigator`, measured hotspots to `optimize-codebase-performance`, security-first findings to `security-review`, and final ship judgment to `verification-and-release`.

## Failure handling

If diagnostics are dominated by generated/vendor code or unclear ownership, narrow scope or use repository intelligence. If a proposed rule produces low-signal noise, reduce the stage rather than weakening the rule after adoption. Keep unverified findings labeled as such.

## Stop conditions

Stop after an evidence-backed proposal when approval is absent. After approval, stop when the bounded stage is remediated, relevant checks pass, enforcement is durable, and remaining exceptions are explicit.
