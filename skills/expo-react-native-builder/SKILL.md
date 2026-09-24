---
name: expo-react-native-builder
description: Build or audit production Expo/React Native applications. Use when Expo/React Native is already selected and implementation, native integration, updates, or release behavior is in scope.
---

# Expo React Native Builder

Build production Expo/React Native behavior from repository constraints rather than from a default package list.

## Trigger boundary

Use this skill for:
- implementing or auditing an existing Expo/React Native app;
- Expo Router, development builds, native modules, offline/data behavior, EAS Build/Update, device integration, or store delivery.

Do not trigger when the mobile platform is unresolved; use `mobile-architecture-director`. A version/SDK migration whose central problem is compatibility belongs to `codebase-evolution-controller`.

## Required inputs

Resolve repository state, Expo/RN/React/Node/package-manager constraints, app config and native/prebuild ownership, product flows, backend/device contracts, offline requirements, accessibility/localization, EAS profiles, release targets, and protected user work.

For a quick read-only inventory, run:

```sh
python skills/expo-react-native-builder/scripts/expo_project_inventory.py . --format markdown
```

Treat its output as signals to verify, not semantic truth.

## Safety baseline

- Preserve uncommitted work and repository conventions.
- Prefer built-in Expo/RN capabilities or an existing repository package when sufficient.
- Do not silently add dependencies, regenerate native projects, change signing, publish updates, or submit stores.
- Keep secrets out of client bundles and logs.
- Expo Go is not production release evidence when custom native behavior or production configuration matters.

## Workflow

1. **Establish ownership.** Map routing, app lifecycle, native directories/prebuild policy, development builds, backend/data boundaries, and release/update configuration.
2. **Model behavior.** Define loading, empty, error, retry, offline/stale, auth, permission, background, interruption, and process-restart states before choosing libraries.
3. **Choose dependencies conditionally.** Do not start with a package list. Check existing/built-in capability first; for new packages verify compatibility, maintenance, license, security/deprecation, runtime/build cost, and removal path. Use `references/expo-react-native-ecosystem-2026-07-17.md` when package selection matters.
4. **Implement boundaries.** Keep navigation, server state, durable local state, forms, device APIs, and native modules owned by the layer that can enforce their lifecycle and trust requirements.
5. **Handle offline/update risk.** Read `references/offline-updates-and-security.md` for durable queues, conflict/idempotency, storage, update compatibility, and sensitive data.
6. **Verify the feature.** Use focused unit/integration tests plus representative device/emulator checks for native, permission, background, deep-link, accessibility, and performance behavior that cannot be proven in JS alone.
7. **Prepare release.** Read `references/release-checklist.md` only for build/update/store work. Native dependency, config, permission, or entitlement changes require a compatible binary rather than a JS-only update.

## Handoffs and interaction boundaries

Use product/screenshot skills for unresolved design intent. Use `security-review` when security is the primary decision. Hand migrations to evolution, causal failures to debugging, documentation drift to documentation synchronization, and final ship judgment to `verification-and-release`.

## Failure handling

If package or platform evidence is stale, verify current primary sources before deciding. If a native capability cannot be reproduced in the available environment, report the exact gap instead of treating a JS test as equivalent evidence.

## Stop conditions

Stop when the requested Expo/RN behavior is integrated, focused checks and applicable device/build evidence are recorded, and remaining release or platform gaps have an explicit owner.
