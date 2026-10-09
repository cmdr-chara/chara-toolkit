# Optional parallel steps in GitHub Actions

Load when a workflow has independent steps whose serial execution materially delays feedback. First profile real queue, setup, critical-path, and runner-resource times; do not parallelize by habit.

GitHub Actions supports job-local concurrency with separate logs using background, wait, wait-all, cancel, and parallel. This is distinct from independent jobs using needs and matrix, and does not automatically save billed runner-minutes.

### Small independent group

    steps:
      - uses: actions/checkout@<approved-commit-sha>
      - parallel:
          - name: Lint sources
            run: npm run lint
          - name: Check TypeScript
            run: npm run typecheck
      - name: Verify integrated tests
        run: npm test

This illustration requires those commands to exist and to be safe concurrently. It is not a ready-to-copy workflow without an approved checkout SHA.

For independent long-running activities, use a step with id and background: true; wait: <id> or wait-all: blocks before dependent work; cancel: <id> can stop a service you started. A wait failure propagates a background failure. Check compatibility with your runner, concurrency caps, timeouts, shared files/cache, secrets, and graceful termination.

**Choose when useful:** parallel lint and static checks that neither mutate shared outputs; starting a test fixture while the next task prepares inputs. **Avoid when unsafe:** migrations, signing, deployment gates, generated-file modification, release asset writes, shared package install/lockfile mutations, or tests requiring exclusive ports/DB state.

Measure before/after elapsed feedback, number of billed jobs, CPU and memory contention, and failure isolation. On a small runner, competing CPU-intensive steps can run *slower*. Preserve explicit permissions and all required checks; never use continue-on-error to conceal an asynchronous failure.

Sources: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax and https://github.blog/changelog/2026-06-25-actions-steps-can-now-be-run-in-parallel/
