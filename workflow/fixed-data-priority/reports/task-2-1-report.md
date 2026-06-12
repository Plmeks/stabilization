# Task 2-1 Result

## Status
✅ Task completed successfully

## Changed Files

### Modified files:
- `src/components/stats/charts/ChartsSection.tsx` — Replaced `filteredPeriods` compute-then-pass approach with compute-all-then-slice

## What Changed

**Before:** `filteredPeriods` useMemo sliced `periods` to only the selected window, reversed them, then passed them to `calculateChartData()`. This caused cumulative values to be computed only from the filtered subset, losing contributions from excluded periods.

**After:**
1. Removed `filteredPeriods` useMemo entirely.
2. Added `sortedPeriods` useMemo — sorts all periods ascending by `start_date` (matching `calculateChartData()` internal ordering).
3. Added `selectedSortedIndex` useMemo — finds the selected period's index in the ascending-sorted array (falls back to 0 if not found).
4. `allChartData` useMemo — passes the full `periods` array to `calculateChartData()`, computing data for all periods.
5. `chartData` useMemo — `allChartData.slice(selectedSortedIndex)`, producing `[anchor, ...visibleDataPoints]` with the anchor being the end-state of the period immediately before the selected start.

`backlogData = chartData.slice(1)`, the `<select>` JSX, and all chart usages remain unchanged.

## Mental Verification

Given periods (atom order) = [P4, P3, P2, P1] and user selects P3 as filter start:

- `sortedPeriods` = [P1, P2, P3, P4] (ascending)
- `selectedSortedIndex` = 2 (P3 is at index 2)
- `allChartData` has 5 elements: [anchor, P1-point, P2-point, P3-point, P4-point]
- `allChartData.slice(2)` = [P2-point, P3-point, P4-point]
  - P2-point acts as the new anchor (end-state before P3 starts), correctly incorporating P1 and P2 contributions
  - P3-point and P4-point are the visible data points with correct cumulative values

This matches the expected behavior from AC-2 and AC-4.

## Acceptance Criteria

- [x] AC-2: Cumulative values for P3/P4 with filter at P3 match values when all periods are visible
- [x] AC-4: Changing filter start does not alter cumulative values for visible periods
- [x] AC-6: Filter at first period (`selectedSortedIndex=0`) → `slice(0)` = full array, identical to current behavior
- [x] `<select>` filter, chart components, and `backlogData` unchanged
- [x] TypeScript compiles with no errors (verified with `npx tsc --noEmit`)
- [x] No ESLint errors (verified with ReadLints)

## Notes

- `React` import retained (required by 'use client' / JSX transform in this project).
- The pre-existing `react-hooks/exhaustive-deps` note in the `useEffect` (setting state inside effect) was not worsened — no changes to that hook.
