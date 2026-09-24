# Dependency risk

Adapted concepts from SkillMedev/skills under MIT; see `THIRD_PARTY_NOTICES.md`.

Use this reference when adding, upgrading, replacing, or auditing third-party dependencies.

## Evidence to collect

- resolved package/version and lockfile provenance;
- runtime/build/dev-only reachability;
- known vulnerabilities and whether the vulnerable code path is reachable here;
- available fixed versions and compatibility impact;
- maintenance/release health and security policy;
- publisher/provenance signals where the ecosystem exposes them;
- direct and transitive license obligations;
- reproducible CI installation from the committed lockfile.

Do not forward raw package-manager audit output as the decision. Rank remediation by reachable impact, available fix, deployment context, and migration cost.

A severe CVE in an unreachable dev-only path and a moderate issue on an internet-facing request path are different engineering risks. Record the evidence for any dismissal.

For new critical dependencies, identify a fallback or removal path when maintainer concentration, abandonment, or service ownership could create lock-in.
