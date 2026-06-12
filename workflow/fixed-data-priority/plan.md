# Development Plan: Fix Priority of Fixed Statistics in Charts and Cumulative Calculations

## Overview

Two bugs cause manually fixed (`period_statistics`) data to be silently ignored in charts and the Stats page:

1. **Anchor point bug** — `calculateChartData()` derives the initial chart point from raw task counts, ignoring fixed statistics for the first period.
2. **Cumulative bug** — `calculateDynamicMetrics()` counts tasks across all periods up to the current one; it ignores fixed-stats checkpoints in prior periods, so manually entered values are lost when computing subsequent unfixed periods.
3. **Filter-before-compute bug** — `ChartsSection` passes only the filtered subset of periods to `calculateChartData()`, which means cumulative calculations for visible periods miss contributions from excluded periods.

The fix is purely in calculation logic — no schema changes, no UI redesign.

## Task Breakdown

### Phase 1: Core Logic Fixes

**Goal:** Fix the two utility functions that do the heavy lifting — everything downstream benefits automatically.

#### Task 1-1: Refactor `calculateDynamicMetrics()` for fixed-data-aware iterative accumulation
- **Description:** Replace the current "count all tasks up to this period" approach with an iterative walk that uses fixed-stats checkpoints as resets. Add an optional `periodStatistics` param; when omitted, behavior is identical to current.
- **Files:** `src/lib/stats-utils.ts`
- **Dependencies:** None
- **Estimated Complexity:** Medium
- **Use Cases:** UC-2, UC-3, UC-4, UC-5, UC-6
- **Test Strategy:** Unit tests for mixed fixed/unfixed chains; regression test with no fixed stats (UC-6)

#### Task 1-2: Fix `calculateChartData()` anchor point and forward `periodStatistics`
- **Description:** Derive anchor point from fixed stats when available (instead of raw task count). Pass `periodStatistics` to each `calculateDynamicMetrics()` call inside the map.
- **Files:** `src/lib/chart-utils.ts`
- **Dependencies:** Task 1-1
- **Estimated Complexity:** Low
- **Use Cases:** UC-1, UC-2, UC-5, UC-6
- **Test Strategy:** Unit tests for anchor with fixed-only first period, mixed, and no-fixed cases

### Phase 2: Callers Integration

**Goal:** Wire the updated utilities into every call site so the fixes take effect end-to-end.

#### Task 2-1: Update `ChartsSection` — compute-all-then-slice
- **Description:** Pass the full unfiltered `periods` to `calculateChartData()`. Apply the chart period filter to the result array instead of the input: use `result[selectedIndex]` as the anchor for the filtered view and `result[selectedIndex+1..]` as data points.
- **Files:** `src/components/stats/charts/ChartsSection.tsx`
- **Dependencies:** Task 1-2
- **Estimated Complexity:** Low
- **Use Cases:** UC-2, UC-4, UC-5, UC-6
- **Test Strategy:** Manual verification — change chart start period; verify cumulative values do not change for periods that remain visible

#### Task 2-2: Update `stats/page.tsx` and `statsAtom.ts` callers
- **Description:** Pass `periodStatistics` to each `calculateDynamicMetrics()` call in the Stats page and in `lockPeriodMetricsAtom` so the lock snapshot is accurate.
- **Files:** `src/app/stats/page.tsx`, `src/atoms/statsAtom.ts`
- **Dependencies:** Task 1-1
- **Estimated Complexity:** Low
- **Use Cases:** UC-3, UC-4, UC-6
- **Test Strategy:** Manual verification on Stats tab — period following a fixed period shows correct cumulative totals

### Phase 3: Unit Tests

**Goal:** Automated regression safety net for the calculation logic.

#### Task 3-1: Set up Vitest and write unit tests for `stats-utils.ts` and `chart-utils.ts`
- **Description:** Install and configure Vitest. Write focused unit tests covering the new iterative accumulation algorithm and the anchor point fix. Do not test UI components.
- **Files:** `package.json`, `vitest.config.ts`, `src/lib/stats-utils.test.ts`, `src/lib/chart-utils.test.ts`
- **Dependencies:** Task 1-1, Task 1-2
- **Estimated Complexity:** Medium
- **Use Cases:** UC-1 through UC-6
- **Test Strategy:** Unit tests only; see task file for full test matrix

## Execution Strategy

- **Parallelization:**
  - Tasks 1-1 and nothing else — must go first (it's the foundation).
  - Task 1-2 and Task 2-2 can run **in parallel** once Task 1-1 is merged (1-2 modifies `chart-utils.ts`, 2-2 modifies `stats/page.tsx` and `statsAtom.ts` — no file conflicts).
  - Task 2-1 starts after Task 1-2 merges.
  - Task 3-1 starts after Tasks 1-1 and 1-2 merge (it only reads the new API, not the callers).

- **Critical path:** `1-1 → 1-2 → 2-1`

- **File conflicts:**
  - Tasks 1-2 and 2-2 each touch different files — safe to run in parallel.
  - Task 2-1 touches only `ChartsSection.tsx` — no conflict with any other task.

## Testing Plan

- [ ] Unit: `calculateDynamicMetrics()` with prior fixed period (UC-2, UC-3)
- [ ] Unit: `calculateDynamicMetrics()` alternating fixed/unfixed chain (UC-4)
- [ ] Unit: `calculateDynamicMetrics()` with no fixed stats (regression, UC-6)
- [ ] Unit: `calculateChartData()` anchor with fixed-only first period (UC-1)
- [ ] Unit: `calculateChartData()` anchor with no fixed stats (regression, UC-6)
- [ ] Unit: compute-all-then-slice — data points identical regardless of filter start (UC-2)
- [ ] Manual: Create a period with fixed metrics and zero tasks → charts show non-zero values (UC-1)
- [ ] Manual: Create P1 (fixed) + P2 (unfixed with tasks) → P2 Stats shows correct cumulative (UC-3)
- [ ] Manual: Change chart start period → cumulative values for visible periods remain unchanged (UC-4)
- [ ] Manual: Lock a period that follows a fixed period → locked snapshot reflects correct cumulative

## Success Criteria

- Chart data points for periods with fixed statistics always reflect fixed values, even when zero tasks exist.
- Cumulative values for any unfixed period correctly build on the nearest preceding fixed period's values.
- Changing the chart filter start period does not alter cumulative values for visible periods.
- All existing behavior (no fixed stats) is unchanged.
- Unit tests pass with `pnpm test`.
