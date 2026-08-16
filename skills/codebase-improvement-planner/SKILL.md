---
name: codebase-improvement-planner
description: Discover and prioritize evidence-backed opportunities to improve an existing codebase when no specific change has been chosen yet, then recommend the highest-value next upgrade and optionally execute an approved bounded maintenance slice. Use when the user asks what should be improved, modernized, simplified, hardened, cleaned up, or upgraded across a repository. Do not use when the primary task is a known dependency/schema migration, a concrete bug investigation, a measured performance bottleneck, a defined code review/refactor, platform-specific production work, or final release approval.
---

# Codebase Improvement Planner

Turn an open-ended “make this codebase better” request into a ranked, evidence-backed improvement backlog and one defensible next upgrade.

## Trigger boundary

Use this skill for:

- “Inspect this repository and tell me what we should improve next.”
- “Audit the codebase and separate major, medium, and minor improvements.”
- “What is the highest-value technical upgrade we can make without a predefined task?”
- “Find maintainability, reliability, testing, architecture, tooling, dependency-health, and operational improvements, then recommend the next move.”
- “Improve this codebase” when the user has not already specified the exact change.

Do not trigger for:

- a known framework, runtime, dependency, API, schema, storage, or compatibility transition—use `codebase-evolution-controller`;
- a concrete failure or regression whose cause is unknown—use `debugging-investigator`;
- a named slow path with a measurable performance objective—use `optimize-codebase-performance`;
- review or refactoring of an already-defined diff or code area—use `review-and-refactor-code`;
- broad architecture or ownership mapping where no improvement decision is requested—use `repository-intelligence`;
- platform-specific production implementation or audit—use the applicable web or mobile builder;
- integrated release readiness—use `verification-and-release`.

This skill owns **opportunity discovery, classification, prioritization, and next-upgrade selection**. It does not absorb specialist workflows after the winning improvement is known.

## Required inputs

Obtain or state:

1. repository root and current working-tree state;
2. the user’s goal, if any, such as reliability, maintainability, delivery speed, cost, quality, or modernization;
3. important product or operational constraints;
4. excluded paths, generated/vendor boundaries, and protected contracts;
5. available build, test, lint, type-check, benchmark, CI, and deployment evidence;
6. whether the request is discovery only or also authorizes implementation after a proposal.

If the user gives no optimization goal, use repository evidence to build a balanced backlog rather than inventing business priorities.

## Safety baseline

- Inspect and preserve uncommitted user work. Do not assume a clean working tree.
- Start read-only. Do not reformat, regenerate, install, upgrade, delete, rename, or rewrite files merely to discover improvement candidates.
- Treat a broad request such as “improve this repo” as authorization to inspect and propose first, not as permission for an unbounded rewrite.
- Never edit generated output before identifying its authoritative generator and inputs.
- Do not turn optional style preferences into improvement findings.
- Do not recommend replacing working technology only because a newer tool exists.
- For volatile dependency, runtime, security, or platform claims, verify current primary-source evidence before treating the claim as a reason to change.
- Preserve behavior unless the user explicitly requests a behavior change and the appropriate implementing workflow owns it.

## Workflow

### 1. Define the improvement question

Write a compact audit contract:

```text
Repository/scope:
Primary goal:
Protected behavior/contracts:
Excluded areas:
Available evidence:
Implementation authorization:
Decision to make: which improvement should happen next?
```

If scope is enormous, begin repository-wide at signal level, then deepen only the highest-value candidate areas. State coverage limits instead of implying exhaustive inspection.

### 2. Establish the baseline

Inspect enough of the repository to understand what “better” can mean here:

- top-level structure, languages, packages/workspaces, manifests, lockfiles, generated code, and deployment units;
- test layout, CI checks, static analysis, formatting/linting, type checking, build scripts, and release automation;
- public/internal contracts, storage/configuration boundaries, migrations, queues/events, and operational entry points;
- error handling, retries, concurrency, resource ownership, observability, feature flags, and rollback mechanisms where present;
- documentation and runbooks that affect safe maintenance;
- recent or concentrated churn when history is available and relevant.

Use `repository-intelligence` as a prerequisite when architecture, ownership, or consumer boundaries are too uncertain to rank broad changes safely.

### 3. Scan improvement domains

Search for candidates across the repository rather than overfitting to one kind of cleanup.

#### Architecture and boundaries

