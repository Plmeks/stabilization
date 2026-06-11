# Task 1.1 Result

## Status
SPEC_ISSUE: ✅ Task completed successfully, but the task description contained an incorrect codebase assumption — see Notes below.

## Changed Files

### New files:
- `supabase/migrations/003_period_statistics.sql` — creates `period_statistics` table, drops deprecated `periods` columns, migrates legacy `'Бэклог'` statuses to `null`

### Modified files (task-specified):
- `src/types/constants.ts` — removed `'Бэклог'` from `TASK_STATUSES` array and `STATUS_COLORS` record
- `src/types/index.ts` — removed `MetricsSnapshot` type, removed `TakeIntoWorkInput` type, removed `metrics_snapshot`/`metrics_locked_at` from `Period` type, added `PeriodStatistics` type with full export

### Modified files (required for TypeScript compilation):
- `src/lib/supabase/dal.ts` — removed `TakeIntoWorkInput` and `MetricsSnapshot` imports; changed `takeIntoWork` signature to use `UpdateTaskInput`; removed `lockMetrics` function (wrote to deprecated columns)
- `src/atoms/tasksAtom.ts` — removed `TakeIntoWorkInput`, `MetricsSnapshot` imports and `lockMetrics` dal import; changed `takeIntoWorkAtom` parameter type to `UpdateTaskInput`; replaced `lockMetricsAtom` with a no-op stub (will be reimplemented in task 2.x)
- `src/atoms/periodsAtom.ts` — removed `metrics_snapshot: null` and `metrics_locked_at: null` from optimistic `Period` object construction
- `src/components/stats/StatsPeriodCard.tsx` — removed all `period.metrics_snapshot` and `period.metrics_locked_at` references; removed `dayjs`/`Lock` imports; LockMetricsButton is always shown (locked state is pending task 2.x implementation)
- `src/lib/supabase/client.ts` — updated `Database` type: removed deprecated `periods` columns, added `period_statistics` table
- `src/components/modals/EditTaskModal.tsx` — changed `task.status ?? 'Бэклог'` fallback to `task.status ?? 'В работе'`
- `src/components/modals/TakeIntoWorkModal.tsx` — changed initial status state from `'Бэклог'` to `'В работе'`

## Notes

### SPEC_ISSUE: Incorrect codebase assumption in task description

The task description stated:
> "Before deleting `TakeIntoWorkInput`, verify it's only imported in `tasksAtom.ts` (confirmed from codebase inspection)."

**This was incorrect.** `TakeIntoWorkInput` was also imported and used in `src/lib/supabase/dal.ts` (function signature for `takeIntoWork`). Similarly, `MetricsSnapshot` was used in both `tasksAtom.ts` and `dal.ts`, and the deprecated `Period` fields were referenced in `periodsAtom.ts`, `StatsPeriodCard.tsx`, `EditTaskModal.tsx`, `TakeIntoWorkModal.tsx`, and `client.ts`.

To satisfy the acceptance criterion "TypeScript compilation passes with no errors" alongside the type deletions, it was necessary to also update 6 additional files beyond the 3 listed in the task scope.

### lockMetrics stub
`lockMetricsAtom` is kept as a no-op stub since `LockMetricsButton` imports it. The full implementation using the new `period_statistics` table should be done in task 2.x.

## Acceptance Criteria Verification
- ✅ `003_period_statistics.sql` exists in `supabase/migrations/`
- ✅ `TASK_STATUSES` no longer contains `'Бэклог'`
- ✅ `STATUS_COLORS` no longer has `'Бэклог'` entry
- ✅ `Period` type has no `metrics_snapshot` or `metrics_locked_at` fields
- ✅ `MetricsSnapshot` type is deleted
- ✅ `TakeIntoWorkInput` type is deleted
- ✅ `PeriodStatistics` type is defined and exported
- ✅ TypeScript compilation passes with no errors
