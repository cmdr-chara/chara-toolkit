# GitHub Actions review

Use this when CI speed, trust boundaries, permissions, caching, or deploy gates are part of the release question. Confirm event semantics in GitHub's Actions documentation before relying on an edge case.

## Trust boundaries first

| Trigger | Runs with | Main risk |
| --- | --- | --- |
| `pull_request` from a fork | Read-only token, no secrets | Low, unless self-hosted runners execute fork code |
| `pull_request_target` | Base-repo token and secrets | Checking out and running PR head code gives attackers your secrets |
| `workflow_run` | Privileged context after another workflow | Consuming artifacts or caches produced by untrusted runs |
| `issue_comment`, `issues` | Privileged context | Treating comment or issue text as trusted input |

Rules:

- Never check out or build untrusted PR code in `pull_request_target` or `workflow_run` jobs that have secrets or write permissions. Split them: an unprivileged job builds, and a privileged job only consumes validated, inert data.
- Never interpolate untrusted context (`github.event.*.title`, `body`, `head_ref`, branch names, commit messages) directly into `run:` scripts. Pass it through `env:` and quote it as a shell variable.
- Don't run public-fork PRs on self-hosted runners.

## Least privilege

- Set `permissions:` at the workflow level (start from `contents: read`, or `{}`), and grant more per job only where needed.
- Deploy to cloud with OIDC (`id-token: write` on the deploy job) and short-lived credentials instead of long-lived secrets.
- Put production deploys behind environments with required reviewers and branch restrictions.

## Supply chain

- Pin third-party actions to a full commit SHA, with the version in a comment, and let Dependabot or Renovate update the pins. First-party actions can follow the repository's policy.
- Review new actions like any other dependency: who publishes them, and what they do with the token.
- Treat downloaded artifacts and restored caches as untrusted input in privileged jobs. A cache written by an untrusted run can poison a later trusted build. Use separate cache keys for release builds, or skip caches there.

## Reliability and speed

- Set `timeout-minutes` on every job.
- Use `concurrency` groups with `cancel-in-progress: true` for PR validation, but never for deploys, where a cancelled run can leave a half-applied release.
- Use `needs` only for real data or control dependencies, and run everything else in parallel. In monorepos, skip unaffected expensive jobs only when the changed-path or affected-graph analysis is trustworthy.
- Required checks fail loudly: no blanket `continue-on-error` and no automatic retries that hide failures.
- Measure before you optimize. Find the critical path from job timings, then cache dependency downloads keyed on lockfile hashes and split independent jobs. For parallel steps inside a job, see `github-actions-parallelism.md`.
- Make required status checks match the job names that actually run, including when path filters skip jobs.

## Evidence for a release decision

Record the workflow run URL, commit SHA, the triggers and permissions in effect, the action pins, which checks ran and which were skipped, and any secrets or environments involved.
