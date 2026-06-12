# Technical Specification: Fix Priority of Fixed Statistics in Charts and Cumulative Calculations

## 1. Overview

### Problem
The system has two mechanisms for period statistics: **dynamic** (calculated from actual tasks in real-time) and **fixed** (manually entered/locked by users via "Зафиксировать метрики"). Two bugs cause fixed data to be silently ignored:

1. **Charts anchor point ignores fixed data**: The initial data point in charts (`anchorPoint`) is computed purely from tasks. When the first visible period has fixed statistics but no actual tasks, the anchor shows zeroes.

2. **Cumulative metrics ignore fixed data from prior periods**: `calculateDynamicMetrics()` computes cumulative values (`total_problems_cumulative`, `completed_cumulative`, `uncompleted`, etc.) by counting tasks across all periods up to the current one. If any prior period has fixed statistics with values that differ from the actual task count (e.g., manually entered data without underlying tasks), those fixed values are completely ignored. This affects both `calculateChartData()` (for unfixed periods) and the Stats page (for unfixed periods following fixed ones).

### Proposed Solution
Introduce fixed-data-aware cumulative calculation that respects fixed statistics as the source of truth for any period where they exist, and only falls back to task-based calculation for periods without fixed data.

## 2. Requirements

### 2.1 Functional Requirements

- **FR-1**: When a period has fixed statistics, charts MUST display the fixed values regardless of whether actual tasks exist for that period.
- **FR-2**: The chart anchor point (initial data point before the first period) MUST be derived from fixed statistics of the first visible period when available, rather than purely from tasks.
- **FR-3**: Cumulative metrics for any period MUST incorporate fixed statistics from all preceding periods that have them. Only periods without fixed statistics should contribute task-based values to the cumulative total.
- **FR-4**: The Stats page MUST display correct cumulative values for unfixed periods that follow fixed ones. Specifically, `calculateDynamicMetrics()` (or its replacement logic) must account for fixed data when computing `total_problems_cumulative`, `completed_cumulative`, `uncompleted`, `uncompleted_critical`, and `uncompleted_non_critical`.
- **FR-5**: Existing behavior MUST be preserved when no fixed statistics exist (pure task-based calculation).

### 2.2 Non-Functional Requirements

- **NFR-1**: No database schema changes required — the fix is purely in the calculation logic.
- **NFR-2**: Performance must not degrade noticeably — the number of periods is small (typically <50), so iterating with fixed-data lookups is acceptable.
- **NFR-3**: The fix must not affect the "Зафиксировать метрики" (lock) or "Редактировать метрики" (edit) workflows — only how values are read/computed.

## 3. Use Cases

### UC-1: Chart Displays Fixed Data for Period Without Tasks

**Actor:** User viewing Charts tab
**Preconditions:**
- Period P1 exists with fixed statistics (e.g., `total_problems_cumulative: 50`, `completed_cumulative: 30`)
- Period P1 has zero actual tasks in the system
**Steps:**
1. User navigates to the Charts tab
2. System calls `calculateChartData(periods, tasks, periodStatistics)`
3. System finds fixed statistics for P1
4. System uses fixed values for P1's chart data point
5. System computes anchor point using P1's fixed data (deriving initial state)

**Expected Result:** Chart shows non-zero values reflecting the fixed statistics. Anchor point shows a meaningful initial state derived from fixed data.
**Acceptance Criteria:**
- AC-1.1: When P1 has fixed stats and zero tasks, CFD chart shows `total_problems_cumulative`, `completed_cumulative` from fixed stats (not 0).
- AC-1.2: Anchor point `total_problems_cumulative` is derived from P1's fixed `added_to_backlog` (not from `tasks.filter(...)` which yields 0).
- AC-1.3: Backlog charts show `uncompleted_critical` and `uncompleted_non_critical` from fixed stats.

### UC-2: Cumulative Chart Values Respect Fixed Data from Prior Periods

