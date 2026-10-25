# Agent execution trust boundaries

Read only when reviewing applications with agents, autonomous tool calls, external skills, plugins, or MCP servers. An instruction to a model is not a permission boundary: assume any text the model reads can steer it, and judge the system by what it can do when steered.

## Trace real authority

| Boundary | Potential failure | Evidence |
| --- | --- | --- |
| Retrieved data → agent | Repository text, tool output, email, web content, or file metadata becomes an instruction (indirect prompt injection) | Input, effective instruction hierarchy, observed behavior |
| Agent → tool | A model requests an action outside its task, or with attacker-shaped arguments | Host-enforced capabilities, argument validation, denial events |
| Tool → protected data | The request inherits a broader identity or another tenant's access (confused deputy) | Principal, token scope, resource authorization |
| Agent → outbound channel | Data leaves through a fetch, rendered image/link URL, email, commit, or ticket | Egress controls, rendering policy, recipient allowlists |
| Agent → memory/state | Injected content persists and steers later sessions or other users | Memory scoping, write provenance, review of stored items |
| Agent → subagent | Delegation silently increases access or write scope | Mission card, granted capabilities, parent acceptance |
| Package → runtime | A skill, hook, or server changes behavior or tool descriptions after approval | Source identity, release digest, publisher trust |

## The lethal combination

Rate risk highest when one agent session holds all three: access to private data, exposure to untrusted content, and a channel that can send data out or cause external effects. Removing any one leg (separate sessions, no egress, human approval on the effect) is usually the smallest effective fix.

## Review procedure

1. Name the attacker-controlled surface and the protected operation. Documents, search results, logs, browser pages, issue text, tool descriptions, and handoff messages remain untrusted data.
2. Locate the enforcing control: host sandbox, connector ACL, tool dispatcher, resource-level authorization, or external policy engine. Prompt text, system-prompt rules, and "the model is told not to" are advisory.
3. Check tool selection and arguments together. Narrow tool names do not guarantee narrow authority: a "read file" tool with an unrestricted path, or a "run tests" tool that executes repository-defined scripts, is general execution.
4. Treat model output as untrusted input at every sink (shell, SQL, HTML/markdown rendering, file paths, URLs); apply `review-playbook.md` sink rules.
5. Inspect outbound requests, credential propagation, logging, rendered content, and cross-agent summaries for unintended disclosure. Never put real secrets into test prompts.
6. Check that approval is for an exact operation and survives retries, delegation, aliases, and tool substitution. Auto-approve or "always allow" settings widen authority and must be scoped. Permission expansion needs independent trusted authorization.
7. Check per-user and per-session cost, rate, and recursion limits on model and tool calls.
8. Distinguish integrity from authenticity: a hash produced by the same untrusted publisher does not prove trusted provenance. Re-approval should trigger when a server's tool list or descriptions change.
9. Where safe, test a benign attack-shaped input (for example, a document containing an instruction to call a harmless canary tool) against an isolated harness, never production accounts.

## Finding admission

Require a reachable path from untrusted input through a violated authority boundary to an effect, then calibrate with `finding-calibration.md`. "The model could be tricked" is not a finding by itself; "content from an untrusted issue can make the agent call `create_release` with repository write scope and no approval" is. Record host/runtime limitations and missing evidence. Do not equate the presence of a rules file, pattern scanner, or guardrail prompt with enforceable policy or compliance.
