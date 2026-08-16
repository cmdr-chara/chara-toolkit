---
name: content-provenance-hygiene
description: "Inspect and sanitize provenance or metadata surfaces in user-owned text, images, PDFs, and document containers through an optional local watermarks-remover service. Use when the user wants evidence-first removal of invisible Unicode, C2PA, EXIF/XMP, or document metadata. Do not use for detector evasion, authorship misrepresentation, CAPTCHA/access-control bypass, or unrelated rewriting."
---

# Content provenance hygiene

Use this skill for evidence-first inspection and deterministic sanitation of provenance or metadata surfaces in content the user owns or is authorized to modify.

The skill is a thin client. It does not vendor or silently install the `watermarks-remover` runtime. When that optional service is available, call its HTTP API; when it is not available, report the missing capability rather than inventing a local fallback.

Read `references/service-protocol.md` before relying on service endpoints or capability names. Read `references/remediation-boundaries.md` before proposing any content-altering or pixel-domain operation.

## Trigger boundary

Use this skill when the primary request is to:

- inspect text for invisible Unicode, exotic spaces, bidi controls, tag characters, or similar provenance/hygiene artifacts;
- inspect or remove C2PA/Content Credentials, EXIF, XMP, document properties, or comparable metadata from a user-owned artifact;
- sanitize supported PNG, JPEG, WebP, SVG, PDF, DOCX, ODT, HTML, Markdown, or plain-text content while preserving the visible content where the requested operation permits;
- compare before/after provenance findings and produce a bounded sanitation record;
- determine whether the optional local service has the capability required for a requested format or operation.

Do not trigger this skill when the primary goal is:

- to make AI-generated material appear human-authored, defeat an authorship detector, or conceal provenance in order to misrepresent who created the content;
- statistical watermark reduction by paraphrasing or “humanizing” prose as the default workflow;
- CAPTCHA, login, paywall, DRM, or access-control bypass;
- arbitrary image editing, visual retouching, or document rewriting unrelated to provenance/metadata hygiene;
- source-code refactoring, documentation drift repair, or release verification that merely happens to touch a file containing metadata.

If a request mixes legitimate metadata hygiene with a content rewrite, keep the deterministic hygiene work separate. Hand the rewrite to the appropriate writing or implementation workflow and do not claim that rewriting proves human authorship.

## Required inputs

Resolve before mutation:

- the exact artifact or bounded set of artifacts;
- confirmation that the user owns the content or is authorized to sanitize it when that is not already clear from context;
- whether the user wants inspection only or sanitation;
- the visible-content invariants that must be preserved;
- the allowed metadata scope, such as C2PA only, AI-related metadata only, or all metadata;
- whether in-place replacement is explicitly permitted or a separate cleaned output is required;
- the service base URL if it differs from `WATERMARKS_SERVICE_URL` or the loopback default;
- any server-auth requirement, supplied through environment configuration rather than pasted into reports;
- capability evidence from `/capabilities` for operations that depend on optional tools or backends.

Record unknowns explicitly. Do not infer that metadata is present merely because a file came from an AI tool, and do not infer that a cleaned file is human-authored.

## Safety baseline

Preserve user work and repository state. Do not overwrite uncommitted files, originals, or user-authored artifacts unless the user explicitly requested in-place sanitation and the chosen operation is reversible enough for that scope.

Inspection is read-only. Sanitation requires an explicit user cleaning request or approval of a concrete remediation plan. A direct request such as “remove the metadata from this file” counts as approval for the deterministic metadata scope the user named; it does not approve unrelated rewriting, pixel regeneration, or broad metadata destruction discovered later.

Never:

- expose service API keys, file contents, or sensitive metadata in logs beyond what the user asked to inspect;
- send an artifact to an unapproved remote host when the expected service is loopback/local;
- claim that absence of known metadata proves absence of all provenance mechanisms;
- claim that sanitation proves a work was human-created or changes its true authorship/history;
- start optional pixel-domain removal or model-based rewriting merely because a detector-like signal exists;
- remove accessibility, legal, licensing, or workflow-critical metadata without making that consequence explicit;
- bypass authentication, CAPTCHA, DRM, or another protection to reach content.

Prefer a separate cleaned output when file semantics or container rebuilds could be lossy. Keep the original available until post-clean verification succeeds.

## Workflow

### 1. Freeze the target and intent

Identify the exact input and requested output. Record whether the operation is inspect-only or clean, the ownership/authorization basis, and the preservation invariants.

For repository files, report working-tree state before writing. For standalone artifacts, record file name/type and whether an original copy will remain untouched.

### 2. Resolve the service without installing it silently

Use `WATERMARKS_SERVICE_URL` when set; otherwise the expected default is the loopback service documented in `references/service-protocol.md`.

Check `/health` first. If the service is unreachable, stop with `BLOCKED` and explain how the operator can start or configure the service. Do not download, install, or launch third-party infrastructure unless the user separately asks for that setup.