**Actor:** User viewing Charts tab
**Preconditions:**
- Periods P1, P2, P3 exist (chronologically ordered)
- P1 has fixed statistics: `total_problems_cumulative: 50`, `completed_cumulative: 30`
- P2 has NO fixed statistics, has 5 tasks (3 completed, 2 created in P2)
- P3 has NO fixed statistics
**Steps:**
1. User navigates to Charts tab
2. System computes chart data for all periods
3. For P2 (no fixed stats), system calculates dynamic metrics
4. Dynamic cumulative calculation for P2 uses P1's **fixed** `total_problems_cumulative` (50) as the base, then adds P2's task-based additions on top

**Expected Result:** P2's `total_problems_cumulative` = 50 (from P1 fixed) + 2 (new tasks in P2) = 52, not just the count of all tasks (which would miss P1's fixed-only data).
**Acceptance Criteria:**
- AC-2.1: When P2 has no fixed stats, its `total_problems_cumulative` incorporates P1's fixed value as the base.
- AC-2.2: `completed_cumulative` for P2 = P1 fixed (30) + P2 completions from tasks (3) = 33.
- AC-2.3: `uncompleted` for P2 = `total_problems_cumulative` - `completed_cumulative` = 52 - 33 = 19.

### UC-3: Stats Page Shows Correct Cumulative Values After Fixed Period

**Actor:** User viewing Stats tab
**Preconditions:**
- P1 has fixed statistics with `total_problems_cumulative: 50`
- P2 has no fixed statistics, has some tasks
**Steps:**
1. User navigates to Stats tab
2. System renders `StatsPeriodCard` for P2
3. P2 has no fixed stats, so `dynamicMetrics` is used
4. Dynamic metrics calculation for P2 incorporates P1's fixed cumulative values

**Expected Result:** P2's cumulative metrics on the Stats page correctly build upon P1's fixed values.
**Acceptance Criteria:**
- AC-3.1: Stats page for P2 shows `total_problems_cumulative` that includes P1's fixed base.
- AC-3.2: This works for any chain of fixed/unfixed periods (e.g., P1 fixed, P2 unfixed, P3 fixed, P4 unfixed).

### UC-4: Mixed Fixed and Unfixed Periods in Sequence

**Actor:** User viewing Charts or Stats tab
**Preconditions:**
- P1: fixed (`total_problems_cumulative: 50, completed_cumulative: 30`)
- P2: unfixed, 5 new tasks, 2 completed
- P3: fixed (`total_problems_cumulative: 70, completed_cumulative: 45`)
- P4: unfixed, 3 new tasks, 1 completed
**Steps:**
1. System computes metrics for all periods
2. P1: uses fixed values directly
3. P2: cumulative = P1 fixed base + P2 task-based delta
4. P3: uses fixed values directly (overrides any cumulative calculation)
5. P4: cumulative = P3 fixed base + P4 task-based delta

**Expected Result:**
- P1: `total=50, completed=30` (fixed)
- P2: `total=52, completed=32` (P1 fixed + P2 tasks)
- P3: `total=70, completed=45` (fixed — takes precedence)
- P4: `total=73, completed=46` (P3 fixed + P4 tasks)
**Acceptance Criteria:**
- AC-4.1: Fixed periods always display their exact fixed values, regardless of calculated cumulative.
- AC-4.2: Unfixed periods build cumulative values on top of the nearest preceding period's effective values (fixed if available, otherwise that period's own cumulative result).
- AC-4.3: The chain works for any number of alternating fixed/unfixed periods.

### UC-5: All Periods Have Fixed Statistics (No Dynamic Fallback)

**Actor:** User viewing Charts or Stats tab
**Preconditions:** All periods have fixed statistics
**Steps:**
1. System computes metrics
2. Every period uses its fixed values directly

**Expected Result:** Charts and Stats display fixed values for every period. No dynamic calculation needed except for the anchor point.
**Acceptance Criteria:**
- AC-5.1: Each period's chart data point uses its fixed values.
- AC-5.2: Anchor point is derived from the first period's fixed data.

