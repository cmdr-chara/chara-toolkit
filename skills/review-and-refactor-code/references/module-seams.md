# Module seams and domain boundaries

Use only when a proposed refactor changes responsibility placement, contracts, or domain terminology. Prefer fewer consumer-facing obligations, not a higher abstraction count.

## Decide whether the boundary earns its cost

1. Locate real callers and record the obligations they currently carry: ordering, errors, data shape, idempotency, configuration, and side effects.
2. Identify rules duplicated across callers. A new interface earns its place when it centralizes those rules while reducing caller coupling.
3. Apply a removal thought experiment. If deleting the layer would eliminate complexity rather than redistribute it to callers, the layer is likely an unnecessary pass-through.
4. Do not invent interchangeable adapters without a real alternate implementation, consumer seam, or testing need.
5. Prefer tests at the stable consumer-facing contract, with internal implementation and storage choices hidden when practical.

## Language is part of the contract

Clarify ambiguous terms with concrete counterexamples. Account, owner, user, cancellation, and status can each mean different things in different business contexts. Identify the invariant and boundary before renaming types or exported methods. Track any required compatibility aliases explicitly.

## Evidence for an approved slice

Record before/after caller touchpoints, repeated rules removed, interface obligations preserved, migration cost, and focused parity checks. Do not call a public API change or altered business behavior a behavior-preserving refactor. Stop for required approval as defined in the primary skill.
