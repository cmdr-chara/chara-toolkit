# Third-Party Notices

## Leonxlnx/taste-skill

**Upstream:** https://github.com/Leonxlnx/taste-skill  
**License source:** https://github.com/Leonxlnx/taste-skill/blob/main/LICENSE  
**Information checked:** 2026-07-17

Concepts from the following upstream files were selectively adapted through original restructuring and synthesis:

- `skills/taste-skill/SKILL.md`
- `skills/redesign-skill/SKILL.md`
- `skills/image-to-code-skill/SKILL.md`

Adapted files in this pack:

- `skills/product-design-director/SKILL.md`
- `skills/product-design-director/references/direction-calibration.md`
- `skills/product-design-director/references/redesign-audit.md`
- `skills/screenshot-to-interface/SKILL.md`
- `skills/screenshot-to-interface/references/visual-decomposition.md`
- `skills/screenshot-to-interface/references/fidelity-loop.md`

Meaningful modifications include: separating product direction from reconstruction and production implementation; replacing prescriptive style recipes with evidence-based decision axes; adding interaction-state, responsive, accessibility, provenance, asset, component, and verification contracts; adding negative triggers and cross-skill handoffs; and reducing tutorial-style prose to agent-operational instructions.

No endorsement by Leonxlnx is stated or implied. No upstream images, fonts, icons, scripts, or other binary assets are redistributed.

### MIT License

Copyright (c) 2026 Leonxlnx

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## dmmulroy/anti-slop

**Upstream:** https://github.com/dmmulroy/anti-slop  
**Vendored base revision:** `446268e5d15baa968eaec669ff65358d36ae6259`  
**Information checked:** 2026-08-16

The deterministic Oxlint runtime under `skills/typescript-quality-enforcer/assets/anti-slop/`
is based on the upstream `skills/install-anti-slop/assets/anti-slop/` runtime at the
revision above. The vendored surface contains `index.ts`, fifteen rule modules, and
three shared helper modules. Upstream package metadata, tests, lockfiles, CI, and
repository development configuration are not redistributed.

The toolkit carries three local correctness patches on top of that base revision:
`no-unknown-parameters` handles unknown-dominated union inputs,
`require-safety-comment-for-type-assertion` rejects empty `SAFETY:` markers, and
`no-unknown-type-aliases` inspects lexical block/namespace aliases. All other runtime
files retain their upstream Git blobs. The complete post-patch runtime is pinned by
`skills/typescript-quality-enforcer/references/anti-slop-vendor-manifest.json` and
verified in CI by `scripts/verify_anti_slop_vendor.py`.

The surrounding `typescript-quality-enforcer` workflow, staged-adoption guidance,
read-only inventory helper, non-overwriting installer behavior, toolkit
routing/evaluations, and verification policy are integration work authored for this
repository.

No endorsement by Dillon Mulroy is stated or implied.

### MIT License

Copyright (c) 2026 Dillon Mulroy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
