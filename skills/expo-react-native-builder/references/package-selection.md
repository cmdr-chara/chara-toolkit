# Expo/React Native Package Selection

Start from what the Expo SDK and the repository already provide. Add a package only when it owns a problem nothing installed solves, and record why. Versions, peer ranges, and support status change with every SDK release, so verify them when you decide (see the last section).

## Options by concern

| Concern | Default first | Common options when needed | Choose a package when | Avoid when |
| --- | --- | --- | --- | --- |
| Navigation | Expo Router (Expo's file-based router) | React Navigation for apps that already use it or need its manual configuration | the app's routing model is already set by one of them | mixing two navigation systems without a migration boundary |
| Server data | `fetch` plus a small hook | TanStack Query, RTK Query | caching, background refresh, retries, optimistic updates, or offline coordination are real requirements | a handful of static requests |
| Client state | component state, context, URL params | Zustand, Redux Toolkit | independent cross-screen state with its own lifecycle or persistence exists | storing server data or every value globally |
| Key-value storage | Expo SDK storage modules | AsyncStorage | non-sensitive preferences | secrets (use Expo's secure storage module) or relational data (use a SQLite-based store) |
| Animation and gestures | the versions bundled with the Expo SDK (Reanimated, Gesture Handler) | — | always take the SDK-bundled version | installing a different major version than the SDK expects |
| Unit and component tests | `jest-expo` preset | React Native Testing Library | testing behavior through the rendered UI | testing implementation details |
| End-to-end tests | — | Maestro (documented with EAS Workflows), Detox | device-level flows such as permissions, deep links, and background states matter | replacing unit tests with slow device tests |
| Auth, crash reporting, telemetry | backend and platform capabilities | vendor SDKs | evaluated with the same rubric: native support, privacy, symbol upload, offline buffering, binary and startup cost, terms | adding a vendor SDK before checking what the backend already provides |

## Rules that do not change between releases

- Build with development builds when custom native code or production configuration matters; Expo Go is not release evidence.
- Native dependency, permission, config-plugin, or entitlement changes need a new binary, not an over-the-air update.
- In a monorepo, duplicate copies of React, React Native, or Expo modules cause runtime and build errors. Inspect the resolved dependency graph.
- Store submission tooling needs signed artifacts and does not replace store metadata, policy, or account preparation.

## Verify current state before deciding

1. `npx expo install --check` and `npx expo-doctor` in the project: SDK-compatible versions and known configuration problems.
2. The Expo SDK changelog for the project's SDK: bundled library versions, breaking changes, and known regressions.
3. React Native Directory for each candidate: maintenance, platform support, and compatibility with the current React Native architecture.
4. `npm view <package> version peerDependencies deprecated` and the repository's security advisories.
5. Record the package, the problem it owns, the alternative you rejected, the license, and the date you checked in the decision record.
