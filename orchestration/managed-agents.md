# Codex Toolkit routing

Codex Toolkit provides specialist skills plus optional multi-stage workflows. Keep this routing layer short: the selected specialist remains authoritative for domain decisions, safety, approval, migration, and release boundaries.

For substantial software work:

1. Infer the user's actual task before selecting skills. Do not activate skills merely because they are installed.
2. Use `repository-intelligence` first when architecture, ownership, blast radius, or affected consumers are materially unclear. Skip it when the relevant boundary is already well understood.
3. Choose **one primary specialist** for the decision in front of you. Add supporting skills only when their trigger becomes true.
4. For open-ended unknown-bug hunting, use `bug-finder`; once a concrete failure needs causal explanation, hand it to `debugging-investigator`.
5. Use `unlazy` for substantial accepted work where forgotten deliverables or premature completion are realistic. It cannot override another skill's `AWAITING_APPROVAL`, safety, or release boundary.
6. Use `multi-agent-work-coordinator` only when work can be decomposed into non-overlapping ownership with explicit integration order.
7. Use `verification-and-release` for final integrated ship/no-ship judgment, not as a generic test runner.
8. Preserve repository-local `AGENTS.md` instructions. More specific project rules override this generic routing guidance.

For multi-stage tasks, read the workflow catalog at `~/.codex/codex-toolkit/workflows.md` (or the equivalent path under the active `CODEX_HOME`) and select the smallest matching workflow. Workflow sequencing never grants permissions that an individual specialist does not have.
