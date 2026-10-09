# Opt-in paired Codex behavioral evaluation

Chara's Toolkit ships deterministic *decision-boundary probes*, not precomputed claims of agent superiority. A paired comparison uses actual Codex JSONL output from the same prompt, model, and CLI build.

## Capture

Prepare two distinct CODEX_HOME directories using the same runtime/model configuration. The baseline has no toolkit routing/skills; the candidate has the intended toolkit revision. Configure authentication separately: the script never copies credentials or modifies either home. Disable unrelated custom instructions and external tools so the comparison is meaningful.

From the repository root, with an authenticated Codex CLI:

    node scripts/evaluate_behavioral_runs.mjs --capture --acknowledge-live-cost \
      --model YOUR_MODEL --baseline-home /path/to/baseline --candidate-home /path/to/candidate

This intentionally spends model usage. Use --case release-stale-proof for a small pilot. Each run starts in a fresh empty temporary directory, asks Codex for a read-only sandbox, and records JSONL traces and a records manifest under the gitignored evaluations/.behavioral-runs directory. The runner never asks for sandbox bypass. Host-level MCP/connector permissions may exceed local read-only scope; test only with safe accounts and controlled configurations.

## Re-score existing evidence

    node scripts/evaluate_behavioral_runs.mjs --records evaluations/.behavioral-runs/run-EXAMPLE/records.json

Add --json for machine-readable output. Paired records must match the suite fingerprint, case prompt, model, and CLI build. A missing or failed run is a failure; mismatched/unsafe evidence is rejected. A candidate regression returns a nonzero exit code.

Current checks inspect final responses and selected Codex events, not real code correctness, actual skill activation, or exploitability. A positive proxy score is not an enterprise release gate: review traces, sample repeat runs, and use purpose-built projects with independent acceptance tests before asserting effectiveness. Keep captured traces private, as they can include tool outputs.

## Offline harness check

    node --test scripts/test_evaluate_behavioral_runs.mjs

The test suite uses synthetic trace events and a fake Codex executable; it does not make model calls.
