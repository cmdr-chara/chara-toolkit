---
name: multi-agent-work-coordinator
description: Plan safe parallel repository work with dependency ordering and exclusive write ownership. Use when multiple bounded work items can proceed independently.
---

# Multi-Agent Work Coordinator

Parallelize only work that is understood well enough to own, verify, and integrate independently.

## Trigger boundary

Use this skill when several bounded work items can proceed independently after repository boundaries are known.

Do not trigger for repository discovery, tiny/tightly coupled work, ambiguous tasks, or choosing a Mission Control role alone.

## Required inputs

Resolve objective, acceptance criteria, repository map, candidate work items, dependencies, shared interfaces/artifacts, verification methods, working-tree state, and integration owner.

## Safety baseline

- Preserve uncommitted user work.
- Give each writable path/artifact one writer at a time.
- Readers may overlap; writers may not.
- Parallelism never bypasses a specialist's safety or approval boundary.
- Keep integration and final acceptance with the parent task.

## Workflow

1. **Decide if parallelism helps.** Keep tightly coupled or sequential work together.
2. **Build the graph.** Use `references/work-graph-schema.md` for missions, dependencies, acceptance evidence, and integration gates.
3. **Assign exclusive ownership.** Run:

```sh
python skills/multi-agent-work-coordinator/scripts/ownership_check.py <work-graph.json>
```

before dispatch when a graph file exists.
4. **Form waves.** Dispatch only dependency-ready work whose writes do not overlap.
5. **Delegate.** Use `references/mission-control-adapter.md` when Mission Control is the execution adapter.
6. **Review handoffs.** Require changed files/evidence/blockers, not "done" assertions.
7. **Integrate in declared order.** Resolve interface drift and rerun integration-level checks affected by composition.
8. **Close the graph.** Every node must be accepted, blocked, or explicitly dropped by scope authority.

## Handoffs and interaction boundaries

`repository-intelligence` supplies unclear boundaries. `delegate-with-mission-cards` chooses/dispatches toolkit agents. Domain specialists own technical decisions. `unlazy` may track substantial completion; `verification-and-release` owns final ship judgment.

## Failure handling

If ownership overlaps or a shared interface is unstable, serialize or regroup the work instead of forcing parallelism. If a subagent result lacks evidence, reject the handoff and return it to the same owned scope.

## Stop conditions

Stop when the work graph is integrated with accepted evidence or when an explicit dependency/ownership blocker makes safe parallel execution impossible.
