# Task 2-1: Update `ChartsSection` — Compute-All-Then-Slice

## Objective

Fix the chart period filter bug: `ChartsSection` currently passes only the user-selected subset of periods to `calculateChartData()`. This causes cumulative calculations for visible periods to miss contributions from periods outside the filter window. The fix: always pass the full period list to `calculateChartData()`, compute data for all periods, then slice the result array to produce the filtered view.

## Use Cases

This task implements:
- **UC-2**: Cumulative values for filtered-in periods correctly incorporate all prior periods (including filtered-out ones with fixed stats or tasks).
- **UC-4**: Any combination of fixed/unfixed periods — changing the chart filter start does not alter cumulative values for visible periods.
- **UC-5**: All periods fixed — correct with any filter.
- **UC-6**: No fixed stats — behavior unchanged when filter is not applied.

## Description of Changes

### Changes to Existing Files

#### `src/components/stats/charts/ChartsSection.tsx`

**Remove** the `filteredPeriods` useMemo:
```
// REMOVE this entire block:
const filteredPeriods = useMemo(() => {
  if (!selectedPeriodId) return periods;
  const selectedIndex = periods.findIndex((p) => p.id === selectedPeriodId);
  if (selectedIndex === -1) return periods;
  return periods.slice(selectedIndex).reverse();
}, [periods, selectedPeriodId]);
```

**Add** a `sortedPeriods` memo (ascending by `start_date`) and a `selectedSortedIndex` derived value:
- `sortedPeriods = useMemo(() => [...periods].sort((a, b) => dayjs(a.start_date).diff(dayjs(b.start_date))), [periods])`
- `selectedSortedIndex = useMemo(() => { const idx = sortedPeriods.findIndex(p => p.id === selectedPeriodId); return idx === -1 ? 0 : idx; }, [sortedPeriods, selectedPeriodId])`

**Change** `chartData` useMemo:
- Pass `periods` (full, unfiltered) instead of `filteredPeriods` to `calculateChartData()`.
- Slice the result: `allChartData.slice(selectedSortedIndex)`
  - When `selectedSortedIndex = 0`: `slice(0)` = all data (no change).
  - When `selectedSortedIndex > 0`: `allChartData[selectedSortedIndex]` becomes the new anchor (it is the data point for the period immediately before the selected start); `allChartData[selectedSortedIndex+1..]` are the data points for the visible periods.
- Result: the returned `chartData` array has the same structure as before — first element is the anchor, rest are period data points.

**Updated `chartData` useMemo logic:**
```
const allChartData = useMemo(
  () => calculateChartData(periods, tasks, periodStatistics),
  [periods, tasks, periodStatistics],
);

const chartData = useMemo(
  () => allChartData.slice(selectedSortedIndex),
  [allChartData, selectedSortedIndex],
);
```

**Keep unchanged:**
- `backlogData = chartData.slice(1)` — still correct after the slice.
- The period filter `<select>` rendered JSX — no change.
- The `useEffect` that initializes `selectedPeriodId` — no change.
- All chart component usages (`CFDChart`, `BacklogChart`) — no change.

### Why `slice(selectedSortedIndex)` works

The `allChartData` array returned by `calculateChartData()` for N periods has length N+1:
- Index 0: synthetic anchor (state just before the first period starts)
- Index 1: data point for `sortedPeriods[0]`
- Index 2: data point for `sortedPeriods[1]`
- Index k: data point for `sortedPeriods[k-1]`
- Index k+1: data point for `sortedPeriods[k]`

When user selects `sortedPeriods[selectedSortedIndex]` as the filter start:
- `allChartData[selectedSortedIndex]` = data point for `sortedPeriods[selectedSortedIndex - 1]` — this is the **end-state before the selected period starts**, which serves as the anchor for the filtered view.
- `allChartData[selectedSortedIndex + 1..]` = data points for periods from `sortedPeriods[selectedSortedIndex]` onward.
- `allChartData.slice(selectedSortedIndex)` = `[newAnchor, ...visibleDataPoints]` — exactly the shape the chart components expect.

For `selectedSortedIndex = 0` (no filtering):
- `allChartData.slice(0)` = the complete array, including the original synthetic anchor and all period points — unchanged behavior.

### Rationale for `sortedPeriods`

`calculateChartData()` internally sorts by `start_date` ascending. To make `selectedSortedIndex` consistent with the ordering used inside `calculateChartData()`, `ChartsSection` must also sort by `start_date` ascending when looking up the selected period's index. The `sortedPeriods` memo provides this.

Note: `periods` atom ordering may differ from ascending `start_date` order (the stats page sorts descending). Always derive `selectedSortedIndex` from `sortedPeriods`, never from `periods` directly.

## Acceptance Criteria

- [ ] AC-2: When user selects chart start at P3 (with P1, P2 excluded from view), P3 and P4 cumulative values are identical to those shown when the filter includes all periods.
- [ ] AC-4: Changing the filter start period does not alter cumulative values for periods that remain visible.
- [ ] AC-6: When filter is at "first period" (no filter applied), chart output is identical to current behavior.
- [ ] The `<select>` filter, chart components, and `backlogData` remain unchanged.
- [ ] TypeScript compiles with no errors.

## Test Strategy

- **Unit tests** (Task 3-1): Verify that `calculateChartData()` data points for periods P3 and P4 are the same whether the caller passes `[P1, P2, P3, P4]` or `[P3, P4]` as the period list — confirming the compute-all approach is necessary and correct.
- **Manual verification:**
  1. Set up P1 (fixed, e.g., total=50) and P2, P3 (unfixed, each with some tasks).
  2. Note cumulative values for P3 with filter at P1 (all visible).
  3. Change filter to P3 (only P3 visible). Verify P3's cumulative value is the same.

## Dependencies

- **Depends on:** Task 1-2 (relies on `calculateChartData()` receiving full period list and using `periodStatistics` internally)
- **Blocks:** Nothing

## Notes

- The `periods` atom in `ChartsSection` is imported from `periodsAtom`. Its ordering is unspecified — always use `sortedPeriods` (ascending) when computing `selectedSortedIndex`.
- The `useEffect` default selection (`periods[0].id`) is fine as-is. If `periods[0]` is not the earliest period, `selectedSortedIndex` will be computed correctly via `sortedPeriods.findIndex()`.
- Remove any now-unused `filteredPeriods` import-references or variables after deleting the memo.
