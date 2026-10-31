# Supplemental End-to-End Workflow Scenarios

**Information checked:** 2026-08-17

## 17. `content-provenance-hygiene` — Inspect and sanitize a user-owned PDF

**Situation:** A user owns a PDF exported from a design tool and wants to understand which provenance/document metadata is present, remove only the requested metadata classes, keep visible content intact, and retain the original. Some PDF inspection tools may be installed locally, but which ones must be checked at runtime.

**Inputs:** exact PDF artifact; ownership/authorization context; inspect-versus-clean intent; preservation invariants; requested metadata scope; available local inspectors and their versions.

**Expected workflow:**

1. Freeze the target, output strategy, working-tree/user-file state, requested metadata scope, and visible-content invariants.
2. Probe read-only for available PDF inspectors (for example qpdf or pikepdf); do not install tools, start services, or upload the file silently.
3. Mark surfaces no available tool can read (incremental revisions, attachments, signatures) as not inspectable before promising rebuild behavior.
4. Inspect first and classify findings as confirmed, probable, informational, or not detected rather than inferring provenance from file origin.
5. Build the smallest deterministic remediation plan for the confirmed requested findings and state any collateral metadata/container consequences.
6. Stop at `AWAITING_APPROVAL` if the discovered operation exceeds the user's original deterministic scope, such as broad metadata stripping or a materially lossy rebuild.
7. For an already-approved bounded cleanup, apply only the required tool operation and write a separate output by default.
8. Re-inspect the output; compare target findings, file integrity, visible-content invariants, and unexpected metadata loss.
9. Report `INSPECTED`, `AWAITING_APPROVAL`, `SANITIZED`, or `BLOCKED` without claiming that the result proves human authorship or erases the artifact's real history.

**Expected artifacts:** target/authorization record; tool availability and version evidence; pre-clean provenance-hygiene findings; bounded remediation plan; cleaned artifact when authorized; post-clean inspection; before/after side-effect record; residual unknowns and final state.

**Verification:** the original remains available; inspection precedes mutation; tool availability is verified at runtime; the cleaned artifact still parses/opens; the approved target finding is absent or reduced on re-inspection; visible content is preserved for metadata-only operations; no detector-evasion or authorship claim is introduced.

**Stop/escalate:** stop when no tool can inspect the requested surface, evidence is ambiguous, authorization is unclear, the requested operation becomes authorship/detector evasion, or sanitation would widen into substantive text/image editing. Hand unexplained tool corruption to `debugging-investigator` and integrated release judgment to `verification-and-release`.

## 18. `completion-proof` — Finish an approved multi-surface change without premature completion

**Situation:** A substantial repository change has already been designed and approved. It renames a public configuration key and touches implementation, call sites, tests, documentation, generated output, and release metadata. Previous attempts have repeatedly reported success while leaving one or two required surfaces stale, and final summaries have contained inaccurate counts.

**Inputs:** the user's request in their own words; approved plan and exclusions; current working tree and user work; owning specialist and its acceptance criteria; repository done rules and required checks; known generated/vendor boundaries; approval state; candidate fingerprint method.

**Expected workflow:**

1. Keep the owning specialist's approval/safety boundaries authoritative and write a done contract: numbered clauses, each with a named source, an observable outcome, a probe, and a minimum evidence class; optional extras listed separately.
2. Trace both ways: every phrase of the request maps to a clause or a stated exclusion, and every clause maps to a source, so nothing is dropped and nothing is invented.
3. Open a roster for each population (old key occurrences, call sites, docs pages) with a reproducible discovery query, a discovery check against a known member, and early exclusions.
4. Review every probe before running it, including probes written by other agents or found in the repository; confirm it is safe and able to fail (known positive, before/after delta, non-zero test collection).
5. Work clauses in dependency order and add seam clauses for the combined result (build, end-to-end path, regenerated output), recording receipts from observations rather than intent.
6. After the last mutation, fingerprint the candidate, mark receipts invalidated by later edits as `STALE` and re-collect them, and re-run every roster discovery query to catch new or missed members.
7. Hunt for gaps: unmapped request phrases, partially applied renames, placeholders, loosened or skipped tests, stale generated files.
8. Audit every completion, absence, universal, and numeric sentence in the draft report against a fresh receipt or closed roster; recompute or weaken unbound claims.
9. Report `COMPLETE` only when every required clause is `PROVEN`, `COMPLETE_WITH_WAIVERS` when the remainder is `WAIVED` by recorded authority, and `BLOCKED` with blocker, owner, and unblock step otherwise.

