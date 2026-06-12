# Task 1-1: Refactor `calculateDynamicMetrics()` for Fixed-Data-Aware Iterative Accumulation

## Objective

Replace the current "count all tasks up to this period" approach in `calculateDynamicMetrics()` with an iterative walk over all periods. At each step, if the period has fixed statistics, reset running totals to those values; otherwise accumulate task-based deltas. This makes cumulative metrics correctly respect fixed-stats checkpoints from any prior period.

## Use Cases

This task implements:
- **UC-2**: Cumulative chart values respect fixed data from prior periods — P2 (unfixed) builds on P1's fixed base.
- **UC-3**: Stats page shows correct cumulative values after a fixed period.
- **UC-4**: Mixed fixed/unfixed chain works for any number of alternating periods.
- **UC-5**: All periods fixed — each uses its own fixed values.
- **UC-6**: No fixed stats — behavior is identical to current (regression safety).

## Description of Changes

### Changes to Existing Files

#### `src/lib/stats-utils.ts`

**Import:** Add `PeriodStatistics` to the import from `@/types`:
```
import type { Period, PeriodStatistics, Task } from '@/types';
```

**Function `calculateDynamicMetrics`:**

Change the signature to:
```
calculateDynamicMetrics(
  period: Period,
  allPeriods: Period[],
  allTasks: Task[],
  periodStatistics?: PeriodStatistics[],
): DynamicMetrics
```

The new optional `periodStatistics` parameter defaults to an empty array when omitted, preserving full backward compatibility.

**Keep unchanged** — the period-specific flow metrics block at the top of the function body remains exactly as-is:
- `creationPeriodTasks`, `activePeriodTasks` filtering
- `added_to_backlog`, `added_critical`, `added_non_critical`
- `resolved_total`, `resolved_critical`, `resolved_non_critical`
- `in_progress`, `in_testing`, `in_block`, `wip_total`

**Replace** — the cumulative calculation block (from `const sortedPeriods = ...` to `const uncompleted_non_critical = ...`) with the iterative accumulation algorithm:

**Algorithm:**
1. Sort `allPeriods` ascending by `start_date` (same as before).
2. Collect `periodsUpToThis` = periods whose `start_date` is same-or-before `period.start_date` (same filter as before).
3. Initialize running state variables:
   - `runningTotal = 0`
   - `runningCompleted = 0`
   - `runningUncompletedCritical = 0`
   - `runningUncompletedNonCritical = 0`
4. Iterate through `periodsUpToThis` in ascending order. For each `p`:
   - Look up: `fixedStats = (periodStatistics ?? []).find(ps => ps.period_id === p.id)`
   - **If `fixedStats` exists (period is fixed):**
     - Reset: `runningTotal = fixedStats.total_problems_cumulative`
     - Reset: `runningCompleted = fixedStats.completed_cumulative`
     - Reset: `runningUncompletedCritical = fixedStats.uncompleted_critical`
     - Reset: `runningUncompletedNonCritical = fixedStats.uncompleted_non_critical`
   - **Else (period has no fixed stats):**
     - `periodCreatedTasks = allTasks.filter(t => t.creation_period_id === p.id)`
     - `periodActiveTasks = allTasks.filter(t => t.active_period_id === p.id)`
     - `deltaAdded = periodCreatedTasks.length`
     - `deltaAddedCritical = periodCreatedTasks.filter(t => t.priority === 'Критический').length`
     - `deltaAddedNonCritical = periodCreatedTasks.filter(t => t.priority !== 'Критический').length`
     - `deltaResolved = periodActiveTasks.filter(t => t.status === 'Завершена').length`
     - `deltaResolvedCritical = periodActiveTasks.filter(t => t.status === 'Завершена' && t.priority === 'Критический').length`
     - `deltaResolvedNonCritical = periodActiveTasks.filter(t => t.status === 'Завершена' && t.priority !== 'Критический').length`
     - Accumulate:
       - `runningTotal += deltaAdded`
       - `runningCompleted += deltaResolved`
       - `runningUncompletedCritical += deltaAddedCritical - deltaResolvedCritical`
       - `runningUncompletedNonCritical += deltaAddedNonCritical - deltaResolvedNonCritical`
5. After the loop, assign:
   - `total_problems_cumulative = runningTotal`
   - `completed_cumulative = runningCompleted`
   - `uncompleted = runningTotal - runningCompleted`
   - `uncompleted_critical = runningUncompletedCritical`
   - `uncompleted_non_critical = runningUncompletedNonCritical`

**Return statement** is unchanged (same fields, same order).

### Key Design Notes

- `uncompleted_critical` and `uncompleted_non_critical` can decrease across periods (when resolved > added in a period). This is correct behavior — the iterative approach naturally handles it via `+= delta_added - delta_resolved`, which can be negative.
- When `periodStatistics` is `undefined` or `[]`, no period will match `fixedStats`, so the algorithm degrades to the old task-counting approach. However, the new approach counts task deltas per period rather than a single `tasksUpToThis.filter(...)` pass, which produces identical results for the uncompleted counts — verifiable by unit tests.
- The existing `tasksUpToThis` variable is no longer needed and should be removed.

## Acceptance Criteria

- [ ] AC-1: `calculateDynamicMetrics(P2, [P1, P2], tasks, [{period_id: P1.id, total_problems_cumulative: 50, completed_cumulative: 30, ...}])` returns `total_problems_cumulative` = 50 + (tasks created in P2), `completed_cumulative` = 30 + (tasks completed in P2).
- [ ] AC-2: With alternating P1(fixed), P2(unfixed), P3(fixed), P4(unfixed) — P4 correctly builds on P3's fixed base.
- [ ] AC-3: When `periodStatistics` is omitted/empty, results match the current implementation.
- [ ] AC-4: `uncompleted_critical` decreases correctly when critical tasks are resolved in a period (not just added).
- [ ] AC-5: TypeScript compiles with no errors.

## Test Strategy

- **Unit tests** (to be written in Task 3-1):
  - UC-2 scenario: P1 fixed (total=50, completed=30), P2 has 2 new tasks (both non-critical) and 3 tasks resolved → `total=52, completed=33, uncompleted=19`
  - UC-4 scenario: P1(fixed), P2(unfixed), P3(fixed), P4(unfixed) full chain
  - UC-6 regression: identical results to current when no fixed stats provided
  - Edge: `uncompleted_critical` decreases when `deltaResolvedCritical > deltaAddedCritical`
  - Edge: `periodStatistics = undefined` is treated as `[]`

- **Manual verification:** Stats tab — period after a fixed period shows cumulative values that include the fixed base.

## Dependencies

- **Depends on:** None
- **Blocks:** Task 1-2 (uses new signature), Task 2-2 (passes `periodStatistics`)

## Notes

- Do NOT change the period-specific flow metrics (added_to_backlog, resolved_total, etc.) — these are already correct.
- The TypeScript type `DynamicMetrics` does not change.
- The `PeriodStatistics` type is already defined in `src/types/index.ts` — just add it to the import.
