# Upstream provenance: anti-slop

The bundled Oxlint plugin is vendored from the MIT-licensed `dmmulroy/anti-slop` project.

- Upstream repository: `https://github.com/dmmulroy/anti-slop`
- Upstream revision: `446268e5d15baa968eaec669ff65358d36ae6259`
- Revision checked: 2026-08-16
- Upstream copyright: Copyright (c) 2026 Dillon Mulroy
- License: MIT; the required license text is preserved at `assets/anti-slop/LICENSE`.

## Vendored surface

The target skill vendors the installable runtime surface from upstream's `skills/install-anti-slop/assets/anti-slop/`:

- `index.ts`
- fifteen rule modules under `rules/`
- three helper modules under `shared/`

The toolkit intentionally does not vendor upstream package metadata, tests, lockfiles, CI, or repository-wide development configuration.

## Local modifications

The vendored TypeScript runtime is kept source-equivalent to the pinned upstream asset at the revision above. The surrounding Codex workflow, staged-adoption guidance, audit helper, safer non-overwriting installer behavior, toolkit routing/evaluations, and documentation are original integration work in `codex-toolkit`.

A future refresh must:

1. compare the currently pinned revision with the proposed upstream revision;
2. review rule semantics and new dependencies rather than copying blindly;
3. update the vendored runtime and this revision together;
4. preserve the MIT license and `THIRD_PARTY_NOTICES.md` attribution;
5. rerun structural validation, helper smoke tests, and relevant routing/workflow evaluations.
