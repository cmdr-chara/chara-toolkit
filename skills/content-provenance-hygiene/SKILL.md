---
name: content-provenance-hygiene
description: Inspect and sanitize provenance or metadata in user-owned text, images, PDFs, and documents. Use for evidence-first removal of invisible Unicode, C2PA, EXIF/XMP, or document metadata.
---

# Content Provenance Hygiene

Inspect first, change only authorized provenance/metadata surfaces, and verify the result without making authorship claims.

## Trigger boundary

Use this skill for authorized inspection or sanitation of invisible Unicode, C2PA/Content Credentials, EXIF/XMP, PDF/document properties, or similar provenance/metadata surfaces.

Do not trigger for detector evasion, authorship misrepresentation, unrelated rewriting/image editing, access-control bypass, or generic file transformation.

## Required inputs

Resolve the exact artifact/scope, ownership or authorization basis, inspect-only versus clean intent, visible-content preservation invariants, approved metadata classes, output expectations, working-tree/file state, and service availability if used.

## Safety baseline

- Preserve the original artifact by default.
- Inspect before mutation.
- Never claim metadata removal proves human authorship or defeats detection.
- Do not silently install or trust an external/local cleaning service.
- Treat unsupported container capabilities as unknown, not success.

## Workflow

1. **Freeze scope and intent.** Record artifact identity, preservation invariants, and allowed metadata classes.
2. **Inspect.** Identify confirmed, suspected, and unsupported provenance surfaces.
3. **Resolve optional service capability.** When the configured watermarks-remover integration is relevant, read `references/service-protocol.md` and verify the running service exposes the required capability before relying on it.
4. **Plan the smallest remediation.** Use `references/remediation-boundaries.md`; separate deterministic metadata cleanup from substantive content edits.
5. **Clean only approved scope.** Preserve visible pixels/text/structure unless the user explicitly requested otherwise.
6. **Re-inspect.** Compare target findings before/after and verify output integrity against the preservation invariants.
7. **Report.** State what was found, what changed, what could not be inspected, and what the result does not prove.

## Handoffs and interaction boundaries

Substantive writing/image/document edits belong to their owning workflow. Service implementation failures go to `debugging-investigator`. Product metadata behavior may involve documentation synchronization. Final release claims belong to `verification-and-release`.

## Failure handling

If the artifact type or service cannot inspect a requested surface, report the unsupported capability and stop before destructive conversion. If cleanup changes visible content unexpectedly, treat that as failure and preserve the original.

## Stop conditions

Stop when the authorized metadata scope is inspected, approved cleanup is verified against the original, integrity is checked, and unsupported surfaces or limitations are explicit.
