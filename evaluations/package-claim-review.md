# Time-Sensitive Package and Platform Claim Review

Use this protocol when a package, framework, service, store rule, or target SDK decision is made from the toolkit's selection guides. The guides deliberately contain no versions or dates; the claims below are gathered at decision time and recorded with the decision.

## Scope

The selection guides are:

- `skills/production-web-builder/references/package-selection.md`
- `skills/flutter-production-builder/references/package-selection.md`
- `skills/expo-react-native-builder/references/package-selection.md`
- `skills/mobile-architecture-director/references/platform-decision-matrix.md`

## Per-row review

Record:

```text
Item:
Target repository resolved version/range:
Framework/runtime peer compatibility:
Latest stable and release date:
Maintenance/release activity:
Advisories and fixed versions:
Deprecation/ownership status:
License and source:
Runtime/bundle/native/build/CI/service cost:
Built-in or existing-repository alternative:
Choose conditions:
Avoid conditions:
Primary source URLs:
Checked date:
Reviewer:
Decision and confidence:
```

## Failure conditions

Reject or mark unknown when:

- only a blog/listicle/popularity metric supports the choice;
- the target lockfile or peer graph contradicts the reference;
- the license is missing or incompatible with the project;
- a known advisory lacks a fixed/mitigated path;
- a package is deprecated, archived, unmaintained, or has unclear ownership and no explicit risk acceptance;
- runtime/binary/bundle/build/service cost was ignored;
- a built-in capability is sufficient and the added dependency has no concrete benefit;
- the reference's review date or scheduled security follow-up has passed.

## Platform decision check

A Flutter/Expo/native/other recommendation passes only when must-have constraints, disqualifiers, weighted evidence, prototypes for uncertain native/performance/offline/security claims, delivery ownership, and reconsideration triggers are recorded. Framework familiarity or popularity alone fails.
