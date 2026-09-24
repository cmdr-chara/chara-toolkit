---
name: codebase-evolution-controller
description: Plan and execute dependency, framework, schema, API, or runtime transitions with compatibility and rollback. Use when a known current state must move safely to a defined target.
---

# Codebase Evolution Controller

Move a repository from a known current state to a defined target without breaking consumers or losing rollback.

## Trigger boundary

Use this skill for dependency/runtime upgrades, framework migrations, schema or API transitions, compatibility windows, staged rollout, and retirement of legacy paths.

Do not trigger for an unexplained failure, ordinary feature work, measured performance tuning, security-only review, or final release approval.

## Required inputs

Resolve current and target states, repository/working-tree identity, manifests/lockfiles, consumers, compatibility constraints, data/schema impact, rollout environment, rollback path, and authorization.

For a read-only manifest inventory, run:

```sh
python skills/codebase-evolution-controller/scripts/manifest_inventory.py . --format markdown
```

Verify the resulting signals against authoritative repository evidence.

## Safety baseline

- Preserve uncommitted user work.
- Do not silently upgrade, regenerate, rewrite lockfiles, or remove compatibility paths during discovery.
- Verify volatile target-version, support, security, and compatibility claims from current primary sources.
- Keep irreversible data/schema changes behind explicit recovery evidence.

## Workflow

1. **Define the transition contract.** Record current state, target state, consumers, non-negotiable behavior, compatibility window, rollout, rollback, and removal criteria.
2. **Capture a baseline.** Establish build/test/runtime evidence and the existing contract before edits.
3. **Map compatibility.** Use `references/compatibility-evidence.md`; identify producer/consumer order, mixed-version periods, generated clients, persisted data, and operational dependencies.
4. **Check dependency risk when relevant.** Read `references/dependency-risk.md` for CVE reachability, maintenance, supply-chain, lockfile, and license considerations.
5. **Check database migration safety when relevant.** Read `references/database-migration-safety.md` before production DDL/backfills or expand-contract work.
6. **Build stages.** Use `references/migration-plan-template.md`. Each stage must be independently verifiable and have an exit/rollback condition.
7. **Implement bounded stages.** Preserve compatibility until all required consumers have moved; do not delete the old path early.
8. **Verify and roll out.** Test old/new and mixed states where relevant, observe rollout signals, and confirm rollback/forward-recovery.
9. **Contract.** Remove legacy paths only after their retirement criteria are proven.

## Handoffs and interaction boundaries

Use `repository-intelligence` for unclear blast radius, `security-review` for security-first code assessment, `debugging-investigator` when a migration uncovers an unexplained failure, platform builders for implementation details, documentation synchronization for migration docs, and `verification-and-release` for final ship judgment.

## Failure handling

If the target cannot be supported safely, stop with the incompatible constraint rather than forcing the migration. If rollback is impossible, require explicit forward-recovery and containment evidence. Treat unresolved consumer inventory as a blocker to destructive contraction.

## Stop conditions

Stop when the requested transition stage is implemented and verified with compatibility/rollback evidence, or when a concrete blocker prevents a safe transition. Legacy removal is a separate completion point unless explicitly in scope.
