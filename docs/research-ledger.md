# Ecosystem Research Ledger

**Information checked:** 2026-07-17; provenance and methodology refreshed through 2026-09-25
**Research mode:** current public web, repository tree/raw-file inspection, official documentation, official package registries/repositories, and release/advisory pages.  
**Refresh policy:** skills hold durable principles and selection criteria only; version, package, and platform facts are verified at decision time with each selection guide's checklist and are never stored in skills.

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

Current framework, package, platform, security, and store facts do **not** live in this ledger or in the skills. Earlier releases kept them in dated reference files; since 2026-10-25 the skills carry durable selection guides instead (`package-selection.md` for web, Flutter, and Expo/React Native, and `platform-decision-matrix.md` for mobile), each ending with a checklist for verifying the current state at decision time. The validator rejects dated snapshot files under `skills/`. The dated files remain available in Git history.

This ledger records provenance, authoring decisions, and durable methodology only. Historical release facts remain in `CHANGELOG.md` rather than being copied forward as current guidance.

## 2026-09-24 skill-context refresh

| Source | Material inspected | Finding retained in the pack | Checked |
| --- | --- | --- | --- |
| https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra | Current OpenAI guidance on skill discovery metadata, context cost, progressive disclosure, and over-prescriptive legacy prompts | Keep discovery descriptions short, avoid defensive ceremony that newer models no longer need, and route conditional detail through references. | 2026-09-24 |
| https://developers.openai.com/plugins/build/skills | Current OpenAI skill structure and progressive-disclosure guidance | Keep `SKILL.md` concise; put detailed references/scripts/assets beside it and load them only when relevant. | 2026-09-24 |

## 2026-09-25 Mission Control portability refresh

| Source | Finding retained | Checked |
| --- | --- | --- |
| https://developers.openai.com/api/docs/guides/responses-multi-agent | Multi-agent subagents share the request model in the documented Responses multi-agent flow; role design should not depend on per-role model pinning. | 2026-09-25 |
| https://github.com/openai/codex/blob/main/codex-rs/app-server-protocol/src/protocol/v2/config.rs | Codex configuration represents `model` and `model_reasoning_effort` as optional fields. Mission Control role files can therefore omit them and let the active runtime configuration govern inference. | 2026-09-25 |

Mission Control now defines role identity through sandbox authority, scope, execution behavior, consequence level, and handoff evidence. The six shipped TOMLs intentionally omit model, provider, service-tier, and reasoning-effort pins. This keeps the bundle portable across compatible Codex models and lets user or organization policy choose the runtime model.

The dispatch contract also degrades explicitly: when named custom roles are unavailable, the parent or an available generic subagent may execute the same bounded mission card, but the toolkit must not claim that an unavailable role or sandbox profile was applied.

## Evidence-first PR review synthesis — 2026-10-16

| Source | Checked | Source-derived practices | Toolkit adaptation |
| --- | --- | --- | --- |
| https://claude.dev/blog/solving-code-review-at-anthropic/ (Anthropic, published 2026-10-15) | 2026-10-16 | Pre-PR verification, contextual PR review, independently challenged findings, risk-based depth, layered CI/security/human gates, bounded review rounds, delta-only re-review, incident evaluations and fast rollback | Updated the existing `review-and-refactor-code` owner with opt-in PR review and policy references. Kept `security-review`, `verification-and-release`, human approvals and GitHub enforcement separate. |

The article describes Anthropic's own internally reported outcomes, not measured improvements in this toolkit. No article prose, code or imagery was copied. A `REVIEW.md` is advisory until explicitly read; host controls govern CI, approvals and merges.

## Release freshness follow-up — 2026-10-16

The manual 0.9.6 release job failed because four dated references had past `Next review` deadlines. Ordinary CI used a hard-coded 2026-09-25 `--as-of`, while release verification used the actual UTC date; this discrepancy is corrected by checking the current UTC date in both CI phases. No validator rule or release approval control was weakened.

Original dated-reference filenames and their initial `Information checked` dates remain historical. Each affected file now has a dated, scoped October 16 update for materially changed facts, plus a new finite review deadline.

- Next.js October 14 critical/high advisories and patch releases: https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr ; https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw ; https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r
- Expo SDK 58/SDK 57 corrections: https://expo.dev/changelog/sdk-58 ; https://docs.expo.dev/versions/v58.0.0/ ; https://expo.dev/changelog/sdk-57
- Flutter 3.47 and selected package metadata: https://docs.flutter.dev/release/release-notes/release-notes-3.47.0 ; https://pub.dev/packages/go_router/versions ; https://pub.dev/packages/flutter_riverpod/versions ; https://pub.dev/packages/freezed/versions ; https://pub.dev/packages/flutter_secure_storage/versions ; https://pub.dev/packages/drift/versions
- React Native 0.87: https://reactnative.dev/blog/2026/08/11/react-native-0.87

This is a targeted follow-up, not a claim that the unchanged package rows have been comprehensively reaudited. Resolve the actual target project's dependency graph, SDK/platform requirements, licenses, and advisories before choosing new versions.

## 2026-10-25 agent-neutral setup and Mission Control

| Source | Material inspected | Finding retained in the pack | Checked |
| --- | --- | --- | --- |
| https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices | Anthropic skill-authoring guidance | Descriptions state what a skill does and when to use it; references stay one level deep; long references get a contents list. | 2026-10-25 |
| https://developers.openai.com/codex/skills | Codex skill discovery and authoring | Descriptions say when a skill should and should not trigger, front-load the use case, and share a ~8,000-character default budget; user skills live in `~/.agents/skills`. | 2026-10-25 |
| https://github.com/vercel-labs/skills/blob/main/docs/agents.md | Global skills folder per agent | Source for the installer's per-agent skills folders. | 2026-10-25 |
| https://developers.openai.com/codex/subagents | Codex custom agent file schema | Required `name`, `description`, `developer_instructions`; `sandbox_mode` in a custom agent file does not override the parent session, so read-only roles are instruction-enforced in Codex. | 2026-10-25 |
| https://code.claude.com/docs/en/sub-agents | Claude Code subagent frontmatter | `~/.claude/agents/*.md` with `name`, `description`, optional `tools` allowlist and `model: inherit`; read-only roles use a write-free allowlist. | 2026-10-25 |
| https://geminicli.com/docs/core/subagents/ | Gemini CLI subagent frontmatter and tool names | `~/.gemini/agents/*.md` with `name`, `description`, `kind: local`, optional `tools` list; read-only roles list only read and search tools. | 2026-10-25 |
