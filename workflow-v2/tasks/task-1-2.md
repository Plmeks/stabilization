# Task 1.2: DAL Refactor

## Related Use Cases
- UC-3: `takeIntoWork` — new direct logic (no modal input)
- UC-4: `returnTaskToQA` — fix priority not being reset
- UC-6: `createPeriodStatistics` — lock metrics into DB
- UC-7: `updatePeriodStatistics` — edit locked metrics

## Task Goal

Rewrite `takeIntoWork` and `returnTaskToQA` functions to implement the correct field logic per the TS, remove the obsolete `lockMetrics` function, and add three new functions for `period_statistics` CRUD.

## Description of Changes

### Changes to Existing Files

#### File: `src/lib/supabase/dal.ts`

**Remove function `lockMetrics`**: Delete the entire function. It updates `periods.metrics_snapshot` and `periods.metrics_locked_at`, both of which are being dropped from the DB.

**Rewrite function `takeIntoWork(id: string): Promise<Task>`**:
- Remove the `input: TakeIntoWorkInput` parameter — no longer takes any external input
- The DB update must set:
  - `status = 'В работе'`
  - `taken_into_work_at = now()` (current timestamp as ISO string)
  - `priority` — use a conditional: if the current task's `priority` is null, set it to `'Нормальный'`; otherwise leave it unchanged. Approach: fetch the task first (or use a Supabase RPC), OR do a two-step: first read priority, then update. Simplest approach: do a `select` for `priority` before the `update`, then set priority only if it was null.
  - `assignee` — do NOT include in the update payload (leave whatever is already stored)
- Return the updated `Task`

**Rewrite function `returnTaskToQA(id: string): Promise<Task>`**:
- Current code sets `priority: null` in the update — **remove `priority` from the update payload**
- The update must set: `status = null`, `taken_into_work_at = null`, `completed_at = null`, `assignee = null`
- `priority` must NOT be in the update (it stays as-is in the DB)

**Add function `fetchAllPeriodStatistics(): Promise<PeriodStatistics[]>`**:
- SELECT all rows from `period_statistics`
- Order by `created_at` descending
- Return array of `PeriodStatistics`

**Add function `createPeriodStatistics(periodId: string, metrics: Omit<PeriodStatistics, 'id' | 'period_id' | 'locked_at' | 'created_at'>): Promise<PeriodStatistics>`**:
- Parameters: `periodId`, and an object containing the 6 metric fields (`added_to_backlog`, `added_critical`, `resolved_total`, `resolved_critical`, `in_progress`, `in_testing`)
- INSERT into `period_statistics` with `period_id = periodId` and provided metrics
- Return the created `PeriodStatistics` record

**Add function `updatePeriodStatistics(id: string, metrics: Omit<PeriodStatistics, 'id' | 'period_id' | 'locked_at' | 'created_at'>): Promise<PeriodStatistics>`**:
- UPDATE `period_statistics` SET the 6 metric fields WHERE `id = id`
- Return the updated record

**Update imports**: Add `PeriodStatistics` import from `@/types`. Remove `MetricsSnapshot` import.

### Implementation Note for `takeIntoWork`

The priority-conditional logic should be implemented as:

```
1. Fetch current task: SELECT priority FROM tasks WHERE id = id
2. Determine new priority: if fetched priority is null → 'Нормальный', else keep fetched priority
3. UPDATE tasks SET status = 'В работе', taken_into_work_at = <now>, priority = <determined priority> WHERE id = id
4. Return updated task
```

This is two Supabase calls. Alternatively, a single RPC can be used if it's cleaner, but two calls is acceptable given the low frequency of this operation.

## Acceptance Criteria
- [ ] `takeIntoWork(id)` accepts only `id: string`, no second argument
- [ ] `takeIntoWork` sets `status = 'В работе'`, `taken_into_work_at`, and sets `priority = 'Нормальный'` only if the existing priority is null
- [ ] `takeIntoWork` does NOT update `assignee`
- [ ] `returnTaskToQA` does NOT include `priority` in the update
- [ ] `returnTaskToQA` sets `status = null`, `taken_into_work_at = null`, `completed_at = null`, `assignee = null`
- [ ] `lockMetrics` is deleted
- [ ] `fetchAllPeriodStatistics`, `createPeriodStatistics`, `updatePeriodStatistics` are added and exported
- [ ] TypeScript compilation passes

## Notes

- `returnTaskToQA` currently also sets `priority: null` — this is a bug (confirmed from code review). Removing it fixes Bug #1 ("Вернуть в QA" error context: the bug `codes.forEach is not a function` likely stems from the `returnTaskToWorkAtom` chain or stale data; removing the priority reset corrects the data contract).
- `MetricsSnapshot` import in `dal.ts` must be removed after deleting `lockMetrics`.
