# Task 1.3 Result

## Status
✅ Task completed successfully

## Changed Files

### Modified files:
- `src/lib/supabase/dal.ts` — Updated all task-related DAL functions to use `creation_period_id`/`active_period_id` instead of `period_id`; added two new functions `transferWipTasks` and `resetActivePeriodForDeletion`

## Summary of Changes

### Updated functions:
- **`createTask`** — Now builds payload with `active_period_id: input.creation_period_id` at insert time
- **`takeIntoWork`** — Added `latestPeriodId: string` parameter; includes `active_period_id: latestPeriodId` in the update payload
- **`completeTask`** — Replaced `period_id: input.period_id` with `active_period_id: input.active_period_id`
- **`returnTaskToQA`** — Two-step approach: fetches `creation_period_id` first, then updates with `active_period_id: existing.creation_period_id`
- **`returnTaskToWork`** — Added `latestPeriodId: string` parameter; includes `active_period_id: latestPeriodId` in the update payload

### New functions:
- **`transferWipTasks(newPeriodId: string): Promise<Task[]>`** — Batch-updates all WIP tasks (`В работе`, `В тесте`, `Блокер`) to set `active_period_id = newPeriodId`
- **`resetActivePeriodForDeletion(periodId: string): Promise<Task[]>`** — Fetches tasks where `active_period_id = periodId AND creation_period_id != periodId`, then resets each task's `active_period_id` to its own `creation_period_id` via parallel updates

## Notes
- No `period_id` references remain in task-related functions; only `PeriodStatistics` functions still use `period_id` which is correct (that table was not changed)
- No new imports were needed
- All linter checks pass
