# Task 1-2: Create Chart Data Calculation Utilities

## Description
Create `src/lib/chart-utils.ts` with the `ChartDataPoint` type and the `calculateChartData()` function. This function processes periods, tasks, and fixed statistics snapshots into an array of data points consumed by all three chart components.

## Changes Required

### New Files
- `src/lib/chart-utils.ts` — exports `ChartDataPoint` type and `calculateChartData()` function

### Modified Files
- none

## Implementation Details

### Type: `ChartDataPoint`

Define and export an interface `ChartDataPoint` with the following fields:
- `label: string` — X-axis label formatted as `DD.MM` (e.g. `"08.01"`)
- `completed_cumulative: number` — cumulative tasks with `status = 'Завершена'` up to and including this period
- `uncompleted_critical: number` — cumulative tasks with `priority = 'Критический'` AND `status !== 'Завершена'` up to and including this period
- `uncompleted_non_critical: number` — cumulative tasks with `priority !== 'Критический'` AND `status !== 'Завершена'` up to and including this period
- `wip_total: number` — tasks in 'В работе' or 'В тесте' status at this period snapshot
- `total_problems_cumulative: number` — total cumulative tasks up to and including this period (sum of completed + uncompleted)

### Function: `calculateChartData(periods, tasks, periodStatistics)`

**Signature:**
```
calculateChartData(
  periods: Period[],
  tasks: Task[],
  periodStatistics: PeriodStatistics[],
): ChartDataPoint[]
```

**Logic:**

1. Sort `periods` chronologically ascending by `start_date`.
2. If `periods.length === 0`, return an empty array `[]`.
3. Compute the **anchor point** (index 0 in the result): the day before the earliest period's `start_date`.
   - `label` = `dayjs(sortedPeriods[0].start_date).subtract(1, 'day').format('DD.MM')`
   - All numeric fields = `0`
4. For each period in `sortedPeriods` (index 1…N in result):
   a. Check if a `PeriodStatistics` record exists for this period (`periodStatistics.find(s => s.period_id === period.id)`).
   b. **If fixed statistics exist**: read `completed_cumulative`, `uncompleted_critical`, `uncompleted_non_critical`, `wip_total`, `total_problems_cumulative` directly from the record.
   c. **If no fixed statistics**: call `calculateDynamicMetrics(period, periods, tasks)` and read the same fields from its return value.
   d. Set `label` = `dayjs(period.end_date).format('DD.MM')`.
5. Return the array with the anchor point prepended: `[anchorPoint, ...periodPoints]`.

**Important notes:**
- Import `dayjs` and `isSameOrBefore` plugin at the top (same pattern as `stats-utils.ts`).
- Import `calculateDynamicMetrics` from `'@/lib/stats-utils'`.
- Import `Period`, `Task`, `PeriodStatistics` types from `'@/types'`.
- The function is pure (no side effects), making it safe to call inside `useMemo`.

## Dependencies
- Depends on: none (can be implemented alongside task-1-1)

## Acceptance Criteria
- [ ] `src/lib/chart-utils.ts` is created and exports `ChartDataPoint` and `calculateChartData`
- [ ] Anchor point has all-zero numeric values and label = day before first period start_date
- [ ] For periods with fixed statistics, values come from `PeriodStatistics` record
- [ ] For periods without fixed statistics, values come from `calculateDynamicMetrics()`
- [ ] Result array length equals `periods.length + 1` (anchor + one point per period)
- [ ] No TypeScript errors (run ReadLints on the new file)

## Complexity
Medium
