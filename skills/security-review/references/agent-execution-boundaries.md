# Agent execution trust boundaries

Read only when reviewing applications with agents, autonomous tool calls, external skills, plugins, or MCP servers. An instruction to an agent is not a permission boundary.

## Trace real authority

| Boundary | Potential failure | Evidence |
| --- | --- | --- |
| Retrieved data → agent | Repository text, tool output, or web content becomes an instruction | Input, effective instruction hierarchy, observed behavior |
| Agent → tool | A model requests an action outside its task | Host-enforced capabilities, argument validation, denial events |
| Tool → protected data | The request inherits broader identity or another tenant's access | Principal, token scope, resource authorization |
| Agent → subagent | Delegation silently increases access or write scope | Mission card, granted capabilities, parent acceptance |
| Package → runtime | A skill, hook, or server changes after approval | Source identity, release digest, publisher trust |

## Review procedure

1. Name the attacker-controlled surface and the protected operation. Documents, search results, logs, browser pages, and handoff messages remain untrusted data.
2. Locate the enforcing control: host sandbox, connector ACL, tool dispatcher, resource-level authorization, or external policy engine. Prompt text alone is advisory.
3. Check both tool selection and arguments. Narrow tool names do not guarantee narrow read or write authority.
4. Inspect outbound requests, credential propagation, logging, and cross-agent summaries for unintended disclosure. Never put real secrets into test prompts.
5. Check that approval is for an exact operation and survives retries, delegation, aliases, and tool substitution. Permission expansion needs independent trusted authorization.
6. Distinguish integrity from authenticity: a hash produced by the same untrusted publisher does not prove trusted provenance.
7. Where safe, test a benign attack-shaped input against an isolated harness, never production accounts.

## Finding admission

Require a reachable path from untrusted input through a violated authority boundary to an effect. Record host/runtime limitations and missing evidence. Do not equate the presence of a rules file, pattern scanner, or checklist with enforceable policy or compliance.
