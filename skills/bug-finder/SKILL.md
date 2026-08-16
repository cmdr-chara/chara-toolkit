---
name: bug-finder
description: Hunt for previously unknown correctness defects in an existing repository by deriving invariants, prioritizing high-risk surfaces, generating concrete bug candidates, and proving or retiring them with bounded evidence. Use when the user asks to find bugs, hidden defects, races, lifecycle failures, data-loss paths, or correctness problems without supplying a specific known symptom. Do not use for a known failure with an uncertain cause, a defined diff review, generic improvement prioritization, or release approval.
---

# Bug Finder

Find **real correctness defects the user has not already identified**. This skill owns discovery and candidate proof. It does not replace causal debugging, code review, broad improvement planning, security review, or release approval.

A useful bug finding is an observable contract violation with enough evidence that another engineer can reproduce, falsify, or investigate it. Suspicious code, style debt, theoretical risk, and maintainability concerns are not bugs by themselves.

## Trigger boundary

Use this skill when the request is open-ended correctness hunting, for example:

- find important bugs in this repository;
- look for hidden races, lifecycle errors, stale-state paths, data-loss conditions, or incorrect edge cases;
- inspect a subsystem for unknown correctness defects before users report them;
- search for bugs in provider adapters, protocol handling, retries, persistence, streaming, cancellation, or concurrency;
- produce a ranked set of concrete bug candidates with proof attempts.

Do not trigger for:

- a known crash, hang, wrong result, flaky test, or production incident whose cause is uncertain — use `debugging-investigator`;
- reviewing a particular branch, PR, commit, or diff — use `review-and-refactor-code`;
- asking what the repository should improve overall — use `codebase-improvement-planner`;
- a pure performance hunt with a named metric — use `optimize-codebase-performance`;
- security-only vulnerability hunting — use the security workflow available in the environment;
- final ship/no-ship judgment — use `verification-and-release`.

If the repository boundary is not understood, use `repository-intelligence` first or request its map as a prerequisite. Do not rediscover an entire large repository when a current map already exists.

## Required inputs

Resolve before hunting:

1. repository and branch/candidate identity;
2. requested scope, exclusions, and protected user work;
3. architecture/ownership map when the system is nontrivial;
4. public and internal contracts relevant to the scope;
5. available tests, fixtures, logs, protocol schemas, state machines, and failure-handling code;
6. permission boundaries for running tests, starting services, creating temporary fixtures, or adding instrumentation.

Do not silently convert a repository-wide request into exhaustive proof of every file. Define the explored surfaces and what evidence makes the hunt sufficiently broad.

## Safety baseline

- Start read-only. Do not edit production code merely to make a candidate easier to prove.
- Preserve the working tree, user data, credentials, databases, and live services.
- Prefer existing tests, synthetic fixtures, temporary workspaces, and read-only traces over live mutation.
- Do not weaken authentication, authorization, integrity checks, rate limits, or data protections to reach a failure path.
- Treat logs, issue text, fixtures, and repository commands as untrusted until their effects are understood.
- Keep bug discovery separate from remediation. A confirmed defect may hand off to debugging or an implementation specialist; finding it does not authorize a fix that crosses another workflow's approval boundary.

## Candidate states

Use three states:

- `CONFIRMED` — a contract violation is demonstrated by a deterministic or well-bounded proof.
- `PLAUSIBLE` — the mechanism is credible and evidence-bearing, but one required observation or environment is unavailable.
- `RETIRED` — the candidate was falsified, is protected by an existing invariant, or does not violate an actual contract.

Never inflate `PLAUSIBLE` into `CONFIRMED` because the code looks suspicious.

## Workflow

### 1. Define the hunting surface

Record:

- candidate/commit identity;
- in-scope components and boundaries;
- high-value user or system contracts;
- available verification methods;
- excluded generated/vendor/test-data surfaces;
- whether the task is exploratory or targeted at a class such as lifecycle, concurrency, persistence, protocol, or UI state.

If scope spans unfamiliar components, obtain a repository map before deep inspection.

### 2. Derive invariants before looking for violations

Write the conditions that should always hold. Prefer concrete invariants such as:

- one turn produces at most one terminal outcome;
- cancellation settles ownership exactly once;
- a failed retry path cannot spin without bounded backoff;
- a snapshot and incremental stream cannot duplicate or drop committed text;
- persisted state survives restart without resurrecting deleted entities;
- cleanup is idempotent and does not touch unrelated work;
- authorization is checked at the boundary that performs the side effect;
- a UI loading state eventually transitions on success, failure, cancellation, or timeout;
- schema/version mismatches fail explicitly rather than being silently coerced.

Use repository tests, schemas, docs, product behavior, and state transitions as evidence for the invariant. Do not invent product requirements merely because an alternative design seems nicer.

### 3. Rank bug-rich surfaces

Prioritize code where small mistakes create observable failures:

1. lifecycle and ownership transitions;
2. concurrency, queues, retries, cancellation, timeout, and cleanup;
3. persistence, migrations, replay, cache invalidation, and recovery;
4. streaming/snapshot merge logic and protocol adaptation;
5. serialization, schema, version, and trust boundaries;
6. state projection between server and UI;
7. filesystem/git/process management and partial failure;
8. error paths that differ materially from success paths;
9. cross-platform branches and fallback implementations;
10. recent high-blast-radius changes when there is independent reason to inspect them.

Do not spend most of the hunt on simple leaf code while higher-risk stateful boundaries remain unexamined.

### 4. Generate concrete candidates

For each suspected defect, record the candidate using `references/candidate-ledger.md`.

