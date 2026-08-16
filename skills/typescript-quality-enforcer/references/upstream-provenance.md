# Upstream provenance: anti-slop

The bundled Oxlint plugin is based on the MIT-licensed `dmmulroy/anti-slop` project.

- Upstream repository: `https://github.com/dmmulroy/anti-slop`
- Upstream base revision: `446268e5d15baa968eaec669ff65358d36ae6259`
- Revision checked: 2026-08-16
- Upstream copyright: Copyright (c) 2026 Dillon Mulroy
- License: MIT; the required license text is preserved at `assets/anti-slop/LICENSE`.

## Vendored surface

The target skill vendors the installable runtime surface from upstream's
`skills/install-anti-slop/assets/anti-slop/`:

- `index.ts`
- fifteen rule modules under `rules/`
- three helper modules under `shared/`

The toolkit intentionally does not vendor upstream package metadata, tests, lockfiles,
CI, or repository-wide development configuration.

## Local correctness patches

The runtime starts from the pinned upstream base revision and carries three documented
local correctness patches:

- `rules/no-unknown-parameters.ts` detects `unknown` that dominates a union parameter
  annotation instead of accepting syntax such as `unknown | DomainType`.
- `rules/require-safety-comment-for-type-assertion.ts` requires non-whitespace
  justification text after the `SAFETY:` marker.
- `rules/no-unknown-type-aliases.ts` inspects aliases in lexical block and namespace
  scopes rather than only aliases declared directly in `Program.body`.

All other vendored runtime files remain the exact Git blobs from the pinned upstream
base revision. The complete post-patch runtime is integrity-locked by
`references/anti-slop-vendor-manifest.json`. CI runs
`scripts/verify_anti_slop_vendor.py` to compare every vendored file against the
recorded Git blob ID.

The surrounding Codex workflow, staged-adoption guidance, audit helper,
non-overwriting installer behavior, toolkit routing/evaluations, and documentation are
original integration work in `codex-toolkit`.

A future refresh must:

1. compare the currently pinned base revision with the proposed upstream revision;
2. review whether the three local fixes have been incorporated upstream;
3. update or remove local patches intentionally rather than overwriting them;
4. regenerate `anti-slop-vendor-manifest.json` only after reviewing every changed blob;
5. preserve the MIT license and `THIRD_PARTY_NOTICES.md` attribution;
6. rerun structural validation, vendor-integrity verification, TypeScript quality
   regressions, helper smoke tests, and relevant routing/workflow evaluations.
