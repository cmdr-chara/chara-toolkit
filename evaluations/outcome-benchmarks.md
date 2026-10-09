# Outcome-based paired evaluations

The original paired Codex evaluator in scripts/evaluate_behavioral_runs.mjs checks a small set of output-text proxies. It cannot establish whether AI-generated code works. The separate scripts/evaluate-task-outcomes.mjs executes **independent acceptance checks** against two pre-existing isolated project workspaces, records exit codes and durations, and optionally summarizes token usage from recorded Codex JSONL traces.

## Operating procedure

1. Create equivalent isolated A and B copies of the same starter repository with the same revision, dependencies, and acceptance tests. Do not let either agent see test fixtures, rubrics, other candidates, or grading labels. Supply the same organic user request and the same model/runtime settings; vary only the toolkit condition.
2. Run the agents in the isolated copies with suitable OS-level restrictions. This tool **does not invoke the models** or create the sandboxes.
3. Author a minimal outcomes.json for the independent observer:

    {
      "schema": 1,
      "model": "record-the-same-model-for-both",
      "cases": [
        {
          "id": "checkout",
          "folder": "service",
          "commands": [
            ["node", "--test", "tests/checkout-acceptance.test.mjs"]
          ],
          "trace": "codex-trace.jsonl"
        }
      ]
    }

Omit "trace" when raw Codex JSONL traces are not present in each evaluated folder. Trace data may contain secrets; keep it private.

4. After reviewing the check commands, run them with an explicit acknowledgment:

    node scripts/evaluate-task-outcomes.mjs --plan outcomes.json --baseline /tmp/run-A --candidate /tmp/run-B --acknowledge-execution --json

The script calls programs **without a shell**, fails closed on nested/identical workspace roots, and measures actual independent check outcomes. Because project scripts may have side effects, this action requires an isolated copy, test credentials, and host-enforced permissions. It does not grant safety just by avoiding shell strings.

Compare accepted behavior and regression count before considering timings. One execution time is not a benchmark; use repeated controlled runs to estimate runtime variation. Compare token usage only when both traces contain comparable usage records; never infer savings from a missing record.

## Honest scoring

- A is the baseline and B the candidate, with provenance recorded separately from the blind graders.
- Improved means B passes an independent check A failed, not that the model is universally better.
- Regressed means A passes a check B failed; the runner returns nonzero to surface regressions.
- Both pass or both fail is inconclusive about relative correctness.
- Passing commands alone do not certify production readiness, nor does presence of a tool event establish actual skill activation.
- Measure routing decisions and actual skill invocations separately, using the client/harness's supported instrumentation where available.

Run offline synthetic tests without model calls:

    node --test scripts/test_evaluate_task_outcomes.mjs scripts/test_evaluate_behavioral_runs.mjs

The CI suite tests harness behavior only. A true benchmark requires recorded matched agent runs and an independent acceptance harness.
