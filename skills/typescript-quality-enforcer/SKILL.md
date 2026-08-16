---
name: typescript-quality-enforcer
description: Audit and strengthen TypeScript/JavaScript type-evidence and lint discipline, stage adoption of deterministic anti-slop Oxlint rules, and remediate approved violations without laundering diagnostics. Use when a repository needs stronger TypeScript/JavaScript quality enforcement, unsafe type escape-hatch cleanup, anti-slop adoption, or systematic reduction of casts, unknown/any contracts, module mocking, and boundary-parsing debt. Do not use when the primary task is a concrete bug investigation, a known dependency/runtime migration, a measured performance bottleneck, an ordinary bounded refactor, a non-TypeScript platform audit, or final release approval.
---

# TypeScript Quality Enforcer

Turn recurring TypeScript/JavaScript quality failures into evidence-backed, deterministic enforcement. Diagnose the repository first, stage adoption second, and fix the violated invariant rather than the lint message.

## Trigger boundary

Use this skill for:

- auditing an existing TypeScript/JavaScript repository for type-evidence loss, unsafe assertions, broad contracts, suppressions, weak boundary parsing, and test seams;
- installing or configuring the bundled anti-slop Oxlint rules after an approved proposal;
- migrating an existing anti-slop setup without blindly replacing project-specific policy;
- reducing repeated `any`, `unknown`, unsafe dictionary, assertion, reflection, or module-mocking patterns when the goal is stronger permanent enforcement;
- tightening TypeScript compiler/lint discipline when the repository-specific migration cost is part of the decision.

Do not trigger for:

- explaining a concrete runtime failure with unknown cause—use `debugging-investigator`;
- upgrading TypeScript, Oxlint, a framework, runtime, or public contract as the primary task—use `codebase-evolution-controller`;
- a defined behavior-preserving refactor that is already chosen—use `review-and-refactor-code`;
- a named measured performance problem—use `optimize-codebase-performance`;
- broad web/mobile production readiness where TypeScript quality is only one concern—use the relevant builder;
- deciding whether the integrated release can ship—use `verification-and-release`.

## Required inputs

Obtain or state:

1. repository root, working-tree state, and protected user work;
2. TypeScript/JavaScript source boundaries and excluded generated/vendor code;
3. package manager, manifests/lockfiles, TypeScript configuration, lint configuration, and existing lint/typecheck commands;
4. current compiler/lint baseline, known failures, and CI enforcement;
5. whether anti-slop or equivalent project-local rules already exist;
6. product/runtime compatibility constraints and public type/API boundaries;
7. whether the task is audit-only or an exact previously proposed adoption/remediation stage has been approved.

If repository evidence cannot distinguish source from generated or vendored code, stop before proposing broad enforcement.

## Safety baseline

- Inspect and preserve the working tree and uncommitted user work. Never reset, clean, stash, or reformat unrelated files.
- Broad audit requests authorize inspection only. Do not install dependencies, copy the plugin, change lint/compiler configuration, or remediate files until the user approves a concrete stage.
- The bundled anti-slop runtime is third-party MIT-licensed code vendored from the pinned upstream revision documented in [`references/upstream-provenance.md`](references/upstream-provenance.md). Preserve its license and provenance.
- Do not overwrite an existing anti-slop/plugin directory. Compare existing content and propose migration instead.
- Never make lint pass by changing `unknown` to `any`, replacing one unsafe cast with another, adding blanket suppressions, disabling a rule, widening ignores, or weakening compiler options without an explicit evidence-backed exception.
- Do not enable every rule at `error` merely because the plugin contains it. First measure impact and stage adoption against the repository's contracts and test architecture.
- Do not edit generated output directly. Identify the generator and authoritative source.
- Do not infer package-manager commands or current dependency versions. Read repository metadata and verify volatile package compatibility from current primary sources before installation.

## Workflow

### 1. Freeze the quality decision

Record:

```text
Mode: audit | adoption proposal | approved stage execution
Repository/scope:
Protected behavior/contracts:
Generated/vendor exclusions:
Existing type/lint baseline:
CI enforcement:
Approved stage, if any:
Evidence limits/unknowns:
```

Keep two questions separate:

1. Which quality risks are actually present?
2. Which deterministic controls are worth adopting now?

### 2. Establish a read-only baseline

Inspect manifests, lockfiles, `tsconfig*`, lint configuration, test configuration, scripts, CI, and source layout. Run the repository's existing non-mutating lint/typecheck checks where safe.

Use the read-only heuristic inventory for a breadth-first signal pass:

