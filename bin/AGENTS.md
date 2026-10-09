# Installer and updater contracts

- Preserve explicit/custom `CODEX_HOME`, supported platform behavior, repeatable installation, backup semantics, and dry-run behavior.
- Global instruction writes own only the toolkit's marked block. Preserve surrounding user content and reject malformed, duplicate, or reversed markers rather than guessing.
- Scheduled updates for personal installs follow published releases, not arbitrary branch heads. Disabling updates must not silently uninstall routing or user configuration.
- Managed installs must verify a signed external approval and package digest before writes, refuse existing automatic update schedulers, preserve the trusted signing-key fingerprint across normal promotions, and verify installed content. They must never silently fall back to personal setup.
- Keep installed-skill discovery separate from repository documentation: only real skill directories with `SKILL.md` are installable skills.
- Treat paths and external process arguments as data. Do not broaden scheduler, filesystem, or command scope to work around an installation failure.

Test installation/update changes with a temporary home and controlled scheduler/process fixtures, never the real user configuration. Use [CONTRIBUTING.md](../CONTRIBUTING.md) and [auto-update documentation](../docs/auto-update.md) for the supported checks and operating contract.
