# Chara's Toolkit

**Better engineering, any agent.**

[Guida in italiano](docs/guida-italiano.md)

[![CI](https://github.com/cmdr-chara/chara-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/cmdr-chara/chara-toolkit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-0ea5e9.svg)](LICENSE)

<p align="center">
  <img src=".github/assets/charas-toolkit-readme-hero.png" width="900" alt="Chara's Toolkit — Inspect. Change. Prove." />
</p>

22 engineering skills for coding agents: investigate bugs, review code, build interfaces, improve performance, and verify changes. Codex also gets workflow routing, six optional agent roles, and automatic updates.

## Install

**Codex (fully integrated)** — requires Node.js 18+ and Codex.

```sh
npx --yes github:cmdr-chara/chara-toolkit setup
```

Setup installs the skills, Mission Control roles, workflow routing, and a user-level updater. It preserves your instructions outside its managed `AGENTS.md` block. Scheduled updates follow published GitHub releases.

Prefer a global command?

```sh
npm install --global github:cmdr-chara/chara-toolkit
chara setup
```

`codex-toolkit` remains a compatibility alias for `chara`.

## Use

Start a fresh Codex task in your project and describe what you need. You usually do not need to choose a skill manually.

```text
Find important bugs in this repository and verify the fixes.
```

```text
Make this API faster. Measure it before and after the change.
```

The routing instructions guide the agent to the relevant specialist. Your project's `AGENTS.md` takes priority over general toolkit guidance. Skills guide the agent; runtime permissions remain under your control.

## Options

```sh
# Inspect the installation
npx --yes github:cmdr-chara/chara-toolkit mission-control check

# Install without scheduling automatic updates
npx --yes github:cmdr-chara/chara-toolkit setup --no-auto-update
```

Individual skills work with compatible Agent Skills clients. The full installer, routing, updater, and Mission Control roles are Codex-specific; see [portability](docs/portable-skills.md). Organization-managed installations have a separate [enterprise guide](docs/enterprise-deployment.md).

## Documentation

- [Guida in italiano: installazione e uso](docs/guida-italiano.md)
- [Skill catalog](skills/llms.txt) · [Workflow routing](orchestration/workflows.md)
- [Automatic updates](docs/auto-update.md) · [Application verification](docs/project-verification.md)
- [Destructive-operation safety](docs/destructive-operations-safety.md) · [Security reporting](SECURITY.md)
- [Evaluations](evaluations/README.md) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)

## License and credits

[MIT](LICENSE) © 2026 cmdr-chara. Third-party sources, modifications, and preserved license notices are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
