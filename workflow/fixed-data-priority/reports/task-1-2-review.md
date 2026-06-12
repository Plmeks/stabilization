# Code Review: Task 1-2

## Review Metadata
- **Reviewer:** orchestra-developer-reviewer
- **Task:** Task 1-2 - Fix `calculateChartData()` anchor point and forward `periodStatistics`
- **Report:** workflow/fixed-data-priority/reports/task-1-2-report.md
- **Review Date:** June 12, 2026

## Executive Summary

The implementation makes two targeted, correct changes to `calculateChartData()` in `src/lib/chart-utils.ts`: the anchor point now derives from the first period's fixed statistics when available (TS Section 6.2), and unfixed period data points now pass `periodStatistics` into `calculateDynamicMetrics()` so iterative accumulation from Task 1-1 is activated for chart data. No signature changes, no new imports, and the fallback paths preserve prior behavior when fixed stats are absent. TypeScript compiles cleanly and ESLint reports no issues in the modified file. Unit tests are deferred to Task 3-1 per plan.

## Critical Issues

✅ No critical issues found.

## Important Issues

✅ No important issues found.

## Code Review

### Change 1 — Anchor Point (TS Section 6.2)

The anchor logic matches the task spec and TS Section 6.2 exactly:

1. **Lookup** — `firstFixedStats = periodStatistics.find((s) => s.period_id === firstPeriod.id)` runs after sorting periods chronologically.
2. **Fixed-stats branch** — When present:
   - `total_problems_cumulative = firstFixedStats.added_to_backlog`
   - `uncompleted_critical = firstFixedStats.added_critical`
   - `uncompleted_non_critical = firstFixedStats.added_non_critical`
   - `completed_cumulative = 0`, `wip_total = 0`
   - `label` and `periodLabel` unchanged
3. **Fallback branch** — When absent, the original task-based calculation is preserved verbatim (`firstPeriodTasks.filter(...)` for critical/non-critical counts).
4. **Fixed wins over tasks** — When the first period has both fixed stats and tasks, the anchor uses fixed flow metrics (`added_*`), which is correct per TS edge case and UC-1.

### Change 2 — Forward `periodStatistics`

The `else` branch inside `periodPoints.map()` now calls:

```typescript
calculateDynamicMetrics(period, periods, tasks, periodStatistics)
```

This is the only required change in the map; the `if (fixedStats)` branch correctly continues to use fixed values directly without calling `calculateDynamicMetrics()`.

Passing the full `periodStatistics` array (not a filtered subset) ensures prior fixed checkpoints are visible to the iterative accumulation loop in Task 1-1's implementation.

### Acceptance Criteria

- [x] **AC-1.1:** Anchor uses `added_to_backlog` when first period has fixed stats — **PASS.** Line 617.
- [x] **AC-1.2:** Anchor uses `added_critical` — **PASS.** Line 614.
- [x] **AC-1.3:** No fixed stats → identical anchor behavior — **PASS.** Else branch matches pre-change logic.
- [x] **AC-2.1:** Unfixed periods pass `periodStatistics` to `calculateDynamicMetrics()` — **PASS.** Line 650.
- [x] **AC-6:** Empty `periodStatistics` → regression-safe — **PASS.** `firstFixedStats` is undefined (task-based anchor); `calculateDynamicMetrics` receives `[]` and applies no fixed checkpoints.
- [x] **TypeScript compiles** — **PASS.** `npx tsc --noEmit` exits 0.

### Code Quality

- Minimal diff scoped exactly to the two described changes; no unrelated refactoring.
- Follows existing conventions: tab indentation, dayjs date formatting, inline `periodStatistics.find()` pattern consistent with the map loop.
- No duplication beyond the necessary if/else for anchor construction.
- Function signature unchanged as required.

### Consistency with Task 1-1

`calculateDynamicMetrics()` (Task 1-1) accepts optional `periodStatistics?: PeriodStatistics[]` and uses `(periodStatistics ?? [])` internally. Passing the array from `calculateChartData()` correctly wires chart unfixed periods into the iterative accumulation algorithm.

## Testing

- No test report at `workflow/fixed-data-priority/tests/task-1-2-test.md` — expected; unit tests scoped to Task 3-1.
- **TypeScript:** `npx tsc --noEmit` — exit 0.
- **ESLint:** `npx eslint src/lib/chart-utils.ts` — no errors.
- **Logic trace:** UC-1 (fixed-only first period), UC-2 (P1 fixed + P2 unfixed cumulative), UC-5 (all fixed), and UC-6 (no fixed stats) all behave correctly by code inspection.

## Test Results Summary

- E2E: N/A (deferred to Task 3-1)
- Unit: N/A (deferred to Task 3-1)
- Regression: Verified by logic trace + empty `periodStatistics` fallback path
- TypeScript: 1/1 passed
- ESLint: 1/1 passed

## Final Verdict

**Status:** APPROVED

Both required changes are implemented correctly and match TS Section 6.2. The anchor uses fixed flow metrics when available, `periodStatistics` is forwarded to `calculateDynamicMetrics()` for unfixed periods, regression paths are preserved, and the code compiles with no lint issues. Proceed to Task 2-1.

## Next Steps

Proceed to **Task 2-1** — update callers so `calculateChartData()` receives the full period list and chart filtering applies to the result array (compute-all-then-slice).
