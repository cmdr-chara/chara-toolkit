# Evidence-first pull request review

Load only for a defined PR, commit range, or bounded diff. This is a skill procedure, not an installed GitHub reviewer, CI check, branch rule, or human approval.

## 1. Freeze the change and expected behavior

- Record repository, immutable base/head SHAs, PR intent or acceptance criteria, changed paths, and exclusions. Read applicable `AGENTS.md`, optional `REVIEW.md`, and contracts. The `REVIEW.md` filename has no automatic effect unless the agent actually reads it.
- Inspect changed functions in context: callers, outputs/errors, state/lifetime, data writes, config, auth boundaries, generated source, tests, and deployment consumers. On fixes, determine whether the root cause is repaired rather than only the visible symptom.
- Choose focused checks capable of falsifying a material claim. Report exact command, checked revision, observed result, and gap. Never describe unexecuted tests, screenshots, CI, or browser checks as performed.
- Separate introduced defects from old issues and unrelated opportunities.

## 2. Scale scrutiny to failure cost, not change size

| Depth | Example | Review work |
| --- | --- | --- |
| Quick | Isolated low-consequence copy/docs | Inspect changed content and relevant links/contracts; check the specific affected behavior. |
| Standard | Ordinary feature or bug fix | Trace callers, edge cases, state, error paths, tests and integration boundaries; challenge findings. |
| Deep | Auth, payments, secrets, updater, CI/release workflow, persistence or migration, hard rollback, large blast radius | Analyze negative/failure paths, cross-boundary contracts, security ownership, operational failure and reversibility. Consider independent read-only review. |

Assess blast radius, consequence, novelty and reversibility, **not** lines changed, author identity or test count. A one-line permission change can require Deep review. Review depth does not change repository human-approval rules.

## 3. Detect, then falsify

Focus on relevant regressions: incorrect logic, guards, retries and duplicate effects, cancellation and ordering, stale state, races, error paths, persistence, schema/consumer drift, privilege boundaries, configuration, UI states, CI/build and release behavior.

Each candidate finding must pass these checks:

1. Identify the changed cause, reachable input/state/event sequence, and a violated observable contract.
2. Challenge it against caller preconditions, guards, flags, types and existing tests; retire disproven candidates.
3. Cite exact path/line (or precise symbol), consequence, and a decisive static or executable check when feasible.
4. Apply `finding-contract.md`. Exclude style-only, hypothetical, unreachable and non-actionable concerns.
5. Deduplicate by defect mechanism. Mark **introduced**, **pre-existing**, or **unverified**. Do not count pre-existing or unverified concerns as PR regressions.

On consequential changes, independent *read-only* reviewers with fresh context may investigate distinct failure lenses, and a separate challenger may verify candidates before they reach a person. This is optional and proportionate, never a mandatory multi-agent fan-out. If only the current context is available, perform an explicit counterexample check but do not claim independent verification. Security-first exploitability belongs to `security-review`.

## 4. Give a decisive, high-signal report

Start the review with **Actionable findings: N**. If no new defect survives validation, write **Actionable findings: 0**. Zero applies only to the stated coverage, not an absolute correctness guarantee.

For introduced findings show priority P0–P3, exact path/line, violated contract, trigger, impact, evidence, smallest correction and calibrated confidence. Keep pre-existing issues, unsupported hypotheses and optional refactors separate, outside the actionable finding count. No style-only nits or re-posted findings.

Conclude with base/head SHAs, risk depth/reason, actual test results and revision, uninspected areas and next owner or handoff.

## 5. Make review converge

A **round** is one substantive review of one candidate SHA or newly changed delta. Track finding ID, defect class, first-seen SHA, affected path, disposition (open, fixed with evidence, rejected with reason, deferred by owner) and check.

- **Round 1:** Inspect the full relevant base-to-head diff and surrounding repo; deduplicate findings.
- **Rounds 2–3:** Re-review only new changes plus invariants that fixes might affect. Verify whether older finding IDs were fixed; never rediscover or re-post the same unchanged issue.
- **After round 3:** Stop autonomous fix/review repetition. Report unresolved defects, flawed assumptions and alternative approaches, then seek an authorized owner decision. Do not reset the counter for another minor repair commit.

Fixes require explicit authorization. Address all reachable instances of a defect class rather than changing one line per review. Don't turn every nit into a commit.

## 6. Preserve merge, security and release boundaries

Reviewer prose does not enforce CI, branch protections, CODEOWNERS, resolved threads, merge queues, or release controls. A bot's review or approval cannot substitute for a required human decision. A new commit can invalidate old CI/approval evidence under the host's rules. Do not resolve someone else's finding without grounds, approve, merge, or deploy as a side effect of review. Hand final release, rollout, monitoring and rollback decisions to `verification-and-release`.

## Suggested output

    Actionable findings: 1 (P1: 1)
    Reviewed: base SHA .. head SHA | Risk: Deep (authorization)
    Introduced: [P1] precise title — path:line
      Contract / Trigger / Impact / Evidence / Correction
    Pre-existing: separately listed, not counted
    Checks: command, observed result and SHA | or not run (reason)
    Gaps: uninspected code / missing runtime proof
    Round: 1/3 | Remaining finding IDs | Next owner
