# Finding admission and severity calibration

Use before reporting. The goal is a short list the owner can act on, where every severity can be defended from evidence rather than from the vulnerability class name.

## Admission test

Admit a finding only when all four hold:

1. **Reachable source.** A named actor can supply or influence the input in the deployed configuration (or the configuration is unknown and is stated as an assumption).
2. **Violated control.** A specific check is missing, bypassable, applied to the wrong data, or enforced in the wrong place. Cite file:line for the path and for the missing/flawed check.
3. **Effect.** The path ends in a concrete security consequence: data read or changed across a boundary, privilege gained, code executed, credentials exposed, or availability lost at a cost the attacker can afford.
4. **Survives falsification.** You looked for the guard that would defeat it (middleware, gateway policy, framework default, schema constraint, upstream sanitization) and either found none or found it inapplicable.

Anything that fails one test is either dropped or reported separately as `hardening` (no demonstrated path) or `unconfirmed` (path depends on a stated unknown).

## Evidence levels

| Level | Meaning | Typical support |
| --- | --- | --- |
| Demonstrated | Behavior observed | Failing negative test, local PoC against an isolated harness, request/response pair from a test environment |
| Traced | Complete static path with no guard found | Source → sink hops with file:line and the absent check |
| Inferred | Path plausible but one hop depends on unseen code or configuration | Named missing artifact that would confirm or refute |

Severity may not exceed what the evidence level supports: an `Inferred` finding is reported with its condition, never as confirmed critical.

## Severity

Rate impact and exploitability separately, then combine.

**Impact** (worst realistic outcome, not the theoretical maximum):
- *Severe:* cross-tenant or bulk data access, account takeover of arbitrary users, remote code execution, credential or signing-key compromise, unauthorized money movement.
- *Significant:* access to another user's data within a tenant, privilege escalation to a limited role, stored script execution against other users, internal network reach through SSRF.
- *Limited:* information disclosure of low-sensitivity data, self-only effects, denial of service requiring sustained resources.

**Exploitability** (preconditions the attacker must meet):
- *Easy:* anonymous or any authenticated user, single request or simple script, no victim interaction.
- *Moderate:* requires a specific role, victim interaction, a race window, guessable but non-sequential identifiers, or a non-default but common configuration.
- *Hard:* requires a privileged insider, a rare configuration, chained unknowns, or a precondition outside the attacker's control.

| | Easy | Moderate | Hard |
| --- | --- | --- | --- |
| **Severe** | Critical | High | Medium |
| **Significant** | High | Medium | Low |
| **Limited** | Medium | Low | Low |

Adjust one step, and say why, for: compensating controls verified in the deployment (down), active exposure such as an internet-facing endpoint already in production (up), or regulated data classes (up). Do not adjust for "IDs are UUIDs" or "nobody would find this endpoint"; obscurity is a precondition only when the identifier is truly unguessable and never leaks through other responses.

## Report shape

For each admitted finding:

- **Title:** effect plus boundary, e.g. "Any tenant can read another tenant's invoices via `GET /invoices/:id`".
- **Severity and evidence level**, with the impact/exploitability reasoning in one or two sentences.
- **Path:** source → hops → sink, with file:line.
- **Preconditions and assumptions.**
- **Fix direction:** the smallest change at the enforcing boundary (for example, add the tenant predicate in the repository query used by all handlers) rather than a list of generic mitigations.
- **Regression check:** the negative test that fails today and must pass after the fix.

Open the report with the count of admitted findings (including zero), the scope examined, and the coverage not examined. Put `hardening` and `unconfirmed` items in their own short sections after the findings.

## Anti-patterns

- Restating scanner or checklist output without a traced path.
- One finding per call site for a single missing control; group by root cause and list affected sites.
- Severity from the class name ("SQL injection is always critical") instead of the actual path and data.
- Fix advice that moves the problem ("validate input") without naming the boundary and the rule.
- Treating framework protections as absent without checking that they are disabled or bypassed on this path.
- Mixing style, maintainability, or performance remarks into the security result.
