# Development Plan Review

## Review Metadata
- **Reviewer:** orchestra-planner-reviewer
- **Plan File:** workflow/fixed-data-priority/plan.md
- **Review Date:** June 12, 2026
- **Pipeline:** Medium

## Executive Summary

The development plan is well-structured, correctly scoped, and aligned with the technical specification. All six use cases (UC-1 through UC-6) and all five functional requirements (FR-1 through FR-5) are covered across five tasks with clear dependencies. Every task listed in the plan has a corresponding, non-empty description file with sufficient implementation detail for developers to execute without guessing. File paths reference real project files verified against the codebase. Parallelization strategy (1-2 parallel with 2-2 after 1-1) is safe — no two parallel tasks modify the same file. **The plan is ready for execution.**

## TS Coverage Check

### Use Case Mapping
- **UC-1** (Chart displays fixed data for period without tasks): Covered by Task 1-2 (anchor fix), Task 3-1 (unit tests)
- **UC-2** (Cumulative chart values respect fixed data from prior periods): Covered by Task 1-1, Task 1-2, Task 2-1, Task 3-1
- **UC-3** (Stats page shows correct cumulative after fixed period): Covered by Task 1-1, Task 2-2, Task 3-1
- **UC-4** (Mixed fixed/unfixed periods in sequence): Covered by Task 1-1, Task 2-1, Task 2-2, Task 3-1
- **UC-5** (All periods have fixed statistics): Covered by Task 1-1, Task 1-2, Task 2-1, Task 3-1
- **UC-6** (No fixed stats — regression): Covered by all tasks (explicit regression criteria in 1-1, 1-2, 2-1, 2-2; regression test matrix in 3-1)

### Functional Requirements
| Requirement | Covered By |
|---|---|
| FR-1: Charts display fixed values regardless of tasks | Task 1-2 (anchor), existing fixedStats branch in chart-utils.ts |
| FR-2: Anchor from fixed stats when available | Task 1-2 |
| FR-3: Cumulative incorporates prior fixed periods | Task 1-1 |
| FR-4: Stats page correct cumulative for unfixed periods | Task 1-1 + Task 2-2 |
| FR-5: Preserve behavior when no fixed stats | Task 1-1 (optional param), Task 3-1 (regression tests) |

### TS Section 5 Files Coverage
| File | Task |
|---|---|
| src/lib/stats-utils.ts | Task 1-1 |
| src/lib/chart-utils.ts | Task 1-2 |
| src/components/stats/charts/ChartsSection.tsx | Task 2-1 |
| src/app/stats/page.tsx | Task 2-2 |
| src/atoms/statsAtom.ts (lockPeriodMetricsAtom) | Task 2-2 (per TS Section 7 Constraint 1) |

All calculateDynamicMetrics() and calculateChartData() call sites in the codebase are accounted for (verified via grep: 4 call sites total).

## Critical Issues

✅ No critical issues found.

## Important Issues

**Issue 1:** Plan lacks explicit use case coverage table and machine-readable dependency format.
- **Affected Task:** Plan structure (all tasks)
- **Recommendation:** Add a UC coverage matrix and JSON-style dependency block to plan.md for orchestrator automation. Does not block execution — coverage exists implicitly in task descriptions.

**Issue 2:** Task description section headers deviate from the standard template.
- **Affected Task:** All tasks (1-1 through 3-1)
- **Recommendation:** Tasks use "Use Cases" instead of "Related Use Cases" and "Test Strategy" instead of "Test Cases". Content is present and adequate; renaming is optional for consistency.

**Issue 3:** ChartsSection compute-all-then-slice logic has no automated unit test.
- **Affected Task:** Task 2-1
- **Recommendation:** Task 3-1 TC-UNIT-15 documents why full-period input is required at the calculateChartData() level, and Task 2-1 specifies manual verification. Consider adding a lightweight test that simulates the slice logic in a follow-up.

**Issue 4:** Plan does not reference task description file paths.
- **Affected Task:** Plan structure
- **Recommendation:** Add task_files array or per-task links to tasks/task-X-Y.md in plan.md for discoverability. All five description files exist and match plan task IDs.

**Issue 5:** TS Section 4.2 lists lockPeriodMetricsAtom changes as out of scope, but Task 2-2 modifies it.
- **Affected Task:** Task 2-2
- **Recommendation:** No plan change needed — Task 2-2 correctly implements TS Section 7 Constraint 1 (lock snapshot must incorporate prior fixed periods). The out-of-scope note refers to workflow/UX changes, not the one-line parameter addition.

