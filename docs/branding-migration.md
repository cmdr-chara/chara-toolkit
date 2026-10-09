# Chara's Toolkit: naming and compatibility

**Public name:** Chara's Toolkit  
**Tagline:** Better engineering, any agent.  
**CLI:** `chara` (`codex-toolkit` remains an alias)

The toolkit began as **Codex Toolkit**. Its 22 Agent Skills are reusable across clients supporting the format; the installer, updater, managed routing, and six TOML profiles currently integrate with Codex specifically. The brand does not claim equivalent functionality in other agent clients.

## Transition sequence

1. Publish the code rebrand and verify that `chara` and `codex-toolkit` resolve to the same entrypoint without changing installed user data.
2. Keep the existing repository URL `cmdr-chara/codex-toolkit` usable during the rename transition. It remains the canonical repository until an administrator renames it.
3. If the repository is renamed to `charas-toolkit`, update installer repository constants, package repository metadata, documentation command examples, release archive references, and external links together. Re-run installer, updater, and release checks on all platforms.
4. Retain existing `CODEX_HOME` storage, managed `AGENTS.md` markers, cron/systemd/launchd/Windows task identities, and the legacy CLI alias until a separately verified migration removes them. Do not create duplicate schedulers or overwrite user instructions.
5. Refresh README and GitHub social-preview graphics under the new name, regenerate the asset manifest, and verify release metadata before publishing a release.

## Why the slug and internal paths differ temporarily

The repository slug, auto-update state directory, task identifiers, and managed block markers are compatibility surfaces. The old GitHub URL remains in install commands until the new URL actually exists. Never publish commands using a repository path that has not been created.
