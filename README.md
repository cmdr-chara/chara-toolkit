# Codex Toolkit

> Automatic workflow routing for 20 Codex skills and 6 agents — bug hunting, implementation, completion gates, and release verification.

[![CI](https://github.com/cmdr-chara/codex-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/cmdr-chara/codex-toolkit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-0ea5e9.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/Codex_skills-20-7c3aed.svg)](skills)
[![Custom agents](https://img.shields.io/badge/custom_agents-6-f97316.svg)](agents/mission-control)

<p align="center">
  <img src=".github/assets/codex-toolkit-social-preview.png" width="900" alt="Codex Toolkit: Inspect. Change. Prove. Twenty Codex skills and six optional agents." />
</p>

**Say what you want done, not which skill to run.**

Codex Toolkit gives Codex specialist workflows for the parts of software work that are easy to get wrong: understanding an unfamiliar repository, finding unknown bugs, proving root causes, controlling migrations and refactors, finishing large tasks completely, coordinating parallel agents, and deciding whether an integrated change is actually ready to ship.

The full installer adds a small global routing policy so Codex can select one primary specialist and compose supporting skills only when their trigger becomes relevant.

For example:

```text
Find and fix important bugs in this repository.
```

can become:

```text
repository-intelligence?
→ bug-finder
→ debugging-investigator?
→ owning implementation specialist?
→ unlazy?
→ verification-and-release?
```

`?` means conditional. A workflow does not activate every skill mechanically.

## Install once

```sh
npx --yes github:cmdr-chara/codex-toolkit setup
```

That installs:

- all **20 Codex skills**;
- **6 Mission Control agents**;
- automatic workflow routing in a managed section of your global Codex `AGENTS.md`;
- the detailed workflow catalog under `~/.codex/codex-toolkit/workflows.md`;
- a user-level auto-updater pinned to the **latest published GitHub Release**.

Future releases can add or update skills and routing without another manual install. The updater never follows unreleased `main` commits.

The installer never replaces your whole `AGENTS.md`. It owns only:

```text
<!-- codex-toolkit:start -->
...
<!-- codex-toolkit:end -->
```

Everything outside that block is preserved. Malformed or duplicate markers fail closed instead of being guessed around.

Check or disable automatic updates:

```sh
npx --yes github:cmdr-chara/codex-toolkit auto-update status
npx --yes github:cmdr-chara/codex-toolkit auto-update remove
```

See [Automatic updates](docs/auto-update.md) for Windows, macOS, Linux, custom `CODEX_HOME`, and scheduler details.

## Use it normally

You usually do not need to name a skill after the full setup.

```text
Find important bugs we have not noticed yet.
Fix this intermittent reconnect regression properly.
Improve this repository and take the best improvement through completion.
Make this slow path faster, but prove the improvement with comparable measurements.
Upgrade this framework without breaking compatibility.
Build this approved feature and do not stop half-finished.
Tell me whether this release candidate is actually safe to ship.
```

The routing layer chooses the smallest workflow that owns the decision. Repository-local `AGENTS.md` instructions remain authoritative for project-specific rules.

## Common workflows

### Unknown bugs

```text
repository-intelligence?
→ bug-finder
→ debugging-investigator?       # when causal proof is still missing
→ implementation specialist?
→ unlazy?                       # substantial accepted remediation
→ verification-and-release?     # integrated release candidate
```

`bug-finder` discovers previously unknown correctness defects and proves or retires candidates. `debugging-investigator` starts from a concrete failure and establishes the causal chain.

### Known bug

```text
repository-intelligence?
→ debugging-investigator
→ focused fix
→ unlazy?
→ verification-and-release?
```

### Improve a codebase

```text
repository-intelligence
→ codebase-improvement-planner
→ selected specialist
→ unlazy?
→ verification-and-release?
```

### Build a feature

```text
repository-intelligence?
→ owning web / mobile / evolution specialist
→ unlazy?
→ documentation-synchronizer?
→ verification-and-release?
```

### Parallel work

```text
repository-intelligence
→ multi-agent-work-coordinator
→ delegate-with-mission-cards
→ isolated reader/writer missions
→ integration
→ unlazy?
→ verification-and-release?
```

The router orchestrates. **The specialist remains authoritative for its domain decisions, approvals, and stop conditions.** `unlazy` cannot bypass a safety or approval gate, and `verification-and-release` remains the final owner of ship/no-ship judgment.

## Skill catalog

### Understand, investigate, and improve

| What you need | Skill |
| --- | --- |
| Map an unfamiliar codebase or determine change blast radius | [repository-intelligence](skills/repository-intelligence) |
| Find important bugs you do not know about yet | [bug-finder](skills/bug-finder) |
| Find the root cause of a known bug or regression | [debugging-investigator](skills/debugging-investigator) |
| Decide what the codebase should improve next | [codebase-improvement-planner](skills/codebase-improvement-planner) |
| Review code or refactor it safely | [review-and-refactor-code](skills/review-and-refactor-code) |
| Make a slow path faster using measurements | [optimize-codebase-performance](skills/optimize-codebase-performance) |
| Tighten TypeScript types and lint rules without hiding errors | [typescript-quality-enforcer](skills/typescript-quality-enforcer) |
| Inspect or remove hidden provenance/metadata from files you own | [content-provenance-hygiene](skills/content-provenance-hygiene) |

### Build and evolve

| What you need | Skill |
| --- | --- |
| Upgrade a dependency, framework, API, schema, or runtime safely | [codebase-evolution-controller](skills/codebase-evolution-controller) |
| Keep documentation synchronized with code changes | [documentation-synchronizer](skills/documentation-synchronizer) |
| Define product UX and visual direction | [product-design-director](skills/product-design-director) |
| Rebuild a UI from screenshots or visual references | [screenshot-to-interface](skills/screenshot-to-interface) |
| Build or audit a production web feature/app | [production-web-builder](skills/production-web-builder) |
| Choose the right mobile stack | [mobile-architecture-director](skills/mobile-architecture-director) |
| Build or audit a Flutter feature/app | [flutter-production-builder](skills/flutter-production-builder) |
| Build or audit an Expo/React Native feature/app | [expo-react-native-builder](skills/expo-react-native-builder) |

### Finish, verify, and coordinate

| What you need | Skill |
| --- | --- |
| Finish a substantial already-scoped task without premature “done” claims | [unlazy](skills/unlazy) |
| Decide whether an integrated change is safe to ship | [verification-and-release](skills/verification-and-release) |
| Split work across agents without write conflicts | [multi-agent-work-coordinator](skills/multi-agent-work-coordinator) |
| Send approved missions to the toolkit's custom agents | [delegate-with-mission-cards](skills/delegate-with-mission-cards) |

Every skill remains independently installable. To list the collection:

```sh
npx skills add https://github.com/cmdr-chara/codex-toolkit --list
```

Install one skill globally for Codex:

```sh
npx skills add https://github.com/cmdr-chara/codex-toolkit --skill repository-intelligence -g -a codex
```

Selective `npx skills add` installs do not install the toolkit's global routing or automatic-update setup.

## Mission Control

Mission Control provides six optional agents for work that is already understood well enough to split safely.

| Agent | Best for | Route |
| --- | --- | --- |
| pathfinder-reader | Fast file, symbol, and fact lookup | Luna Max |
| patcher-writer | Small isolated edits | Luna Max |
| investigator-reader | Debugging, tracing, and focused reviews | Luna Max |
| builder-writer | Features, tests, fixes, docs, and configuration | Luna Max |
| sentinel-reader | Security, privacy, migrations, and other high-risk analysis | Sol High |
| architect-writer | Difficult architecture and failure-sensitive changes | Sol Max |

The coordinator owns decomposition, exclusive write scopes, dependency order, and integration. Mission Control chooses an appropriate agent for each approved mission. The parent Codex task still owns the integrated result.

The recommended `setup` command installs Mission Control automatically. To install or refresh only Mission Control:

```sh
npx --yes github:cmdr-chara/codex-toolkit
```

## What setup adds

```text
~/.codex/
├── AGENTS.md                         # user content + small managed routing block
├── skills/                           # 20 installable skills
├── agents/                           # 6 Mission Control agent configs
└── codex-toolkit/
    ├── workflows.md                  # conditional multi-skill workflows
    ├── state.json                    # installed release state
    └── auto-update.*                 # short-lived updater support
```

Repository-local instructions still take precedence for repository-specific constraints.

## Validation

The repository ships structural validation, routing/overlap evaluation cases, helper smoke tests, release metadata verification, installer tests, and auto-update tests.

```sh
python scripts/validate_skill_pack.py . --as-of 2026-08-17
python scripts/run_smoke_tests.py . --as-of 2026-08-17
```

CI additionally verifies:

- all 20 skills and 19 production routes;
- vendored anti-slop integrity and TypeScript regressions;
- package contents;
- isolated full-toolkit installation;
- preservation and idempotence of user-authored `AGENTS.md` content;
- fail-closed behavior for malformed managed markers;
- release-pinned auto-update planning;
- canonical social-preview/release metadata.

See [the evaluation guide](evaluations/README.md) for routing and workflow tests.

## Repository layout

| Folder | Contents |
| --- | --- |
| `agents` | Six Mission Control agents |
| `docs` | Design decisions, boundaries, updater docs, and research sources |
| `evaluations` | Routing, overlap, workflow, and smoke-test cases |
| `orchestration` | Managed routing instructions and multi-skill workflow catalog |
| `scripts` | Installers, update runner, validation, and smoke tests |
| `skills` | Twenty installable skills |

## Research and credit

Product design and screenshot reconstruction include adaptations from Leonxlnx's MIT-licensed Taste Skill project. [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) contains the source mapping and preserved notices.

`unlazy` adapts Leonxlnx's MIT-licensed completion-gate and Depth Tree method for Codex Toolkit's safety, approval, and specialist-handoff model. Its provenance and modification boundaries are recorded in [skills/unlazy/references/upstream-provenance.md](skills/unlazy/references/upstream-provenance.md).

The TypeScript quality enforcer vendors the deterministic Oxlint runtime from Dillon Mulroy's MIT-licensed `anti-slop` project at a pinned upstream revision. Attribution and the upstream license are preserved in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Content provenance hygiene was designed after inspecting Guillaume Meyer's MIT-licensed `watermarks-remover` service and skill. Codex Toolkit does not vendor that runtime; the optional protocol reference is pinned in [skills/content-provenance-hygiene/references/service-protocol.md](skills/content-provenance-hygiene/references/service-protocol.md).

## Contributing

Bug reports, routing examples, and focused skill improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

[MIT](LICENSE) Copyright 2026 cmdr-chara
