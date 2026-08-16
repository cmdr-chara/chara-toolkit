# Automatic updates

Codex Toolkit can keep a Codex installation synchronized without a long-running daemon.

## Recommended setup

Run once:

```sh
npx --yes github:cmdr-chara/codex-toolkit setup
```

`setup` does three things:

1. installs every toolkit skill into the active Codex home;
2. installs the six Mission Control agents;
3. registers a user-level scheduled updater.

The updater checks GitHub's **latest published Release** for `cmdr-chara/codex-toolkit`.
It does not track unreleased commits on `main`. When a newer release exists, it invokes
that exact release tag and synchronizes the toolkit. New skills added by a later release
are installed automatically.

Changed local toolkit files are moved into `~/.codex/backups/` before replacement.
Unchanged files are left alone.

## Schedule

The updater is short-lived: the operating system starts it, it checks one GitHub API
endpoint, updates only when a newer release exists, then exits.

- **Windows:** one daily Task Scheduler task plus a logon task.
- **macOS:** a user LaunchAgent that runs at load and every 24 hours.
- **Linux:** a persistent user `systemd` timer; if unavailable, the installer falls back
  to user `crontab` entries for login/reboot and a daily run.

No administrator/root install is intended.

## Inspect or disable it

```sh
npx --yes github:cmdr-chara/codex-toolkit auto-update status
npx --yes github:cmdr-chara/codex-toolkit auto-update remove
```

Removing the updater leaves installed skills and agents untouched.

To install the full toolkit without registering a scheduler:

```sh
npx --yes github:cmdr-chara/codex-toolkit setup --no-auto-update
```

## Custom Codex home

Both setup and the updater honor `CODEX_HOME` or an explicit path:

```sh
npx --yes github:cmdr-chara/codex-toolkit setup --codex-home /path/to/codex
```

The scheduled updater remembers that exact path.

## Individual `skills` CLI installs

`npx skills add ...` remains the right command when you want only selected skills or
want the open skills CLI to own installation. That command does not execute this
repository's scheduler installer.

If you want Codex Toolkit to require no future manual maintenance and to pick up newly
added toolkit skills automatically, use the `setup` command above.
