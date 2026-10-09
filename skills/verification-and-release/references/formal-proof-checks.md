# Conditional formal-proof evidence

Use when a project intentionally includes formal proof obligations, or when the user requests formally verified invariants. Proof tooling is not a default prerequisite for normal development.

## Bend 2

For an actual Bend 2 project with LAWS.bend and PROOF.bend, inspect the project's README/guide and the human-approved law definitions first. Preserve LAWS.bend unless a human explicitly authorizes a changed contract. Editing proofs or implementation to satisfy *different* laws is not proof of the original requirements.

When the installed Bend 2 CLI supports it, run from the appropriate project directory:

    bend PROOF.bend --verdict

The accepted result must be current, tied to the candidate, exit successfully, and report ALL PROOFS CHECK. If the independent kernel is unavailable, record a gap rather than substituting a plain typecheck as an equivalent guarantee. Review any unsafe/foreign functionality and assumptions: external effects, performance, requirements omitted from the laws, and runtime deployment are outside the proof unless explicitly modeled.

Bend 2 currently has early ecosystem/compiler/tooling limitations, especially around Windows native execution; WSL may be an option when authorized. Do not install Bend or run remote installers unprompted. Avoid applying Bend-specific commands to TypeScript, Rust, Go, or other languages: their contracts can be enforced using suitable language-native types, tests, static checks, or mature formal tools where justified.

## Proof evidence contract

Record law and proof file identities, verifier and kernel version, command, exit status, exact candidate revision, relevant unsafe dependencies, and the properties still not covered. A valid mathematical proof establishes only the modeled properties under stated assumptions—not overall production readiness.

Primary source: https://github.com/bendlang/bend/blob/main/guide/GUIDE.md
