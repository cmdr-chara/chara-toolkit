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

## Leonxlnx/unlazy

**Upstream:** https://github.com/Leonxlnx/unlazy  
**Inspected revision:** `ed9e8d2b5919698cf2c54bda270d507e10b69617`  
**License source:** https://github.com/Leonxlnx/unlazy/blob/main/LICENSE  
**Information checked:** 2026-08-16

Codex Toolkit adapts the upstream completion-gate and Depth Tree method into:

- `skills/unlazy/SKILL.md`
- `skills/unlazy/references/completion-gates.md`
- `skills/unlazy/references/upstream-provenance.md`
- the corresponding routing, overlap, workflow, responsibility, and live-smoke cases.

The adaptation preserves the `CHECK` / `EXPECT` / `EVIDENCE` gate idea, natural-joint decomposition, branch integration gates, and final quantitative-claim audit. It materially changes the safety model: blocked work is not counted as success; scope waivers require explicit authority; specialist approval gates remain authoritative; commands embedded in a ledger are treated as untrusted data until reviewed; and arbitrary effort-depth arithmetic is not used.

The upstream JavaScript gate checker, stop hook, hook installer, templates, and other runtime files are not redistributed.

No endorsement by Leonxlnx is stated or implied. The Leonxlnx MIT license reproduced above applies to the adapted material from both listed Leonxlnx repositories.

## guillaumemeyer/watermarks-remover

**Upstream:** https://github.com/guillaumemeyer/watermarks-remover  
**Inspected revision:** `fcebf533583d7a313b348dbe421f3b4b17163b66`  
**License source:** https://github.com/guillaumemeyer/watermarks-remover/blob/main/LICENSE  
**Information checked:** 2026-08-16

`content-provenance-hygiene` was designed after inspecting the upstream service contract and skill. Codex Toolkit does not redistribute the upstream sanitation service, scripts, containers, model backends, or file-cleaning implementation. The toolkit records the inspected HTTP protocol and capability model as an optional integration reference and requires runtime capability checks before relying on it.

Meaningful toolkit changes include an inspect-first approval boundary, preservation of the original artifact by default, explicit separation from detector evasion and authorship claims, and before/after integrity verification.

No endorsement by Guillaume Meyer or the watermarks-remover contributors is stated or implied.

### MIT License

Copyright (c) 2026 watermarks-remover contributors

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
