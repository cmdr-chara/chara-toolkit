---
name: codebase-improvement-planner
description: Discover and prioritize evidence-backed improvements when no specific change has been chosen. Use for open-ended requests to improve, modernize, simplify, harden, or clean up a repository.
---

# Codebase Improvement Planner

Choose the highest-value next improvement from repository evidence, then stop before broad implementation unless the user has already authorized a bounded slice.

## Trigger boundary

Use this skill for:
- open-ended "what should we improve next?" requests;
- repository modernization or cleanup without a predefined target;
- balanced improvement backlogs across correctness, architecture, delivery, maintainability, and performance.

Do not trigger for:
- a concrete bug or reproduced failure;
- a defined migration, refactor, performance bottleneck, security review, or platform implementation;
- final release approval.

## Required inputs

Resolve the repository root, working-tree state, user goal, protected contracts, generated/vendor boundaries, available verification evidence, and whether implementation is already authorized. If business priorities are unknown, rank from technical evidence without inventing product value.

## Safety baseline

- Preserve uncommitted user work and start read-only.
- Do not install, upgrade, regenerate, delete, rename, or broadly rewrite merely to discover candidates.
- Treat volatile dependency, runtime, security, and platform claims as unverified until checked against current primary sources.
- Do not edit generated output before identifying its authoritative generator.

## Workflow

1. **Frame the decision.** Record scope, desired outcomes, constraints, exclusions, and evidence limits.
2. **Map the baseline.** Inspect structure, contracts, tests/CI, error handling, operational boundaries, and concentrated change/risk areas. Use `repository-intelligence` first when ownership or blast radius is too uncertain.
3. **Admit candidates.** Require a concrete signal: failing/weak evidence, repeated cost, risky coupling, unsupported dependency, missing critical verification, or demonstrable delivery friction. Do not turn style preferences into findings.
4. **Rank candidates.** Apply `references/improvement-ranking.md`. Keep change magnitude separate from priority.
5. **Select the next upgrade.** State the evidence, expected value, scope, risk, reversibility, verification method, and owning specialist.
6. **Stop or execute.** Without prior authorization, return the backlog and mark the selected item `AWAITING_APPROVAL`. With explicit authorization, execute only the selected bounded maintenance slice or hand it to the specialist that owns the concrete task.

## Handoffs and interaction boundaries

- `security-review` owns security-focused code review.
- `typescript-quality-enforcer` owns recurring TypeScript/lint policy.
- `review-and-refactor-code` owns defined structural cleanup.
- `optimize-codebase-performance` owns measured bottlenecks.
- `codebase-evolution-controller` owns migrations and upgrades.
- `debugging-investigator` owns concrete failures with unknown causes.
- Platform builders own implementation once a platform-specific improvement is selected.
- `verification-and-release` owns integrated ship judgment.

## Failure handling

If evidence is too weak to rank safely, narrow the claim, request or gather the missing evidence, or hand off to repository intelligence. Keep uncertain candidates explicitly labeled instead of promoting them by intuition.

## Stop conditions

Stop when the user has an evidence-backed ranked backlog and a clearly owned next action, or when an approved bounded slice is complete and verified. Do not continue into unrelated cleanup.
