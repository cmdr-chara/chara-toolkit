# Flutter Offline and Data Design

## Storage classes

| Class | Examples | Requirements |
| --- | --- | --- |
| Ephemeral | image/HTTP cache, computed view | eviction safe; not source of truth |
| Settings | theme, onboarding, non-sensitive preferences | typed defaults, migration, account/global scope |
| Secrets | refresh token, private key reference | platform secure storage, biometric/key invalidation handling, reauth fallback |
| Application data | records needed for offline use | schema migrations, queries/indexes, transaction and account isolation |
| Durable outbox | offline creates/updates/deletes/uploads | stable operation ID, idempotency, ordering/dependency, retry/backoff, conflict/reconciliation |
| Files/media | downloads, captures, attachments | storage quota, integrity, upload state, encryption/backup/deletion |

## Source-of-truth patterns

- **Network authoritative, local cache:** suitable when offline writes are not required; show staleness and failure.
- **Local authoritative view, synchronized backend:** UI observes local data; sync applies remote and queued local operations transactionally.
- **Hybrid per entity:** document which fields/entity classes follow which rule.

## Sync contract

```text
Operation identity:
Local schema/version:
Server version/etag/revision:
Ordering/dependencies:
Retryable and terminal errors:
Conflict detection:
Conflict resolution/product UX:
Reconciliation and audit:
Background/foreground triggers:
Account/logout/deletion:
Metrics and support diagnostics:
```

Avoid last-write-wins unless product semantics and clock/version authority make data loss acceptable.

## Package boundaries

- `shared_preferences`: simple non-sensitive settings, not durable application data or secrets.
- `flutter_secure_storage`: small secrets/credential material; account for platform backup/key/biometric behavior and size limits.
- `sqflite`: direct SQLite control for contained relational needs.
- Drift: typed/reactive relational queries, migrations, and offline complexity that justify code generation/runtime.
- Filesystem: large blobs, with metadata and lifecycle stored separately.

Verify current platform and package constraints with the checklist in `package-selection.md`.
