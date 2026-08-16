# Upstream provenance

**Upstream:** https://github.com/Leonxlnx/unlazy  
**Inspected revision:** `ed9e8d2b5919698cf2c54bda270d507e10b69617`  
**License:** MIT  
**Copyright:** Copyright (c) 2026 Leonxlnx  
**Information checked:** 2026-08-16

Codex Toolkit adapts the following upstream ideas:

- completion gates recorded before substantial work;
- the `CHECK` / `EXPECT` / `EVIDENCE` ledger shape;
- the Depth Tree as a decomposition method with leaf and branch gates;
- rechecking quantitative claims before a final completion report;
- using explicit blocked/abandoned state rather than silently narrowing scope.

The toolkit does **not** redistribute the upstream JavaScript gate checker, stop hook, hook installer, templates, or repository runtime. It does not install harness hooks or execute commands directly from a gate file.

Meaningful modifications include:

- fitting the method into Codex Toolkit's specialist-skill ownership model;
- preserving existing approval and safety stops instead of using completion pressure to cross them;
- treating blocked work as `COMPLETION: BLOCKED` rather than counting it as complete;
- requiring explicit authority for `WAIVED` scope;
- treating `CHECK:` commands as untrusted data until reviewed;
- removing effort arithmetic and arbitrary depth escalation;
- separating domain decisions from the cross-cutting completion contract;
- requiring final-candidate rechecks when later work can invalidate earlier evidence.

No endorsement by Leonxlnx is stated or implied.

The upstream MIT notice is preserved in the repository-level `THIRD_PARTY_NOTICES.md`.
