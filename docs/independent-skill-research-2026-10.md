# Independent engineering-skill research — completed 2026-10-09

This is a design note, **not imported code or copied skill instructions**. The corresponding toolkit changes were independently written to fit existing specialist ownership. No new third-party notices are needed for these original additions; all pre-existing notices and bundled licenses remain intact.

| Studied repository | Useful engineering idea | Toolkit decision |
| --- | --- | --- |
| [Addy Osmani's agent-skills](https://github.com/addyosmani/agent-skills) | Paired skill/no-skill behavioral evidence; context curation; telemetry | Optional Codex trace runner, bounded context and browser/operational references |
| [Superpowers](https://github.com/obra/superpowers) | Adversarial cases and stopping rules | Decision-boundary pressure cases and negative-path checks |
| [Matt Pocock's skills](https://github.com/mattpocock/skills) | Domain vocabulary and cohesive interface design | Independent refactoring seam checklist |
| [GitHub's awesome-copilot](https://github.com/github/awesome-copilot) | Agent permissions and supply-chain risk | Host-enforced tool-boundary and release references |
| [Wshobson's agents](https://github.com/wshobson/agents) | On-call/observability workflows | Production diagnostics guidance inside the web builder |
| [Trail of Bits skills](https://github.com/trailofbits/skills) | Security research discipline | Methodology-level study only; no text, examples, or code copied |

The first five repositories have MIT-licensed repository metadata; Trail of Bits has CC BY-SA 4.0 repository metadata. Individual contributed files may have separate notices. Future direct reuse requires checking that specific material and complying with its license.

The offline evaluator tests prove only that its data contracts, parser, and comparison mechanics behave correctly. They do not show skill improvements from actual model runs; that evidence must be captured in the operator's environment before claiming effectiveness. See [behavioral evaluation guide](../evaluations/behavioral-benchmark.md).

Further independent inspirations (reviewed 2026-10-09): [Lauren Tan's pstack](https://github.com/cursor/plugins/tree/main/pstack) for source-grounded real feature controls and preventing repeated mistakes; [Bend 2](https://github.com/bendlang/bend/blob/main/guide/GUIDE.md) for conditional human-owned laws and kernel verification; and [GitHub Actions parallel steps](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) for measured, optional CI concurrency. No third-party instructions or code were copied into these new references.
