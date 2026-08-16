# Evaluation Suite

**Information checked:** 2026-08-16

This suite tests routing, overlap resolution, complete workflows, resource integrity, volatile package claims, and provenance. It is designed for deterministic structural validation plus model-based execution review.

## Files

- `routing-cases.json` plus `routing-cases-content-provenance.json`: 72 positive and 54 negative trigger cases—four positive and three negative per production skill.
- `overlap-cases.json` plus `overlap-cases-content-provenance.json`: adversarial prompts that require a primary skill or an explicit sequence/handoff rather than accidental multi-skill activation.
- `workflow-scenarios.md` plus `workflow-scenarios-content-provenance.md`: one realistic end-to-end scenario per production skill with inputs, workflow, artifacts, verification, and stop conditions.
- `adversarial-review.md`: self-review findings, corrections, and remaining refresh obligations.
- `package-claim-review.md`: manual protocol for time-sensitive compatibility, maintenance, license, security, cost, and deprecation claims.
- `post-install-routing-smoke.md`: a compact live-client check for all eighteen production skill routes and the highest-risk overlaps.

The supplemental evaluation files keep the existing historical corpus stable while adding the content-provenance and unlazy routes. The structural validator reads the primary and supplemental files as one canonical evaluation set.

## Structural run

From the pack root:

```sh
python scripts/validate_skill_pack.py . --as-of 2026-08-16
```

The validator checks schema/counts, skill/resource existence, local links, frontmatter, line/token proxies, dated references, source URLs, unsafe command strings, Python syntax, vendored anti-slop integrity/provenance, licensing, and obvious long-paragraph duplication.

## Model routing run

For every case in the routing case files:

1. Give only the prompt and the catalog metadata (`name`, `description`) to the model/harness.
2. Record selected skill(s), order, and rationale before loading bodies.
3. A positive case passes when the expected skill is selected as primary.
4. A negative case passes when the named skill is not primary and the stated route—or an equivalent no-skill decision—is selected.
5. Treat over-activation as a failure even if the final answer is plausible.

For the overlap case files, exact incidental helper use is not required, but the owned decision and sequence must match. A skill may be a prerequisite or handoff without becoming co-primary.

## Post-install smoke run

After copying the skills into a Codex installation, run the prompts in `post-install-routing-smoke.md` in fresh tasks. Record the selected primary skill before judging answer quality. This check is intentionally smaller than the full routing suite and exists to catch installation, metadata, or live-router drift.

## Workflow run

Execute each scenario against a representative fixture or real repository. Review the output for:

- evidence pointers rather than unsupported assertions;
- bounded reads/writes and preservation of user work;
- expected output schemas and stop conditions;
- explicit unknowns and calibrated confidence;
- conditional package/platform decisions;
- TypeScript quality findings verified beyond heuristic text matches and remediated without lint laundering;
- provenance hygiene that inspects before mutation, preserves authorization/scope, checks runtime capabilities, and never equates sanitation with human authorship;
- unlazy completion ledgers that keep blocked work visible, preserve specialist approval boundaries, rerun stale high-value checks, and re-measure final quantitative claims;
- feature-level verification by builders and integrated release judgment only by `verification-and-release`;
- no destructive Git/data action or invented command.

## Acceptance thresholds

- 100% structural validation pass.
- 100% positive/negative case presence and valid schemas.
- No high-severity routing error in overlap cases.
- No missing workflow scenario.
- No broken local reference or script.
- No stale dated reference beyond the configured review window without an explicit warning/block.
- No unlicensed copied material or missing adaptation/vendor notice.
- No unconditional platform or package mandate unsupported by repository evidence.
- No anti-slop vendor drift without a matching pinned-revision/provenance update.
- No provenance sanitation claim that overstates the available inspection surface or implies proof of human authorship.
- No unlazy completion claim with open/blocked required gates, stale final-state evidence, or unmeasured exhaustive/count claims.
