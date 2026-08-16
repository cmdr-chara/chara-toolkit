# Bug candidate ledger

Use one record per suspected correctness defect. Keep evidence and falsification visible; do not collapse candidates into prose until the hunt is complete.

```text
ID: BF-01
STATE: PLAUSIBLE | CONFIRMED | RETIRED
SURFACE: <component / boundary>
INVARIANT: <observable condition that should hold>
MECHANISM: <specific way the invariant could be violated>
TRIGGER: <reachable preconditions / event order / input>
EXPECTED FAILURE: <observable consequence if true>
EVIDENCE FOR:
- <code/runtime/test evidence>
EVIDENCE AGAINST:
- <counterevidence>
PROOF / FALSIFICATION:
- <smallest safe discriminating experiment>
RESULT: <raw deciding observation or pending>
CONFIDENCE: low | medium | high
NEXT OWNER: bug-finder | debugging-investigator | <implementation specialist>
```

## Admission rules

A candidate is worth keeping only when it has all of:

1. a real contract or invariant;
2. a concrete mechanism, not a vague component suspicion;
3. a reachable trigger or a clearly stated reachability unknown;
4. an observable failure that would matter to a user, operator, persisted state, or protocol consumer;
5. a proof/falsification method that can distinguish true from false.

Move a candidate to `CONFIRMED` only after the deciding observation demonstrates the contract violation. Move it to `RETIRED` when evidence disproves the mechanism, shows the path is unreachable, or establishes that the behavior is intentional and contract-compliant.

## Coverage ledger

For broad hunts, keep a separate surface list so `NO_CONFIRMED_BUGS` does not accidentally mean "we looked at three files and stopped":

```text
SURFACE                              STATUS       NOTES
provider lifecycle                   examined     4 candidates / 1 confirmed
persistence and replay               examined     no candidate admitted
web detail-subscription lifecycle    partial      browser harness unavailable
cross-platform process cleanup       unexamined   Windows runner unavailable
```

The final report must name material partial/unexamined high-risk surfaces.