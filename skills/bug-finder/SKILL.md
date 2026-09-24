---
name: bug-finder
description: Hunt for previously unknown correctness defects by deriving invariants and proving or retiring candidates. Use for proactive bug discovery without a specific known symptom.
---

# Bug Finder

Search for unknown correctness defects without turning suspicious code into unsupported bug claims.

## Trigger boundary

Use this skill for:
- proactive bug hunts without a known failing symptom;
- searches for races, lifecycle failures, data-loss paths, duplicate effects, stuck ownership, or broken recovery;
- requests to distinguish confirmed defects from plausible theories.

Do not trigger for:
- a concrete failure whose cause is unknown; use `debugging-investigator`;
- a defined PR/diff review; use `review-and-refactor-code`;
- security-only review; use `security-review`;
- generic improvement prioritization or release approval.

## Required inputs

Resolve repository/candidate identity, hunt scope, architecture boundaries when needed, available contracts/tests/fixtures/traces, safe experiment permissions, and protected user work.

## Safety baseline

- Preserve the working tree and uncommitted work.
- Start read-only and do not mutate production data or external systems to prove a theory.
- Generated/vendor code is evidence only until its authoritative source is known.
- Missing tests, odd code, or severity intuition are not proof of a defect.

## Workflow

1. **Define the hunt.** State in-scope subsystems, excluded surfaces, and coverage limits.
2. **Derive invariants.** Write observable rules that must hold: exactly-once/at-most-once events, ownership release, persistence durability, idempotency, ordering, retry bounds, cleanup, or state-transition rules.
3. **Prioritize surfaces.** Favor stateful boundaries, concurrency, recovery, persistence, cancellation, caching, serialization, and cross-process ownership.
4. **Create candidates.** Record each candidate in `references/candidate-ledger.md` with invariant, evidence, falsifier, and status.
5. **Prove or retire.** Use the smallest safe fixture, trace, targeted test, or static contract evidence that can discriminate the claim. A confirmed bug requires an observable contract violation.
6. **Rank confirmed defects.** Separate confirmed, plausible, and retired candidates. State unexamined high-risk surfaces rather than implying exhaustive coverage.
7. **Hand off.** If causal explanation or the smallest fix remains uncertain, pass the confirmed symptom to `debugging-investigator`.

## Handoffs and interaction boundaries

Repository intelligence may supply boundaries. Security-only findings go to `security-review`. Known root causes go directly to the owning implementation specialist. Substantial accepted remediation may use `unlazy`; integrated release judgment belongs to `verification-and-release`.

## Failure handling

If a candidate cannot be discriminated safely, leave it plausible with the missing evidence. If environment limits prevent representative proof, state that limitation. Do not inflate confidence to fill coverage gaps.

## Stop conditions

Stop when each admitted candidate is confirmed, retired, or explicitly left plausible with a reason, and material unexamined surfaces are disclosed.
