# Enterprise deployment

Chara's Toolkit includes an opt-in signed-approval installation mode for managed Codex homes. The regular setup command remains for individual developers.

## Control boundaries

| Area | Toolkit provides | Organization must enforce |
| --- | --- | --- |
| Package approval | Ed25519 policy signature, SHA-256 of runtime files, expiry, exact version | Signing key custody, trusted artifact source, key revocation |
| Distribution | Explicit promotion; scheduled updates disabled for managed homes | Endpoint access and approved binary distribution |
| Installed content | Skill/agent/routing byte comparison | Filesystem protection and Codex sandbox/tool permissions |
| Release | Manually dispatched workflow, exact SHA/CI check, release-approval environment | GitHub rulesets, required reviewers, tag protection, authorized workflow access |
| Security scanning | CodeQL on JS/TS and Python | Alert triage and enforced security workflow policy |

These controls do not supply SSO/SCIM, tenant isolation, centralized audit trails, or organization-wide Codex authorization.

## 1. Configure required GitHub controls

A repository administrator must configure Settings → Rules → Rulesets (or branch protection):

- Protect main; require PRs, independent approval, current `validate` status checks, and disallow force pushes, branch deletion, and unrestricted bypass.
- Protect release tags (for example `v*`), denying deletion/movement and restricting creation to releasers.
- Configure Settings → Environments → `release-approval` with required reviewers and main-only deployment restrictions. Merely naming an environment in YAML does not activate approval.
- Restrict release workflow execution using repository/organization Actions policies where available.

The connected GitHub integration cannot edit administration rules. These settings must be verified by an administrator rather than inferred from passing CI.

## 2. Approve a reviewed package

Use a reviewed release archive from an administrator-approved internal mirror. Do not run arbitrary remote `npx` packages before approval. From the unpacked package root:

    node --input-type=module -e "import {digestPaths} from './scripts/enterprise-approval.mjs'; console.log(await digestPaths(process.cwd()))"

This outputs a deterministic SHA-256 over the file paths and contents in `agents/`, `bin/`, `orchestration/`, `scripts/`, `skills/` and `package.json`. Separately verify the source commit and release archive; this digest alone does not prove upstream provenance.

Create an `approval.json` OUTSIDE the distributable package, substituting actual lowercase SHA values and a short-lived expiry:

    {
      "schema": 1,
      "repository": "cmdr-chara/codex-toolkit",
      "release": "v0.9.4",
      "revision": "FULL_40_CHARACTER_APPROVED_COMMIT_SHA",
      "bundle_sha256": "FULL_64_CHARACTER_APPROVED_BUNDLE_SHA256",
      "expires_at": "2026-12-31T00:00:00Z"
    }

The release value must match the package version. The new package identity is `@cmdr-chara/charas-toolkit`; the current repository slug remains valid until the administrative rename. New approvals must be signed against the exact bundle bytes. A trusted administrator signs the exact JSON bytes with an Ed25519 key held outside Git and all developer workspaces:

    openssl genpkey -algorithm ed25519 -out admin-private.pem
    openssl pkey -in admin-private.pem -pubout -out trusted-public.pem
    openssl pkeyutl -sign -rawin -inkey admin-private.pem -in approval.json -out approval.sig

Use your organization's established signing/HSM process in production. Distribute the approved archive, signed JSON policy, detached binary signature and separately trusted PUBLIC key. Never distribute the private key. The install script rejects malformed, expired or incorrectly signed policies.

## 3. Install and check on managed endpoints

From a locally staged, administrator-approved extracted package:

    node bin/toolkit.mjs enterprise-setup \
      --policy /approved/approval.json \
      --signature /approved/approval.sig \
      --trusted-key /approved/trusted-public.pem \
      --codex-home /managed/CODEX_HOME \
      --dry-run

Drop `--dry-run` to perform the installation. It verifies approval before writes, preserves user-owned instruction content, installs the existing 22 skills and six agent roles, verifies the installed files, and records signed approval fingerprints.

Check later with the same approved package and trust material:

    node bin/toolkit.mjs enterprise-check \
      --policy /approved/approval.json \
      --signature /approved/approval.sig \
      --trusted-key /approved/trusted-public.pem \
      --codex-home /managed/CODEX_HOME

Previously configured automatic updates must be explicitly disabled before enterprise setup. Managed installs disable scheduling and refuse ordinary setup/update calls through the toolkit launcher. This is **not** an operating-system access control: external endpoint management must prevent other executables from overwriting the Codex home.

## 4. Staged rollout and rollback

1. Pilot using isolated test accounts with host-enforced read-only tool/sandbox policies and representative tasks.
2. Record candidate SHA, signed policy fingerprint, installation validation and operator approval in the organization's change record.
3. Roll out the *same* approved package by cohorts; halt on unexpected permission requests, unauthorized network access or regressions.
4. Roll back by installing a previously approved, still-valid signed package; retain known-good archives and the matching policies.
5. Rotate signing keys and revoke old trusted keys using endpoint management. An already trusted but compromised key cannot be revoked solely through a policy expiration field.

Existing installers back up replaced content; multi-file installation is not an atomic transaction, so exercise restoration during a pilot.

## 5. Release governance

Automatic patch releases have been removed. A maintainer now updates the package version and changelog in a reviewed PR. After Linux/Windows/macOS installer CI and JavaScript/Python CodeQL checks pass on the exact main SHA, an authorized releaser dispatches `Release (approved)` with that SHA. A read-only validation job checks each platform and CodeQL gate and stages the package. A separate approval-gated publisher with repository write permission verifies the staged archive before publishing the immutable tag and `SHA256SUMS`. It refuses stale/untested commits and existing tags. SHA256SUMS is a checksum, not a trusted signature.

GitHub Actions environment approval only becomes effective once an administrator configures reviewers and deployment policies. The toolkit cannot enforce release authorizations independently of GitHub.

## Known limitations

- This is enterprise-enabling infrastructure, **not** a SOC 2, ISO 27001, GDPR, or production security certification.
- The verifier runs from the package itself; organizations defending against a malicious distributor must first trust and verify their bootstrap tooling and package source.
- The signed revision field is a declaration by the signing administrator; the offline installer does not look it up on GitHub.
- Skills and Mission Control are advisory; actual Codex permissions belong to the active runtime and organization.
- Centralized audit ingestion, endpoint rollout, SSO, and tenant policy are external dependencies.
