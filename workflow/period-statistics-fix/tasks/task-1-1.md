# Task 1.1: Update Database Migration Schema

## Related Use Cases
- Foundation for UC-01 through UC-13 (all use cases depend on the schema)

## Task Goal
Replace the single `period_id` column in the `tasks` table with two columns: `creation_period_id` (immutable FK with CASCADE) and `active_period_id` (no FK constraint). Update the indexes accordingly.

## Description of Changes

### Changed Files

#### File: `supabase/migrations/001_create_tables.sql`

This is a **complete schema replacement** (not incremental). The user manually drops all tables before running.

**In the `tasks` table definition:**

Remove:
```sql
period_id UUID NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
```

Add in its place (same position, after `title`):
```sql
creation_period_id UUID NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
active_period_id UUID NOT NULL,
```

`creation_period_id` keeps the same `ON DELETE CASCADE` semantics as the old `period_id` — deleting a period cascade-deletes all tasks that were originally created in it.

`active_period_id` has **no foreign key constraint** by design (application-level enforcement only, per TS §3.2 and D1).

**In the indexes section:**

Remove:
```sql
CREATE INDEX idx_tasks_period_id ON tasks(period_id);
```

Add:
```sql
CREATE INDEX idx_tasks_creation_period_id ON tasks(creation_period_id);
CREATE INDEX idx_tasks_active_period_id ON tasks(active_period_id);
```

All other tables (`periods`, `period_statistics`) and their indexes remain unchanged.

## Acceptance Criteria
- [ ] `tasks` table has `creation_period_id` with FK → `periods.id ON DELETE CASCADE`
- [ ] `tasks` table has `active_period_id` with no FK constraint
- [ ] `period_id` column is removed from `tasks`
- [ ] Indexes exist on both new columns
- [ ] `idx_tasks_period_id` index is removed
- [ ] All other tables and indexes are unchanged
- [ ] The file is a complete standalone schema (not incremental migration)

## Notes
The user manually deletes all Supabase tables before running this migration. No backwards compatibility with the old `period_id` column is required.