### UC-6: No Periods Have Fixed Statistics (Pure Dynamic — Regression)

**Actor:** User viewing Charts or Stats tab
**Preconditions:** No periods have fixed statistics
**Steps:**
1. System computes metrics using only tasks (current behavior)

**Expected Result:** Identical to current behavior — pure task-based calculation.
**Acceptance Criteria:**
- AC-6.1: Behavior is unchanged when no fixed statistics exist.
- AC-6.2: Cumulative values are computed from tasks as before.

## 4. Scope

### 4.1 In Scope

- Fix anchor point calculation in `calculateChartData()` to use fixed data when available
- Fix cumulative metric calculation to respect fixed data from prior periods
- Update `calculateDynamicMetrics()` signature and logic (or extract a new helper) to accept and use fixed statistics
- Update `calculateChartData()` to compute data for ALL periods before applying chart filters
- Update callers of `calculateDynamicMetrics()` to pass fixed statistics
- Update `ChartsSection` to pass full period list and slice the result for filtered views
- Unit test coverage for the corrected calculation logic

### 4.2 Out of Scope

- UI changes to charts or stats components (no visual redesign)
- Changes to how fixed statistics are created, edited, or deleted
- Changes to the `EditMetricsModal` component
- Database schema changes
- Changes to the lock/unlock workflow (`lockPeriodMetricsAtom`, `deletePeriodStatisticsAtom`)

## 5. Affected Components

### 5.1 Files to Modify

- `src/lib/chart-utils.ts` — fix anchor point calculation; refactor `calculateChartData()` to compute data for all periods using iterative accumulation, then return the full dataset (caller handles filtering)
- `src/lib/stats-utils.ts` — modify `calculateDynamicMetrics()` to accept fixed statistics and use iterative accumulation with period-specific flow metrics for cumulative calculations
- `src/app/stats/page.tsx` — pass `periodStatistics` to `calculateDynamicMetrics()` call
- `src/components/stats/charts/ChartsSection.tsx` — pass ALL periods to `calculateChartData()`; apply chart period filter to the **result** array (slice computed data points) rather than to the input periods

### 5.2 Functions/Classes

- **`calculateChartData()`** in `chart-utils.ts`:
  - **Signature change**: receives all periods (full list), tasks, and periodStatistics. No longer receives a pre-filtered period subset.
  - **Anchor point fix**: when first period has fixed stats, derive anchor from fixed values instead of from tasks (unchanged from original TS).
  - **Cumulative computation**: iterates over ALL periods chronologically, building cumulative values using the iterative accumulation algorithm (Section 6.1). For each period, produces a `ChartDataPoint` using fixed stats directly if available, or the iteratively accumulated cumulative values if not.
  - **Returns**: the full array `[anchor, P1, P2, ..., PN]` for all periods.

- **`calculateDynamicMetrics()`** in `stats-utils.ts`:
  - **Signature change**: add optional `periodStatistics?: PeriodStatistics[]` parameter (default `[]`)
  - **Per-period metrics**: unchanged — `added_to_backlog`, `resolved_total`, etc. are still computed from tasks for the current period.
  - **Cumulative metrics**: replace the current `tasksUpToThis` counting approach with iterative accumulation using period-specific flow metrics (`added_to_backlog`, `resolved_total`, `added_critical`, `resolved_critical`), incorporating fixed statistics as checkpoints (see Section 6.1).

- **`ChartsSection`** in `ChartsSection.tsx`:
  - Pass `periods` (full, unfiltered atom value) to `calculateChartData()`.
  - Derive the filtered chart view by **slicing the returned data array**, not by filtering the input periods. Specifically:
    - If user selects start period at index `i` (0-based among sorted periods): the anchor for the filtered view = the data point at index `i` in the full result (this is the end-state of the previous period, which equals the start-state of the selected period). The visible data = `result[i+1..N]`.
    - If `i = 0` (first period selected): use the original anchor point (`result[0]`) and all period data points (`result[1..N]`).

