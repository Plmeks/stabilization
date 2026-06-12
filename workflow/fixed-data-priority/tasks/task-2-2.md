# Task 2-2: Update `stats/page.tsx` and `statsAtom.ts` Callers

## Objective

Pass `periodStatistics` to all existing `calculateDynamicMetrics()` call sites outside `chart-utils.ts` so that the iterative accumulation algorithm (Task 1-1) is active everywhere — specifically on the Stats page and when locking period metrics.

## Use Cases

This task implements:
- **UC-3**: Stats page shows correct cumulative values for unfixed periods that follow fixed ones.
- **UC-4**: Correct cumulative values in mixed chains for both Stats tab and the lock snapshot.
- **UC-6**: Regression — unchanged behavior when `periodStatistics` is empty.

## Description of Changes

### Changes to Existing Files

#### `src/app/stats/page.tsx`

**Context:** The page already reads `periodStatisticsAtom`:
```
const periodStatistics = useAtomValue(periodStatisticsAtom);
```

In the `sortedPeriods.map()` callback, the current call:
```
const dynamicMetrics = calculateDynamicMetrics(period, periods, tasks);
```

Change to:
```
const dynamicMetrics = calculateDynamicMetrics(period, periods, tasks, periodStatistics);
```

No other changes to this file.

#### `src/atoms/statsAtom.ts`

**Context:** `lockPeriodMetricsAtom` computes dynamic metrics to create a locked snapshot. It currently calls:
```
const metrics = calculateDynamicMetrics(period, allPeriods, allTasks);
```

The atom already has access to `periodsAtom` and `tasksAtom` via `get()`. Add a `get()` call for `periodStatisticsAtom`:
```
const allStats = get(periodStatisticsAtom);
```

Then change the `calculateDynamicMetrics` call to:
```
const metrics = calculateDynamicMetrics(period, allPeriods, allTasks, allStats);
```

No other changes to this file.

### Rationale

`lockPeriodMetricsAtom` locks the current dynamic state of a period into `period_statistics`. If a prior period has fixed stats that change the correct cumulative baseline, the locked snapshot must incorporate that base — otherwise the snapshot is wrong. After this change, locking a period that follows fixed periods will produce an accurate snapshot.

## Acceptance Criteria

- [ ] AC-3.1: Stats page for an unfixed period following a fixed period shows `total_problems_cumulative` that includes the fixed period's base value.
- [ ] AC-3.2: The chain P1(fixed) → P2(unfixed) → P3(fixed) → P4(unfixed) shows correct cumulative for P4 on the Stats page.
- [ ] AC-4: Locking an unfixed period that follows a fixed period creates a `period_statistics` row with cumulative values that reflect the fixed base.
- [ ] AC-6: When no periods have fixed stats, Stats page output is identical to current behavior.
- [ ] TypeScript compiles with no errors.

## Test Strategy

- **Manual verification:**
  1. Create P1, fix its metrics (e.g., `total_problems_cumulative = 50`).
  2. Create P2 with 5 tasks (no fixing).
  3. Navigate to Stats tab — P2 should show `total_problems_cumulative = 55` (not just 5).
  4. Lock P2. Verify the locked snapshot in the database shows `total_problems_cumulative = 55`.
  5. Verify that P1 (fixed) is unchanged on the Stats page.

- **Regression:** With no fixed stats in any period, Stats page shows same values as before this change.

## Dependencies

- **Depends on:** Task 1-1 (new signature of `calculateDynamicMetrics()`)
- **Blocks:** Nothing

## Notes

- Both files (`stats/page.tsx` and `statsAtom.ts`) already have `periodStatistics` available — this is a one-line change in each file.
- No new imports needed in either file.
- Do NOT change `updatePeriodStatisticsAtom`, `deletePeriodStatisticsAtom`, or any other atoms in `statsAtom.ts`.
