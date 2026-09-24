---
name: repository-intelligence
description: Map repository architecture, ownership, dependencies, change impact, and edit conflicts. Use when the task needs evidence about what exists or what a proposed change can affect.
---

# Repository Intelligence

Build an evidence-backed map of the repository without turning discovery into implementation.

## Trigger boundary

Use this skill for architecture/ownership mapping, dependency boundaries, blast radius, hotspots, change impact, or likely edit conflicts.

Do not trigger to delegate work, implement the change, diagnose a specific runtime failure, or approve a release.

## Required inputs

Resolve repository root, task/change hypothesis, candidate/base ref when relevant, working-tree state, generated/vendor boundaries, and the decision this map must support.

For a breadth-first signal scan:

```sh
python skills/repository-intelligence/scripts/repo_signal_scan.py . --format markdown
```

Treat scanner output as evidence leads, not ownership truth.

## Safety baseline

- Preserve uncommitted user work and remain read-only.
- Do not edit generated/vendor content during mapping.
- Distinguish facts from inference and state confidence.
- Prefer repository-native manifests, imports, registrations, schemas, tests, and build/deploy configuration over naming guesses.

## Workflow

1. **Frame the decision.** State what must be mapped and what would change the next action.
2. **Establish state.** Record branch/ref, worktree changes, languages/workspaces, generated boundaries, and major entry points.
3. **Map components and dependencies.** Trace imports/calls, data/contracts, routes/events, build/runtime links, persistence, and operational boundaries.
4. **Determine ownership.** Use code/config/history/docs evidence; mark ambiguous ownership rather than inventing it.
5. **Map impact.** Identify direct edits, consumers, compatibility surfaces, tests, deployment units, migrations, and generated outputs.
6. **Locate hotspots/conflicts.** Highlight high-coupling/stateful areas and likely overlapping write scopes.
7. **Report.** Use `references/evidence-model.md` and `references/output-schema.md` for the evidence/confidence contract.

## Handoffs and interaction boundaries

Hand parallelization to `multi-agent-work-coordinator`, unknown-defect hunting to `bug-finder`, concrete failures to `debugging-investigator`, migrations to evolution, security-first questions to `security-review`, and implementation to the owning specialist.

## Failure handling

If the repository is too large, state a bounded slice and expand breadth-first. If source/config disagree, report both and identify which governs runtime. If ownership cannot be proven, keep it unknown.

## Stop conditions

Stop when the requested boundary, affected surfaces, confidence, and unresolved ambiguity are explicit enough for the next specialist to act safely.