- **`StatsPage`** in `stats/page.tsx`:
  - Pass `periodStatistics` array to `calculateDynamicMetrics()` call.

### 5.3 Database Changes

None.

## 6. Technical Approach

### 6.1 Core Algorithm: Iterative Accumulation with Period-Specific Flow Metrics

The key change is in how cumulative values are computed. Instead of counting tasks filtered by `creation_period_id` across all periods (which misses cross-period task state changes and ignores fixed data), cumulative values are built **iteratively** using per-period **flow metrics** (`added_to_backlog`, `resolved_total`, `added_critical`, `resolved_critical`).

**Current logic (flawed):**
```
periodsUpToThis = all periods up to current (by date)
tasksUpToThis = all tasks belonging to periodsUpToThis (by creation_period_id)
total_problems_cumulative = tasksUpToThis.length
completed_cumulative = tasksUpToThis.filter(completed).length
uncompleted_critical = tasksUpToThis.filter(!completed && critical).length
uncompleted_non_critical = tasksUpToThis.filter(!completed && !critical).length
```

Problems with the current logic:
1. **Ignores fixed data entirely** — fixed periods' cumulative values are never used as a base.
2. **`completed_cumulative` undercounts** — when a fixed period intervenes, task-based counting from `creation_period_id` does not incorporate the fixed period's cumulative values, leading to missing data.
3. **`uncompleted_critical` never decreases** — the formula `deltaTasks.filter(!completed && critical)` only adds to the count and never subtracts when critical tasks are resolved.

**New logic: Iterative Accumulation**
```
1. Sort ALL periods chronologically (must use the full period list, not a filtered subset)
2. Identify periods up to and including the target period
3. Initialize running cumulative totals:
     running.total_problems_cumulative = 0
     running.completed_cumulative = 0
     running.uncompleted_critical = 0
     running.uncompleted_non_critical = 0

4. For each period from earliest to target:
   a. Look up fixed statistics for this period (by period_id in periodStatistics array)

   b. IF period has fixed statistics:
        // Fixed stats are the source of truth — reset running totals
        running.total_problems_cumulative = fixedStats.total_problems_cumulative
        running.completed_cumulative = fixedStats.completed_cumulative
        running.uncompleted_critical = fixedStats.uncompleted_critical
        running.uncompleted_non_critical = fixedStats.uncompleted_non_critical

   c. ELSE (period has NO fixed statistics):
        // Compute per-period flow metrics from tasks
        added_to_backlog = count tasks where creation_period_id = period.id
        resolved_total  = count tasks where active_period_id = period.id
                          AND status = 'Завершена'
        added_critical    = count tasks where creation_period_id = period.id
                            AND priority = 'Критический'
        resolved_critical = count tasks where active_period_id = period.id
                            AND status = 'Завершена' AND priority = 'Критический'
        added_non_critical    = added_to_backlog - added_critical
        resolved_non_critical = resolved_total - resolved_critical

        // Accumulate onto running totals
        running.total_problems_cumulative += added_to_backlog
        running.completed_cumulative      += resolved_total
        running.uncompleted_critical      += (added_critical - resolved_critical)
        running.uncompleted_non_critical  += (added_non_critical - resolved_non_critical)

5. Derive the remaining cumulative field:
     running.uncompleted = running.total_problems_cumulative - running.completed_cumulative

6. Return running totals as the cumulative values for the target period
```

**Why this is correct:**

