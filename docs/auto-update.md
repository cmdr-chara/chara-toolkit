# Automatic updates

Codex Toolkit can keep a Codex installation synchronized without a long-running daemon.

## Recommended setup

Run once:

```sh
npx --yes github:cmdr-chara/codex-toolkit setup
```

`setup` does four things:

1. installs every toolkit skill into the active Codex home;
2. installs the six Mission Control agents;
3. installs the toolkit workflow catalog and synchronizes a managed routing block in the global Codex `AGENTS.md`;
4. registers a user-level scheduled updater.

The updater checks GitHub's **latest published Release** for `cmdr-chara/codex-toolkit`.
It does not track unreleased commits on `main`. When a newer release exists, it invokes
that exact release tag and synchronizes the toolkit. New skills and updated routing/workflow
instructions added by a later release are installed automatically.

## Managed global instructions

The full installer owns only this block in the active `CODEX_HOME/AGENTS.md`:

```text
<!-- codex-toolkit:start -->
...
<!-- codex-toolkit:end -->
```

Existing content outside the block is preserved byte-for-byte except for the minimum newline
needed when the block is first appended. On later updates only the managed block is replaced.
If either marker is missing, duplicated, or out of order, setup fails closed instead of guessing
how to rewrite the file.

The detailed workflow catalog is installed at:

```text
$CODEX_HOME/codex-toolkit/workflows.md
```

Changed local managed files are copied into `$CODEX_HOME/backups/` before replacement.
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

Removing the updater leaves installed skills, Mission Control, the managed `AGENTS.md` routing
block, and the workflow catalog in place. It disables only future scheduled synchronization.

To install the full toolkit without registering a scheduler:

```sh
npx --yes github:cmdr-chara/codex-toolkit setup --no-auto-update
```

## Custom Codex home

Both setup and the updater honor `CODEX_HOME` or an explicit path:

```sh
npx --yes github:cmdr-chara/codex-toolkit setup --codex-home /path/to/codex
```

The scheduled updater remembers that exact path. The managed `AGENTS.md` and workflow catalog
are installed under that same Codex home rather than under the default `~/.codex`.

## Individual `skills` CLI installs

`npx skills add ...` remains the right command when you want only selected skills or
want the open skills CLI to own installation. That command does not execute this
repository's scheduler or global-routing installer.

If you want Codex Toolkit to require no future manual maintenance, compose installed skills
through the toolkit workflow rules, and pick up newly added toolkit skills automatically, use
the `setup` command above.