Look for demonstrated coupling, duplicated domain logic, unstable shared modules, unclear ownership boundaries, circular dependencies, oversized integration hubs, or contracts that make routine change unnecessarily risky.

#### Correctness and reliability

Look for weak validation, error swallowing, unsafe retry/idempotency behavior, race-prone state, missing cleanup, fragile lifecycle assumptions, weak rollback, or production-sensitive paths without defensive evidence.

#### Verification quality

Look for critical behavior with no focused tests, slow or flaky suites that reduce feedback quality, missing contract/integration coverage, weak negative-path coverage, or CI gates that do not represent actual risk.

#### Maintainability and code health

Look for dead abstractions, repeated nontrivial logic, high-complexity modules, unclear APIs, scattered configuration, obsolete compatibility paths, or local structure that demonstrably increases change cost.

#### Developer experience and delivery

Look for unnecessarily slow or inconsistent local workflows, duplicated build steps, fragile scripts, unclear setup, avoidable manual release work, non-reproducible generation, or CI work that can be simplified without weakening evidence.

#### Dependency and runtime health

Identify stale, unsupported, duplicated, risky, or unnecessary dependencies only when repository evidence justifies investigation. A specific migration, version selection, or compatibility plan belongs to `codebase-evolution-controller`.

#### Performance and resource efficiency

Surface suspected expensive paths only as hypotheses unless measurement exists. A candidate that becomes performance-primary hands off to `optimize-codebase-performance` for comparable baselines and attribution.

#### Operations and observability

Look for missing health signals, weak failure context, absent reconciliation, opaque background jobs, unsafe configuration drift, or operational procedures that make incidents and rollbacks harder than necessary.

Security, privacy, accessibility, and platform-specific concerns may be recorded when they are directly evidenced, but route to the appropriate specialist workflow when one of those becomes the primary decision.

### 4. Admit only evidence-backed candidates

For every candidate record the fields in [`references/improvement-ranking.md`](references/improvement-ranking.md):

- concise title and affected surface;
- current problem and concrete evidence;
- who or what is affected;
- expected benefit;
- likely change shape and dependencies;
- risk, reversibility, and verification needs;
- confidence and unresolved unknowns;
- appropriate implementing skill or owner.

Reject a candidate when the rationale is only taste, novelty, a single unexplained metric, or speculation about code that was not inspected.

### 5. Classify by change magnitude

Every admitted candidate must be placed in exactly one bucket.

#### Major

Use **Major** when the improvement changes architecture, public contracts, persistent data, cross-component behavior, deployment/rollback assumptions, or another high-blast-radius surface. Major does not mean “do this first”; it means the change requires broad coordination, staged evidence, or substantial migration risk.

Typical examples include replacing a central boundary, untangling a shared architectural hub, redesigning a critical persistence contract, or removing a repository-wide legacy path.

#### Medium

Use **Medium** for meaningful subsystem improvements that affect several related files or one bounded component, provide material engineering value, and can be verified without a repository-wide transition.

Typical examples include isolating a duplicated domain rule, strengthening a critical integration test layer, consolidating error handling inside one service, or simplifying a bounded build/development workflow.

#### Minor

Use **Minor** for local, low-blast-radius improvements with clear value and inexpensive verification.

Typical examples include removing a proven obsolete helper, improving a misleading local API, adding one missing boundary test, or simplifying a small deterministic script.

Do not classify by line count alone. Use contract reach, coordination, reversibility, and verification burden.

### 6. Rank within and across buckets

Apply the qualitative rubric in [`references/improvement-ranking.md`](references/improvement-ranking.md). Compare:

- value to users, operators, and maintainers;
- evidence strength and confidence;
- urgency or compounding cost of delay;
- implementation effort and coordination cost;
- regression/blast-radius risk;
- reversibility and ability to verify the result.

Avoid fake numerical precision. If two candidates are close, state the tradeoff and what evidence would break the tie.

A Major item may rank below a Medium item when the Medium item delivers more verified value per unit of risk and effort.

### 7. Select the next upgrade

Choose one recommended next upgrade unless evidence is insufficient. Explain:

1. why it beats the alternatives now;
2. what concrete outcome should improve;
3. the smallest coherent scope;
4. prerequisites and specialist handoffs;
5. verification required to prove the improvement;
6. the safe stopping point if the hypothesis fails.

