# Task 1.1: DB Migration + Types + Constants

## Related Use Cases
- UC-1: QA tab shows all tasks (status becomes nullable, 'Бэклог' is migrated)
- UC-2: New task created with `status = null`
- UC-3: `takeIntoWork` sets `priority = 'Нормальный'` if null
- UC-4: `returnToQA` resets specific fields
- UC-5: Tab filters work with new status values
- UC-6: `period_statistics` table created
- UC-7: `period_statistics` supports editing

## Task Goal

Create the DB migration file and update all TypeScript types/constants to reflect the new data model: removal of legacy `'Бэклог'` status, introduction of the `period_statistics` table, and removal of deprecated `metrics_snapshot`/`metrics_locked_at` columns from `periods`.

## Description of Changes

### New Files

- `supabase/migrations/003_period_statistics.sql` — migration creating the `period_statistics` table, dropping deprecated `periods` columns, and migrating legacy `'Бэклог'` statuses to `null`

### Changes to Existing Files

#### File: `src/types/constants.ts`

- Remove `'Бэклог'` from `TASK_STATUSES` array. The new array is: `['В работе', 'В тесте', 'Завершена', 'Блокер']`
- Remove the `'Бэклог'` entry from `STATUS_COLORS` record
- The `TaskStatus` type is derived from `TASK_STATUSES`, so it updates automatically

#### File: `src/types/index.ts`

- **Remove** the `MetricsSnapshot` type entirely
- **Update `Period` type**: remove fields `metrics_snapshot: MetricsSnapshot | null` and `metrics_locked_at: string | null`
- **Add `PeriodStatistics` type**:
  ```
  id: string
  period_id: string
  added_to_backlog: number
  added_critical: number
  resolved_total: number
  resolved_critical: number
  in_progress: number
  in_testing: number
  locked_at: string
  created_at: string
  ```
- **Update `TakeIntoWorkInput` type**: remove all optional fields (`assignee`, `priority`, `status`) — this type is no longer needed as input and can be **deleted** entirely (the action now takes only a task `id`)
- Export `PeriodStatistics` type from `src/types/index.ts`

### Migration File Content

`supabase/migrations/003_period_statistics.sql`:

```sql
-- 1. New period_statistics table
CREATE TABLE period_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL UNIQUE REFERENCES periods(id) ON DELETE CASCADE,
  added_to_backlog INTEGER NOT NULL,
  added_critical INTEGER NOT NULL,
  resolved_total INTEGER NOT NULL,
  resolved_critical INTEGER NOT NULL,
  in_progress INTEGER NOT NULL,
  in_testing INTEGER NOT NULL,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Remove deprecated columns from periods
ALTER TABLE periods DROP COLUMN IF EXISTS metrics_snapshot;
ALTER TABLE periods DROP COLUMN IF EXISTS metrics_locked_at;

-- 3. Migrate legacy status value
UPDATE tasks SET status = null WHERE status = 'Бэклог';
```

## Acceptance Criteria
- [ ] `003_period_statistics.sql` exists in `supabase/migrations/`
- [ ] `TASK_STATUSES` no longer contains `'Бэклог'`
- [ ] `STATUS_COLORS` no longer has `'Бэклог'` entry
- [ ] `Period` type has no `metrics_snapshot` or `metrics_locked_at` fields
- [ ] `MetricsSnapshot` type is deleted
- [ ] `TakeIntoWorkInput` type is deleted (or replaced — verify no other usages before deleting)
- [ ] `PeriodStatistics` type is defined and exported
- [ ] TypeScript compilation passes with no errors

## Notes

- Before deleting `TakeIntoWorkInput`, verify it's only imported in `tasksAtom.ts` (confirmed from codebase inspection). Task 2.1 removes that import from the atom.
- The migration supersedes migration `002_fix_task_status_nullable.sql`; migration 003 must be applied after 002.
- After applying the migration, existing tasks with `status = 'Бэклог'` will have `status = null` and will appear in the QA tab.
