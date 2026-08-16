# Optional service protocol

**Upstream inspected:** `guillaumemeyer/watermarks-remover`  
**Pinned reference revision:** `fcebf533583d7a313b348dbe421f3b4b17163b66`  
**License:** MIT  
**Source:** https://github.com/guillaumemeyer/watermarks-remover

This toolkit skill does not vendor, redistribute, or silently install the upstream service. The pinned revision is an evidence point for the protocol inspected while designing this thin-client integration. Runtime behavior must still be checked against the actual service instance before relying on an optional capability.

## Connection contract

Resolve the base URL from `WATERMARKS_SERVICE_URL`. If it is unset, the upstream service convention is the loopback endpoint `http://127.0.0.1:8765`.

A service operator may require bearer authentication. Keep server-side configuration and client credentials separate. The upstream documentation uses `WATERMARKS_SERVER_API_KEY` for protecting the server and `WATERMARKS_SERVICE_API_KEY` as the client-side credential convention. Never print either secret.

The inspected protocol exposes these core endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Confirm service availability/version before sending an artifact. |
| `GET` | `/capabilities` | Discover optional inspection and sanitation tools available at runtime. |
| `GET` | `/openapi.json` | Read the machine-readable API contract from the running service. |
| `POST` | `/inspect` | Inspect a base64-encoded artifact and return classified metadata/provenance findings. |
| `POST` | `/clean` | Apply explicitly selected metadata sanitation options and return cleaned bytes plus a report. |

The service routes artifacts by filename/format and file bytes. Send only the bounded artifact the user authorized, not an entire directory or unrelated repository state.

## Inspect request shape

The upstream API accepts JSON containing the file bytes as base64 and the original file name, conceptually:

```json
{
  "file": "<base64>",
  "name": "document.pdf"
}
```

Treat `/inspect` as the evidence source for this skill. Preserve the confidence or qualification attached to a returned finding; do not upgrade an informational signal into a confirmed claim.

## Clean request shape

`/clean` accepts the same file/name fields plus an options object. Only send options needed for the user's approved deterministic metadata-hygiene scope. Do not infer optional tool availability from documentation alone.

Query `/capabilities` before relying on format-specific tooling. For example, a deployment may or may not expose C2PA inspection, metadata tooling, or PDF rebuild support.

## Capability discipline

A capability name means the running service reports an implementation path; it does not prove that every input can be sanitized losslessly. Keep file integrity and before/after inspection as separate verification steps.

Do not use this integration to disguise authorship, defeat detectors, bypass access controls, or perform unrelated content rewriting. Those goals are outside the protocol this skill adopts.

## Protocol drift

The source revision above is pinned only for design traceability. Before depending on an endpoint, field, option, or capability that is not visible in the running service's `/openapi.json` or `/capabilities`, treat the contract as unknown and stop rather than guessing.

If the upstream protocol changes materially, update this reference and the routing/workflow tests together. No endorsement by the upstream author or contributors is implied.