Also identify one alternative when the recommendation depends heavily on a product or operational priority the repository cannot reveal.

### 8. Produce the improvement backlog and stop at the gate

Return candidates grouped in this order:

1. **Major improvements**
2. **Medium improvements**
3. **Minor improvements**
4. **Recommended next upgrade**
5. **Proposed execution slice**

Order candidates inside each bucket by recommendation strength, not file order.

For each item include evidence, expected benefit, effort/coordination, risk, confidence, and the likely owning workflow.

If the request was discovery or a broad “improve this codebase” instruction, return `AWAITING_APPROVAL` before repository edits.

### 9. Execute only an approved bounded slice

When the user explicitly approves the proposed slice:

1. refresh working-tree state and confirm the evidence is still current;
2. hand off when the selected improvement is primarily migration, debugging, performance, refactoring, platform work, documentation, or release verification;
3. otherwise implement only the approved maintenance scope;
4. keep edits coherent and avoid adjacent cleanup that was not part of the proposal;
5. run focused checks after each meaningful slice;
6. inspect the final diff for behavioral drift and unrelated churn;
7. report what changed, what evidence improved, and what remains in the backlog.

If implementation reveals a larger contract change than the approved candidate described, stop and reclassify/re-propose it rather than silently expanding scope.

## Improvement ranking rules

Use the detailed rubric and candidate template in [`references/improvement-ranking.md`](references/improvement-ranking.md).

Important distinctions:

- **Magnitude** (`Major`, `Medium`, `Minor`) describes change scope and coordination.
- **Priority** describes what should be done first.
- **Severity** describes consequence if a defect or risk materializes.
- **Confidence** describes strength of evidence.

Never collapse those dimensions into one label.

## Handoffs and interaction boundaries

- From `repository-intelligence`: component map, consumers, hotspots, ownership, and conflict surfaces when a broad scan needs deeper structural evidence.
- To `review-and-refactor-code`: a selected structural cleanup or behavior-preserving refactor with a defined scope.
- To `optimize-codebase-performance`: a selected performance hypothesis that needs measurement and attribution.
- To `codebase-evolution-controller`: a selected dependency, framework, runtime, schema, API, or compatibility transition.
- To `debugging-investigator`: a candidate that is actually an unexplained correctness failure.
- To platform builders: a selected web/mobile production improvement whose decision is platform-specific.
- To `documentation-synchronizer`: documentation drift exposed by the selected implementation.
- To `verification-and-release`: integrated evidence after the improvement is implemented and a release decision is requested.
- To `multi-agent-work-coordinator`: an approved improvement plan that is large enough for safe parallel execution.

The handoff includes the candidate evidence, magnitude, priority rationale, protected contracts, unknowns, and verification target so the next skill does not need to rediscover the decision.

## Failure handling

- If the repository is too large for full-depth inspection, keep a breadth-first inventory, disclose sampled areas, and deepen the highest-signal surfaces.
- If build/test tooling is unavailable, separate static evidence from unverified execution assumptions and lower confidence.
- If history or production telemetry is unavailable, do not infer frequency or business impact from source shape alone.
- If an apparent improvement conflicts with an intentional architecture decision, record the decision and remove or downgrade the candidate unless new evidence overturns it.
- If current external evidence is required but unavailable, mark the candidate `NEEDS_EVIDENCE` rather than recommending a version or technology change from memory.
- If every candidate is speculative, return `BLOCKED` with the smallest additional evidence needed instead of manufacturing a backlog.

## Output contract

Lead with one state: `SCANNED`, `AWAITING_APPROVAL`, `IMPROVED`, or `BLOCKED`.

Then include, when applicable:

- scope, repository state, exclusions, and evidence limits;
- Major improvements;
- Medium improvements;
- Minor improvements;
- recommended next upgrade and runner-up;
- proposed or approved execution slice;
- verification results when implementation occurred;
- residual risks and deferred candidates.

A useful report may contain an empty bucket. Do not invent low-value items merely to populate all three categories.

## Stop conditions

Stop discovery when the important repository surfaces have enough evidence to produce a ranked backlog, the magnitude labels are defensible, and one next upgrade can be recommended or explicitly blocked by missing evidence. Stop before editing when approval is required. Stop execution when the approved slice is verified, a specialist handoff owns the next decision, repository state has materially changed, or the work would exceed the approved magnitude/scope.
