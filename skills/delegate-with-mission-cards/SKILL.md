---
name: delegate-with-mission-cards
description: Delegate independent, bounded repository work to specialized reader and writer subagents using mission cards, exclusive write ownership, staged fan-out, and parent-side verification. Use for parallel exploration, reviews, research, isolated implementation, tests, migrations, or security-sensitive work. Do not use when work is small, tightly coupled, ambiguous, or cannot be independently verified.
---

# Mission Control

Keep the parent on the critical path. Delegate execution, not accountability. The parent owns decomposition, sequencing, product judgment, integration, validation, and the final answer.

## Delegation gate

Delegate only when the outcome and acceptance criteria are concrete, inputs are stable, scope is precise, execution is independent, evidence can verify the result, and delegation saves more time or context than briefing and review consume.

Keep work in the parent when it is small, tightly coupled, destructive, primarily a product decision, dependent on unavailable credentials, or too ambiguous for a stop condition.

## Mission ledger

Record candidates before spawning:

```text
ID | objective | role | dependencies | read scope | write scope | acceptance evidence
```

Mark each `Ready`, `Blocked`, or `Parent-owned`. Launch only Ready missions and run dependent work in waves.

## Choose the lightest capable role

| Role | Use for |
| --- | --- |
| `pathfinder-reader` | Fast reconnaissance, files and symbols, codebase maps, and narrow facts |
| `investigator-reader` | Debugging, behavior tracing, root causes, reviews, and option comparison |
| `sentinel-reader` | Security, auth, privacy, migrations, architecture, public APIs, and subtle high-consequence analysis |
| `patcher-writer` | Tiny, isolated, reversible edits with an obvious diff and fast validation |
| `builder-writer` | Standard implementation, tests, fixes, contained refactors, docs, and configuration |
| `architect-writer` | High-risk migrations, architecture changes, security hardening, and failure-sensitive work |

Escalate for ambiguity, blast radius, irreversibility, hidden coupling, or difficult validation. Never escalate merely because work contains many repetitive items.

## Model tiers

Use Luna Max for the four general roles: `pathfinder-reader`, `patcher-writer`, `investigator-reader`, and `builder-writer`. Escalate high-risk read-only review to `sentinel-reader` on Sol High. Reserve Sol Max for `architect-writer`, where irreversible migrations, architectural risk, security hardening, or failure-sensitive integration justify the highest tier. Do not escalate merely because a mission is long, repetitive, or important.

## Parallelism

Use the smallest useful fan-out, normally two to four Ready missions. Favor parallel readers. Give every writer a mutually exclusive write set. Treat lockfiles, schemas, migrations, generated artifacts, shared configuration, and release files as single-owner surfaces. Wait for a wave before launching dependent work. Do not permit recursive delegation unless explicitly designed and authorized.

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

Require separate answer, exact evidence, labeled inference, confidence with reason, and unknowns or blockers. Readers must not edit or silently broaden scope.

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

Require writers to preserve unrelated changes, make the smallest coherent change, avoid formatting churn and opportunistic cleanup, and stop before leaving ownership. Require an implementation summary, exact files, validation results, `PASS`/`PARTIAL`/`BLOCKED` status, and remaining risks.

## Review every handoff

Treat output as evidence, not authority. Confirm the objective, check boundaries, inspect every diff, corroborate material claims, re-run proportionate validation against the integrated state, and resolve conflicts by evidence. Mark missions `ACCEPTED`, `REWORK`, `BLOCKED`, or `REJECTED`.

Never delegate final integration, release judgment, user communication, or decisions trading one requirement against another.

## Match evidence to risk

- Low: targeted diff plus nearest focused deterministic check.
- Medium: focused tests, relevant static checks, and affected consumer inspection.
- High: adversarial review, negative paths, integrated validation, rollback or migration analysis, and explicit residual risks.

State skipped validation and its reason. Never present an unverified claim as confirmed.