**Expected artifacts:** done contract with source trace; rosters with balance lines; reviewed probes; receipts tagged with candidate fingerprints; waiver and blocker records; staleness-sweep and closure-check record; claim audit; final verdict with found-not-done follow-ups.

**Verification:** no required clause or roster member disappears silently; rosters balance on the final candidate; blocked and waived work is never counted as done; probes are safe and demonstrably able to fail; final-state receipts supersede stale intermediate results; every stated count is recomputed; user work and specialist stop conditions remain preserved.

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

## 20. `toolchain-preflight` — Resolve a blocked Windows build and browser path

**Situation:** A repository documents an npm build and a browser smoke test, but PowerShell selects a policy-blocked `npm.ps1` shim, a quote-heavy fallback command is split across native argument boundaries, and Playwright has no managed Chromium binary. The user wants the actual task resumed without changing system execution policy or downloading a large browser unnecessarily.

**Inputs:** repository root and instructions; working-tree status; OS and PowerShell edition; package manifest/lockfile; documented build and browser commands; executable-discovery evidence; first exact errors; available system or in-app browser capabilities; mutation and download authorization boundary.

**Expected workflow:**

1. Freeze the real task command, expected success signal, repository/user state, required runtime and browser capability, and current unknowns.
2. Resolve the actual PowerShell, Node, and package-manager executables; probe each required executable once rather than repeatedly invoking a blocked alias.
3. Classify the first failures separately as blocked shim, native argument boundary, and missing managed browser capability; do not call them application defects.
4. Select the repository-supported native package-manager executable and use an argument array, structured tool call, or temporary script for quote-heavy arguments.
5. Check for a supported system or in-app browser before proposing a managed browser download.
6. Run one narrow build probe and one browser-capability probe through the selected paths; change the hypothesis before any retry.
7. Run the actual documented build and browser smoke path through the now-stable invocation.
8. Inspect the working tree and run-scoped scratch directory; remove temporary launchers or disclose exactly what remains.
9. Hand a reproducible application failure to `debugging-investigator`, a required runtime transition to `codebase-evolution-controller`, or successful task execution back to the owning builder.

**Expected artifacts:** environment contract; executable and capability probe record; classified failure ledger; resolved invocation; actual build/browser outcomes; repository/scratch state-impact record; explicit handoff and residual unknowns.

**Verification:** no system policy is changed; no global tool or browser is installed without authorization; required executables are probed once; retries use a changed hypothesis; the actual task path—not only a version/list command—is exercised; user work and unrelated repository state remain preserved.

**Stop/escalate:** stop when one supported invocation reaches the real task, when the failure becomes application behavior, when a version migration is required, when no supported browser/runtime remains, or when the next action needs new installation or system-change authority. Do not retain toolchain preflight as a mandatory wrapper after the environment path works.

## 21. `security-review` — Tenant-scoped invoice API authorization

**Situation:** A service adds invoice read/update endpoints that accept resource IDs from authenticated users and also fetch signed attachment URLs from a user-supplied storage reference.

**Expected workflow:**
1. Freeze the candidate/diff and map authenticated entry points, tenant/resource ownership, outbound URL construction, and sensitive outputs.
2. Trace object-level authorization for every invoice operation rather than treating login as permission.
3. Follow user-controlled identifiers/URLs into database, redirect, network, and file/storage sinks.
4. Raise only reachable findings with a concrete attack path; keep uncertain deployment assumptions labeled.
5. Propose the smallest control fix and regression evidence, then hand implementation to the owning builder when edits are authorized.

