# GitHub Actions verification and hardening

Adapted concepts from SkillMedev/skills under MIT; see `THIRD_PARTY_NOTICES.md`.

Use this reference when GitHub Actions itself is part of the release risk or feedback problem.

## Review order

1. Map required checks, real job dependencies, and current wall-clock bottlenecks.
2. Parallelize independent jobs; use `needs` only for actual data/control dependencies.
3. Cancel superseded branch runs when safe.
4. Prefer package-manager-native caches keyed from lockfiles; measure cache effectiveness before adding more cache layers.
5. In monorepos, avoid unrelated expensive jobs when changed-path/affected analysis is trustworthy.
6. Set least-privilege `permissions:`; widen only at the job that needs it.
7. Treat forked PR code as untrusted. Be especially careful with `pull_request_target`; privileged jobs must not execute untrusted checkout contents.
8. Prefer short-lived OIDC credentials over long-lived deploy keys where supported.
9. Pin third-party actions to immutable revisions when the repository's supply-chain policy requires it.
10. Required checks must fail loudly; do not hide failures with blanket `continue-on-error` or retries.

CI speed targets are repository-specific. Optimize from measured critical-path time rather than universal minute thresholds.
