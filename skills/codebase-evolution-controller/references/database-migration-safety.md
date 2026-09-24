# Database migration safety

Adapted concepts from SkillMedev/skills under MIT; see `THIRD_PARTY_NOTICES.md`.

Use this reference for production schema changes on live data.

## Principles

- Identify the actual lock and transaction behavior of each DDL statement for the target database/version.
- Bound lock acquisition so a migration does not wait indefinitely while new traffic queues behind it.
- Prefer expand/contract for renames, incompatible type changes, and rolling-deploy contracts.
- Add new fields permissively, backfill in bounded batches, migrate reads/writes, then tighten constraints.
- Build indexes and validate constraints using the database's online/concurrent mechanisms when supported.
- Separate backfills from schema locks and make progress resumable.
- Every stage needs rollback or explicit forward-recovery.

For PostgreSQL specifically, verify when `CREATE INDEX CONCURRENTLY`, `NOT VALID`/validation, and lock timeouts apply to the repository's exact version and migration framework. Do not cargo-cult these techniques to another database.

Test representative lock behavior on staging or a production-like clone when consequence is high.
