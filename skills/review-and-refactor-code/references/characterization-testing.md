# Characterization testing

Adapted concepts from SkillMedev/skills under MIT; see `THIRD_PARTY_NOTICES.md`.

Use characterization tests when legacy behavior must be preserved but existing tests do not describe it.

## Method

1. Identify only the behavior in the refactor blast radius.
2. Introduce the smallest mechanical seam needed to invoke it; do not improve logic yet.
3. Capture actual observed outputs from real executions rather than writing what the code "should" do.
4. Pin suspect behavior too, but label known-bug cases so they are not mistaken for desired semantics.
5. Control nondeterminism such as time, randomness, network, filesystem, and shared database state.
6. Cover the branches the refactor will touch, not the entire repository.
7. Name tests for the behavior they pin and keep assertions narrow enough to explain regressions.

The purpose is a temporary safety net for behavior-preserving change. Intentional bug fixes should be separate, reviewable behavior changes after parity is established.
