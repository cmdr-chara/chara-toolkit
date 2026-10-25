# Inspection toolchain

Use this reference to choose inspection and cleanup tools for each provenance surface. The skill is backend-agnostic: use whichever of these tools the user already has, or a sanitation tool or service the user has explicitly configured. Confirm flags against the installed version's `--help` before you run anything that writes.

## Resolve availability first

- Probe with read-only commands (`exiftool -ver`, `c2patool --version`, `qpdf --version`, `python -c "import pikepdf"`). Record each tool's version.
- Never install a tool, start a service, or send a file to a remote endpoint without the user's approval. Uploading a document to a cleaning service discloses its content.
- A surface with no available inspector is reported as `not inspectable with available tools`. It is never reported as `not detected`.
- A tool that supports a format does not prove that a given file can be cleaned losslessly. Keep the integrity checks below separate from the tool's own success report, and keep any confidence qualifier a tool attaches to a finding.
- Send a tool or service only the artifact that was authorized, never a whole directory or repository.

## Surfaces and tools

| Surface | Inspect (read-only) | Clean (writes a copy) | Blind spots |
| --- | --- | --- | --- |
| Invisible/format Unicode in text, Markdown, HTML, code | `scripts/inspect_text_invisibles.py` | A targeted removal of the reported code points, on a copy | Visually confusable letters that are ordinary characters; meaning-bearing joiners in some scripts (for example ZWJ in emoji sequences, ZWNJ in Persian) |
| EXIF / XMP / IPTC in images | `exiftool -a -G1 -s FILE` | `exiftool -o OUT -<GROUP>:all= FILE` for the approved groups only | Metadata inside proprietary maker notes; data encoded in pixels |
| C2PA / Content Credentials | `c2patool FILE` (shows the manifest store) | Re-encode or strip only on explicit request, writing a copy | Removing a manifest does not remove invisible watermarks embedded in the pixels |
| PDF document info and XMP | `qpdf --json FILE`, or pikepdf (`pdf.docinfo`, `pdf.open_metadata()`) | pikepdf: edit docinfo/XMP and save to a new file | Incremental updates keep old revisions; attachments; per-object metadata |
| PDF prior revisions | Look for multiple `%%EOF` markers or an `/Prev` chain | `qpdf --linearize IN OUT` rewrites without the old revisions | The rewrite invalidates digital signatures |
| Office (OOXML) properties | Unzip and read `docProps/core.xml`, `docProps/app.xml`, `docProps/custom.xml` | Edit the properties in a copy with the office library or application | Comments, tracked changes, revision IDs (`w:rsid`), hidden text, embedded objects |

## Preservation checks

Pick the checks that fit the artifact and record their results:

- **Images:** decode both files and compare the pixel data hash (for example with a Python imaging library). File hashes will differ by design.
- **PDF:** compare the page count, extracted text, and the rendered pages at a fixed DPI. Check that forms, links, bookmarks, and attachments are still there. Report any signature that the change invalidated.
- **Text:** the diff must contain only the removed code points. Check that the file still parses (Markdown, HTML, source code).
- **Office:** the document opens; the body text and the comment/revision counts match unless they were in scope.

## Reporting

For each surface: which tool was used (and its version), the findings before and after, the confidence label from `remediation-boundaries.md`, and any blind spot that applies to this artifact.
