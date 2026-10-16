# Opt-in repository review policy and rollout

Load when the user wants to establish or improve a review process, not for every PR. Do not create rules, install tools, or alter a team's GitHub settings during a one-time review.

## Suggested team-owned `REVIEW.md`

`REVIEW.md` is a convention an agent must explicitly read. Its presence alone does not start a reviewer or enforce a GitHub gate. Keep the document short and adapt it to the actual product.

~~~markdown
# Review policy

## What can break
- Changed code violates an API, user-visible, safety, data or state contract.
- A bug fix repairs a symptom but leaves a reachable root cause.
- A config, build, generator input or rollout change breaks a consumer.

## Evidence and noise
- Admit findings only with exact file/line, reachable trigger, violated
  contract, impact, smallest fix and confidence.
- Look for guards and counterexamples before posting.
- Separate old bugs and optional cleanup from introduced regressions.
- No style-only findings, no repetitive nits, no guesses from names.

## Scope and result
- Examine the diff, callers, public contracts, tests and relevant config.
- Skip unrelated generated/vendor copies, but inspect authoritative inputs.
- Do not skip modified sensitive paths due to diff size.
- Start "Actionable findings: N", including zero when warranted.
- Show base/head SHAs, risk depth, observed checks and coverage gaps.
- A review does not authorize editing, approval, merging or deployment.
~~~

Repository-local `AGENTS.md` instructions remain authoritative. Never overwrite existing team policy without authorization.

## Suggested PR template fields

~~~markdown
## Intent
Desired behavior, requirements and deliberate non-goals.

## Testing
Commands, candidate SHA, observed results and untested scenarios.

## Risk
Low / Medium / High; failure cost, blast radius and reversibility.

## How to revert
Flag, revert, rollback or forward-recovery; owner and limitations.

## Reviewer context
Sensitive paths, pre-existing errors, unresolved findings.
~~~

## Adoption and continuous improvement

1. Pilot on one repository. Tune local policy using adjudicated real findings before expanding automation.
2. Configure required CI/security checks, branch protections, CODEOWNERS, stale-approval dismissal, and thread resolution through the **actual hosting platform** when authorized. A skill cannot enforce these on its own.
3. Match review effort to risk. Keep approval policy separate: low-risk changes may take a lighter human path *only if configured*, while sensitive paths and untrusted contributors need appropriate human review. A bot's approval never counts as a person.
4. Use a round cap of three, delta-only re-review, and finding IDs to minimize repeated review/fix noise.
5. Track human wait/review time, accepted versus rejected or harmful findings, rounds-to-pass, revert rate and incidents. Do not optimize review speed at the cost of regressions.
6. For risky releases use flags, staged rollout, telemetry, and tested rollback under `verification-and-release`. Turn confirmed incidents/reverts into an opt-in evaluation corpus and retest when prompts/models/tools change.
7. Convert truly repeatable defects into targeted mechanical lint/tests only when false-positive and valid-case fixtures show that the check works.

`review-and-refactor-code` owns general PR defect review; `security-review` owns exploitability and `verification-and-release` owns release readiness.
