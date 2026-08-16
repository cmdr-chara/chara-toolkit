# Codex Toolkit

> Twenty focused Codex skills for understanding, changing, and verifying real software projects.

[![CI](https://github.com/cmdr-chara/codex-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/cmdr-chara/codex-toolkit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-0ea5e9.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/Codex_skills-20-7c3aed.svg)](skills)
[![Custom agents](https://img.shields.io/badge/custom_agents-6-f97316.svg)](agents/mission-control)

<p align="center">
  <img src=".github/assets/codex-toolkit-social-preview.png" width="900" alt="Codex Toolkit: Inspect. Change. Prove. Twenty Codex skills and six optional agents." />
</p>

Codex can write code without this toolkit. These skills help with the harder parts around the code: understanding an unfamiliar system, choosing the right change, finding unknown defects, explaining failures, controlling scope, finishing work completely, and proving that a release is ready.

## Install

### Recommended: install once, stay updated

```sh
npx --yes github:cmdr-chara/codex-toolkit setup
```

That one command installs all twenty skills, the six Mission Control agents, a small managed routing block in your global Codex `AGENTS.md`, the detailed workflow catalog under `~/.codex/codex-toolkit/workflows.md`, and a user-level auto-updater.

After that, the operating system checks for the **latest published GitHub Release** automatically. New toolkit skills and routing/workflow updates are picked up too; unreleased commits on `main` are never installed by the updater.

The installer never replaces your whole `AGENTS.md`. It owns only the section between:

```text
<!-- codex-toolkit:start -->
...
<!-- codex-toolkit:end -->
```

Everything outside that block is preserved. If the markers are malformed or duplicated, setup stops instead of guessing. Changed local toolkit files are backed up before replacement. There is no always-running daemon.

Check or disable the updater at any time:

```sh
npx --yes github:cmdr-chara/codex-toolkit auto-update status
npx --yes github:cmdr-chara/codex-toolkit auto-update remove
```

Disabling automatic updates leaves installed skills, Mission Control, and routing instructions in place. See [Automatic updates](docs/auto-update.md) for Windows, macOS, Linux, custom `CODEX_HOME`, and scheduler details.

### Install just one skill

List what is available:

```sh
npx skills add https://github.com/cmdr-chara/codex-toolkit --list
```

Install one skill globally for Codex:

```sh
npx skills add https://github.com/cmdr-chara/codex-toolkit --skill repository-intelligence -g -a codex
```

`npx skills add` is still useful for selective installs, but it does not install the toolkit's global workflow routing or auto-update setup. Use the recommended `setup` command when you want the whole toolkit to compose and maintain itself.

## Automatic workflow routing

With the full setup installed, you normally do **not** need to memorize skill names. The global managed instructions teach Codex to choose one primary specialist and add supporting skills only when their trigger becomes true.

For example:

```text
Find and fix important bugs in this repository.
```

can route as:

```text
repository-intelligence? → bug-finder
                         → debugging-investigator? (confirmed bug still needs causal proof)
                         → owning implementation specialist?
                         → unlazy? (substantial remediation)
                         → verification-and-release? (integrated release candidate)
```

The question mark means conditional, not mandatory. Repository-local `AGENTS.md` rules remain authoritative for project-specific constraints. The full catalog is installed from [orchestration/workflows.md](orchestration/workflows.md).

## Pick a skill

### Code and repositories

| What you need | Skill |
| --- | --- |
| Map an unfamiliar codebase or see what a change could affect | [repository-intelligence](skills/repository-intelligence) |
| Find important bugs you do not know about yet | [bug-finder](skills/bug-finder) |
| Find the root cause of a known bug or regression | [debugging-investigator](skills/debugging-investigator) |
| Decide what the codebase should improve next | [codebase-improvement-planner](skills/codebase-improvement-planner) |
| Tighten TypeScript types and lint rules without hiding errors | [typescript-quality-enforcer](skills/typescript-quality-enforcer) |
| Inspect or remove hidden metadata from files you own | [content-provenance-hygiene](skills/content-provenance-hygiene) |
| Finish a large, already-scoped task without stopping half-done | [unlazy](skills/unlazy) |
| Review code or refactor it safely | [review-and-refactor-code](skills/review-and-refactor-code) |
| Make a slow path faster using measurements | [optimize-codebase-performance](skills/optimize-codebase-performance) |
| Upgrade a dependency, framework, API, schema, or runtime safely | [codebase-evolution-controller](skills/codebase-evolution-controller) |
| Keep documentation in sync with code changes | [documentation-synchronizer](skills/documentation-synchronizer) |
| Decide whether a change is safe to ship | [verification-and-release](skills/verification-and-release) |

### Product and interfaces

| What you need | Skill |
| --- | --- |
| Define the UX and visual direction for a product | [product-design-director](skills/product-design-director) |
| Rebuild a UI from screenshots or visual references | [screenshot-to-interface](skills/screenshot-to-interface) |
| Build or audit a production web feature/app | [production-web-builder](skills/production-web-builder) |
| Choose the right mobile stack | [mobile-architecture-director](skills/mobile-architecture-director) |
| Build or audit a Flutter feature/app | [flutter-production-builder](skills/flutter-production-builder) |
| Build or audit an Expo/React Native feature/app | [expo-react-native-builder](skills/expo-react-native-builder) |

### Multiple agents

| What you need | Skill |
| --- | --- |
| Split a large task across agents without write conflicts | [multi-agent-work-coordinator](skills/multi-agent-work-coordinator) |
| Send approved tasks to the toolkit's custom reader/writer agents | [delegate-with-mission-cards](skills/delegate-with-mission-cards) |

Use the smallest skill that owns the decision in front of you. `bug-finder` owns unknown-defect discovery; `debugging-investigator` owns the causal explanation of a concrete failure. `unlazy` is cross-cutting: it can make a substantial task's finish line explicit, but it cannot override another skill's safety or approval boundary.

## Common workflows

- Unknown bugs → `repository-intelligence?` → `bug-finder` → `debugging-investigator?` → bounded fix → `unlazy?` → `verification-and-release?`.
- Known bug → `repository-intelligence?` → `debugging-investigator` → focused fix → `verification-and-release?`.
- Unfamiliar repository change → `repository-intelligence` → the specialist that owns the change.
- “What should we improve?” → `repository-intelligence` → `codebase-improvement-planner` → the chosen specialist.
- Refactor → `review-and-refactor-code` → approval → incremental refactor → `unlazy?`.
- Slow path → `optimize-codebase-performance` → approval → measured optimization.
- Framework/API/schema upgrade → `codebase-evolution-controller` → `documentation-synchronizer` → `verification-and-release`.
- New product direction → `product-design-director` → web/mobile implementation skill.
- Big already-scoped task → owning specialist + `unlazy` completion gates.
- File metadata/privacy cleanup → `content-provenance-hygiene` → inspect → approved sanitation → re-inspect.

The implementation skill verifies its own work. `verification-and-release` owns the final integrated ship/no-ship decision.

## Mission Control

Mission Control adds six custom agents for work that is already understood well enough to split safely.

The current routing is designed for Codex Subagents V2: Luna Max handles ordinary reader/writer missions, Sol High handles high-risk read-only review, and Sol Max is reserved for extreme-risk implementation.

The recommended `setup` command installs Mission Control automatically. To install or refresh only Mission Control, the legacy command remains:

```sh
npx --yes github:cmdr-chara/codex-toolkit
```

On Windows, a cloned checkout can also use:

```powershell
.\scripts\install-mission-control.ps1
```

Existing Mission Control files are backed up under `~/.codex/backups` before replacement.

| Agent | Best for | Route |
| --- | --- | --- |
| pathfinder-reader | Fast file, symbol, and fact lookup | Luna Max |
| patcher-writer | Small isolated edits | Luna Max |
| investigator-reader | Debugging, tracing, and focused reviews | Luna Max |
| builder-writer | Features, tests, fixes, docs, and configuration | Luna Max |
| sentinel-reader | Security, privacy, migrations, and other high-risk analysis | Sol High |
| architect-writer | Difficult architecture and failure-sensitive changes | Sol Max |

The coordinator decides how work is divided. Mission Control chooses an agent for each approved task. The parent Codex task still owns integration and final verification.

## What is inside

Each skill is an installable folder with:

- `SKILL.md` for triggers, workflow, safety rules, and stopping points;
- `agents/openai.yaml` for the name and prompt shown in Codex;
- optional references for deeper guidance;
- optional read-only scripts for deterministic inspection.

The full installer also carries:

- `orchestration/managed-agents.md` — the short global routing policy inserted into the managed `AGENTS.md` block;
- `orchestration/workflows.md` — conditional multi-skill workflows installed under the active `CODEX_HOME`.

Skills remain independently installable. External integrations are explicit and operator-controlled rather than hidden shared runtime dependencies.

## Check the toolkit

The checks run without network access and do not modify their fixture projects.

```sh
python scripts/validate_skill_pack.py . --as-of 2026-08-17
python scripts/run_smoke_tests.py . --as-of 2026-08-17
```

CI also:

- verifies vendored anti-slop integrity and TypeScript regressions;
- renders and verifies release metadata/social preview;
- inspects the npm package contents;
- installs the full toolkit into an isolated temporary Codex home;
- verifies that setup preserves user-authored `AGENTS.md` content and is idempotent;
- verifies malformed managed markers fail closed;
- verifies the auto-update installation plan without registering a real scheduler on the runner.

See [the evaluation guide](evaluations/README.md) for routing and workflow tests.

## Repository layout

| Folder | Contents |
| --- | --- |
| agents | Six optional Mission Control agents |
| docs | Design decisions, boundaries, updater docs, and research sources |
| evaluations | Routing, overlap, workflow, and smoke-test cases |
| orchestration | Managed global routing instructions and multi-skill workflow catalog |
| scripts | Installers, update runner, and validation tools |
| skills | Twenty installable skills |

## Research and credit

Codex model routing was refreshed on 2026-08-16; broader web research was refreshed on 2026-07-31, and mobile research was checked on 2026-07-17. Compare time-sensitive guidance with the versions and lockfiles in the project you are changing.

Product design and screenshot reconstruction include adaptations from Leonxlnx's MIT-licensed Taste Skill project. [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) contains the license and source mapping.

`unlazy` adapts Leonxlnx's MIT-licensed completion-gate and Depth Tree method for Codex Toolkit's safety, approval, and specialist-handoff model. Its provenance and modification boundaries are recorded in [skills/unlazy/references/upstream-provenance.md](skills/unlazy/references/upstream-provenance.md).

The TypeScript quality enforcer vendors the deterministic Oxlint runtime from Dillon Mulroy's MIT-licensed `anti-slop` project at a pinned upstream revision. Attribution and the upstream license are preserved in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Content provenance hygiene was designed after inspecting Guillaume Meyer's MIT-licensed `watermarks-remover` service and skill. Codex Toolkit does not vendor that runtime; the optional protocol reference is pinned in [skills/content-provenance-hygiene/references/service-protocol.md](skills/content-provenance-hygiene/references/service-protocol.md).

The code-review, refactoring, performance, codebase-improvement, and bug-finder skills are toolkit-authored workflows. No third-party runtime is vendored for `bug-finder`.

## Contributing

Bug reports, routing examples, and focused skill improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

[MIT](LICENSE) Copyright 2026 cmdr-chara
