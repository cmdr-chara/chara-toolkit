---
name: content-provenance-hygiene
description: Inspect and sanitize provenance or metadata in user-owned text, images, PDFs, and documents. Use for evidence-first removal of invisible Unicode, C2PA, EXIF/XMP, or document metadata. Not for disguising authorship or evading AI detectors.
---

# Content Provenance Hygiene

Inspect first, change only authorized provenance/metadata surfaces, and verify the result without making authorship claims.

## Trigger boundary

Use this skill for authorized inspection or sanitation of invisible Unicode, C2PA/Content Credentials, EXIF/XMP, PDF/document properties, or similar provenance/metadata surfaces.

Do not trigger for detector evasion, authorship misrepresentation, unrelated rewriting/image editing, access-control bypass, or generic file transformation.

## Required inputs

Resolve the exact artifact/scope, ownership or authorization basis, inspect-only versus clean intent, visible-content preservation invariants, approved metadata classes, output expectations, working-tree/file state, and which inspection tools are available locally.

## Safety baseline

- Preserve the original artifact by default.
- Inspect before mutation.
- Never claim metadata removal proves human authorship or defeats detection.
- Do not silently install tools, start services, or upload artifacts to a remote cleaner; uploading discloses the content.
- Treat unsupported container capabilities as unknown, not success.

## Workflow

1. **Freeze scope and intent.** Record artifact identity, preservation invariants, and allowed metadata classes.
2. **Resolve tooling.** Read `references/inspection-toolchain.md`, probe which inspectors are available, and mark surfaces without one as not inspectable. For text, run the read-only scanner:

   ```sh
   python skills/content-provenance-hygiene/scripts/inspect_text_invisibles.py PATH... --format markdown
   ```

   It reports zero-width, bidi-control, tag, variation-selector, soft-hyphen, and other format characters with file:line:column, never modifies files, and exits 1 when it finds anything.
3. **Inspect.** Run the available inspectors read-only and classify each surface as confirmed, probable, informational, not detected, or not inspectable.
4. **Plan the smallest remediation.** Use `references/remediation-boundaries.md`; separate deterministic metadata cleanup from substantive content edits.
5. **Clean only approved scope.** Preserve visible pixels/text/structure unless the user explicitly requested otherwise.
6. **Re-inspect.** Compare target findings before/after and verify output integrity against the preservation invariants.
7. **Report.** State what was found, what changed, what could not be inspected, and what the result does not prove.

## Handoffs and interaction boundaries

Substantive writing/image/document edits belong to their owning workflow. Cleaning-tool failures with an unknown cause go to `debugging-investigator`. Product metadata behavior may involve documentation synchronization. Final release claims belong to `verification-and-release`.

## Failure handling

If no available tool can inspect a requested surface, report the unsupported capability and stop before destructive conversion. If cleanup changes visible content unexpectedly, treat that as failure and preserve the original.

## Stop conditions

Stop when the authorized metadata scope is inspected, approved cleanup is verified against the original, integrity is checked, and unsupported surfaces or limitations are explicit.
