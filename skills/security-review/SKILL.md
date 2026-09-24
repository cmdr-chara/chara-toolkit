---
name: security-review
description: Review code for exploitable security flaws at trust boundaries. Use when assessing authentication, authorization, untrusted input, secrets, file/network handling, or security-sensitive diffs.
---

# Security Review

Find realistic exploit paths and security regressions without burying the user in generic checklist noise.

This skill is an original Codex Toolkit synthesis informed by MIT-licensed SkillMedev security-review material. See `references/provenance.md`.

## Trigger boundary

Use this skill for:
- security-focused review of a diff, endpoint, service, auth flow, parser, upload path, webhook, or other trust boundary;
- requests to assess exploitable authorization, injection, SSRF, deserialization, secret exposure, path/file handling, or business-logic abuse;
- security-sensitive changes where the user wants a focused findings list.

Do not trigger for:
- general maintainability review with security only incidental;
- broad unknown-bug hunting;
- dependency/version migration as the primary task;
- final release approval.

## Required inputs

Resolve the review scope, candidate/diff identity, entry points that accept untrusted input, authentication/authorization model, deployment/trust context, relevant data boundaries, and protected user work. Label inferred entry points or threat assumptions explicitly.

## Safety baseline

- Preserve the working tree and uncommitted user work.
- Start read-only unless the user already authorized fixes.
- Do not execute exploit payloads against production or third-party systems.
- Do not expose secrets, credentials, private data, or sensitive exploit details beyond what is necessary to explain the finding.
- A scanner warning is evidence to investigate, not proof of exploitability.

## Workflow

1. **Map trust boundaries.** Identify untrusted inputs, privileged actions, tenant/resource ownership, outbound requests, file paths, deserialization, secrets, and external integrations.
2. **Trace authorization first.** For each protected resource/action, verify permission on the specific object/tenant and execution path, not merely authentication.
3. **Trace untrusted data to dangerous sinks.** Follow query construction, commands, templates/HTML, redirects/URLs, filesystem paths, parsers, and object binding.
4. **Check network and serialization boundaries.** Review SSRF controls, redirect behavior, unsafe native deserialization, webhook verification, and mass assignment.
5. **Check secrets and sensitive output.** Inspect client bundles, logs, error messages, fixtures, source maps, configuration, and credential handling when in scope.
6. **Challenge business invariants.** Look for replay, duplicate effects, privilege transitions, state-machine bypass, quota/payment/ownership mistakes, and authorization gaps not caught by syntactic scanners.
7. **Filter findings.** Read `references/review-playbook.md`. Raise only findings with a plausible attack path or concrete security control failure; keep uncertain items explicitly labeled.
8. **Propose the smallest fix.** Preserve behavior outside the violated security contract and define focused regression evidence.

## Handoffs and interaction boundaries

Use `dependency-risk` guidance through `codebase-evolution-controller` when the primary problem is third-party supply-chain or version migration. Use `debugging-investigator` for a concrete security-related runtime failure whose cause is unknown. Use platform builders for implementation and `verification-and-release` for final ship judgment.

## Failure handling

If deployment assumptions or entry points are unclear, narrow the finding or gather the missing evidence. If exploitability cannot be established safely, report the condition and confidence instead of upgrading severity by intuition.

## Stop conditions

Stop when each reported finding has a concrete affected boundary, attack/failure scenario, evidence, severity rationale, smallest fix direction, and regression-verification plan; or when missing evidence prevents a defensible security conclusion.
