# Task 1-2: Fix `calculateChartData()` Anchor Point and Forward `periodStatistics`

## Objective

Fix two issues in `calculateChartData()`:
1. The **anchor point** is computed from raw task counts even when the first period has fixed statistics — it should use fixed values when available.
2. Each `calculateDynamicMetrics()` call inside the function does not pass `periodStatistics`, so the iterative accumulation introduced in Task 1-1 is never activated for chart data points.

## Use Cases

This task implements:
- **UC-1**: Chart displays fixed data for a period with no actual tasks — anchor derives from fixed stats.
- **UC-2**: Cumulative chart values respect fixed data from prior periods — `calculateDynamicMetrics()` receives `periodStatistics`.
- **UC-5**: All periods fixed — anchor and all data points use fixed values.
- **UC-6**: No fixed stats — behavior is identical to current (regression safety).

## Description of Changes

### Changes to Existing Files

#### `src/lib/chart-utils.ts`

No signature change to `calculateChartData()`. The function already receives `periodStatistics: PeriodStatistics[]` — it just needs to use it more fully.

**Change 1 — Anchor point calculation:**

Current block (lines computing `anchorPoint`):
```
const firstPeriodTasks = tasks.filter((t) => t.creation_period_id === firstPeriod.id);
const initialCritical = firstPeriodTasks.filter((t) => t.priority === 'Критический').length;
const initialNonCritical = firstPeriodTasks.filter((t) => t.priority !== 'Критический').length;

const anchorPoint: ChartDataPoint = {
  label: dayjs(firstPeriod.start_date).subtract(1, 'day').format('DD.MM'),
  periodLabel: '',
  completed_cumulative: 0,
  uncompleted_critical: initialCritical,
  uncompleted_non_critical: initialNonCritical,
  wip_total: 0,
  total_problems_cumulative: firstPeriodTasks.length,
};
```

Replace with logic that checks for fixed stats first:
- Look up `firstFixedStats = periodStatistics.find(s => s.period_id === firstPeriod.id)`
- **If `firstFixedStats` exists:**
  - `total_problems_cumulative = firstFixedStats.added_to_backlog`
  - `uncompleted_critical = firstFixedStats.added_critical`
  - `uncompleted_non_critical = firstFixedStats.added_non_critical`
  - `completed_cumulative = 0` (anchor is the "before start" state)
  - `wip_total = 0`
- **Else (no fixed stats for first period):**
  - Keep the current task-based calculation (`firstPeriodTasks.filter(...)`)
  - `total_problems_cumulative = firstPeriodTasks.length`
  - `uncompleted_critical = initialCritical`
  - `uncompleted_non_critical = initialNonCritical`
  - `completed_cumulative = 0`
  - `wip_total = 0`

The `label` and `periodLabel` fields of the anchor remain unchanged.

**Change 2 — Forward `periodStatistics` to `calculateDynamicMetrics()`:**

In the `periodPoints` map, the `else` branch (period without fixed stats) currently calls:
```
const dynamic = calculateDynamicMetrics(period, periods, tasks);
```

Change to:
```
const dynamic = calculateDynamicMetrics(period, periods, tasks, periodStatistics);
```

This is the only change needed — the `if (fixedStats)` branch already uses `fixedStats` directly and doesn't call `calculateDynamicMetrics()`.

### Rationale

The anchor represents the "state of the system just before the first period starts." When the first period has fixed statistics, those fixed values record how many items were added (`added_to_backlog`) and their priority breakdown — this is the correct starting state. Using `added_to_backlog` rather than `total_problems_cumulative` is intentional: the anchor shows what was entering the backlog at the start, not the running total (which would be the end-state data point for the period itself).

## Implementation Details

### Step 1: Look up first period's fixed stats

After computing `firstPeriod = sortedPeriods[0]`, add:
```
const firstFixedStats = periodStatistics.find((s) => s.period_id === firstPeriod.id);
```

### Step 2: Conditionally build anchor

Replace the anchor building block with an if/else using `firstFixedStats` as described above.

### Step 3: Update the dynamic branch inside the map

The only change inside the `.map()` call for `periodPoints` is passing the fourth argument to `calculateDynamicMetrics`.

## Acceptance Criteria

- [ ] AC-1.1: When first period has fixed stats and zero tasks, `anchorPoint.total_problems_cumulative = firstFixedStats.added_to_backlog` (not 0).
- [ ] AC-1.2: When first period has fixed stats, `anchorPoint.uncompleted_critical = firstFixedStats.added_critical`.
- [ ] AC-1.3: When first period has no fixed stats, anchor is identical to current behavior.
- [ ] AC-2.1: `calculateDynamicMetrics()` for unfixed periods now uses `periodStatistics` — cumulative values incorporate prior fixed checkpoints.
- [ ] AC-6: With empty `periodStatistics`, chart output is identical to current behavior.
- [ ] TypeScript compiles with no errors.

## Test Strategy

- **Unit tests** (Task 3-1):
  - Anchor with fixed-only first period, no tasks → non-zero anchor values from fixed stats
  - Anchor with no fixed stats → identical to current behavior
  - Full data set with P1 fixed, P2 unfixed — verify P2 data point uses P1's fixed base via `calculateDynamicMetrics()`
  - All periods fixed — each data point matches its fixed stats, anchor from first fixed stats
  - No fixed stats — regression, all values from tasks only

- **Manual verification:** Charts tab — create a period with fixed metrics, zero tasks; chart shows non-zero initial point.

## Dependencies

- **Depends on:** Task 1-1 (must have new `calculateDynamicMetrics()` signature)
- **Blocks:** Task 2-1 (depends on `calculateChartData()` semantics)

## Notes

- The function signature `calculateChartData(periods, tasks, periodStatistics)` is **unchanged**. The `periods` parameter semantics will change in Task 2-1 (caller now passes full period list), but no change is needed inside this function for that — it already re-sorts internally.
- No new imports are needed — `PeriodStatistics` is already imported via the existing `periodStatistics: PeriodStatistics[]` parameter type.
