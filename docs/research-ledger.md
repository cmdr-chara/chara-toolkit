# Ecosystem Research Ledger

**Information checked:** 2026-07-17; provenance and methodology refreshed through 2026-09-25
**Research mode:** current public web, repository tree/raw-file inspection, official documentation, official package registries/repositories, and release/advisory pages.  
**Refresh policy:** stable workflow principles remain in `SKILL.md`; changing version/package/platform facts remain in dated references and must be rechecked before use.

## Method and evidence rules

1. Prefer framework/platform owners, standards bodies, package registries, and upstream repositories.
2. Treat a release number, peer range, store rule, security status, package license, or maintenance signal as time-sensitive.
3. Record compatibility, maintenance, adoption fit, license, security/deprecation, runtime/build cost, built-in alternative, and choose/avoid conditions for every named package recommendation.
4. Do not infer quality from popularity, stars, or download counts. Adoption is one fit/risk signal only.
5. Verify the target repository's lockfile and resolved graph at execution time; a ledger cannot establish compatibility for an unseen project.
6. Do not copy source wording or assets merely because a repository is permissively licensed. Preserve attribution when adaptation is substantial.

## Repository inspection

| Source | Material inspected | Finding retained in the pack | Checked |
| --- | --- | --- | --- |
| https://github.com/cmdr-chara/codex-toolkit | Root tree, README, existing `skills/`, `agents/`, installers, package metadata | The toolkit is compact and already ships Mission Control. Integration must be additive. | 2026-07-17 |
| https://raw.githubusercontent.com/cmdr-chara/codex-toolkit/main/README.md | Installation model, catalog, safety statement, existing skill description | `delegate-with-mission-cards` owns portable role dispatch and parent-side verification; model selection is runtime-owned. | 2026-07-17 |
| https://raw.githubusercontent.com/cmdr-chara/codex-toolkit/main/skills/delegate-with-mission-cards/SKILL.md | Delegation gate, mission cards, exclusive writer ownership, waves, handoff review | `multi-agent-work-coordinator` must add a generic work DAG/ownership/integration layer, not duplicate the six-role adapter. | 2026-07-17 |
| https://raw.githubusercontent.com/cmdr-chara/codex-toolkit/main/LICENSE | MIT terms, copyright | Pack root license preserves `Copyright (c) 2026 cmdr-chara`. | 2026-07-17 |
| https://github.com/Emanuele-web04/skills/tree/main/skills | Four public Markdown prompts covering code review, refactoring, and two overlapping performance workflows; no license file was exposed | Only general workflow ideas informed an independent two-skill design. No source prose or code was copied; the two performance concepts were merged to avoid ambiguous routing. | 2026-07-31 |
| https://github.com/Leonxlnx/taste-skill | Repository tree, README, design skill variants, local registry | Source separates taste, redesign, image-to-code, brand, and image-generation concerns. Only relevant concepts were selected. | 2026-07-17 |
| https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md | Brief inference, direction calibration, anti-template constraints, preflight concepts | Re-expressed as product evidence, design axes, system rules, states, accessibility, and handoffs. | 2026-07-17 |
| https://github.com/Leonxlnx/taste-skill/blob/main/skills/redesign-skill/SKILL.md | Audit-before-redesign concept | Re-expressed as a bounded redesign audit that preserves validated behavior and distinguishes diagnosis from direction. | 2026-07-17 |
| https://github.com/Leonxlnx/taste-skill/blob/main/skills/image-to-code-skill/SKILL.md | Reference analysis and iterative fidelity concepts | Re-expressed as provenance-aware structural decomposition, asset rights, responsive hypotheses, component boundaries, and evidence-based visual comparison. | 2026-07-17 |
| https://github.com/Leonxlnx/taste-skill/blob/main/LICENSE | MIT terms, copyright | Complete notice and adapted-file map preserved in `THIRD_PARTY_NOTICES.md`. | 2026-07-17 |

### Inspection limitation

The original 0.2.0 build could not clone the repository in its runtime. The 0.3.0 work was performed and validated in a direct checkout of cmdr-chara/codex-toolkit. The older web inspection remains part of the provenance record; current repository files are authoritative for the 0.3.0 integration.

## Codex and Agent Skills conventions

| Source | Retained guidance | Stability |
| --- | --- | --- |
| https://developers.openai.com/codex/build-skills | A skill is a directory with required `SKILL.md` and optional `scripts/`, `references/`, and `assets/`; discovery starts from metadata and loads detail progressively. | Convention; recheck when Codex docs change |
| https://developers.openai.com/codex/customization/overview | Repo skills can live in `.agents/skills`; clear descriptions govern implicit routing; references/scripts load on demand. | Convention |
| https://agentskills.io/specification | Required `name` and `description`; directory/name constraints; progressive disclosure; concise instructions. | Specification |
| https://agentskills.io/skill-creation/best-practices | Keep the operational body focused (under roughly 500 lines/5,000 tokens recommended) and point to specific resources only when needed. | Authoring guidance |
| https://agentskills.io/skill-creation/optimizing-descriptions | The description is a routing contract and should state concrete positive conditions. | Authoring guidance |
| https://developers.openai.com/blog/skills-agents-sdk | Narrow, repository-grounded trigger descriptions outperform vague capability labels in real maintenance workflows. | Current implementation guidance |


