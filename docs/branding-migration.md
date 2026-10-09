# Chara's Toolkit: naming and compatibility

**Public name:** Chara's Toolkit  
**Tagline:** Better engineering, any agent.  
**CLI:** `chara` (`codex-toolkit` remains an alias)

The toolkit began as **Codex Toolkit**. Its 22 Agent Skills are reusable across clients supporting the format; however, the installer, updater, managed routing and six TOML profiles currently integrate with Codex specifically. The brand does not claim equivalent functionality in other agent clients.

## Transition sequence

1. Publish the code rebrand first. Verify that both the new `chara` executable and the legacy `codex-toolkit` alias resolve to the same entrypoint, without changing installed user data.
2. Keep the existing repository URL `cmdr-chara/codex-toolkit` usable during review. It is the actual canonical repository until an administrator renames it.
3. Once the prior engineering PR is merged and the rebrand PR is approved, an administrator can use **GitHub repository Settings → General → Repository name** to rename it to `charas-toolkit`.
4. After confirming GitHub redirects and the new canonical URL, update installer repository constants, package repository/homepage/bugs metadata, documentation command examples, any approved release archive references, and external links. Re-run installer, updater and enterprise signing checks on all platforms.
5. Retain existing `CODEX_HOME` storage, managed `AGENTS.md` markers, cron/systemd/launchd/Windows task identities, and the legacy CLI alias until a separately verified migration removes them. **Do not create duplicate schedulers or overwrite user instructions.**
6. Refresh the README and GitHub social-preview graphics under the new name, regenerate the asset manifest, and confirm `scripts/verify_release_metadata.py` passes with the committed art.
7. Only then publish a new reviewed release; signed enterprise approvals bind exact package bytes and must be recreated for each new release.

## Why the slug and internal paths differ temporarily

Avoiding an immediate change to auto-update state keys, task identifiers, and managed block markers is intentional backward compatibility, not unfinished skill routing. The old GitHub URL is shown in install commands until the GitHub rename actually happens. Never publish commands using a repository path that does not yet exist.

The rebrand does not introduce a new mandatory skill, duplicate the 22 existing skills, or require enterprise-only policy in personal installs.
