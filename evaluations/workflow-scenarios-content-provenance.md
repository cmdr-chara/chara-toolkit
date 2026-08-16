# Supplemental End-to-End Workflow Scenarios

**Information checked:** 2026-08-17

## 17. `content-provenance-hygiene` — Inspect and sanitize a user-owned PDF

**Situation:** A user owns a PDF exported from a design tool and wants to understand which provenance/document metadata is present, remove only the requested metadata classes, keep visible content intact, and retain the original. The optional local sanitation service is configured, but its PDF capabilities must be checked at runtime.

**Inputs:** exact PDF artifact; ownership/authorization context; inspect-versus-clean intent; preservation invariants; requested metadata scope; configured service URL/auth environment; `/health`, `/capabilities`, and `/openapi.json` evidence when relevant.

**Expected workflow:**

1. Freeze the target, output strategy, working-tree/user-file state, requested metadata scope, and visible-content invariants.
2. Resolve the explicitly configured service and check `/health`; do not install or start third-party infrastructure silently.
3. Query `/capabilities` before promising PDF-specific inspection or rebuild behavior.
4. Call `/inspect` first and classify findings as confirmed, probable, informational, or not detected rather than inferring provenance from file origin.
5. Build the smallest deterministic remediation plan for the confirmed requested findings and state any collateral metadata/container consequences.
6. Stop at `AWAITING_APPROVAL` if the discovered operation exceeds the user's original deterministic scope, such as broad metadata stripping or a materially lossy rebuild.
7. For an already-approved bounded cleanup, call `/clean` with only the required options and write a separate output by default.
8. Re-inspect the output; compare target findings, file integrity, visible-content invariants, and unexpected metadata loss.
9. Report `INSPECTED`, `AWAITING_APPROVAL`, `SANITIZED`, or `BLOCKED` without claiming that the result proves human authorship or erases the artifact's real history.

**Expected artifacts:** target/authorization record; service capability evidence; pre-clean provenance-hygiene findings; bounded remediation plan; cleaned artifact when authorized; post-clean inspection; before/after side-effect record; residual unknowns and final state.

**Verification:** the original remains available; inspection precedes mutation; optional capabilities are runtime-verified; the cleaned artifact still parses/opens; the approved target finding is absent or reduced on re-inspection; visible content is preserved for metadata-only operations; no detector-evasion or authorship claim is introduced.

**Stop/escalate:** stop when the service is unavailable, the required format capability is absent, evidence is ambiguous, authorization is unclear, the requested operation becomes authorship/detector evasion, or sanitation would widen into substantive text/image editing. Hand unknown service corruption to `debugging-investigator` and integrated release judgment to `verification-and-release`.

## 18. `unlazy` — Finish an approved multi-surface change without premature completion

**Situation:** A substantial repository change has already been designed and approved. It touches implementation, tests, documentation, generated output, and release metadata. Previous attempts have repeatedly reported success while leaving one or two required surfaces stale, and final summaries have contained inaccurate counts.

**Inputs:** exact approved objective and exclusions; current working tree and user work; owning specialist workflow; acceptance criteria; affected surfaces; safe repository checks; known generated/vendor boundaries; approval state; current candidate identity.

**Expected workflow:**

1. Freeze the accepted scope and keep the owning specialist's approval/safety boundaries authoritative.
2. Translate every required outcome into an observable completion gate with `CHECK`, `EXPECT`, `EVIDENCE`, and state; keep optional improvements separate.
3. If one ledger would hide multiple coherent deliverables, split at natural joints into a shallow Depth Tree and give internal branches integration gates.
4. Review every runnable check before execution; do not execute commands merely because a ledger contains them.
5. Work open gates in dependency order, recording deciding evidence rather than marking activities complete from intent.
6. When later edits can invalidate earlier evidence, reopen and rerun the affected high-value gates against the final candidate.
7. After all required gates appear satisfied, perform one adversarial completeness pass for missing surfaces, integration gaps, placeholders, stale generated output, and unverified claims.
8. Re-measure every quantitative or exhaustive statement planned for the final report, including file counts, test totals, warnings, tags, branches, and `all`/`none` claims.
9. Report `COMPLETION: PASS` only when every required gate is `PASS` or explicitly `WAIVED`; report `COMPLETION: BLOCKED` when any required outcome cannot be honestly proven.