- **`resolved_total` uses `active_period_id`**, which captures tasks completed IN this period regardless of when they were created. A task created in P1 but completed in P2 contributes to P2's `resolved_total`, so `completed_cumulative` correctly increases at P2.
- **`added_critical - resolved_critical`** correctly adjusts the uncompleted-critical count: it increases when new critical tasks are added and **decreases** when critical tasks are resolved. This fixes the "never-subtracting" bug.
- **Fixed periods act as checkpoints** — they reset the running totals to their stored values, ensuring manually entered data is respected as the source of truth.
- **Backward compatible** — when `periodStatistics` is empty (no fixed stats exist), the algorithm reduces to iterative accumulation from zero. `total_problems_cumulative = sum(added_to_backlog)` = total tasks created (same as `tasksUpToThis.length`). `completed_cumulative = sum(resolved_total)` = total tasks completed across all periods (equivalent to counting completed tasks, since each completed task has exactly one `active_period_id`). The results match the current behavior.

**Worked example (UC-4):**
- P1 (fixed: total=50, completed=30, unc_crit=12, unc_noncrit=8):
  → running = {total:50, completed:30, unc_crit:12, unc_noncrit:8}
- P2 (unfixed: 5 tasks created, 2 completed, 1 new critical added, 1 critical resolved):
  → added_to_backlog=5, resolved_total=2, added_critical=1, resolved_critical=1
  → running = {total:50+5=55, completed:30+2=32, unc_crit:12+(1-1)=12, unc_noncrit:8+(4-1)=11}
- P3 (fixed: total=70, completed=45, unc_crit=10, unc_noncrit=15):
  → running = {total:70, completed:45, unc_crit:10, unc_noncrit:15}
- P4 (unfixed: 3 tasks created, 1 completed, 0 critical added, 0 critical resolved):
  → added_to_backlog=3, resolved_total=1, added_critical=0, resolved_critical=0
  → running = {total:70+3=73, completed:45+1=46, unc_crit:10+(0-0)=10, unc_noncrit:15+(3-1)=17}

### 6.2 Anchor Point Fix

**Current logic:**
```
firstPeriodTasks = tasks.filter(t => t.creation_period_id === firstPeriod.id)
anchor.total_problems_cumulative = firstPeriodTasks.length
anchor.uncompleted_critical = firstPeriodTasks.filter(critical).length
anchor.uncompleted_non_critical = firstPeriodTasks.filter(!critical).length
```

**New logic:**
```
fixedStats = periodStatistics.find(s => s.period_id === firstPeriod.id)
if (fixedStats):
  anchor.total_problems_cumulative = fixedStats.added_to_backlog
  anchor.uncompleted_critical = fixedStats.added_critical
  anchor.uncompleted_non_critical = fixedStats.added_non_critical
  anchor.completed_cumulative = 0
  anchor.wip_total = 0
else:
  (current behavior: derive from tasks)
```

The anchor represents the state at the START of the first period (before any work is done), so it reflects the initial backlog — which equals the number of tasks added in the first period. For a fixed first period, `added_to_backlog` / `added_critical` / `added_non_critical` are the correct sources.

### 6.3 Chart Filtering: Compute All, Then Slice

