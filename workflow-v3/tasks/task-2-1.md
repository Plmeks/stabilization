# Task 2.1: Stats Calculation Utility + Atom Updates

## Related Use Cases
- UC-1: View Dynamic Statistics with Corrected "Добавлено" Logic
- UC-2: Lock Period Metrics with New Fields
- UC-4: Add/Edit Comment for Locked Period Statistics

## Task Goal
Extract the dynamic metrics calculation into a reusable utility function, fix the `added_to_backlog` bug, implement all new metric calculations (including cumulative across periods), update the Jotai `statsAtom.ts` to use the new metric schema, and add the `updatePeriodCommentAtom` for debounced comment saves.

## Description of Changes

### New Files

#### File: `src/lib/stats-utils.ts`

Create this utility file with the following exports:

**Type: `DynamicMetrics`**

A type containing all 15 calculated metric fields (identical shape to `MetricsPayload` in the atom):
```
type DynamicMetrics = {
  added_to_backlog: number;
  added_critical: number;
  added_non_critical: number;
  resolved_total: number;
  resolved_critical: number;
  resolved_non_critical: number;
  in_progress: number;
  in_testing: number;
  in_block: number;
  wip_total: number;
  total_problems_cumulative: number;
  completed_cumulative: number;
  uncompleted: number;
  uncompleted_critical: number;
  uncompleted_non_critical: number;
}
```

Export this type so `stats/page.tsx` can use it for prop typing.

**Function: `calculateDynamicMetrics`**

Signature:
```
export function calculateDynamicMetrics(
  period: Period,
  allPeriods: Period[],
  allTasks: Task[],
): DynamicMetrics
```

Logic:
1. `periodTasks` = filter `allTasks` where `task.period_id === period.id`

2. **Period-specific metrics (BUG FIX — use `periodTasks.length`, not filtered by status):**
   - `added_to_backlog` = `periodTasks.length` (ALL tasks for the period, regardless of status)
   - `added_critical` = `periodTasks.filter(t => t.priority === 'Авария').length`
   - `added_non_critical` = `periodTasks.filter(t => t.priority !== 'Авария').length`
   - `resolved_total` = `periodTasks.filter(t => t.status === 'Завершена').length`
   - `resolved_critical` = `periodTasks.filter(t => t.status === 'Завершена' && t.priority === 'Авария').length`
   - `resolved_non_critical` = `periodTasks.filter(t => t.status === 'Завершена' && t.priority !== 'Авария').length`
   - `in_progress` = `periodTasks.filter(t => t.status === 'В работе').length`
   - `in_testing` = `periodTasks.filter(t => t.status === 'В тесте').length`
   - `in_block` = `periodTasks.filter(t => t.status === 'Блокер').length`
   - `wip_total` = `in_progress + in_testing` (blockers excluded)

3. **Cumulative metrics:**
   - Sort `allPeriods` by `start_date` ascending using `dayjs(a.start_date).diff(dayjs(b.start_date))`
   - `periodsUpToThis` = sorted periods where `dayjs(p.start_date).isSameOrBefore(dayjs(period.start_date), 'day')`
   - `tasksUpToThis` = `allTasks.filter(t => periodsUpToThis.some(p => p.id === t.period_id))`
   - `total_problems_cumulative` = `tasksUpToThis.length`
   - `completed_cumulative` = `tasksUpToThis.filter(t => t.status === 'Завершена').length`
   - `uncompleted` = `total_problems_cumulative - completed_cumulative`
   - `uncompleted_critical` = `tasksUpToThis.filter(t => t.status !== 'Завершена' && t.priority === 'Авария').length`
   - `uncompleted_non_critical` = `tasksUpToThis.filter(t => t.status !== 'Завершена' && t.priority !== 'Авария').length`

4. Return all 15 fields as `DynamicMetrics`

**Note on dayjs `isSameOrBefore`:** Import dayjs and the `isSameOrBefore` plugin. Register the plugin at the top of the file:
```typescript
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
```

### Changes to Existing Files

#### File: `src/atoms/statsAtom.ts`

**1. Update imports:** Add import for `periodsAtom` from `@/atoms/periodsAtom`, import `calculateDynamicMetrics` from `@/lib/stats-utils`, import `updatePeriodStatisticsComment` from `@/lib/supabase/dal`.

**2. Update `MetricsPayload` type** to include all 15 new fields (remove the old 6-field Pick):
```typescript
type MetricsPayload = Omit<PeriodStatistics, 'id' | 'period_id' | 'comment' | 'locked_at' | 'created_at'>;
```
This automatically includes all numeric metric fields.

**3. Fix `lockPeriodMetricsAtom`:**
- Get all tasks (`tasksAtom`) and all periods (`periodsAtom`) from `get`
- Find the specific `period` object from `periodsAtom` where `p.id === periodId`
- Call `calculateDynamicMetrics(period, allPeriods, allTasks)` to get all metrics
- Pass the returned `DynamicMetrics` object as `metrics` to `createPeriodStatistics(periodId, metrics)`
- The atom signature remains `(get, set, periodId: string)`

**4. `updatePeriodStatisticsAtom`** — no logic change needed; the `MetricsPayload` type now covers all fields automatically.

**5. Add new atom: `updatePeriodCommentAtom`**

```
export const updatePeriodCommentAtom = atom(
  null,
  async (get, set, { statisticsId, comment }: { statisticsId: string; comment: string | null }) => { ... }
)
```

Logic:
- Optimistic update: update `periodStatisticsAtom` by mapping over records, setting `comment` on the matching `id`
- Call `updatePeriodStatisticsComment(statisticsId, comment)` from DAL
- On error: revert `periodStatisticsAtom` to previous value and re-throw

## Acceptance Criteria
- [ ] `calculateDynamicMetrics` is exported from `src/lib/stats-utils.ts`
- [ ] `added_to_backlog` uses `periodTasks.length` (all tasks, no status filter) — bug is fixed
- [ ] `wip_total = in_progress + in_testing` (does NOT include `in_block`)
- [ ] Cumulative metrics use `dayjs` for date comparison (no string subtraction)
- [ ] Cumulative includes all periods where `start_date <= current period's start_date`
- [ ] `lockPeriodMetricsAtom` calls `calculateDynamicMetrics` and saves all 15 fields
- [ ] `updatePeriodCommentAtom` exists, performs optimistic update, and reverts on error
- [ ] No TypeScript errors in `statsAtom.ts` or `stats-utils.ts`

## Notes
- `null` priority tasks satisfy `t.priority !== 'Авария'` → counted as non-critical. This is intentional per the TS.
- The `dayjs/plugin/isSameOrBefore` plugin needs to be registered once. If the project already uses it somewhere, avoid double-extending. Place the registration at the top of `stats-utils.ts`; it is idempotent.
- `DynamicMetrics` export is needed by `stats/page.tsx` for its dynamic prop types.
