---
name: multi-agent-work-coordinator
description: Plan safe parallel work across independently ownable resources with dependency ordering and exclusive write ownership. Use when multiple bounded work items can proceed independently.
---

# Multi-Agent Work Coordinator

Parallelize only work that is understood well enough to own, verify, and integrate independently.

## Trigger boundary

Use this skill when several bounded work items can proceed independently after the relevant resource boundaries, dependencies, and acceptance criteria are known.

Do not trigger for initial discovery of an unknown problem space, tiny/tightly coupled work, ambiguous tasks, or choosing a Mission Control role alone.

## Required inputs

Resolve the objective, acceptance criteria, candidate work items, dependencies, shared resources/artifacts, mutable-resource ownership, verification methods, protected user work, and integration owner. For repository tasks, also resolve relevant working-tree state and code ownership.

## Safety baseline

- Preserve user work and unrelated artifacts.
- Give each mutable resource one writer at a time.
- Readers may overlap; writers may not.
- Parallelism never bypasses a specialist's safety, approval, privacy, or migration boundary.
- Keep integration and final acceptance with the parent task.

## Workflow

1. **Decide if parallelism helps.** Keep tightly coupled or sequential work together.
2. **Build the graph.** Use `references/work-graph-schema.md` for missions, dependencies, resource scopes, acceptance evidence, and integration gates.
3. **Assign exclusive ownership.** When scopes can be represented as workspace-relative paths/globs or logical resource IDs, run:

```sh
python skills/multi-agent-work-coordinator/scripts/ownership_check.py <work-graph.json>
```

4. **Form waves.** Dispatch only dependency-ready work whose mutable-resource scopes do not overlap.
5. **Delegate.** Use `references/mission-control-adapter.md` when Mission Control is the execution adapter.
6. **Review handoffs.** Require produced artifacts/evidence/blockers, not "done" assertions.
7. **Integrate in declared order.** Resolve cross-mission drift and rerun integration-level checks affected by composition.
8. **Close the graph.** Every node must be accepted, blocked, cancelled, or explicitly dropped by scope authority.

## Handoffs and interaction boundaries

For repository work, `repository-intelligence` supplies unclear architecture/ownership boundaries. `delegate-with-mission-cards` selects and dispatches portable Mission Control roles. Domain specialists own technical or subject-matter decisions. `unlazy` may track substantial completion; `verification-and-release` owns final software ship judgment.

## Failure handling

If ownership overlaps or a shared contract is unstable, serialize or regroup the work instead of forcing parallelism. If a subagent result lacks required evidence, reject the handoff and return it to the same owned scope.

## Stop conditions

Stop when the work graph is integrated with accepted evidence or when an explicit dependency, ownership, authority, or environment blocker makes safe parallel execution impossible.