## Volatile ecosystem evidence

Current framework, package, platform, security, and store facts do **not** live in this ledger. They are maintained in dated references so stale claims can be rejected mechanically:

- `skills/production-web-builder/references/web-ecosystem-2026-09-24.md`
- `skills/flutter-production-builder/references/flutter-ecosystem-2026-07-17.md`
- `skills/expo-react-native-builder/references/expo-react-native-ecosystem-2026-07-17.md`
- `skills/mobile-architecture-director/references/platform-decision-matrix-2026-07-17.md`

The repository validator checks those files for their evidence date, next-review date, source URLs, and required compatibility/maintenance/license/security/deprecation/runtime-cost/alternative fields. Execution-time decisions still recheck the target project's resolved versions and current primary sources.

This ledger records provenance, authoring decisions, and durable methodology only. Historical release facts remain in `CHANGELOG.md` rather than being copied forward as current guidance.

## 2026-09-24 skill-context refresh

| Source | Material inspected | Finding retained in the pack | Checked |
| --- | --- | --- | --- |
| https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra | Current OpenAI guidance on skill discovery metadata, context cost, progressive disclosure, and over-prescriptive legacy prompts | Keep discovery descriptions short, avoid defensive ceremony that newer models no longer need, and route conditional detail through references. | 2026-09-24 |
| https://developers.openai.com/plugins/build/skills | Current OpenAI skill structure and progressive-disclosure guidance | Keep `SKILL.md` concise; put detailed references/scripts/assets beside it and load them only when relevant. | 2026-09-24 |
| https://github.com/SkillMedev/skills | Portable engineering skill collection and repository structure | Selectively adapt narrowly useful specialist methods rather than importing a second overlapping routing system. | 2026-09-24 |
| https://github.com/SkillMedev/skills/blob/main/LICENSE | MIT license | Preserve attribution and complete license text for adapted concepts. | 2026-09-24 |
| https://github.com/SkillMedev/skills/blob/main/skills/secure-code-review/SKILL.md | Focused exploit-class review and finding filtering | Re-expressed as `security-review` with Codex Toolkit trust-boundary, evidence, handoff, and regression contracts. | 2026-09-24 |
| https://github.com/SkillMedev/skills/blob/main/skills/flaky-test-detangler/SKILL.md | Hidden-dependency model for flaky tests | Folded into debugging as a conditional reference; retries/sleeps are not accepted as root-cause fixes. | 2026-09-24 |
| https://github.com/SkillMedev/skills/blob/main/skills/characterization-test-writer/SKILL.md | Pin observed legacy behavior before refactoring | Folded into review/refactor as a conditional legacy-code safety-net reference. | 2026-09-24 |
| https://github.com/SkillMedev/skills/blob/main/skills/dependency-risk-audit/SKILL.md | Reachability-aware dependency/security/license review | Folded into evolution for dependency additions/upgrades. | 2026-09-24 |
| https://github.com/SkillMedev/skills/blob/main/skills/migration-safety-checker/SKILL.md | Production database lock/backfill/expand-contract safety | Folded into evolution as database-migration guidance. | 2026-09-24 |
| https://github.com/SkillMedev/skills/blob/main/skills/github-actions/SKILL.md | CI graph, cache, privilege, fork, and deployment controls | Folded into release verification as GitHub Actions guidance without universal timing budgets. | 2026-09-24 |
| https://github.com/SkillMedev/skills/blob/main/skills/typescript-strict/SKILL.md | Staged TypeScript strictness migration | Folded into TypeScript quality enforcement. | 2026-09-24 |
| https://github.com/SkillMedev/skills/blob/main/skills/web-performance/SKILL.md | Field-first Core Web Vitals workflow | Folded into the production web builder; numeric thresholds remain current-source checks rather than permanent root instructions. | 2026-09-24 |
| https://github.com/SkillMedev/skills/blob/main/skills/skill-tester/SKILL.md | Positive, negative, neighbor-collision, and realistic behavior scenarios | Integrated into the toolkit evaluation methodology. | 2026-09-24 |

## 2026-09-25 Mission Control portability refresh

| Source | Finding retained | Checked |
| --- | --- | --- |
| https://developers.openai.com/api/docs/guides/responses-multi-agent | Multi-agent subagents share the request model in the documented Responses multi-agent flow; role design should not depend on per-role model pinning. | 2026-09-25 |
| https://github.com/openai/codex/blob/main/codex-rs/app-server-protocol/src/protocol/v2/config.rs | Codex configuration represents `model` and `model_reasoning_effort` as optional fields. Mission Control role files can therefore omit them and let the active runtime configuration govern inference. | 2026-09-25 |

Mission Control now defines role identity through sandbox authority, scope, execution behavior, consequence level, and handoff evidence. The six shipped TOMLs intentionally omit model, provider, service-tier, and reasoning-effort pins. This keeps the bundle portable across compatible Codex models and lets user or organization policy choose the runtime model.

The dispatch contract also degrades explicitly: when named custom roles are unavailable, the parent or an available generic subagent may execute the same bounded mission card, but the toolkit must not claim that an unavailable role or sandbox profile was applied.

