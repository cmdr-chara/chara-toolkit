# Database migration safety

Read this before production DDL, data backfills, or expand/contract work. The question is not just "does the migration run?" It is "what does it lock, for how long, and what happens to running code while it does?"

## Plan in phases

Use expand/contract so that every deployed version of the code works with every schema state it can meet:

1. **Expand:** add new columns, tables, or indexes in a backward-compatible way (nullable, or with safe defaults).
2. **Migrate code:** write to both shapes or read the new one with a fallback. Deploy.
3. **Backfill:** move existing data in batches (see below).
4. **Switch:** read only the new shape. Deploy.
5. **Contract:** drop the old columns or constraints in a later release, once no running code references them.

Never rename or drop something that the currently deployed code still reads.

## Lock behavior to check (verify against your engine version)

**PostgreSQL**

- Most `ALTER TABLE` forms take an `ACCESS EXCLUSIVE` lock. While waiting for it, they also block every later query on the table. Set `lock_timeout` (for example a few seconds) and retry, rather than queueing behind a long transaction.
- `ADD COLUMN` with a constant default is metadata-only in modern versions. A volatile default, and most `ALTER COLUMN ... TYPE` changes, rewrite the table.
- Build indexes with `CREATE INDEX CONCURRENTLY`. It cannot run inside a transaction block, and a failed run leaves an `INVALID` index that must be dropped and rebuilt.
- Add foreign keys and check constraints as `NOT VALID`, then run `VALIDATE CONSTRAINT` separately, which takes a weaker lock. For `NOT NULL` on a large table, validate a `CHECK (col IS NOT NULL)` constraint first, then set `NOT NULL`.

**MySQL / InnoDB**

- Request `ALGORITHM=INSTANT` or `ALGORITHM=INPLACE, LOCK=NONE` explicitly, so an operation that would copy the table fails instead of silently blocking writes.
- Metadata-lock waits behind long transactions stall the whole table. Check for open transactions first.
- For very large tables, use an online schema-change tool (such as gh-ost or pt-online-schema-change) as the project's runbook allows.

Techniques don't transfer between engines or migration frameworks. Check how the repository's framework wraps statements in transactions (which breaks `CONCURRENTLY`) before you apply any of the above.

## Backfills

- Use batches keyed on an indexed, monotonic column. Commit per batch and throttle against replication lag and load.
- Make them idempotent and resumable (re-running a batch is safe), and record progress.
- Keep them separate from DDL transactions. Never hold a schema lock while touching millions of rows.
- Verify with counts and checksums, comparing the old and new shapes.

## Rollback and approval

- For each step, state whether it is reversible. A drop, a destructive type change, or a data rewrite is not reversible without a backup.
- Before any irreversible step, require a verified backup or snapshot and its restore procedure, plus explicit approval.
- Prefer forward fixes for expand steps. Never run a down-migration that drops data that new code has already written.

## Evidence

Record the engine and version, table sizes, the measured or estimated lock duration for each statement (from a production-sized copy where possible), the timeout settings used, the backfill rate, and the verification results.
