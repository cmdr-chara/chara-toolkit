# Remediation boundaries

Use this reference after inspection when deciding whether a proposed sanitation step is deterministic metadata hygiene or a broader content transformation that needs a different workflow or renewed approval.

## Default deterministic scope

These operations fit the normal skill boundary when the user owns or is authorized to modify the artifact and has asked for the relevant cleanup:

- remove or normalize invisible/control Unicode that does not carry intended visible text;
- remove C2PA/Content Credentials when the user explicitly asks to remove that metadata from their own artifact;
- remove EXIF/XMP or document properties within the approved metadata scope;
- clean supported HTML/Markdown/document metadata without rewriting substantive content;
- rebuild a supported container only when the service reports that the required format tooling is available and the visible-content invariants can be checked afterwards.

Inspection must precede sanitation. Re-inspection must follow it when the target finding matters.

## Scope that needs explicit consequence review

Pause or obtain renewed approval before:

- stripping all metadata rather than only the requested metadata class;
- removing accessibility, licensing, copyright, color-profile, geospatial, timestamp, workflow, or document-management metadata that may have legitimate downstream value;
- rebuilding a PDF or office container when the rebuild can alter signatures, forms, attachments, bookmarks, annotations, rendering, or other structure;
- replacing the original file in place when a separate cleaned copy is possible;
- applying a capability whose output semantics are not visible in `/capabilities` or `/openapi.json`.

State the expected loss or uncertainty instead of hiding it behind a generic “clean” label.

## Outside the default skill boundary

The following are not ordinary provenance-hygiene operations and must not be automatically proposed or executed:

- rewriting prose to make it appear human-authored or to defeat an authorship detector;
- changing code, comments, identifiers, or document wording merely to reduce detectability;
- image retouching or regeneration unrelated to metadata sanitation;
- CAPTCHA, login, DRM, paywall, or access-control bypass;
- alteration intended to falsify chain of custody, authorship, evidence, legal records, or regulatory provenance.

If the user has a legitimate editing goal independent of provenance, hand it to the appropriate writing, image, document, or code workflow and describe it as an ordinary content edit.

## Verification language

Use calibrated language:

- `confirmed`: the available inspection path directly reports the target metadata/provenance surface;
- `probable`: evidence is strong but not definitive;
- `informational`: a heuristic or contextual signal that is not enough to justify destructive sanitation alone;
- `not detected`: the available inspection path did not report the target; this is not proof that no other provenance mechanism exists.

A successful sanitation result means the approved target is no longer reported by the available inspection path and the artifact passed the chosen integrity checks. It does not prove human authorship or erase the real history of the artifact.

## Output preservation checklist

Before declaring `SANITIZED`, check the dimensions relevant to the format and request:

- the output opens/parses as the expected format;
- visible text or pixels are unchanged when the operation was metadata-only;
- links, forms, annotations, accessibility semantics, or other requested structural features still work when applicable;
- the targeted finding is absent or reduced on re-inspection;
- unexpected metadata loss is reported;
- the original remains available when verification is incomplete.
