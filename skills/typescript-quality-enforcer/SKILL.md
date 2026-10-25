---
name: typescript-quality-enforcer
description: JavaScript/TypeScript only. Strengthen type safety and lint discipline in .ts/.tsx/.js code. Use for TS/JS type-safety audits, unsafe assertion or `any`/`unknown` cleanup, strictness migration, or adopting the bundled chara-lint Oxlint rules. Not for Python, Go, Rust, Dart, or other languages.
---

# TypeScript Quality Enforcer

Strengthen type evidence and lint policy in JavaScript/TypeScript code without hiding diagnostics or turning a quality audit into an uncontrolled rewrite.

## Trigger boundary

Use this skill only when the target code is JavaScript or TypeScript (`.ts`, `.tsx`, `.mts`, `.cts`, `.js`, `.jsx`, `.mjs`, `.cjs`), for:
- type-safety audits and staged compiler-strictness work;
- adopting the bundled chara-lint Oxlint plugin, or migrating an earlier lint-plugin copy to it;
- systematic cleanup of unsafe assertions, broad `any`/`unknown` contracts, suppressions, module mocking, or weak boundary parsing.

Do not trigger for:
- other languages (Python, Go, Rust, Dart, Kotlin, Swift, and so on), even for "type safety" or "lint" requests. Use the platform builder or `review-and-refactor-code`;
- generic code quality, style, or formatting with no type-evidence question;
- a concrete runtime bug, a measured performance bottleneck, an ordinary bounded refactor, a toolchain migration, or a final release decision.

## Required inputs

Resolve scope, working-tree state, manifests/lockfiles, the installed TypeScript and Oxlint versions, tsconfig/lint configuration, existing checks and CI enforcement, generated/vendor boundaries, and approval state.

For a breadth-first inventory, run:

```sh
python skills/typescript-quality-enforcer/scripts/typescript_quality_inventory.py . --format markdown
```

Treat heuristic matches as leads that require parser/manual confirmation.

## Safety baseline

- Preserve uncommitted user work.
- Audit first. Do not install chara-lint, change policy, or remediate broad source sets without an approved stage.
- Never make lint pass through laundering: replacing one unsafe cast with another, widening `any`, blanket suppressions, broader ignores, or weakened compiler options.
- Never overwrite an existing plugin directory; migrate a differing copy through a reviewed diff.

## Workflow

1. **Establish the baseline.** Measure existing typecheck/lint state and enforcement. Separate pre-existing failures from target findings.
2. **Build the evidence ledger.** Confirm representative findings and classify them by invariant, boundary, and remediation cost.
3. **Choose a staged policy.** Read `references/adoption-strategy.md`. Prefer the smallest rule/strictness stage that creates durable signal without flooding the repository.
4. **Handle strictness deliberately.** For `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and related migration work, read `references/strictness-migration.md` instead of flipping every flag at once.
5. **Stop for approval.** Report the proposed stage and mark it `AWAITING_APPROVAL` before installation, policy changes, or broad remediation.
6. **Install only when approved.** Run `node skills/typescript-quality-enforcer/scripts/install.mjs [target-dir]` (default `tools/oxlint/chara-lint`), then enable the approved rules through `jsPlugins` as `assets/chara-lint/README.md` shows. The installer refuses to overwrite an existing directory.
7. **Remediate by invariant.** Use `references/violation-remediation.md`. Prefer narrowing, explicit boundaries, and contract repair over silencing.
8. **Verify recurrence prevention.** Re-run targeted typecheck/lint/tests and confirm CI or repository policy will catch the same class again.
9. **Refresh volatile claims.** Check current primary sources (TypeScript release notes, Oxlint JS-plugin docs) before version-, runtime-, or ecosystem-sensitive recommendations.

## Handoffs and interaction boundaries

Hand structural dependency-seam work to `review-and-refactor-code`, migrations to `codebase-evolution-controller`, runtime failures to `debugging-investigator`, measured hotspots to `optimize-codebase-performance`, security-first findings to `security-review`, and final ship judgment to `verification-and-release`.

## Failure handling

If diagnostics are dominated by generated/vendor code or unclear ownership, narrow scope or use repository intelligence. If a proposed rule produces low-signal noise, reduce the stage or use the rule's documented options rather than weakening the rule after adoption. If the installed Oxlint cannot load JS plugins, report the version gap instead of substituting another tool silently. Keep unverified findings labeled as such.

## Stop conditions

Stop after an evidence-backed proposal when approval is absent. After approval, stop when the bounded stage is remediated, relevant checks pass, enforcement is durable, and remaining exceptions are explicit.
