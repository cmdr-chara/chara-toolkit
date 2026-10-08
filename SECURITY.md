# Security policy

Codex Toolkit installs executable tooling and instructions into local Codex environments. Report vulnerabilities affecting installation, signed approval verification, update behavior, CI/release workflows, or bundled scripts.

## Reporting

Use GitHub private vulnerability reporting if enabled: https://github.com/cmdr-chara/codex-toolkit/security/advisories/new

If unavailable, request a private contact channel from a maintainer without posting reproduction details or credentials publicly. Do not test against third-party accounts or production systems.

## Support

Only the latest published release is actively maintained; earlier releases are legacy unless a specific security backport is announced. Managed enterprises should promote pinned approved versions and retain a rollback package.

## Boundary

Skills are not a security sandbox. Consult [enterprise deployment](docs/enterprise-deployment.md) for signed distribution, while configuring Codex tool grants, network restrictions, approval policy, and organization auditing separately.

Reports should include affected revision, scope, violation, a benign reproduction, and impact. Never include secrets or personal data.
