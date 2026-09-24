---
name: toolchain-preflight
description: Resolve local shell, runtime, package-manager, browser, quoting, or encoding blockers before retrying the real task. Use when the execution path itself is unknown or broken.
---

# Toolchain Preflight

Resolve one supported local execution path, then get out of the way.

## Trigger boundary

Use this skill when required executables or invocation behavior are unknown, or a task is blocked by shell/runtime/package-manager shims, incompatible local runtimes, quoting, browser binaries/capability, or text encoding.

Do not trigger when the repository's documented command already reaches the real task, for application debugging, deliberate dependency/runtime migrations, or final release judgment.

## Required inputs

Resolve repository instructions, working-tree/user state, OS/shell, documented command, required runtime/executable/capability, first exact failure, and any policy constraints on installs/downloads.

## Safety baseline

- Preserve uncommitted user work.
- Prefer existing documented/system/runtime paths before installs or environment mutation.
- Do not repeatedly retry an unchanged failing mechanism.
- Use scratch locations for probes that should not affect the repository.
- Do not bypass execution policy/security controls merely to make a command run.

## Workflow

1. **Establish the documented path.** Read repository instructions and exact command first.
2. **Resolve real executables.** Distinguish shell shims/wrappers from underlying runtimes and package managers.
3. **Classify the failure.** Missing executable, blocked shim, wrong version/architecture, stale virtual environment, quoting, browser capability, encoding, or actual application failure.
4. **Select one safe invocation.** Prefer the least-mutating supported path.
5. **Probe once, then run the real task.** A successful version probe is not enough; confirm the invocation reaches the repository task.
6. **Hand off immediately.** Once the execution path works, application behavior belongs to its specialist.

## Handoffs and interaction boundaries

Application failures go to `debugging-investigator`; planned version transitions to evolution; browser/app implementation to the owning builder; final integrated evidence to `verification-and-release`.

## Failure handling

If every supported invocation requires an unauthorized install or policy change, stop with the exact blocker and the smallest required user action. If the real command runs and then fails inside the application, preflight is complete.

## Stop conditions

Stop as soon as one supported invocation reliably reaches the actual task, or when a concrete environment/policy blocker prevents that without unauthorized changes.
