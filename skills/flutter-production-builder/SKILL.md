---
name: flutter-production-builder
description: Build or audit production Flutter applications. Use when Flutter is already selected and implementation, integration, performance, accessibility, or release behavior is in scope.
---

# Flutter Production Builder

Build production Flutter behavior from repository and platform constraints, not from a default package stack.

## Trigger boundary

Use this skill for implementation or audit of an existing Flutter app across state, routing, data, persistence, offline behavior, platform integration, accessibility, performance, build, or release.

Do not trigger when platform choice is unresolved; use `mobile-architecture-director`. Version/SDK transitions whose central issue is compatibility belong to evolution.

## Required inputs

Resolve repository/working-tree state, Flutter/Dart/package-manager constraints, target platforms, product flows, backend/device contracts, offline/data requirements, accessibility/localization, build/signing/release targets, and protected user work.

For read-only inventory:

```sh
python skills/flutter-production-builder/scripts/flutter_project_inventory.py . --format markdown
```

Verify scanner signals manually.

## Safety baseline

- Preserve uncommitted work.
- Prefer built-in Flutter/Dart capabilities or an existing repository convention when sufficient.
- Do not silently add packages, regenerate platform projects, change signing, or publish releases.
- Keep secrets out of client bundles/logs and keep authorization at trusted server boundaries.

## Workflow

1. **Map architecture/lifecycle.** Identify feature boundaries, routing, state/data ownership, persistence, platform channels/plugins, background work, and release configuration.
2. **Model states.** Define loading, empty, error, retry, offline/stale, auth, permission, interruption, process death/restoration, and recovery.
3. **Choose packages conditionally.** Use the dated ecosystem reference only when a dependency decision is material; verify compatibility, maintenance, license, security/deprecation, runtime/build cost, and built-in/existing alternatives.
4. **Implement clear ownership.** Keep local UI state, server data, durable state, navigation, and native/platform behavior in the layer that owns their lifecycle.
5. **Handle offline/data deliberately.** Read `references/offline-and-data.md` for persistence, sync, conflict, migration, encryption, and idempotency concerns.
6. **Verify feature behavior.** Use focused tests plus representative device/platform checks for plugins, deep links, permissions, background, accessibility, performance, and platform conventions.
7. **Prepare release when requested.** Read `references/release-checklist.md` only for signing/build/store work.

## Handoffs and interaction boundaries

Use design/reconstruction skills for unresolved UI intent, `security-review` for security-focused review, evolution for migrations, debugging for concrete unexplained failures, documentation synchronization for drift, and `verification-and-release` for final ship judgment.

## Failure handling

If package/platform claims are stale, verify current primary sources. If native/device evidence is unavailable, state the gap rather than treating Dart-only tests as equivalent proof.

## Stop conditions

Stop when the requested Flutter behavior is integrated, focused checks and applicable platform/build evidence are recorded, and remaining release gaps have a clear owner.