Query `/capabilities` before recommending an operation that depends on optional tools. Treat capability output as runtime evidence, not as a promise that every artifact can be cleaned losslessly.

### 3. Inspect before cleaning

Send the bounded artifact to `/inspect` using the service contract. Do not mutate the input during this stage.

Summarize findings by class and confidence, for example:

- invisible/control Unicode;
- C2PA/Content Credentials;
- EXIF/XMP or document properties;
- container-specific metadata;
- optional pixel/statistical findings only when a capability explicitly produced them.

Distinguish confirmed findings from probable or informational signals. If the service reports no finding, say “not detected by the available inspection path,” not “no watermark exists.”

### 4. Build the remediation plan

For each confirmed finding, map it to the smallest deterministic sanitation operation that satisfies the request. Preserve visible text, images, document structure, accessibility, and non-target metadata unless the user approved a broader strip.

If the plan would remove all metadata, rebuild a PDF, alter pixels, or rewrite natural-language content, state that consequence separately. Consult `references/remediation-boundaries.md` and stop for approval unless the user's original request already named that exact destructive scope.

State the plan as:

- finding;
- proposed operation;
- expected visible-content impact;
- metadata that may also be lost;
- required optional capability;
- verification method.

Transition to `AWAITING_APPROVAL` when the operation exceeds the already-approved deterministic scope.

### 5. Clean only the approved scope

Call `/clean` with the minimum options needed for the approved remediation. Keep credentials in headers/environment and never write them into generated reports.

Write the returned cleaned artifact to a separate output by default. Only replace the original when the user explicitly requested in-place cleanup and the output has passed basic integrity checks.

Do not route prose through a model-based “humanize” or paraphrase pass as part of normal cleaning. That is outside this skill's default provenance-hygiene contract.

### 6. Re-inspect and compare

Run `/inspect` on the cleaned output. Compare before and after:

- target finding removed or reduced;
- unexpected new findings;
- file type/container still valid;
- visible-content invariants preserved to the extent the available tooling can verify them;
- optional capability warnings or degraded modes.

If the target finding remains, report it honestly and keep the original. Do not stack increasingly destructive operations without renewed approval.

### 7. Report the result

Produce a compact provenance-hygiene record:

- input and output paths or artifact names;
- service/capability evidence used;
- confirmed pre-clean findings;
- approved operations performed;
- post-clean findings;
- visible-content or metadata side effects;
- residual unknowns;
- state: `INSPECTED`, `AWAITING_APPROVAL`, `SANITIZED`, or `BLOCKED`.

Never describe `SANITIZED` as proof of human authorship or provenance authenticity. It means only that the approved sanitation checks passed against the available inspection surface.

## Interaction and handoff boundaries

This skill owns provenance/metadata inspection, deterministic sanitation planning, execution of an approved sanitation request through the optional service, and before/after verification.

Hand off when:

- the user wants substantive prose rewriting: use the relevant writing workflow rather than treating rewriting as metadata cleaning;
- the artifact requires ordinary image editing beyond metadata/pixel-provenance scope: use the image workflow;
- a repository change is needed to add or operate the service: use the builder/evolution workflow appropriate to that repository;
- documentation must be synchronized after a product changes its metadata behavior: use `documentation-synchronizer`;
- the cleaned artifact is part of an integrated software release decision: use `verification-and-release`;
- the service fails unexpectedly and the cause is unknown: use `debugging-investigator` for the service/repository problem rather than guessing.

Do not silently install third-party dependencies, enable heavy backends, or widen from deterministic sanitation into statistical/pixel removal during a handoff.

## Failure handling

If `/health` fails, mark the operation `BLOCKED` and report the resolved service URL without exposing credentials.

If `/capabilities` lacks a required tool, do not simulate success. Explain which requested operation cannot be verified or performed with the current service.

If `/inspect` returns ambiguous evidence, preserve the artifact and report the uncertainty. Do not convert an informational heuristic into a confirmed provenance claim.

If `/clean` fails, returns an invalid artifact, or changes visible content outside the approved invariants, retain the original and mark the sanitation unsuccessful.

If re-inspection still shows the target finding, report residual evidence and stop. A second, more destructive pass requires a new bounded proposal or explicit request.

If ownership/authorization is unclear and the requested operation is specifically intended to conceal provenance or authorship, stop rather than helping misrepresent the artifact.

## Stop conditions

Stop with `INSPECTED` when the user requested analysis only.

Stop with `AWAITING_APPROVAL` before any newly discovered operation that removes broader metadata, rebuilds a container with material side effects, changes pixels, or rewrites content beyond the user's already-approved scope.

Stop with `SANITIZED` only when the approved output exists, basic artifact integrity is intact, and post-clean inspection confirms the target finding is gone or reduced as expected.

Stop with `BLOCKED` when the service is unavailable, the required capability is absent, the artifact is unsupported, the operation would exceed authorization, or verification cannot establish the requested result.