**Problem:** Currently `ChartsSection` passes `filteredPeriods` (a subset of periods based on user's start-period selection) directly to `calculateChartData()`. This means `calculateDynamicMetrics()` inside `calculateChartData()` only sees the filtered periods in its `allPeriods` parameter. If a period is excluded from the filter but contains tasks or fixed statistics that affect cumulative values, those contributions are lost.

**Example:** Periods P1 (fixed), P2 (unfixed), P3 (unfixed), P4 (unfixed). User selects chart starting from P3. Current code passes `[P3, P4]` to `calculateChartData()`. When computing P3's cumulative values, `calculateDynamicMetrics()` only sees P3 and P4 in `allPeriods` — it completely misses P1's fixed values and P2's task contributions, producing incorrect cumulative totals.

**Solution: compute-all-then-slice approach:**

1. `ChartsSection` always passes the **full period list** (`periods` from atom, unfiltered) to `calculateChartData()`.
2. `calculateChartData()` computes chart data for ALL periods chronologically using the iterative accumulation algorithm (Section 6.1), producing a full array: `[anchor, P1_data, P2_data, ..., PN_data]`.
3. `ChartsSection` applies the chart filter to the **result array** (not the input):
   - Let `selectedIndex` be the 0-based index of the user's selected start period among sorted periods.
   - If `selectedIndex = 0`: use `result[0]` as anchor, `result[1..N]` as data points (full view).
   - If `selectedIndex > 0`: use `result[selectedIndex]` as the anchor (the end-state of the period immediately before the selected start — this represents the starting state for the filtered view). Use `result[selectedIndex+1..N]` as data points.
4. This ensures that cumulative calculations for any visible period incorporate contributions from ALL prior periods, including those outside the filtered view.

### 6.4 Function Signature Changes

```typescript
// calculateDynamicMetrics — BEFORE:
calculateDynamicMetrics(
  period: Period,
  allPeriods: Period[],
  allTasks: Task[]
): DynamicMetrics

// calculateDynamicMetrics — AFTER:
calculateDynamicMetrics(
  period: Period,
  allPeriods: Period[],
  allTasks: Task[],
  periodStatistics?: PeriodStatistics[]
): DynamicMetrics
```

Optional parameter maintains backward compatibility. When omitted or empty, behavior is identical to current (iterative accumulation with no fixed checkpoints).

```typescript
// calculateChartData — signature unchanged:
calculateChartData(
  periods: Period[],
  tasks: Task[],
  periodStatistics: PeriodStatistics[]
): ChartDataPoint[]
```

The `periods` parameter semantics change: it must now always receive the **full, unfiltered** list of periods. The function returns data for all periods; the caller handles view filtering.

## 7. Edge Cases and Constraints

- **Edge case 1: First period has fixed stats, no tasks** — Anchor point must use `added_to_backlog`/`added_critical`/`added_non_critical` from fixed stats. Currently shows 0. After fix: shows correct initial values.

- **Edge case 2: Gap in fixed data** — P1 fixed, P2 unfixed, P3 fixed, P4 unfixed. P4 should use P3 as base (the iterative algorithm naturally handles this: P3's fixed stats reset the running totals, and P4 accumulates on top of P3's values).

- **Edge case 3: Current period is fixed** — On the Stats page, `StatsPeriodCard` already uses `statistics ?? dynamicMetrics`, so fixed stats take precedence. No issue. In charts, `calculateChartData()` already uses fixed stats directly for fixed periods.

- **Edge case 4: Fixed stats have values inconsistent with tasks** — This is intentional (the user manually edited them). The system must trust fixed values over task counts.

- **Edge case 5: Chart period filter changes the first visible period** — With the compute-all-then-slice approach (Section 6.3), changing the filter start period simply changes which slice of the pre-computed result array is displayed. The anchor for the filtered view is the data point of the period immediately preceding the selected start. All cumulative values remain correct because they were computed from the full period list.

- **Edge case 6: Intermediate periods excluded by chart filter** — Example: P1 (fixed), P2 (unfixed, has tasks), P3 (unfixed), P4 (unfixed). User selects chart starting from P3. With the compute-all-then-slice approach, P3's and P4's cumulative values were already computed using the iterative algorithm over [P1, P2, P3, P4], so P2's task contributions are included. The anchor for the filtered view = the data point for P2 (end-state of the period before the filter start). **The previous approach (passing `filteredPeriods` to `calculateChartData`) would miss P2 entirely — this is why the compute-all-then-slice approach is required.**

- **Edge case 7: `uncompleted_critical` decreases across periods** — P1 has 10 uncompleted critical tasks. P2 resolves 3 critical tasks and adds 1 new critical. The iterative algorithm computes: `uncompleted_critical = 10 + (1 - 3) = 8`. This correctly models the decrease. The previous `deltaTasks.filter(!completed && critical)` approach would have computed `10 + 1 = 11` (only adding, never subtracting).

- **Edge case 8: Task created before fixed period but resolved after** — Task T created in P0 (unfixed), P1 is fixed, T is resolved in P2 (unfixed). The iterative algorithm: P0 counts T in `added_to_backlog`; P1 resets to fixed values (which already account for T's existence in the backlog); P2's `resolved_total` counts T (since T's `active_period_id` = P2 and status = completed), correctly incrementing `completed_cumulative`.

- **Constraint 1: `lockPeriodMetricsAtom` calls `calculateDynamicMetrics()`** — This call computes the current dynamic state for locking. It SHOULD receive `periodStatistics` so that the cumulative values it computes for the current period correctly incorporate prior fixed periods. This ensures the locked snapshot is accurate.

## 8. Risks and Mitigations

- **Risk 1: Regression in pure-dynamic scenarios** — Adding the new parameter could accidentally change behavior when no fixed stats exist.
  → **Mitigation**: Make `periodStatistics` optional with default `[]`. When empty, the iterative accumulation produces the same results as the current approach (see Section 6.1 backward compatibility proof). Add regression tests.

- **Risk 2: Inconsistent cumulative values between Stats page and Charts** — If one is updated but not the other.
  → **Mitigation**: Both call the same `calculateDynamicMetrics()` function with the new iterative algorithm. Updating it once fixes both. Verify in testing.

- **Risk 3: Chart filtering breaks cumulative values** — If `calculateChartData()` receives only a subset of periods, it will miss contributions from excluded periods.
  → **Mitigation**: `ChartsSection` always passes the full period list to `calculateChartData()`. The chart filter is applied to the **result array** (compute-all-then-slice), not the input periods. This ensures cumulative values are always computed from the complete period chain. See Section 6.3 for the detailed approach.

## 9. Testing Strategy

### Unit Tests

- **Test `calculateDynamicMetrics()` with fixed stats**:
  - Verify cumulative values when prior period has fixed stats
  - Verify cumulative values with mixed fixed/unfixed chain (P1 fixed → P2 unfixed → P3 fixed → P4 unfixed)
  - Verify no change in behavior when `periodStatistics` is empty/undefined
  - Verify correct base period selection (nearest preceding fixed, not earliest)
  - Verify `uncompleted_critical` correctly **decreases** when critical tasks are resolved (added_critical - resolved_critical can be negative)
  - Verify tasks completed in a different period than created (cross-period resolution) are counted correctly

- **Test `calculateChartData()` anchor point**:
  - Verify anchor uses fixed data when first period has fixed stats and no tasks
  - Verify anchor uses tasks when first period has no fixed stats
  - Verify anchor with first period having both fixed stats and tasks (fixed wins for anchor)

- **Test `calculateChartData()` cumulative across periods**:
  - Mixed fixed/unfixed sequence produces correct cumulative values
  - All fixed — each period uses its own fixed values
  - All unfixed — regression test, identical to current behavior

- **Test compute-all-then-slice (chart filtering)**:
  - Verify that data points produced by `calculateChartData()` for P3 and P4 are identical whether chart starts at P1 or P3 (cumulative values must not change based on the view filter)
  - Verify the correct data point is used as anchor when filter starts at a non-first period

### Manual Verification

1. Create a period, fix its metrics with custom values, ensure NO tasks exist → verify charts show non-zero values matching fixed data
2. Create two periods: fix P1 with custom values, leave P2 dynamic with some tasks → verify P2's cumulative on both Charts and Stats includes P1's fixed base
3. Verify Stats page shows correct cumulative for unfixed periods following fixed ones
4. Verify chart filtering (selecting different start periods) still shows correct cumulative values — specifically, check that intermediate periods' contributions are not lost
5. Verify a scenario where critical tasks are resolved: `uncompleted_critical` should decrease across periods

## 10. Open Questions

No blocking questions — the requirements are well-defined:
- Fixed statistics always take precedence over dynamic calculations for their own period (already implemented for individual periods).
- Cumulative calculations in subsequent unfixed periods build on the nearest preceding fixed period's values via iterative accumulation.
- The system locks all metrics together (all-or-nothing), so there is no partial fixation concern.
- The compute-all-then-slice approach for chart filtering is standard for cumulative charts and introduces no new ambiguities.