```sh
python skills/typescript-quality-enforcer/scripts/typescript_quality_inventory.py . --format markdown
```

The helper reports compiler/lint configuration and suspicious source patterns; it does **not** claim that regex matches are anti-slop rule violations. Verify material candidates in source and, when available, with the actual linter.

Capture at least:

- strictness-related compiler settings and inherited config uncertainty;
- current Oxlint/ESLint/Vite+ presence and authoritative config;
- suppressions such as `@ts-ignore`, `@ts-expect-error`, lint disables, and project-specific allowlists;
- assertion/cast hotspots and broad `any`/`unknown` contracts;
- module mocking and whether real dependency seams exist;
- external input boundaries and parsing/validation strategy;
- generated code, test fixtures, and compatibility-sensitive public types.

### 3. Determine current enforcement state

Classify the repository as one of:

- **already enforced:** anti-slop or equivalent rules exist and CI runs them;
- **partially enforced:** Oxlint/TypeScript discipline exists but material escape hatches remain;
- **unenforced but compatible:** lint infrastructure appears suitable for staged anti-slop adoption;
- **migration required:** adopting the rules depends on a toolchain/runtime/configuration transition;
- **not a fit:** the repository language/tooling or constraints make this workflow inappropriate.

If anti-slop is already installed, compare the local copy and configuration with the pinned vendor baseline before recommending replacement.

### 4. Build the evidence ledger

Group findings by underlying invariant, not merely by rule name. Use [`references/violation-remediation.md`](references/violation-remediation.md).

Recommended buckets:

- **assertion safety:** fabricated evidence, chained casts, widen-then-assert flows, undocumented assertions;
- **contract precision:** broad parameters/returns, unsafe dictionaries, known-value widening;
- **boundary discipline:** runtime narrowing or unknown values propagated past I/O boundaries instead of parsed once;
- **test architecture:** module mocks standing in for missing dependency seams;
- **dynamic access:** reflection or generic containers that bypass useful type evidence;
- **compiler/lint gaps:** strictness or CI configuration that allows the same debt to recur.

For every admitted finding or cluster include:

```text
Evidence:
Files/symbols:
Observed pattern:
Violated invariant:
User/developer risk:
Confidence: high | medium | low
False-positive/legitimate-use considerations:
Verification target:
Likely remediation owner:
```

Do not elevate a style preference into a quality defect.

### 5. Design staged enforcement

Use [`references/adoption-strategy.md`](references/adoption-strategy.md). Default to stages that minimize blast radius and maximize evidence:

1. assertion safety;
2. contract precision;
3. boundary discipline;
4. dynamic access and repository-specific rules;
5. test architecture;
6. compiler-option migrations where justified.

This is a starting order, not a mandate. Repository evidence may reorder or omit stages.

For each proposed stage state:

- rules/settings included;
- current estimated or measured violations;
- files/components affected;
- mechanical vs architectural remediation mix;
- expected value and recurrence prevented;
- migration effort, risk, reversibility, and verification;
- specialist handoff if the stage crosses another workflow boundary.

### 6. Produce the proposal and stop

The first broad run must end in one of:

- `AUDITED` — evidence exists but no enforcement/edit stage is justified;
- `AWAITING_APPROVAL` — a concrete stage is recommended;
- `BLOCKED` — evidence/tooling is insufficient for a safe proposal.

For `AWAITING_APPROVAL`, return:

1. current enforcement state;
2. evidence-backed quality findings ordered by consequence;
3. staged adoption plan;
4. recommended first stage and why it outranks alternatives;
5. exact files/configuration/dependencies expected to change;
6. verification commands/criteria;
7. explicit exclusions and no-laundering invariants.

Stop without editing.

### 7. Validate approval and refresh baseline

Approval must clearly accept an existing stage or named subset. Re-inspect repository state before writing. If the source, lockfile, lint config, or scope materially changed, return to proposal mode.

If the approved stage requires a toolchain/package migration rather than ordinary configuration, hand it to `codebase-evolution-controller` before changing versions.

### 8. Install the vendored runtime only when approved

When anti-slop is absent and the approved stage requires it, copy the bundled runtime with:

```sh
node skills/typescript-quality-enforcer/scripts/install.mjs
```

The installer copies to `tools/oxlint/anti-slop/` by default and refuses to overwrite an existing destination. A repository-established tooling path may be passed as the first argument.

Then:

