# Security review playbook

Class-specific probes for step 3 of the workflow. Start from the threat model; open only the sections whose boundary is in scope. Each probe names what to trace, what makes it exploitable, and what usually turns out to be a false lead.

## Tracing discipline

- **Source:** anything an actor outside the boundary controls: path/query/body/headers/cookies, uploaded files and their names, webhook payloads, queue messages, database rows written by other tenants, environment of untrusted CI jobs, model output, and retrieved documents.
- **Sink:** the operation where control matters: query builders, shells and process spawners, template renderers, HTML/DOM writes, filesystem paths, outbound HTTP, deserializers, redirects, authorization decisions, privileged state changes, and logs that feed other systems.
- **Path record:** source → each transform (parse, normalize, validate, encode) → sink, with file:line for each hop. A check that runs before normalization, on a different copy of the data, or on only one of several entry points does not protect the sink.
- **Second-order paths:** data stored safely and later read into a sink by a more privileged component (admin views, batch jobs, exports, emails) is still attacker-controlled.

## Authentication

- Token validation: signature algorithm pinned server-side, key selection not driven by token headers, `exp`/`nbf`/`aud`/`iss` checked, revocation honored where the product promises logout.
- Federated login: accounts linked only on a verified identity claim from the expected issuer; email equality alone is an account-takeover path.
- Recovery and step-up: reset/magic-link tokens are random, single-use, short-lived, bound to one account, and not leaked via Referer, logs, or responses. Look for alternate flows (API, mobile, legacy endpoint) that skip MFA.
- Sessions: identifier rotated on login and privilege change; cookies `HttpOnly`, `Secure`, appropriate `SameSite`; brute-force and OTP guessing rate-limited per account and per source.
- False lead: missing hardening on an endpoint that is not reachable without an already-privileged session.

## Authorization

- **Object level:** every read/update/delete by identifier proves the caller may act on that object. Query shape matters: `WHERE id = ?` with no owner/tenant predicate is the classic defect even when IDs are UUIDs.
- **Function level:** admin and internal operations are enforced on the server path, not by hidden UI or route naming.
- **Field level / mass assignment:** request bodies bound directly to models can set `role`, `tenantId`, `ownerId`, `isVerified`, prices, or limits.
- **Indirect routes to the same object:** search, export, bulk, GraphQL nested resolvers, signed-URL generation, websocket subscriptions, background jobs acting as a service principal, and caches whose keys omit user or tenant.
- **Decisive evidence:** a two-principal test (owner vs. other tenant) against the real handler, or a traced handler showing no ownership predicate on any path to the data.

## Injection and output encoding

- **Queries:** string-built SQL, ORM raw fragments, dynamic identifiers (`ORDER BY`, column names) that parameters cannot protect, NoSQL operator injection from JSON bodies (`{"$ne": null}`), search-engine query DSLs.
- **Commands:** shell interpretation of user data, and argument injection even without a shell (a value beginning with `-` becomes an option; require `--` or an allowlist).
- **Templates:** user data used as a template rather than passed as a variable (server-side template injection).
- **Browser:** encoding must match the context (HTML body, attribute, URL, JS, CSS). Watch raw-HTML escape hatches, markdown/rich-text renderers, `javascript:` and `data:` URLs in links, and user-controlled SVG/HTML served from the application origin. CSP reduces impact; it does not fix the sink.
- **Headers and logs:** CR/LF in header values, and log lines parsed by downstream tools.

## Server-side request forgery

- Any outbound fetch whose host, scheme, port, or path is influenced by input: URL import, webhooks, link previews, image/PDF renderers, OAuth/OIDC discovery, XML external entities.
- Exploitable when the server can reach internal services or cloud metadata endpoints and the response, timing, or side effect is observable.
- Validate the resolved address at connection time (DNS rebinding defeats check-then-fetch), re-validate every redirect hop, restrict schemes, and block loopback, private, link-local, and IPv4-mapped IPv6 ranges. A dedicated egress proxy with an allowlist is stronger than in-process filtering.
- False lead: fetch targets fixed by configuration, or a network that verifiably has no reachable internal surface.

## Files, paths, and archives

- Path joins with user input: traversal sequences, absolute paths, encoded separators, Windows drive letters and backslashes, symlinks inside the base directory. Correct pattern: canonicalize, then verify the result is inside the base.
- Archive extraction: entry names escaping the destination, symlink entries, and decompression bombs.
- Uploads: type decided by content and an allowlist, not by client `Content-Type` or extension; size limits enforced while streaming; user files served from a separate origin or with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`.

## Deserialization and parsers

- Native object deserializers on untrusted bytes (language-level object graphs, polymorphic JSON type hints, unsafe YAML loaders) are code-execution candidates; prove a reachable gadget or class before claiming RCE, otherwise report as a control failure with lower severity.
- XML with external entities or DTDs enabled; JavaScript deep-merge of user objects into shared prototypes; catastrophic-backtracking regular expressions on unbounded input.

## Secrets and cryptography

- Secrets in source, history, fixtures, client bundles (public env prefixes), published source maps, telemetry, error responses, logs, crash reports, and CI output. Exposure in history counts even after deletion: rotation, not just removal.
- Security tokens from a CSPRNG; MAC and token comparisons in constant time; passwords stored with a slow, salted password hash; TLS verification never disabled outside tests.
- Hand-rolled cryptographic protocols are a finding when they protect a real boundary; recommend a vetted library primitive.

## Webhooks, callbacks, and integrations

- Signature verified over the raw body with the provider's scheme, constant-time comparison, a bounded timestamp window, and replay protection by event ID. Handlers must be idempotent.
- Outbound integrations: credentials scoped to the minimum, and tenant data never mixed across a shared integration identity.

## Business logic and concurrency

- Check-then-act on balances, inventory, coupons, invites, and quotas without a transaction, lock, or unique constraint; parallel requests are the exploit.
- Negative, zero, huge, or fractional amounts; skipped workflow steps; state transitions accepted out of order; idempotency keys not bound to the caller.
- Failures that fail open: exceptions, timeouts, or unavailable dependencies that cause an authorization or validation step to be skipped.

## Configuration surfaces in the diff

- CORS that reflects arbitrary origins with credentials; cookie-authenticated state changes without CSRF protection; open redirects used in login or OAuth flows; debug endpoints and verbose errors enabled by default.
- Report these only with the path that turns them into impact; a missing header with no exploit path is a hardening note, not a finding.
- New dependencies, install hooks, or CI workflow changes in the diff: hand detailed assessment to `codebase-evolution-controller` (`references/dependency-risk.md`) or `verification-and-release` (`references/github-actions.md`), keeping only the exploit path here.

## LLM and agent features

- Model output reaching a sink (SQL, HTML, shell, file path, URL fetch, tool arguments) is untrusted input; apply the sink rules above.
- Retrieval: vector or search queries filtered by tenant and permission at query time, not after generation.
- Secrets or authorization logic placed in system prompts; per-user cost and rate limits on model calls.
- For tool use, delegation, plugins, and MCP servers, continue in `agent-execution-boundaries.md`.

## Category mapping

For reports that must map to a public taxonomy, use the current editions of the OWASP Top 10 (https://owasp.org/www-project-top-ten/) and the OWASP Top 10 for LLM Applications (https://genai.owasp.org/llm-top-10/), and name the edition in the report. Mapping is labeling only; it never substitutes for a traced path.
