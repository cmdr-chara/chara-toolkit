# Chara's Toolkit — reviewer policy

This is guidance for a reviewer that explicitly reads it, **not** a GitHub/App enforcement mechanism. Applicable `AGENTS.md` instructions take priority.

## Failure modes to prioritize

- A skill routes the task to the wrong specialist or silently bypasses a safety, approval, or stop condition.
- Agent wording claims tests, integrations, deployments, or final completion without traceable evidence.
- New instructions permit unwanted file writes, destructive commands, merges, releases, credential exposure, or unauthorized human approval substitution.
- Installer, updater, packaging, routing, portability, or Windows/macOS/Linux behavior violates documented contracts.
- Evaluations are rewritten to hide a failure, weakening protections rather than exercising behavior.

## Admissible findings

- Start with `Actionable findings: N` (including justified `0`).
- Include exact file/line, reachable scenario, violated contract, impact, minimal correction, and confidence. Try existing guard/caller counterexamples.
- Keep pre-existing issues and optional structural improvements separate. Avoid style-only comments, ungrounded suspicions, and repeat nits.
- Disclose base/head, review depth, checks observed, gaps and unreviewed paths. An unexecuted check is not a pass.
- On follow-up, review the new delta and affected invariants; halt automated fix/re-review after three substantive rounds.

## Review boundaries

- Inspect changed code and its routing/evaluation/installer consumers. Avoid unrelated generated/vendor content, but review authoritative source when output changes.
- Give security, installation, release, permissions and approval changes deeper scrutiny even if the diff is short.
- A review does not grant permission to edit, approve on behalf of humans, resolve unsupported threads, merge, deploy or publish.