- inspect existing Oxlint/Vite+ configuration and merge the plugin/ignores rather than replacing configuration;
- preserve every existing ignore and add only project-local agent/vendor paths that should not be treated as application source;
- verify current compatible `oxlint` and `@oxlint/plugins` requirements from primary sources before adding/updating dependencies;
- enable only the approved rule stage;
- keep the vendored plugin itself excluded from application lint/format passes;
- preserve the bundled `LICENSE` and repository third-party notice.

### 9. Remediate by invariant, not diagnostic

For each violation:

1. identify the source of truth and intended contract;
2. determine whether the value is trusted domain data, untrusted boundary input, generated data, or test substitute;
3. replace fabricated evidence with actual evidence—precise inference, `satisfies`, parsing/validation, named owner types, explicit dependency seams, or direct typed access as appropriate;
4. add focused tests around the corrected boundary or contract;
5. run the approved rule(s), typecheck, and affected tests;
6. inspect the diff for laundering, suppressions, broad formatting churn, or public contract drift.

A changed diagnostic count is not success unless the violated invariant is actually repaired.

### 10. Escalate architectural findings

Some deterministic rules intentionally reveal work that is not mechanical:

- widespread module mocking may require dependency-seam refactoring;
- public `unknown`/dictionary contracts may require API/schema evolution;
- toolchain incompatibility may require a controlled migration;
- a suspicious cast implicated in an observed failure may require causal debugging;
- broad platform quality work may belong to the web/mobile builder.

Do not disguise these as lint cleanup. Produce the evidence and hand off.

### 11. Verify permanent enforcement

For an implemented stage verify, as applicable:

- selected anti-slop rules report zero unexplained violations in the intended scope;
- TypeScript typecheck remains green or no worse than the recorded baseline;
- focused unit/integration tests cover changed boundaries and dependency seams;
- public types/contracts remain compatible unless a separately approved migration changed them;
- CI runs the relevant lint/typecheck path so the debt cannot silently recur;
- no new blanket suppression, unsafe cast, broad ignore, or downgraded rule was introduced;
- the plugin license/provenance remains intact.

Report before/after finding counts, files changed, checks run, legitimate exceptions, and residual debt.

## Output contract

Lead with `AUDITED`, `AWAITING_APPROVAL`, `ENFORCED`, or `BLOCKED`.

Include only applicable sections:

- scope and repository state;
- current compiler/lint enforcement;
- evidence-backed findings by invariant;
- anti-slop/tooling fit assessment;
- staged adoption plan;
- recommended stage and approval boundary;
- implemented remediation and configuration;
- before/after counts and verification;
- legitimate exceptions, unknowns, and residual risk;
- specialist handoff.

## Handoffs

- From `codebase-improvement-planner`: when open-ended repository discovery identifies TypeScript type-evidence or lint discipline as the selected improvement.
- To `repository-intelligence`: when ownership, generated-code boundaries, or consumer blast radius are too unclear to scope enforcement.
- To `review-and-refactor-code`: when findings require behavior-preserving dependency seams or structural decomposition beyond the approved lint stage.
- To `debugging-investigator`: when a quality finding is tied to a concrete observed failure whose cause still needs proof.
- To `codebase-evolution-controller`: for TypeScript/Oxlint/runtime/package migrations or public contract transitions.
- To `optimize-codebase-performance`: when a quality pattern becomes a measured performance question rather than a type-safety question.
- To platform builders: when remediation becomes broader web/mobile production implementation.
- To `verification-and-release`: for the final integrated release gate.

## Failure handling

- If heuristic inventory and actual linter results disagree, trust the parser/linter for rule semantics and inspect representative source manually.
- If enabling a rule produces unexpectedly broad findings, stop, classify the dominant causes, and narrow or reorder the stage rather than mass-editing.
- If an existing local anti-slop copy differs from the vendored baseline, preserve it, identify project-specific modifications, and propose a migration instead of overwriting.
- If a rule conflicts with an explicit repository contract, document the conflict and exclude or configure that rule only through a reviewed exception; do not silently weaken policy.
- If package compatibility cannot be established from current primary sources, remain `BLOCKED` rather than guessing versions.
- If remediation requires public behavior or data-contract change, stop the lint stage and route to the owning migration/implementation workflow.

## Stop conditions

Stop in audit/proposal mode when findings are evidence-backed, stages are bounded, and the next write requires approval. Stop execution when approval is ambiguous, repository state changed materially, toolchain compatibility is unresolved, remediation would exceed the approved stage, or a specialist-owned architectural/migration/debugging decision appears. Complete as `ENFORCED` only when the approved stage is configured, violations are repaired or explicitly justified, focused verification passes, CI recurrence prevention is in place where requested, and provenance remains intact.
