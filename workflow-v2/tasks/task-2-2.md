# Task 2.2: New statsAtom

## Related Use Cases
- UC-6: Lock period metrics — compute from tasks by period_id and save to period_statistics
- UC-7: Edit locked metrics — update the period_statistics record

## Task Goal

Create a new Jotai atom file `src/atoms/statsAtom.ts` that manages the `period_statistics` state: holds all records, fetches them, provides a lock action (computes + inserts), and provides an update action (for the edit modal).

## Description of Changes

### New Files

- `src/atoms/statsAtom.ts` — all statistics-related atoms

### File: `src/atoms/statsAtom.ts`

**Atom `periodStatisticsAtom`**:
- `atom<PeriodStatistics[]>([])`
- Holds all `period_statistics` records fetched from DB

**Atom `fetchPeriodStatisticsAtom`**:
- Write atom, no input
- Calls `fetchAllPeriodStatistics()` from DAL
- Sets `periodStatisticsAtom` with the result

**Atom `lockPeriodMetricsAtom`**:
- Write atom, input: `periodId: string`
- Logic:
  1. Get all tasks from `tasksAtom`
  2. Filter tasks where `task.period_id === periodId`
  3. Compute the 6 metrics from this filtered task set:
     - `added_to_backlog`: count tasks WHERE `status IS NOT NULL` (i.e., `task.status !== null`)
     - `added_critical`: count tasks WHERE `status IS NOT NULL` AND `priority === 'Авария'`
     - `resolved_total`: count tasks WHERE `status === 'Завершена'`
     - `resolved_critical`: count tasks WHERE `status === 'Завершена'` AND `priority === 'Авария'`
     - `in_progress`: count tasks WHERE `status === 'В работе'`
     - `in_testing`: count tasks WHERE `status === 'В тесте'`
  4. Call `createPeriodStatistics(periodId, { added_to_backlog, added_critical, resolved_total, resolved_critical, in_progress, in_testing })`
  5. Append the returned `PeriodStatistics` record to `periodStatisticsAtom`
- Use optimistic update pattern (optional for this atom since locking is not frequently reversed): just update after server response

**Atom `updatePeriodStatisticsAtom`**:
- Write atom, input: `{ id: string; metrics: { added_to_backlog: number; added_critical: number; resolved_total: number; resolved_critical: number; in_progress: number; in_testing: number } }`
- Logic:
  1. Optimistic update: update `periodStatisticsAtom` — replace the record with matching `id` with `{ ...record, ...metrics }`
  2. Call `updatePeriodStatistics(id, metrics)` from DAL
  3. On success: update atom with the server-returned record
  4. On error: revert to previous state

**Imports needed in statsAtom.ts**:
- `atom` from `jotai`
- `PeriodStatistics` from `@/types`
- `fetchAllPeriodStatistics`, `createPeriodStatistics`, `updatePeriodStatistics` from `@/lib/supabase/dal`
- `tasksAtom` from `@/atoms/tasksAtom`

## Acceptance Criteria
- [ ] `periodStatisticsAtom` holds `PeriodStatistics[]`
- [ ] `fetchPeriodStatisticsAtom` fetches and populates the atom
- [ ] `lockPeriodMetricsAtom` correctly computes all 6 metrics filtered by `period_id` (not date range)
- [ ] `lockPeriodMetricsAtom` uses `status IS NOT NULL` (not `taken_into_work_at`) for `added_to_backlog`
- [ ] `updatePeriodStatisticsAtom` updates the record with optimistic update + server sync
- [ ] TypeScript compilation passes

## Notes

- Metrics filter by `period_id` on the task itself — not by date range. This is a key difference from the current `stats/page.tsx` which uses `dayjs.isBetween` on timestamps.
- `added_to_backlog` counts tasks where `status !== null` (i.e., tasks that have been "taken into work" at some point, since `status = null` is the initial/QA state).
- `lockPeriodMetricsAtom` reads from `tasksAtom` (in-memory tasks). This is consistent with other atoms. The tasks should already be loaded by the time the user is on the stats tab.