**Expected artifacts:**
- trust-boundary map;
- focused security findings with affected boundary, precondition, impact, severity rationale, and fix direction;
- explicit non-findings/unknowns where exploitability was not established;
- regression-test plan.

**Verification:**
- each finding is tied to a reachable authorization/input path rather than scanner output alone;
- object/tenant ownership is checked at the operation boundary;
- SSRF/path/file claims account for the actual deployment and redirect behavior;
- no production exploit execution is required for proof.

**Stop/escalate:**
Stop when reportable findings have sufficient evidence and the fix owner is clear. Escalate a concrete unexplained runtime symptom to `debugging-investigator`, or a dependency/version transition to `codebase-evolution-controller`.

## 22. `rust-engineering` — Port a bounded byte-processing module

**Situation:** Rust has already been selected for a local processing crate. The user requests a small module port from Python, preserving arbitrary byte inputs and ordered output. The crate has a declared minimum compiler, optional mutually exclusive backends, and an existing public Rust API. Service rollout and old-service removal are excluded.

**Inputs:** source revision and tests; accepted byte/integer domain; target crate and consumer signatures; working-tree state; compiler/edition/MSRV declarations; feature policy; safe baseline commands; authorized scope.

**Expected workflow:** establish the observable source contract and important untested edges; preserve the provided Rust consumer interface; choose representations that retain ordering and byte values; implement a bounded change; compare source and Rust results on ordinary, boundary, invalid, and generated valid inputs; run the affected supported configurations and documentation examples; inspect the diff for unrelated API, lint, or lockfile changes.

**Expected artifacts:** Rust implementation and focused tests; concise behavior/API mapping; authorized or unresolved differences; observed command outcomes with configuration and toolchain; explicit gaps. The implementation must not silently narrow the source domain or claim a deployment.

**Verification:** byte sequences round-trip; output order and run splitting match the source; malformed/limit behavior remains explicit; caller compilation still works; supported backends are checked separately; unavailable minimum-compiler or foreign-target checks remain unverified. See [rust-engineering.md](rust-engineering.md) for reproducible fixture requests and independent acceptance criteria.

**Stop/escalate:** retain the known input contract when a shortcut would narrow it; stop dependent design for an unresolved material domain question. Hand operational rollout to `codebase-evolution-controller`, unknown causal failures to `debugging-investigator`, and review-only requests to `review-and-refactor-code`. Missing tools do not authorize installation or a reduced support claim.

## 23. `kotlin-engineering` — Implement cancellation-safe shared logic

**Situation:** Kotlin is selected for an existing JVM or KMP module. A loader must preserve results, expose only its documented missing-item fallback, propagate cancellation, and balance per-invocation state. Android/Compose integration is included only when the changed path requires it.

**Inputs:** source/callers, exception and lifecycle contracts, module/source-set boundaries, Kotlin/API/JVM settings, existing Gradle and test policy, working-tree state and supported targets.

**Expected workflow:** establish observable results and errors; trace coroutine scope, interruption, and cleanup; implement within the existing module; use controlled suspension/failure tests; select actual repository tasks and distinguish host from target evidence.

**Expected artifacts:** Kotlin implementation and focused tests, preserved API/module contracts, command outcomes, target gaps.

**Verification:** success/error/cancellation identity and cleanup hold across suspension and overlap; supported callers compile where available; host success does not imply Android device or iOS behavior. Fixture request and independent checks are in [language-engineering.md](language-engineering.md).

**Stop/escalate:** keep unknown causal failures with debugging, toolchain/platform transitions with evolution, and review-only work with the reviewer. Missing SDKs do not authorize downloads or removal of targets.

## 24. `python-engineering` — Repair an async helper contract

**Situation:** A Python helper used by a service must translate one expected absence, preserve other failures and cancellation, and release its own activity contribution on every finish.

