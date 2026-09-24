# Security review playbook

Use this reference for security-focused review details. It is adapted in original wording from MIT-licensed SkillMedev/skills concepts; see `provenance.md` and the repository `THIRD_PARTY_NOTICES.md`.

## High-value review lanes

### Authorization and IDOR
For every protected read or mutation, confirm the authenticated principal is authorized for the specific object, tenant, role, or action. Route-level authentication alone is not object-level authorization.

### Injection
Trace untrusted values into SQL/query builders, shell/process execution, HTML/templates, header construction, redirects, and dynamic code. Prefer parameterization, explicit allowlists for identifiers, context-aware encoding, and APIs that avoid shell interpretation.

### SSRF and outbound requests
If user-controlled data affects a destination, validate scheme/host/port against the application's actual policy, account for redirects and alternate address forms, and protect cloud/internal metadata or private-network targets where relevant.

### File and path handling
Normalize and resolve user-controlled paths against an expected root. Treat archive extraction, uploads, MIME/type assumptions, filename reuse, and symlink behavior as separate attack surfaces.

### Mass assignment and deserialization
Bind only intended mutable fields. Avoid native object deserialization for untrusted data; prefer schema-validated formats and explicit constructors.

### Secrets and sensitive data
Check logs, errors, client bundles, source maps, fixtures, environment handling, and telemetry. Redaction belongs at the boundary that emits data, not only in developer convention.

### Business logic
Review invariants scanners rarely understand: replay/idempotency, quota/payment transitions, privilege changes, approval workflow, ownership transfer, race windows, and state-machine bypass.

## Finding contract

A reportable finding should include:
- affected file/symbol/boundary;
- attacker or failure precondition;
- concrete path from input/authority to impact;
- affected confidentiality/integrity/availability or business invariant;
- severity rationale tied to reachable impact;
- smallest credible remediation;
- focused regression evidence.

Prefer a short set of high-confidence findings over a large speculative list.
