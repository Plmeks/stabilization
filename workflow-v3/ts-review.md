# TS Review: Expanded Statistics System with Cumulative Metrics

**Date:** 2026-06-12  
**Reviewer:** AI Agent  
**Status:** APPROVED WITH COMMENTS

## Overall Assessment

The technical specification is thorough and aligns with the task description ("expand statistics with cumulative metrics, fix backlog logic, add comment field"). It correctly identifies the existing bug (`added_to_backlog` filtering on `status !== null`), defines ~15 metrics with clear formulas, specifies a complete `period_statistics` schema, and covers the primary user flows (view, lock, edit, comment, delete). The spec is compatible with the current Next.js/Jotai/Supabase architecture and references the right existing files (`statsAtom.ts`, `StatsPeriodCard.tsx`, `001_create_tables.sql`).

No blocking gaps were found that would prevent architecture or implementation. Several important clarifications are recommended below — especially around cumulative period ordering and affected-file coverage — to reduce implementation risk.

## Critical Issues (🔴 BLOCKING)

None identified.

## Major Issues (🟡 MAJOR)

### 1. Cumulative period ordering uses incorrect date comparison in pseudo-code

**Location:** Section 5 — Cumulative Metrics

**Problem:** The spec shows:
```
sortedPeriods = periods.sort((a, b) => a.start_date - b.start_date)
periodsUpToThis = sortedPeriods.filter(p => p.start_date <= period.start_date)
```
`start_date` is typed as `string` (ISO date) in the existing codebase. Subtracting strings yields `NaN`, producing unstable sort order. While lexicographic `<=` works for `YYYY-MM-DD` strings, the sort step is ambiguous and inconsistent with the existing stats page, which uses `dayjs` for date comparison.

**Recommendation:** Replace pseudo-code with explicit rules: sort periods by `start_date` ascending using `dayjs(a.start_date).diff(dayjs(b.start_date))`; include periods where `dayjs(p.start_date).isSameOrBefore(dayjs(period.start_date))`. Document that display order (newest first) is independent of cumulative calculation order.

### 2. Cumulative boundary rule undefined for periods with identical `start_date`

**Location:** Section 5 (Cumulative Metrics), Section 11 Assumption 2

**Problem:** Inclusion criterion `start_date <= period.start_date` does not define behavior when multiple periods share the same `start_date`. All such periods would be included in each other's cumulative window, which may or may not be intended.

**Recommendation:** Clarify tie-breaking: either include all periods with `start_date <= current.start_date` (current implicit behavior), or add a secondary sort key (`created_at` or `end_date`) and document it explicitly.

### 3. Affected files list is incomplete for end-to-end implementation

**Location:** Sections 6–7 (UI Changes, State Management)

**Problem:** The spec details component and atom changes but omits other files that must change for the feature to work:
- `supabase/migrations/001_create_tables.sql` (mentioned only in acceptance criteria §10)
- `src/types/index.ts` (PeriodStatistics type)
- `src/lib/supabase/dal.ts` (`createPeriodStatistics`, `updatePeriodStatistics` signatures)
- `src/lib/supabase/client.ts` (generated Supabase row types)
- `src/app/stats/page.tsx` (currently computes 6 inline dynamic metrics; must switch to shared utility)

**Recommendation:** Add an explicit "Affected Files" subsection listing all files requiring changes. This prevents the planner from missing DAL/type/migration tasks.

### 4. Example dataset referenced but not provided

**Location:** Section 5 (Validation), Section 9 (Testing #9), Section 10 (Acceptance Criteria)

**Problem:** The spec references validating against period `16.01–22.01.2026` with specific numbers (e.g., cumulative total 107, uncompleted 98, critical 42, non-critical 56) but does not include the underlying task/period fixture data. Only a subset of metrics is validated in Section 5; `uncompleted_critical` / `uncompleted_non_critical` breakdown is not verified against source data.

**Recommendation:** Attach a seed dataset (periods + tasks JSON) or move example validation to a test fixture file referenced by the planner. Without it, developers cannot reproduce acceptance criterion #16 independently.

### 5. UC-1 alternative scenario 4a is misleading

**Location:** UC-1, Alternative Scenarios — 4a

**Problem:** "First period in history: cumulative = same as period values" is only true for `total_problems_cumulative` and `completed_cumulative`. Cumulative uncompleted breakdown (`uncompleted_critical`, `uncompleted_non_critical`) is not equivalent to any single period-only metric and could confuse implementers.

**Recommendation:** Reword 4a to: "First period chronologically: `total_problems_cumulative = added_to_backlog` and `completed_cumulative = resolved_total` for that period."

### 6. Comment debounce flush-on-unmount not reflected in UC-4

**Location:** UC-4 vs Section 8 (Debounce Rules)

**Problem:** Section 8 specifies "On unmount/navigation: flush pending save immediately" — an important edge case to prevent comment loss. UC-4 alternative scenarios do not mention navigation/unmount behavior.

**Recommendation:** Add UC-4 alternative: "4c. User navigates away before debounce fires: pending comment is saved immediately."

### 7. Manual edit flow lacks integrity constraint guidance

**Location:** UC-3, Section 8 (Data Integrity)

**Problem:** Section 8 defines derived-field relationships (`added_to_backlog = added_critical + added_non_critical`, etc.), but UC-3 allows free editing of all fields with no validation rules. Manual edits can produce inconsistent snapshots that contradict display assumptions.

**Recommendation:** Clarify whether the edit modal should (a) allow free override (current implicit behavior), (b) auto-recalculate derived fields, or (c) validate on save and reject inconsistent combinations. Match existing app behavior if no change is intended.

## Minor Issues (🟢 MINOR)

Skipped per medium-pipeline scope (focus on implementation-critical issues only).

## Verification Checklist Results

| Check | Result | Notes |
|-------|--------|-------|
| 1. Requirements coverage | ✅ Pass | Cumulative metrics, backlog fix, comment field, UI grouping all addressed |
| 2. Calculation logic | ⚠️ Pass with comments | Formulas are correct and unambiguous; cumulative sort pseudo-code needs dayjs clarification |
| 3. Database schema | ✅ Pass | All 10 new columns + `comment TEXT` defined with correct types and NOT NULL constraints |
| 4. Data consistency | ✅ Pass | All metrics derivable from `tasks` + `periods`; no external data sources needed |
| 5. Missing details blocking development | ✅ Pass | No blocking gaps; affected-files list and example fixture would reduce risk |
| 6. Edge cases | ⚠️ Partial | Zero tasks, null priority, lock/delete/re-lock covered; unmount flush and same-start_date tie-breaking need clarification |
| 7. Performance | ✅ Acceptable | O(periods × tasks) client-side calculation; acceptable for internal team scale; utility extraction enables memoization |
| 8. UX clarity | ✅ Pass | Grouped layout wireframe, comment visibility rules, lock/edit/delete flows well-defined |

## Final Recommendation

**APPROVE WITH COMMENTS** — Proceed to architecture. Address the cumulative date-ordering clarification and affected-files list during architecture/planning; no TS rewrite required before moving forward.
