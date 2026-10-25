# Builder Handoff Package

Load when direction is approved and work moves to `production-web-builder`, `flutter-production-builder`, `expo-react-native-builder`, or `screenshot-to-interface`.

A handoff is complete when a builder can implement without inventing product behavior, copy, or visual values, and knows exactly which decisions are theirs.

## Contents

1. **Direction brief** (one page): problem statement, selected direction thesis, principles, and links to decision records.
2. **Decision records** affecting implementation, with status and any approval.
3. **Screen and flow specs** for each primary job at each defined breakpoint: layout regions, hierarchy ranking, component choices, and annotated behavior (what happens on each action, including failure).
4. **State coverage matrix** with copy for every non-happy state.
5. **Content sheet:** all user-facing strings with keys if the repository uses them, glossary terms, truncation rules, and pluralization/localization notes.
6. **Tokens:** new, changed, and deprecated tokens per `visual-system-and-tokens.md`, in the repository's format.
7. **Component behavior specs** for new or changed components: anatomy, variants, states (default, hover, focus-visible, active, disabled, loading, selected, invalid), keyboard model, accessible name source, and responsive behavior.
8. **Responsive contract** and **accessibility acceptance** per `accessibility-and-responsive-review.md`.
9. **Validated behavior register** entries that implementation must preserve.
10. **Assumptions and open questions** with owners and the date a decision is needed.

## Acceptance criteria

Write criteria a builder or reviewer can verify without asking the designer:

```text
Given a dispatcher with 200 queued orders at 1366x768
When the queue loads
Then at least 13 rows are visible without scrolling,
 and status reads as icon plus text,
 and keyboard focus starts on the first row with a visible 2px focus ring meeting 3:1 contrast.
```

Cover at least one criterion per primary job, per non-happy state category, and per breakpoint transition.

## Decision ownership

| Design decides | Builder decides | Decide together |
| --- | --- | --- |
| Hierarchy, layout intent, copy, tokens, state behavior, motion intent, accessibility outcomes | Framework, state management, data fetching, caching, component internals, build pipeline for tokens, test strategy | Performance trade-offs that alter visuals, feasibility of motion, phased rollout order, analytics events |

If a builder must deviate (technical constraint, performance), the deviation is recorded against the relevant decision record rather than silently resolved in code.