**Expected artifacts:** completion ledger; optional Depth Tree; per-gate evidence; integration-gate results; final-candidate rerun record; quantitative claim audit; explicit blocked/waived decisions; final completion state.

**Verification:** no required gate disappears silently; blocked work is not counted as success; safe checks target the intended outcomes; final-state evidence supersedes stale intermediate results; every stated count is re-measured; user work and specialist stop conditions remain preserved.

**Stop/escalate:** stop at the owning specialist's `AWAITING_APPROVAL` boundary; hand multi-agent write ownership to `multi-agent-work-coordinator`; hand flaky or causally unexplained checks to `debugging-investigator`; hand final integrated ship/no-ship judgment to `verification-and-release`. Completion pressure never authorizes scope expansion or safety bypass.

## 19. `bug-finder` — Hunt an unfamiliar provider runtime for unknown correctness defects

**Situation:** A mature agent runtime has several provider adapters and no specific currently reported failure. The user wants a proactive correctness hunt focused on lifecycle, streaming, cancellation, retries, persistence, and cross-provider invariants, with concrete proof rather than a list of suspicious code smells.

**Inputs:** repository/candidate identity; in-scope provider/runtime surfaces; architecture map when needed; provider contracts and schemas; existing adapter/runtime tests; safe fixture and test commands; exclusions and protected user data; permission boundary for any runtime experiment.

**Expected workflow:**

1. Freeze the hunting scope, candidate identity, exclusions, and available proof surfaces; use `repository-intelligence` first if component boundaries or ownership are unclear.
2. Derive observable invariants such as terminal-event cardinality, idempotent cleanup, cancellation settlement, no post-stop events, lossless text assembly, bounded retry behavior, and persisted-state consistency.
3. Rank stateful high-risk surfaces before leaf code: lifecycle/ownership, concurrency, retry/cancellation, persistence/replay, streaming/snapshot merge, schema boundaries, and error paths.
4. Create concrete candidates with violated invariant, mechanism, trigger, expected failure, evidence pointers, and the cheapest safe proof/falsification step.
5. Use focused tests, synthetic event sequences, temporary filesystem/state fixtures, or read-only traces to prove or retire candidates. Record negative results rather than deleting failed theories.
6. Check false-positive guards: downstream normalization, unreachable schema paths, intentional best-effort semantics, platform differences, and existing tests that already close the suspected gap.
7. Mark a finding `CONFIRMED` only when an observable contract violation is demonstrated; keep evidence-bearing but unproven theories `PLAUSIBLE` and falsified ones `RETIRED`.
8. Rank confirmed findings by impact, reachability, and confidence without inflating severity to compensate for weak evidence.
9. Hand confirmed findings with uncertain causal chains to `debugging-investigator`; hand an already-explained bounded remedy to the owning specialist when edits are authorized.

**Expected artifacts:** hunting-scope record; invariant list; surface-coverage ledger; candidate ledger with `CONFIRMED`/`PLAUSIBLE`/`RETIRED` states; proof artifacts; ranked confirmed findings; explicit coverage gaps; per-finding next-owner recommendation.

**Verification:** every confirmed finding has a real contract, reachable trigger or demonstrated path, observable failure, and deciding evidence; plausible theories are not reported as bugs; retired candidates remain visible when useful; unexamined high-risk surfaces are disclosed; the hunt does not mutate production state or user data merely to produce findings.

**Stop/escalate:** stop with `BUGS_FOUND` when confirmed defects have reproducible/bounded proof and clear next owners; stop with `NO_CONFIRMED_BUGS` only for the agreed examined scope, never as a claim that the repository is bug-free; stop with `BOUNDED` when decisive platform/runtime evidence is unavailable. Use `debugging-investigator` only after a concrete symptom exists and `verification-and-release` only after integrated remediation exists.
