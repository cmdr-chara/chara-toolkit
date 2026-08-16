# Improvement Ranking Rubric

Use this rubric after a candidate has enough repository evidence to be admitted. Keep **change magnitude** separate from **priority** so a large idea does not automatically outrank a smaller, higher-return improvement.

## Candidate record

```text
ID:
Title:
Magnitude: Major | Medium | Minor
Affected surface:
Current problem:
Evidence:
Expected benefit:
Change shape:
Dependencies/prerequisites:
Effort/coordination: Low | Medium | High
Regression/blast-radius risk: Low | Medium | High
Reversibility: Easy | Moderate | Difficult
Verification target:
Confidence: High | Medium | Low
Unknowns:
Owning workflow:
Priority rationale:
```

Do not leave `Evidence`, `Verification target`, or `Confidence` implicit.

## Magnitude

### Major

Use Major when the improvement materially changes public or cross-component contracts, persistent-data semantics, repository-wide architecture, multiple deployables, coordinated rollout assumptions, or another high-blast-radius boundary. Major work normally needs staged planning or a specialist handoff before edits.

### Medium

Use Medium when the improvement is contained to one subsystem or a coherent multi-file slice, provides material engineering value, has bounded consumers, and can be verified without a repository-wide transition.

### Minor

Use Minor when the improvement is local, reversible, and cheap to verify: one small module, one focused test gap, one deterministic script, one misleading local API, or one proven obsolete path with no broader contract reach.

A large mechanical diff can still be Medium, and a small diff can be Major when it changes a critical contract. Do not classify by line count alone.

## Priority dimensions

Compare candidates on six dimensions.

1. **Value** — what becomes materially better for users, operators, maintainers, delivery speed, reliability, or cost.
2. **Evidence strength** — direct repository evidence outranks plausible but unverified hypotheses.
3. **Urgency/cost of delay** — raise priority when waiting compounds a demonstrated problem.
4. **Effort/coordination** — include implementation, review, consumer coordination, rollout, and cleanup burden.
5. **Risk/reversibility** — prefer bounded blast radius and cheap rollback when value is comparable.
6. **Verifiability** — prefer candidates with an observable success condition.

Avoid fake numerical precision. If two candidates are close, name the missing fact that would decide between them.

## Recommendation rule

Recommend the candidate with the strongest combination of **demonstrated value, evidence, bounded risk, and verifiability** relative to effort. Do not select by magnitude alone.

A Medium candidate should beat a Major candidate when it delivers more verified value now, costs less to coordinate, and creates evidence needed for later work.

## Reject or downgrade weak candidates

Reject or reduce priority when the rationale is mainly:

- technology novelty;
- personal style preference;
- aesthetic rewriting;
- dependency age without support or compatibility evidence;
- one static complexity metric without an observable maintenance problem;
- incomparable benchmark results;
- dead-code claims without consumer/search coverage;
- replacing an existing sufficient capability without a demonstrated gap.

## Example backlog shape

```text
MAJOR
1. Redesign a shared persistence boundary used by several deployables
   Evidence: ...
   Benefit: ...
   Effort/Risk: High / High
   Confidence: Medium
   Owner: specialist transition workflow

MEDIUM
1. Add contract coverage around a critical event boundary
   Evidence: ...
   Benefit: ...
   Effort/Risk: Medium / Low
   Confidence: High
   Owner: bounded implementation/review workflow

MINOR
1. Remove an obsolete local helper after proving no callers remain
   Evidence: ...
   Benefit: ...
   Effort/Risk: Low / Low
   Confidence: High
   Owner: approved maintenance slice

RECOMMENDED NEXT UPGRADE
The contract-coverage improvement, because it closes a verified blind spot with high confidence and low rollback cost while creating evidence needed before the larger redesign.
```
