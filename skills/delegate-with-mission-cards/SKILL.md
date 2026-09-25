---
name: delegate-with-mission-cards
description: Delegate independent, bounded work to specialized reader and writer subagents with explicit ownership and parent verification. Use when parallel work can be scoped and verified independently.
---

# Mission Control

Delegate execution, not accountability. The parent owns decomposition, sequencing, decisions, integration, verification, and the final answer.

Mission Control is intentionally **model-agnostic**. Its roles do not pin a model or reasoning effort; they use the active Codex/runtime configuration.

## Delegation gate

Delegate only when the outcome and acceptance criteria are concrete, inputs are stable, scope is bounded, work is independently executable, and the result can be verified.

Keep work in the parent when it is small, tightly coupled, destructive, primarily a product decision, dependent on unavailable authority, or too ambiguous for a stop condition.

## Choose the lightest capable role

| Role | Use for |
| --- | --- |
| `pathfinder-reader` | Fast discovery and narrow fact gathering |
| `investigator-reader` | Debugging, research, tracing, reviews, and comparisons |
| `sentinel-reader` | High-consequence read-only security, privacy, migration, architecture, policy, or contract review |
| `patcher-writer` | Tiny isolated reversible changes |
| `builder-writer` | Normal bounded implementation across code, tests, docs, config, and other workspace artifacts |
| `architect-writer` | High-consequence cross-cutting implementation, migrations, and security hardening |

Escalate by **risk and complexity**, not by task length or prestige.

## Runtime portability

- The shipped role TOMLs deliberately omit `model` and `model_reasoning_effort`.
- The active Codex/runtime configuration chooses the model and reasoning behavior.
- User or organization model policy remains authoritative.
- If a runtime exposes named custom roles, select the matching role.
- If named roles are unavailable, do not pretend a profile was applied. Keep the same mission card and safety boundary in the parent or an available generic subagent, and report the degraded dispatch.
- Role identity is about permissions, scope, and execution behavior—not a specific model family.

## Mission ledger

Before dispatch, record:

```text
ID | objective | role | dependencies | read scope | write scope | acceptance evidence
```

Scopes may be files, directories, documents, datasets, generated artifacts, or other workspace resources. Mark each mission `Ready`, `Blocked`, or `Parent-owned`. Launch only `Ready` missions.

## Parallelism

Use the smallest useful fan-out. Favor parallel readers. Give every writer exclusive ownership of mutable resources. Treat shared schemas, lockfiles, migrations, generated artifacts, release files, and other shared outputs as single-owner surfaces.

Wait for dependencies before launching later waves. Do not permit recursive delegation unless the parent explicitly designed and authorized it.

## Reader mission card

```text
Mission ID:
Role:
Objective:
Decision this informs:
Allowed read scope:
Known facts and inputs:
Questions to answer:
Evidence required:
Forbidden actions:
Return format:
Stop or escalate when:
```

Readers must remain read-only, distinguish facts from inference, and return unknowns or blockers.

## Writer mission card

```text
Mission ID:
Role:
Objective:
Owned write scope:
Allowed read scope:
Known facts and inputs:
Behavioral requirements:
Acceptance criteria:
Constraints and invariants:
Validation required:
Do not touch:
Return format:
Stop or escalate when:
```

Writers preserve unrelated work, avoid opportunistic cleanup, and stop before leaving their ownership boundary.

## Review every handoff

Treat subagent output as evidence, not authority. Confirm the objective, inspect changed artifacts, corroborate material claims, and rerun proportionate checks against the integrated state.

Classify each handoff as `ACCEPTED`, `REWORK`, `BLOCKED`, or `REJECTED`.

Never delegate final integration, release judgment, user communication, or a decision that trades one requirement against another.

## Evidence by consequence

- Low: exact result plus nearest focused check.
- Medium: focused validation and affected-consumer inspection.
- High: adversarial review, negative paths, integration evidence, and rollback or containment analysis.

State skipped verification and its reason. Never present an unverified claim as confirmed.
