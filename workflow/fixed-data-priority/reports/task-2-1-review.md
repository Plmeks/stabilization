# Code Review: Task 2-1

## Review Metadata
- **Reviewer:** orchestra-developer-reviewer
- **Task:** Task 2-1 — Update `ChartsSection` — Compute-All-Then-Slice
- **Report:** workflow/fixed-data-priority/reports/task-2-1-report.md
- **Review Date:** June 12, 2026

## Executive Summary

The implementation correctly replaces the broken compute-on-subset approach with compute-all-then-slice. `calculateChartData()` now receives the full `periods` array, and the chart filter is applied to the result via `allChartData.slice(selectedSortedIndex)`. The slice index is derived from `sortedPeriods` (ascending by `start_date`), matching the internal ordering inside `calculateChartData()`. TypeScript compiles cleanly and ESLint reports no issues in the modified file.

## Critical Issues

✅ No critical issues found.

## Important Issues

✅ No important issues found.

## Code Review

### Compute-All-Then-Slice Verification

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Full `periods` passed to `calculateChartData()` | ✅ | `allChartData` useMemo passes unfiltered `periods` |
| Data computed for all periods before filtering | ✅ | `allChartData` built once from full list; slice applied separately |
| Filter applied to result array, not input | ✅ | `chartData = allChartData.slice(selectedSortedIndex)` |
| Slice index from ascending sort, not atom order | ✅ | `selectedSortedIndex` from `sortedPeriods.findIndex()` |
| `filteredPeriods` removed | ✅ | Confirmed in git diff — no remaining references |

### Slice Index Correctness

`calculateChartData()` returns `[anchor, P1_point, P2_point, ..., PN_point]` where period points follow ascending `start_date` order. For `selectedSortedIndex = k`:

- `allChartData.slice(k)` = `[allChartData[k], ..., allChartData[N]]`
- `allChartData[k]` = end-state of `sortedPeriods[k - 1]` (the anchor for the filtered view when `k > 0`)
- Remaining elements = data points for `sortedPeriods[k]` onward

Mental trace from the task (atom order `[P4, P3, P2, P1]`, filter start P3):

- `sortedPeriods` = `[P1, P2, P3, P4]` → `selectedSortedIndex` = 2
- `allChartData.slice(2)` = `[P2_point, P3_point, P4_point]` — P2_point serves as anchor incorporating P1/P2 contributions; P3/P4 retain full cumulative values

For `selectedSortedIndex = 0`: `slice(0)` returns the complete array — no filtering, preserving AC-6 behavior.

### Edge Cases

- **Invalid `selectedPeriodId`:** `selectedSortedIndex` falls back to `0` when `findIndex` returns `-1`; the existing `useEffect` also resets to `periods[0].id` when the selection is missing or stale. Safe handling on both paths.
- **First chronological period selected:** `selectedSortedIndex = 0` → full `allChartData` returned. Matches AC-6.
- **Empty periods:** Early `return null` when `periods.length === 0`; `calculateChartData` returns `[]` if called with empty input (guarded by the length check before render).

### Unchanged Elements (per task spec)

- `backlogData = chartData.slice(1)` — unchanged, still correct after slice
- Period filter `<select>` JSX — unchanged (still maps over `periods` atom order)
- `useEffect` initialization of `selectedPeriodId` — unchanged
- `CFDChart` and `BacklogChart` usages — unchanged

### Acceptance Criteria

- [x] **AC-2:** P3/P4 cumulative values with filter at P3 match full-view values — **PASS** (full computation + slice preserves pre-computed cumulative values; anchor from P2 incorporates prior periods)
- [x] **AC-4:** Changing filter start does not alter cumulative values for visible periods — **PASS** (values come from `allChartData`, not re-computed on subset)
- [x] **AC-6:** Filter at first chronological period → identical to unfiltered output — **PASS** (`slice(0)` = full array)
- [x] `<select>`, chart components, and `backlogData` unchanged — **PASS**
- [x] **TypeScript compiles** — **PASS** (`npx tsc --noEmit` exit 0)

## Non-critical Issues

🟢 **Default selection vs. chronological "no filter"** — The `useEffect` still defaults to `periods[0].id` (atom order, often descending on the Stats page). On initial load this may show a filtered subset rather than all periods, even though selecting the earliest period in the dropdown shows the full view. This is pre-existing behavior explicitly kept unchanged by the task; the new slice logic correctly interprets the selected period as a chronological start point rather than an array-position start point.

## Testing

- No test report at `workflow/fixed-data-priority/tests/task-2-1-test.md` — expected; automated unit tests for compute-all-then-slice are scoped to Task 3-1.
- TypeScript compilation verified (`npx tsc --noEmit` — exit 0).
- ESLint: no errors in `src/components/stats/charts/ChartsSection.tsx`.
- Logic-trace verification covers AC-2, AC-4, and AC-6; manual verification steps in the implementation report are appropriate.

## Test Results Summary

- E2E: N/A (not in scope for this task)
- Unit: N/A (deferred to Task 3-1)
- Regression: TypeScript compile pass; no lint errors; logic trace confirms no-filter path unchanged

## Final Verdict

**Status:** APPROVED

The compute-all-then-slice pattern is implemented exactly as specified in Task 2-1 and TS Section 6.3. The slice index aligns with `calculateChartData()` internal sorting, intermediate-period contributions are preserved in cumulative values, and all acceptance criteria are met by code inspection. No blocking issues found.

## Next Steps

Proceed to **Task 3-1** for automated unit tests covering compute-all-then-slice and cumulative calculation edge cases.
