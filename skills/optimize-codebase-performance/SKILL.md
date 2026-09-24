---
name: optimize-codebase-performance
description: Measure and improve a named performance bottleneck while preserving correctness. Use when reducing latency, CPU, memory, I/O, rendering cost, startup time, or infrastructure cost.
---

# Optimize Codebase Performance

Optimize measured critical paths, not code that merely looks expensive.

## Trigger boundary

Use this skill for a named latency/throughput/CPU/memory/GPU/I/O/startup/rendering/database/bundle/infrastructure-cost problem that can be measured.

Do not trigger for unmeasured cleanup, an unknown correctness failure, migration, broad platform audit, or final release approval.

## Required inputs

Resolve the critical path, target metric, representative workload, environment, baseline or baseline plan, correctness invariants, budget/stop condition, working-tree state, and approval state.

## Safety baseline

- Preserve uncommitted user work.
- Start with measurement; do not rewrite code on intuition.
- Keep baseline and candidate workloads comparable.
- Never claim a percentage improvement without paired measurements.
- Broad optimization edits stop at a proposal unless already authorized.

## Workflow

1. **Define the target.** Name the user/system path, metric, workload, environment, and success/stop criteria.
2. **Establish the baseline.** Use `references/measurement-and-reporting.md`; collect enough samples/profiles to distinguish signal from noise.
3. **Attribute the bottleneck.** Use `references/bottleneck-playbook.md` across relevant application, data, dependency, runtime, infrastructure, and UI layers.
4. **Form falsifiable hypotheses.** Each candidate change needs evidence, mechanism, expected metric movement, correctness risk, and a measurement that can reject it.
5. **Propose a bounded batch.** Without authorization, stop at `AWAITING_APPROVAL`.
6. **Implement one attributable batch at a time.** Run focused correctness checks and the same representative benchmark. Revert/revise changes that do not help enough or create unjustified regressions.
7. **Report honestly.** Keep negative results, noise limits, before/after numbers, trade-offs, and residual bottlenecks.

## Handoffs and interaction boundaries

Use repository intelligence for unclear hot paths, debugging for incorrect behavior, evolution for version/contract transitions, platform builders for broader product work, `security-review` if a performance change crosses a security boundary, and `verification-and-release` for final ship judgment.

## Failure handling

If the workload is not representative or measurement variance hides the effect, improve the measurement before changing more code. If the true bottleneck is outside authorized scope, report it and hand off rather than optimizing a proxy.

## Stop conditions

Stop when the target is met with comparable evidence, the next change is no longer justified by expected value/risk, or a concrete scope/environment blocker prevents meaningful measurement.
