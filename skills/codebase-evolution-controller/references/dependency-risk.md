# Dependency risk

Use this reference when adding, upgrading, replacing, or auditing third-party dependencies. Every dependency is code you run but did not write. Judge each one by what it costs to trust it, not only by what it does.

## Before adding a dependency

Answer these questions in the plan:

1. **Need:** what it replaces, and why a standard-library or existing dependency is not enough.
2. **Surface:** how many transitive packages it adds, whether it ships native binaries or runs install scripts, and how much runtime or bundle size it adds.
3. **Health:** release cadence, open security issues, maintainer count, bus factor, and whether it is deprecated or archived.
4. **Provenance:** whether published artifacts match the source repository, and whether it has build attestations (for example npm provenance or Sigstore signatures) where the ecosystem supports them.
5. **License:** compatible with the project's license and distribution model. Check transitive licenses when shipping binaries or bundles.
6. **Exit:** how hard it would be to replace, and whether it leaks its types or concepts throughout the codebase.

## Vulnerability triage

- Run the ecosystem's auditor (`npm audit`, `pnpm audit`, `pip-audit`, `cargo audit`, `govulncheck`, `osv-scanner`, or similar) and record the tool and database date.
- Don't forward raw auditor output as the decision. Note whether the package is runtime, build-only, or dev-only first: a critical advisory in a dev-only tool and a moderate one on an internet-facing request path are different risks.
- For each finding, decide reachability: is the vulnerable function or configuration actually used, and with attacker-influenced input? Use call-graph-aware tools where they exist (for example `govulncheck`); otherwise trace imports and call sites by hand.
- Classify each finding as exploitable, reachable but mitigated, unreachable, or unknown. Write the evidence next to the classification. An "unknown" is not "unreachable".
- Prefer the smallest upgrade that fixes the advisory. Document any override or resolution pin with the advisory ID and a removal condition.

## Supply-chain checks

- **Typosquatting and confusion:** verify the exact package name, publisher, and registry. Private package names must not be resolvable from the public registry.
- **Install-time code:** review new `postinstall`/build scripts. Prefer ecosystems or settings that disable scripts by default where the project allows it.
- **Lockfiles:** review the lockfile diff on every change. Unexpected new transitive packages or registry URLs are findings.
- **Reproducibility:** CI installs from the committed lockfile in frozen mode (`npm ci`, `pnpm install --frozen-lockfile`, `uv sync --locked`, or the equivalent), so what was reviewed is what runs.
- **Pinning:** follow the project's policy on ranges versus exact versions. Automation (Dependabot, Renovate) needs CI gating, not auto-merge without review.

## Output

For each dependency change: the decision, the evidence for each question above, triaged advisories, and any follow-up (an override removal date, or a replacement plan). Facts about versions and advisories are time-sensitive, so record when they were checked.