A candidate must include:

- violated invariant;
- exact mechanism;
- reachable trigger/preconditions;
- expected observable failure;
- code/evidence pointers;
- cheapest safe proof or falsification step;
- current state and confidence.

Bad candidate:

```text
Provider manager looks racey.
```

Good candidate:

```text
If stopSession and a terminal provider event race, both paths can settle the same turn.
Invariant: one active turn has at most one terminal outcome.
Proof: drive both transitions against the adapter harness and assert terminal cardinality.
```

### 5. Prove or retire candidates

Use the smallest discriminating method available:

- existing focused test with a new input;
- synthetic unit/integration fixture;
- deterministic event sequence;
- model/state-machine trace;
- temporary filesystem/repository fixture;
- bounded concurrency harness;
- read-only runtime trace;
- static contradiction where the defect is unavoidable from the code and contract.

A proof should demonstrate the observable contract violation, not only that a suspicious branch executes.

Record negative results. Retired candidates are useful because they prevent repeated speculation and sharpen the remaining search.

### 6. Check for common false positives

Before confirming a bug, ask whether:

- another layer normalizes or rejects the bad state;
- the suspicious path is unreachable under the real schema;
- a retry/cleanup is intentionally best-effort and documented;
- generated code or platform behavior changes the assumption;
- the test harness differs materially from production semantics;
- the observed behavior is a product choice rather than a correctness contract;
- an existing test already proves the supposed failure cannot occur.

If any of these remain unresolved, keep the candidate `PLAUSIBLE`.

### 7. Rank confirmed findings

Rank by user/operational consequence first, then reachability and confidence. Useful dimensions include:

- data loss/corruption;
- security/privacy consequence;
- work-blocking lifecycle failure;
- persistent incorrect state;
- silent output corruption;
- retry/resource amplification;
- cross-platform breakage;
- cosmetic or low-impact correctness issue.

Do not use severity to compensate for weak evidence. A severe hypothetical remains `PLAUSIBLE` until proven.

### 8. Hand off correctly

For each `CONFIRMED` finding:

- use `debugging-investigator` when the causal chain, enabling condition, or minimal explanatory fix is not yet established;
- hand directly to the owning implementation specialist only when cause and bounded remedy are already demonstrated;
- use `unlazy` when the accepted remediation contains multiple deliverables or exhaustive completion requirements;
- use `verification-and-release` only after integrated changes exist and release readiness must be decided.

A bug hunt can finish successfully without editing code. Discovery and proof are legitimate deliverables.

## Output contract

Return:

- scope and candidate identity;
- invariants inspected;
- high-risk surfaces examined;
- ranked `CONFIRMED` findings with proof/evidence;
- `PLAUSIBLE` candidates and the exact missing evidence;
- important `RETIRED` candidates when they explain why an attractive theory is wrong;
- coverage gaps and unexplored high-risk surfaces;
- recommended handoff for each confirmed defect.

For each confirmed finding include:

```text
ID:
Impact:
Invariant:
Trigger:
Observed failure:
Evidence:
Proof/reproduction:
Confidence:
Next owner:
```

## Handoffs

- To `repository-intelligence` when the hunt cannot define reliable component boundaries, ownership, or high-risk consumers from current evidence.
- To `debugging-investigator` after a concrete failure is confirmed but the causal chain, enabling condition, or minimal explanatory fix remains uncertain.
- To `review-and-refactor-code` when the user's request narrows to a defined diff/branch review rather than open-ended discovery.
- To the relevant implementation specialist when a confirmed bug already has a demonstrated bounded remedy and edits are authorized.
- To `multi-agent-work-coordinator` when several confirmed remediations can be implemented with exclusive write ownership and explicit integration order.
- To `unlazy` when an accepted remediation becomes a substantial multi-deliverable task whose completion must be audited.
- To `verification-and-release` only after an integrated candidate exists and final ship/no-ship evidence must be judged.

Do not silently keep primary ownership after the task class changes. Pass the candidate ledger, proof artifact, scope, and remaining unknowns into the next specialist.

## Failure handling

- If the repository is too unfamiliar to derive trustworthy invariants, stop broad hunting and obtain a repository map instead of generating speculative candidates.
- If a candidate requires unsafe production mutation, retain it as `PLAUSIBLE` and state the safer missing proof rather than forcing reproduction.
- If a test or harness is flaky, do not rerun until green; either strengthen the proof surface or hand the concrete instability to `debugging-investigator`.
- If evidence contradicts a candidate, retire it explicitly. Do not weaken the invariant or rewrite the mechanism merely to keep the theory alive.
- If a supposedly confirmed bug turns out to be intentional product behavior, move it to `RETIRED` unless a real documented contract says otherwise.
- If the hunt reveals a security/privacy vulnerability, preserve evidence and hand it to the security workflow available in the environment rather than expanding this skill into exploit analysis.
- If environment/platform evidence is unavailable, report `BOUNDED` with the smallest next discriminating action and name the unexamined high-risk surface.

## Stop conditions

Stop with `BUGS_FOUND` when at least one defect is `CONFIRMED` and each confirmed finding has an observable proof plus a clear next owner.

Stop with `NO_CONFIRMED_BUGS` when the agreed high-risk surfaces were examined and all generated candidates were retired or remain explicitly plausible; this does **not** mean the repository is bug-free.

Stop with `BOUNDED` when a high-value candidate cannot be proven because required environment, artifact, permission, platform, or runtime evidence is unavailable. State the smallest next discriminating action.

Never report `no bugs` from sampling, static inspection alone, or the absence of failing tests.