**Inputs:** callable/exception contract, supported interpreter and environment/import roots, safe test command, existing dependency and packaging policy, protected source state.

**Expected workflow:** inspect input and effect boundaries, implement the accepted behavior without broad error suppression, coordinate interruption tests with events, verify import/consumer behavior, and identify untested installed-package/interpreter evidence.

**Expected artifacts:** bounded implementation and meaningful tests, observed interpreter/environment and check outcomes, explicit packaging/platform gaps.

**Verification:** result identity, allowed fallback, exception/cancellation propagation and overlapping cleanup are observed; annotations do not substitute for runtime validation; source-tree checks do not establish installed-artifact behavior.

**Stop/escalate:** do not replace dependencies/environment or change interpreter support to make a local pass. Unknown root causes and deployment transitions retain their existing owners.

## 25. `cpp-engineering` — Preserve capacity at native integer boundaries

**Situation:** A C++ capacity object must preserve its public header/API and build standard while accepting every representable size value. Arithmetic boundaries must not turn a rejected request into a successful reservation.

**Inputs:** target/header/callers, integer and failure guarantees, declared C++ standard, ABI/exception policy, native build/test setup and protected state.

**Expected workflow:** specify observable reservation/release behavior; establish valid state and arithmetic/lifetime obligations; implement a bounded correction; exercise ordinary and maximum-value transitions through consumer code; run the selected native target.

**Expected artifacts:** unchanged public surface, implementation and focused tests, build/configuration evidence and platform limits.

**Verification:** accepted requests update usage exactly and rejected requests preserve it across edge sequences; required header use compiles; a sanitizer or host pass is never called universal UB/plugin/device proof. Qt/QML checks load only for a relevant framework boundary.

**Stop/escalate:** ABI/compiler/framework transitions belong to evolution; unexplained crashes belong to debugging; C-only source does not become C++ work.

## 26. `swift-engineering` — Prevent stale actor completions

**Situation:** A selected Swift actor API awaits a loader. A newer invocation must supersede an older invocation even if the older one completes later. Existing error, package, and isolation contracts remain intact.

**Inputs:** public actor/callers, latest-request semantics, language/tool and platform requirements, existing tests, actual compiler/SDK availability and protected source state.

**Expected workflow:** identify the reentrant interval across suspension, implement the state invariant within the actor, preserve failure propagation, add controlled-completion tests, and distinguish static inspection from any available execution.

**Expected artifacts:** bounded Swift implementation and test artifacts, source/isolation evidence, precise compilation/runtime gaps.

**Verification:** a superseded success cannot overwrite a newer result, and thrown errors retain their contract. Swift package checks, Apple SDK builds, UI launch and GPU output are separate claims. An absent compiler is unverified execution, not a passing source-level test.

**Stop/escalate:** no SDK/target increase or unchecked isolation escape to quiet diagnostics. Evolution owns support-mode transitions, review owns finding admission, and actual Apple/Metal execution gaps remain visible.

## 27. `go-engineering` — Bound callback concurrency and release permits

**Situation:** A Go gate admits bounded callback work, preserves caller context/error identity, and must return permits on success, failure and panic. Cancellation while waiting must not leak work or capacity.

**Inputs:** module/workspace support, public API and context/lifetime contract, safe dependency-free fixture, build tags/platform/cgo selection and protected state.

**Expected workflow:** identify permit/channel owner, cancellation checks and callback completion; implement within the existing module; arrange controlled waiting/cancellation and failure tests; run supported tests/vet/race checks with actual environment identity.

**Expected artifacts:** bounded implementation and behavior tests, preserved module and error contracts, selected build evidence and limitations.

**Verification:** callback cardinality/capacity, error/context identity, panic propagation and permit reuse hold under the exercised orderings; cancellation signaling is not confused with joined completion; a clean race run does not prove every schedule or tag/platform path.

**Stop/escalate:** do not raise Go/module support, introduce dependencies, detach workers or change production state to manufacture a pass. Unknown leaks or races retain their diagnosis owner.

