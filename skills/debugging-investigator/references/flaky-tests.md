# Flaky test investigation

Adapted concepts from SkillMedev/skills under MIT; see `THIRD_PARTY_NOTICES.md`.

A flaky test usually depends on uncontrolled order, timing, shared state, clock, network, or nondeterministic data.

## Method

1. Reproduce repeatedly in isolation and in the suite. A suite-only failure points toward cross-test contamination.
2. Randomize execution order where supported and capture the failing seed/order.
3. Replace fixed sleeps with waits on observable state.
4. Isolate shared mutable state, transactions, caches, environment variables, and globals.
5. Freeze clocks and seed randomness when time/randomness is not the behavior under test.
6. Remove real network dependencies from deterministic tests unless the test is explicitly an integration check.
7. Sort unordered results before asserting when order is not contractual.
8. Quarantine only as a temporary containment step with an owner and follow-up; retry is not the fix.

A fix is convincing when the previously failing seed or reproduction passes repeatedly and the hidden dependency can be named. If repeated attempts cannot reproduce a critical flake, improve failure artifacts rather than deleting the test.