## Task-by-Task Review

### Task 1-1: Refactor calculateDynamicMetrics() for Fixed-Data-Aware Iterative Accumulation
- **Completeness:** Excellent. Provides exact signature change, step-by-step iterative algorithm, field mappings, and explicit note to keep period-specific flow metrics unchanged. Algorithm matches TS Section 6.1.
- **Correctness:** Implements the right logic. Uses creation_period_id for additions and active_period_id + status for resolutions, consistent with existing code and TS flow-metric definitions.
- **Dependencies:** Correct — no dependencies, blocks 1-2 and 2-2.

### Task 1-2: Fix calculateChartData() Anchor Point and Forward periodStatistics
- **Completeness:** Detailed anchor if/else logic with exact field mappings (added_to_backlog, added_critical, added_non_critical). Single-line change for calculateDynamicMetrics() fourth argument.
- **Correctness:** Anchor derivation from added_to_backlog (not total_problems_cumulative) matches TS AC-1.2 and edge case 1. Existing fixedStats branch for period points already handles UC-1 backlog charts.
- **Dependencies:** Correct — depends on 1-1, blocks 2-1.

### Task 2-1: Update ChartsSection — Compute-All-Then-Slice
- **Completeness:** Full before/after code for chartData useMemo, sortedPeriods/selectedSortedIndex derivation, and detailed index-alignment explanation. Correctly notes that periods atom ordering may differ from chronological order.
- **Correctness:** allChartData.slice(selectedSortedIndex) logic matches TS Section 6.3. Verified against current ChartsSection.tsx which uses filteredPeriods with .reverse() — new approach eliminates the filter-before-compute bug.
- **Dependencies:** Correct — depends on 1-2 only.

### Task 2-2: Update stats/page.tsx and statsAtom.ts Callers
- **Completeness:** Exact one-line changes in both files with surrounding context. Notes that periodStatisticsAtom is already imported/available in both files (verified in codebase).
- **Correctness:** Covers all external calculateDynamicMetrics() call sites. lockPeriodMetricsAtom change ensures accurate lock snapshots per TS Constraint 1.
- **Dependencies:** Correct — depends on 1-1 only; safe to parallelize with 1-2.

### Task 3-1: Set Up Vitest and Write Unit Tests
- **Completeness:** Full test matrix with 15 test cases across two files, Vitest setup steps, factory helper guidance, and package.json script additions. Confirmed no test runner exists in project currently.
- **Correctness:** Test scenarios map directly to UC-1 through UC-6 acceptance criteria. TC-UNIT-15 correctly documents the filter-before-compute bug.
- **Dependencies:** Correct — depends on 1-1 and 1-2; does not conflict with Phase 2 file changes.

## Dependency Graph Validation

```
1-1 (stats-utils.ts)
 ├── 1-2 (chart-utils.ts) ──→ 2-1 (ChartsSection.tsx)
 ├── 2-2 (stats/page.tsx, statsAtom.ts)  [parallel with 1-2, safe — different files]
 └── 3-1 (test files, package.json)      [after 1-1 + 1-2]
```

| Parallel Group | Files Touched | Safe? |
|---|---|---|
| 1-2 parallel 2-2 (after 1-1) | chart-utils.ts vs stats/page.tsx + statsAtom.ts | Yes |
| 3-1 parallel 2-1/2-2 (after 1-2) | Test files vs caller files | Yes |
| 1-2 parallel 2-1 | Both would touch chart pipeline | Correctly sequenced (2-1 after 1-2) |

Critical path 1-1 → 1-2 → 2-1 is correct. No circular dependencies. No file conflicts in parallel groups.

## Final Verdict

**Status:** APPROVED

The plan fully covers all six use cases and five functional requirements from the technical specification. All five tasks have detailed, actionable descriptions with correct file paths (verified against the codebase), consistent method signatures across tasks, and a safe dependency/parallelization strategy. No blocking issues were found. Minor recommendations (coverage table, test gap for ChartsSection slice, section header naming) do not impede development.

## Next Steps

Proceed to pre-flight check and development execution. Recommended execution order:
1. Task 1-1
2. Tasks 1-2 and 2-2 in parallel
3. Task 2-1
4. Task 3-1
